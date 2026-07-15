"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Gift, Minus, Plus, ShoppingBag, RefreshCw, X, HelpCircle, Eye, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PremiumCanister from "@/components/PremiumCanister";

// Curation Helper Inventory - matches seeded database items for context coherence
const INVENTORY = [
  { id: "1", name: "Premium Dark Chocolate Truffles", type: "Gourmet", price: 25 },
  { id: "2", name: "Single Origin Coffee Beans", type: "Beverage", price: 18 },
  { id: "3", name: "Silver Plated Tea Infuser", type: "Keepsake", price: 30 },
  { id: "4", name: "Hand-poured Soy Candle", type: "Decor", price: 22 },
  { id: "5", name: "Artisanal Roasted Makhana", type: "Gourmet", price: 25 },
  { id: "6", name: "Premium Dryfruits Mix", type: "Gourmet", price: 45 },
  { id: "7", name: "Blush Leather Diary", type: "Keepsake", price: 65 },
  { id: "8", name: "Rose Quartz Crystal Tree", type: "Decor", price: 95 },
];

// Map of standard hampers to their internal premium canister products
const HAMPER_ITEMS_MAP: Record<string, {
  theme: "rich-mahogany" | "ivory-blush" | "royal-navy" | "dark-emerald";
  items: Array<{ id: string; name: string; type: string; price: number; desc?: string; image?: string }>;
}> = {
  "the-botanical-heritage": {
    theme: "rich-mahogany",
    items: [
      { id: 'h1-1', name: 'Artisanal Roasted Makhana', type: 'Gourmet', price: 25, desc: 'Hand-roasted lotus seeds tossed in gourmet herbs and clarified butter.', image: '/roasted_makhana.png' },
      { id: 'h1-2', name: 'Earl Grey Royal Tea Blend', type: 'Beverage', price: 35, desc: 'A robust black tea base infused with pure cold-pressed oil of Bergamot.', image: '/earl_grey_tea.png' },
      { id: 'h1-3', name: 'Rose Quartz Crystal Tree', type: 'Decor', price: 95, desc: 'An elegant rose quartz crystal tree adorned with delicate brass wire and real 24k gold leaf accents.', image: '/crystal_tree.png' }
    ]
  },
  "the-ivory-keepsake": {
    theme: "ivory-blush",
    items: [
      { id: 'h2-1', name: 'Silver Plated Tea Infuser', type: 'Keepsake', price: 30, desc: 'Intricately designed sterling silver-plated tea strainer.', image: '/silver_tea_infuser.png' },
      { id: 'h2-2', name: 'Fine Bone China Cup', type: 'Keepsake', price: 55, desc: 'Elegant fine bone china tea cup with gold leaf handles and trim.', image: '/china_cup.png' },
      { id: 'h2-3', name: 'Organic Honey Lavender Jars', type: 'Gourmet', price: 20, desc: 'Small glass jar of organic honey infused with lavender buds.', image: '/honey_lavender.png' },
      { id: 'h2-4', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 25, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' }
    ]
  },
  "the-imperial-executive": {
    theme: "royal-navy",
    items: [
      { id: 'h3-1', name: 'Single Origin Coffee Beans', type: 'Beverage', price: 18, desc: 'Ethiopian Yirgacheffe medium roast with floral notes and bergamot acidity.', image: '/single_origin_coffee.png' },
      { id: 'h3-2', name: 'Premium Dark Chocolate Truffles', type: 'Gourmet', price: 25, desc: 'Velvety Ganache infused with French sea salt, covered in 70% dark chocolate.', image: '/dark_chocolate_truffles.png' },
      { id: 'h3-3', name: 'Blush Leather Diary', type: 'Keepsake', price: 65, desc: 'Hand-stitched top-grain Italian leather journal with custom hot-gold lettering.', image: '/leather_diary.png' },
      { id: 'h3-4', name: 'Gold Foil Playing Cards', type: 'Keepsake', price: 40, desc: 'Premium deck of playing cards with intricate gold foil back designs.', image: '/gold_playing_cards.png' }
    ]
  }
};

const getCanisterDetails = (product: any) => {
  if (HAMPER_ITEMS_MAP[product.slug]) {
    return HAMPER_ITEMS_MAP[product.slug];
  }
  // Default unbox presentation if not custom mapped
  return {
    theme: "dark-emerald" as const,
    items: [
      {
        id: product.id,
        name: product.name,
        type: product.category?.name || "Premium",
        price: Number(product.basePrice),
        desc: product.shortDescription || product.longDescription || "An exquisite selection of GormetCo luxury artifacts."
      }
    ]
  };
};

const getProductImage = (product: any) => {
  const slug = product.slug;
  
  if (slug === "the-botanical-heritage") {
    return "/classic_hero.png";
  }
  if (slug === "the-ivory-keepsake") {
    return "/vel1.jpeg";
  }
  if (slug === "the-imperial-executive") {
    return "/royale.jpeg";
  }

  const segment = getProductSegment(product);
  
  // Deterministic hash index based on slug characters
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash += slug.charCodeAt(i);
  }

  if (segment === "premium-velvet") {
    const images = ["/vel1.jpeg", "/vel2.jpeg", "/vel3.jpeg"];
    return images[hash % images.length];
  }

  if (segment === "royale-tins") {
    const images = [
      "/productspic/tin1.jpeg",
      "/productspic/tin2.jpeg",
      "/productspic/tin3.jpeg",
      "/productspic/tin4.jpeg",
      "/productspic/tin5.jpeg",
      "/productspic/tin6.jpeg",
      "/productspic/tin7.jpeg",
      "/productspic/tin8.jpeg",
      "/productspic/tin9.jpeg",
      "/productspic/tin10.jpeg",
      "/productspic/tin11.jpeg",
      "/productspic/tin12.jpeg",
      "/productspic/tin13.jpeg",
      "/productspic/tin14.jpeg",
      "/productspic/tin15.jpeg",
      "/productspic/tin16.jpeg",
      "/productspic/tin17.jpeg"
    ];
    return images[hash % images.length];
  }

  // classics
  const images = ["/classic_hero.png", "/classic.jpeg", "/classic2.jpeg", "/classic3.jpeg", "/classic4.jpeg", "/classic5.jpeg", "/classic6.jpeg"];
  return images[hash % images.length];
};

const getFrameClass = (index: number) => {
  const classes = ["frame-odd-1", "frame-odd-2", "frame-odd-3", "frame-odd-4"];
  return classes[index % classes.length];
};

const getProductSegment = (product: any) => {
  const slug = product.slug;
  const catName = product.category?.name || "";
  
  if (slug === "the-botanical-heritage") return "classics";
  if (slug === "the-imperial-executive") return "royale-tins";
  if (slug === "the-ivory-keepsake") return "premium-velvet";

  switch (catName) {
    case "Crafted In-House":
    case "Festive":
      return "premium-velvet";
    case "Drinkware":
    case "Tech Accessories":
    case "Desk & Stationery":
      return "royale-tins";
    case "Gourmet":
    case "Wellness":
    case "Eco & Sustainable":
    case "Packaging":
    default:
      return "classics";
  }
};

function CollectionsContent() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const searchParams = useSearchParams();

  useEffect(() => {
    const segment = searchParams.get("segment");
    if (segment) {
      setTabFilter(segment);
    }
  }, [searchParams]);
  


  // AI Curation Helper State
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  const [boxSize, setBoxSize] = useState<3 | 5 | 7 | null>(null);
  const [isCurating, setIsCurating] = useState(false);
  const [curatedItems, setCuratedItems] = useState<typeof INVENTORY>([]);
  const [quantity, setQuantity] = useState(1);

  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Load products from database API
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          // Remove Bespoke Gift Box from main display catalog since it has its own bespoke constructor page
          const catalogProducts = data.products.filter((p: any) => p.slug !== "bespoke-gift-box");
          setProducts(catalogProducts);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Simulated AI curation logic
  const generateCuration = (size: number) => {
    setIsCurating(true);
    setTimeout(() => {
      let shuffled = [...INVENTORY].sort(() => 0.5 - Math.random());
      if (recipient === "Corporate Partner") {
        shuffled = [...INVENTORY].sort((a, b) => (a.type === "Keepsake" ? -1 : 1));
      }
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

  // Add standard product/hamper to cart
  const handleAddToCart = async (product: any, shouldRedirect = false) => {
    setAddingToCartId(product.id);
    try {
      const variantId = product.variants?.[0]?.id;
      const customizationState = {
        'Edition': 'Standard Curated Edition',
        variantId,
      };

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          customizationState,
          priceSnapshot: Number(product.basePrice),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (shouldRedirect) {
          router.push('/cart');
        } else {
          setAddedProductId(product.id);
          window.dispatchEvent(new Event('cart-updated'));
          setTimeout(() => {
            setAddedProductId(null);
          }, 1500);
        }
      } else {
        alert("Failed to add hamper to bag. Please check inventory stock levels.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding item to bag.");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleCanisterCheckout = async (product: any) => {
    await handleAddToCart(product, true);
  };

  // Add custom AI curated hamper configuration to cart using the seeded bespoke box template
  const handleAddAICurationToCart = async () => {
    setAddingToCartId("ai-curation");
    try {
      // Load raw bespoke template product
      const resProducts = await fetch("/api/products");
      const dataProducts = await resProducts.json();
      const bespokeProduct = dataProducts.products?.find((p: any) => p.slug === "bespoke-gift-box");

      if (!bespokeProduct) {
        alert("Bespoke Curation Base template not found in database. Please run migrations.");
        return;
      }
      
      const variantId = bespokeProduct.variants?.[0]?.id;
      const unitPrice = 150 + curatedItems.length * 40;
      
      const selectedItemIds = curatedItems.map(curItem => {
        const matchingProduct = dataProducts.products?.find((p: any) => p.name === curItem.name);
        return matchingProduct?.id;
      }).filter(Boolean);

      const customizationState = {
        'Curation Mode': 'Bespoke AI Concierge',
        'Recipient Profile': recipient,
        'Celebrated Occasion': occasion,
        'Volume Limit': `${boxSize} Items`,
        'Curated Selection': curatedItems.map(item => item.name).join(', '),
        totalBoxes: 1,
        selectedItemIds,
        variantId,
      };

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: bespokeProduct.id,
          quantity,
          customizationState,
          priceSnapshot: unitPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsConciergeOpen(false);
        router.push('/cart');
      } else {
        alert("Failed to save AI curation configuration.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding custom curation to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };



  // Filter logic based on tabs, search query, and sorting criteria
  const filteredProducts = products
    .filter((product) => {
      // 1. Tab filter
      let matchesTab = true;
      if (tabFilter === "classics") matchesTab = getProductSegment(product) === "classics";
      else if (tabFilter === "royale-tins") matchesTab = getProductSegment(product) === "royale-tins";
      else if (tabFilter === "premium-velvet") matchesTab = getProductSegment(product) === "premium-velvet";

      // 2. Search query filter
      let matchesSearch = true;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          product.name.toLowerCase().includes(query) ||
          (product.shortDescription && product.shortDescription.toLowerCase().includes(query)) ||
          (product.category?.name && product.category.name.toLowerCase().includes(query));
      }

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") {
        return Number(a.basePrice) - Number(b.basePrice);
      }
      if (sortBy === "price-desc") {
        return Number(b.basePrice) - Number(a.basePrice);
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0; // default
    });

  return (
    <main className="min-h-screen bg-sand text-foreground pt-32 pb-48 px-6 md:px-12 selection:bg-gold selection:text-white relative overflow-hidden">
      
      {/* Background flares */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full radial-gold-flare opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full radial-gold-flare opacity-10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase font-bold block mb-3 animate-pulse">* curated collections *</span>
        <h1 className="font-serif text-5xl md:text-6xl text-clay-dark mb-6">The Masterpiece Gallery</h1>
      </div>

      {/* Tab filter row */}
      <div className="flex justify-center flex-wrap gap-4 mb-16 px-6 relative z-10">
        {["all", "classics", "royale-tins", "premium-velvet"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabFilter(tab)}
            className={`px-8 py-3.5 text-[9px] uppercase tracking-[0.25em] font-bold transition-all border rounded-none cursor-pointer ${
              tabFilter === tab
                ? "bg-[#2e2520] text-ivory border-[#2e2520] shadow-premium"
                : "border-gold/30 text-clay-light bg-ivory/30 hover:border-gold/80 hover:bg-ivory/70"
            }`}
          >
            {tab === "all" ? "All Masterpieces" : tab === "classics" ? "The Classics" : tab === "royale-tins" ? "Royale Tin Tin" : "Premium Velvet"}
          </button>
        ))}
      </div>

      {/* Search & Sort Panel */}
      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-gold-light/30 pb-6 pt-2">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md group">
            <span className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gold/80 transition-transform duration-300 group-focus-within:scale-110" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search masterpieces (e.g. coffee, truffles)..."
              className="w-full pl-8 pr-8 py-2 text-[10px] uppercase tracking-[0.2em] bg-transparent border-b border-gold-light/40 focus:border-gold focus:outline-none transition-all duration-300 font-sans text-clay-dark placeholder-gold-light/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-clay-light hover:text-clay-dark"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Curation indicator & Sort controls */}
          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
            <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-gold font-bold">
              {filteredProducts.length} masterpieces curated
            </span>
            
            <div className="flex items-center gap-2">
              <label className="font-sans text-[8px] uppercase tracking-[0.25em] text-gold font-bold">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-gold-light/40 focus:border-gold text-[9px] uppercase tracking-[0.2em] font-bold px-1.5 py-1.5 focus:outline-none transition-all duration-300 cursor-pointer font-sans text-clay-dark"
              >
                <option value="default" className="bg-ivory text-clay-dark">Default Order</option>
                <option value="price-asc" className="bg-ivory text-clay-dark">Price: Low to High</option>
                <option value="price-desc" className="bg-ivory text-clay-dark">Price: High to Low</option>
                <option value="name-asc" className="bg-ivory text-clay-dark">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Catalog Showcase */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <p className="font-sans text-[10px] uppercase tracking-widest text-clay-light">Verifying catalog inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gold-light/60 bg-ivory/30">
            <p className="font-sans text-xs uppercase tracking-widest text-clay-light">No items found matching the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 perspective-1500">
            {filteredProducts.map((product, idx) => {
              const image = getProductImage(product);
              const frameClass = getFrameClass(idx);
              return (
                <motion.div
                  key={product.id}
                  whileHover={{
                    y: -6,
                    boxShadow: '0 20px 35px -10px rgba(63, 21, 28, 0.18)',
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-ivory border border-gold-light/40 p-6 flex flex-col justify-between cursor-pointer shadow-premium group"
                >
                  <div>
                    {/* Odd shaped frame container */}
                    <div 
                      className={`relative aspect-[4/3] w-full overflow-hidden ${frameClass} mb-6 border border-gold-light/30`}
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-gold font-bold">
                        {product.category?.name || "Premium Collection"}
                      </span>
                      {product.isCorporate && (
                        <span className="font-sans text-[8px] bg-clay-dark text-ivory px-2 py-0.5 uppercase tracking-widest font-medium">
                          Corporate
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-serif text-xl text-clay-dark mb-2 group-hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="font-sans text-xs text-clay-light leading-relaxed mb-6">
                      {product.shortDescription || "An exquisite selection curated by our master gifting curators."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gold-light/30 mt-auto w-full">
                    <span className="font-serif text-[10px] tracking-widest text-gold uppercase font-bold">Signature Keepsake</span>
                    <div className="flex gap-2">
                      {product.category?.slug === 'hampers' && (
                        <Link
                          href={`/collections/add-items?package=${product.slug}`}
                          className="px-4 py-2 border border-gold text-gold text-[9px] uppercase tracking-widest hover:bg-gold hover:text-[#2e2520] transition-colors cursor-pointer text-center font-bold"
                        >
                          Customise
                        </Link>
                      )}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCartId === product.id}
                        className="bg-clay-dark text-ivory px-4 py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-gold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-premium"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {addingToCartId === product.id ? "Adding..." : addedProductId === product.id ? "Added!" : "Add to Bag"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for AI Concierge Helper */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button
          onClick={() => {
            setStep(1);
            setIsConciergeOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-4 rounded-full bg-ivory border-2 border-gold text-gold hover:text-clay-dark hover:border-clay-dark transition-all shadow-premium cursor-pointer font-sans text-[10px] font-bold uppercase tracking-wider relative overflow-hidden group"
        >
          {/* Subtle gold flare overlay */}
          <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Sparkles className="w-4 h-4 text-gold group-hover:rotate-12 transition-transform" />
          <span>AI Concierge Helper</span>
        </motion.button>
      </div>

      {/* AI Curation Helper Slide-over Drawer */}
      <AnimatePresence>
        {isConciergeOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConciergeOpen(false)}
              className="fixed inset-0 bg-clay-dark/60 z-40 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] z-50 bg-ivory shadow-2xl border-l border-gold-light/40 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-gold-light/20 flex justify-between items-center bg-sand/30">
                <div className="flex items-center gap-3">
                  <div className="bg-gold/10 p-2 rounded-full border border-gold-light/40">
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-clay-dark">AI Concierge Assistant</h2>
                    <p className="font-sans text-[8px] uppercase tracking-widest text-clay-light font-bold">Bespoke Curation Wizard</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConciergeOpen(false)}
                  className="p-2 border border-gold-light/30 rounded-full text-clay-light hover:text-clay-dark hover:border-gold hover:bg-gold/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress steps */}
              <div className="flex border-b border-gold-light/20 text-[8px] uppercase tracking-[0.2em] font-semibold bg-ivory/50">
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`flex-1 py-3 text-center transition-colors duration-500 ${step >= s ? 'bg-gold/10 text-clay-dark border-b-2 border-gold' : 'text-clay-light/40'}`}
                  >
                    Step {s}
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-between">
                
                {/* Simulated Loading Overlay */}
                <AnimatePresence>
                  {isCurating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-ivory/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="mb-4"
                      >
                        <Sparkles className="w-10 h-10 text-gold" />
                      </motion.div>
                      <h3 className="font-serif text-xl text-clay-dark">Curating Your Masterpiece...</h3>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-clay-light mt-2 font-bold">Analyzing recipient profile & occasion</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-full flex-1">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1 */}
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center text-center"
                      >
                        <Sparkles className="w-7 h-7 text-gold mb-4" />
                        <h2 className="font-serif text-2xl mb-4 text-clay-dark">The Concierge Inquiry</h2>
                        <p className="text-clay-light text-xs mb-8 max-w-sm leading-relaxed">
                          Tell us who you are gifting, and our AI will automatically select the perfect luxury items to leave a lasting impression.
                        </p>

                        <div className="w-full space-y-6 text-left">
                          <div>
                            <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-clay-dark mb-3">Whom is this masterpiece for?</label>
                            <div className="grid grid-cols-2 gap-3 font-sans">
                              {["Corporate Partner", "Newlyweds", "Family", "Personal VIP"].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setRecipient(opt)}
                                  className={`py-3 px-3 border text-[10px] tracking-wider transition-all font-semibold uppercase rounded-none cursor-pointer ${recipient === opt ? 'border-gold bg-gold/10 text-clay-dark shadow-sm' : 'border-gold-light/40 text-clay-light hover:border-gold/60'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-clay-dark mb-3">What is the occasion?</label>
                            <div className="grid grid-cols-2 gap-3 font-sans">
                              {["Wedding", "Anniversary", "Festive", "Gratitude"].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setOccasion(opt)}
                                  className={`py-3 px-3 border text-[10px] tracking-wider transition-all font-semibold uppercase rounded-none cursor-pointer ${occasion === opt ? 'border-gold bg-gold/10 text-clay-dark shadow-sm' : 'border-gold-light/40 text-clay-light hover:border-gold/60'}`}
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
                          className="mt-12 w-full bg-clay-dark text-ivory py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-colors disabled:opacity-50 disabled:hover:bg-clay-dark flex items-center justify-center gap-3 cursor-pointer shadow-premium font-bold"
                        >
                          Select Box Size <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center"
                      >
                        <h2 className="font-serif text-2xl mb-2 text-clay-dark text-center">Select The Foundation</h2>
                        <p className="text-[11px] text-clay-light mb-8 text-center max-w-sm">
                          Choose the volume of your gift. Once selected, our AI will instantly generate the perfect curation.
                        </p>

                        <div className="space-y-4 w-full">
                          {[
                            { size: 3, name: "The Petit Curation", desc: "A subtle, elegant gesture. Perfect for gratitude." },
                            { size: 5, name: "The Signature Curation", desc: "Our classic offering. A balanced symphony of luxury." },
                            { size: 7, name: "The Royal Curation", desc: "Uncompromising opulence. An unforgettable statement." }
                          ].map((box) => (
                            <div 
                              key={box.size}
                              onClick={() => handleBoxSelect(box.size as 3|5|7)}
                              className={`cursor-pointer border border-gold-light/40 hover:border-gold bg-ivory p-5 flex items-start gap-4 transition-all group`}
                            >
                              <Gift className={`w-8 h-8 text-clay-light group-hover:text-gold transition-colors shrink-0 mt-1`} />
                              <div>
                                <h3 className="font-serif text-base text-clay-dark mb-0.5">{box.name}</h3>
                                <div className="text-[9px] uppercase tracking-[0.15em] text-gold font-bold mb-1">{box.size} Items</div>
                                <p className="text-[10px] text-clay-light leading-relaxed">{box.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-4 w-full mt-10">
                          <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gold-light/40 text-[10px] uppercase tracking-[0.2em] text-clay-light hover:text-clay-dark hover:border-gold transition-colors cursor-pointer font-bold">
                            Back
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-full pb-4 border-b border-gold-light/20 mb-6 text-center">
                          <h2 className="font-serif text-2xl text-clay-dark mb-1 flex items-center justify-center gap-2">
                            Your AI Masterpiece <Sparkles className="w-4 h-4 text-gold"/>
                          </h2>
                          <p className="text-[9px] text-clay-light uppercase tracking-wider font-bold">
                            Curated for a {occasion} gift to a {recipient}.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full max-h-[35vh] overflow-y-auto pr-1">
                          {curatedItems.map((item) => (
                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={item.id}
                                className="border border-gold-light/30 bg-ivory p-4 flex flex-col items-center text-center shadow-sm"
                              >
                                <div className="mb-2 text-gold">
                                  <Gift className="w-6 h-6" />
                                </div>
                                <div className="text-[8px] uppercase tracking-[0.2em] text-clay-light mb-1 font-bold">{item.type}</div>
                                <h4 className="font-serif text-xs text-clay-dark leading-snug">{item.name}</h4>
                              </motion.div>
                          ))}
                        </div>

                        <div className="flex gap-3 w-full mt-10">
                          <button 
                            onClick={() => generateCuration(boxSize as number)}
                            className="flex-1 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-clay-dark border border-gold-light/50 py-3.5 hover:bg-gold/10 transition-colors cursor-pointer font-bold"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Regenerate
                          </button>
                          <button 
                            onClick={() => setStep(4)}
                            className="flex-1 bg-clay-dark text-ivory py-3.5 text-[9px] uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold shadow-premium"
                          >
                            Approve <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <button onClick={() => setStep(2)} className="mt-4 text-[9px] uppercase tracking-[0.2em] text-clay-light hover:text-clay-dark transition-colors cursor-pointer font-bold">Change Size</button>
                      </motion.div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                      <motion.div 
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mb-6 bg-gold/5">
                          <Gift className="w-7 h-7 text-gold" />
                        </div>
                        
                        <h2 className="font-serif text-3xl mb-2 text-clay-dark">Ready for Vault</h2>
                        <p className="text-[11px] text-clay-light mb-8 max-w-sm leading-relaxed">
                          An exquisite AI curation of {boxSize} luxury items, meticulously prepared to honor your {occasion.toLowerCase()} occasion for your {recipient.toLowerCase()}.
                        </p>

                        <div className="bg-ivory border border-gold-light/40 p-5 w-full shadow-sm mb-8">
                          <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-clay-dark mb-4 border-b border-gold-light/10 pb-2">Volume Configuration</h3>
                          
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-serif text-base text-clay-dark font-medium">Quantity</span>
                            <div className="flex items-center gap-3 border border-clay-dark p-0.5">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 hover:bg-gold/10 text-clay-dark transition-colors"><Minus className="w-3 h-3"/></button>
                              <span className="w-6 text-center font-sans font-semibold text-xs">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 hover:bg-gold/10 text-clay-dark transition-colors"><Plus className="w-3 h-3"/></button>
                            </div>
                          </div>

                          <div className="bg-sand/30 p-3.5 flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest text-clay-light font-bold">Estimated Total</span>
                            <span className="font-serif text-lg text-gold font-bold">${(150 + (curatedItems.length * 40)) * quantity}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 w-full">
                          <button onClick={() => setStep(3)} className="flex-1 py-3.5 text-[9px] uppercase tracking-[0.2em] text-clay-light hover:text-clay-dark border border-gold-light/40 transition-colors cursor-pointer font-bold">Edit Box</button>
                          <button 
                            onClick={handleAddAICurationToCart}
                            disabled={addingToCartId === "ai-curation"}
                            className="flex-1 bg-clay-dark text-ivory py-3.5 text-[9px] uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center justify-center gap-2 shadow-premium cursor-pointer font-bold"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> 
                            {addingToCartId === "ai-curation" ? "Adding..." : "Add to Vault"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



    </main>
  );
}

export default function Collections() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand flex items-center justify-center text-gold">Loading Masterpieces...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}
