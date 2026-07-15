'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Crown, Gift, Sparkles, Heart, ArrowRight, CheckCircle, Mail, ShieldCheck, RefreshCw } from 'lucide-react';

const GoldLeaves = ({ style }: { style: React.CSSProperties }) => (
  <svg style={style} viewBox="0 0 100 150" fill="none" stroke="#B78A3F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 150 C50 100 40 50 50 10 C50 10 30 30 30 50 C30 65 42 75 48 85" />
    <path d="M50 120 C65 110 75 90 70 70 C65 60 52 75 50 90" />
    <path d="M50 90 C30 80 20 60 25 40 C30 30 45 45 47 60" />
    <path d="M50 60 C65 50 70 30 60 15 C55 10 51 25 50 35" />
    <path d="M50 35 C40 25 35 10 25 5 C23 3 32 12 40 20" />
  </svg>
);

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const particles = [
    { left: "12%", delay: "0s", duration: "16s", size: "5px" },
    { left: "24%", delay: "2s", duration: "22s", size: "4px" },
    { left: "38%", delay: "1s", duration: "18s", size: "6px" },
    { left: "55%", delay: "5s", duration: "24s", size: "3px" },
    { left: "70%", delay: "3s", duration: "20s", size: "5px" },
    { left: "85%", delay: "4s", duration: "17s", size: "4px" },
  ];

  // static hampers list matching collections
  const hampers = [
    {
      id: 'hamper-botanical',
      slug: 'the-botanical-heritage',
      title: 'The Botanical Heritage',
      category: 'The Classics Collection',
      price: 'Signature Curation',
      desc: 'A garden-inspired curation in deep mahogany wood casing. Features artisanal herbal tea blends, luxury shortbreads, and a sandalwood candle.',
      image: '/botanical_hamper.png',
      theme: 'rich-mahogany' as const,
      items: [
        { id: 'h1-1', name: 'Artisanal Roasted Makhana', type: 'Gourmet', price: 0, desc: 'Hand-roasted lotus seeds tossed in gourmet herbs and clarified butter.', image: '/roasted_makhana.png' },
        { id: 'h1-2', name: 'Earl Grey Royal Tea Blend', type: 'Beverage', price: 0, desc: 'A robust black tea base infused with pure cold-pressed oil of Bergamot.', image: '/earl_grey_tea.png' },
        { id: 'h1-3', name: 'Rose Quartz Crystal Tree', type: 'Decor', price: 0, desc: 'An elegant rose quartz crystal tree adorned with delicate brass wire and real 24k gold leaf accents.', image: '/crystal_tree.png' }
      ]
    },
    {
      id: 'hamper-ivory',
      slug: 'the-ivory-keepsake',
      title: 'The Ivory Keepsake',
      category: 'Premium Velvet Collection',
      price: 'Keepsake Curation',
      desc: 'Classic ivory fabric-wrapped celebration of life\'s milestones. Includes silver-plated tea infusers, raw honey jars, and handwritten greetings.',
      image: '/ivory_hamper.png',
      theme: 'ivory-blush' as const,
      items: [
        { id: 'h2-1', name: 'Silver Plated Tea Infuser', type: 'Keepsake', price: 0, desc: 'Intricately designed sterling silver-plated tea strainer.', image: '/silver_tea_infuser.png' },
        { id: 'h2-2', name: 'Fine Bone China Cup', type: 'Keepsake', price: 0, desc: 'Elegant fine bone china tea cup with gold leaf handles and trim.', image: '/china_cup.png' },
        { id: 'h2-3', name: 'Organic Honey Lavender Jars', type: 'Gourmet', price: 0, desc: 'Small glass jar of organic honey infused with lavender buds.', image: '/honey_lavender.png' },
        { id: 'h2-4', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 0, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' }
      ]
    },
    {
      id: 'hamper-imperial',
      slug: 'the-imperial-executive',
      title: 'The Imperial Executive',
      category: 'Royale Tin Tin Collection',
      price: 'Executive Curation',
      desc: 'Sleek walnut chest crafted for boards of directors and VIP clients. Features single-origin coffee and brass executive accessories.',
      image: '/executive_hamper.png',
      theme: 'royal-navy' as const,
      items: [
        { id: 'h3-1', name: 'Single Origin Coffee Beans', type: 'Beverage', price: 0, desc: 'Ethiopian Yirgacheffe medium roast with floral notes and bergamot acidity.', image: '/single_origin_coffee.png' },
        { id: 'h3-2', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 0, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' },
        { id: 'h3-3', name: 'Blush Leather Diary', type: 'Keepsake', price: 0, desc: 'Hand-stitched top-grain Italian leather journal with custom hot-gold lettering.', image: '/leather_diary.png' },
        { id: 'h3-4', name: 'Gold Foil Playing Cards', type: 'Keepsake', price: 0, desc: 'Premium deck of playing cards with intricate gold foil back designs.', image: '/gold_playing_cards.png' }
      ]
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <main style={styles.main}>
      {/* 2. CINEMATIC HERO SECTION */}
      <section style={{ ...styles.heroSection, height: 'auto', minHeight: '100svh', padding: '7.5rem 2rem 5rem 2rem' }}>
        <div style={styles.heroBg}>
          <Image
            src="/productspic/velvet_tray_hero.jpg"
            alt="Minimalist Plaster Wall Backdrop"
            fill
            priority
            quality={95}
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 1.0 }}
          />
        </div>

        {/* Vector Gold Leaves in Background (Mockup Aesthetics) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <GoldLeaves style={{ position: 'absolute', left: '-2%', top: '15%', width: '140px', height: '220px', opacity: 0.18, transform: 'rotate(-10deg)' }} />
          <GoldLeaves style={{ position: 'absolute', right: '-2%', top: '35%', width: '160px', height: '260px', opacity: 0.18, transform: 'rotate(20deg)' }} />
        </div>

        {/* Floating Rose Gold Dust Particles */}
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
                backgroundColor: '#B78A3F',
                borderRadius: '50%',
                opacity: 0.12,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        <div style={styles.heroContent} className="relative z-10 w-full max-w-[1200px] mx-auto">
          {/* Upper Hero Split */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full mb-16">
            {/* Left Column: Heading & Taglines */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col items-start text-left max-w-[620px]"
            >
              <h1 style={{ ...styles.heroTitle, margin: '0 0 1rem 0', color: '#3A141A' }} className="font-serif font-bold text-left leading-[1.12]">
                We create moments that make people feel valued.
              </h1>
              
              {/* Gold Signature script */}
              <div 
                style={{ 
                  fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif', 
                  fontStyle: 'italic', 
                  color: '#B78A3F',
                  transform: 'rotate(-2.5deg)',
                  transformOrigin: 'left center'
                }} 
                className="text-2xl md:text-3xl font-medium ml-8 mb-8"
              >
                The Gourmet Gifts Co.
              </div>

              <div className="text-[9px] tracking-[0.28em] text-[#4A352F] font-bold uppercase mb-2">
                MODERN INDIAN GIFTING HOUSE
              </div>
              <div className="text-xs md:text-sm text-[#4A352F] font-serif italic mb-8">
                Curated from the world. Crafted with India.
              </div>

              <Link 
                href="/collections" 
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#3C3F30] border border-[#B78A3F]/35 text-[#F6EFE5] text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#4A352F] transition-all rounded shadow-md cursor-pointer"
              >
                VIEW COLLECTIONS <span className="text-[9px]">→</span>
              </Link>
            </motion.div>

            {/* Right Column: Arched Moorish-style Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex justify-center items-center w-full max-w-[420px]"
            >
              <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] overflow-hidden shadow-premium bg-[#F6EFE5] rounded-xl border border-[#B78A3F]/15 z-10">
                <Image
                  src="/productspic/moorish_alcove_hero.jpg"
                  alt="Premium unboxing setup in Moorish alcove"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Lower Grid: Collection Cards (Left) & Testimonials Envelope (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full mt-16 relative z-10">
            {/* Left 3 Columns: Three-Collection Portal Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: The Classics */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="bg-[#FBF9F4] border border-[#B78A3F]/20 p-5 flex flex-col justify-between shadow-premium rounded-lg"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#B78A3F]/10 mb-4 bg-white rounded">
                    <Image src="/botanical_hamper.png" alt="The Classics Collection Packaging" fill style={{ objectFit: 'cover' }} />
                  </div>
                  <h4 className="font-serif text-lg text-[#261813] font-bold mb-1">The Classics</h4>
                  <p className="text-[9px] tracking-wider text-[#A88978] uppercase mb-3 font-semibold">everyday, accessible, design-led</p>
                </div>
                <Link href="/collections?segment=classics" className="w-full text-center py-2 bg-[#3C3F30] text-[#F6EFE5] text-[9px] uppercase tracking-widest font-bold hover:bg-[#4A352F] transition-colors rounded">
                  SHOP CLASSICS
                </Link>
              </motion.div>

              {/* Card 2: Royale Tin Tin */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="bg-[#FBF9F4] border border-[#2E4A3E]/30 p-5 flex flex-col justify-between shadow-premium rounded-lg"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#2E4A3E]/20 mb-4 bg-white rounded">
                    <Image src="/executive_hamper.png" alt="Royale Tin Tin Packaging" fill style={{ objectFit: 'cover' }} />
                  </div>
                  <h4 className="font-serif text-lg text-[#261813] font-bold mb-1">Royale Tin Tin</h4>
                  <p className="text-[9px] tracking-wider text-[#A88978] uppercase mb-3 font-semibold">collectible, heirloom metal packaging</p>
                </div>
                <Link href="/collections?segment=royale-tins" className="w-full text-center py-2 bg-[#2D453A] text-[#F6EFE5] text-[9px] uppercase tracking-widest font-bold hover:bg-[#1E3028] transition-colors rounded">
                  EXPLORE ROYALE
                </Link>
              </motion.div>

              {/* Card 3: Premium Velvet */}
              <motion.div 
                whileHover={{ y: -6 }}
                className="bg-[#FBF9F4] border border-[#5A1C28]/30 p-5 flex flex-col justify-between shadow-premium rounded-lg"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#5A1C28]/20 mb-4 bg-white rounded">
                    <Image src="/ivory_hamper.png" alt="Premium Velvet Packaging" fill style={{ objectFit: 'cover' }} />
                  </div>
                  <h4 className="font-serif text-lg text-[#261813] font-bold mb-1">Premium Velvet</h4>
                  <p className="text-[9px] tracking-wider text-[#A88978] uppercase mb-3 font-semibold">ceremonial, high-value, tactile</p>
                </div>
                <Link href="/collections?segment=premium-velvet" className="w-full text-center py-2 bg-[#5A1C28] text-[#F6EFE5] text-[9px] uppercase tracking-widest font-bold hover:bg-[#3D121B] transition-colors rounded">
                  DISCOVER VELVET
                </Link>
              </motion.div>
            </div>

            {/* Right 1 Column: Testimonials Board Envelope */}
            <div className="lg:col-span-1">
              <div className="bg-[#EAE2D8] border border-[#B78A3F]/35 p-6 rounded-xl flex flex-col justify-start relative shadow-premium overflow-hidden h-full min-h-[320px]">
                <h4 className="font-serif text-center text-lg text-[#3F151C] mb-6 font-bold uppercase tracking-wider">You were thought of.</h4>
                
                {/* Testimonial cards */}
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="bg-[#FBF9F4] border border-[#B78A3F]/15 p-4 rounded shadow-sm rotate-[-1deg] translate-x-[-4px]">
                    <p className="text-[10px] text-[#4A352F] italic leading-relaxed">
                      "Every detail felt intentional. The packaging was kept long after the gift was opened."
                    </p>
                    <div className="text-[9px] text-[#B78A3F] font-bold text-right mt-2">— Maria Luné</div>
                  </div>

                  <div className="bg-[#FBF9F4] border border-[#B78A3F]/15 p-4 rounded shadow-sm rotate-[1.5deg] translate-x-[4px]">
                    <p className="text-[10px] text-[#4A352F] italic leading-relaxed">
                      "The bespoke copper detailing and calligraphed letter made my client feel truly honored."
                    </p>
                    <div className="text-[9px] text-[#B78A3F] font-bold text-right mt-2">— Rajeev D.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SHOP BY OCCASION (Image-led, no icons) */}
      <section style={styles.occasionSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionPreTitle}>* curate by event *</span>
          <h2 style={styles.sectionTitle}>Shop by Occasion</h2>
        </div>

        <div style={styles.occasionGrid}>
          {[
            { title: "Wedding Keepsakes", img: "/luxury_pearl_backdrop.png", desc: "Monogrammed brass plates, velvet liners, and legacy seals." },
            { title: "Corporate Prestige", img: "/luxury_interior_backdrop.png", desc: "Minimalist executive logs, single-origin coffee, and leather diary sets." },
            { title: "Festive Celebrations", img: "/classic_hero.png", desc: "Embossed copper tins, organic honey, and hand-roasted makhana." },
            { title: "Milestone Gratitude", img: "/luxury_wall_backdrop.png", desc: "Fine tea strainers, soy candles, and custom parchment letters." }
          ].map((occ, idx) => (
            <Link href="/collections" key={idx} style={styles.occasionCard} className="shadow-premium group">
              <div style={styles.occasionImageWrapper}>
                <Image src={occ.img} alt={occ.title} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-700" />
                <div style={styles.occasionOverlay} />
              </div>
              <div style={styles.occasionContent}>
                <h3 style={styles.occasionCardTitle}>{occ.title}</h3>
                <p style={styles.occasionCardDesc}>{occ.desc}</p>
                <span style={styles.occasionCardLink}>Explore Curation →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SIGNATURE GIFTS GRID (No pricing) */}
      <section style={styles.signatureSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionPreTitle}>* signature curations *</span>
          <h2 style={styles.sectionTitle}>The Gifting Masterpieces</h2>
          <p style={styles.sectionDesc}>Hand-sealed canister hampers designed for impactful unboxing experiences.</p>
        </div>

        <div style={styles.signatureGrid}>
          {hampers.map((hamper) => (
            <motion.div
              key={hamper.id}
              whileHover={{ y: -5 }}
              style={styles.signatureCard}
              className="shadow-premium"
            >
              <div style={styles.signatureImageContainer}>
                <Image src={hamper.image} alt={hamper.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <div style={styles.signatureCardBody}>
                <span style={styles.signatureCardCategory}>{hamper.category}</span>
                <h3 style={styles.signatureCardTitle}>{hamper.title}</h3>
                <p style={styles.signatureCardDesc}>{hamper.desc}</p>
                <div style={styles.signatureCardFooter}>
                  <span style={styles.signaturePriceLabel}>{hamper.price}</span>
                  <div style={styles.signatureCardActions}>
                    <Link href={`/collections/add-items?package=${hamper.slug}`} style={styles.customizeLink}>Customise</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. "THE ART OF THE TIN" EDITORIAL SECTION */}
      <section style={styles.tinSection}>
        <div style={styles.tinWrapper}>
          <div style={styles.tinLeft}>
            <span style={styles.tinPreTitle}>THE CRAFT STANDARD</span>
            <h2 style={styles.tinTitle}>The Art of the Tin</h2>
            <div style={styles.tinDivider} />
            <p style={styles.tinParagraph}>
              Our signature Royale Tin Tin canisters are built to outlive the initial occasion. Engineered with architectural precision, double-walled premium tins preserve natural aromas while displaying intricate floral engravings and antique brass trim.
            </p>
            <p style={styles.tinParagraph}>
              Designed to be repurposed as luxury canisters for Assam tea leaves, heirloom jewelry vaults, or structural desk organisers, each tin behaves like a tactile piece of interior art in your recipient's home.
            </p>
            <div style={styles.tinBulletList}>
              <div style={styles.tinBullet}><div style={styles.bulletDot}/> Double-walled aroma locking seal</div>
              <div style={styles.tinBullet}><div style={styles.bulletDot}/> Anti-rust gold brushed internal plating</div>
              <div style={styles.tinBullet}><div style={styles.bulletDot}/> 100% recyclable lead-free metal core</div>
            </div>
          </div>
          <div style={styles.tinRight}>
            <div style={styles.tinImageFrame} className="frame-odd-3 shadow-premium">
              <Image src="/executive_hamper.png" alt="Royale Tin Tin details close up" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMOTIONAL BRAND STORY (You were thought of) */}
      <section style={styles.brandStorySection}>
        <div style={styles.storyBg}>
          <Image src="/pearl_white_backdrop.png" alt="Parchment flatlay styling backdrop" fill style={{ objectFit: 'cover', opacity: 0.15 }} />
        </div>
        <div style={styles.storyContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0 }}
            style={styles.storyCard}
            className="shadow-premium"
          >
            <span style={styles.storyLabel}>* inside the lid *</span>
            <h2 style={styles.storyTitle}>"You were thought of."</h2>
            <div style={styles.storyDivider} />
            <p style={styles.storyText}>
              Connection lies in the tiny details. Every Gourmet Gifts box contains this handwritten affirmation, stamped underneath the container lid. It greets the recipient the moment they break the wax seal, reminding them that this curation was designed exclusively for their joy.
            </p>
            <Link href="/collections" style={styles.storyLink}>
              Discover Our Ethos
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 8. BUILD-A-GIFT TEASER */}
      <section style={styles.teaserSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionPreTitle}>* personalized commissions *</span>
          <h2 style={styles.sectionTitle}>Build a Custom Keepsake Box</h2>
          <p style={styles.sectionDesc}>Four guided steps to assemble your personal monument.</p>
        </div>

        <div style={styles.teaserGrid}>
          {[
            { step: "01", name: "Select Curation Case", desc: "Choose between porcelain tins, velvet-lined drawers, or dark walnut chests." },
            { step: "02", name: "Custom Ribbon & Plaque", desc: "Drape your keepsake in custom satin ties and personalized engraved brass plaques." },
            { step: "03", name: "Fill with Artifacts", desc: "Assemble loose-leaf teas, single-origin coffee beans, soy candles, or chocolates." },
            { step: "04", name: "Inked Greetings", desc: "Dictate handwritten greeting notes composed on heavy parchment cards." }
          ].map((s, idx) => (
            <div key={idx} style={styles.teaserStepCard} className="shadow-premium">
              <span style={styles.teaserStepNum}>{s.step}</span>
              <h4 style={styles.teaserStepName}>{s.name}</h4>
              <p style={styles.teaserStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={styles.teaserActionWrapper}>
          <Link href="/bespoke" style={styles.teaserBtn}>
            Begin Your Gift
          </Link>
        </div>
      </section>

      {/* 9. CORPORATE GIFTING BAND */}
      <section style={{ backgroundColor: '#043632', padding: '5rem 2rem', overflow: 'hidden' }} className="border-y border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Heading & Content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left max-w-[540px]"
          >
            <h2 className="font-sans text-white font-bold text-3xl md:text-5xl leading-tight mb-6">
              Thoughtful gifting<br />made easy
            </h2>
            <p className="text-[#C2D6D3] text-sm md:text-base leading-relaxed mb-8">
              The creation and management of a gifting program might seem overwhelming to take on by yourself. We're here to take care of the heavy gifting for you.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Link 
                href="/corporate" 
                className="px-8 py-3.5 bg-white text-[#043632] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#F0F5F4] transition-all shadow-md"
              >
                Get started &gt;
              </Link>
              
              <div className="text-[11px] md:text-xs text-[#C2D6D3]">
                Want to chat about gifting?<br />
                Call us at <a href="tel:+13106201430" className="underline text-white font-semibold hover:text-[#B78A3F] transition-colors">+1 (310) 620-1430</a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Image (Right-aligned Crop) */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg border border-white/5"
          >
            <Image 
              src="/productspic/corporate_gifting_banner.png" 
              alt="Premium corporate gift setup" 
              fill 
              style={{ objectFit: 'cover', objectPosition: 'right' }} 
            />
          </motion.div>
        </div>
      </section>

      {/* 10. CRAFT & ORIGIN STORYTELLING (Origin line) */}
      <section style={styles.originSection}>
        <div style={styles.originWrapper}>
          <div style={styles.originLeft}>
            <div style={styles.originImageFrame} className="frame-odd-4 shadow-premium">
              <Image src="/botanical_hamper.png" alt="Artisans preparing natural ingredients" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div style={styles.originRight}>
            <span style={styles.originPreTitle}>ORIGIN ETHOS</span>
            <h2 style={styles.originTitle}>Curated from the world. Crafted with India.</h2>
            <div style={styles.originDivider} />
            <p style={styles.originDesc}>
              We source our ingredients from authentic regions: Assam black teas, Coorg single-origin coffees, hand-loomed fabrics, and ethically gathered organic honey. Each element is brought to our Indian craft houses where local woodcarvers, packaging designers, and sweet makers assemble the final masterpiece under rigorous standards.
            </p>
            <p style={styles.originDesc}>
              Supporting local artisan communities allows us to preserve traditional Indian techniques (such as hot-foil lettering, block printing, and custom brass casting) while delivering contemporary, minimalist presentation profiles.
            </p>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONIALS (Text reviews, no stars) */}
      <section style={styles.testimonialSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionPreTitle}>* private journals *</span>
          <h2 style={styles.sectionTitle}>Collector Chronicles</h2>
        </div>

        <div style={styles.testimonialGrid}>
          {[
            { quote: "The Royale Tin Tins are phenomenal. Our clients were stunned by the copper lid engraving and the quality of Coorg coffee beans. A serious luxury statement.", author: "Aurelia Vane, Creative Director", firm: "Vane & Co. London" },
            { quote: "Every single wedding favor box felt like a personal heirloom. The parchment note and velvet liners made it deeply emotional for our family guests.", author: "Advik Sharma, Private Collector", firm: "Wedding Curation" },
            { quote: "On-time delivery and impeccable mockups. Gourmet Gifts Co. has redefined our annual B2B gratitude campaigns. Highly recommended for absolute trust.", author: "Kabir Mehta, Managing Partner", firm: "Mehta Legal" }
          ].map((t, idx) => (
            <div key={idx} style={styles.testimonialCard} className="shadow-premium">
              <p style={styles.testimonialQuote}>"{t.quote}"</p>
              <div style={styles.testimonialDivider} />
              <span style={styles.testimonialAuthor}>{t.author}</span>
              <span style={styles.testimonialFirm}>{t.firm}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 12. NEWSLETTER BOX */}
      <section style={styles.newsletterSection}>
        <div style={styles.newsletterCard} className="shadow-premium">
          <Crown size={24} style={{ color: '#B78A3F', marginBottom: 12 }} />
          <h3 style={styles.newsletterTitle}>Subscribe to The Curation Journal</h3>
          <p style={styles.newsletterDesc}>Recieve occasional alerts on seasonal limited-edition tin releases and bespoke gifting mockups.</p>
          
          <AnimatePresence mode="wait">
            {!newsletterSubscribed ? (
              <motion.form 
                key="form"
                onSubmit={handleSubscribe} 
                style={styles.newsletterForm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your corporate or personal email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={styles.newsletterInput}
                />
                <button type="submit" style={styles.newsletterBtn}>Subscribe</button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.newsletterSuccess}
              >
                <CheckCircle size={16} style={{ color: '#B78A3F' }} />
                <span>You have been subscribed to our seasonal letters.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>



      <style jsx global>{`
        /* Floating particles */
        .gold-dust-particle {
          animation: floatParticle infinite linear;
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.2);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }

        /* Hero zoom bg */
        .hero-zoom-bg {
          animation: heroZoom 45s infinite ease-in-out;
          transform-origin: center;
        }
        @keyframes heroZoom {
          0% { transform: scale(1.02); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1.02); }
        }

        .card-hover-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        div:hover > .card-hover-overlay {
          opacity: 1 !important;
        }

        @media (max-width: 991px) {
          .mobile-stack {
            flex-direction: column !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    backgroundColor: '#F6EFE5', // --porcelain primary bg
    color: '#261813', // --espresso body text
    minHeight: '100vh',
    fontFamily: 'var(--font-sans)',
    overflowX: 'hidden',
  },
  announcementBar: {
    backgroundColor: '#3F151C', // --deep-merlot bg
    color: '#F6EFE5', // --porcelain text
    textAlign: 'center',
    padding: '10px 20px',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-sans)',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    zIndex: 40,
    position: 'relative',
    borderBottom: '1px solid rgba(183, 138, 63, 0.15)',
  },
  announcementText: {
    fontWeight: '600',
  },
  heroSection: {
    position: 'relative',
    height: '100svh',
    minHeight: '100svh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem 2rem 2rem',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    backgroundColor: '#F6EFE5',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  heroSplit: {
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  heroLeft: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  heroPreTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.35em',
    color: '#B78A3F', // --antique-gold
    fontWeight: '700',
    marginBottom: '1rem',
  },
  heroTitle: {
    fontFamily: 'var(--font-sans)', // Sleek modern sans-serif Raleway
    fontSize: 'clamp(2rem, 5vw, 4.5rem)',
    lineHeight: '1.2',
    color: '#261813',
    fontWeight: '400',
    margin: '0 0 2.5rem 0',
    letterSpacing: '-0.02em',
  },
  heroDesc: {
    fontSize: '0.9rem',
    lineHeight: '1.75',
    color: '#3E2720', // Espresso dark brown for excellent reading contrast
    maxWidth: '520px',
    margin: '0 0 2.5rem 0',
    fontWeight: '500',
  },
  heroActions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  primaryCta: {
    backgroundColor: '#6B2027', // --oxblood primary CTA
    color: '#F6EFE5',
    padding: '14px 32px',
    borderRadius: '4px', // 4-6px shape language
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 8px 24px rgba(107, 32, 39, 0.15)',
    transition: 'all 0.3s ease',
  },
  secondaryCta: {
    border: '1px solid #B78A3F', // --antique-gold border
    color: '#261813',
    padding: '14px 32px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  heroRight: {
    flex: '1 1 400px',
    display: 'flex',
    justifyContent: 'center',
  },
  heroImageFrame: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    aspectRatio: '4/3',
    overflow: 'hidden',
    border: '1px solid rgba(183, 138, 63, 0.2)',
  },
  portalSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F3E8DF', // --pearl contrast base
    borderTop: '1px solid rgba(183, 138, 63, 0.15)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '5rem',
    maxWidth: '600px',
    margin: '0 auto 5rem auto',
  },
  sectionPreTitle: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    color: '#B78A3F',
    fontWeight: '700',
    display: 'block',
    marginBottom: '10px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: '300',
    color: '#261813',
    letterSpacing: '0.01em',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '0.9rem',
    color: '#A88978',
    marginTop: '12px',
    lineHeight: '1.6',
  },
  portalGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
  },
  portalCard: {
    borderRadius: '16px', // 16-20px editorial cards
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(183, 138, 63, 0.15)',
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  },
  portalImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    border: '1px solid rgba(183, 138, 63, 0.1)',
  },
  portalCardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  portalCardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.6rem',
    fontWeight: '400',
    margin: '0 0 4px 0',
  },
  portalCardQuote: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '0.9rem',
    margin: '0 0 1rem 0',
    fontWeight: '500',
  },
  portalCardDesc: {
    fontSize: '0.82rem',
    lineHeight: '1.6',
    color: '#261813/90',
    margin: '0 0 2rem 0',
  },
  portalLink: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    textDecoration: 'none',
    fontWeight: '700',
    color: 'inherit',
    borderBottom: '1px solid',
    paddingBottom: '4px',
    transition: 'opacity 0.2s',
  },
  occasionSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F6EFE5',
    borderTop: '1px solid rgba(183, 138, 63, 0.12)',
  },
  occasionGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
  },
  occasionCard: {
    borderRadius: '12px', // 10-14px product cards
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '3/4',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '2rem',
    textDecoration: 'none',
    color: '#F6EFE5',
    border: '1px solid rgba(183, 138, 63, 0.15)',
  },
  occasionImageWrapper: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  occasionOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(38, 24, 19, 0.85) 0%, rgba(38, 24, 19, 0.3) 60%, transparent 100%)',
    zIndex: 1,
  },
  occasionContent: {
    position: 'relative',
    zIndex: 2,
  },
  occasionCardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.6rem',
    fontWeight: '300',
    margin: '0 0 6px 0',
  },
  occasionCardDesc: {
    fontSize: '0.8rem',
    lineHeight: '1.5',
    opacity: 0.85,
    margin: '0 0 1.25rem 0',
  },
  occasionCardLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    color: '#B78A3F',
  },
  signatureSection: {
    padding: '8rem 2rem',
    backgroundColor: '#E7D5BF', // --parchment secondary bg
    borderTop: '1px solid rgba(183, 138, 63, 0.15)',
  },
  signatureGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
  },
  signatureCard: {
    backgroundColor: '#F6EFE5', // --porcelain card bg
    border: '1px solid rgba(183, 138, 63, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  signatureImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  signatureHoverOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(38, 24, 19, 0.3)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsealBtn: {
    backgroundColor: '#F6EFE5',
    color: '#261813',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    padding: '10px 18px',
    boxShadow: '0 8px 16px rgba(38, 24, 19, 0.15)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  signatureCardBody: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  signatureCardCategory: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#B78A3F',
    fontWeight: '700',
    marginBottom: '8px',
    display: 'block',
  },
  signatureCardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.45rem',
    fontWeight: '400',
    margin: '0 0 10px 0',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  signatureCardDesc: {
    fontSize: '0.82rem',
    lineHeight: '1.6',
    color: '#A88978',
    margin: '0 0 1.5rem 0',
  },
  signatureCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(183, 138, 63, 0.15)',
    marginTop: 'auto',
  },
  signaturePriceLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#B78A3F',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  signatureCardActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  unsealTextBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#261813',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(38, 24, 19, 0.3)',
    paddingBottom: '2px',
  },
  customizeLink: {
    backgroundColor: '#6B2027',
    color: '#F6EFE5',
    padding: '8px 18px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(107, 32, 39, 0.1)',
  },
  tinSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F6EFE5',
    borderTop: '1px solid rgba(183, 138, 63, 0.12)',
  },
  tinWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '4rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tinLeft: {
    flex: '1 1 500px',
    textAlign: 'left',
  },
  tinPreTitle: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    color: '#B78A3F',
    fontWeight: '700',
    display: 'block',
    marginBottom: '1rem',
  },
  tinTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: '300',
    color: '#261813',
    margin: '0 0 1rem 0',
  },
  tinDivider: {
    width: '60px',
    height: '1px',
    backgroundColor: '#B78A3F',
    margin: '0 0 2rem 0',
  },
  tinParagraph: {
    fontSize: '0.9rem',
    lineHeight: '1.8',
    color: '#A88978',
    margin: '0 0 1.5rem 0',
  },
  tinBulletList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '2rem',
  },
  tinBullet: {
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
    color: '#261813',
  },
  bulletDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#B78A3F',
  },
  tinRight: {
    flex: '1 1 400px',
    display: 'flex',
    justifyContent: 'center',
  },
  tinImageFrame: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    aspectRatio: '4/3',
    overflow: 'hidden',
    border: '1px solid rgba(183, 138, 63, 0.2)',
  },
  brandStorySection: {
    padding: '10rem 2rem',
    position: 'relative',
    backgroundColor: '#3F151C', // --deep-merlot bg
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyBg: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  storyContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '700px',
    width: '100%',
  },
  storyCard: {
    backgroundColor: '#F6EFE5',
    padding: '4rem 3rem',
    textAlign: 'center',
    borderRadius: '16px', // 16-20px editorial radius
    border: '1px solid rgba(183, 138, 63, 0.25)',
  },
  storyLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    color: '#B78A3F',
    fontWeight: '700',
    display: 'block',
    marginBottom: '1rem',
  },
  storyTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.6rem',
    fontWeight: '300',
    color: '#261813',
    margin: '0 0 1rem 0',
  },
  storyDivider: {
    width: '50px',
    height: '1px',
    backgroundColor: '#B78A3F',
    margin: '0 auto 2rem auto',
  },
  storyText: {
    fontSize: '0.9rem',
    lineHeight: '1.85',
    color: '#A88978',
    marginBottom: '2.5rem',
  },
  storyLink: {
    display: 'inline-block',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '700',
    color: '#6B2027',
    textDecoration: 'none',
    borderBottom: '1px solid #6B2027',
    paddingBottom: '4px',
  },
  teaserSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F3E8DF',
    borderTop: '1px solid rgba(183, 138, 63, 0.15)',
  },
  teaserGrid: {
    maxWidth: '1200px',
    margin: '0 auto 4rem auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem',
  },
  teaserStepCard: {
    backgroundColor: '#F6EFE5',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(183, 138, 63, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  teaserStepNum: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#B78A3F',
    fontWeight: '300',
    marginBottom: '1rem',
  },
  teaserStepName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.2rem',
    color: '#261813',
    fontWeight: '400',
    margin: '0 0 8px 0',
  },
  teaserStepDesc: {
    fontSize: '0.78rem',
    lineHeight: '1.5',
    color: '#A88978',
    margin: 0,
  },
  teaserActionWrapper: {
    textAlign: 'center',
  },
  teaserBtn: {
    backgroundColor: '#6B2027',
    color: '#F6EFE5',
    padding: '16px 40px',
    borderRadius: '4px',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 8px 24px rgba(107, 32, 39, 0.18)',
    display: 'inline-block',
  },
  corporateBand: {
    padding: '8rem 2rem',
    backgroundColor: '#3F151C', // --deep-merlot dark bg
    color: '#F6EFE5',
    borderTop: '1px solid rgba(183, 138, 63, 0.2)',
  },
  corporateContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  corporateHeader: {
    textAlign: 'center',
    maxWidth: '650px',
    margin: '0 auto 5rem auto',
  },
  corporatePreTitle: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    color: '#B78A3F',
    fontWeight: '700',
    display: 'block',
    marginBottom: '1rem',
  },
  corporateTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: '300',
    letterSpacing: '0.02em',
    margin: '0 0 1rem 0',
    lineHeight: '1.2',
  },
  corporateDesc: {
    fontSize: '0.9rem',
    lineHeight: '1.75',
    color: '#E7D5BF',
  },
  corporateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '3rem',
    marginBottom: '4rem',
  },
  corporateStepCard: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  corporateStepNum: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: '#B78A3F',
    fontWeight: '300',
  },
  corporateStepTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.3rem',
    fontWeight: '400',
    margin: 0,
  },
  corporateStepDesc: {
    fontSize: '0.82rem',
    lineHeight: '1.6',
    color: '#E7D5BF/80',
  },
  corporateAction: {
    textAlign: 'center',
  },
  corporateBtn: {
    border: '1px solid #B78A3F',
    color: '#F6EFE5',
    padding: '14px 36px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  },
  originSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F6EFE5',
    borderTop: '1px solid rgba(183, 138, 63, 0.12)',
  },
  originWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '4rem',
    alignItems: 'center',
    flexWrap: 'wrap-reverse',
  },
  originLeft: {
    flex: '1 1 400px',
    display: 'flex',
    justifyContent: 'center',
  },
  originImageFrame: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    aspectRatio: '4/3',
    overflow: 'hidden',
    border: '1px solid rgba(183, 138, 63, 0.2)',
  },
  originRight: {
    flex: '1 1 500px',
    textAlign: 'left',
  },
  originPreTitle: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    color: '#B78A3F',
    fontWeight: '700',
    display: 'block',
    marginBottom: '1rem',
  },
  originTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: '300',
    color: '#261813',
    margin: '0 0 1rem 0',
  },
  originDivider: {
    width: '60px',
    height: '1px',
    backgroundColor: '#B78A3F',
    margin: '0 0 2rem 0',
  },
  originDesc: {
    fontSize: '0.9rem',
    lineHeight: '1.8',
    color: '#A88978',
    marginBottom: '1.5rem',
  },
  testimonialSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F3E8DF',
    borderTop: '1px solid rgba(183, 138, 63, 0.15)',
  },
  testimonialGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
  },
  testimonialCard: {
    backgroundColor: '#F6EFE5',
    padding: '2.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(183, 138, 63, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  testimonialQuote: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    lineHeight: '1.7',
    color: '#261813',
    fontStyle: 'italic',
    margin: '0 0 1.5rem 0',
  },
  testimonialDivider: {
    width: '30px',
    height: '1px',
    backgroundColor: '#B78A3F',
    margin: '0 auto 1.25rem auto',
  },
  testimonialAuthor: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#261813',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  testimonialFirm: {
    fontSize: '0.72rem',
    color: '#A88978',
    marginTop: '4px',
  },
  newsletterSection: {
    padding: '8rem 2rem',
    backgroundColor: '#F6EFE5',
    borderTop: '1px solid rgba(183, 138, 63, 0.12)',
    display: 'flex',
    justifyContent: 'center',
  },
  newsletterCard: {
    backgroundColor: '#F3E8DF',
    padding: '3rem',
    borderRadius: '16px',
    border: '1px solid rgba(183, 138, 63, 0.2)',
    maxWidth: '620px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  newsletterTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    fontWeight: '300',
    color: '#261813',
    margin: '0 0 8px 0',
  },
  newsletterDesc: {
    fontSize: '0.82rem',
    color: '#A88978',
    lineHeight: '1.6',
    marginBottom: '2rem',
    maxWidth: '450px',
  },
  newsletterForm: {
    display: 'flex',
    width: '100%',
    gap: '10px',
    flexWrap: 'wrap',
  },
  newsletterInput: {
    flex: '1 1 300px',
    padding: '14px 20px',
    backgroundColor: '#F6EFE5',
    border: '1px solid rgba(183, 138, 63, 0.3)',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    color: '#261813',
  },
  newsletterBtn: {
    backgroundColor: '#6B2027',
    color: '#F6EFE5',
    padding: '14px 28px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(107, 32, 39, 0.15)',
  },
  newsletterSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    color: '#261813',
    fontWeight: '600',
  },
};
