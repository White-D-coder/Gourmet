"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Gift, Minus, Plus, ShoppingBag, RefreshCw } from "lucide-react";

// Mock Database of Items
const INVENTORY = [
  { id: "1", name: "Artisanal Roasted Makhana", type: "Gourmet", icon: "🥜", price: 25 },
  { id: "2", name: "Premium Dryfruits Mix", type: "Gourmet", icon: "🌰", price: 45 },
  { id: "3", name: "Royal Assam Tea Blend", type: "Beverage", icon: "🫖", price: 35 },
  { id: "4", name: "Coorg Arabica Coffee", type: "Beverage", icon: "☕", price: 40 },
  { id: "5", name: "Blush Leather Diary", type: "Keepsake", icon: "📓", price: 65 },
  { id: "6", name: "Gold-Plated Signature Pen", type: "Keepsake", icon: "🖋️", price: 85 },
  { id: "7", name: "Rose Quartz Crystal Tree", type: "Decor", icon: "🌸", price: 95 },
  { id: "8", name: "Handcrafted Dreamcatcher", type: "Decor", icon: "🕸️", price: 55 },
];

export default function Collections() {
  const [step, setStep] = useState(1);
  
  // AI Questionnaire State
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  
  // Box Configuration State
  const [boxSize, setBoxSize] = useState<3 | 5 | 7 | null>(null);
  
  // AI Curation State
  const [isCurating, setIsCurating] = useState(false);
  const [curatedItems, setCuratedItems] = useState<typeof INVENTORY>([]);
  
  const [quantity, setQuantity] = useState(1);

  // Simulated AI Logic: Picks items based on occasion/recipient
  const generateCuration = (size: number) => {
    setIsCurating(true);
    
    // Simulate API delay
    setTimeout(() => {
      let shuffled = [...INVENTORY].sort(() => 0.5 - Math.random());
      
      // Basic mock logic: if Corporate, prioritize pens/coffee
      if (recipient === "Corporate Partner") {
         shuffled = [...INVENTORY].sort((a, b) => (a.type === "Keepsake" ? -1 : 1));
      }
      // If Wedding/Anniversary, prioritize Decor/Gourmet
      if (occasion === "Wedding" || occasion === "Anniversary") {
         shuffled = [...INVENTORY].sort((a, b) => (a.type === "Decor" ? -1 : 1));
      }

      setCuratedItems(shuffled.slice(0, size));
      setIsCurating(false);
      setStep(3);
    }, 2000);
  };

  const handleBoxSelect = (size: 3 | 5 | 7) => {
    setBoxSize(size);
    generateCuration(size);
  };

  return (
    <main className="min-h-screen bg-ivory text-brown-dark pt-32 pb-48 px-6 md:px-12 selection:bg-gold selection:text-white">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-brown-dark mb-6">Bespoke AI Curation</h1>
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-brown-light leading-loose">
          Allow our intelligent concierge to craft the perfect masterpiece based on your needs.
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-background shadow-2xl border border-gold-light/40 relative overflow-hidden min-h-[500px]">
        {/* Progress Bar */}
        <div className="flex border-b border-gold-light/20 text-[10px] uppercase tracking-[0.2em] font-semibold">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`flex-1 py-4 text-center transition-colors duration-500 ${step >= s ? 'bg-gold/10 text-brown-dark' : 'text-brown-light/50'}`}
            >
              Step {s}
            </div>
          ))}
        </div>

        <div className="p-8 md:p-16 relative">
          
          {/* Full Screen Loading Overlay for AI Curation */}
          <AnimatePresence>
            {isCurating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-gold mb-6" />
                </motion.div>
                <h3 className="font-serif text-2xl text-brown-dark">Curating Your Masterpiece...</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-brown-light mt-4">Analyzing recipient profile & occasion</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: AI Concierge Questionnaire */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <Sparkles className="w-8 h-8 text-gold mb-6" />
                <h2 className="font-serif text-3xl mb-8">The Concierge Inquiry</h2>
                <p className="text-brown-light text-sm mb-12 max-w-lg leading-relaxed">
                  Tell us who you are gifting, and our AI will automatically select the perfect luxury items to leave a lasting impression.
                </p>

                <div className="w-full max-w-md space-y-8 text-left">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brown-dark mb-4">Whom is this masterpiece for?</label>
                    <div className="grid grid-cols-2 gap-4">
                      {["Corporate Partner", "Newlyweds", "Family", "Personal VIP"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setRecipient(opt)}
                          className={`py-3 px-4 border text-xs tracking-wider transition-all ${recipient === opt ? 'border-gold bg-gold/10 text-brown-dark' : 'border-gold-light/40 text-brown-light hover:border-gold/50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brown-dark mb-4">What is the occasion?</label>
                    <div className="grid grid-cols-2 gap-4">
                      {["Wedding", "Anniversary", "Festive", "Gratitude"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setOccasion(opt)}
                          className={`py-3 px-4 border text-xs tracking-wider transition-all ${occasion === opt ? 'border-gold bg-gold/10 text-brown-dark' : 'border-gold-light/40 text-brown-light hover:border-gold/50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!recipient || !occasion}
                  onClick={() => setStep(2)}
                  className="mt-16 bg-brown-dark text-white px-12 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-gold transition-colors disabled:opacity-50 disabled:hover:bg-brown-dark flex items-center gap-3"
                >
                  Select Box Size <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Box Size */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                <h2 className="font-serif text-3xl mb-4">Select The Foundation</h2>
                <p className="text-sm text-brown-light mb-12 text-center max-w-md">
                  Choose the volume of your gift. Once selected, our AI will instantly generate the perfect curation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  {[
                    { size: 3, name: "The Petit Curation", desc: "A subtle, elegant gesture. Perfect for gratitude." },
                    { size: 5, name: "The Signature Curation", desc: "Our classic offering. A balanced symphony of luxury." },
                    { size: 7, name: "The Royal Curation", desc: "Uncompromising opulence. An unforgettable statement." }
                  ].map((box) => (
                    <div 
                      key={box.size}
                      onClick={() => handleBoxSelect(box.size as 3|5|7)}
                      className={`cursor-pointer border border-gold-light/40 hover:border-gold/80 bg-background p-8 flex flex-col items-center text-center transition-all group`}
                    >
                      <Gift className={`w-10 h-10 mb-6 text-brown-light group-hover:text-gold transition-colors`} />
                      <h3 className="font-serif text-xl text-brown-dark mb-3">{box.name}</h3>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-4">{box.size} Items</div>
                      <p className="text-xs text-brown-light leading-relaxed">{box.desc}</p>
                      
                      <div className="mt-8 text-[10px] uppercase tracking-widest text-brown-dark opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        Generate Box <Sparkles className="w-3 h-3 text-gold"/>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 mt-16">
                  <button onClick={() => setStep(1)} className="px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-brown-light hover:text-brown-dark">Back</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: AI Curated Items Result */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-full flex flex-col md:flex-row justify-between items-center mb-12 pb-6 border-b border-gold-light/20 gap-6 text-center md:text-left">
                  <div>
                    <h2 className="font-serif text-3xl mb-2 flex items-center justify-center md:justify-start gap-3">
                      Your AI Masterpiece <Sparkles className="w-5 h-5 text-gold"/>
                    </h2>
                    <p className="text-xs text-brown-light uppercase tracking-wider">
                      Curated specifically for a {occasion} gift to a {recipient}.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => generateCuration(boxSize as number)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-brown-dark border border-gold-light/50 px-4 py-2 hover:bg-gold/10 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  {curatedItems.map((item) => (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={item.id}
                      className="border border-gold/30 bg-gold/5 p-6 flex flex-col items-center text-center shadow-sm"
                    >
                      <div className="text-4xl mb-4">{item.icon}</div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-brown-light mb-2">{item.type}</div>
                      <h4 className="font-serif text-sm text-brown-dark leading-snug">{item.name}</h4>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-6 mt-16">
                  <button onClick={() => setStep(2)} className="px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-brown-light hover:text-brown-dark">Change Size</button>
                  <button 
                    onClick={() => setStep(4)}
                    className="bg-brown-dark text-white px-12 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center gap-3"
                  >
                    Approve Curation <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Quantity & Checkout */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center mb-8">
                  <Gift className="w-10 h-10 text-gold" />
                </div>
                
                <h2 className="font-serif text-4xl mb-4 text-brown-dark">The Masterpiece is Ready</h2>
                <p className="text-sm text-brown-light mb-12 max-w-md leading-relaxed">
                  An exquisite AI curation of {boxSize} luxury items, meticulously prepared to honor your {occasion.toLowerCase()} occasion for your {recipient.toLowerCase()}.
                </p>

                <div className="bg-white border border-gold-light/40 p-8 w-full max-w-md shadow-sm mb-12">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-brown-dark mb-6 border-b border-gold-light/20 pb-4">Volume Configuration</h3>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-serif text-lg text-brown-dark">Quantity</span>
                    <div className="flex items-center gap-4 border border-brown-dark p-1">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gold/10 text-brown-dark transition-colors"><Minus className="w-4 h-4"/></button>
                      <span className="w-8 text-center font-sans font-medium">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gold/10 text-brown-dark transition-colors"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>

                  <div className="bg-background p-4 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-brown-light">Estimated Total</span>
                    <span className="font-serif text-xl text-gold">${(150 + (curatedItems.length * 40)) * quantity}</span>
                  </div>
                </div>

                <div className="flex gap-6">
                  <button onClick={() => setStep(3)} className="px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-brown-light hover:text-brown-dark border border-transparent hover:border-gold-light/40 transition-colors">Edit Box</button>
                  <button 
                    className="bg-brown-dark text-white px-12 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center gap-3 shadow-xl"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Vault
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
