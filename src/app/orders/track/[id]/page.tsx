'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Gift, 
  MapPin, 
  Mail, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  Calendar, 
  Clock,
  ShieldCheck,
  ChevronRight,
  User
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  customizationState: any;
  product?: {
    name: string;
    slug: string;
    shortDescription: string;
    category?: {
      name: string;
    };
  };
  selectedProducts?: any[];
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  deliveryFee: number;
  customerDetails: any;
  deliveryDetails: any;
  items: OrderItem[];
  createdAt: string;
}

const getProductImage = (slug: string) => {
  switch (slug) {
    case "the-botanical-heritage":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.31 (2).jpeg";
    case "the-ivory-keepsake":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34 (3).jpeg";
    case "the-imperial-executive":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32 (2).jpeg";
    case "premium-dark-chocolate-truffles":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.31 (1).jpeg";
    case "single-origin-coffee-beans":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34 (1).jpeg";
    case "silver-plated-tea-infuser":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (2).jpeg";
    case "hand-poured-soy-candle":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32 (3).jpeg";
    case "artisanal-roasted-makhana":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34.jpeg";
    case "premium-dryfruits-mix":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (3).jpeg";
    case "blush-leather-diary":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.35.jpeg";
    case "rose-quartz-crystal-tree":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32 (1).jpeg";
    case "earl-grey-royal-tea-blend":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.31.jpeg";
    case "organic-honey-lavender-jars":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33.jpeg";
    case "gold-foil-playing-cards":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32.jpeg";
    case "sandalwood-incense-cones":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34 (2).jpeg";
    case "fine-bone-china-cup":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (1).jpeg";
    case "belgian-waffle-crisps":
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.35 (1).jpeg";
    default:
      return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34.jpeg";
  }
};

const getRecommendedBoxes = (n: number) => {
  if (n <= 0) return { "the-botanical-heritage": 0, "the-ivory-keepsake": 0, "the-imperial-executive": 0 };
  let bestCost = Infinity;
  let bestCombo = { "the-botanical-heritage": 0, "the-ivory-keepsake": 0, "the-imperial-executive": 0 };

  for (let b = 0; b <= 10; b++) {
    for (let iv = 0; iv <= 10; iv++) {
      for (let ex = 0; ex <= 10; ex++) {
        const cap = b * 3 + iv * 5 + ex * 7;
        if (cap >= n) {
          const cost = (b + iv + ex) * 45.00;
          const emptySlots = cap - n;
          const score = cost * 1000 + emptySlots;
          if (score < bestCost) {
            bestCost = score;
            bestCombo = {
              "the-botanical-heritage": b,
              "the-ivory-keepsake": iv,
              "the-imperial-executive": ex
            };
          }
        }
      }
    }
  }
  return bestCombo;
};

const parseBoxQuantities = (boxPackageBase: string, selectedItemsLength: number) => {
  const quantities = {
    "the-botanical-heritage": 0,
    "the-ivory-keepsake": 0,
    "the-imperial-executive": 0
  };
  
  if (!boxPackageBase) return quantities;
  
  const parts = boxPackageBase.split(',');
  parts.forEach(part => {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d+)x\s+(Botanical Box|Ivory Box|Imperial Box|The Botanical Heritage|The Ivory Keepsake|The Imperial Executive)/i);
    if (match) {
      const count = parseInt(match[1], 10);
      const name = match[2].toLowerCase();
      if (name.includes('botanical')) {
        quantities["the-botanical-heritage"] = count;
      } else if (name.includes('ivory')) {
        quantities["the-ivory-keepsake"] = count;
      } else if (name.includes('imperial')) {
        quantities["the-imperial-executive"] = count;
      }
    }
  });

  const totalParsed = Object.values(quantities).reduce((a, b) => a + b, 0);
  if (totalParsed === 0 && selectedItemsLength > 0) {
    return getRecommendedBoxes(selectedItemsLength);
  }
  
  return quantities;
};

const parseDetails = (data: any) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return data;
};

export default function OrderTracking() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Failed to fetch order details.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while loading order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Locating your custom credentials...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Tracking Profile Unresolved</h2>
        <p style={styles.errorText}>{error || 'The requested order reference ID could not be found.'}</p>
        <Link href="/collections" style={styles.errorBtn}>
          Return to Curation House
        </Link>
      </div>
    );
  }

  // Parse details safely
  const customer = parseDetails(order.customerDetails);
  const delivery = parseDetails(order.deliveryDetails);

  // Map order status to numeric steps
  const statusSteps = [
    { key: 'PAID', label: 'Order Confirmed', description: 'Payment successfully processed' },
    { key: 'PROCESSING', label: 'Under Supervision', description: 'Curators organizing selections' },
    { key: 'PACKED', label: 'Gift Wrapped', description: 'Assembled in signature keepsakes' },
    { key: 'SHIPPED', label: 'Dispatched', description: 'Carrier in transit with parcel' },
    { key: 'DELIVERED', label: 'Delivered', description: 'Safely arrived at destination' }
  ];

  // Helper to determine active status index
  const getActiveStatusIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PAID':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'PACKED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const activeIndex = getActiveStatusIndex(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main style={styles.container}>
      <div style={styles.spotlight} />
      
      <div style={styles.content}>
        {/* Navigation Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link href="/collections" style={styles.backLink}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Return to Curation House
          </Link>
        </div>

        {/* Header summary */}
        <div style={styles.header}>
          <div>
            <p style={styles.orderLabel}>ORDER RECEIPT</p>
            <h1 style={styles.title}>Fulfillment Tracking</h1>
            <p style={styles.orderRef}>
              Reference ID: <code style={styles.code}>{order.id}</code>
            </p>
          </div>
          <div style={styles.headerMeta}>
            <div style={styles.metaBox}>
              <Calendar size={15} style={styles.metaIcon} />
              <span>Placed on {formattedDate}</span>
            </div>
            <div style={styles.metaBox}>
              <ShieldCheck size={15} style={styles.metaIcon} />
              <span>Secure Checkout Certified</span>
            </div>
          </div>
        </div>

        {/* PROGRESS STEPPER BAR */}
        <div style={styles.stepperContainer}>
          <div style={styles.stepperProgressLine}>
            <div 
              style={{
                ...styles.stepperProgressFill,
                width: `${(activeIndex / (statusSteps.length - 1)) * 100}%`
              }}
            />
          </div>
          
          <div style={styles.stepsWrapper}>
            {statusSteps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;
              
              return (
                <div key={step.key} style={styles.stepNode}>
                  <div 
                    style={{
                      ...styles.stepIndicator,
                      ...(isCompleted ? styles.stepCompleted : {}),
                      ...(isActive ? styles.stepActive : {})
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={16} />
                    ) : idx === 1 ? (
                      <Package size={16} />
                    ) : idx === 3 ? (
                      <Truck size={16} />
                    ) : (
                      <Gift size={16} />
                    )}
                  </div>
                  <div style={styles.stepInfo}>
                    <span style={{
                      ...styles.stepLabel,
                      ...(isActive ? styles.stepLabelActive : {})
                    }}>
                      {step.label}
                    </span>
                    <span style={styles.stepDesc}>{step.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Split View */}
        <div style={styles.splitLayout}>
          
          {/* LEFT: Items and Packing Solver display */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Packaged Gift Items</h3>
              <div style={styles.itemsList}>
                {order.items.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <div style={styles.itemMain}>
                      <div style={styles.itemImageContainer}>
                        <img
                          src={getProductImage(item.product?.slug || '')}
                          alt={item.product?.name || 'Product'}
                          style={styles.itemProductImage}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <span style={styles.itemCategory}>{item.product?.category?.name || 'Gifting'}</span>
                        <h4 style={styles.itemName}>{item.product?.name || 'Curated Hamper'}</h4>
                        <p style={styles.itemDesc}>{item.product?.shortDescription}</p>

                        {/* Rendering nested boxes inside Custom Curation */}
                        {item.customizationState?.selectedItemIds && (
                          <div style={styles.curationContainer}>
                            <div style={styles.curationHeader}>
                              <span style={styles.curationTitle}>Supervised Box Packing Layout</span>
                              <span style={styles.curationBadge}>{(item.selectedProducts || []).length} items packed</span>
                            </div>
                            <div style={styles.curationBoxList}>
                              {(() => {
                                const selectedProducts = item.selectedProducts || [];
                                const boxPackageBase = item.customizationState["Box Package Base"] || "";
                                const boxQuantities = parseBoxQuantities(boxPackageBase, selectedProducts.length);

                                const activeBoxes: Array<{ slug: string; name: string; capacity: number }> = [];
                                Object.entries(boxQuantities).forEach(([slug, count]: [string, any]) => {
                                  const cap = slug === "the-botanical-heritage" ? 3 : slug === "the-ivory-keepsake" ? 5 : 7;
                                  const name = slug === "the-botanical-heritage" ? "Botanical Heritage" : slug === "the-ivory-keepsake" ? "Ivory Keepsake" : "Imperial Executive";
                                  for (let i = 0; i < count; i++) {
                                    activeBoxes.push({ slug, name, capacity: cap });
                                  }
                                });

                                let itemIndex = 0;
                                const boxesWithItems = activeBoxes.map((box) => {
                                  const boxItems = selectedProducts.slice(itemIndex, itemIndex + box.capacity);
                                  itemIndex += box.capacity;
                                  return { ...box, items: boxItems };
                                });

                                return boxesWithItems.map((box, boxIdx) => (
                                  <div key={boxIdx} style={styles.curationBoxCard}>
                                    <div style={styles.curationBoxHeader}>
                                      <span style={styles.curationBoxName}>{box.name} Box</span>
                                      <span style={styles.curationBoxCap}>{box.items.length} / {box.capacity} slots</span>
                                    </div>
                                    <div style={styles.curationGrid}>
                                      {Array.from({ length: box.capacity }).map((_, slotIdx) => {
                                        const selectedItem = box.items[slotIdx];
                                        return (
                                          <div
                                            key={slotIdx}
                                            style={{
                                              ...styles.curationSlot,
                                              ...(selectedItem ? styles.curationSlotFilled : styles.curationSlotEmpty)
                                            }}
                                            title={selectedItem ? selectedItem.name : 'Empty Slot'}
                                          >
                                            {selectedItem ? (
                                              <img
                                                src={getProductImage(selectedItem.slug)}
                                                alt={selectedItem.name}
                                                style={styles.curationSlotImage}
                                              />
                                            ) : (
                                              <Gift size={12} style={{ color: 'rgba(191, 161, 111, 0.25)' }} />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Rendering text options if any */}
                        {!item.customizationState?.selectedItemIds && item.customizationState && (
                          <div style={styles.textOptionsList}>
                            {Object.entries(item.customizationState)
                              .filter(([key]) => key !== 'variantId')
                              .map(([key, val]: [string, any]) => (
                                <div key={key} style={styles.textOptionRow}>
                                  <span style={styles.textOptionKey}>{key}:</span>
                                  <span style={styles.textOptionVal}>{val}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div style={styles.itemQtyCol}>
                        <span style={styles.qtyLabel}>{item.quantity} Unit(s)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Logistics, Addresses, Pricing */}
          <div style={styles.rightCol}>
            
            {/* Customer Details */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Contact Details</h3>
              <div style={styles.infoRow}>
                <Mail size={16} style={styles.infoIcon} />
                <div>
                  <span style={styles.infoLabel}>Email Contact</span>
                  <span style={styles.infoValue}>{customer.email || 'jane@devereaux.com'}</span>
                </div>
              </div>
              <div style={styles.infoRow}>
                <User size={16} style={styles.infoIcon} />
                <div>
                  <span style={styles.infoLabel}>Recipient Name</span>
                  <span style={styles.infoValue}>
                    {customer.firstName || 'Jane'} {customer.lastName || 'Devereaux'}
                  </span>
                </div>
              </div>
              {customer.phone && (
                <div style={styles.infoRow}>
                  <Phone size={16} style={styles.infoIcon} />
                  <div>
                    <span style={styles.infoLabel}>Phone Number</span>
                    <span style={styles.infoValue}>{customer.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery address */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Shipping Destination</h3>
              <div style={styles.infoRow}>
                <MapPin size={18} style={styles.infoIcon} />
                <div>
                  <span style={styles.infoLabel}>Delivery Address</span>
                  <span style={styles.infoValue}>
                    {delivery.addressLine1 || '848 Fifth Avenue'}<br />
                    {delivery.city || 'New York'}, {delivery.state || 'NY'} {delivery.zipCode || '10065'}<br />
                    {delivery.country || 'United States'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Authorization details */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Verification Details</h3>
              <div style={styles.summaryBox}>
                <div style={styles.summaryItem}>
                  <span>Billing Verification:</span>
                  <span>Authorized & Authenticated</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>Method:</span>
                  <span>Simulated Safe Account</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>Transit Class:</span>
                  <span>Secure Hand-packaged</span>
                </div>
                <div style={styles.summaryDivider} />
                <div style={styles.summaryGrand}>
                  <span>Payment status:</span>
                  <span style={{ color: '#bfa16f', fontWeight: 'bold' }}>{order.status === 'PAID' ? 'Fully Cleared' : order.status}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

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
    background: 'radial-gradient(circle at 50% 20%, rgba(191, 161, 111, 0.08) 0%, transparent 70%)',
  },
  content: {
    width: '100%',
    maxWidth: '1100px',
    zIndex: 2,
    position: 'relative',
  },
  breadcrumb: {
    marginBottom: '1.5rem',
  },
  backLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#bfa16f',
    textDecoration: 'none',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '1.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  orderLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    letterSpacing: '0.25em',
    color: '#bfa16f',
    fontWeight: '600',
    marginBottom: '4px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.8rem',
    fontWeight: '300',
    letterSpacing: '0.02em',
    color: '#2e2520',
    lineHeight: '1.1',
    marginBottom: '6px',
  },
  orderRef: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
  },
  code: {
    color: '#bfa16f',
    backgroundColor: '#f5f2eb',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  headerMeta: {
    display: 'flex',
    gap: '1.5rem',
  },
  metaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
  },
  metaIcon: {
    color: '#bfa16f',
  },
  /* PROGRESS STEPPER */
  stepperContainer: {
    backgroundColor: '#f5f2eb',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '20px 4px 20px 4px',
    padding: '2rem 1.5rem',
    marginBottom: '3rem',
    position: 'relative',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.05)',
  },
  stepperProgressLine: {
    position: 'absolute',
    top: '36px',
    left: '10%',
    right: '10%',
    height: '2px',
    backgroundColor: 'rgba(191, 161, 111, 0.15)',
    zIndex: 1,
  },
  stepperProgressFill: {
    height: '100%',
    backgroundColor: '#bfa16f',
    transition: 'width 0.5s ease',
  },
  stepsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  },
  stepNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    textAlign: 'center',
  },
  stepIndicator: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#faf8f5',
    border: '2px solid rgba(191, 161, 111, 0.25)',
    color: '#a8a29e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '10px',
  },
  stepCompleted: {
    backgroundColor: '#bfa16f',
    borderColor: '#bfa16f',
    color: '#faf8f5',
    boxShadow: '0 0 10px rgba(191, 161, 111, 0.3)',
  },
  stepActive: {
    borderColor: '#2e2520',
    color: '#2e2520',
    boxShadow: '0 0 0 4px rgba(46, 37, 32, 0.1)',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stepLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#7a6e64',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  stepLabelActive: {
    color: '#2e2520',
  },
  stepDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    color: '#a8a29e',
    maxWidth: '130px',
    margin: '0 auto',
  },
  /* SPLIT LAYOUT */
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)',
    gap: '2.5rem',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    position: 'sticky',
    top: '7rem',
  },
  card: {
    backgroundColor: '#f5f2eb',
    borderRadius: '20px 4px 20px 4px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.75rem',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.05)',
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.25rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.12)',
    paddingBottom: '0.5rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  itemRow: {
    borderBottom: '1px solid rgba(191, 161, 111, 0.1)',
    paddingBottom: '1.25rem',
  },
  itemMain: {
    display: 'flex',
    gap: '1.25rem',
  },
  itemImageContainer: {
    width: '75px',
    height: '75px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(191, 161, 111, 0.12)',
    flexShrink: 0,
    backgroundColor: '#faf8f5',
    position: 'relative',
  },
  itemProductImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemCategory: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#bfa16f',
    fontWeight: '600',
    display: 'block',
    marginBottom: '2px',
  },
  itemName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '2px',
  },
  itemDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
    lineHeight: '1.4',
    marginBottom: '6px',
  },
  itemQtyCol: {
    textAlign: 'right',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  qtyLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
    fontWeight: '500',
  },
  unitPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#2e2520',
  },
  /* CURATION NESTED SYSTEM */
  curationContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#faf8f5',
    border: '1px dashed rgba(191, 161, 111, 0.25)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  curationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  curationTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#bfa16f',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  curationBadge: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    backgroundColor: 'rgba(191, 161, 111, 0.1)',
    color: '#2e2520',
    padding: '1px 6px',
    borderRadius: '8px',
    fontWeight: '600',
  },
  curationBoxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  curationBoxCard: {
    backgroundColor: '#f5f2eb',
    border: '1px solid rgba(191, 161, 111, 0.12)',
    padding: '6px 10px',
    borderRadius: '5px',
  },
  curationBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  curationBoxName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.75rem',
    color: '#2e2520',
    fontWeight: '500',
  },
  curationBoxCap: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    color: '#7a6e64',
  },
  curationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  curationSlot: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid',
  },
  curationSlotFilled: {
    backgroundColor: '#faf8f5',
    borderColor: '#bfa16f',
  },
  curationSlotEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(191, 161, 111, 0.12)',
    borderStyle: 'dashed',
  },
  curationSlotImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  /* DETAILS FIELDS */
  infoRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  infoIcon: {
    color: '#bfa16f',
    marginTop: '2px',
  },
  infoLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    color: '#7a6e64',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
    display: 'block',
  },
  infoValue: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#2e2520',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    color: '#7a6e64',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'rgba(191, 161, 111, 0.12)',
    margin: '4px 0',
  },
  summaryGrand: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.92rem',
    color: '#2e2520',
    fontWeight: '700',
  },
  textOptionsList: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  textOptionRow: {
    display: 'flex',
    gap: '4px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
  },
  textOptionKey: {
    color: '#7a6e64',
    fontWeight: '500',
  },
  textOptionVal: {
    color: '#2e2520',
    fontWeight: '600',
  },
  /* LAYOUT LOADING/ERROR STATES */
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8f5',
    color: '#2e2520',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(191, 161, 111, 0.15)',
    borderTopColor: '#bfa16f',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
    color: '#7a6e64',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8f5',
    color: '#2e2520',
    padding: '2rem',
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: '300',
    color: '#2e2520',
    marginBottom: '0.5rem',
  },
  errorText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#7a6e64',
    marginBottom: '1.5rem',
    maxWidth: '400px',
  },
  errorBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  }
};
