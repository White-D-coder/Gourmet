'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Gift, MessageSquare, ShoppingBag, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BespokeConstructor() {
  const router = useRouter();
  
  // Customization Options
  const baseBoxOptions = [
    { id: 'box-ivory', label: 'Classic Ivory Silk Box', priceAdjust: 0, desc: 'A soft, fabric-wrapped box in pure ivory texture.' },
    { id: 'box-mahogany', label: 'Royal Mahogany Chest', priceAdjust: 20, desc: 'Indulgent solid wood construction with brass hinges.' },
    { id: 'box-velvet', label: 'Black Velvet Cylinder', priceAdjust: 10, desc: 'Sleek, rounded box lined with rich obsidian velvet.' },
  ];

  const ribbonOptions = [
    { id: 'ribbon-ivory', label: 'Ivory Satin Ribbon', priceAdjust: 0, desc: 'Smooth, classic satin ribbon wrapping for timeless elegance.' },
    { id: 'ribbon-gold', label: 'Gold Metallic Ribbon', priceAdjust: 5, desc: 'Glistening metallic thread weave that adds a regal luster.' },
    { id: 'ribbon-emerald', label: 'Emerald Velvet Ribbon', priceAdjust: 8, desc: 'Deep emerald velvet ribbon for a rich tactile experience.' },
  ];

  const plaqueOptions = [
    { id: 'plaque-none', label: 'No Engraving Needed', priceAdjust: 0, desc: 'Keep the box clean and minimalist without metallic plates.' },
    { id: 'plaque-brass', label: 'Personalized Brass Plate', priceAdjust: 15, desc: 'Artisanal engraved brass plaque pinned to the box lid.' },
  ];

  // State
  const [selectedBox, setSelectedBox] = useState(baseBoxOptions[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(ribbonOptions[0]);
  const [selectedPlaque, setSelectedPlaque] = useState(plaqueOptions[0]);
  
  const [engravingText, setEngravingText] = useState('');
  const [giftCardText, setGiftCardText] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [isInquiryMode, setIsInquiryMode] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    companyName: 'Private Event (Bespoke)',
    contactName: '',
    email: '',
    phone: '',
    occasion: 'Wedding Favors',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Pricing calculations
  const basePrice = 45; // Base price of bespoke gift box
  const upgradesPrice = selectedBox.priceAdjust + selectedRibbon.priceAdjust + selectedPlaque.priceAdjust;
  const unitPrice = basePrice + upgradesPrice;
  const totalPrice = unitPrice * quantity;

  // Add to Shopping Bag handler
  const handleAddToBag = async () => {
    setIsAddingToCart(true);
    
    // Fetch product details first to get the real product ID of Bespoke Gift Box
    try {
      const prodRes = await fetch('/api/products?slug=bespoke-gift-box');
      const prodData = await prodRes.json();
      
      if (!prodData.success || !prodData.products || prodData.products.length === 0) {
        alert('Could not find the Bespoke Gift Box configuration in the database.');
        setIsAddingToCart(false);
        return;
      }
      
      const bespokeBoxProduct = prodData.products[0];
      const variantId = bespokeBoxProduct.variants[0]?.id; // Standard variant

      const customizationState = {
        'Packaging Base Box': selectedBox.label,
        'Satin Ribbon Selection': selectedRibbon.label,
        'Engraved Message Box Plaque': selectedPlaque.label,
        'Engraving Message': engravingText || 'None',
        'Greeting Card message': giftCardText || 'None',
        variantId, // Store variant ID in customization state
      };

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: bespokeBoxProduct.id,
          quantity,
          customizationState,
          priceSnapshot: unitPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to Cart page
        router.push('/cart');
      } else {
        alert(data.error || 'Failed to add item to bag.');
      }
    } catch (err) {
      console.error('Error adding bespoke to cart:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Submit Bespoke Inquiry handler
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};
    if (!inquiryData.contactName.trim()) errs.contactName = 'Name is required';
    if (!inquiryData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(inquiryData.email)) {
      errs.email = 'Valid email is required';
    }
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmittingInquiry(true);

    const detailedRequirements = `Bespoke configuration details:
- Base Box: ${selectedBox.label} (+$${selectedBox.priceAdjust})
- Ribbon: ${selectedRibbon.label} (+$${selectedRibbon.priceAdjust})
- Plaque: ${selectedPlaque.label} (+$${selectedPlaque.priceAdjust})
- Engraving Text: "${engravingText || 'None'}"
- Greeting Card: "${giftCardText || 'None'}"
- Target Quantity: ${quantity} units`;

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: inquiryData.companyName || 'Private Event',
          contactName: inquiryData.contactName,
          email: inquiryData.email,
          phone: inquiryData.phone,
          occasion: inquiryData.occasion,
          budget: totalPrice.toString(),
          quantityRange: `${quantity}`,
          requirements: detailedRequirements,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInquirySubmitted(true);
      } else {
        alert(data.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error('Error submitting bespoke inquiry:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.spotlight} />
      
      <div style={styles.content}>
        {/* Title */}
        <div style={styles.header}>
          <p style={styles.subtitle}>BESPOKE LUXURY COMMISSION</p>
          <h1 style={styles.title}>Bespoke Favor Constructor</h1>
          <div style={styles.divider} />
          <p style={styles.description}>
            Curate a personal monument. Tailor each element of our luxury gift box wrapping, ribbon ties, greeting scripts, and metallic seals to fit your occasion's theme.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10 w-full">
          
          {/* LEFT: Configurator Controls */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12 w-full">
            <AnimatePresence mode="wait">
              {!isInquiryMode ? (
                <motion.div
                  key="builder"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-12"
                >
                  {/* Step 1: Base Box Selection */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>1. Select Base Keepsake Box</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {baseBoxOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedBox(opt)}
                          style={{
                            ...styles.optionCardWithImage,
                            borderColor: selectedBox.id === opt.id ? '#bfa16f' : 'rgba(191, 161, 111, 0.15)',
                            backgroundColor: selectedBox.id === opt.id ? 'rgba(191, 161, 111, 0.04)' : '#faf8f5',
                          }}
                        >
                          <div style={styles.optionImageWrapper}>
                            <img
                              src={
                                opt.id === 'box-ivory'
                                  ? '/ivory_hamper.png'
                                  : opt.id === 'box-mahogany'
                                    ? '/executive_hamper.png'
                                    : '/botanical_hamper.png'
                              }
                              alt={opt.label}
                              style={styles.optionImage}
                            />
                          </div>
                          <div style={styles.optionCardContent}>
                            <div style={styles.optionHeader}>
                              <span style={styles.optionLabel}>{opt.label}</span>
                              <span style={styles.optionPrice}>
                                {opt.priceAdjust > 0 ? `+$${opt.priceAdjust}` : 'Included'}
                              </span>
                            </div>
                            <p style={styles.optionDesc}>{opt.desc}</p>
                          </div>
                          {selectedBox.id === opt.id && (
                            <div style={styles.checkIconOnImage}>
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Ribbon selection */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>2. Choose Ribbon Selection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ribbonOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedRibbon(opt)}
                          style={{
                            ...styles.optionCard,
                            borderColor: selectedRibbon.id === opt.id ? '#bfa16f' : 'rgba(191, 161, 111, 0.15)',
                            backgroundColor: selectedRibbon.id === opt.id ? 'rgba(191, 161, 111, 0.04)' : '#faf8f5',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div 
                              style={{
                                ...styles.ribbonSwatch,
                                backgroundColor: 
                                  opt.id === 'ribbon-ivory'
                                    ? '#ffffff'
                                    : opt.id === 'ribbon-gold'
                                      ? '#d4af37'
                                      : '#047857',
                                border: opt.id === 'ribbon-ivory' ? '1px solid rgba(191, 161, 111, 0.25)' : 'none',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={styles.optionHeader}>
                                <span style={styles.optionLabel}>{opt.label}</span>
                                <span style={styles.optionPrice}>
                                  {opt.priceAdjust > 0 ? `+$${opt.priceAdjust}` : 'Included'}
                                </span>
                              </div>
                              <p style={styles.optionDesc}>{opt.desc}</p>
                            </div>
                          </div>
                          {selectedRibbon.id === opt.id && <Check size={16} style={styles.checkIcon} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Engraved Plaque selection */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>3. Personalization Plaque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plaqueOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedPlaque(opt);
                            if (opt.id === 'plaque-none') setEngravingText('');
                          }}
                          style={{
                            ...styles.optionCard,
                            borderColor: selectedPlaque.id === opt.id ? '#bfa16f' : 'rgba(191, 161, 111, 0.15)',
                            backgroundColor: selectedPlaque.id === opt.id ? 'rgba(191, 161, 111, 0.04)' : '#faf8f5',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div 
                              style={{
                                ...styles.plaqueSwatch,
                                background: 
                                  opt.id === 'plaque-none'
                                    ? 'transparent'
                                    : 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                                border: opt.id === 'plaque-none' ? '2px dashed rgba(191, 161, 111, 0.25)' : 'none',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={styles.optionHeader}>
                                <span style={styles.optionLabel}>{opt.label}</span>
                                <span style={styles.optionPrice}>
                                  {opt.priceAdjust > 0 ? `+$${opt.priceAdjust}` : 'Included'}
                                </span>
                              </div>
                              <p style={styles.optionDesc}>{opt.desc}</p>
                            </div>
                          </div>
                          {selectedPlaque.id === opt.id && <Check size={16} style={styles.checkIcon} />}
                        </div>
                      ))}
                    </div>

                    {selectedPlaque.id === 'plaque-brass' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={styles.textInputGroup}
                      >
                        <label style={styles.inputLabel}>Engraved Plate Text (Max 40 chars)</label>
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="e.g. Victoria & James — June 2026"
                          value={engravingText}
                          onChange={(e) => setEngravingText(e.target.value)}
                          style={styles.textInput}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Step 4: Greeting Card message */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>4. Handwritten Greeting Note</h3>
                    <div style={styles.textInputGroup}>
                      <label style={styles.inputLabel}>Message content (Max 100 chars)</label>
                      <textarea
                        maxLength={100}
                        rows={2}
                        placeholder="e.g. Deepest appreciation for celebrating this milestone event with us. With love..."
                        value={giftCardText}
                        onChange={(e) => setGiftCardText(e.target.value)}
                        style={styles.textArea}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="inquiryForm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={styles.section}>
                    <button onClick={() => setIsInquiryMode(false)} style={styles.backLink}>
                      <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back to Builder
                    </button>
                    <h3 style={styles.formTitle}>Submit Bulk Custom Inquiry</h3>
                    <p style={styles.formSubtitle}>Perfect for large event favors, corporate distributions, or gala curations.</p>

                    {!inquirySubmitted ? (
                      <form onSubmit={handleInquirySubmit} style={styles.inquiryForm}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Contact Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Elizabeth Devereaux"
                            value={inquiryData.contactName}
                            onChange={(e) => setInquiryData({ ...inquiryData, contactName: e.target.value })}
                            style={styles.formInput}
                          />
                          {errors.contactName && <span style={styles.errorText}>{errors.contactName}</span>}
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Email Address *</label>
                          <input
                            type="email"
                            placeholder="e.g. e.devereaux@galaevents.com"
                            value={inquiryData.email}
                            onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                            style={styles.formInput}
                          />
                          {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +1 (555) 012-3456"
                            value={inquiryData.phone}
                            onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                            style={styles.formInput}
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Company / Event Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Devereaux-Vane Wedding"
                            value={inquiryData.companyName}
                            onChange={(e) => setInquiryData({ ...inquiryData, companyName: e.target.value })}
                            style={styles.formInput}
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Event Occasion</label>
                          <select
                            value={inquiryData.occasion}
                            onChange={(e) => setInquiryData({ ...inquiryData, occasion: e.target.value })}
                            style={styles.formSelect}
                          >
                            <option value="Wedding Favors">Wedding Favors</option>
                            <option value="Private Large Gala">Private Large Gala</option>
                            <option value="Executive Appreciation">Executive Appreciation</option>
                            <option value="Annual Retainer Gifting">Annual Retainer Gifting</option>
                            <option value="Other">Other Bespoke Event</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingInquiry}
                          style={styles.submitInquiryBtn}
                        >
                          {isSubmittingInquiry ? 'Submitting Inquiry...' : 'Submit Bulk Request'}
                        </button>
                      </form>
                    ) : (
                      <div style={styles.successBlock}>
                        <Check size={48} style={styles.successIcon} />
                        <h4 style={styles.successHeading}>Bespoke Inquiry Received</h4>
                        <p style={styles.successMessage}>
                          Your personalized favor configurations and contact details have been stored. Our boutique event planners will email you a visual mockup and catalog quote within 4 hours.
                        </p>
                        <button onClick={() => { setInquirySubmitted(false); setIsInquiryMode(false); }} style={styles.returnBtn}>
                          Configure Another Box
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Live Price Card & CTAs */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32 flex flex-col gap-6 w-full">
            
            {/* Visual live preview card */}
            <div style={styles.previewCard}>
              <span style={styles.previewLabel}>LIVE PACKAGING PREVIEW</span>
              <div style={styles.previewWrapper}>
                <div style={{
                  ...styles.previewBackdrop,
                  backgroundImage: `url(${
                    selectedBox.id === 'box-ivory' 
                      ? '/luxury_pearl_backdrop.png' 
                      : selectedBox.id === 'box-mahogany' 
                        ? '/luxury_interior_backdrop.png' 
                        : '/luxury_wall_backdrop.png'
                  })`
                }} />
                
                <div style={styles.previewBoxContainer}>
                  <img
                    src={
                      selectedBox.id === 'box-ivory'
                        ? '/ivory_hamper.png'
                        : selectedBox.id === 'box-mahogany'
                          ? '/executive_hamper.png'
                          : '/botanical_hamper.png'
                    }
                    alt={selectedBox.label}
                    style={styles.previewBoxImage}
                  />
                  
                  <div 
                    style={{
                      ...styles.previewRibbonOverlay,
                      backgroundColor: 
                        selectedRibbon.id === 'ribbon-ivory'
                          ? 'rgba(255, 255, 255, 0.15)'
                          : selectedRibbon.id === 'ribbon-gold'
                            ? 'rgba(212, 175, 55, 0.45)'
                            : 'rgba(4, 120, 87, 0.55)',
                    }}
                  />

                  {selectedPlaque.id === 'plaque-brass' && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={styles.previewPlaque}
                    >
                      <div style={styles.previewPlaqueInner}>
                        <span style={styles.previewPlaqueText}>
                          {engravingText || 'Your Inscription'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <h3 style={styles.summaryHeader}>Configuration Summary</h3>
              
              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Bespoke Keepsake Box Base</span>
                  <span>$45.00</span>
                </div>
                
                <div style={styles.summaryItem}>
                  <span>{selectedBox.label} upgrade</span>
                  <span>{selectedBox.priceAdjust > 0 ? `+$${selectedBox.priceAdjust.toFixed(2)}` : '$0.00'}</span>
                </div>

                <div style={styles.summaryItem}>
                  <span>{selectedRibbon.label} upgrade</span>
                  <span>{selectedRibbon.priceAdjust > 0 ? `+$${selectedRibbon.priceAdjust.toFixed(2)}` : '$0.00'}</span>
                </div>

                <div style={styles.summaryItem}>
                  <span>{selectedPlaque.label} upgrade</span>
                  <span>{selectedPlaque.priceAdjust > 0 ? `+$${selectedPlaque.priceAdjust.toFixed(2)}` : '$0.00'}</span>
                </div>

                {engravingText && (
                  <div style={styles.summarySubItem}>
                    <span>Plate text:</span>
                    <span style={styles.summaryTextItalic}>"{engravingText}"</span>
                  </div>
                )}

                {giftCardText && (
                  <div style={styles.summarySubItem}>
                    <span>Card text:</span>
                    <span style={styles.summaryTextItalic}>"{giftCardText}"</span>
                  </div>
                )}
              </div>

              <div style={styles.summaryDivider} />

              {/* Quantity Counter */}
              <div style={styles.quantityRow}>
                <span style={styles.quantityLabel}>Quantity</span>
                <div style={styles.quantityCounter}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={styles.counterBtn}>-</button>
                  <span style={styles.counterVal}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={styles.counterBtn}>+</button>
                </div>
              </div>

              <div style={styles.priceRow}>
                <div style={styles.priceSubRow}>
                  <span>Unit Price:</span>
                  <span style={styles.unitVal}>${unitPrice.toFixed(2)}</span>
                </div>
                <div style={styles.priceGrandRow}>
                  <span>Total Amount:</span>
                  <span style={styles.totalVal}>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isInquiryMode && (
                <div style={styles.actionButtons}>
                  <button
                    onClick={handleAddToBag}
                    disabled={isAddingToCart}
                    style={styles.addBagBtn}
                  >
                    <ShoppingBag size={18} style={{ marginRight: 8 }} />
                    {isAddingToCart ? 'Adding to Bag...' : 'Add to Bag'}
                  </button>
                  
                  <button
                    onClick={() => setIsInquiryMode(true)}
                    style={styles.inquireBtn}
                  >
                    <Send size={16} style={{ marginRight: 8 }} />
                    Inquire in Bulk (Gala / Event)
                  </button>
                </div>
              )}
            </div>

            <div style={styles.infoBanner}>
              <Info size={16} style={styles.infoIcon} />
              <p style={styles.infoText}>
                Large commissions (above 25 boxes) qualify for tiered corporate discounts and specialized monogram stamps. Select "Inquire in Bulk" to connect with a representative.
              </p>
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
    maxWidth: '1200px',
    zIndex: 2,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    letterSpacing: '0.35em',
    color: '#bfa16f',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '3rem',
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
  description: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#7a6e64',
    lineHeight: '1.8',
    maxWidth: '650px',
    margin: '0 auto',
    fontWeight: '400',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
    gap: '4rem', // Spacious gap!
    alignItems: 'start',
  },
  controlsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem', // Spacious gap!
  },
  section: {
    backgroundColor: '#f5f2eb', // Soft pearl-white contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric premium frames
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '2.5rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
    paddingBottom: '0.75rem',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px', // Increased gap!
  },
  optionCard: {
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '8px',
    padding: '1.5rem', // Spacious card padding
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    backgroundColor: '#faf8f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  optionHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    marginBottom: '10px',
  },
  optionLabel: {
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    color: '#2e2520',
    fontSize: '0.95rem',
  },
  optionPrice: {
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    color: '#bfa16f',
    fontSize: '0.9rem',
  },
  optionDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    lineHeight: '1.5',
    maxWidth: '100%',
    marginBottom: '1.25rem',
  },
  checkIcon: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    color: '#bfa16f',
  },
  optionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pillBtn: {
    padding: '10px 20px',
    borderRadius: '30px',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  textInputGroup: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflow: 'hidden',
  },
  inputLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  textInput: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '8px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  textArea: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '8px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
  },
  stickySummaryCol: {
    position: 'sticky',
    top: '8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  summaryCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: '20px 4px 20px 4px', // Asymmetric premium frames
    border: '1px solid rgba(191, 161, 111, 0.25)',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
    padding: '2.5rem',
  },
  summaryHeader: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1.5rem',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#3a312a',
  },
  summarySubItem: {
    display: 'flex',
    flexDirection: 'column',
    color: '#7a6e64',
    fontSize: '0.8rem',
    paddingLeft: '10px',
    borderLeft: '1px solid rgba(191, 161, 111, 0.3)',
    marginTop: '-4px',
    gap: '2px',
  },
  summaryTextItalic: {
    fontStyle: 'italic',
    color: '#2e2520',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'rgba(191, 161, 111, 0.15)',
    margin: '1.5rem 0',
  },
  quantityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  quantityLabel: {
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#2e2520',
  },
  quantityCounter: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '6px',
    backgroundColor: '#faf8f5',
    overflow: 'hidden',
  },
  counterBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2e2520',
    padding: '8px 15px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
  },
  counterVal: {
    padding: '0 12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2e2520',
  },
  priceRow: {
    backgroundColor: '#faf8f5',
    borderRadius: '10px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  priceSubRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
  },
  unitVal: {
    color: '#3a312a',
  },
  priceGrandRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    color: '#2e2520',
    fontWeight: '600',
  },
  totalVal: {
    color: '#bfa16f',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  addBagBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  inquireBtn: {
    backgroundColor: 'transparent',
    color: '#2e2520',
    border: '1px solid rgba(46, 37, 32, 0.25)',
    borderRadius: '8px',
    padding: '12px 0',
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  infoBanner: {
    backgroundColor: 'rgba(191, 161, 111, 0.05)',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  infoIcon: {
    color: '#bfa16f',
    flexShrink: 0,
    marginTop: '2px',
  },
  infoText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#7a6e64',
    lineHeight: '1.4',
    margin: 0,
  },
  backLink: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#bfa16f',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: 0,
    outline: 'none',
  },
  formTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    marginBottom: '1.5rem',
  },
  inquiryForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#3a312a',
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
  formSelect: {
    padding: '10px 12px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '6px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  submitInquiryBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 0',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.3s ease',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.75rem',
  },
  successIcon: {
    color: '#bfa16f',
    marginBottom: '1rem',
  },
  successHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.4rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '0.75rem',
  },
  successMessage: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  returnBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #bfa16f',
    color: '#bfa16f',
    borderRadius: '6px',
    padding: '10px 20px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  optionCardWithImage: {
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    backgroundColor: '#faf8f5',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    boxShadow: '0 4px 10px rgba(46, 37, 32, 0.02)',
  },
  optionImageWrapper: {
    width: '100%',
    height: '130px',
    overflow: 'hidden',
    backgroundColor: '#faf8f5',
    borderBottom: '1px solid rgba(191, 161, 111, 0.12)',
    position: 'relative',
  },
  optionImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  optionCardContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  checkIconOnImage: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#faf8f5',
    color: '#bfa16f',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    boxShadow: '0 2px 8px rgba(46, 37, 32, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #bfa16f',
  },
  ribbonSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  },
  plaqueSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(46, 37, 32, 0.2)',
  },
  previewCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: '20px 4px 20px 4px',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  previewLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#bfa16f',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  previewWrapper: {
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(191, 161, 111, 0.15)',
  },
  previewBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(1px) brightness(0.95)',
    transition: 'background-image 0.5s ease',
  },
  previewBoxContainer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBoxImage: {
    width: '160px',
    height: '160px',
    objectFit: 'contain',
    zIndex: 2,
    filter: 'drop-shadow(0 15px 15px rgba(46, 37, 32, 0.25))',
  },
  previewRibbonOverlay: {
    position: 'absolute',
    width: '18px',
    height: '180px',
    zIndex: 3,
    transform: 'rotate(-45deg)',
    pointerEvents: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
    transition: 'background-color 0.3s ease',
  },
  previewPlaque: {
    position: 'absolute',
    bottom: '45px',
    zIndex: 4,
    width: '90px',
    height: '35px',
    background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
    borderRadius: '2px',
    padding: '1px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaqueInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(58, 49, 42, 0.9)',
    borderRadius: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
  },
  previewPlaqueText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '6px',
    color: '#fcf6ba',
    textAlign: 'center',
    lineHeight: '1.1',
    letterSpacing: '0.05em',
    wordBreak: 'break-all',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
};
