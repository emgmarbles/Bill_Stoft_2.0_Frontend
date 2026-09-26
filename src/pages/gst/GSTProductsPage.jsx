import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useAuth } from '../../context/AuthContext';
import gstService from '../../services/gstService';
import useDebounce from '../../hooks/useDebounce';
import { formatINR } from '../../utils/formatters';

const PRODUCT_TYPES = [
  { label: 'Granite', value: 'granite' },
  { label: 'Marble', value: 'marble' },
  { label: 'Kota Stone', value: 'kota' },
  { label: 'Other Stones', value: 'other' },
];

const GST_RATES = [
  { label: '18% GST (Standard Stone)', value: 18 },
  { label: '5% GST (Rough/Quarry)', value: 5 },
  { label: '12% GST (Processed Tiles)', value: 12 },
  { label: '28% GST (Luxury Slab)', value: 28 },
];

export default function GSTProductsPage() {
  const { user } = useAuth();
  const isSuperAdmin = Boolean(user?.is_super_admin);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [typeFilter, setTypeFilter] = useState(null);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [hsnCode, setHsnCode] = useState('6802');
  const [gstRate, setGstRate] = useState(18);
  const [productType, setProductType] = useState('granite');
  const [openingStock, setOpeningStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(typeFilter && { type: typeFilter }),
      };
      const data = await gstService.getProducts(params);
      const list = Array.isArray(data) ? data : data.results || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to fetch GST products', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load GST products.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    document.activeElement?.blur();
    setSelectedProduct(null);
    setName('');
    setHsnCode('6802');
    setGstRate(18);
    setProductType('granite');
    setOpeningStock(0);
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleOpenEdit = (prod) => {
    document.activeElement?.blur();
    setSelectedProduct(prod);
    setName(prod.name || '');
    setHsnCode(prod.hsn_code || '');
    setGstRate(prod.gst_rate || 18);
    setProductType(prod.type || 'granite');
    setOpeningStock(prod.opening_stock !== undefined && prod.opening_stock !== null ? Number(prod.opening_stock) : 0);
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleConfirmDelete = (prod) => {
    document.activeElement?.blur();
    setSelectedProduct(prod);
    setDeleteDialogVisible(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        hsn_code: hsnCode.trim(),
        gst_rate: gstRate,
        type: productType,
        opening_stock: openingStock,
      };

      if (selectedProduct) {
        await gstService.updateProduct(selectedProduct.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: `Product ${payload.name} updated.`,
          life: 3000,
        });
      } else {
        await gstService.createProduct(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: `Product ${payload.name} added.`,
          life: 3000,
        });
      }

      setDialogVisible(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      const detail = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save product.';
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      await gstService.deleteProduct(selectedProduct.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `Product ${selectedProduct.name} deleted.`,
        life: 3000,
      });
      setDeleteDialogVisible(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.detail || 'Could not delete product.',
        life: 4000,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Standard modal footer convention:
  // Edit modals: [Update/Save] [Cancel]  (me-auto) ······ [Delete] (right)
  // Add modals: [Save] [Cancel] (me-auto)
  const dialogFooter = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          label={selectedProduct ? 'Update' : 'Save'}
          icon="pi pi-check"
          loading={submitting}
          onClick={handleSave}
          className="p-button-primary"
        />
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} />
      </div>
      {selectedProduct && (
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger p-button-outlined"
          onClick={() => {
            setDialogVisible(false);
            setDeleteDialogVisible(true);
          }}
        />
      )}
    </div>
  );

  const typeBodyTemplate = (rowData) => {
    const type = rowData.type || 'granite';
    let severity = 'info';
    if (type === 'marble') severity = 'warning';
    if (type === 'kota') severity = 'success';
    return <Tag value={type.toUpperCase()} severity={severity} />;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="Edit Product"
          onClick={() => handleOpenEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          tooltip="Delete"
          onClick={() => handleConfirmDelete(rowData)}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      <Toast ref={toast} />

      {/* Header */}
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
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              GST Product Catalog
            </h1>
            <Tag value="HSN & Rates Master" severity="info" style={{ fontSize: '0.75rem' }} />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Stone varieties, slab materials, HSN tax classifications, and GST percentage rates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-secondary"
            onClick={fetchProducts}
            loading={loading}
          />
          <Button label="Add GST Product" icon="pi pi-plus" className="p-button-primary" onClick={handleOpenAdd} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
        }}
      >
        <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '380px' }}>
          <i className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or HSN..."
            style={{ width: '100%' }}
          />
        </span>

        <Dropdown
          value={typeFilter}
          options={[{ label: 'All Stone Categories', value: null }, ...PRODUCT_TYPES]}
          onChange={(e) => setTypeFilter(e.value)}
          placeholder="Filter by Category"
          appendTo={typeof document !== 'undefined' ? document.body : undefined}
          style={{ width: '220px' }}
        />
      </div>

      {/* DataTable */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <DataTable
          value={products}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No GST products found. Click &quot;Add GST Product&quot; to define a stone variety.
            </div>
          }
          stripedRows
        >
          <Column
            field="name"
            header="Product Name"
            sortable
            body={(row) => <strong style={{ color: 'var(--text-main)' }}>{row.name}</strong>}
          />
          <Column field="type" header="Category" body={typeBodyTemplate} sortable style={{ width: '150px' }} />
          <Column
            field="hsn_code"
            header="HSN Code"
            sortable
            body={(row) => (
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                {row.hsn_code || '6802'}
              </span>
            )}
            style={{ width: '130px' }}
          />
          <Column
            field="gst_rate"
            header="GST Rate"
            sortable
            body={(row) => <span className="tabular-nums">{row.gst_rate}%</span>}
            style={{ width: '120px' }}
          />
          <Column
            field="opening_stock"
            header="Opening Stock"
            sortable
            body={(row) => (
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {formatINR(row.opening_stock || 0)}
              </span>
            )}
            style={{ width: '140px', textAlign: 'right' }}
          />
          <Column body={actionBodyTemplate} style={{ width: '110px', textAlign: 'right' }} />
        </DataTable>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        header={selectedProduct ? `Edit Product: ${selectedProduct.name}` : 'Add New GST Product'}
        visible={dialogVisible}
        style={{ width: '500px', maxWidth: '96vw' }}
        breakpoints={{ '960px': '90vw', '640px': '98vw' }}
        position="center"
        modal
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        footer={dialogFooter}
        onHide={() => setDialogVisible(false)}
      >
        {errorMsg && (
          <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger)', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Product / Stone Name *
            </label>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Black Galaxy, Lakha Red"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Stone Category
            </label>
            <Dropdown
              value={productType}
              options={PRODUCT_TYPES}
              onChange={(e) => setProductType(e.value)}
              appendTo={typeof document !== 'undefined' ? document.body : undefined}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                HSN Code
              </label>
              <InputText
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 6802"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                GST Rate (%)
              </label>
              <Dropdown
                value={gstRate}
                options={GST_RATES}
                onChange={(e) => setGstRate(e.value)}
                appendTo={typeof document !== 'undefined' ? document.body : undefined}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Initial Opening Stock (Qty / Sq.Ft)
              </label>
              {selectedProduct && !isSuperAdmin && (
                <Tag severity="secondary" value="Locked (Super Admin Only)" style={{ fontSize: '0.7rem' }} />
              )}
            </div>
            <InputNumber
              value={openingStock}
              onValueChange={(e) => setOpeningStock(e.value ?? 0)}
              minFractionDigits={2}
              maxFractionDigits={2}
              min={0}
              placeholder="0.00"
              disabled={Boolean(selectedProduct && !isSuperAdmin)}
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
            {selectedProduct && !isSuperAdmin && (
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                Only super admin can modify initial opening stock balance.
              </small>
            )}
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Product Deletion"
        visible={deleteDialogVisible}
        style={{ width: '420px', maxWidth: '96vw' }}
        breakpoints={{ '960px': '90vw', '640px': '98vw' }}
        position="center"
        modal
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" loading={deleting} onClick={executeDelete} />
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--status-danger)' }} />
          <span>Are you sure you want to delete product <strong>{selectedProduct?.name}</strong>?</span>
        </div>
      </Dialog>
    </div>
  );
}
