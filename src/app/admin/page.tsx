'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ShoppingBag, Send, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Check, Save, ShieldAlert, Plus, Minus } from 'lucide-react';

const safeParse = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  return val || {};
};

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: string;
  customerDetails: any;
  deliveryDetails: any;
  items: Array<{
    id: string;
    quantity: number;
    priceSnapshot: string;
    customizationState: any; // JSON
    product?: {
      name: string;
    }
  }>;
}

interface Inquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  budget: string | null;
  quantityRange: string | null;
  occasion: string | null;
  requirements: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

interface ProductInventory {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    inventory: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'inventory'>('orders');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  // Accordion expanded state for orders
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // States for inventory editing
  const [adjustingVariantId, setAdjustingVariantId] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');

  // States for inquiry note editing
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Auth Guard – redirect unauthorized users
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (!data.success || !data.user) {
          router.replace('/login?error=' + encodeURIComponent('Please sign in to access the Admin Panel.'));
          return;
        }
        if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
          router.replace('/login?error=' + encodeURIComponent('Access denied. Admin privileges required.'));
          return;
        }
        setAuthUser(data.user);
        setAuthChecked(true);
      } catch {
        router.replace('/login?error=' + encodeURIComponent('Session check failed. Please sign in again.'));
      }
    };
    checkAuth();
  }, [router]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setInventory(statsData.stats.productsInventory || []);
      }

      // 2. Fetch Orders
      const ordersRes = await fetch('/api/admin/orders', { cache: 'no-store' });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }

      // 3. Fetch Inquiries
      const inquiriesRes = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      const inquiriesData = await inquiriesRes.json();
      if (inquiriesData.success) {
        setInquiries(inquiriesData.inquiries || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchDashboardDataSilently = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setInventory(statsData.stats.productsInventory || []);
      }

      const ordersRes = await fetch('/api/admin/orders', { cache: 'no-store' });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }

      const inquiriesRes = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      const inquiriesData = await inquiriesRes.json();
      if (inquiriesData.success) {
        setInquiries(inquiriesData.inquiries || []);
      }
    } catch (err) {
      console.error('Silent stats update failed:', err);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardDataSilently();
    }, 5000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // Show premium loading screen until auth resolves
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '2px solid #bfa16f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#bfa16f', fontFamily: 'serif', letterSpacing: '0.2em', fontSize: '0.75rem', textTransform: 'uppercase' }}>Verifying Admin Access…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        // Update state locally
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        // Refresh metrics
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // Update inquiry pipeline status or notes
  const handleUpdateInquiry = async (inquiryId: string, status?: string, adminNotes?: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status, adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(inquiries.map(i => i.id === inquiryId ? {
          ...i,
          ...(status ? { status } : {}),
          ...(adminNotes !== undefined ? { adminNotes } : {})
        } : i));
        setEditingInquiryId(null);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to update inquiry.');
      }
    } catch (err) {
      console.error('Error updating inquiry:', err);
    }
  };

  // Adjust stock count
  const handleAdjustInventory = async (productId: string, variantId: string) => {
    if (adjustmentValue === 0) return;
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: adjustmentValue,
          notes: adjustmentNotes || 'Admin dashboard quick adjustment',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdjustingVariantId(null);
        setAdjustmentValue(0);
        setAdjustmentNotes('');
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to adjust inventory.');
      }
    } catch (err) {
      console.error('Error adjusting inventory:', err);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b'; // Amber
      case 'PAID': return '#cba052'; // Gold
      case 'PROCESSING': return '#3b82f6'; // Blue
      case 'PACKED': return '#8b5cf6'; // Violet
      case 'SHIPPED': return '#06b6d4'; // Cyan
      case 'DELIVERED': return '#10b981'; // Green
      default: return '#ef4444'; // Red
    }
  };

  const getInquiryStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return '#ef4444'; // Red
      case 'REVIEWING': return '#f59e0b'; // Amber
      case 'CONTACTED': return '#3b82f6'; // Blue
      case 'PROPOSAL_SENT': return '#8b5cf6'; // Violet
      case 'NEGOTIATION': return '#cba052'; // Gold
      case 'WON': return '#10b981'; // Green
      case 'LOST': return '#6b7280'; // Gray
      case 'FULFILLED': return '#047857'; // Dark green
      default: return '#d6d3d1';
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.spotlight} />
      
      <div style={styles.content}>
        
        {/* Header section with refresh button */}
        <div style={styles.header}>
          <div>
            <p style={styles.subtitle}>GORMETCO INTERNAL ENGINE</p>
            <h1 style={styles.title}>Operations & Pipeline Center</h1>
          </div>
          
          <button onClick={fetchDashboardData} disabled={isRefreshing} style={styles.refreshBtn}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ marginRight: 8 }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>

        {/* 1. KEY METRICS INDICATORS */}
        {stats && (
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Total Revenue</span>
                <DollarSign size={20} style={styles.metricIconGold} />
              </div>
              <span style={styles.metricValueGold}>${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <p style={styles.metricFooter}>Calculated from completed sales</p>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Total Orders</span>
                <ShoppingBag size={20} style={styles.metricIcon} />
              </div>
              <span style={styles.metricValue}>{stats.totalOrders}</span>
              <p style={styles.metricFooter}>E-commerce checkout transactions</p>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Active Gifting Inquiries</span>
                <Send size={20} style={styles.metricIcon} />
              </div>
              <span style={styles.metricValue}>{stats.pendingInquiries}</span>
              <p style={styles.metricFooter}>Corporate & bespoke lead pipeline</p>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Low Stock Alerts</span>
                <AlertTriangle size={20} style={stats.lowStockCount > 0 ? styles.metricIconRed : styles.metricIcon} />
              </div>
              <span style={stats.lowStockCount > 0 ? styles.metricValueRed : styles.metricValue}>
                {stats.lowStockCount}
              </span>
              <p style={styles.metricFooter}>Variant items with stock &lt; 10</p>
            </div>
          </div>
        )}

        {/* 2. TAB TOGGLES */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'orders' ? '#bfa16f' : 'transparent',
              color: activeTab === 'orders' ? '#bfa16f' : '#7a6e64',
            }}
          >
            Orders Pipeline ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('inquiries')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'inquiries' ? '#bfa16f' : 'transparent',
              color: activeTab === 'inquiries' ? '#bfa16f' : '#7a6e64',
            }}
          >
            Corporate Mail & Inquiries ({inquiries.length})
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'inventory' ? '#bfa16f' : 'transparent',
              color: activeTab === 'inventory' ? '#bfa16f' : '#7a6e64',
            }}
          >
            Inventory Stock Logs
          </button>
        </div>

        {/* 3. DETAILS DISPLAY */}
        {isLoading ? (
          <p style={styles.loadingText}>Connecting to database...</p>
        ) : (
          <div style={styles.panelCard}>
            
            {/* ORDERS TAB PANEL */}
            {activeTab === 'orders' && (
              <div style={styles.ordersPanel}>
                <h3 style={styles.panelTitle}>Client Orders</h3>
                
                {orders.length === 0 ? (
                  <p style={styles.emptyPanelText}>No orders registered in the system yet.</p>
                ) : (
                  <div style={styles.ordersList}>
                    {orders.map((order) => {
                      const cust = safeParse(order.customerDetails);
                      const isExpanded = expandedOrderId === order.id;
                      
                      return (
                        <div key={order.id} style={styles.orderItemRow}>
                          {/* Row Summary */}
                          <div
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            style={styles.orderSummaryLine}
                          >
                            <div style={styles.orderIdGroup}>
                              <span style={styles.orderLabelId}>ID:</span>
                              <code style={styles.orderIdCode}>{order.id.slice(0, 8)}...</code>
                            </div>

                            <div style={styles.orderCustGroup}>
                              <span style={styles.orderCustName}>{(cust.firstName || '') + ' ' + (cust.lastName || '')}</span>
                              <span style={styles.orderCustEmail}>{cust.email || ''}</span>
                            </div>

                            <div style={styles.orderDateGroup}>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div style={styles.orderTotalGroup}>
                              <span>${Number(order.totalAmount).toFixed(2)}</span>
                            </div>

                            <div style={styles.orderStatusGroup}>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor: `${getOrderStatusColor(order.status)}15`,
                                  color: getOrderStatusColor(order.status),
                                  borderColor: `${getOrderStatusColor(order.status)}40`,
                                }}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          {/* Row Details (Accordion Content) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={styles.orderExpandedContent}
                              >
                                <div style={styles.expandedGrid}>
                                  
                                  {/* Delivery address */}
                                  <div>
                                    <h5 style={styles.subHeading}>Shipping Address</h5>
                                    <p style={styles.expandedText}>
                                      {(() => {
                                        const del = safeParse(order.deliveryDetails);
                                        return `${del.addressLine1 || ''}, ${del.city || ''}, ${del.state || ''} ${del.zipCode || ''}, ${del.country || ''}`;
                                      })()}
                                    </p>
                                    
                                    <div style={styles.statusActionGroup}>
                                      <h5 style={styles.subHeading}>Modify Status</h5>
                                      <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                        style={styles.statusSelect}
                                      >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PAID">PAID</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="PACKED">PACKED</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Purchased Items details */}
                                  <div>
                                    <h5 style={styles.subHeading}>Purchased Items ({order.items.length})</h5>
                                    <div style={styles.expandedItemsList}>
                                      {order.items.map((item) => (
                                        <div key={item.id} style={styles.expandedItemRow}>
                                          <div style={styles.itemRowMain}>
                                            <span style={styles.expandedItemName}>
                                              {item.product?.name || 'GormetCo Box'} <strong>x {item.quantity}</strong>
                                            </span>
                                            <span>${Number(item.priceSnapshot).toFixed(2)}</span>
                                          </div>
                                          
                                          {/* Custom choices chosen by customer */}
                                          {item.customizationState && (
                                            <div style={styles.itemCustomChoices}>
                                              {Object.entries(item.customizationState).map(([key, val]) => (
                                                <div key={key} style={styles.customChoiceRow}>
                                                  <span style={styles.choiceKey}>{key}:</span>
                                                  <span style={styles.choiceVal}>{String(val)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* INQUIRIES TAB PANEL */}
            {activeTab === 'inquiries' && (
              <div style={styles.inquiriesPanel}>
                <h3 style={styles.panelTitle}>Corporate Mail & Curation Requests</h3>
                
                {inquiries.length === 0 ? (
                  <p style={styles.emptyPanelText}>No inquiries captured yet.</p>
                ) : (
                  <div style={styles.inquiriesList}>
                    {inquiries.map((inq) => (
                      <div key={inq.id} style={styles.inquiryCard}>
                        
                        {/* Header Details */}
                        <div style={styles.inqCardHeader}>
                          <div>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: `${getInquiryStatusColor(inq.status)}15`,
                                color: getInquiryStatusColor(inq.status),
                                borderColor: `${getInquiryStatusColor(inq.status)}40`,
                              }}
                            >
                              {inq.status}
                            </span>
                            <h4 style={styles.inqCompanyName}>{inq.companyName}</h4>
                          </div>

                          <div style={styles.inqActionGroup}>
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiry(inq.id, e.target.value)}
                              style={styles.inqStatusSelect}
                            >
                              <option value="NEW">NEW</option>
                              <option value="REVIEWING">REVIEWING</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                              <option value="NEGOTIATION">NEGOTIATION</option>
                              <option value="WON">WON</option>
                              <option value="LOST">LOST</option>
                              <option value="FULFILLED">FULFILLED</option>
                            </select>
                          </div>
                        </div>

                        {/* Middle Details Grid */}
                        <div style={styles.inqGrid}>
                          <div>
                            <p style={styles.inqLabelText}><strong>Contact Name:</strong> {inq.contactName}</p>
                            <p style={styles.inqLabelText}><strong>Email Address:</strong> {inq.email}</p>
                            <p style={styles.inqLabelText}><strong>Phone Number:</strong> {inq.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p style={styles.inqLabelText}><strong>Occasion Theme:</strong> {inq.occasion || 'N/A'}</p>
                            <p style={styles.inqLabelText}><strong>Est. Budget:</strong> {inq.budget ? `$${Number(inq.budget).toLocaleString()}` : 'N/A'}</p>
                            <p style={styles.inqLabelText}><strong>Quantity:</strong> {inq.quantityRange || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Customer specifications notes */}
                        {inq.requirements && (
                          <div style={styles.requirementsBox}>
                            <h5 style={styles.inqSectionTitle}>Requirements:</h5>
                            <p style={styles.inqText}>{inq.requirements}</p>
                          </div>
                        )}

                        {/* Private Admin Notes */}
                        <div style={styles.adminNotesBox}>
                          <div style={styles.adminNotesHeader}>
                            <h5 style={styles.inqSectionTitle}>Admin Curation Notes:</h5>
                            {editingInquiryId !== inq.id ? (
                              <button
                                onClick={() => {
                                  setEditingInquiryId(inq.id);
                                  setTempNotes(inq.adminNotes || '');
                                }}
                                style={styles.notesEditBtn}
                              >
                                Edit Notes
                              </button>
                            ) : (
                              <div style={styles.notesSaveGroup}>
                                <button
                                  onClick={() => handleUpdateInquiry(inq.id, undefined, tempNotes)}
                                  style={styles.notesSaveBtn}
                                >
                                  <Save size={12} style={{ marginRight: 4 }} /> Save
                                </button>
                                <button
                                  onClick={() => setEditingInquiryId(null)}
                                  style={styles.notesCancelBtn}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>

                          {editingInquiryId !== inq.id ? (
                            <p style={styles.inqNotesText}>
                              {inq.adminNotes || 'No notes added yet. Record follow-up dates and vector log updates here.'}
                            </p>
                          ) : (
                            <textarea
                              rows={2}
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              style={styles.notesTextarea}
                            />
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB PANEL */}
            {activeTab === 'inventory' && (
              <div style={styles.inventoryPanel}>
                <h3 style={styles.panelTitle}>Product Stock Levels</h3>
                
                {inventory.length === 0 ? (
                  <p style={styles.emptyPanelText}>No inventory products found.</p>
                ) : (
                  <div style={styles.inventoryList}>
                    {inventory.map((prod) => (
                      <div key={prod.id} style={styles.inventoryProdCard}>
                        <h4 style={styles.invProdName}>{prod.name}</h4>
                        
                        <div style={styles.variantsList}>
                          {prod.variants.map((v) => {
                            const isLowStock = v.inventory < 10;
                            const isAdjusting = adjustingVariantId === v.id;
                            
                            return (
                              <div key={v.id} style={styles.variantRow}>
                                <div style={styles.variantDetails}>
                                  <span style={styles.variantName}>{v.name}</span>
                                  <code style={styles.variantSku}>{v.sku}</code>
                                </div>

                                <div style={styles.variantStockGroup}>
                                  <span style={styles.variantStockLabel}>Current Stock:</span>
                                  <span
                                    style={{
                                      ...styles.variantStockVal,
                                      color: isLowStock ? '#ef4444' : '#10b981',
                                      fontWeight: isLowStock ? '700' : '600',
                                    }}
                                  >
                                    {v.inventory} units
                                  </span>
                                  {isLowStock && <ShieldAlert size={14} style={styles.lowStockWarningIcon} />}
                                </div>

                                {/* Stock adjustments Controls */}
                                <div style={styles.variantActionGroup}>
                                  {!isAdjusting ? (
                                    <button
                                      onClick={() => {
                                        setAdjustingVariantId(v.id);
                                        setAdjustmentValue(5);
                                        setAdjustmentNotes('Stock adjustment by admin panel');
                                      }}
                                      style={styles.adjustStockBtn}
                                    >
                                      Adjust Stock
                                    </button>
                                  ) : (
                                    <div style={styles.adjustFormGroup}>
                                      <div style={styles.adjustInputRow}>
                                        <button onClick={() => setAdjustmentValue(adjustmentValue - 1)} style={styles.adjustIconBtn}><Minus size={14} /></button>
                                        <input
                                          type="number"
                                          value={adjustmentValue}
                                          onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
                                          style={styles.adjustInput}
                                        />
                                        <button onClick={() => setAdjustmentValue(adjustmentValue + 1)} style={styles.adjustIconBtn}><Plus size={14} /></button>
                                      </div>
                                      
                                      <input
                                        type="text"
                                        placeholder="Reason for adjustment"
                                        value={adjustmentNotes}
                                        onChange={(e) => setAdjustmentNotes(e.target.value)}
                                        style={styles.adjustNotesInput}
                                      />
                                      
                                      <div style={styles.adjustBtnRow}>
                                        <button
                                          onClick={() => handleAdjustInventory(prod.id, v.id)}
                                          style={styles.adjustConfirmBtn}
                                        >
                                          Apply
                                        </button>
                                        <button
                                          onClick={() => setAdjustingVariantId(null)}
                                          style={styles.adjustCancelBtn}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    backgroundColor: '#faf8f5',
    color: '#2e2520',
    paddingTop: '8rem',
    paddingBottom: '8rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
    background: 'radial-gradient(circle at 50% 25%, rgba(191, 161, 111, 0.08) 0%, transparent 60%)',
  },
  content: {
    width: '100%',
    maxWidth: '1200px',
    zIndex: 2,
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '3rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '1.5rem',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    letterSpacing: '0.3em',
    color: '#bfa16f',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: '300',
    letterSpacing: '0.02em',
    color: '#2e2520',
    margin: 0,
  },
  refreshBtn: {
    backgroundColor: 'transparent',
    color: '#bfa16f',
    border: '1px solid rgba(191, 161, 111, 0.3)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  metricCard: {
    backgroundColor: '#faf8f5',
    borderRadius: '12px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(46, 37, 32, 0.02)',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  metricLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    fontWeight: '600',
  },
  metricIcon: {
    color: '#bfa16f',
  },
  metricIconGold: {
    color: '#bfa16f',
  },
  metricIconRed: {
    color: '#ef4444',
  },
  metricValue: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2e2520',
    marginBottom: '4px',
  },
  metricValueGold: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#bfa16f',
    marginBottom: '4px',
  },
  metricValueRed: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: '4px',
  },
  metricFooter: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: '#7a6e64',
    margin: 0,
  },
  tabBar: {
    display: 'flex',
    gap: '20px',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    marginBottom: '2rem',
  },
  tabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '10px 5px',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
  },
  panelCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: '16px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '2.5rem',
    boxShadow: '0 10px 30px rgba(46, 37, 32, 0.04)',
  },
  loadingText: {
    fontFamily: 'var(--font-sans)',
    color: '#7a6e64',
    textAlign: 'center',
    padding: '3rem 0',
  },
  panelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.5rem',
  },
  emptyPanelText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#7a6e64',
    textAlign: 'center',
    padding: '2rem 0',
  },
  ordersPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  orderItemRow: {
    backgroundColor: '#faf8f5',
    borderRadius: '8px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    overflow: 'hidden',
  },
  orderSummaryLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    cursor: 'pointer',
    gap: '15px',
  },
  orderIdGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  orderLabelId: {
    color: '#7a6e64',
    fontSize: '0.8rem',
  },
  orderIdCode: {
    color: '#bfa16f',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  orderCustGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '150px',
  },
  orderCustName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#2e2520',
    fontWeight: '600',
  },
  orderCustEmail: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
  },
  orderDateGroup: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#7a6e64',
  },
  orderTotalGroup: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#2e2520',
    fontWeight: '600',
  },
  orderStatusGroup: {
    width: '120px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid',
  },
  orderExpandedContent: {
    borderTop: '1px solid rgba(191, 161, 111, 0.15)',
    backgroundColor: '#faf8f5',
    padding: '1.5rem',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  subHeading: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#bfa16f',
    fontWeight: '600',
    marginBottom: '8px',
  },
  expandedText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#5c5047',
    lineHeight: '1.5',
    margin: 0,
  },
  statusActionGroup: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusSelect: {
    padding: '8px 12px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '6px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    outline: 'none',
    width: '200px',
  },
  expandedItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  expandedItemRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(191, 161, 111, 0.1)',
  },
  itemRowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#2e2520',
  },
  expandedItemName: {
    fontWeight: '500',
  },
  itemCustomChoices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '10px',
    borderLeft: '1px solid rgba(191, 161, 111, 0.3)',
    marginTop: '2px',
  },
  customChoiceRow: {
    display: 'flex',
    gap: '6px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
  },
  choiceKey: {
    color: '#7a6e64',
  },
  choiceVal: {
    color: '#5c5047',
    fontWeight: '600',
  },
  inquiriesPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  inquiriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inquiryCard: {
    backgroundColor: '#faf8f5',
    borderRadius: '12px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inqCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '10px',
  },
  inqCompanyName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    fontWeight: '400',
    color: '#2e2520',
    marginTop: '6px',
  },
  inqActionGroup: {
    display: 'flex',
    gap: '10px',
  },
  inqStatusSelect: {
    padding: '6px 12px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '4px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },
  inqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  inqLabelText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#5c5047',
    margin: '0 0 6px 0',
  },
  requirementsBox: {
    backgroundColor: '#f5f2eb',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '8px',
    padding: '1rem',
  },
  inqSectionTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#bfa16f',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  inqText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#5c5047',
    margin: 0,
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  },
  adminNotesBox: {
    backgroundColor: 'rgba(191, 161, 111, 0.04)',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '8px',
    padding: '1rem',
  },
  adminNotesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  notesEditBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#bfa16f',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notesSaveGroup: {
    display: 'flex',
    gap: '10px',
  },
  notesSaveBtn: {
    backgroundColor: '#bfa16f',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 10px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  notesCancelBtn: {
    backgroundColor: 'transparent',
    color: '#7a6e64',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  inqNotesText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#5c5047',
    fontStyle: 'italic',
    margin: 0,
  },
  notesTextarea: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.3)',
    borderRadius: '6px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
  },
  inventoryPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  inventoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inventoryProdCard: {
    backgroundColor: '#faf8f5',
    borderRadius: '12px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.75rem',
  },
  invProdName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.25rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '8px',
  },
  variantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  variantRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#f5f2eb',
    flexWrap: 'wrap',
  },
  variantDetails: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
  },
  variantName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#2e2520',
    fontWeight: '500',
  },
  variantSku: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.78rem',
    color: '#7a6e64',
  },
  variantStockGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '150px',
  },
  variantStockLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
  },
  variantStockVal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
  },
  lowStockWarningIcon: {
    color: '#ef4444',
  },
  variantActionGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  adjustStockBtn: {
    backgroundColor: 'transparent',
    color: '#bfa16f',
    border: '1px solid rgba(191, 161, 111, 0.3)',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  adjustFormGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
    backgroundColor: '#faf8f5',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
  },
  adjustInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  adjustIconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2e2520',
    padding: '4px',
    cursor: 'pointer',
  },
  adjustInput: {
    width: '60px',
    padding: '4px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '4px',
    color: '#2e2520',
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
  },
  adjustNotesInput: {
    width: '180px',
    padding: '4px 8px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '4px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    outline: 'none',
  },
  adjustBtnRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  adjustConfirmBtn: {
    backgroundColor: '#10b981',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '3px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  adjustCancelBtn: {
    backgroundColor: 'transparent',
    color: '#7a6e64',
    border: 'none',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  successBlock: {
    textAlign: 'center',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIcon: {
    color: '#10b981',
    marginBottom: '8px',
  },
  successHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: '#2e2520',
    margin: '0 0 6px 0',
  },
  successMessage: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    lineHeight: '1.4',
    margin: '0 0 1rem 0',
  },
  returnBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    color: '#2e2520',
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};
