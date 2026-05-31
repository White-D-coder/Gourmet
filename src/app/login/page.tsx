'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Building, ShieldAlert, ArrowRight, Check } from 'lucide-react';

function GoogleIcon({ size = 18, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      height={size}
      width={size}
      style={style}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'custom'>('sandbox');

  // Custom login state
  const [customForm, setCustomForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Google Authorization Redirect
  const handleGoogleLogin = () => {
    setIsLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-client-id';
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
  };

  // Preset Sandbox Personas
  const handleSandboxLogin = async (persona: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: persona.email,
          firstName: persona.firstName,
          lastName: persona.lastName,
          role: persona.role,
          phone: persona.phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess(`Successfully authenticated as ${persona.firstName} ${persona.lastName}`);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1200);
      } else {
        alert(data.error || 'Failed to authenticate.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during sandbox login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Form Login
  const handleCustomLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.email || !customForm.firstName) {
      alert('Email and First Name are required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customForm),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess(`Successfully authenticated custom profile: ${customForm.email}`);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1200);
      } else {
        alert(data.error || 'Failed to authenticate.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during custom login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.spotlight} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.card}
      >
        <div style={styles.header}>
          <span style={styles.brand}>GORMETCO PRESTIGE</span>
          <h1 style={styles.title}>Identity Vault Access</h1>
          <div style={styles.divider} />
          <p style={styles.subtitle}>Enter credentials or verify your event organizer account.</p>
        </div>

        {errorMsg && (
          <div style={styles.errorBanner}>
            <ShieldAlert size={16} style={styles.errorIcon} />
            <span>{decodeURIComponent(errorMsg)}</span>
          </div>
        )}

        {formSuccess && (
          <div style={styles.successBanner}>
            <Check size={16} style={styles.successIcon} />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Google Real OAuth Trigger */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading || !!formSuccess}
          style={styles.oauthBtn}
        >
          <GoogleIcon size={18} style={{ marginRight: 10 }} />
          Authorize with Google Secure
        </button>

        <div style={styles.separator}>
          <span style={styles.separatorText}>OR CHOOSE TEST VAULT ACCESS</span>
        </div>

        {/* Tab Selection */}
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('sandbox')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'sandbox' ? styles.tabBtnActive : {})
            }}
          >
            Pre-registered Personas
          </button>
          <button 
            onClick={() => setActiveTab('custom')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'custom' ? styles.tabBtnActive : {})
            }}
          >
            Create Test Account
          </button>
        </div>

        {activeTab === 'sandbox' ? (
          /* Sandbox Persona Cards */
          <div style={styles.sandboxList}>
            {[
              {
                email: 'jane@devereaux.com',
                firstName: 'Jane',
                lastName: 'Devereaux',
                role: 'CUSTOMER',
                label: 'Jane Devereaux',
                desc: 'Standard Consumer client profile. Access shopping bag and order tracking.',
                icon: <User size={18} />
              },
              {
                email: 'v.sterling@acme.com',
                firstName: 'Victoria',
                lastName: 'Sterling',
                role: 'CORPORATE_BUYER',
                label: 'Victoria Sterling',
                desc: 'Corporate Purchasing Agent. Access concierge and submit custom inquiries.',
                icon: <Building size={18} />
              },
              {
                email: 'ops@gourmetco.com',
                firstName: 'Operations',
                lastName: 'Manager',
                role: 'ADMIN',
                label: 'Admin Operations',
                desc: 'Internal Logistics Admin. Full access to database logs and stats dashboard.',
                icon: <ShieldCheck size={18} />
              }
            ].map((persona) => (
              <div 
                key={persona.email} 
                onClick={() => !isLoading && !formSuccess && handleSandboxLogin(persona)}
                style={styles.personaCard}
              >
                <div style={styles.personaIcon}>{persona.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.personaHeader}>
                    <span style={styles.personaLabel}>{persona.label}</span>
                    <span style={styles.personaRole}>{persona.role}</span>
                  </div>
                  <p style={styles.personaDesc}>{persona.desc}</p>
                </div>
                <ArrowRight size={14} style={styles.arrowIcon} />
              </div>
            ))}
          </div>
        ) : (
          /* Custom mock profile form */
          <form onSubmit={handleCustomLoginSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. buyer@custombrand.com"
                value={customForm.email}
                onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Richard"
                  value={customForm.firstName}
                  onChange={(e) => setCustomForm({ ...customForm, firstName: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vane"
                  value={customForm.lastName}
                  onChange={(e) => setCustomForm({ ...customForm, lastName: e.target.value })}
                  style={styles.formInput}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 999-1234"
                value={customForm.phone}
                onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Security Role Authorization</label>
              <select
                value={customForm.role}
                onChange={(e) => setCustomForm({ ...customForm, role: e.target.value })}
                style={styles.formSelect}
              >
                <option value="CUSTOMER">CUSTOMER (Standard User)</option>
                <option value="CORPORATE_BUYER">CORPORATE_BUYER (Gifting Client)</option>
                <option value="ADMIN">ADMIN (Operations Auditor)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !!formSuccess}
              style={styles.submitBtn}
            >
              {isLoading ? 'Creating Test Vault Account...' : 'Generate & Authorize Account'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Initializing Vault Gateways...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
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
    justifyContent: 'center',
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
    background: 'radial-gradient(circle at 50% 25%, rgba(191, 161, 111, 0.08) 0%, transparent 65%)',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#f5f2eb',
    borderRadius: '24px 6px 24px 6px',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    boxShadow: '0 20px 50px -15px rgba(46, 37, 32, 0.1)',
    padding: '3rem',
    zIndex: 2,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  brand: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    letterSpacing: '0.3em',
    color: '#bfa16f',
    fontWeight: '700',
    display: 'block',
    marginBottom: '6px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.2rem',
    fontWeight: '300',
    color: '#2e2520',
    marginBottom: '8px',
  },
  divider: {
    width: '45px',
    height: '1px',
    backgroundColor: '#bfa16f',
    margin: '8px auto 12px auto',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#7a6e64',
    lineHeight: '1.4',
  },
  oauthBtn: {
    width: '100%',
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 0',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.75rem 0',
  },
  separatorText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    color: '#a8a29e',
    letterSpacing: '0.12em',
    fontWeight: '600',
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#faf8f5',
    borderRadius: '8px',
    padding: '4px',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    marginBottom: '1.5rem',
  },
  tabBtn: {
    flex: 1,
    padding: '8px 0',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#7a6e64',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    backgroundColor: '#f5f2eb',
    color: '#2e2520',
    boxShadow: '0 2px 8px rgba(46, 37, 32, 0.04)',
    border: '1px solid rgba(191, 161, 111, 0.1)',
  },
  sandboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  personaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  personaIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(191, 161, 111, 0.1)',
    color: '#bfa16f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  personaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  personaLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2e2520',
  },
  personaRole: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    backgroundColor: 'rgba(191, 161, 111, 0.12)',
    color: '#bfa16f',
    padding: '1px 6px',
    borderRadius: '8px',
    fontWeight: '700',
  },
  personaDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: '#7a6e64',
    lineHeight: '1.3',
  },
  arrowIcon: {
    color: '#a8a29e',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  formGroup: {
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
  submitBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 0',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    fontSize: '0.92rem',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'background-color 0.2s',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  errorIcon: {
    flexShrink: 0,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  successIcon: {
    flexShrink: 0,
  },
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
  }
};
