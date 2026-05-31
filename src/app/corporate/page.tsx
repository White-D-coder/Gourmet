'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Mail, Phone, User, DollarSign, Package, Calendar, Edit3, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CorporateGifting() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    budget: 5000,
    quantityRange: '50-100',
    occasion: 'Holiday Gifting',
    requirements: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
    if (!formData.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget.toString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert(data.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get budget label
  const getBudgetLabel = (val: number) => {
    if (val >= 50000) return '$50,000+ (Enterprise Custom)';
    return `$${val.toLocaleString()}`;
  };

  return (
    <main style={styles.container}>
      {/* Background spot light gradient */}
      <div style={styles.spotlight} />

      <div style={styles.content}>
        {/* Title Block */}
        <div style={styles.header}>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.subtitle}
          >
            GORMETCO PRESTIGE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={styles.title}
          >
            Corporate Gifting Concierge
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={styles.divider}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            style={styles.description}
          >
            Establish profound connections. From client appreciation to annual rewards, our team is ready to curate and engrave bespoke collections aligned to your corporate values.
          </motion.p>
        </div>

        {/* Multi-step Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.card}
        >
          {/* Progress Indicators */}
          {!isSuccess && (
            <div style={styles.progressContainer}>
              <div style={styles.progressStep}>
                <span style={step === 1 ? styles.activeStepNum : styles.stepNum}>1</span>
                <span style={styles.stepText}>Contact Details</span>
              </div>
              <div style={styles.progressLine}>
                <div style={{ ...styles.progressLineActive, width: step === 2 ? '100%' : '0%' }} />
              </div>
              <div style={styles.progressStep}>
                <span style={step === 2 ? styles.activeStepNum : styles.stepNum}>2</span>
                <span style={styles.stepText}>Requirements</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  style={styles.formStep}
                >
                  <h3 style={styles.formTitle}>Identify Your Organization</h3>
                  <p style={styles.formSubtitle}>Let us know who we are partnering with to prepare custom mockups.</p>

                  <div style={styles.grid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Company Name *</label>
                      <div style={styles.inputWrapper}>
                        <Briefcase size={16} style={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="e.g. Acme Corporation"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      {errors.companyName && <span style={styles.errorText}>{errors.companyName}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contact Name *</label>
                      <div style={styles.inputWrapper}>
                        <User size={16} style={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="e.g. Victoria Sterling"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      {errors.contactName && <span style={styles.errorText}>{errors.contactName}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Corporate Email *</label>
                      <div style={styles.inputWrapper}>
                        <Mail size={16} style={styles.inputIcon} />
                        <input
                          type="email"
                          placeholder="e.g. v.sterling@acme.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <div style={styles.inputWrapper}>
                        <Phone size={16} style={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="e.g. +1 (555) 019-2834"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.btnRow}>
                    <button onClick={handleNext} style={styles.primaryBtn}>
                      Continue to Details <ArrowRight size={16} style={{ marginLeft: 8 }} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  style={styles.formStep}
                >
                  <h3 style={styles.formTitle}>Define Gifting Parameters</h3>
                  <p style={styles.formSubtitle}>Select budget ranges and specifications for custom curation.</p>

                  <div style={styles.grid}>
                    <div style={styles.formGroupFull}>
                      <div style={styles.sliderHeader}>
                        <label style={styles.label}>Project Budget: <span style={styles.budgetVal}>{getBudgetLabel(formData.budget)}</span></label>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                        style={styles.slider}
                      />
                      <div style={styles.sliderLabels}>
                        <span>$1,000</span>
                        <span>$15,000</span>
                        <span>$30,000</span>
                        <span>$50,000+</span>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Occasion / Campaign Theme</label>
                      <div style={styles.inputWrapper}>
                        <Calendar size={16} style={styles.inputIcon} />
                        <select
                          value={formData.occasion}
                          onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                          style={styles.select}
                        >
                          <option value="Holiday Gifting">Holiday Gifting</option>
                          <option value="Brand Milestones">Brand Milestones</option>
                          <option value="Client Appreciation">Client Appreciation</option>
                          <option value="Executive Appreciations">Executive Appreciations</option>
                          <option value="Wedding / Large Gala">Wedding / Large Gala</option>
                          <option value="Other">Other Occasions</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Expected Quantity</label>
                      <div style={styles.inputWrapper}>
                        <Package size={16} style={styles.inputIcon} />
                        <select
                          value={formData.quantityRange}
                          onChange={(e) => setFormData({ ...formData, quantityRange: e.target.value })}
                          style={styles.select}
                        >
                          <option value="10-25">10 - 25 units</option>
                          <option value="25-50">25 - 50 units</option>
                          <option value="50-100">50 - 100 units</option>
                          <option value="100-250">100 - 250 units</option>
                          <option value="250+">250+ units (Bulk Prestige)</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGroupFull}>
                      <label style={styles.label}>Custom Customizations & Design Requirements</label>
                      <div style={styles.textareaWrapper}>
                        <Edit3 size={16} style={styles.textareaIcon} />
                        <textarea
                          placeholder="e.g. We require our company logo engraved on walnut box lids, custom green satin ribbons, and premium contents including chocolates and candles..."
                          rows={4}
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          style={styles.textarea}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.btnRow}>
                    <button onClick={handleBack} style={styles.secondaryBtn}>
                      <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={styles.primaryBtn}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={styles.successBlock}
              >
                <CheckCircle size={64} style={styles.successIcon} />
                <h2 style={styles.successTitle}>Inquiry Logged Successfully</h2>
                <p style={styles.successSubtitle}>
                  Thank you, <strong>{formData.contactName}</strong>. A GormetCo Concierge Representative has been assigned to your organization (<strong>{formData.companyName}</strong>).
                </p>

                <div style={styles.summaryBox}>
                  <h4 style={styles.summaryTitle}>Inquiry Record Summary:</h4>
                  <ul style={styles.summaryList}>
                    <li><strong>Occasion:</strong> {formData.occasion}</li>
                    <li><strong>Quantity:</strong> {formData.quantityRange} items</li>
                    <li><strong>Est. Budget:</strong> {getBudgetLabel(formData.budget)}</li>
                    {formData.requirements && (
                      <li><strong>Requirements:</strong> "{formData.requirements}"</li>
                    )}
                  </ul>
                </div>

                <p style={styles.followUpText}>
                  We have sent a confirmation email to <strong>{formData.email}</strong>. Our custom curators will assemble digital box configurations and contact you within 4 hours.
                </p>

                <a href="/collections" style={styles.returnBtn}>
                  Return to Collections
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

// Luxurious Vanilla styles
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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    maxWidth: '850px',
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
    fontSize: '1rem',
    color: '#7a6e64',
    lineHeight: '1.7',
    maxWidth: '650px',
    margin: '0 auto',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#f5f2eb', // Soft pearl contrast base
    borderRadius: '20px 4px 20px 4px', // Asymmetric frames
    border: '1px solid rgba(191, 161, 111, 0.15)',
    boxShadow: '0 10px 30px -10px rgba(46, 37, 32, 0.08)',
    padding: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(46, 37, 32, 0.05)',
    color: '#7a6e64',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  activeStepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#bfa16f',
    color: '#faf8f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '600',
    boxShadow: '0 0 10px rgba(191, 161, 111, 0.3)',
  },
  stepText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#2e2520',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: '2px',
    backgroundColor: 'rgba(46, 37, 32, 0.05)',
    margin: '0 15px',
    borderRadius: '2px',
    position: 'relative',
  },
  progressLineActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#bfa16f',
    transition: 'width 0.4s ease',
  },
  formStep: {
    display: 'flex',
    flexDirection: 'column',
  },
  formTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.6rem',
    fontWeight: '400',
    marginBottom: '0.5rem',
    color: '#2e2520',
  },
  formSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#7a6e64',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    gridColumn: '1 / -1',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    fontWeight: '600',
    letterSpacing: '0.02em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#bfa16f',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '8px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '8px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textareaIcon: {
    position: 'absolute',
    left: '12px',
    top: '14px',
    color: '#bfa16f',
  },
  textarea: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.2)',
    borderRadius: '8px',
    color: '#2e2520',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    lineHeight: '1.5',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  budgetVal: {
    color: '#bfa16f',
    fontWeight: '600',
    fontSize: '1rem',
  },
  slider: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(46, 37, 32, 0.08)',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    accentColor: '#bfa16f',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#a8a29e',
    marginTop: '4px',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '2.5rem',
    borderTop: '1px solid rgba(191, 161, 111, 0.15)',
    paddingTop: '1.5rem',
  },
  primaryBtn: {
    backgroundColor: '#2e2520', // Charcoal clay dark base
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#2e2520',
    border: '1px solid rgba(46, 37, 32, 0.25)',
    borderRadius: '8px',
    padding: '12px 24px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.8rem',
    marginTop: '2px',
  },
  successBlock: {
    textAlign: 'center',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIcon: {
    color: '#bfa16f',
    marginBottom: '1.5rem',
  },
  successTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: '400',
    color: '#2e2520',
    marginBottom: '1rem',
  },
  successSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.05rem',
    color: '#7a6e64',
    lineHeight: '1.6',
    maxWidth: '550px',
    marginBottom: '2rem',
  },
  summaryBox: {
    backgroundColor: '#faf8f5', // Pearl-white background
    borderRadius: '12px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'left',
    marginBottom: '2rem',
  },
  summaryTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#bfa16f',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  summaryList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#2e2520',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  followUpText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#7a6e64',
    lineHeight: '1.6',
    maxWidth: '600px',
    marginBottom: '2.5rem',
  },
  returnBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 30px',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
};
