"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Gift, X, Star } from "lucide-react";
import Image from "next/image";

interface CanisterItem {
  id: string;
  name: string;
  type: string;
  icon?: string;
  price: number;
  image?: string;
  desc?: string;
}

interface PremiumCanisterProps {
  theme?: "dark-emerald" | "rich-mahogany" | "royal-navy" | "ivory-blush";
  items: CanisterItem[];
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  onProceedToCheckout?: () => void;
}

// Particle helper
interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
}

export default function PremiumCanister({
  theme = "dark-emerald",
  items,
  title = "Curated Masterpiece",
  subtitle = "The Gourmet Gifts Co. Exclusive",
  onClose,
  onProceedToCheckout,
}: PremiumCanisterProps) {
  const [animationStage, setAnimationStage] = useState<
    "sealed" | "unsealing" | "opening" | "glowing" | "revealed"
  >("sealed");
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Generate particles once we start opening
  useEffect(() => {
    if (animationStage === "opening" || animationStage === "glowing") {
      const generated: SparkleParticle[] = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: Math.random() * 200 - 100, // horizontal spread
        y: Math.random() * -300 - 50, // float upwards
        scale: Math.random() * 0.8 + 0.4,
        delay: Math.random() * 0.8,
        duration: Math.random() * 1.5 + 1.2,
      }));
      setParticles(generated);
    }
  }, [animationStage]);

  // Cylinder Color Gradients
  const themeStyles = {
    "dark-emerald": {
      bg: "linear-gradient(90deg, #07170f 0%, #0e2b1d 25%, #184631 50%, #0e2b1d 75%, #07170f 100%)",
      metal: "border-gold/30 bg-gradient-to-r from-gold/40 via-gold-light to-gold/40",
      accent: "#cba052",
      rim: "radial-gradient(ellipse at center, #1c5239 0%, #0a1f14 100%)",
      glowColor: "rgba(203, 160, 82, 0.4)",
    },
    "rich-mahogany": {
      bg: "linear-gradient(90deg, #170a07 0%, #2e150e 25%, #4a2319 50%, #2e150e 75%, #170a07 100%)",
      metal: "border-gold/30 bg-gradient-to-r from-gold/40 via-gold-light to-gold/40",
      accent: "#cba052",
      rim: "radial-gradient(ellipse at center, #54291f 0%, #210d09 100%)",
      glowColor: "rgba(230, 205, 152, 0.4)",
    },
    "royal-navy": {
      bg: "linear-gradient(90deg, #040914 0%, #091730 25%, #132a54 50%, #091730 75%, #040914 100%)",
      metal: "border-gold/30 bg-gradient-to-r from-gold/40 via-gold-light to-gold/40",
      accent: "#cba052",
      rim: "radial-gradient(ellipse at center, #183569 0%, #050c1b 100%)",
      glowColor: "rgba(203, 160, 82, 0.4)",
    },
    "ivory-blush": {
      bg: "linear-gradient(90deg, #ded0c6 0%, #eee4dd 25%, #f7f0eb 50%, #eee4dd 75%, #ded0c6 100%)",
      metal: "border-rose-300/40 bg-gradient-to-r from-rose-300/40 via-rose-100 to-rose-300/40",
      accent: "#e0a699",
      rim: "radial-gradient(ellipse at center, #eee5de 0%, #c4b4a9 100%)",
      glowColor: "rgba(224, 166, 153, 0.4)",
    },
  };

  const style = themeStyles[theme];

  // Sequence runner
  const handleOpen = () => {
    if (animationStage !== "sealed") return;

    setAnimationStage("unsealing");

    // Break seal & ribbon
    setTimeout(() => {
      setAnimationStage("opening");

      // Lift lid
      setTimeout(() => {
        setAnimationStage("glowing");

        // Reveal products
        setTimeout(() => {
          setAnimationStage("revealed");
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#140f0c]/97 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 spotlight select-none">
      
      {/* Top Bar with Title and Close Button */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-[110]">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">{subtitle}</span>
          <h2 className="font-serif text-lg md:text-2xl text-ivory mt-1">{title}</h2>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-3 border border-gold-light/20 rounded-full text-gold-light hover:text-white hover:border-gold-light/50 hover:bg-gold/10 transition-all duration-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 mt-16 md:mt-8 min-h-[60svh] px-4">
        
        {/* LEFT COLUMN: The 3D Canister container */}
        <div className="relative w-full max-w-[320px] aspect-[3/4] flex items-center justify-center perspective-1000 z-[101]">
          
          {/* Spotlight behind canister */}
          <div className="absolute w-[400px] h-[400px] rounded-full radial-gold-flare opacity-40 blur-2xl -translate-y-8 pointer-events-none z-0" />
          
          {/* Main 3D container assembly */}
          <motion.div 
            onClick={handleOpen}
            className={`relative preserve-3d w-[220px] h-[340px] cursor-pointer`}
            whileHover={animationStage === "sealed" ? { 
              y: -8, 
              rotateY: 8, 
              rotateX: 4, 
              transition: { duration: 0.5, ease: "easeOut" } 
            } : {}}
            animate={
              animationStage === "sealed" 
                ? { y: [0, -6, 0] } 
                : animationStage === "revealed" 
                  ? { x: -40, scale: 0.9, opacity: 0.7, pointerEvents: "none" } 
                  : {}
            }
            transition={
              animationStage === "sealed" 
                ? { repeat: Infinity, duration: 4, ease: "easeInOut" } 
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
          >
            
            {/* 3D GLOW BEAM (during opening state) */}
            <AnimatePresence>
              {(animationStage === "opening" || animationStage === "glowing") && (
                <motion.div 
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-[240px] left-4 right-4 h-[300px] origin-bottom z-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(0deg, ${style.glowColor} 0%, rgba(255, 255, 255, 0.1) 40%, rgba(255,255,255,0) 100%)`,
                    clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)"
                  }}
                >
                  {/* Subtle sparkle indicators */}
                  <div className="absolute inset-0 gold-glow opacity-80 rounded-full blur-xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING SPARKLE PARTICLES */}
            <AnimatePresence>
              {(animationStage === "opening" || animationStage === "glowing") && (
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: 0, y: 150, scale: 0, opacity: 1 }}
                      animate={{ 
                        x: p.x, 
                        y: p.y, 
                        scale: p.scale, 
                        opacity: [1, 1, 0] 
                      }}
                      transition={{ 
                        delay: p.delay, 
                        duration: p.duration, 
                        ease: "easeOut" 
                      }}
                      className="absolute"
                    >
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" style={{ filter: "drop-shadow(0 0 4px #e6cd98)" }} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* 1. THE LID */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-[60px] preserve-3d z-30"
              animate={
                animationStage === "sealed" 
                  ? { y: 0, rotateX: 0, rotateY: 0 }
                  : animationStage === "unsealing" 
                    ? { y: -2, transition: { duration: 0.4 } }
                    : { 
                        y: -140, 
                        rotateX: -25, 
                        rotateY: 45, 
                        z: 60,
                        opacity: 0.1, 
                        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
                      }
              }
            >
              {/* Lid Rim / Edge */}
              <div 
                className="absolute inset-x-0 top-0 h-[48px] rounded-t-[100px] border-b-[3px] border-gold/40 shadow-inner" 
                style={{ background: style.bg }}
              />
              
              {/* Lid Metal Accent Band (Top edge) */}
              <div className={`absolute top-[40px] left-0 right-0 h-[8px] ${style.metal}`} />

              {/* Lid Top Face (Simulating depth) */}
              <div 
                className="absolute top-[-12px] left-[5%] right-[5%] h-[24px] rounded-full border-t border-gold/30"
                style={{ background: style.rim }}
              />
              
              {/* Golden Crown Seal Handle */}
              <div className="absolute -top-[24px] left-1/2 -translate-x-1/2 w-8 h-6 flex items-center justify-center text-gold drop-shadow-md">
                <Crown className="w-5 h-5 fill-gold/20" />
              </div>
            </motion.div>

            {/* 2. THE CANISTER BODY */}
            <div className="absolute top-[48px] left-0 w-full h-[280px] z-20 rounded-b-[40px] overflow-hidden shadow-2xl preserve-3d">
              {/* Cylinder visual body */}
              <div 
                className="absolute inset-0 rounded-b-[40px] border border-gold-light/20 flex flex-col justify-between"
                style={{ background: style.bg }}
              >
                
                {/* Horizontal Metal Ribs (Top & Bottom bands) */}
                <div className={`absolute top-0 left-0 right-0 h-[10px] ${style.metal}`} />
                <div className={`absolute bottom-[20px] left-0 right-0 h-[10px] ${style.metal}`} />
                
                {/* Shiny metallic cylinder reflect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Embossed Brand Stamp (Fades out when body splits) */}
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                  <motion.div 
                    animate={animationStage !== "sealed" ? { opacity: 0, scale: 0.8 } : { opacity: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="border border-gold-light/30 p-2.5 rounded-full mb-3">
                      <Crown className="w-5 h-5 text-gold-light" />
                    </div>
                    <span className="font-serif text-[10px] tracking-[0.25em] text-gold-light uppercase">THE GOURMET</span>
                    <span className="font-sans text-[8px] tracking-[0.3em] text-white/50 uppercase mt-0.5">GIFTS CO.</span>
                  </motion.div>
                </div>
              </div>

              {/* CANISTER INTERNAL RIM (Shown when lid lifts) */}
              <div 
                className="absolute top-0 left-[3%] right-[3%] h-[16px] rounded-full z-10 pointer-events-none"
                style={{ background: style.rim }}
              />

              {/* 3. WAX SEAL & RIBBONS */}
              <AnimatePresence>
                {(animationStage === "sealed" || animationStage === "unsealing") && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center"
                  >
                    {/* Vertical Red/Gold Satin Ribbon */}
                    <motion.div 
                      animate={animationStage === "unsealing" ? { scaleY: 0, opacity: 0 } : { scaleY: 1 }}
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-b from-[#b12a20] to-[#7a1811] border-x border-[#cfa052]/30 shadow-md origin-top"
                    />

                    {/* Wax Seal Badge */}
                    <motion.div 
                      animate={
                        animationStage === "unsealing" 
                          ? { 
                              scale: [1, 1.2, 0], 
                              rotate: [0, 10, -10],
                              filter: "brightness(1.5) drop-shadow(0 0 15px #e6cd98)"
                            } 
                          : {}
                      }
                      transition={{ duration: 0.7 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-[#cba052] via-[#e6cd98] to-[#987130] border border-gold-light shadow-xl flex items-center justify-center relative cursor-pointer active:scale-95"
                    >
                      {/* Inner imprint pattern */}
                      <div className="w-11 h-11 rounded-full border border-gold-light/40 flex items-center justify-center bg-[#b12a20] shadow-inner">
                        <Gift className="w-5 h-5 text-gold-light" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tap cue for sealed state */}
            {animationStage === "sealed" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-[-48px] left-0 right-0 text-center z-40"
              >
                <span className="text-[10px] tracking-[0.3em] font-semibold text-gold uppercase bg-[#1c120e]/85 px-4 py-1.5 rounded-full border border-gold/20">
                  Tap to Unseal
                </span>
              </motion.div>
            )}
            {/* Canister Contact Drop Shadow (Realism) */}
            <div 
              className="absolute bottom-[-14px] left-[10%] right-[10%] h-[12px] rounded-full bg-black/60 blur-[6px] pointer-events-none z-[19]" 
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: The Products Reveal */}
        <div className="flex-1 w-full flex flex-col justify-center items-center lg:items-start min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {/* SEALED CONCIERGE TEXT */}
            {animationStage === "sealed" && (
              <motion.div 
                key="sealed-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center lg:text-left max-w-md"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Premium Vault Curation</span>
                </div>
                <h3 className="font-serif text-3xl md:text-5xl text-ivory mb-6 leading-tight">Your hamper is securely sealed.</h3>
                <p className="text-sm text-gold-light/70 leading-relaxed mb-8">
                  Inside this handcrafted cylinder canister lies a bespoke selection curated specifically for this rare occasion. Break the wax seal to unveil the contents.
                </p>
                <button 
                  onClick={handleOpen}
                  className="bg-gold text-[#2e2520] px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-gold-light transition-all duration-300 shadow-xl"
                >
                  Unveil Contents
                </button>
              </motion.div>
            )}

            {/* UNSEALING / OPENING / GLOWING DRAMA TEXT */}
            {(animationStage === "unsealing" || animationStage === "opening" || animationStage === "glowing") && (
              <motion.div 
                key="opening-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center lg:text-left max-w-md flex flex-col items-center lg:items-start justify-center"
              >
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="mb-8"
                >
                  <Sparkles className="w-14 h-14 text-gold drop-shadow-[0_0_10px_rgba(203,160,82,0.6)]" />
                </motion.div>
                <h3 className="font-serif text-3xl text-ivory mb-4">Releasing the Seal...</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-light/60">Preparing your personalized presentation</p>
              </motion.div>
            )}

            {/* REVEALED ITEMS CAROUSEL/GRID */}
            {animationStage === "revealed" && (
              <motion.div 
                key="revealed-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col lg:items-start items-center"
              >
                <div className="mb-8 text-center lg:text-left">
                  <h3 className="font-serif text-2xl md:text-3xl text-ivory flex items-center justify-center lg:justify-start gap-3">
                    Exquisite Revelations <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-gold-light/60 mt-2">
                    {items.length} artifacts selected. Tap to inspect details.
                  </p>
                </div>

                {/* Grid of floating items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl overflow-y-auto max-h-[45vh] pr-2 py-2">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                      onClick={() => setHoveredItem(hoveredItem === item.id ? null : item.id)}
                      className={`relative border cursor-pointer p-5 transition-all duration-300 rounded-lg flex flex-col items-center text-center shadow-premium ${
                        hoveredItem === item.id 
                          ? "border-gold bg-gold/20 ring-1 ring-gold shadow-gold-glow" 
                          : "border-gold-light/20 bg-[#1c130e] hover:border-gold-light/40 hover:bg-[#291b14]"
                      }`}
                    >
                      {/* Product Media Representation */}
                      <div className="w-16 h-16 rounded-full bg-gold/5 flex items-center justify-center mb-4 border border-gold-light/10 text-3xl">
                        {item.image ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              fill 
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Gift className="w-6 h-6 text-gold-light" />
                        )}
                      </div>

                      <div className="text-[9px] uppercase tracking-[0.2em] text-gold-light mb-1.5 font-bold">{item.type}</div>
                      <h4 className="font-serif text-sm text-ivory mb-2 leading-snug">{item.name}</h4>
                      <div className="text-xs text-gold font-sans font-semibold">${item.price}</div>

                      {/* Dropdown details overlay when tapped */}
                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3 pt-3 border-t border-gold-light/10 text-left w-full"
                          >
                            <p className="text-[11px] text-ivory/80 leading-relaxed font-sans">
                              {item.desc || "An essential selection of taste, carefully packaged with customized velvet inserts inside our signature luxury container."}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Finalize options */}
                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start w-full">
                  <button 
                    onClick={() => {
                      setAnimationStage("sealed");
                      setHoveredItem(null);
                    }}
                    className="px-6 py-3 border border-gold/40 text-gold hover:text-white hover:bg-gold/10 hover:border-gold text-[10px] uppercase tracking-widest font-semibold transition-all duration-300"
                  >
                    Seal Back
                  </button>
                  
                  {onClose && (
                    <>
                      <a
                        href={`/collections/add-items?package=${title.toLowerCase().trim().replace(/\s+/g, '-')}`}
                        className="border border-gold text-gold hover:bg-gold hover:text-[#2e2520] px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 text-center"
                      >
                        Customise Items
                      </a>
                      <button 
                        onClick={onProceedToCheckout || onClose}
                        className="bg-gold text-[#2e2520] px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-gold-light transition-all duration-300 shadow-lg"
                      >
                        Proceed to Checkout
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
