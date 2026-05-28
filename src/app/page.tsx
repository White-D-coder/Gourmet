"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Crown, Gift, Sparkles, Heart } from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-gold selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 md:px-16 py-6 flex justify-between items-center z-50 bg-background/80 backdrop-blur-xl border-b border-gold-light/20 transition-all duration-300">
        <div className="flex gap-8 items-center text-brown-dark">
          <Menu 
            className="w-6 h-6 cursor-pointer hover:text-gold transition-colors lg:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          />
          <div className="hidden lg:flex space-x-12 text-[11px] uppercase tracking-[0.25em] font-semibold text-brown-light">
            <Link href="/collections" className="hover:text-gold transition-colors">Premium Hampers</Link>
            <Link href="/corporate" className="hover:text-gold transition-colors">Corporate Gifting</Link>
          </div>
        </div>
        
        {/* Simplified, Elegant Brand Header */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <div className="font-serif font-medium text-xl md:text-3xl tracking-[0.2em] uppercase text-brown-dark text-center cursor-pointer hover:opacity-80 transition-opacity">
              The Gourmet Gifts Co.
            </div>
          </Link>
        </div>

        <div className="flex space-x-8 text-[11px] uppercase tracking-[0.25em] items-center text-brown-light font-semibold">
          <Link href="/bespoke" className="hidden lg:block hover:text-gold transition-colors">Custom Favors</Link>
          <Search className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
          <Link href="/cart" className="hover:text-gold transition-colors flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
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
            className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center"
          >
            <X 
              className="absolute top-8 right-8 w-8 h-8 text-brown-dark cursor-pointer hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex flex-col items-center space-y-12 text-center">
              <Link href="/collections" className="font-serif text-3xl text-brown-dark hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Premium Hampers</Link>
              <Link href="/corporate" className="font-serif text-3xl text-brown-dark hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Corporate Gifting</Link>
              <Link href="/bespoke" className="font-serif text-3xl text-brown-dark hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Custom Favors</Link>
              <Link href="/cart" className="font-serif text-3xl text-brown-dark hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Your Bag</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Parallax */}
      <section className="relative w-full h-[100svh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
        >
          <Image
            src="/classic_hero.png"
            alt="Opulent Gift Hamper"
            fill
            quality={100}
            className="object-cover object-center opacity-85"
            priority
          />
        </motion.div>
        
        {/* Refined Content Box */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 mt-20">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background/80 backdrop-blur-md p-12 md:p-20 border border-gold shadow-2xl max-w-3xl"
          >
            <div className="text-gold text-xs tracking-[0.4em] uppercase mb-8 font-semibold">
              The Art of Exclusivity
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl text-brown-dark mb-8 leading-[1.1] tracking-tight">
              A Signature of Prestige.
            </h1>
            
            <p className="font-sans text-[13px] text-brown-dark/80 tracking-[0.15em] leading-relaxed mb-12 mx-auto max-w-lg uppercase">
              Curating uncompromising luxury for those who define success. A gift from The Gourmet Gifts Co. is a statement of enduring legacy.
            </p>
            
            <Link 
              href="/collections" 
              className="inline-block bg-brown-dark text-white px-12 py-5 text-[11px] uppercase tracking-[0.25em] hover:bg-gold hover:text-brown-dark transition-all duration-500 font-semibold shadow-xl"
            >
              Curate Your Legacy
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Refined Features Section with Elegant Icons */}
      <section className="w-full py-32 px-6 bg-background flex justify-center relative z-20">
        <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 text-center">
          {[
            { title: "Uncompromising Quality", icon: <Crown strokeWidth={1.5} className="w-8 h-8" /> },
            { title: "Masterfully Curated", icon: <Gift strokeWidth={1.5} className="w-8 h-8" /> },
            { title: "Exquisite Presentation", icon: <Sparkles strokeWidth={1.5} className="w-8 h-8" /> },
            { title: "Enduring Memories", icon: <Heart strokeWidth={1.5} className="w-8 h-8" /> }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center group"
            >
              <div className="text-gold mb-6 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
              <div className="font-sans text-[11px] uppercase tracking-[0.25em] font-semibold text-brown-dark">
                {item.title}
              </div>
              <div className="w-8 h-[1px] bg-gold-light mt-6 group-hover:w-16 transition-all duration-500"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="w-full py-32 px-6 md:px-16 bg-ivory relative z-20 border-t border-gold-light/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center mb-24"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-brown-dark mb-6">The Royal Curation</h2>
            <p className="text-brown-light text-sm uppercase tracking-[0.2em] max-w-2xl">
              Hand-selected artifacts of taste, designed to leave an indelible mark of sophistication.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {/* Product 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-gold-light/30 shadow-lg mb-8">
                <Image
                  src="/product_1.png"
                  alt="The Botanical Luxury Hamper"
                  fill
                  quality={100}
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-brown-dark/0 group-hover:bg-brown-dark/10 transition-colors duration-500"></div>
              </div>
              <h3 className="font-serif text-2xl text-brown-dark mb-3">The Botanical Heritage</h3>
              <p className="text-brown-light text-sm tracking-wide leading-relaxed mb-6">
                A masterpiece of deep mahogany hues featuring artisanal roasted nuts, Earl Grey Royal, and a gold-flecked crystal tree.
              </p>
              <div className="font-sans text-xs uppercase tracking-[0.2em] text-gold font-bold">From $249</div>
            </motion.div>

            {/* Product 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-gold-light/30 shadow-lg mb-8">
                <Image
                  src="/product_2.png"
                  alt="The Ivory Keepsake Hamper"
                  fill
                  quality={100}
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-brown-dark/0 group-hover:bg-brown-dark/10 transition-colors duration-500"></div>
              </div>
              <h3 className="font-serif text-2xl text-brown-dark mb-3">The Ivory Keepsake</h3>
              <p className="text-brown-light text-sm tracking-wide leading-relaxed mb-6">
                Soft creams and rose gold elegance. Features a premium blend Assam tea, handcrafted dreamcatcher, and a blush leather diary.
              </p>
              <div className="font-sans text-xs uppercase tracking-[0.2em] text-gold font-bold">From $289</div>
            </motion.div>
          </div>
          
          <div className="mt-24 flex justify-center">
            <Link 
              href="/collections" 
              className="border border-brown-dark text-brown-dark px-12 py-4 text-xs uppercase tracking-[0.25em] hover:bg-brown-dark hover:text-white transition-all duration-300 font-semibold"
            >
              View All Masterpieces
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
