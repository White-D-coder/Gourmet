'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Mail, User, Phone, MapPin, CreditCard, ChevronRight, CheckCircle, Package, Gift } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customizationState: any;
  priceSnapshot: string;
  selectedProducts?: any[];
  product?: {
    name: string;
    slug: string;
    basePrice: string;
    shortDescription: string;
    categoryId: string;
    category?: {
      name: string;
    };
  };
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

export default function ShoppingCart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Checkout form state
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
  });

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch cart items AND session on load
  const fetchCart = async () => {
    try {
      const [cartRes, sessionRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/auth/session'),
      ]);
      const cartData = await cartRes.json();
      const sessionData = await sessionRes.json();

      if (cartData.success) {
        setItems(cartData.items || []);
      }
      if (sessionData.success && sessionData.user) {
        setSessionUser(sessionData.user);
        // Prefill checkout form with session data
        setCustomerDetails(prev => ({
          ...prev,
          email: sessionData.user.email || prev.email,
          firstName: sessionData.user.firstName || prev.firstName,
          lastName: sessionData.user.lastName || prev.lastName,
          phone: sessionData.user.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity handler
  const handleUpdateQuantity = async (productId: string, quantity: number, customizationState: any, priceSnapshot: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          customizationState,
          priceSnapshot: Number(priceSnapshot),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // Remove item handler
  const handleRemoveItem = async (productId: string, customizationState: any) => {
    await handleUpdateQuantity(productId, 0, customizationState, '0');
  };

  // Form validations
  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!customerDetails.email.trim()) errs.email = 'Required';
    if (!customerDetails.firstName.trim()) errs.firstName = 'Required';
    if (!customerDetails.lastName.trim()) errs.lastName = 'Required';
    if (!deliveryDetails.addressLine1.trim()) errs.address = 'Required';
    if (!deliveryDetails.city.trim()) errs.city = 'Required';
    if (!deliveryDetails.state.trim()) errs.state = 'Required';
    if (!deliveryDetails.zipCode.trim()) errs.zip = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Process checkout
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auth gate – redirect to login if not signed in
    if (!sessionUser) {
      router.push('/login?error=' + encodeURIComponent('Please sign in to complete your order.'));
      return;
    }

    if (!validateForm()) return;

    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails,
          deliveryDetails,
          paymentDetails,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setItems([]); // Clear local items
        window.dispatchEvent(new Event('cart-updated'));
        router.push(`/orders/track/${data.order.id}`);
      } else {
        alert(data.error || 'Checkout failed. Please check stock levels.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred during checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = Number(item.priceSnapshot);
    return sum + unitPrice * item.quantity;
  }, 0);

  const tax = subtotal * 0.1; // 10% flat tax
  const delivery = subtotal > 0 ? 15.00 : 0; // Flat fee
  const total = subtotal + tax + delivery;

  // Render cart item customization options
  const renderItemCustomizations = (state: any) => {
    if (!state) return null;
    const choices = [];
    for (const key of Object.keys(state)) {
      if (key === 'variantId') continue;
      choices.push(
        <div key={key} style={styles.itemCustomChoice}>
          <span style={styles.customChoiceKey}>{key}:</span>
          <span style={styles.customChoiceVal}>{state[key]}</span>
        </div>
      );
    }
    return choices.length > 0 ? <div style={styles.itemCustomList}>{choices}</div> : null;
  };

  return (
    <main style={styles.container}>
      <div style={styles.spotlight} />
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <p style={styles.subtitle}>YOUR SHOPPING BAG</p>
          <h1 style={styles.title}>Luxury Shopping Cart</h1>
          <div style={styles.divider} />
        </div>

        <AnimatePresence mode="wait">
          {completedOrder ? (
            /* SUCCESS ORDER STATE */
            <motion.div
              key="orderSuccess"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.invoiceCard}
            >
              <div style={styles.invoiceHeader}>
                <CheckCircle size={56} style={styles.invoiceSuccessIcon} />
                <h2 style={styles.invoiceTitle}>Order Placed & Confirmed</h2>
                <p style={styles.invoiceSubtitle}>
                  Order ID: <code style={styles.orderId}>{completedOrder.id}</code>
                </p>
              </div>

              <div style={styles.invoiceBody}>
                {/* Summary Info */}
                <div style={styles.invoiceSection}>
                  <h4 style={styles.invoiceSectionTitle}>Delivery Details</h4>
                  <p style={styles.invoiceText}>
                    <strong>Customer:</strong> {customerDetails.firstName} {customerDetails.lastName} ({customerDetails.email})<br />
                    <strong>Address:</strong> {deliveryDetails.addressLine1}, {deliveryDetails.city}, {deliveryDetails.state} {deliveryDetails.zipCode}, {deliveryDetails.country}
                  </p>
                </div>

                <div style={styles.invoiceSection}>
                  <h4 style={styles.invoiceSectionTitle}>Billing Verification</h4>
                  <p style={styles.invoiceText}>
                    Simulated transaction has been successfully authorized and completed securely.
                  </p>
                </div>

                <div style={styles.invoiceSection}>
                  <h4 style={styles.invoiceSectionTitle}>Fulfillment Timeline</h4>
                  <p style={styles.invoiceText}>
                    Your items are being hand-packaged at our curation warehouse. Standard delivery is scheduled within 3 business days. A tracking link will be emailed to you shortly.
                  </p>
                </div>
              </div>

              <div style={styles.invoiceFooter}>
                <a href="/collections" style={styles.returnShoppingBtn}>
                  Return to Shopping
                </a>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE CART STATE */
            <div style={styles.splitLayout}>
              
              {/* LEFT: Items List */}
              <div style={styles.itemsColumn}>
                {isLoading ? (
                  <p style={styles.emptyText}>Loading shopping bag details...</p>
                ) : items.length === 0 ? (
                  <div style={styles.emptyCartBox}>
                    <ShoppingBag size={48} style={styles.emptyCartIcon} />
                    <p style={styles.emptyText}>Your shopping cart is currently empty.</p>
                    <a href="/collections" style={styles.browseBtn}>
                      Browse Collections
                    </a>
                  </div>
                ) : (
                  <div style={styles.itemsList}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={styles.itemCard}
                      >
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
                            <h3 style={styles.itemName}>{item.product?.name || 'Curated Hamper'}</h3>
                            <p style={styles.itemDesc}>{item.product?.shortDescription}</p>
                            
                            {/* Detailed Box packaging display for custom curation */}
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

                            {!item.customizationState?.selectedItemIds && renderItemCustomizations(item.customizationState)}
                          </div>
                          
                          <div style={styles.itemPriceCol} />
                        </div>

                        <div style={styles.itemFooter}>
                          <button
                            onClick={() => handleRemoveItem(item.productId, item.customizationState)}
                            style={styles.removeBtn}
                          >
                            <Trash2 size={15} style={{ marginRight: 6 }} /> Remove
                          </button>

                          <div style={styles.itemQtyControl}>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1), item.customizationState, item.priceSnapshot)}
                              style={styles.qtyBtn}
                            >
                              -
                            </button>
                            <span style={styles.qtyValue}>{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.customizationState, item.priceSnapshot)}
                              style={styles.qtyBtn}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Checkout Form */}
              <div style={styles.checkoutColumn}>
                {items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={styles.checkoutCard}
                  >
                    <h3 style={styles.checkoutTitle}>Secure Checkout</h3>

                    {/* Auth Gate — show sign-in wall if not logged in */}
                    {!sessionUser ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        background: 'rgba(191,161,111,0.04)',
                        borderRadius: '12px',
                        border: '1px solid rgba(191,161,111,0.18)',
                      }}>
                        <div style={{
                          width: 56, height: 56,
                          borderRadius: '50%',
                          background: 'rgba(191,161,111,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.6rem',
                        }}>
                          🔒
                        </div>
                        <div>
                          <p style={{ color: '#bfa16f', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                            Sign in to place your order
                          </p>
                          <p style={{ color: '#a8a29e', fontSize: '0.8rem', fontFamily: 'var(--font-sans)', lineHeight: 1.6, letterSpacing: '0.02em' }}>
                            Your cart is saved. Sign in or create an account to continue checkout securely.
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/login?error=' + encodeURIComponent('Please sign in to complete your order.'))}
                          style={{
                            background: 'linear-gradient(135deg, #bfa16f, #d4b483)',
                            color: '#1a1108',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.85rem 2.5rem',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          Sign In to Continue
                        </button>
                        <p style={{ color: '#78716c', fontSize: '0.72rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.03em' }}>
                          No account?{' '}
                          <span
                            onClick={() => router.push('/login')}
                            style={{ color: '#bfa16f', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Create one free in seconds
                          </span>
                        </p>
                      </div>
                    ) : (
                    <form onSubmit={handleCheckout} style={styles.checkoutForm}>
                      {/* Section 1: Customer Info */}
                      <div style={styles.formSection}>
                        <h4 style={styles.sectionHeader}><User size={14} style={styles.sectionIcon} /> Contact Information</h4>
                        <div style={styles.formGrid}>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address *</label>
                            <input
                              type="email"
                              value={customerDetails.email}
                              onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                              placeholder="e.g. jane@devereaux.com"
                              style={styles.formInput}
                            />
                            {errors.email && <span style={styles.formError}>{errors.email}</span>}
                          </div>
                          
                          <div style={styles.formRow}>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>First Name *</label>
                              <input
                                type="text"
                                value={customerDetails.firstName}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, firstName: e.target.value })}
                                placeholder="Jane"
                                style={styles.formInput}
                              />
                              {errors.firstName && <span style={styles.formError}>{errors.firstName}</span>}
                            </div>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>Last Name *</label>
                              <input
                                type="text"
                                value={customerDetails.lastName}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, lastName: e.target.value })}
                                placeholder="Devereaux"
                                style={styles.formInput}
                              />
                              {errors.lastName && <span style={styles.formError}>{errors.lastName}</span>}
                            </div>
                          </div>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                              type="text"
                              value={customerDetails.phone}
                              onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                              placeholder="e.g. +1 (555) 014-4283"
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Delivery details */}
                      <div style={styles.formSection}>
                        <h4 style={styles.sectionHeader}><MapPin size={14} style={styles.sectionIcon} /> Shipping Address</h4>
                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Address Line 1 *</label>
                            <input
                              type="text"
                              value={deliveryDetails.addressLine1}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine1: e.target.value })}
                              placeholder="e.g. 848 Fifth Avenue"
                              style={styles.formInput}
                            />
                            {errors.address && <span style={styles.formError}>{errors.address}</span>}
                          </div>

                          <div style={styles.formRow}>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>City *</label>
                              <input
                                type="text"
                                value={deliveryDetails.city}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                                placeholder="New York"
                                style={styles.formInput}
                              />
                              {errors.city && <span style={styles.formError}>{errors.city}</span>}
                            </div>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>State *</label>
                              <input
                                type="text"
                                value={deliveryDetails.state}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                                placeholder="NY"
                                style={styles.formInput}
                              />
                              {errors.state && <span style={styles.formError}>{errors.state}</span>}
                            </div>
                          </div>

                          <div style={styles.formRow}>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>ZIP Code *</label>
                              <input
                                type="text"
                                value={deliveryDetails.zipCode}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, zipCode: e.target.value })}
                                placeholder="10065"
                                style={styles.formInput}
                              />
                              {errors.zip && <span style={styles.formError}>{errors.zip}</span>}
                            </div>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>Country</label>
                              <input
                                type="text"
                                disabled
                                value={deliveryDetails.country}
                                style={styles.formInputDisabled}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Payment (Simulated) */}
                      <div style={styles.formSection}>
                        <h4 style={styles.sectionHeader}><CreditCard size={14} style={styles.sectionIcon} /> Payment Method (Simulated)</h4>
                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Card Number</label>
                            <input
                              type="text"
                              value={paymentDetails.cardNumber}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                              style={styles.formInput}
                            />
                          </div>
                          
                          <div style={styles.formRow}>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>Expiration</label>
                              <input
                                type="text"
                                value={paymentDetails.expiry}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                                style={styles.formInput}
                              />
                            </div>
                            <div style={styles.formGroupHalf}>
                              <label style={styles.label}>CVV</label>
                              <input
                                type="text"
                                value={paymentDetails.cvv}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                                style={styles.formInput}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Curation Dispatch Guidelines */}
                      <div style={styles.pricingSummary}>
                        <div style={styles.priceRowItem}>
                          <span>Packaging Protocol:</span>
                          <span>Standard Luxury Curation</span>
                        </div>
                        <div style={styles.priceRowItem}>
                          <span>Transit Class:</span>
                          <span>Secure Hand-packaged Delivery</span>
                        </div>
                        <div style={styles.summaryDivider} />
                        <div style={styles.priceRowGrand}>
                          <span>Authorization:</span>
                          <span style={{ color: '#bfa16f', fontSize: '0.9rem', fontWeight: 'bold' }}>Ready for Dispatch</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCheckingOut}
                        style={styles.checkoutSubmitBtn}
                      >
                        {isCheckingOut ? 'Authorizing Order...' : 'Confirm & Place Order'}
                      </button>
                    </form>
                    )}
                  </motion.div>
                )}
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    backgroundColor: '#faf8f5', // Pearl-white background
    color: '#2e2520', // Charcoal clay text
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
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    letterSpacing: '0.3em',
    color: '#bfa16f', // Luxury gold
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '3.2rem',
    fontWeight: '300',
    letterSpacing: '0.02em',
    color: '#2e2520',
    marginBottom: '1rem',
  },
  divider: {
    height: '1px',
    backgroundColor: '#bfa16f',
    margin: '0.5rem auto 1.5rem auto',
    width: '60px',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(340px, 1fr)',
    gap: '3rem',
    alignItems: 'start',
  },
  itemsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  emptyCartBox: {
    backgroundColor: '#f5f2eb', // Soft pearl contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric frames
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
  },
  emptyCartIcon: {
    color: '#bfa16f',
  },
  emptyText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    color: '#7a6e64',
  },
  browseBtn: {
    backgroundColor: '#2e2520', // Dark bronze-brown/charcoal clay
    color: '#faf8f5',
    padding: '12px 24px',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  itemCard: {
    backgroundColor: '#f5f2eb', // Soft pearl contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric frames
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
  },
  itemMain: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1.5rem',
  },
  itemCategory: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#bfa16f',
    fontWeight: '600',
    display: 'block',
    marginBottom: '4px',
  },
  itemName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '4px',
  },
  itemDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    lineHeight: '1.4',
    marginBottom: '10px',
  },
  itemPriceCol: {
    textAlign: 'right',
    flexShrink: 0,
  },
  itemUnitPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2e2520',
  },
  itemCustomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#faf8f5', // Pearl-white background
    border: '1px solid rgba(191, 161, 111, 0.15)',
    marginTop: '10px',
  },
  itemCustomChoice: {
    display: 'flex',
    gap: '6px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
  },
  customChoiceKey: {
    color: '#7a6e64',
    fontWeight: '500',
  },
  customChoiceVal: {
    color: '#2e2520',
    fontWeight: '600',
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(191, 161, 111, 0.15)',
    paddingTop: '1rem',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#a8a29e',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    outline: 'none',
    transition: 'color 0.2s',
  },
  itemQtyControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '4px',
    backgroundColor: '#faf8f5',
  },
  qtyBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2e2520',
    padding: '4px 10px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
  },
  qtyValue: {
    padding: '0 8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#2e2520',
  },
  checkoutColumn: {
    position: 'sticky',
    top: '7rem',
  },
  checkoutCard: {
    backgroundColor: '#f5f2eb', // Soft pearl contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric frames
    border: '1px solid rgba(191, 161, 111, 0.2)',
    padding: '2rem',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
  },
  checkoutTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.4rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '0.75rem',
  },
  checkoutForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeader: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#bfa16f',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sectionIcon: {
    color: '#bfa16f',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formRow: {
    display: 'flex',
    gap: '10px',
  },
  formGroupHalf: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.78rem',
    color: '#7a6e64',
    fontWeight: '600',
  },
  formInput: {
    padding: '10px 12px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '6px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  formInputDisabled: {
    padding: '10px 12px',
    backgroundColor: '#fbf9f4',
    border: '1px solid rgba(191, 161, 111, 0.1)',
    borderRadius: '6px',
    color: '#a8a29e',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  formError: {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '1px',
  },
  pricingSummary: {
    backgroundColor: '#faf8f5', // Pearl-white background
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  priceRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'rgba(191, 161, 111, 0.15)',
    margin: '4px 0',
  },
  priceRowGrand: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#2e2520',
    fontWeight: '600',
  },
  checkoutSubmitBtn: {
    backgroundColor: '#2e2520', // Charcoal clay dark base
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  /* INVOICE CARD SUCCESS STYLES */
  invoiceCard: {
    backgroundColor: '#f5f2eb', // Soft pearl contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric frames
    border: '1px solid rgba(191, 161, 111, 0.2)',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
    padding: '3rem',
    maxWidth: '650px',
    margin: '0 auto',
  },
  invoiceHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  invoiceSuccessIcon: {
    color: '#bfa16f',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  invoiceTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '6px',
  },
  invoiceSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#7a6e64',
  },
  orderId: {
    color: '#bfa16f',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  invoiceBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    borderTop: '1px solid rgba(191, 161, 111, 0.15)',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '2rem 0',
  },
  invoiceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  invoiceSectionTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#bfa16f',
    fontWeight: '600',
  },
  invoiceText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#2e2520',
    lineHeight: '1.6',
  },
  invoiceTotals: {
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  totalRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
  },
  totalRowGrand: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    color: '#2e2520',
    fontWeight: '700',
    borderTop: '1px solid rgba(191, 161, 111, 0.15)',
    paddingTop: '8px',
    marginTop: '4px',
  },
  invoiceFooter: {
    textAlign: 'center',
    marginTop: '2.5rem',
  },
  returnShoppingBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 30px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    display: 'inline-block',
  },
  itemImageContainer: {
    width: '90px',
    height: '90px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    flexShrink: 0,
    backgroundColor: '#faf8f5',
    position: 'relative',
  },
  itemProductImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  curationContainer: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#faf8f5',
    border: '1px dashed rgba(191, 161, 111, 0.25)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  curationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  curationTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#bfa16f',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  curationBadge: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    backgroundColor: 'rgba(191, 161, 111, 0.1)',
    color: '#2e2520',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  curationBoxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  curationBoxCard: {
    backgroundColor: '#f5f2eb',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  curationBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  curationBoxName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.78rem',
    color: '#2e2520',
    fontWeight: '500',
  },
  curationBoxCap: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    color: '#7a6e64',
  },
  curationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
  },
  curationSlot: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
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
    borderColor: 'rgba(191, 161, 111, 0.15)',
    borderStyle: 'dashed',
  },
  curationSlotImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};
