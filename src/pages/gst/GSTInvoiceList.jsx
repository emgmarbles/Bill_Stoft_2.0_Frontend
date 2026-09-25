import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import gstService from '../../services/gstService';
import { formatINR, formatDate } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';
import GSTInvoiceFormDialog from './GSTInvoiceFormDialog';
import GSTInvoiceDetailDialog from './GSTInvoiceDetailDialog';

const PAYMENT_FILTER_OPTIONS = [
  { label: 'All Payment Statuses', value: null },
  { label: 'Pending Only', value: 'pending' },
  { label: 'Paid in Full', value: 'paid' },
  { label: 'Partial Payments', value: 'partial' },
  { label: 'Overdue Bills (> 1 Month)', value: 'overdue' },
];

export default function GSTInvoiceList({ type = 'sale' }) {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState(type || 'sale');

  useEffect(() => {
    if (type) {
      setActiveType(type);
    }
  }, [type]);

  const handleTabChange = (targetType) => {
    setActiveType(targetType);
    setIsOverdueOnly(false);
    setBannerDismissed(false);
    setPaymentStatusFilter(null);
    if (targetType === 'purchase') {
      navigate('/purchase-gst-bills');
    } else if (targetType === 'all') {
      navigate('/all-gst-bills');
    } else {
      navigate('/gst-bills');
    }
  };

  const isSale = activeType === 'sale';
  const isPurchase = activeType === 'purchase';
  const isAll = activeType === 'all';

  const pageTitle = isSale
    ? 'GST Sell Bills & Tax Invoices'
    : isPurchase
    ? 'Purchase GST Invoices'
    : 'All GST Tax Invoices (Sales & Purchases)';

  const createButtonLabel = isPurchase
    ? 'Record Purchase Invoice'
    : isSale
    ? 'Create Sale Tax Invoice'
    : 'Create GST Invoice';

  const partyHeader = isSale
    ? 'Customer / Buyer'
    : isPurchase
    ? 'Supplier / Quarry'
    : 'Party (Customer / Supplier)';

  // Table & Data State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Dialog states
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [printingAll, setPrintingAll] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  const toast = useRef(null);

  // Overdue filter handlers
  const handleToggleOverdueFilter = () => {
    setIsOverdueOnly((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        setPaymentStatusFilter('overdue');
      } else if (paymentStatusFilter === 'overdue') {
        setPaymentStatusFilter(null);
      }
      return nextVal;
    });
  };

  const handlePaymentFilterChange = (val) => {
    setPaymentStatusFilter(val);
    if (val === 'overdue') {
      setIsOverdueOnly(true);
    } else {
      setIsOverdueOnly(false);
    }
  };

  // Fetch invoices and summary metrics
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const isOverdueActive = isOverdueOnly || paymentStatusFilter === 'overdue';
      const params = {
        ...(activeType !== 'all' && { invoice_type: activeType }),
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(paymentStatusFilter && paymentStatusFilter !== 'overdue' && { payment_status: paymentStatusFilter }),
        ...(isOverdueActive && { is_overdue: true }),
      };

      const [invoicesData, summaryData] = await Promise.all([
        gstService.getInvoices(params),
        gstService.getInvoiceSummary(activeType !== 'all' ? activeType : undefined),
      ]);

      // DRF might return paginated { results: [...] } or direct array
      const list = Array.isArray(invoicesData) ? invoicesData : invoicesData.results || [];
      setInvoices(list);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load invoices from server.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [activeType, debouncedSearch, paymentStatusFilter, isOverdueOnly]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Handlers
  const handleOpenCreate = () => {
    document.activeElement?.blur();
    setSelectedInvoice(null);
    setFormDialogVisible(true);
  };

  const handleOpenEdit = async (inv) => {
    document.activeElement?.blur();
    try {
      const fullInv = await gstService.getInvoice(inv.id);
      setSelectedInvoice(fullInv || inv);
    } catch {
      setSelectedInvoice(inv);
    }
    setFormDialogVisible(true);
  };

  const handleOpenDetail = async (inv) => {
    document.activeElement?.blur();
    try {
      const fullInv = await gstService.getInvoice(inv.id);
      setSelectedInvoice(fullInv || inv);
    } catch {
      setSelectedInvoice(inv);
    }
    setDetailDialogVisible(true);
  };

  const handleConfirmDelete = (inv) => {
    document.activeElement?.blur();
    setSelectedInvoice(inv);
    setDeleteDialogVisible(true);
  };

  const executeDelete = async () => {
    if (!selectedInvoice) return;
    setDeleting(true);
    try {
      await gstService.deleteInvoice(selectedInvoice.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `Invoice #${selectedInvoice.invoice_no} deleted successfully.`,
        life: 3000,
      });
      setDeleteDialogVisible(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Delete Failed',
        detail: err.response?.data?.detail || 'Could not delete invoice.',
        life: 4000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handlePrintSingle = async (inv) => {
    setPrintingId(inv.id);
    try {
      const blob = await gstService.printInvoice(inv.id);
      gstService.openPdfBlob(blob, `GST_Bill_${inv.invoice_no}.pdf`);
    } catch (err) {
      console.error('Failed to print GST bill', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Print Failed',
        detail: err.response?.data?.detail || 'Could not generate invoice PDF.',
        life: 4000,
      });
    } finally {
      setPrintingId(null);
    }
  };

  const handlePrintAll = async () => {
    setPrintingAll(true);
    try {
      const isOverdueActive = isOverdueOnly || paymentStatusFilter === 'overdue';
      const params = {};
      if (activeType && activeType !== 'all') {
        params.type = activeType;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (paymentStatusFilter && paymentStatusFilter !== 'overdue') {
        params.payment_status = paymentStatusFilter;
      }
      if (isOverdueActive) {
        params.is_overdue = true;
      }
      const blob = await gstService.printAllInvoices(params);
      gstService.openPdfBlob(blob, 'GST_Bills_All.pdf');
    } catch (err) {
      console.error('Failed to print all GST bills', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Print Failed',
        detail: err.response?.data?.detail || 'No bills found to print.',
        life: 4000,
      });
    } finally {
      setPrintingAll(false);
    }
  };

  // Status Badge Renderer
  const statusBodyTemplate = (rowData) => {
    const status = rowData.payment_status || 'pending';
    let severity = 'danger';
    let label = 'Pending';

    if (status === 'paid') {
      severity = 'success';
      label = 'Paid in Full';
    } else if (status === 'partial') {
      severity = 'warning';
      label = 'Partial';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <Tag value={label} severity={severity} />
        {rowData.is_overdue && (
          <Tag
            value="Overdue (>1 mo)"
            severity="warning"
            icon="pi pi-clock"
            style={{ fontSize: '0.68rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
          />
        )}
      </div>
    );
  };

  // Invoice No Renderer
  const invoiceNoBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => handleOpenDetail(rowData)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--primary-color)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            textAlign: 'left',
          }}
          className="tabular-nums"
        >
          {rowData.invoice_no}
        </button>
        {rowData.transport_detail?.truck_no && (
          <span
            style={{
              fontSize: '0.7rem',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '2px 6px',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {rowData.transport_detail.truck_no}
          </span>
        )}
      </div>
    );
  };

  // Party Renderer
  const partyBodyTemplate = (rowData) => {
    const isRowSale = rowData.invoice_type === 'sale';
    const name = rowData.party_name || (isRowSale ? rowData.customer?.name : rowData.supplier?.name) || 'Unassigned';
    return (
      <div className="gst-party-cell" style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          {name}
          {activeType === 'all' && (
            <span style={{ fontSize: '0.7rem', color: isRowSale ? '#2563eb' : '#d97706', marginLeft: '6px', fontWeight: 500 }}>
              ({isRowSale ? 'Buyer' : 'Supplier'})
            </span>
          )}
        </div>
        {rowData.party_gstin && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="tabular-nums">
            GSTIN: {rowData.party_gstin}
          </div>
        )}
      </div>
    );
  };

  // Action column template
  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', width: '100%' }}>
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="View Details"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleOpenDetail(rowData)}
        />
        <Button
          icon={printingId === rowData.id ? 'pi pi-spin pi-spinner' : 'pi pi-print'}
          className="p-button-rounded p-button-text p-button-info p-button-sm"
          tooltip="Print Invoice PDF"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handlePrintSingle(rowData)}
          disabled={printingId === rowData.id}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-secondary p-button-sm"
          tooltip="Edit Invoice"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleOpenEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleConfirmDelete(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="gst-invoice-page-container">
      <Toast ref={toast} />

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {pageTitle}
            </h1>
            <Tag
              value={isSale ? 'Outward Sales' : isPurchase ? 'Inward Purchases' : 'Consolidated Ledger'}
              severity={isSale ? 'info' : isPurchase ? 'warning' : 'success'}
              style={{ fontSize: '0.75rem' }}
            />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSale
              ? 'GST compliance sales bills with automated tax calculations, HSN codes, and transport logistics.'
              : isPurchase
              ? 'Record incoming supplier GST bills with input tax credit (ITC) and purchase tracking.'
              : 'Complete unified sales and purchases register with integrated tax calculations.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            label="Print All Bills"
            icon="pi pi-print"
            className="p-button-outlined"
            onClick={handlePrintAll}
            loading={printingAll}
            tooltip="Print all filtered GST bills in combined PDF"
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-secondary"
            onClick={fetchInvoices}
            loading={loading}
          />
          <Button
            label={createButtonLabel}
            icon="pi pi-plus"
            className="p-button-primary"
            onClick={handleOpenCreate}
          />
        </div>
      </div>

      {/* Type Toggle Tabs */}
      <div
        className="gst-type-tabs-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            background: '#f4f4f5',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #e4e4e7',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('sale')}
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeType === 'sale' ? '#ffffff' : 'transparent',
              color: activeType === 'sale' ? '#09090b' : '#71717a',
              boxShadow: activeType === 'sale' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="pi pi-arrow-up-right" style={{ fontSize: '0.75rem', color: activeType === 'sale' ? '#2563eb' : 'inherit' }} />
            Sales Bills (Outward)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('purchase')}
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeType === 'purchase' ? '#ffffff' : 'transparent',
              color: activeType === 'purchase' ? '#09090b' : '#71717a',
              boxShadow: activeType === 'purchase' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="pi pi-arrow-down-left" style={{ fontSize: '0.75rem', color: activeType === 'purchase' ? '#d97706' : 'inherit' }} />
            Purchase Bills (Inward)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeType === 'all' ? '#ffffff' : 'transparent',
              color: activeType === 'all' ? '#09090b' : '#71717a',
              boxShadow: activeType === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="pi pi-list" style={{ fontSize: '0.75rem' }} />
            All Invoices
          </button>
        </div>
      </div>

      {/* Overdue Warning Alert Banner matching reference project */}
      {isSale && summary?.overdue_count > 0 && !bannerDismissed && (
        <div
          className="gst-overdue-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderLeft: '5px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            color: '#92400e',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '1.25rem', color: '#d97706', flexShrink: 0 }} />
            <span style={{ fontSize: '0.95rem' }}>
              <strong>⚠️ Attention:</strong> You have <strong>{summary.overdue_count}</strong> GST bill(s) that are overdue (more than 1 month old and not paid).
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              label={isOverdueOnly ? 'Show All Bills' : 'Filter Overdue Bills'}
              icon={isOverdueOnly ? 'pi pi-filter-slash' : 'pi pi-filter'}
              className={isOverdueOnly ? 'p-button-sm p-button-outlined p-button-warning' : 'p-button-sm p-button-warning'}
              onClick={handleToggleOverdueFilter}
            />
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-text p-button-secondary p-button-sm"
              onClick={() => setBannerDismissed(true)}
              tooltip="Dismiss alert"
            />
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div
          className="gst-summary-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Invoices
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }} className="tabular-nums">
              {summary.total_invoices || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {summary.paid_count || 0} Paid · {summary.pending_count || 0} Pending
              {summary.overdue_count > 0 && (
                <span
                  style={{ color: '#d97706', fontWeight: 600, marginLeft: '6px', cursor: 'pointer' }}
                  onClick={handleToggleOverdueFilter}
                  title="Click to filter overdue bills"
                >
                  · {summary.overdue_count} Overdue
                </span>
              )}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Taxable Amount
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }} className="tabular-nums">
              ₹{formatINR(summary.total_taxable)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Subtotal before taxes
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              GST Tax Amount
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }} className="tabular-nums">
              ₹{formatINR(summary.total_tax)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              CGST + SGST + IGST
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Grand Total
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }} className="tabular-nums">
              ₹{formatINR(summary.total_grand)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '4px' }}>
              Collected: ₹{formatINR(summary.total_paid)}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
        }}
      >
        <div className="gst-search-bar-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '380px' }}>
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice no, party, GSTIN, truck no..."
              style={{ width: '100%' }}
            />
          </span>
          {search && (
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-rounded p-button-sm"
              onClick={() => setSearch('')}
              tooltip="Clear search"
            />
          )}
        </div>

        <div className="gst-filter-select-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Dropdown
            value={paymentStatusFilter}
            options={PAYMENT_FILTER_OPTIONS}
            onChange={(e) => handlePaymentFilterChange(e.value)}
            placeholder="Payment Status"
            appendTo={typeof document !== 'undefined' ? document.body : undefined}
            style={{ width: '210px' }}
          />
          <Button
            label="Overdue Only"
            icon="pi pi-clock"
            badge={summary?.overdue_count ? String(summary.overdue_count) : undefined}
            badgeClassName={isOverdueOnly ? 'p-badge-warning' : 'p-badge-danger'}
            className={
              isOverdueOnly
                ? 'p-button-warning p-button-sm font-semibold'
                : 'p-button-outlined p-button-secondary p-button-sm'
            }
            onClick={handleToggleOverdueFilter}
            tooltip="Filter bills older than 1 month that are not paid"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <DataTable
          value={invoices}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          rowClassName={(row) => ({ 'gst-row-overdue': Boolean(row.is_overdue) })}
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#cbd5e1' }} />
              No {isSale ? 'sales' : isPurchase ? 'purchase' : ''} invoices found matching current filters.
            </div>
          }
          responsiveLayout="stack"
          breakpoint="960px"
          stripedRows
        >
          <Column field="invoice_no" header="Invoice No" body={invoiceNoBodyTemplate} sortable headerStyle={{ width: '180px' }} />
          {isAll && (
            <Column
              field="invoice_type"
              header="Type"
              body={(row) => (
                <Tag
                  value={row.invoice_type === 'sale' ? 'SALE' : 'PURCHASE'}
                  severity={row.invoice_type === 'sale' ? 'info' : 'warning'}
                  style={{ fontSize: '0.7rem', fontWeight: 700 }}
                />
              )}
              sortable
              headerStyle={{ width: '110px' }}
            />
          )}
          <Column
            field="invoice_date"
            header="Date"
            body={(row) => <span className="tabular-nums">{formatDate(row.invoice_date)}</span>}
            sortable
            headerStyle={{ width: '120px' }}
          />
          <Column field="party_name" header={partyHeader} body={partyBodyTemplate} sortable />
          <Column
            header="Items"
            body={(row) => (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {row.items_count !== undefined && row.items_count !== null
                  ? `${row.items_count} item(s)`
                  : Array.isArray(row.items)
                  ? `${row.items.length} item(s)`
                  : '-'}
              </span>
            )}
            headerStyle={{ width: '100px' }}
          />
          <Column
            field="total_amount"
            header="Taxable (₹)"
            body={(row) => <span className="tabular-nums">₹{formatINR(row.total_amount)}</span>}
            sortable
            headerStyle={{ textAlign: 'right', width: '140px' }}
            bodyClassName="text-right"
          />
          <Column
            field="gst_amount"
            header="GST (₹)"
            body={(row) => (
              <span className="tabular-nums" style={{ color: '#7c3aed' }}>
                ₹{formatINR(row.gst_amount)}
              </span>
            )}
            sortable
            headerStyle={{ textAlign: 'right', width: '130px' }}
            bodyClassName="text-right"
          />
          <Column
            field="grand_total_amount"
            header="Grand Total (₹)"
            body={(row) => (
              <strong className="tabular-nums" style={{ color: 'var(--primary-color)' }}>
                ₹{formatINR(row.grand_total_amount)}
              </strong>
            )}
            sortable
            headerStyle={{ textAlign: 'right', width: '160px' }}
            bodyClassName="text-right"
          />
          <Column field="payment_status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ width: '140px' }} />
          <Column body={actionBodyTemplate} headerStyle={{ width: '160px', textAlign: 'right' }} />
        </DataTable>
      </div>

      {/* Create / Edit Form Dialog */}
      <GSTInvoiceFormDialog
        visible={formDialogVisible}
        invoice={selectedInvoice}
        invoiceType={selectedInvoice?.invoice_type || (activeType === 'all' ? 'sale' : activeType)}
        onHide={() => setFormDialogVisible(false)}
        onSave={fetchInvoices}
        onDelete={(inv) => {
          setFormDialogVisible(false);
          handleConfirmDelete(inv);
        }}
      />

      {/* Invoice Detail / Print Preview Dialog */}
      <GSTInvoiceDetailDialog
        visible={detailDialogVisible}
        invoice={selectedInvoice}
        onHide={() => setDetailDialogVisible(false)}
        onEdit={(inv) => handleOpenEdit(inv)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Invoice Deletion"
        visible={deleteDialogVisible}
        style={{ width: '450px', maxWidth: '96vw' }}
        breakpoints={{ '960px': '90vw', '640px': '98vw' }}
        position="center"
        modal
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialogVisible(false)} />
            <Button
              label="Delete Permanently"
              icon="pi pi-trash"
              className="p-button-danger"
              loading={deleting}
              onClick={executeDelete}
            />
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--status-danger)' }} />
          <span>
            Are you sure you want to delete invoice{' '}
            <strong>#{selectedInvoice?.invoice_no}</strong>? This will permanently remove its line items and transport records.
          </span>
        </div>
      </Dialog>
    </div>
  );
}
