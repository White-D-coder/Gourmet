'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll detection for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const fetchSessionAndCart = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.cartCount !== undefined) {
          setCartCount(data.cartCount);
        }
      } else {
        setUser(null);
        // If not logged in, load standard cart
        const cartRes = await fetch('/api/cart');
        const cartData = await cartRes.json();
        if (cartData.success) {
          const count = (cartData.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        }
      }
    } catch (err) {
      console.error("Failed to load session or cart count", err);
    }
  };

  useEffect(() => {
    fetchSessionAndCart();
    window.addEventListener('cart-updated', fetchSessionAndCart);
    return () => window.removeEventListener('cart-updated', fetchSessionAndCart);
  }, []);

  // Check if current page is dark-themed
  const isDarkPage = ['/admin'].some(path => pathname?.startsWith(path));

  // Ultra-elegant flat styling variables
  const navBg = isDarkPage 
    ? (scrolled ? 'rgba(12, 10, 9, 0.85)' : 'transparent') 
    : (scrolled ? 'rgba(251, 249, 244, 0.85)' : 'transparent');
  
  const borderBottomColor = isDarkPage 
    ? (scrolled ? 'rgba(203, 160, 82, 0.15)' : 'transparent') 
    : (scrolled ? 'rgba(191, 161, 111, 0.15)' : 'transparent');

  const textColor = isDarkPage 
    ? '#fbf9f4' 
    : (scrolled ? '#2e2520' : '#ffffff');
  const mutedTextColor = isDarkPage 
    ? '#a8a29e' 
    : (scrolled ? '#7a6e64' : '#ffffff');
  const showNavbarLogo = pathname !== '/' || scrolled;

  return (
    <>
      <nav
        className="global-nav"
        style={{
          position: 'fixed',
          top: scrolled ? '1.25rem' : '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: scrolled ? 'calc(100% - 4rem)' : '100%',
          maxWidth: scrolled ? '1200px' : '100%',
          borderRadius: scrolled ? '9999px' : '0px',
          padding: scrolled ? '0.75rem 2.5rem' : '1.5rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
          backgroundColor: scrolled 
            ? (isDarkPage ? 'rgba(20, 15, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)') 
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 20px 40px -15px rgba(46, 37, 32, 0.12)' : 'none',
          border: scrolled 
            ? `1px solid ${isDarkPage ? 'rgba(191, 161, 111, 0.15)' : 'rgba(191, 161, 111, 0.2)'}` 
            : '1px solid transparent',
          color: textColor,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left: Brand Logo & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Menu
            size={20}
            style={{ cursor: 'pointer', marginRight: '1.5rem' }}
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden-menu"
          />
          
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.span
              initial={false}
              animate={showNavbarLogo ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...styles.logoText,
                display: 'inline-block',
              }}
              className="logo-text logo-sparkle-hover"
            >
              THE GOURMET <span style={{ color: '#bfa16f' }}>GIFTS</span> CO.
            </motion.span>
          </Link>
        </div>

        {/* Center: Centered Links */}
        <div style={styles.centerLinksWrapper} className="hidden-mobile">
          <Link href="/collections" className="nav-link" style={{ ...styles.navLink, color: scrolled ? '#7a6e64' : '#ffffff', fontSize: '0.8rem' }}>
            Collections
          </Link>
          <Link href="/bespoke" className="nav-link" style={{ ...styles.navLink, color: scrolled ? '#7a6e64' : '#ffffff', fontSize: '0.8rem' }}>
            Bespoke
          </Link>
          <Link href="/corporate" className="nav-link" style={{ ...styles.navLink, color: scrolled ? '#7a6e64' : '#ffffff', fontSize: '0.8rem' }}>
            Corporate
          </Link>
          {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <Link href="/admin" className="nav-link" style={{ ...styles.navLink, color: '#bfa16f', fontWeight: '700', fontSize: '0.8rem' }}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right: Search, Auth & Cart Icons */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/collections" className="search-icon-wrapper" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'inherit' }}>
            <Search size={16} className="header-icon" />
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-sans)', fontWeight: '600', letterSpacing: '0.05em', color: scrolled ? '#7a6e64' : '#ffffff' }} className="hidden-mobile">
                Hello, {user.firstName || 'Client'}
              </span>
              <a 
                href="/api/auth/logout" 
                style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: '0.68rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  fontWeight: '700', 
                  color: '#ef4444', 
                  textDecoration: 'none' 
                }}
              >
                Sign Out
              </a>
            </div>
          ) : (
            <Link 
              href="/login" 
              style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '0.68rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em', 
                fontWeight: '700', 
                color: scrolled ? '#bfa16f' : '#ffffff', 
                textDecoration: 'none' 
              }}
            >
              Sign In
            </Link>
          )}

          <Link href="/cart" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <div className="cart-icon-wrapper" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
              <ShoppingBag size={16} className="header-icon" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 bg-gold text-[#2e2520] text-[8px] font-sans font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-ivory shadow-sm"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(46, 37, 32, 0.1))" }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              backgroundColor: isDarkPage ? 'rgba(12, 10, 9, 0.96)' : 'rgba(251, 249, 244, 0.96)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X
              size={22}
              style={{
                position: 'absolute',
                top: '2.5rem',
                right: '3rem',
                cursor: 'pointer',
                color: isDarkPage ? '#F6EFE5' : '#3A141A',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', textAlign: 'center' }}>
              <span className="font-sans text-[9px] tracking-[0.35em] text-[#bfa16f] uppercase font-bold animate-pulse">
                THE GOURMET GIFTS CO.
              </span>

              {[
                { label: 'Home Page', href: '/' },
                { label: 'Premium Hampers', href: '/collections' },
                { label: 'Corporate Gifting', href: '/corporate' },
                { label: 'Custom Favors', href: '/bespoke' },
                { label: 'Your Vault Bag', href: '/cart' },
                ...(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? [{ label: 'Admin Panel', href: '/admin' }] : []),
                ...(user ? [{ label: `Sign Out (${user.firstName || 'User'})`, href: '/api/auth/logout' }] : [{ label: 'Sign In', href: '/login' }])
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                >
                  <Link 
                    href={item.href} 
                    style={{ ...styles.mobileLink, color: isDarkPage ? '#F6EFE5' : '#3A141A' }} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mobile-nav-link"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Dynamic gold sliding underlines */
        .nav-link {
          position: relative;
          padding: 0.4rem 0;
          display: inline-block;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background-color: #bfa16f;
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .nav-link:hover::after {
          width: 100%;
          left: 0;
        }

        .header-icon {
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .search-icon-wrapper:hover .header-icon,
        .cart-icon-wrapper:hover .header-icon {
          transform: scale(1.1);
          color: #bfa16f;
        }

        .logo-sparkle-hover {
          transition: letter-spacing 0.5s ease;
        }

        .logo-sparkle-hover:hover {
          letter-spacing: 0.28em !important;
        }

        .mobile-nav-link {
          position: relative;
          display: inline-block;
          transition: color 0.3s ease;
        }
        .mobile-nav-link:hover {
          color: #bfa16f !important;
        }

        @media (max-width: 1024px) {
          .hidden-mobile {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .global-nav {
            padding: 1rem 1.5rem !important;
          }
          .logo-text {
            font-size: 0.82rem !important;
            letter-spacing: 0.12em !important;
          }
        }
        @media (min-width: 1025px) {
          .lg:hidden-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  centerLinksWrapper: {
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'center',
  },
  navLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.68rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontWeight: '500',
    fontSize: '1.05rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
  },
  mobileLink: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.6rem',
    fontWeight: '300',
    textDecoration: 'none',
    letterSpacing: '0.02em',
  },
};
