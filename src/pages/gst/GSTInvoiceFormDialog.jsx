import React, { useState, useEffect } from 'react';
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

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

/**
 * Replicate exact reverse calculation from legacy reference:
 * - Net Amount = Grand Total / (1 + GST% / 100)
 * - Single row:
 *     Total = Net Amount (frozen)
 *     Sqft = Net Amount / Price (frozen)
 * - Multiple rows (N >= 2):
 *     Rows 0 to N-2: Price and Total editable by user, Sqft = Total / Price (frozen)
 *     Last row (N-1): Absorbs remainder: Net Amount - sum(totals of rows 0..N-2)
 *                     Last Total (frozen), Last Sqft = Last Total / Last Price (frozen)
 */
function calculateDistribution(currentItems, grandTotalVal, rate) {
  const gt = parseFloat(grandTotalVal) || 0;
  const gstPercent = parseFloat(rate) || 0;
  const rowCount = currentItems.length;

  if (rowCount === 0) {
    return {
      newItems: [],
      netAmount: 0,
      gstAmount: 0,
      calculatedGrandTotal: 0,
      error: '',
    };
  }

  let prelimNetAmount = gt;
  if (gstPercent > 0 && gt > 0) {
    prelimNetAmount = round2(gt / (1 + gstPercent / 100));
  }

  const updatedItems = currentItems.map((item) => ({ ...item }));

  if (rowCount === 1) {
    const price = parseFloat(updatedItems[0].price) || 1;
    if (gt > 0 && price > 0) {
      const sqft = round2(prelimNetAmount / price);
      const productTotal = round2(sqft * price);
      updatedItems[0].quantity = sqft;
      updatedItems[0].total = productTotal;

      const gst = round2((productTotal * gstPercent) / 100);
      const finalGrandTotal = round2(productTotal + gst);
      return {
        newItems: updatedItems,
        netAmount: productTotal,
        gstAmount: gst,
        calculatedGrandTotal: finalGrandTotal,
        error: '',
      };
    } else {
      updatedItems[0].quantity = 0;
      updatedItems[0].total = 0;
      return {
        newItems: updatedItems,
        netAmount: 0,
        gstAmount: 0,
        calculatedGrandTotal: 0,
        error: '',
      };
    }
  }

  // rowCount >= 2
  let sumOthers = 0;
  for (let i = 0; i < rowCount - 1; i++) {
    const price = parseFloat(updatedItems[i].price) || 1;
    const enteredTotal = parseFloat(updatedItems[i].total) || 0;
    if (enteredTotal > 0 && price > 0) {
      const sqft = round2(enteredTotal / price);
      const productTotal = round2(sqft * price);
      updatedItems[i].quantity = sqft;
      updatedItems[i].total = productTotal;
      sumOthers += productTotal;
    } else {
      updatedItems[i].quantity = 0;
      updatedItems[i].total = enteredTotal;
    }
  }

  sumOthers = round2(sumOthers);

  const lastIndex = rowCount - 1;
  const lastPrice = parseFloat(updatedItems[lastIndex].price) || 1;
  const remaining = round2(prelimNetAmount - sumOthers);

  let validationError = '';
  if (sumOthers > prelimNetAmount + 0.01) {
    validationError = `Don't enter more than total-amount (actual amount: ₹${prelimNetAmount.toFixed(2)})`;
  }

  if (remaining > 0 && lastPrice > 0) {
    const lastSqft = round2(remaining / lastPrice);
    const lastProductTotal = round2(lastSqft * lastPrice);
    updatedItems[lastIndex].quantity = lastSqft;
    updatedItems[lastIndex].total = lastProductTotal;

    const actualNetAmount = round2(sumOthers + lastProductTotal);
    const gstAmount = round2((actualNetAmount * gstPercent) / 100);
    const calculatedGrandTotal = round2(actualNetAmount + gstAmount);

    return {
      newItems: updatedItems,
      netAmount: actualNetAmount,
      gstAmount: gstAmount,
      calculatedGrandTotal: calculatedGrandTotal,
      error: validationError,
    };
  } else {
    updatedItems[lastIndex].quantity = 0;
    updatedItems[lastIndex].total = remaining > 0 ? remaining : 0;
    const actualNetAmount = prelimNetAmount;
    const gstAmount = round2((actualNetAmount * gstPercent) / 100);
    return {
      newItems: updatedItems,
      netAmount: actualNetAmount,
      gstAmount: gstAmount,
      calculatedGrandTotal: round2(actualNetAmount + gstAmount),
      error: validationError,
    };
  }
}

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
  const [truckNo, setTruckNo] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [partyName, setPartyName] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [gstRatePercent, setGstRatePercent] = useState(18);
  const [isInterstate, setIsInterstate] = useState(false);

  // Amount & reverse calculation state
  const [grandTotal, setGrandTotal] = useState('');
  const [netAmount, setNetAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [productAmountError, setProductAmountError] = useState('');

  // Line items state
  const [items, setItems] = useState([
    { product_id: null, product_name: '', hsn_code: '', price: '1.00', quantity: 0, total: 0 },
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

  // Populate form if editing or reset for new
  useEffect(() => {
    if (invoice && visible) {
      setInvoiceNo(invoice.invoice_no || '');
      setInvoiceDate(invoice.invoice_date ? new Date(invoice.invoice_date) : new Date());
      const loadedTruckNo = invoice.truck_no || invoice.transport_detail?.truck_no || '';
      setTruckNo(loadedTruckNo);
      setSelectedPartyId(isSale ? invoice.customer?.id || invoice.customer : invoice.supplier?.id || invoice.supplier);
      setPartyName(invoice.party_name || '');
      setPartyAddress(invoice.party_address || '');
      setPartyGstin(invoice.party_gstin || '');
      const rate = Number(invoice.gst_rate_percent) || 18;
      setGstRatePercent(rate);
      setIsInterstate(Number(invoice.igst_amount) > 0);

      const gtVal = invoice.grand_total_amount ? Number(invoice.grand_total_amount).toFixed(2) : '';
      setGrandTotal(gtVal);

      if (invoice.items && invoice.items.length > 0) {
        const loadedItems = invoice.items.map((it) => {
          const p = round2(it.price) || 1;
          const q = round2(it.quantity) || 0;
          const tot = round2(it.amount) || round2(p * q);
          return {
            product_id: it.product?.id || it.product_id || it.product,
            product_name: it.product?.name || it.product_name || '',
            hsn_code: it.product_hsn || it.product?.hsn_code || it.hsn_code || '',
            price: p > 0 ? p.toFixed(2) : '1.00',
            quantity: q,
            total: tot,
          };
        });

        // Enforce exact distribution calculation matching legacy reference
        const dist = calculateDistribution(loadedItems, gtVal, rate);
        setItems(dist.newItems);
        setNetAmount(dist.netAmount);
        setGstAmount(dist.gstAmount);
        setProductAmountError(dist.error);
      } else {
        const initial = [{ product_id: null, product_name: '', hsn_code: '', price: '1.00', quantity: 0, total: 0 }];
        const dist = calculateDistribution(initial, gtVal, rate);
        setItems(dist.newItems);
        setNetAmount(dist.netAmount);
        setGstAmount(dist.gstAmount);
      }

      if (invoice.transport_detail) {
        setTransport({
          truck_no: loadedTruckNo,
          transporter_name: invoice.transport_detail.transporter_name || '',
          driver_name: invoice.transport_detail.driver_name || '',
          driver_phone: invoice.transport_detail.driver_phone || '',
          lr_no: invoice.transport_detail.lr_no || '',
          lr_date: invoice.transport_detail.lr_date ? new Date(invoice.transport_detail.lr_date) : null,
          freight_amount: Number(invoice.transport_detail.freight_amount) || 0,
          advance_paid: Number(invoice.transport_detail.advance_paid) || 0,
          notes: invoice.transport_detail.notes || '',
        });
      } else {
        setTransport({
          truck_no: loadedTruckNo,
          transporter_name: '',
          driver_name: '',
          driver_phone: '',
          lr_no: '',
          lr_date: null,
          freight_amount: 0,
          advance_paid: 0,
          notes: '',
        });
      }

      setPaymentStatus(invoice.payment_status || 'pending');
      setPaymentMethod(invoice.payment_method || 'cheque');
      setPaymentAmount(Number(invoice.payment_amount) || 0);
      setPaymentDate(invoice.payment_date ? new Date(invoice.payment_date) : null);
      setChequeNo(invoice.cheque_no || '');
    } else if (visible && !isEdit) {
      // Reset for new invoice creation
      setInvoiceDate(new Date());
      setTruckNo('');
      setSelectedPartyId(null);
      setPartyName('');
      setPartyAddress('');
      setPartyGstin('');
      setGstRatePercent(18);
      setIsInterstate(false);
      setGrandTotal('');
      setNetAmount(0);
      setGstAmount(0);
      setProductAmountError('');
      setItems([{ product_id: null, product_name: '', hsn_code: '', price: '1.00', quantity: 0, total: 0 }]);
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

  // Keep truck_no in sync between Bill Info and Transport Details
  const handleTruckNoChange = (val) => {
    const upper = val.toUpperCase();
    setTruckNo(upper);
    setTransport((prev) => ({ ...prev, truck_no: upper }));
  };

  // Grand Total change: live calculation
  const handleGrandTotalChange = (val) => {
    setGrandTotal(val);
    const dist = calculateDistribution(items, val, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  // Grand Total blur: format to 2 decimals
  const handleGrandTotalBlur = () => {
    const val = parseFloat(grandTotal) || 0;
    if (val > 0) {
      const dist = calculateDistribution(items, val, gstRatePercent);
      setGrandTotal(dist.calculatedGrandTotal > 0 ? dist.calculatedGrandTotal.toFixed(2) : val.toFixed(2));
      setItems(dist.newItems);
      setNetAmount(dist.netAmount);
      setGstAmount(dist.gstAmount);
      setProductAmountError(dist.error);
    }
  };

  // GST Rate selection change
  const handleGstRateChange = (newRate) => {
    setGstRatePercent(newRate);
    const dist = calculateDistribution(items, grandTotal, newRate);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  // Interstate checkbox change
  const handleInterstateChange = (checked) => {
    setIsInterstate(checked);
  };

  // Product selection handler
  const handleProductChange = (index, productId) => {
    const prod = Array.isArray(productsList) ? productsList.find((p) => p.id === productId) : null;
    let rate = gstRatePercent;
    if (prod && prod.gst_rate) {
      rate = prod.gst_rate;
      setGstRatePercent(rate);
    }

    const updated = items.map((it, idx) => {
      if (idx === index) {
        return {
          ...it,
          product_id: productId,
          product_name: prod ? prod.name : '',
          hsn_code: prod?.hsn_code || '',
        };
      }
      return it;
    });

    const dist = calculateDistribution(updated, grandTotal, rate);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  // Live price adjustment: updates sqft preview and recalculates distribution
  const handleItemPriceChange = (index, val) => {
    const updated = items.map((it, idx) => (idx === index ? { ...it, price: val } : it));
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  const handleItemPriceBlur = (index) => {
    const val = parseFloat(items[index]?.price) || 0;
    const formattedPrice = val > 0 ? val.toFixed(2) : '1.00';
    const updated = items.map((it, idx) => (idx === index ? { ...it, price: formattedPrice } : it));
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  // User enters total on non-last row: recalculates sqft and last row remaining
  const handleItemTotalChange = (index, val) => {
    const updated = items.map((it, idx) => (idx === index ? { ...it, total: val } : it));
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  const handleItemTotalBlur = (index) => {
    const val = parseFloat(items[index]?.total) || 0;
    const formattedTotal = val > 0 ? val.toFixed(2) : '0.00';
    const updated = items.map((it, idx) => (idx === index ? { ...it, total: formattedTotal } : it));
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  const addItemRow = () => {
    const updated = [
      ...items,
      { product_id: null, product_name: '', hsn_code: '', price: '1.00', quantity: 0, total: 0 },
    ];
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, idx) => idx !== index);
    const dist = calculateDistribution(updated, grandTotal, gstRatePercent);
    setItems(dist.newItems);
    setNetAmount(dist.netAmount);
    setGstAmount(dist.gstAmount);
    setProductAmountError(dist.error);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!partyName.trim()) {
      setErrorMsg(`Please specify the ${isSale ? 'Customer' : 'Supplier'} Name.`);
      return;
    }

    const gtVal = parseFloat(grandTotal) || 0;
    if (gtVal <= 0) {
      setErrorMsg('Please enter a Grand Total amount.');
      return;
    }

    if (productAmountError) {
      setErrorMsg(productAmountError);
      return;
    }

    const validItems = items.filter(
      (it) => it.product_id && (parseFloat(it.price) || 0) > 0 && (parseFloat(it.quantity) || 0) > 0
    );

    if (validItems.length === 0) {
      setErrorMsg('Please add at least one product with a valid name, price, and total.');
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
          price: round2(it.price),
          quantity: round2(it.quantity),
        })),
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_amount: Number(paymentAmount) || 0,
        payment_date: paymentDate ? paymentDate.toISOString().split('T')[0] : null,
        cheque_no: chequeNo.trim(),
        transport:
          truckNo.trim() || transport.transporter_name.trim() || transport.driver_name.trim()
            ? {
                truck_no: truckNo.trim(),
                transporter_name: transport.transporter_name.trim(),
                driver_name: transport.driver_name.trim(),
                driver_phone: transport.driver_phone.trim(),
                lr_no: transport.lr_no.trim(),
                lr_date: transport.lr_date ? transport.lr_date.toISOString().split('T')[0] : null,
                freight_amount: Number(transport.freight_amount) || 0,
                advance_paid: Number(transport.advance_paid) || 0,
                notes: transport.notes.trim(),
              }
            : null,
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

  // Footer adheres strictly to AGENTS.md conventions:
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
          label={isEdit ? 'Update GST Bill' : 'Save GST Bill'}
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
      modal
      position="center"
      style={{ width: '1020px', maxWidth: '96vw' }}
      breakpoints={{ '960px': '92vw', '640px': '98vw' }}
      footer={dialogFooter}
      onHide={onHide}
      className="gst-invoice-form-dialog"
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
            fontSize: '0.875rem',
          }}
        >
          <i className="pi pi-exclamation-triangle" style={{ marginRight: '8px' }} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
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

        {/* Section 1: Bill & Customer Information */}
        <div className="gst-invoice-grid-4">
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Invoice Number
            </label>
            <InputText
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="Auto-generated if empty"
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
              Truck Number
            </label>
            <InputText
              value={truckNo}
              onChange={(e) => handleTruckNoChange(e.target.value)}
              placeholder="e.g. GJ05MX9164"
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

        {/* Section 2: Products Table with Frozen Sqft & Reverse Calculation */}
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
              Products
            </span>
            <Button
              type="button"
              label="+ Add Product"
              icon="pi pi-plus"
              className="p-button-sm p-button-outlined"
              onClick={addItemRow}
            />
          </div>

          <div style={{ padding: '10px', overflowX: 'auto' }}>
            <table
              id="productsTable"
              style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.875rem' }}
            >
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', width: '35px' }}>#</th>
                  <th style={{ padding: '8px', minWidth: '220px' }}>Product Name *</th>
                  <th style={{ padding: '8px', width: '120px' }}>HSN Code</th>
                  <th style={{ padding: '8px', width: '130px' }}>Sqft (Qty)</th>
                  <th style={{ padding: '8px', width: '120px', textAlign: 'right' }}>Price (₹) *</th>
                  <th style={{ padding: '8px', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isSingleRow = items.length === 1;
                  const isLastRow = idx === items.length - 1;
                  const isTotalReadOnly = isSingleRow || isLastRow;

                  return (
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
                        <InputText
                          value={item.hsn_code || ''}
                          readOnly
                          tabIndex={-1}
                          style={{
                            width: '100%',
                            backgroundColor: '#e9ecef',
                            cursor: 'not-allowed',
                            color: '#64748b',
                          }}
                          placeholder="HSN"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        {/* Frozen Sqft field */}
                        <InputText
                          value={
                            item.quantity !== undefined && item.quantity !== ''
                              ? Number(item.quantity).toFixed(2)
                              : '0.00'
                          }
                          readOnly
                          tabIndex={-1}
                          style={{
                            width: '100%',
                            backgroundColor: '#e9ecef',
                            cursor: 'not-allowed',
                            fontWeight: 600,
                            color: '#1e293b',
                            textAlign: 'right',
                          }}
                          className="tabular-nums product-quantity"
                          placeholder="0.00"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <InputText
                          type="number"
                          step="any"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                          onBlur={() => handleItemPriceBlur(idx)}
                          style={{ width: '100%', textAlign: 'right' }}
                          className="tabular-nums product-price"
                          placeholder="0.00"
                          required
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        {isTotalReadOnly ? (
                          <InputText
                            value={
                              item.total !== undefined && item.total !== ''
                                ? Number(item.total).toFixed(2)
                                : '0.00'
                            }
                            readOnly
                            tabIndex={-1}
                            style={{
                              width: '100%',
                              backgroundColor: '#e9ecef',
                              cursor: 'not-allowed',
                              fontWeight: 600,
                              color: '#1e293b',
                              textAlign: 'right',
                            }}
                            className="tabular-nums product-total"
                            placeholder="0.00"
                          />
                        ) : (
                          <InputText
                            type="number"
                            step="any"
                            min="0"
                            value={item.total}
                            onChange={(e) => handleItemTotalChange(idx, e.target.value)}
                            onBlur={() => handleItemTotalBlur(idx)}
                            style={{ width: '100%', textAlign: 'right' }}
                            className="tabular-nums product-total"
                            placeholder="0.00"
                            required
                          />
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Amount Details (Reverse Calculation Driver) */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
            Amount Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                Grand Total (GST Inclusive) <span style={{ color: 'red' }}>*</span>
              </label>
              <InputText
                type="number"
                step="any"
                min="0"
                value={grandTotal}
                onChange={(e) => handleGrandTotalChange(e.target.value)}
                onBlur={handleGrandTotalBlur}
                placeholder="Enter Grand Total (e.g. 50000)"
                style={{ width: '100%', fontWeight: 700, fontSize: '1rem' }}
                className="tabular-nums"
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Enter amount, then calculated as Net Amount + GST Amount
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                Net Amount (Auto-calculated)
              </label>
              <InputText
                value={`₹${Number(netAmount).toFixed(2)}`}
                readOnly
                tabIndex={-1}
                style={{ width: '100%', backgroundColor: '#e9ecef', cursor: 'not-allowed', fontWeight: 700 }}
                className="tabular-nums"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Net Amount = Sqft × Price
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                GST Amount (Auto-calculated)
              </label>
              <InputText
                value={`₹${Number(gstAmount).toFixed(2)}`}
                readOnly
                tabIndex={-1}
                style={{ width: '100%', backgroundColor: '#e9ecef', cursor: 'not-allowed', fontWeight: 700 }}
                className="tabular-nums"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Auto-calculated: Net Amount × GST%
              </small>
            </div>
          </div>

          {productAmountError && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>
              <i className="pi pi-exclamation-circle" style={{ marginRight: '6px' }} />
              {productAmountError}
            </div>
          )}
        </div>

        {/* Section 4: GST Configuration & Rates */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--primary-container)',
            padding: '12px 16px',
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
                onChange={(e) => handleGstRateChange(e.value)}
                style={{ width: '220px', maxWidth: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Checkbox
                inputId="is_interstate_cb"
                checked={isInterstate}
                onChange={(e) => handleInterstateChange(e.checked)}
              />
              <label
                htmlFor="is_interstate_cb"
                style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Interstate Transaction (IGST {gstRatePercent}%)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.85rem' }}>
            {!isInterstate ? (
              <>
                <span style={{ color: 'var(--text-muted)' }}>
                  SGST: <strong>{(gstRatePercent / 2).toFixed(1)}%</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  CGST: <strong>{(gstRatePercent / 2).toFixed(1)}%</strong>
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                IGST: <strong>{gstRatePercent.toFixed(1)}%</strong>
              </span>
            )}
          </div>
        </div>

        {/* Section 5: Transport & Logistics (Expandable Accordion) */}
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
                  value={truckNo}
                  onChange={(e) => handleTruckNoChange(e.target.value)}
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
                  LR / Bilty Date
                </label>
                <Calendar
                  value={transport.lr_date}
                  onChange={(e) => setTransport({ ...transport, lr_date: e.value })}
                  dateFormat="dd-mm-yy"
                  showIcon
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

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Transport Remarks / Route
                </label>
                <InputText
                  value={transport.notes}
                  onChange={(e) => setTransport({ ...transport, notes: e.target.value })}
                  placeholder="Destination, delivery notes..."
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        {/* Section 6: Payment & Totals Summary */}
        <div className="gst-invoice-bottom-grid">
          {/* Payment Details */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Payment Information
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
                  Payment Date
                </label>
                <Calendar
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.value)}
                  dateFormat="dd-mm-yy"
                  showIcon
                  style={{ width: '100%' }}
                />
              </div>

              {paymentMethod === 'cheque' && (
                <div style={{ gridColumn: 'span 2' }}>
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
              )}
            </div>
          </div>

          {/* Calculations Summary Card */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Tax & Invoice Totals
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Amount (Taxable):</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                ₹{formatINR(netAmount)}
              </span>
            </div>

            {!isInterstate ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CGST ({(gstRatePercent / 2).toFixed(1)}%):</span>
                  <span className="tabular-nums">₹{formatINR(round2(gstAmount / 2))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SGST ({(gstRatePercent / 2).toFixed(1)}%):</span>
                  <span className="tabular-nums">₹{formatINR(round2(gstAmount / 2))}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IGST ({gstRatePercent.toFixed(1)}%):</span>
                <span className="tabular-nums">₹{formatINR(gstAmount)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Total Tax:</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>
                ₹{formatINR(gstAmount)}
              </span>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Grand Total:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                ₹{formatINR(round2(netAmount + gstAmount))}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
