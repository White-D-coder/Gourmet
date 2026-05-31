'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Crown, Gift, Sparkles, Heart } from 'lucide-react';
import PremiumCanister from '@/components/PremiumCanister';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [selectedHamper, setSelectedHamper] = useState<{
    theme: 'rich-mahogany' | 'ivory-blush' | 'dark-emerald' | 'royal-navy';
    title: string;
    items: { id: string; name: string; type: string; icon?: string; price: number; desc?: string }[];
  } | null>(null);

  const particles = [
    { left: "10%", delay: "0s", duration: "18s", size: "6px" },
    { left: "20%", delay: "3s", duration: "24s", size: "4px" },
    { left: "35%", delay: "1s", duration: "16s", size: "5px" },
    { left: "50%", delay: "7s", duration: "22s", size: "3px" },
    { left: "65%", delay: "2s", duration: "20s", size: "6px" },
    { left: "80%", delay: "5s", duration: "18s", size: "4px" },
    { left: "90%", delay: "4s", duration: "25s", size: "5px" },
    { left: "15%", delay: "6s", duration: "17s", size: "3px" },
    { left: "45%", delay: "9s", duration: "21s", size: "7px" },
    { left: "75%", delay: "8s", duration: "19s", size: "5px" },
  ];

  // We define 4 premium hampers for the 3D showcase
  const hampers = [
    {
      id: 'hamper-botanical',
      slug: 'the-botanical-heritage',
      title: 'The Botanical Heritage',
      price: '$249',
      desc: 'A garden-inspired curation in deep mahogany wood casing. Features artisanal herbal tea blends, luxury shortbreads, and a sandalwood candle.',
      image: '/botanical_hamper.png',
      frameClass: 'frame-odd-1', // Asymmetric curved frame 1
      tiltClass: 'rotate-left-3d', // rotateY(15deg)
      theme: 'rich-mahogany' as const,
      items: [
        { id: 'h1-1', name: 'Artisanal Roasted Makhana', type: 'Gourmet', price: 25, desc: 'Hand-roasted lotus seeds tossed in gourmet herbs and clarified butter.', image: '/roasted_makhana.png' },
        { id: 'h1-2', name: 'Earl Grey Royal Tea Blend', type: 'Beverage', price: 35, desc: 'A robust black tea base infused with pure cold-pressed oil of Bergamot.', image: '/earl_grey_tea.png' },
        { id: 'h1-3', name: 'Rose Quartz Crystal Tree', type: 'Decor', price: 95, desc: 'An elegant rose quartz crystal tree adorned with delicate brass wire and real 24k gold leaf accents.', image: '/crystal_tree.png' }
      ]
    },
    {
      id: 'hamper-ivory',
      slug: 'the-ivory-keepsake',
      title: 'The Ivory Keepsake',
      price: '$289',
      desc: 'Classic ivory fabric-wrapped celebration of life\'s milestones. Includes silver-plated tea infusers, raw honey jars, and handwritten greetings.',
      image: '/ivory_hamper.png',
      frameClass: 'frame-odd-2', // Asymmetric curved frame 2
      tiltClass: 'rotate-slight-left-3d', // rotateY(5deg)
      theme: 'ivory-blush' as const,
      items: [
        { id: 'h2-1', name: 'Silver Plated Tea Infuser', type: 'Keepsake', price: 30, desc: 'Intricately designed sterling silver-plated tea strainer.', image: '/silver_tea_infuser.png' },
        { id: 'h2-2', name: 'Fine Bone China Cup', type: 'Keepsake', price: 55, desc: 'Elegant fine bone china tea cup with gold leaf handles and trim.', image: '/china_cup.png' },
        { id: 'h2-3', name: 'Organic Honey Lavender Jars', type: 'Gourmet', price: 20, desc: 'Small glass jar of organic honey infused with lavender buds.', image: '/honey_lavender.png' },
        { id: 'h2-4', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 25, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' }
      ]
    },
    {
      id: 'hamper-imperial',
      slug: 'the-imperial-executive',
      title: 'The Imperial Executive',
      price: '$350',
      desc: 'Sleek walnut chest crafted for boards of directors and VIP clients. Features single-origin coffee and brass executive accessories.',
      image: '/executive_hamper.png',
      frameClass: 'frame-odd-3', // Asymmetric curved frame 3
      tiltClass: 'rotate-slight-right-3d', // rotateY(-5deg)
      theme: 'royal-navy' as const,
      items: [
        { id: 'h3-1', name: 'Single Origin Coffee Beans', type: 'Beverage', price: 18, desc: 'Ethiopian Yirgacheffe medium roast with floral notes and bergamot acidity.', image: '/single_origin_coffee.png' },
        { id: 'h3-2', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 25, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' },
        { id: 'h3-3', name: 'Blush Leather Diary', type: 'Keepsake', price: 65, desc: 'Hand-stitched top-grain Italian leather journal with custom hot-gold lettering.', image: '/leather_diary.png' },
        { id: 'h3-4', name: 'Gold Foil Playing Cards', type: 'Keepsake', price: 40, desc: 'Premium deck of playing cards with intricate gold foil back designs.', image: '/gold_playing_cards.png' }
      ]
    },
    {
      id: 'hamper-bespoke',
      slug: 'bespoke-gift-box',
      title: 'Bespoke Keepsake Box',
      price: '$180',
      desc: 'Fully personalized, bespoke-commissioned favors and corporate gifts. Tailored to fit weddings, galas, and key milestones.',
      image: '/luxury_pearl_backdrop.png', // Fallback display
      frameClass: 'frame-odd-4', // Asymmetric curved frame 4
      tiltClass: 'rotate-right-3d', // rotateY(-15deg)
      theme: 'rich-mahogany' as const,
      items: [
        { id: 'h4-1', name: 'Monogrammed Brass Plate', type: 'Keepsake', price: 15, desc: 'Custom laser engraved brass plate displaying dates or names.' }
      ]
    }
  ];

  return (
    <main style={styles.main}>
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        {/* Minimal plaster wall backdrop from user-provided image */}
        <div style={styles.heroBg}>
          <Image
            src="/luxury_interior_backdrop.png"
            alt="Minimalist Plaster Wall"
            fill
            priority
            quality={100}
            className="hero-zoom-bg"
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.95 }}
          />
        </div>

        {/* Animated Rose Gold Dust Particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {particles.map((p, idx) => (
            <div
              key={idx}
              className="gold-dust-particle"
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: '#bfa16f',
                borderRadius: '50%',
                opacity: 0.18,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        <div style={styles.heroContent}>
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              y: -scrollY * 0.55,
              opacity: Math.max(0, 1 - scrollY / 150),
              scale: Math.max(0.65, 1 - scrollY / 320),
            }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={styles.niraTitle}
            >
              The Gourmet Gifts Co.
            </motion.h1>
            
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              style={styles.niraSubtitle}
            >
              THE CURATION HOUSE
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES ROW */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          {[
            { title: 'Uncompromising Quality', icon: <Crown strokeWidth={1} size={32} /> },
            { title: 'Masterfully Curated', icon: <Gift strokeWidth={1} size={32} /> },
            { title: 'Exquisite Presentation', icon: <Sparkles strokeWidth={1} size={32} /> },
            { title: 'Enduring Memories', icon: <Heart strokeWidth={1} size={32} /> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              style={styles.featureCard}
            >
              <div style={styles.featureIcon}>{item.icon}</div>
              <span style={styles.featureTitle}>{item.title}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. 3D PERSPECTIVE SHOWCASE (Image 1 and 2 hybrid styling) */}
      <section style={styles.showcaseSection}>
        <div style={styles.showcaseContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.showcaseHeader}
          >
            <span style={styles.showcasePreTitle}>* curated collections *</span>
            <h2 style={styles.showcaseTitle}>The Curation Gallery</h2>
            <p style={styles.showcaseDesc}>
              Hover to expand card profiles. Designed with asymmetrical frames and matted border trims, echoing the organic minimal design of fine ceramics.
            </p>
          </motion.div>

          {/* 3D Curved Carousel Grid */}
          <div style={styles.carouselContainer} className="perspective-1500">
            <div style={styles.carouselRow} className="preserve-3d">
              {hampers.map((hamper, idx) => (
                <motion.div
                  key={hamper.id}
                  whileHover={{
                    scale: 1.04,
                    rotateY: 0,
                    z: 50,
                    boxShadow: '0 25px 50px -12px rgba(46, 37, 32, 0.15)',
                  }}
                  style={get3DTiltStyle(idx, hamper.frameClass)}
                  onClick={() => setSelectedHamper({
                    theme: hamper.theme,
                    title: hamper.title,
                    items: hamper.items
                  })}
                  className="shadow-premium"
                >
                  {/* Odd-shaped frame container */}
                  <div style={styles.cardImageContainer} className={hamper.frameClass}>
                    <Image
                      src={hamper.image}
                      alt={hamper.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    <div style={styles.cardOverlay} className="card-hover-overlay">
                      <span style={styles.unsealBtn}>
                        <Sparkles size={12} style={{ marginRight: 6 }} /> Unseal Hamper
                      </span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <h3 style={styles.cardTitle}>{hamper.title}</h3>
                    <p style={styles.cardDesc}>{hamper.desc}</p>
                    <span style={styles.cardPrice}>From {hamper.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={styles.viewAllWrapper}>
            <Link href="/collections" style={styles.viewAllBtn}>
              View All Masterpieces
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PREMIUM CANISTER DIALOG */}
      <AnimatePresence>
        {selectedHamper && (
          <PremiumCanister
            theme={selectedHamper.theme}
            title={selectedHamper.title}
            items={selectedHamper.items}
            onClose={() => setSelectedHamper(null)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Gold dust particle floating animation */
        .gold-dust-particle {
          animation: floatParticle infinite linear;
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.25;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(1.3);
            opacity: 0;
          }
        }

        /* Hero slow background image scaling zoom focused on the plant vase */
        .hero-zoom-bg {
          animation: heroZoom 35s infinite ease-in-out;
          transform-origin: center;
        }
        @keyframes heroZoom {
          0% { transform: scale(1.02); }
          50% { transform: scale(1.09); }
          100% { transform: scale(1.02); }
        }

        /* Shimmer and shape shift on CTA button */
        .hero-cta-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hero-cta-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          transform: skewX(-25deg);
        }
        .hero-cta-btn:hover::after {
          animation: buttonShine 1.4s ease-in-out infinite;
        }
        .hero-cta-btn:hover {
          background-color: #bfa16f !important;
          box-shadow: 0 10px 25px rgba(191, 161, 111, 0.3) !important;
          transform: translateY(-2px) scale(1.02) !important;
          border-radius: 20px 4px 20px 4px !important;
        }
        @keyframes buttonShine {
          100% { left: 150%; }
        }

        /* 3D tilt styles for cards matching Image 1 curved gallery perspective */
        .rotate-left-3d {
          transform: rotateY(18deg) translateZ(-80px) scale(0.96);
        }
        .rotate-slight-left-3d {
          transform: rotateY(6deg) translateZ(-20px) scale(1);
        }
        .rotate-slight-right-3d {
          transform: rotateY(-6deg) translateZ(-20px) scale(1);
        }
        .rotate-right-3d {
          transform: rotateY(-18deg) translateZ(-80px) scale(0.96);
        }

        .card-hover-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        div:hover > .card-hover-overlay {
          opacity: 1 !important;
        }

        @media (max-width: 1024px) {
          /* Fallback for mobile displays where 3D tilt makes it too cramped */
          .rotate-left-3d, .rotate-slight-left-3d, .rotate-slight-right-3d, .rotate-right-3d {
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}

// 3D tilt mapping depending on carousel position
function get3DTiltStyle(idx: number, frameClass: string): React.CSSProperties {
  let transformClass = '';
  if (idx === 0) transformClass = 'rotate-left-3d';
  else if (idx === 1) transformClass = 'rotate-slight-left-3d';
  else if (idx === 2) transformClass = 'rotate-slight-right-3d';
  else transformClass = 'rotate-right-3d';

  return {
    ...styles.carouselCard,
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease',
    transformStyle: 'preserve-3d',
    transform: undefined, // Let global class apply it on load
    WebkitTransform: undefined,
  };
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    backgroundColor: '#faf8f5', // Pearl-white background
    color: '#2e2520', // Clay charcoal typography
    minHeight: '100vh',
    fontFamily: 'var(--font-sans)',
  },
  heroSection: {
    position: 'relative',
    height: '100svh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    background: 'radial-gradient(circle at center, #ffffff 0%, #faf8f5 100%)',
  },
  niraTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
    fontWeight: '300',
    color: '#2e2520',
    letterSpacing: '0.08em',
    textAlign: 'center',
    lineHeight: '1.2',
    margin: 0,
    padding: '0 1rem',
  },
  niraSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#7a6e64',
    letterSpacing: '0.45em',
    textTransform: 'uppercase',
    marginTop: '1.25rem',
    textAlign: 'center',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    padding: '0 2rem',
    textAlign: 'center',
  },
  heroTextBox: {
    backgroundColor: 'rgba(250, 248, 245, 0.9)', // Ivory backdrop
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(191, 161, 111, 0.25)',
    borderRadius: '40px 10px 40px 10px', // Odd shape matching Image 2
    padding: '4rem 3rem',
    boxShadow: '0 30px 60px -15px rgba(46, 37, 32, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  heroPreTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.35em',
    color: '#bfa16f',
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '4.5rem',
    lineHeight: '1.05',
    color: '#2e2520',
    fontWeight: '400',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  heroParagraph: {
    fontSize: '0.85rem',
    lineHeight: '1.8',
    letterSpacing: '0.15em',
    color: '#7a6e64',
    maxWidth: '500px',
    margin: '0 auto',
    fontWeight: '500',
  },
  heroBtn: {
    backgroundColor: '#2e2520',
    color: '#faf8f5',
    padding: '14px 36px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(46, 37, 32, 0.15)',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
  featuresSection: {
    padding: '5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#faf8f5', // Ivory section
    borderBottom: '1px solid rgba(191, 161, 111, 0.15)',
  },
  featuresGrid: {
    maxWidth: '1100px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '3rem',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  featureIcon: {
    color: '#bfa16f',
  },
  featureTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    color: '#3a312a',
  },
  showcaseSection: {
    padding: '8rem 2rem 10rem 2rem',
    backgroundColor: '#f5f2eb', // Soft pearl-white contrast base
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  showcaseContent: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  showcaseHeader: {
    textAlign: 'center',
    marginBottom: '5rem',
    maxWidth: '650px',
  },
  showcasePreTitle: {
    fontStyle: 'italic',
    color: '#bfa16f',
    fontSize: '1rem',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '8px',
  },
  showcaseTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '3.6rem',
    fontWeight: '400',
    margin: 0,
    color: '#2e2520',
    letterSpacing: '0.02em',
  },
  showcaseDesc: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#7a6e64',
    marginTop: '12px',
  },
  carouselContainer: {
    width: '100%',
    overflow: 'visible',
    marginTop: '2rem',
  },
  carouselRow: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  carouselCard: {
    flex: '1 1 260px',
    maxWidth: '280px',
    backgroundColor: '#faf8f5', // Ivory card
    border: '1px solid rgba(191, 161, 111, 0.15)',
    borderRadius: '16px',
    padding: '1rem',
    cursor: 'pointer',
    position: 'relative',
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '3/4',
    overflow: 'hidden',
    backgroundColor: '#faf8f5',
    border: '1px solid rgba(191, 161, 111, 0.1)',
  },
  cardOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(58, 49, 42, 0.35)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsealBtn: {
    backgroundColor: '#faf8f5',
    color: '#2e2520',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    padding: '10px 18px',
    boxShadow: '0 10px 20px rgba(46, 37, 32, 0.15)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: '1.25rem',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#2e2520',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.8rem',
    lineHeight: '1.4',
    color: '#7a6e64',
    margin: 0,
  },
  cardPrice: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#bfa16f',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },
  viewAllWrapper: {
    marginTop: '5rem',
  },
  viewAllBtn: {
    border: '1px solid #2e2520',
    color: '#2e2520',
    padding: '14px 44px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
};
