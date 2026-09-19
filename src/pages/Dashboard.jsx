import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';

export default function Dashboard() {
  const navigate = useNavigate();

  const metrics = [
    {
      title: 'Local Sales (FY 24-25)',
      value: '₹ 0.00',
      subtitle: '0 non-GST invoices',
      badge: 'Local Billing',
      badgeSeverity: 'info',
      icon: 'pi pi-receipt',
      color: '#2563eb',
      bgColor: '#eff6ff',
      path: '/bills',
    },
    {
      title: 'Customer Accounts',
      value: '0',
      subtitle: 'Local & GST accounts',
      badge: 'Parties Master',
      badgeSeverity: 'success',
      icon: 'pi pi-users',
      color: '#0d9488',
      bgColor: '#f0fdfa',
      path: '/customers',
    },
    {
      title: 'Product Catalog',
      value: '4 Categories',
      subtitle: 'Granite, Marble, Kota, Rough',
      badge: 'Materials',
      badgeSeverity: 'warning',
      icon: 'pi pi-th-large',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      path: '/products',
    },
    {
      title: 'Yard Stock on Stands',
      value: '0 Sq.Ft',
      subtitle: 'Physical inventory lots',
      badge: 'Inventory',
      badgeSeverity: 'danger',
      icon: 'pi pi-box',
      color: '#d97706',
      bgColor: '#fffbeb',
      path: '/current-stock',
    },
  ];

  const primaryModules = [
    {
      title: 'Local Sale Billing',
      description: 'Create non-GST bills with row-by-row length × height measurement tables, slab deductions, and stand stock deduction.',
      icon: 'pi pi-file-edit',
      color: '#2563eb',
      bgColor: '#eff6ff',
      path: '/bills',
      tag: 'Core Sales',
    },
    {
      title: 'GST Tax Invoicing',
      description: 'Sell and purchase GST invoices with HSN codes, CGST/SGST/IGST tax rates, transport sector rates, and E-Way bills.',
      icon: 'pi pi-percentage',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      path: '/gst-bills',
      tag: 'Compliance',
    },
    {
      title: 'Customer Directory',
      description: 'Party master for billing, ledger balances, previous transaction records, and payment settlements.',
      icon: 'pi pi-id-card',
      color: '#0284c7',
      bgColor: '#f0f9ff',
      path: '/customers',
      tag: 'Accounts',
    },
    {
      title: 'Current Stand Stock',
      description: 'Track stone blocks and slabs organized by physical stands, lot tags, piece dimensions, and photo records.',
      icon: 'pi pi-warehouse',
      color: '#059669',
      bgColor: '#ecfdf5',
      path: '/current-stock',
      tag: 'Yard Stock',
    },
    {
      title: 'Purchase Validation',
      description: 'Truck inspection for incoming quarry lots, raw defect allowances, measurement checks, and purchase bills.',
      icon: 'pi pi-truck',
      color: '#d97706',
      bgColor: '#fffbeb',
      path: '/purchase-validation',
      tag: 'Procurement',
    },
    {
      title: 'Order Quotation',
      description: 'Generate customer price estimates with stone cutting charges, transport, and instant WhatsApp PDF sharing.',
      icon: 'pi pi-send',
      color: '#e11d48',
      bgColor: '#fff1f2',
      path: '/order-quotation',
      tag: 'Estimates',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Executive Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#60a5fa',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                ERP 2.0 Decoupled
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>•</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                Stone & Marble Trading System
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              ELBAT Trading & Stock Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.5 }}>
              Precision stone measurement sheets, GST/non-GST multi-tier invoicing, physical stand yard tracking, and delivery sector settlements.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Button
              label="New Local Bill"
              icon="pi pi-plus"
              onClick={() => navigate('/bills')}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            />
            <Button
              label="Tax Invoice (GST)"
              icon="pi pi-receipt"
              severity="secondary"
              outlined
              onClick={() => navigate('/gst-bills')}
              style={{
                borderRadius: '10px',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI Financial & Inventory Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {metrics.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(15, 23, 42, 0.08)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.title}
                </span>
                <Tag value={item.badge} severity={item.badgeSeverity} rounded style={{ fontSize: '0.7rem', padding: '2px 8px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {item.value}
                </div>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: item.bgColor,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  <i className={item.icon}></i>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.subtitle}</span>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View <i className="pi pi-arrow-right" style={{ fontSize: '0.7rem' }}></i>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Core Business Modules Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Business Operations & Apps
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              Specialized stone and marble trading workflows migrated from legacy monolithic Django
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {primaryModules.map((mod) => (
            <div
              key={mod.title}
              onClick={() => navigate(mod.path)}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(15, 23, 42, 0.06)';
                e.currentTarget.style.borderColor = mod.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: mod.bgColor,
                      color: mod.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    <i className={mod.icon}></i>
                  </div>
                  <Tag value={mod.tag} rounded style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569' }} />
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  {mod.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5 }}>
                  {mod.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: mod.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Open Module <i className="pi pi-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Architecture & Migration Status */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              System Blueprint & Decoupled Status
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Modern migration tracking for Bill 2.0 stone & marble architecture
            </p>
          </div>
          <Tag value="Architecture Active" severity="success" rounded style={{ fontSize: '0.75rem', padding: '4px 10px' }} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Legacy Monolith Reference */}
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Legacy Reference Monolith
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
              /home/mihirpatel/Documents/ELBAT Office/Office Software/Bill
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Domain calculations, formulas, measurement grids, and party accounts reference.
            </p>
          </div>

          {/* Backend Stack */}
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              DRF Backend Stack (bill_backend)
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Django 6.1 • DRF • Celery • Dark Mode Scalar Docs
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Interactive API docs available at <code style={{ color: '#2563eb' }}>/api/docs/</code> with JWT bearer auth.
            </p>
          </div>

          {/* Frontend Stack */}
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Frontend UI Stack (bill_frontend)
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              React 19 • PrimeReact 11 • PrimeIcons • Vite
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Responsive desktop sidebar navigation + mobile app bottom navigation drawer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
