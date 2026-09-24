import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Accordion, AccordionTab } from 'primereact/accordion';
import gstService from '../../services/gstService';
import { formatINR } from '../../utils/formatters';

const DEFAULT_GST_RATES = [
  { label: '18% GST (Standard Stone)', value: 18 },
  { label: '5% GST (Rough/Quarry)', value: 5 },
  { label: '12% GST (Processed Tiles)', value: 12 },
  { label: '28% GST (Luxury Slab)', value: 28 },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid in Full', value: 'paid' },
  { label: 'Partial Payment', value: 'partial' },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cheque', value: 'cheque' },
  { label: 'Online / Bank Transfer', value: 'online' },
  { label: 'Cash', value: 'cash' },
];

export default function GSTInvoiceFormDialog({
  visible,
  invoice,
  invoiceType = 'sale',
  onHide,
  onSave,
  onDelete,
}) {
  const isEdit = Boolean(invoice && invoice.id);
  const [currentType, setCurrentType] = useState(invoice?.invoice_type || (invoiceType === 'purchase' ? 'purchase' : 'sale'));
  const isSale = currentType === 'sale';

  // Form State
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [partyName, setPartyName] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [gstRatePercent, setGstRatePercent] = useState(18);
  const [isInterstate, setIsInterstate] = useState(false);

  // Line items state
  const [items, setItems] = useState([
    { product_id: null, product_name: '', price: 0, quantity: 1, amount: 0 },
  ]);

  // Transport details
  const [transport, setTransport] = useState({
    truck_no: '',
    transporter_name: '',
    driver_name: '',
    driver_phone: '',
    lr_no: '',
    lr_date: null,
    freight_amount: 0,
    advance_paid: 0,
    notes: '',
  });

  // Payment details
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState('cheque');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(null);
  const [chequeNo, setChequeNo] = useState('');

  // Auxiliary data
  const [partiesList, setPartiesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize currentType when invoice or invoiceType prop changes
  useEffect(() => {
    if (visible) {
      if (invoice && invoice.id) {
        setCurrentType(invoice.invoice_type || 'sale');
      } else {
        setCurrentType(invoiceType === 'purchase' ? 'purchase' : 'sale');
      }
    }
  }, [visible, invoice, invoiceType]);

  const handleTypeChange = (newType) => {
    if (newType === currentType || isEdit) return;
    setCurrentType(newType);
    setSelectedPartyId(null);
    setPartyName('');
    setPartyAddress('');
    setPartyGstin('');
  };

  // Fetch parties and products master
  useEffect(() => {
    if (!visible) return;

    const extractList = (res) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.results)) return res.results;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.data?.results)) return res.data.results;
      return [];
    };

    let isCancelled = false;

    const loadData = async () => {
      setErrorMsg('');
      try {
        const [partiesRes, productsRes] = await Promise.all([
          currentType === 'sale' ? gstService.getCustomers() : gstService.getSuppliers(),
          gstService.getProducts(),
        ]);
        if (isCancelled) return;
        setPartiesList(extractList(partiesRes));
        setProductsList(extractList(productsRes));

        if (!isEdit) {
          // Fetch next auto invoice number for currentType
          try {
            const nextRes = await gstService.getNextInvoiceNo(currentType);
            if (!isCancelled && nextRes?.next_invoice_no) {
              setInvoiceNo(nextRes.next_invoice_no);
            }
          } catch (e) {
            console.error('Failed to get next invoice no', e);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load initial data', err);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [visible, currentType, isEdit]);

  // Populate form if editing
  useEffect(() => {
    if (invoice && visible) {
      setInvoiceNo(invoice.invoice_no || '');
      setInvoiceDate(invoice.invoice_date ? new Date(invoice.invoice_date) : new Date());
      setSelectedPartyId(isSale ? invoice.customer?.id || invoice.customer : invoice.supplier?.id || invoice.supplier);
      setPartyName(invoice.party_name || '');
      setPartyAddress(invoice.party_address || '');
      setPartyGstin(invoice.party_gstin || '');
      setGstRatePercent(Number(invoice.gst_rate_percent) || 18);
      setIsInterstate(Number(invoice.igst_amount) > 0);

      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((it) => ({
            product_id: it.product?.id || it.product_id || it.product,
            product_name: it.product?.name || it.product_name || '',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 0,
            amount: Number(it.amount) || 0,
          }))
        );
      } else {
        setItems([{ product_id: null, product_name: '', price: 0, quantity: 1, amount: 0 }]);
      }

      if (invoice.transport_detail) {
        setTransport({
          truck_no: invoice.transport_detail.truck_no || '',
          transporter_name: invoice.transport_detail.transporter_name || '',
          driver_name: invoice.transport_detail.driver_name || '',
          driver_phone: invoice.transport_detail.driver_phone || '',
          lr_no: invoice.transport_detail.lr_no || '',
          lr_date: invoice.transport_detail.lr_date ? new Date(invoice.transport_detail.lr_date) : null,
          freight_amount: Number(invoice.transport_detail.freight_amount) || 0,
          advance_paid: Number(invoice.transport_detail.advance_paid) || 0,
          notes: invoice.transport_detail.notes || '',
        });
      }

      setPaymentStatus(invoice.payment_status || 'pending');
      setPaymentMethod(invoice.payment_method || 'cheque');
      setPaymentAmount(Number(invoice.payment_amount) || 0);
      setPaymentDate(invoice.payment_date ? new Date(invoice.payment_date) : null);
      setChequeNo(invoice.cheque_no || '');
    } else if (visible && !isEdit) {
      // Reset for new creation
      setInvoiceDate(new Date());
      setSelectedPartyId(null);
      setPartyName('');
      setPartyAddress('');
      setPartyGstin('');
      setGstRatePercent(18);
      setIsInterstate(false);
      setItems([{ product_id: null, product_name: '', price: 0, quantity: 1, amount: 0 }]);
      setTransport({
        truck_no: '',
        transporter_name: '',
        driver_name: '',
        driver_phone: '',
        lr_no: '',
        lr_date: null,
        freight_amount: 0,
        advance_paid: 0,
        notes: '',
      });
      setPaymentStatus('pending');
      setPaymentMethod('cheque');
      setPaymentAmount(0);
      setPaymentDate(null);
      setChequeNo('');
    }
  }, [invoice, visible, isEdit, isSale]);

  // Handle party selection
  const handlePartyChange = (e) => {
    const partyId = e.value;
    setSelectedPartyId(partyId);
    const selected = Array.isArray(partiesList) ? partiesList.find((p) => p.id === partyId) : null;
    if (selected) {
      setPartyName(selected.name || '');
      setPartyAddress(selected.address || '');
      setPartyGstin(selected.gst_number || '');
    }
  };

  // Line item handlers
  const handleProductChange = (index, productId) => {
    const newItems = [...items];
    const prod = Array.isArray(productsList) ? productsList.find((p) => p.id === productId) : null;
    newItems[index].product_id = productId;
    newItems[index].product_name = prod ? prod.name : '';
    if (prod && prod.gst_rate) {
      setGstRatePercent(prod.gst_rate);
    }
    setItems(newItems);
  };

  const handleItemFieldChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    const price = Number(newItems[index].price) || 0;
    const qty = Number(newItems[index].quantity) || 0;
    newItems[index].amount = Number((price * qty).toFixed(2));
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: null, product_name: '', price: 0, quantity: 1, amount: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Real-time calculation totals
  const totals = useMemo(() => {
    const taxableSubtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const rateFactor = gstRatePercent / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = Number((taxableSubtotal * rateFactor).toFixed(2));
    } else {
      cgst = Number(((taxableSubtotal * rateFactor) / 2).toFixed(2));
      sgst = Number(((taxableSubtotal * rateFactor) / 2).toFixed(2));
    }

    const totalTax = cgst + sgst + igst;
    const grandTotal = Number((taxableSubtotal + totalTax).toFixed(2));

    return {
      taxableSubtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal,
    };
  }, [items, gstRatePercent, isInterstate]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!partyName.trim()) {
      setErrorMsg(`Please specify the ${isSale ? 'Customer' : 'Supplier'} Name.`);
      return;
    }

    const validItems = items.filter((it) => it.product_id && it.price > 0 && it.quantity > 0);
    if (validItems.length === 0) {
      setErrorMsg('Please add at least one line item with a product, rate, and quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoice_type: currentType,
        invoice_date: invoiceDate ? invoiceDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customer_id: isSale ? selectedPartyId : null,
        supplier_id: !isSale ? selectedPartyId : null,
        party_name: partyName.trim(),
        party_address: partyAddress.trim(),
        party_gstin: partyGstin.trim(),
        gst_rate_percent: gstRatePercent,
        is_interstate: isInterstate,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          price: it.price,
          quantity: it.quantity,
        })),
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_amount: paymentAmount || 0,
        payment_date: paymentDate ? paymentDate.toISOString().split('T')[0] : null,
        cheque_no: chequeNo.trim(),
        transport: transport.truck_no || transport.transporter_name ? {
          truck_no: transport.truck_no.trim(),
          transporter_name: transport.transporter_name.trim(),
          driver_name: transport.driver_name.trim(),
          driver_phone: transport.driver_phone.trim(),
          lr_no: transport.lr_no.trim(),
          lr_date: transport.lr_date ? transport.lr_date.toISOString().split('T')[0] : null,
          freight_amount: transport.freight_amount || 0,
          advance_paid: transport.advance_paid || 0,
          notes: transport.notes.trim(),
        } : null,
      };

      if (isEdit) {
        await gstService.updateInvoice(invoice.id, payload);
      } else {
        await gstService.createInvoice(payload);
      }

      onSave();
      onHide();
    } catch (err) {
      console.error('Failed to save invoice', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save invoice.');
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // Footer adheres to mandatory convention:
  // Edit modals: [Update/Save] [Cancel]  (me-auto) ······ [Delete] (right)
  // Add modals: [Save] [Cancel] (me-auto)
  const dialogFooter = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          label={isEdit ? 'Update Invoice' : 'Save Invoice'}
          icon="pi pi-check"
          loading={submitting}
          onClick={handleSubmit}
          className="p-button-primary"
        />
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      </div>
      {isEdit && onDelete && (
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger p-button-outlined"
          onClick={() => onDelete(invoice)}
        />
      )}
    </div>
  );

  return (
    <Dialog
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="pi pi-receipt" style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }} />
          <span style={{ fontWeight: 700 }}>
            {isEdit
              ? `Edit ${isSale ? 'Sale Tax Invoice' : 'Purchase Tax Invoice'} #${invoiceNo}`
              : `Create New ${isSale ? 'Sale Tax Invoice' : 'Purchase Tax Invoice'}`}
          </span>
        </div>
      }
      visible={visible}
      style={{ width: '1000px', maxWidth: '96vw' }}
      footer={dialogFooter}
      onHide={onHide}
      className="gst-invoice-form-dialog"
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
            fontSize: '0.875rem',
          }}
        >
          <i className="pi pi-exclamation-triangle" style={{ marginRight: '8px' }} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Transaction Type Segmented Switcher */}
        <div
          style={{
            background: isSale ? '#eff6ff' : '#fffbeb',
            border: isSale ? '1px solid #bfdbfe' : '1px solid #fde68a',
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Invoice Type:</span>
              <span style={{ color: isSale ? 'var(--primary-color)' : '#b45309', fontWeight: 800 }}>
                {isSale ? 'SALE TAX INVOICE (OUTWARD)' : 'PURCHASE TAX INVOICE (INWARD)'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isSale
                ? 'Outward billing to registered buyer or unregistered customer (Series S-xxxx)'
                : 'Inward purchase from quarry supplier or vendor (Series P-xxxx)'}
            </div>
          </div>
          {!isEdit && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                label="Sale Bill"
                icon="pi pi-arrow-up-right"
                size="small"
                className={isSale ? 'p-button-primary' : 'p-button-outlined p-button-secondary'}
                onClick={() => handleTypeChange('sale')}
              />
              <Button
                type="button"
                label="Purchase Bill"
                icon="pi pi-arrow-down-left"
                size="small"
                className={!isSale ? 'p-button-warning' : 'p-button-outlined p-button-secondary'}
                onClick={() => handleTypeChange('purchase')}
              />
            </div>
          )}
        </div>

        {/* Section 1: Header & Party Details */}
        <div className="gst-invoice-grid-4">
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Invoice Number
            </label>
            <InputText
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="e.g. GST-2024-001"
              style={{ width: '100%' }}
              disabled={isEdit}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Invoice Date *
            </label>
            <Calendar
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.value)}
              dateFormat="dd-mm-yy"
              showIcon
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Select Registered {isSale ? 'Customer' : 'Supplier'}
            </label>
            <Dropdown
              value={selectedPartyId}
              options={Array.isArray(partiesList) ? partiesList : []}
              optionLabel="name"
              optionValue="id"
              onChange={handlePartyChange}
              placeholder={`Choose ${isSale ? 'Customer' : 'Supplier'}...`}
              filter
              showClear
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              GSTIN Number
            </label>
            <InputText
              value={partyGstin}
              onChange={(e) => setPartyGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 24AAAAA0000A1Z5"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="gst-party-fields-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Party / Billed Name *
            </label>
            <InputText
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Firm or Individual Name"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Billing / Delivery Address
            </label>
            <InputText
              value={partyAddress}
              onChange={(e) => setPartyAddress(e.target.value)}
              placeholder="Street, City, State, PIN"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* GST Configuration Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--primary-container)',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #dbeafe',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                GST Rate:
              </span>
              <Dropdown
                value={gstRatePercent}
                options={DEFAULT_GST_RATES}
                onChange={(e) => setGstRatePercent(e.value)}
                style={{ width: '220px', maxWidth: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Checkbox
                inputId="is_interstate_cb"
                checked={isInterstate}
                onChange={(e) => setIsInterstate(e.checked)}
              />
              <label
                htmlFor="is_interstate_cb"
                style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Interstate Transaction (IGST {gstRatePercent}%)
              </label>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
            {isInterstate
              ? `IGST: ${gstRatePercent}% applied`
              : `CGST: ${gstRatePercent / 2}% + SGST: ${gstRatePercent / 2}% applied`}
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '10px 14px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Invoice Items & Stone Measurements
            </span>
            <Button
              type="button"
              label="Add Item Row"
              icon="pi pi-plus"
              className="p-button-sm p-button-outlined"
              onClick={addItemRow}
            />
          </div>

          <div style={{ padding: '10px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', width: '40px' }}>#</th>
                  <th style={{ padding: '8px' }}>Product / Stone Type *</th>
                  <th style={{ padding: '8px', width: '150px' }}>Rate (₹/Sq.Ft) *</th>
                  <th style={{ padding: '8px', width: '140px' }}>Quantity *</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '150px' }}>Taxable Amount</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ padding: '8px' }}>
                      <Dropdown
                        value={item.product_id}
                        options={Array.isArray(productsList) ? productsList : []}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => handleProductChange(idx, e.value)}
                        placeholder="Select stone product..."
                        filter
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <InputNumber
                        value={item.price}
                        onValueChange={(e) => handleItemFieldChange(idx, 'price', e.value || 0)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        placeholder="0.00"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <InputNumber
                        value={item.quantity}
                        onValueChange={(e) => handleItemFieldChange(idx, 'quantity', e.value || 0)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        placeholder="1.00"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }} className="tabular-nums">
                      ₹{formatINR(item.amount)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        className="p-button-danger p-button-text p-button-sm"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length <= 1}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Transport & Logistics (Expandable) */}
        <Accordion>
          <AccordionTab
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="pi pi-truck" style={{ color: 'var(--primary-color)' }} />
                <span>Transport, Truck & Bilty Logistics (Optional)</span>
              </div>
            }
          >
            <div className="gst-transport-fields-grid" style={{ marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Truck / Vehicle Number
                </label>
                <InputText
                  value={transport.truck_no}
                  onChange={(e) => setTransport({ ...transport, truck_no: e.target.value.toUpperCase() })}
                  placeholder="e.g. GJ-01-AB-1234"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Transporter Company
                </label>
                <InputText
                  value={transport.transporter_name}
                  onChange={(e) => setTransport({ ...transport, transporter_name: e.target.value })}
                  placeholder="Transporter name"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Driver Name
                </label>
                <InputText
                  value={transport.driver_name}
                  onChange={(e) => setTransport({ ...transport, driver_name: e.target.value })}
                  placeholder="Driver name"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Driver Phone Number
                </label>
                <InputText
                  value={transport.driver_phone}
                  onChange={(e) => setTransport({ ...transport, driver_phone: e.target.value })}
                  placeholder="10-digit mobile"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  LR / Bilty Number
                </label>
                <InputText
                  value={transport.lr_no}
                  onChange={(e) => setTransport({ ...transport, lr_no: e.target.value })}
                  placeholder="LR number"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Freight Amount (₹)
                </label>
                <InputNumber
                  value={transport.freight_amount}
                  onValueChange={(e) => setTransport({ ...transport, freight_amount: e.value || 0 })}
                  mode="decimal"
                  minFractionDigits={2}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Advance Paid to Driver (₹)
                </label>
                <InputNumber
                  value={transport.advance_paid}
                  onValueChange={(e) => setTransport({ ...transport, advance_paid: e.value || 0 })}
                  mode="decimal"
                  minFractionDigits={2}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Transport Remarks / Route
                </label>
                <InputText
                  value={transport.notes}
                  onChange={(e) => setTransport({ ...transport, notes: e.target.value })}
                  placeholder="Destination, notes..."
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        {/* Section 4: Payment & Bottom Calculation Summary */}
        <div className="gst-invoice-bottom-grid">
          {/* Payment Details */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Payment & Settlement
            </div>
            <div className="gst-payment-fields-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Status
                </label>
                <Dropdown
                  value={paymentStatus}
                  options={PAYMENT_STATUS_OPTIONS}
                  onChange={(e) => setPaymentStatus(e.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Payment Mode
                </label>
                <Dropdown
                  value={paymentMethod}
                  options={PAYMENT_METHOD_OPTIONS}
                  onChange={(e) => setPaymentMethod(e.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Amount Paid (₹)
                </label>
                <InputNumber
                  value={paymentAmount}
                  onValueChange={(e) => setPaymentAmount(e.value || 0)}
                  mode="decimal"
                  minFractionDigits={2}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Cheque / UTR Ref No
                </label>
                <InputText
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  placeholder="Cheque / UTR number"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Calculations Summary Card */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Tax & Invoice Totals
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxable Subtotal:</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{formatINR(totals.taxableSubtotal)}</span>
            </div>

            {!isInterstate ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CGST ({gstRatePercent / 2}%):</span>
                  <span className="tabular-nums">₹{formatINR(totals.cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SGST ({gstRatePercent / 2}%):</span>
                  <span className="tabular-nums">₹{formatINR(totals.sgst)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IGST ({gstRatePercent}%):</span>
                <span className="tabular-nums">₹{formatINR(totals.igst)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Total Tax:</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{formatINR(totals.totalTax)}</span>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Grand Total:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                ₹{formatINR(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
