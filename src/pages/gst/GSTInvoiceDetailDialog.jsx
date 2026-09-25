import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { formatINR, formatDate } from '../../utils/formatters';
import { gstService } from '../../services/gstService';
import { companyProfileService } from '../../services/companyProfileService';

export default function GSTInvoiceDetailDialog({ visible, invoice, onHide, onEdit }) {
  const [printing, setPrinting] = useState(false);
  const [fetchedCompany, setFetchedCompany] = useState(null);

  useEffect(() => {
    if (visible && !invoice?.company_profile) {
      companyProfileService.getPrimaryCompanyProfile().then((data) => {
        if (data) setFetchedCompany(data);
      }).catch(() => {});
    }
  }, [visible, invoice]);

  if (!invoice) return null;

  const company = invoice.company_profile || fetchedCompany;
  const isSale = invoice.invoice_type === 'sale';
  const partyTitle = isSale ? 'Buyer / Bill To' : 'Supplier / Vendor';

  const getStatusSeverity = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'pending':
      default:
        return 'danger';
    }
  };

  const handlePrint = async () => {
    if (!invoice?.id) return;
    setPrinting(true);
    try {
      const blob = await gstService.printInvoice(invoice.id);
      gstService.openPdfBlob(blob, `GST_Bill_${invoice.invoice_no}.pdf`);
    } catch (err) {
      console.error('Failed to print GST invoice', err);
    } finally {
      setPrinting(false);
    }
  };

  const footerContent = (
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
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          label="Print Tax Invoice"
          icon="pi pi-print"
          className="p-button-outlined"
          onClick={handlePrint}
          loading={printing}
        />
        {onEdit && (
          <Button
            label="Edit Invoice"
            icon="pi pi-pencil"
            className="p-button-secondary p-button-outlined"
            onClick={() => {
              onHide();
              onEdit(invoice);
            }}
          />
        )}
      </div>
      <Button label="Close" icon="pi pi-times" onClick={onHide} className="p-button-text" />
    </div>
  );

  return (
    <Dialog
      header={
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <i className="pi pi-file" style={{ fontSize: '1.25rem', color: isSale ? 'var(--primary-color)' : '#d97706' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {isSale ? 'Tax Invoice' : 'Purchase Tax Invoice'} #{invoice.invoice_no}
              </span>
              <Tag
                value={isSale ? 'SALE (OUTWARD)' : 'PURCHASE (INWARD)'}
                severity={isSale ? 'info' : 'warning'}
                style={{ fontSize: '0.7rem' }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Date: {formatDate(invoice.invoice_date)}
            </span>
          </div>
          <Tag
            value={(invoice.payment_status || 'PENDING').toUpperCase()}
            severity={getStatusSeverity(invoice.payment_status)}
            style={{ marginLeft: 'auto' }}
          />
        </div>
      }
      visible={visible}
      modal
      position="center"
      style={{ width: '900px', maxWidth: '96vw' }}
      breakpoints={{ '960px': '92vw', '640px': '98vw' }}
      footer={footerContent}
      onHide={onHide}
      className="gst-invoice-detail-dialog"
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
    >
      <div style={{ padding: '8px 4px' }}>
        {/* Top Information Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Company Details Box */}
          {company && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                {isSale ? 'Billed From (Seller)' : 'Billed To (Buyer)'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {company.company_name}
              </div>
              {company.gstin && (
                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  GSTIN: <span className="tabular-nums">{company.gstin}</span>
                </div>
              )}
              {company.pan_no && (
                <div style={{ marginTop: '2px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  PAN: <span className="tabular-nums">{company.pan_no}</span>
                </div>
              )}
              {(company.address_line_1 || company.city) && (
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {[company.address_line_1, company.address_line_2, company.city ? `${company.city} - ${company.pincode || ''}` : '', company.state].filter(Boolean).join(', ')}
                </div>
              )}
              {company.phone && (
                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Phone: <span className="tabular-nums">{company.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Party Box */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              {partyTitle}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {invoice.party_name || (isSale ? invoice.customer?.name : invoice.supplier?.name) || 'Cash / Unregistered'}
            </div>
            {invoice.party_gstin && (
              <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                GSTIN: <span className="tabular-nums">{invoice.party_gstin}</span>
              </div>
            )}
            {invoice.party_address && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {invoice.party_address}
              </div>
            )}
          </div>

          {/* Invoice Summary Box */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Invoice & Payment Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Invoice No:</span>{' '}
                <strong className="tabular-nums">{invoice.invoice_no}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>{' '}
                <strong className="tabular-nums">{formatDate(invoice.invoice_date)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>GST Rate:</span>{' '}
                <strong className="tabular-nums">{invoice.gst_rate_percent || 18}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>{' '}
                <strong style={{ textTransform: 'capitalize' }}>{invoice.payment_method || 'Cheque'}</strong>
              </div>
              {invoice.cheque_no && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cheque/Ref No:</span>{' '}
                  <strong className="tabular-nums">{invoice.cheque_no}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', width: '50px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>Product / Material</th>
                <th style={{ padding: '10px 12px', width: '100px' }}>HSN</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '110px' }}>Rate (₹)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '100px' }}>Quantity</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '130px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <tr key={item.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }} className="tabular-nums">
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {item.product_name || item.product?.name || `Product #${item.product_id || item.product}`}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }} className="tabular-nums">
                      {item.product_hsn || item.product?.hsn_code || '-'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }} className="tabular-nums">
                      ₹{formatINR(item.price)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }} className="tabular-nums">
                      {formatINR(item.quantity)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }} className="tabular-nums">
                      ₹{formatINR(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No line items attached to this invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Transport Details (If present) */}
        {invoice.transport_detail && (
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="pi pi-truck" style={{ color: 'var(--primary-color)' }} /> Transport & Dispatch Logistics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
              {invoice.transport_detail.truck_no && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Truck No:</span>{' '}
                  <strong style={{ textTransform: 'uppercase' }}>{invoice.transport_detail.truck_no}</strong>
                </div>
              )}
              {invoice.transport_detail.transporter_name && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Transporter:</span>{' '}
                  <strong>{invoice.transport_detail.transporter_name}</strong>
                </div>
              )}
              {invoice.transport_detail.driver_name && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Driver:</span>{' '}
                  <strong>{invoice.transport_detail.driver_name} {invoice.transport_detail.driver_phone ? `(${invoice.transport_detail.driver_phone})` : ''}</strong>
                </div>
              )}
              {invoice.transport_detail.lr_no && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>LR / Bilty No:</span>{' '}
                  <strong>{invoice.transport_detail.lr_no}</strong>
                </div>
              )}
              {Number(invoice.transport_detail.freight_amount) > 0 && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Freight:</span>{' '}
                  <strong className="tabular-nums">₹{formatINR(invoice.transport_detail.freight_amount)}</strong>
                </div>
              )}
              {Number(invoice.transport_detail.advance_paid) > 0 && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Advance Paid:</span>{' '}
                  <strong className="tabular-nums">₹{formatINR(invoice.transport_detail.advance_paid)}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculations and Bank Details Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          {company?.bank_name && (
            <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Bank Account Details
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Bank Name:</span> <strong>{company.bank_name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>A/C No:</span> <strong className="tabular-nums">{company.bank_account_no}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>IFSC Code:</span> <strong className="tabular-nums">{company.bank_ifsc}</strong></div>
                {company.bank_branch && (
                  <div><span style={{ color: 'var(--text-muted)' }}>Branch:</span> <strong>{company.bank_branch}</strong></div>
                )}
              </div>
            </div>
          )}

          <div style={{ width: '360px', maxWidth: '100%', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxable Subtotal:</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{formatINR(invoice.total_amount)}</span>
            </div>

            {Number(invoice.cgst_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>CGST ({Number(invoice.gst_rate_percent || 18) / 2}%):</span>
                <span className="tabular-nums">₹{formatINR(invoice.cgst_amount)}</span>
              </div>
            )}

            {Number(invoice.sgst_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>SGST ({Number(invoice.gst_rate_percent || 18) / 2}%):</span>
                <span className="tabular-nums">₹{formatINR(invoice.sgst_amount)}</span>
              </div>
            )}

            {Number(invoice.igst_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IGST ({invoice.gst_rate_percent || 18}%):</span>
                <span className="tabular-nums">₹{formatINR(invoice.igst_amount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Total GST Tax:</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{formatINR(invoice.gst_amount)}</span>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Grand Total:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                ₹{formatINR(invoice.grand_total_amount)}
              </span>
            </div>

            {Number(invoice.payment_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--status-success)' }}>
                <span>Paid Amount:</span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{formatINR(invoice.payment_amount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        {company?.terms_and_conditions && (
          <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Terms & Conditions
            </div>
            <div
              style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: company.terms_and_conditions }}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
