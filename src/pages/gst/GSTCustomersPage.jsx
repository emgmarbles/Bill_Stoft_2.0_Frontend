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
import useDebounce from '../../hooks/useDebounce';

export default function GSTCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useRef(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gstService.getCustomers({ search: debouncedSearch.trim() || undefined });
      const list = Array.isArray(data) ? data : data.results || [];
      setCustomers(list);
    } catch (err) {
      console.error('Failed to fetch GST customers', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load GST customers.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    document.activeElement?.blur();
    setSelectedCustomer(null);
    setName('');
    setGstNumber('');
    setPhone('');
    setAddress('');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleOpenEdit = (customer) => {
    document.activeElement?.blur();
    setSelectedCustomer(customer);
    setName(customer.name || '');
    setGstNumber(customer.gst_number || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleConfirmDelete = (customer) => {
    document.activeElement?.blur();
    setSelectedCustomer(customer);
    setDeleteDialogVisible(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Customer name is required.');
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

      if (selectedCustomer) {
        await gstService.updateCustomer(selectedCustomer.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: `Customer ${payload.name} updated.`,
          life: 3000,
        });
      } else {
        await gstService.createCustomer(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: `Customer ${payload.name} added.`,
          life: 3000,
        });
      }

      setDialogVisible(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to save customer', err);
      const detail = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save customer.';
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!selectedCustomer) return;
    setDeleting(true);
    try {
      await gstService.deleteCustomer(selectedCustomer.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `Customer ${selectedCustomer.name} deleted.`,
        life: 3000,
      });
      setDeleteDialogVisible(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.detail || 'Could not delete customer.',
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
          label={selectedCustomer ? 'Update' : 'Save'}
          icon="pi pi-check"
          loading={submitting}
          onClick={handleSave}
          className="p-button-primary"
        />
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} />
      </div>
      {selectedCustomer && (
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
          tooltip="Edit Customer"
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
              GST Customers Master
            </h1>
            <Tag value="Buyers Directory" severity="info" style={{ fontSize: '0.75rem' }} />
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registered customers directory with verified GSTIN, billing addresses, and tax invoice history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            className="p-button-outlined p-button-secondary"
            onClick={fetchCustomers}
            loading={loading}
          />
          <Button label="Add GST Customer" icon="pi pi-plus" className="p-button-primary" onClick={handleOpenAdd} />
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
            Total Customers
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }} className="tabular-nums">
            {customers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Party accounts registered
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            With GSTIN
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }} className="tabular-nums">
            {customers.filter((c) => Boolean(c.gst_number)).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Eligible for GST input tax
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
            placeholder="Search by name, GSTIN, phone, address..."
            style={{ width: '100%' }}
          />
        </span>
      </div>

      {/* DataTable */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <DataTable
          value={customers}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No GST customers found. Click &quot;Add GST Customer&quot; to create one.
            </div>
          }
          stripedRows
        >
          <Column
            field="name"
            header="Customer Name"
            sortable
            body={(row) => <strong style={{ color: 'var(--text-main)' }}>{row.name}</strong>}
          />
          <Column
            field="gst_number"
            header="GSTIN Number"
            sortable
            body={(row) =>
              row.gst_number ? (
                <Tag value={row.gst_number} severity="info" className="tabular-nums" />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unregistered</span>
              )
            }
          />
          <Column field="phone" header="Phone" sortable body={(row) => row.phone || '-'} />
          <Column field="address" header="Address" body={(row) => row.address || '-'} />
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
        header={selectedCustomer ? `Edit Customer: ${selectedCustomer.name}` : 'Add New GST Customer'}
        visible={dialogVisible}
        style={{ width: '520px', maxWidth: '96vw' }}
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
              Customer / Firm Name *
            </label>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Balaji Stone Trading"
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
              placeholder="e.g. 24AAAAA0000A1Z5"
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
              placeholder="e.g. 9876543210"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Billing / Site Address
            </label>
            <InputTextarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full delivery/billing address"
              rows={3}
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Customer Deletion"
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
          <span>Are you sure you want to delete customer <strong>{selectedCustomer?.name}</strong>?</span>
        </div>
      </Dialog>
    </div>
  );
}
