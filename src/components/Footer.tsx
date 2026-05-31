'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const isDarkPage = ['/corporate', '/bespoke', '/cart', '/admin'].some(path => pathname?.startsWith(path));

  const footerBg = isDarkPage ? '#141210' : '#f5f2eb';
  const borderTopColor = isDarkPage ? 'rgba(203, 160, 82, 0.1)' : 'rgba(230, 205, 152, 0.15)';
  const textColor = isDarkPage ? '#d6d3d1' : '#5c4e43';
  const headingColor = isDarkPage ? '#fbf9f4' : '#3a2e26';
  const linkHoverColor = '#cba052';

  return (
    <footer
      style={{
        backgroundColor: footerBg,
        borderTop: `1px solid ${borderTopColor}`,
        color: textColor,
        padding: '4rem 2rem',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        zIndex: 10,
        position: 'relative',
      }}
    >
      <div style={styles.grid}>
        
        {/* Brand details */}
        <div style={styles.brandCol}>
          <h4 style={{ ...styles.heading, color: headingColor }}>The Gourmet Gifts Co.</h4>
          <p style={styles.brandDesc}>
            Crafting elegant memories and customized milestones through artisanal chocolates, single-origin brews, and sterling keepsakes.
          </p>
          <div style={styles.badgeLine}>
            <Award size={16} style={{ color: '#cba052' }} />
            <span>Curated Luxury Since 2026</span>
          </div>
        </div>

        {/* Links Column */}
        <div style={styles.linksCol}>
          <h5 style={{ ...styles.sectionHeading, color: headingColor }}>Exploration</h5>
          <div style={styles.linkList}>
            <Link href="/" style={styles.link}>Homepage</Link>
            <Link href="/collections" style={styles.link}>Premium Hampers</Link>
            <Link href="/corporate" style={styles.link}>Corporate Gifting</Link>
            <Link href="/bespoke" style={styles.link}>Custom Favors</Link>
            <Link href="/cart" style={styles.link}>Shopping Bag</Link>
          </div>
        </div>

        {/* Contact info column */}
        <div style={styles.linksCol}>
          <h5 style={{ ...styles.sectionHeading, color: headingColor }}>Corporate Concierge</h5>
          <div style={styles.contactList}>
            <div style={styles.contactItem}>
              <Mail size={14} style={styles.contactIcon} />
              <span>concierge@gormetco.com</span>
            </div>
            <div style={styles.contactItem}>
              <Phone size={14} style={styles.contactIcon} />
              <span>+1 (800) 555-0199</span>
            </div>
            <div style={styles.contactItem}>
              <MapPin size={14} style={styles.contactIcon} />
              <span>848 Fifth Avenue, New York, NY</span>
            </div>
          </div>
        </div>

        {/* System Operations Area */}
        <div style={styles.linksCol}>
          <h5 style={{ ...styles.sectionHeading, color: headingColor }}>Administration</h5>
          <p style={styles.adminDesc}>
            Log into the operations center to review inquiries, dispatch hampers, and adjust product stock levels.
          </p>
          <Link href="/admin" style={styles.adminBtn}>
            Operations Dashboard
          </Link>
        </div>

      </div>

      {/* Copyright Line */}
      <div style={{ ...styles.copyrightLine, borderTopColor: isDarkPage ? 'rgba(251, 249, 244, 0.05)' : 'rgba(0,0,0,0.05)' }}>
        <span>© {new Date().getFullYear()} The Gourmet Gifts Co. All rights reserved.</span>
        <span>Designed with Luxury & Prestige.</span>
      </div>
    </footer>
  );
}

const styles = {
  grid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2.5rem',
    paddingBottom: '3rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  heading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: '400',
    margin: 0,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  brandDesc: {
    lineHeight: '1.6',
    color: '#8c8076',
    margin: 0,
  },
  badgeLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    color: '#cba052',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  sectionHeading: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: '700',
    margin: 0,
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  contactIcon: {
    color: '#cba052',
    flexShrink: 0,
  },
  adminDesc: {
    lineHeight: '1.5',
    color: '#8c8076',
    margin: '0 0 10px 0',
  },
  adminBtn: {
    display: 'inline-block',
    textAlign: 'center' as const,
    backgroundColor: '#cba052',
    color: '#0c0a09',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 2px 6px rgba(203, 160, 82, 0.15)',
    transition: 'opacity 0.2s',
  },
  copyrightLine: {
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid',
    paddingTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '10px',
    fontSize: '0.75rem',
    color: '#8c8076',
  },
};
