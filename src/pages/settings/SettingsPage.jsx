import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { companyProfileService } from '../../services/companyProfileService';
import useDebounce from '../../hooks/useDebounce';

export default function SettingsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [panNo, setPanNo] = useState('');
  const [state, setState] = useState('Gujarat');
  const [stateCode, setStateCode] = useState('24');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [defaultTruckNo, setDefaultTruckNo] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  const toast = useRef(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await companyProfileService.getCompanyProfiles(params);
      const list = res.results || res;
      setProfiles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load company profiles', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load company profiles.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const resetForm = () => {
    setSelectedProfile(null);
    setCompanyName('');
    setTradeName('');
    setGstin('');
    setPanNo('');
    setState('Gujarat');
    setStateCode('24');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setPincode('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setBankName('');
    setBankAccountNo('');
    setBankIfsc('');
    setBankBranch('');
    setDefaultTruckNo('');
    setIsPrimary(profiles.length === 0);
    setTermsAndConditions('');
    setErrorMsg('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogVisible(true);
  };

  const handleOpenEdit = (profile) => {
    setSelectedProfile(profile);
    setCompanyName(profile.company_name || '');
    setTradeName(profile.trade_name || '');
    setGstin(profile.gstin || '');
    setPanNo(profile.pan_no || '');
    setState(profile.state || 'Gujarat');
    setStateCode(profile.state_code || '24');
    setAddressLine1(profile.address_line_1 || '');
    setAddressLine2(profile.address_line_2 || '');
    setCity(profile.city || '');
    setPincode(profile.pincode || '');
    setPhone(profile.phone || '');
    setEmail(profile.email || '');
    setWebsite(profile.website || '');
    setBankName(profile.bank_name || '');
    setBankAccountNo(profile.bank_account_no || '');
    setBankIfsc(profile.bank_ifsc || '');
    setBankBranch(profile.bank_branch || '');
    setDefaultTruckNo(profile.default_truck_no || '');
    setIsPrimary(Boolean(profile.is_primary));
    setTermsAndConditions(profile.terms_and_conditions || '');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Company / Firm Name is required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const payload = {
        company_name: companyName.trim(),
        trade_name: tradeName.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan_no: panNo.trim().toUpperCase(),
        state: state.trim(),
        state_code: stateCode.trim(),
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        bank_name: bankName.trim(),
        bank_account_no: bankAccountNo.trim(),
        bank_ifsc: bankIfsc.trim().toUpperCase(),
        bank_branch: bankBranch.trim(),
        default_truck_no: defaultTruckNo.trim().toUpperCase(),
        is_primary: isPrimary,
        terms_and_conditions: termsAndConditions.trim(),
      };

      if (selectedProfile) {
        await companyProfileService.updateCompanyProfile(selectedProfile.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: `Company profile "${companyName}" updated successfully.`,
          life: 3000,
        });
      } else {
        await companyProfileService.createCompanyProfile(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: `Company profile "${companyName}" created successfully.`,
          life: 3000,
        });
      }

      setDialogVisible(false);
      fetchProfiles();
    } catch (err) {
      console.error('Failed to save company profile', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        'Error saving company profile.';
      setErrorMsg(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (profile) => {
    try {
      await companyProfileService.setPrimaryCompanyProfile(profile.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Primary Updated',
        detail: `"${profile.company_name}" set as primary default profile.`,
        life: 3000,
      });
      fetchProfiles();
    } catch (err) {
      console.error('Failed to set primary profile', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to set primary company profile.',
        life: 4000,
      });
    }
  };

  const handleConfirmDelete = (profile) => {
    setProfileToDelete(profile);
    setDeleteDialogVisible(true);
  };

  const executeDelete = async () => {
    if (!profileToDelete) return;
    try {
      setDeleting(true);
      await companyProfileService.deleteCompanyProfile(profileToDelete.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: `Company profile "${profileToDelete.company_name}" deleted.`,
        life: 3000,
      });
      setDeleteDialogVisible(false);
      if (dialogVisible) setDialogVisible(false);
      fetchProfiles();
    } catch (err) {
      console.error('Failed to delete company profile', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete company profile.',
        life: 4000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const primaryProfile = profiles.find((p) => p.is_primary) || profiles[0];

  // Mandatory Modal Footer Pattern:
  // Add: [Save] [Cancel]
  // Edit: [Update] [Cancel] ... [Delete]
  const dialogFooter = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          label={selectedProfile ? 'Update Profile' : 'Save Profile'}
          icon="pi pi-check"
          loading={saving}
          onClick={handleSave}
          className="p-button-primary"
        />
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => setDialogVisible(false)}
        />
      </div>

      {selectedProfile && (
        <Button
          label="Delete Profile"
          icon="pi pi-trash"
          className="p-button-danger p-button-outlined"
          onClick={() => {
            handleConfirmDelete(selectedProfile);
          }}
        />
      )}
    </div>
  );

  const actionBodyTemplate = (row) => (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
      {!row.is_primary && (
        <Button
          icon="pi pi-star"
          className="p-button-text p-button-sm"
          tooltip="Set as Primary Profile"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleSetPrimary(row)}
          style={{ width: '32px', height: '32px', padding: 0, color: 'var(--text-muted)' }}
        />
      )}
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm"
        tooltip="Edit Profile"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleOpenEdit(row)}
        style={{ width: '32px', height: '32px', padding: 0 }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger p-button-sm"
        tooltip="Delete Profile"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleConfirmDelete(row)}
        style={{ width: '32px', height: '32px', padding: 0 }}
      />
    </div>
  );

  return (
    <div className="settings-page-container" style={{ padding: '4px 0 24px 0' }}>
      <Toast ref={toast} />

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Company Profiles & Business Settings
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Configure business legal identity, GSTIN headers, bank accounts, and default bill invoice credentials.
            </p>
          </div>

          <Button
            label="Add Company Profile"
            icon="pi pi-plus"
            className="p-button-primary"
            onClick={handleOpenAdd}
            style={{ fontWeight: 600, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Primary Profile Highlight Banner */}
      {primaryProfile && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: '#18181b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                <i className="pi pi-building" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#09090b' }}>
                    {primaryProfile.company_name}
                  </span>
                  <Tag value="PRIMARY DEFAULT" severity="success" style={{ fontSize: '0.7rem' }} />
                </div>
                {primaryProfile.trade_name && (
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                    Trade Name: {primaryProfile.trade_name}
                  </span>
                )}
              </div>
            </div>

            <Button
              label="Edit Profile"
              icon="pi pi-pencil"
              className="p-button-outlined p-button-sm"
              onClick={() => handleOpenEdit(primaryProfile)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #f4f4f5',
              fontSize: '0.82rem',
            }}
          >
            <div>
              <span style={{ color: '#71717a', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                GSTIN & State
              </span>
              <strong style={{ color: '#09090b', fontFamily: 'monospace' }}>
                {primaryProfile.gstin || 'Unregistered'}
              </strong>
              <span style={{ color: '#71717a', display: 'block' }}>
                {primaryProfile.state} ({primaryProfile.state_code})
              </span>
            </div>

            <div>
              <span style={{ color: '#71717a', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Contact & Phone
              </span>
              <span style={{ color: '#09090b' }}>{primaryProfile.phone || '-'}</span>
              <span style={{ color: '#71717a', display: 'block' }}>{primaryProfile.email || '-'}</span>
            </div>

            <div>
              <span style={{ color: '#71717a', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Bank Settlement Account
              </span>
              <span style={{ color: '#09090b', fontWeight: 600 }}>{primaryProfile.bank_name || '-'}</span>
              <span style={{ color: '#71717a', display: 'block', fontFamily: 'monospace' }}>
                A/C: {primaryProfile.bank_account_no || '-'} ({primaryProfile.bank_ifsc || '-'})
              </span>
            </div>

            <div>
              <span style={{ color: '#71717a', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Registered Business Address
              </span>
              <span style={{ color: '#09090b' }}>
                {[primaryProfile.address_line_1, primaryProfile.city, primaryProfile.pincode].filter(Boolean).join(', ') || '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Profiles Data Table Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Table Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '360px' }}>
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, GSTIN, phone, city..."
              style={{ width: '100%' }}
            />
          </span>

          <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
            Total Profiles: <strong>{profiles.length}</strong>
          </span>
        </div>

        {/* DataTable */}
        <DataTable
          value={profiles}
          loading={loading}
          responsiveLayout="stack"
          breakpoint="960px"
          emptyMessage={
            <div style={{ padding: '36px', textAlign: 'center', color: '#71717a' }}>
              No company profiles registered. Click &quot;Add Company Profile&quot; to register your business entity.
            </div>
          }
          stripedRows
          size="small"
        >
          <Column
            header="Company / Firm"
            body={(row) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#09090b', fontSize: '0.9rem' }}>{row.company_name}</strong>
                  {row.is_primary && (
                    <Tag value="PRIMARY" severity="success" style={{ fontSize: '0.65rem' }} />
                  )}
                </div>
                {row.trade_name && (
                  <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Brand: {row.trade_name}</div>
                )}
              </div>
            )}
          />

          <Column
            header="GSTIN & PAN"
            body={(row) => (
              <div>
                {row.gstin ? (
                  <Tag value={row.gstin} severity="info" className="tabular-nums" style={{ fontFamily: 'monospace' }} />
                ) : (
                  <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Unregistered</span>
                )}
                {row.pan_no && (
                  <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '2px', fontFamily: 'monospace' }}>
                    PAN: {row.pan_no}
                  </div>
                )}
              </div>
            )}
          />

          <Column
            header="Location"
            body={(row) => (
              <div>
                <span style={{ color: '#09090b' }}>{row.city || row.state || '-'}</span>
                {row.state_code && (
                  <span style={{ color: '#71717a', fontSize: '0.75rem' }}> ({row.state_code})</span>
                )}
              </div>
            )}
          />

          <Column
            header="Contact"
            body={(row) => (
              <div style={{ fontSize: '0.8rem' }}>
                <div>{row.phone || '-'}</div>
                <div style={{ color: '#71717a' }}>{row.email || ''}</div>
              </div>
            )}
          />

          <Column
            header="Bank Details"
            body={(row) => (
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, color: '#09090b' }}>{row.bank_name || '-'}</span>
                {row.bank_account_no && (
                  <div style={{ color: '#71717a', fontFamily: 'monospace' }}>
                    A/C: {row.bank_account_no}
                  </div>
                )}
              </div>
            )}
          />

          <Column
            header="Default Truck"
            body={(row) => (
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {row.default_truck_no || '-'}
              </span>
            )}
          />

          <Column body={actionBodyTemplate} style={{ width: '130px', textAlign: 'right' }} />
        </DataTable>
      </div>

      {/* ======================================================== */}
      {/* Add / Edit Company Profile Modal Dialog                  */}
      {/* ======================================================== */}
      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-building" style={{ fontSize: '1.25rem', color: '#18181b' }} />
            <span style={{ fontWeight: 700 }}>
              {selectedProfile
                ? `Edit Company Profile: ${selectedProfile.company_name}`
                : 'Add New Company Profile'}
            </span>
          </div>
        }
        visible={dialogVisible}
        modal
        position="center"
        style={{ width: '840px', maxWidth: '96vw' }}
        breakpoints={{ '960px': '92vw', '640px': '98vw' }}
        footer={dialogFooter}
        onHide={() => setDialogVisible(false)}
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
      >
        {errorMsg && (
          <div
            style={{
              background: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              border: '1px solid var(--status-danger-border)',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '0.85rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Firm & Legal Identity */}
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              1. Firm Legal Identity & Tax Numbers
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Company / Firm Name *
                </label>
                <InputText
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. ELBAT Natural Stones Pvt. Ltd."
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Trade / Brand Name
                </label>
                <InputText
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="e.g. ELBAT Stone & Marble"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  GSTIN Number
                </label>
                <InputText
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  PAN Number
                </label>
                <InputText
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  placeholder="e.g. AAAAA0000A"
                  style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              2. Contact & Address Details
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Phone Number
                </label>
                <InputText
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Email Address
                </label>
                <InputText
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. billing@elbatstones.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Website URL
                </label>
                <InputText
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. www.elbatstones.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  State & Code
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                  <InputText
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    style={{ width: '100%' }}
                  />
                  <InputText
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="Code"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Address Line 1 (Street / Industrial Area)
                </label>
                <InputText
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Plot / Survey No, GIDC Estate"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Address Line 2 (Landmark / Area)
                </label>
                <InputText
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Near Highway / Ring Road"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  City
                </label>
                <InputText
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ahmedabad, Surat"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  PIN Code
                </label>
                <InputText
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 382415"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Banking & Logistics */}
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              3. Banking Credentials & Logistics Defaults
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Bank Name
                </label>
                <InputText
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, State Bank of India"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Account Number
                </label>
                <InputText
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="e.g. 50200012345678"
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  IFSC Code
                </label>
                <InputText
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Branch Name
                </label>
                <InputText
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="e.g. Odhav Branch, Ahmedabad"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  Default Truck / Vehicle Number
                </label>
                <InputText
                  value={defaultTruckNo}
                  onChange={(e) => setDefaultTruckNo(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ-01-AB-1234"
                  style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px' }}>
                <Checkbox
                  inputId="isPrimaryCheckbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.checked)}
                />
                <label htmlFor="isPrimaryCheckbox" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Set as Primary / Default Profile for Invoices
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Terms and Conditions */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Invoice Terms & Conditions (Prints at bottom of invoice)
            </label>
            <InputTextarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="e.g. 1. Goods once sold will not be returned. 2. Subject to local jurisdiction."
              rows={3}
              style={{ width: '100%' }}
            />
          </div>
        </form>
      </Dialog>

      {/* ======================================================== */}
      {/* Delete Confirmation Dialog                              */}
      {/* ======================================================== */}
      <Dialog
        header="Confirm Profile Deletion"
        visible={deleteDialogVisible}
        style={{ width: '420px', maxWidth: '96vw' }}
        breakpoints={{ '960px': '90vw', '640px': '98vw' }}
        position="center"
        modal
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setDeleteDialogVisible(false)}
            />
            <Button
              label="Delete Profile"
              icon="pi pi-trash"
              className="p-button-danger"
              loading={deleting}
              onClick={executeDelete}
            />
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--status-danger)' }} />
          <span>
            Are you sure you want to delete profile <strong>{profileToDelete?.company_name}</strong>?
          </span>
        </div>
      </Dialog>
    </div>
  );
}
