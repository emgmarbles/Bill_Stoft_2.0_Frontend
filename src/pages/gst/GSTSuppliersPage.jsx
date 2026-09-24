import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import gstService from '../../services/gstService';
import { formatDate } from '../../utils/formatters';

export default function GSTSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useRef(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gstService.getSuppliers({ search: search.trim() || undefined });
      const list = Array.isArray(data) ? data : data.results || [];
      setSuppliers(list);
    } catch (err) {
      console.error('Failed to fetch GST suppliers', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load GST suppliers.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAdd = () => {
    document.activeElement?.blur();
    setSelectedSupplier(null);
    setName('');
    setGstNumber('');
    setPhone('');
    setAddress('');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleOpenEdit = (supplier) => {
    document.activeElement?.blur();
    setSelectedSupplier(supplier);
    setName(supplier.name || '');
    setGstNumber(supplier.gst_number || '');
    setPhone(supplier.phone || '');
    setAddress(supplier.address || '');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleConfirmDelete = (supplier) => {
    document.activeElement?.blur();
    setSelectedSupplier(supplier);
    setDeleteDialogVisible(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Supplier name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        gst_number: gstNumber.trim().toUpperCase(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (selectedSupplier) {
        await gstService.updateSupplier(selectedSupplier.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: `Supplier ${payload.name} updated.`,
          life: 3000,
        });
      } else {
        await gstService.createSupplier(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: `Supplier ${payload.name} added.`,
          life: 3000,
        });
      }

      setDialogVisible(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to save supplier', err);
      const detail = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save supplier.';
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!selectedSupplier) return;
    setDeleting(true);
    try {
      await gstService.deleteSupplier(selectedSupplier.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `Supplier ${selectedSupplier.name} deleted.`,
        life: 3000,
      });
      setDeleteDialogVisible(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {
      console.error('Failed to delete supplier', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.detail || 'Could not delete supplier.',
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
          label={selectedSupplier ? 'Update' : 'Save'}
          icon="pi pi-check"
          loading={submitting}
          onClick={handleSave}
          className="p-button-primary"
        />
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} />
      </div>
      {selectedSupplier && (
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

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="Edit Supplier"
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
              Purchase GST Suppliers
            </h1>
            <Tag value="Quarries & Vendors" severity="warning" style={{ fontSize: '0.75rem' }} />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Quarry vendors and material suppliers directory with registered GSTIN details for purchase billing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-secondary"
            onClick={fetchSuppliers}
            loading={loading}
          />
          <Button label="Add Supplier" icon="pi pi-plus" className="p-button-primary" onClick={handleOpenAdd} />
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Suppliers
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }} className="tabular-nums">
            {suppliers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vendor profiles registered
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Verified GSTIN
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }} className="tabular-nums">
            {suppliers.filter((s) => Boolean(s.gst_number)).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Eligible for ITC tax credit
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            placeholder="Search suppliers by name, GSTIN, phone, address..."
            style={{ width: '100%' }}
          />
        </span>
      </div>

      {/* DataTable */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <DataTable
          value={suppliers}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No suppliers found. Click &quot;Add Supplier&quot; to register a quarry or vendor.
            </div>
          }
          stripedRows
        >
          <Column
            field="name"
            header="Supplier / Quarry Name"
            sortable
            body={(row) => <strong style={{ color: 'var(--text-main)' }}>{row.name}</strong>}
          />
          <Column
            field="gst_number"
            header="GSTIN Number"
            sortable
            body={(row) =>
              row.gst_number ? (
                <Tag value={row.gst_number} severity="warning" className="tabular-nums" />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unregistered</span>
              )
            }
          />
          <Column field="phone" header="Phone" sortable body={(row) => row.phone || '-'} />
          <Column field="address" header="Address / Quarry Location" body={(row) => row.address || '-'} />
          <Column
            field="created_at"
            header="Created On"
            sortable
            body={(row) => <span className="tabular-nums">{formatDate(row.created_at)}</span>}
          />
          <Column body={actionBodyTemplate} style={{ width: '110px', textAlign: 'right' }} />
        </DataTable>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        header={selectedSupplier ? `Edit Supplier: ${selectedSupplier.name}` : 'Add New Supplier'}
        visible={dialogVisible}
        style={{ width: '520px' }}
        modal
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
              Supplier / Quarry Name *
            </label>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajasthan Marble Quarry"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              GSTIN Number
            </label>
            <InputText
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 08AAAAA0000A1Z5"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Phone Number
            </label>
            <InputText
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9829012345"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Address / Quarry Location
            </label>
            <InputTextarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Quarry address, city, state"
              rows={3}
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Supplier Deletion"
        visible={deleteDialogVisible}
        style={{ width: '420px' }}
        modal
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
          <span>Are you sure you want to delete supplier <strong>{selectedSupplier?.name}</strong>?</span>
        </div>
      </Dialog>
    </div>
  );
}
