import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import GSTInvoiceFormDialog from './GSTInvoiceFormDialog';
import GSTInvoiceDetailDialog from './GSTInvoiceDetailDialog';

const PAYMENT_FILTER_OPTIONS = [
  { label: 'All Payment Statuses', value: null },
  { label: 'Pending Only', value: 'pending' },
  { label: 'Paid in Full', value: 'paid' },
  { label: 'Partial Payments', value: 'partial' },
];

export default function GSTInvoiceList({ type = 'sale' }) {
  const isSale = type === 'sale';
  const pageTitle = isSale ? 'GST Sell Bills & Tax Invoices' : 'Purchase GST Invoices';
  const createButtonLabel = isSale ? 'Create Sale Tax Invoice' : 'Record Purchase Invoice';
  const partyHeader = isSale ? 'Customer / Buyer' : 'Supplier / Quarry';

  // Table & Data State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);

  // Dialog states
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useRef(null);

  // Fetch invoices and summary metrics
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        invoice_type: type,
        ...(search.trim() && { search: search.trim() }),
        ...(paymentStatusFilter && { payment_status: paymentStatusFilter }),
      };

      const [invoicesData, summaryData] = await Promise.all([
        gstService.getInvoices(params),
        gstService.getInvoiceSummary(type),
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
  }, [type, search, paymentStatusFilter]);

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

    return <Tag value={label} severity={severity} />;
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
    const name = rowData.party_name || (isSale ? rowData.customer?.name : rowData.supplier?.name) || 'Unassigned';
    return (
      <div className="gst-party-cell" style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{name}</div>
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
          tooltip="View / Print Tax Invoice"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleOpenDetail(rowData)}
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
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {pageTitle}
            </h1>
            <Tag
              value={isSale ? 'Outward Sales' : 'Inward Purchases'}
              severity={isSale ? 'info' : 'warning'}
              style={{ fontSize: '0.75rem' }}
            />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSale
              ? 'GST compliance sales bills with automated tax calculations, HSN codes, and transport logistics.'
              : 'Record incoming supplier GST bills with input tax credit (ITC) and purchase tracking.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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

        <div className="gst-filter-select-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Dropdown
            value={paymentStatusFilter}
            options={PAYMENT_FILTER_OPTIONS}
            onChange={(e) => setPaymentStatusFilter(e.value)}
            placeholder="Payment Status"
            style={{ width: '200px' }}
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
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#cbd5e1' }} />
              No {isSale ? 'sales' : 'purchase'} invoices found matching current filters.
            </div>
          }
          responsiveLayout="stack"
          breakpoint="960px"
          stripedRows
        >
          <Column field="invoice_no" header="Invoice No" body={invoiceNoBodyTemplate} sortable headerStyle={{ width: '180px' }} />
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
          <Column body={actionBodyTemplate} headerStyle={{ width: '130px', textAlign: 'right' }} />
        </DataTable>
      </div>

      {/* Create / Edit Form Dialog */}
      <GSTInvoiceFormDialog
        visible={formDialogVisible}
        invoice={selectedInvoice}
        invoiceType={type}
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
        style={{ width: '450px' }}
        modal
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
