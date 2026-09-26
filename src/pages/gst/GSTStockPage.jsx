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

export default function GSTStockPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef(null);

  // --- Current Stock State ---
  const [currentStocks, setCurrentStocks] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [searchCurrent, setSearchCurrent] = useState('');
  const debouncedSearchCurrent = useDebounce(searchCurrent, 350);
  const [typeFilter, setTypeFilter] = useState(null);

  // --- Monthly Stock State ---
  const [monthlyStocks, setMonthlyStocks] = useState([]);
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
      .catch((err) => console.error('Failed to load products for stock filter', err));
  }, []);

  // Fetch Current Stocks
  const fetchCurrentStocks = useCallback(async () => {
    setLoadingCurrent(true);
    try {
      const params = {
        ...(debouncedSearchCurrent.trim() && { search: debouncedSearchCurrent.trim() }),
        ...(typeFilter && { product_type: typeFilter }),
      };
      const res = await gstService.getCurrentStock(params);
      const list = Array.isArray(res) ? res : res?.results || [];
      setCurrentStocks(list);
    } catch (err) {
      console.error('Failed to fetch current stock', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load current stock balances.',
        life: 4000,
      });
    } finally {
      setLoadingCurrent(false);
    }
  }, [debouncedSearchCurrent, typeFilter]);

  // Fetch Monthly Stocks
  const fetchMonthlyStocks = useCallback(async () => {
    setLoadingMonthly(true);
    try {
      const params = {
        ...(debouncedSearchMonthly.trim() && { search: debouncedSearchMonthly.trim() }),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedYear && { year: selectedYear }),
        ...(selectedProduct && { product_id: selectedProduct }),
      };
      const res = await gstService.getMonthlyStock(params);
      const list = Array.isArray(res) ? res : res?.results || [];
      setMonthlyStocks(list);
    } catch (err) {
      console.error('Failed to fetch monthly stock', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load monthly stock ledger.',
        life: 4000,
      });
    } finally {
      setLoadingMonthly(false);
    }
  }, [debouncedSearchMonthly, selectedMonth, selectedYear, selectedProduct]);

  useEffect(() => {
    fetchCurrentStocks();
  }, [fetchCurrentStocks]);

  useEffect(() => {
    fetchMonthlyStocks();
  }, [fetchMonthlyStocks]);

  // Handle Recalculate Stock
  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await gstService.recalculateStock();
      toast.current?.show({
        severity: 'success',
        summary: 'Stock Recalculated',
        detail: res?.message || 'Monthly and current stock balances successfully recalculated.',
        life: 4000,
      });
      fetchCurrentStocks();
      fetchMonthlyStocks();
    } catch (err) {
      console.error('Failed to recalculate stock', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to recalculate stock balances.',
        life: 4000,
      });
    } finally {
      setRecalculating(false);
    }
  };

  // KPIs
  const totalProducts = currentStocks.length;
  const totalNetBalance = currentStocks.reduce(
    (acc, curr) => acc + (parseFloat(curr.balance) || 0),
    0
  );

  // Column templates - Current Stock
  const balanceBodyTemplate = (row) => {
    const val = parseFloat(row.balance) || 0;
    const isPositive = val > 0;
    const isZero = val === 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          className="tabular-nums font-semibold"
          style={{
            fontSize: '1rem',
            color: isPositive ? '#16a34a' : isZero ? '#64748b' : '#dc2626',
          }}
        >
          {formatINR(val)}
        </span>
        <Tag
          value={isPositive ? 'In Stock' : isZero ? 'Nil' : 'Deficit'}
          severity={isPositive ? 'success' : isZero ? 'secondary' : 'danger'}
          style={{ fontSize: '0.65rem', padding: '2px 6px' }}
        />
      </div>
    );
  };

  const lastTransBodyTemplate = (row) => {
    if (!row.last_invoice_no) {
      return <span style={{ color: 'var(--text-muted)' }}>No transactions</span>;
    }
    const isSale = row.transaction_type === 'sale';
    return (
      <div style={{ fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag
            value={(row.transaction_type || 'N/A').toUpperCase()}
            severity={isSale ? 'info' : 'warning'}
            style={{ fontSize: '0.65rem' }}
          />
          <strong className="tabular-nums">#{row.last_invoice_no}</strong>
        </div>
        {row.last_invoice_date && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatDate(row.last_invoice_date)}
          </div>
        )}
      </div>
    );
  };

  const productTypeBodyTemplate = (row) => {
    const type = row.product?.type || 'other';
    const label = row.product?.type_display || type.toUpperCase();
    return (
      <Tag
        value={label}
        style={{
          background: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          fontSize: '0.7rem',
          fontWeight: 600,
        }}
      />
    );
  };

  return (
    <div className="gst-stock-page" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast ref={toast} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            GST Stock & Inventory
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Automated monthly roll-forward ledger and instant current balances synchronized with GST bills.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            label="Recalculate Stock"
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={handleRecalculate}
            loading={recalculating}
          />
          <Button
            label="Refresh"
            icon="pi pi-sync"
            className="p-button-secondary p-button-outlined"
            onClick={() => {
              fetchCurrentStocks();
              fetchMonthlyStocks();
            }}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Tracked Products
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }} className="tabular-nums">
            {totalProducts}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Net Balance (Qty / Sq.Ft)
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '6px' }} className="tabular-nums">
            {formatINR(totalNetBalance)}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Monthly Ledger Entries
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '6px' }} className="tabular-nums">
            {monthlyStocks.length}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          {/* TAB 1: Current Stock */}
          <TabPanel header="Current Stock Balance" leftIcon="pi pi-box mr-2">
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
                      placeholder="Search product or HSN..."
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
                value={currentStocks}
                loading={loadingCurrent}
                paginator
                rows={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                emptyMessage="No current stock records found."
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
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HSN: {row.product?.hsn_code || '-'}</div>
                    </div>
                  )}
                  sortable
                />
                <Column
                  header="Stone Type"
                  body={productTypeBodyTemplate}
                  style={{ width: '140px' }}
                />
                <Column
                  field="balance"
                  header="Current Balance"
                  body={balanceBodyTemplate}
                  sortable
                  style={{ width: '220px' }}
                />
                <Column
                  header="Last Transaction"
                  body={lastTransBodyTemplate}
                  style={{ width: '220px' }}
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

          {/* TAB 2: Monthly Stock Ledger */}
          <TabPanel header="Monthly Stock Ledger" leftIcon="pi pi-calendar mr-2">
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

              {/* Ledger Table */}
              <DataTable
                value={monthlyStocks}
                loading={loadingMonthly}
                paginator
                rows={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                emptyMessage="No monthly stock ledger records found for selected period."
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HSN: {row.product?.hsn_code || '-'}</div>
                    </div>
                  )}
                  sortable
                />
                <Column
                  field="opening"
                  header="Opening"
                  body={(row) => (
                    <span className="tabular-nums font-medium" style={{ color: 'var(--text-muted)' }}>
                      {formatINR(row.opening)}
                    </span>
                  )}
                  style={{ textAlign: 'right', width: '120px' }}
                />
                <Column
                  field="total_purchase"
                  header="Inward (+ Buy)"
                  body={(row) => {
                    const buy = parseFloat(row.total_purchase) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: buy > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                        {buy > 0 ? `+${formatINR(buy)}` : '0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '140px' }}
                />
                <Column
                  field="total_sale"
                  header="Outward (- Sell)"
                  body={(row) => {
                    const sell = parseFloat(row.total_sale) || 0;
                    return (
                      <span className="tabular-nums font-semibold" style={{ color: sell > 0 ? '#2563eb' : 'var(--text-muted)' }}>
                        {sell > 0 ? `-${formatINR(sell)}` : '0.00'}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '140px' }}
                />
                <Column
                  field="closing"
                  header="Closing Balance"
                  body={(row) => {
                    const closeVal = parseFloat(row.closing) || 0;
                    return (
                      <span className="tabular-nums font-bold" style={{ color: closeVal >= 0 ? '#0f172a' : '#dc2626' }}>
                        {formatINR(closeVal)}
                      </span>
                    );
                  }}
                  style={{ textAlign: 'right', width: '140px' }}
                />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}
