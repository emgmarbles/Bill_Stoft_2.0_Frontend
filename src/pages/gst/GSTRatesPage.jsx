import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import gstService from '../../services/gstService';
import useDebounce from '../../hooks/useDebounce';
import { formatINR, formatDate } from '../../utils/formatters';

const PRODUCT_TYPES = [
  { label: 'All Stone Types', value: null },
  { label: 'Granite', value: 'granite' },
  { label: 'Marble', value: 'marble' },
  { label: 'Kota Stone', value: 'kota' },
  { label: 'Other Stones', value: 'other' },
];

const MONTH_OPTIONS = [
  { label: 'All Months', value: null },
  { label: 'January (01)', value: 1 },
  { label: 'February (02)', value: 2 },
  { label: 'March (03)', value: 3 },
  { label: 'April (04)', value: 4 },
  { label: 'May (05)', value: 5 },
  { label: 'June (06)', value: 6 },
  { label: 'July (07)', value: 7 },
  { label: 'August (08)', value: 8 },
  { label: 'September (09)', value: 9 },
  { label: 'October (10)', value: 10 },
  { label: 'November (11)', value: 11 },
  { label: 'December (12)', value: 12 },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { label: 'All Years', value: null },
  { label: String(currentYear + 1), value: currentYear + 1 },
  { label: String(currentYear), value: currentYear },
  { label: String(currentYear - 1), value: currentYear - 1 },
  { label: String(currentYear - 2), value: currentYear - 2 },
];

export default function GSTRatesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef(null);

  // --- Current Rates State ---
  const [currentRates, setCurrentRates] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [searchCurrent, setSearchCurrent] = useState('');
  const debouncedSearchCurrent = useDebounce(searchCurrent, 350);
  const [typeFilter, setTypeFilter] = useState(null);

  // --- Monthly Rates State ---
  const [monthlyRates, setMonthlyRates] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [searchMonthly, setSearchMonthly] = useState('');
  const debouncedSearchMonthly = useDebounce(searchMonthly, 350);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);

  // Recalculating state
  const [recalculating, setRecalculating] = useState(false);

  // Load product list for monthly filter
  useEffect(() => {
    gstService
      .getProducts({ size: 500 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setProductsList(list);
      })
      .catch((err) => console.error('Failed to load products for rates filter', err));
  }, []);

  // Fetch Current Rates
  const fetchCurrentRates = useCallback(async () => {
    setLoadingCurrent(true);
    try {
      const params = {
        ...(debouncedSearchCurrent.trim() && { search: debouncedSearchCurrent.trim() }),
        ...(typeFilter && { product_type: typeFilter }),
      };
      const res = await gstService.getCurrentRates(params);
      const list = Array.isArray(res) ? res : res?.results || [];
      setCurrentRates(list);
    } catch (err) {
      console.error('Failed to fetch current rates', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load current rates.',
        life: 4000,
      });
    } finally {
      setLoadingCurrent(false);
    }
  }, [debouncedSearchCurrent, typeFilter]);

  // Fetch Monthly Rates
  const fetchMonthlyRates = useCallback(async () => {
    setLoadingMonthly(true);
    try {
      const params = {
        ...(debouncedSearchMonthly.trim() && { search: debouncedSearchMonthly.trim() }),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedYear && { year: selectedYear }),
        ...(selectedProduct && { product_id: selectedProduct }),
      };
      const res = await gstService.getMonthlyRates(params);
      const list = Array.isArray(res) ? res : res?.results || [];
      setMonthlyRates(list);
    } catch (err) {
      console.error('Failed to fetch monthly rates', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load monthly rates history.',
        life: 4000,
      });
    } finally {
      setLoadingMonthly(false);
    }
  }, [debouncedSearchMonthly, selectedMonth, selectedYear, selectedProduct]);

  useEffect(() => {
    fetchCurrentRates();
  }, [fetchCurrentRates]);

  useEffect(() => {
    fetchMonthlyRates();
  }, [fetchMonthlyRates]);

  // Trigger Recalculation
  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await gstService.recalculateRates();
      toast.current?.show({
        severity: 'success',
        summary: 'Rates Recalculated',
        detail: res?.message || 'Rates recalculated successfully.',
        life: 4000,
      });
      fetchCurrentRates();
      fetchMonthlyRates();
    } catch (err) {
      console.error('Failed to recalculate rates', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.detail || 'Failed to recalculate rates.',
        life: 4000,
      });
    } finally {
      setRecalculating(false);
    }
  };

  // KPIs
  const totalProducts = currentRates.length;
  const avgPurchaseOverall =
    totalProducts > 0
      ? currentRates.reduce((acc, r) => acc + (parseFloat(r.avg_purchase_rate) || 0), 0) / totalProducts
      : 0;
  const avgSaleOverall =
    totalProducts > 0
      ? currentRates.reduce((acc, r) => acc + (parseFloat(r.avg_sale_rate) || 0), 0) / totalProducts
      : 0;

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1600px', margin: '0 auto' }}>
      <Toast ref={toast} />

      {/* Top Header */}
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
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-main, #0f172a)',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <i className="pi pi-percentage" style={{ fontSize: '1.5rem', color: '#2563eb' }} />
            Product Rates & Averages
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
            Track weighted average purchase and sale rates calculated per product across all GST bills.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            label="Recalculate Rates"
            icon={recalculating ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
            className="p-button-outlined p-button-primary"
            onClick={handleRecalculate}
            disabled={recalculating}
            tooltip="Synchronize and recompute purchase & sale rate averages from invoice transactions"
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'var(--surface-card, #ffffff)',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              AVG PURCHASE RATE
            </span>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="pi pi-arrow-down-left" style={{ fontSize: '14px' }} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>
            ₹{formatINR(avgPurchaseOverall)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all inward purchase bills
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-card, #ffffff)',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              AVG SALE RATE
            </span>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="pi pi-arrow-up-right" style={{ fontSize: '14px' }} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>
            ₹{formatINR(avgSaleOverall)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all outward sale bills
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-card, #ffffff)',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              PRODUCTS TRACKED
            </span>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="pi pi-box" style={{ fontSize: '14px' }} />
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
            {totalProducts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Catalog products with active rate metrics
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div
        style={{
          background: 'var(--surface-card, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          {/* TAB 1: Current Rates */}
          <TabPanel header="Current Rates" leftIcon="pi pi-chart-line mr-2">
            <div style={{ padding: '16px 20px' }}>
              {/* Filter bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                  <span className="p-input-icon-left" style={{ width: '280px', maxWidth: '100%' }}>
                    <i className="pi pi-search" />
                    <InputText
                      value={searchCurrent}
                      onChange={(e) => setSearchCurrent(e.target.value)}
                      placeholder="Search product name or HSN..."
                      style={{ width: '100%' }}
                    />
                  </span>
                  <Dropdown
                    value={typeFilter}
                    options={PRODUCT_TYPES}
                    onChange={(e) => setTypeFilter(e.value)}
                    placeholder="All Stone Types"
                    style={{ width: '180px' }}
                  />
                </div>
              </div>

              {/* Table */}
              <DataTable
                value={currentRates}
                loading={loadingCurrent}
                paginator
                rows={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                emptyMessage="No current product rates found."
                className="p-datatable-sm"
                responsiveLayout="scroll"
              >
                <Column
                  header="#"
                  body={(_, options) => options.rowIndex + 1}
                  style={{ width: '50px', textAlign: 'center' }}
                />
                <Column
                  field="product.name"
                  header="Product Name"
                  body={(row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        HSN: {row.product?.hsn_code || '-'}
                      </div>
                    </div>
                  )}
                  sortable
                />
                <Column
                  field="product.type_display"
                  header="Stone Type"
                  body={(row) => (
                    <Tag
                      value={row.product?.type_display || row.product?.type || '-'}
                      severity="info"
                      style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                    />
                  )}
                  style={{ width: '130px' }}
                />
                <Column
                  field="avg_purchase_rate"
                  header="Avg Buy Rate"
                  body={(row) => {
                    const buy = parseFloat(row.avg_purchase_rate) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: buy > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                        {buy > 0 ? `₹${formatINR(buy)}` : '₹0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '140px' }}
                  sortable
                />
                <Column
                  field="last_purchase_rate"
                  header="Last Buy Rate"
                  body={(row) => {
                    const lastBuy = parseFloat(row.last_purchase_rate) || 0;
                    return (
                      <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {lastBuy > 0 ? `₹${formatINR(lastBuy)}` : '-'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  field="avg_sale_rate"
                  header="Avg Sell Rate"
                  body={(row) => {
                    const sell = parseFloat(row.avg_sale_rate) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: sell > 0 ? '#2563eb' : 'var(--text-muted)' }}>
                        {sell > 0 ? `₹${formatINR(sell)}` : '₹0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '140px' }}
                  sortable
                />
                <Column
                  field="last_sale_rate"
                  header="Last Sell Rate"
                  body={(row) => {
                    const lastSell = parseFloat(row.last_sale_rate) || 0;
                    return (
                      <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {lastSell > 0 ? `₹${formatINR(lastSell)}` : '-'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  header="Rate Spread"
                  body={(row) => {
                    const buy = parseFloat(row.avg_purchase_rate) || 0;
                    const sell = parseFloat(row.avg_sale_rate) || 0;
                    if (buy > 0 && sell > 0) {
                      const spread = sell - buy;
                      return (
                        <span
                          className="tabular-nums font-bold"
                          style={{ color: spread >= 0 ? '#16a34a' : '#dc2626' }}
                        >
                          {spread >= 0 ? `+₹${formatINR(spread)}` : `-₹${formatINR(Math.abs(spread))}`}
                        </span>
                      );
                    }
                    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
                  }}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  header="Last Activity"
                  body={(row) => {
                    if (!row.last_trasction_id) {
                      return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>;
                    }
                    const isBuy = row.transaction_type === 'purchase';
                    return (
                      <div>
                        <Tag
                          value={isBuy ? 'Purchase' : 'Sale'}
                          severity={isBuy ? 'success' : 'info'}
                          style={{ fontSize: '0.7rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          #{row.last_invoice_no || row.last_trasction_id}
                        </span>
                        {row.last_invoice_date && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {formatDate(row.last_invoice_date)}
                          </div>
                        )}
                      </div>
                    );
                  }}
                  style={{ width: '180px' }}
                />
                <Column
                  field="updated_at"
                  header="Last Synchronized"
                  body={(row) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(row.updated_at)}
                    </span>
                  )}
                  style={{ width: '150px' }}
                />
              </DataTable>
            </div>
          </TabPanel>

          {/* TAB 2: Monthly Rates Ledger */}
          <TabPanel header="Monthly Rates History" leftIcon="pi pi-calendar mr-2">
            <div style={{ padding: '16px 20px' }}>
              {/* Filter bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                  <span className="p-input-icon-left" style={{ width: '240px', maxWidth: '100%' }}>
                    <i className="pi pi-search" />
                    <InputText
                      value={searchMonthly}
                      onChange={(e) => setSearchMonthly(e.target.value)}
                      placeholder="Search product..."
                      style={{ width: '100%' }}
                    />
                  </span>
                  <Dropdown
                    value={selectedMonth}
                    options={MONTH_OPTIONS}
                    onChange={(e) => setSelectedMonth(e.value)}
                    placeholder="Select Month"
                    style={{ width: '170px' }}
                  />
                  <Dropdown
                    value={selectedYear}
                    options={YEAR_OPTIONS}
                    onChange={(e) => setSelectedYear(e.value)}
                    placeholder="Select Year"
                    style={{ width: '140px' }}
                  />
                  <Dropdown
                    value={selectedProduct}
                    options={[
                      { label: 'All Products', value: null },
                      ...productsList.map((p) => ({ label: p.name, value: p.id })),
                    ]}
                    onChange={(e) => setSelectedProduct(e.value)}
                    placeholder="All Products"
                    filter
                    filterBy="label"
                    style={{ width: '220px' }}
                  />
                </div>
              </div>

              {/* Monthly Rates Table */}
              <DataTable
                value={monthlyRates}
                loading={loadingMonthly}
                paginator
                rows={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                emptyMessage="No monthly rate records found for selected period."
                className="p-datatable-sm"
                responsiveLayout="scroll"
              >
                <Column
                  header="#"
                  body={(_, options) => options.rowIndex + 1}
                  style={{ width: '50px', textAlign: 'center' }}
                />
                <Column
                  header="Month / Year"
                  body={(row) => (
                    <div style={{ fontWeight: 700 }}>
                      {row.month_name} {row.year}
                    </div>
                  )}
                  style={{ width: '150px' }}
                />
                <Column
                  field="product.name"
                  header="Product Name"
                  body={(row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        HSN: {row.product?.hsn_code || '-'}
                      </div>
                    </div>
                  )}
                  sortable
                />
                <Column
                  field="avg_purchase_rate"
                  header="Avg Buy Rate"
                  body={(row) => {
                    const buy = parseFloat(row.avg_purchase_rate) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: buy > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                        {buy > 0 ? `₹${formatINR(buy)}` : '₹0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  field="total_purchase_qty"
                  header="Purchased Qty"
                  body={(row) => (
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {formatINR(row.total_purchase_qty)}
                    </span>
                  )}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  field="total_purchase_amount"
                  header="Purchase Amount"
                  body={(row) => (
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      ₹{formatINR(row.total_purchase_amount)}
                    </span>
                  )}
                  style={{ textAlign: 'right', width: '140px' }}
                />
                <Column
                  field="avg_sale_rate"
                  header="Avg Sell Rate"
                  body={(row) => {
                    const sell = parseFloat(row.avg_sale_rate) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: sell > 0 ? '#2563eb' : 'var(--text-muted)' }}>
                        {sell > 0 ? `₹${formatINR(sell)}` : '₹0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '130px' }}
                />
                <Column
                  field="total_sale_qty"
                  header="Sold Qty"
                  body={(row) => (
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {formatINR(row.total_sale_qty)}
                    </span>
                  )}
                  style={{ textAlign: 'right', width: '120px' }}
                />
                <Column
                  field="total_sale_amount"
                  header="Sale Amount"
                  body={(row) => (
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      ₹{formatINR(row.total_sale_amount)}
                    </span>
                  )}
                  style={{ textAlign: 'right', width: '140px' }}
                />
                <Column
                  header="Bills (Buy / Sell)"
                  body={(row) => (
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{row.purchase_bill_count} buy</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>{row.sale_bill_count} sell</span>
                    </div>
                  )}
                  style={{ width: '140px', textAlign: 'center' }}
                />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}
