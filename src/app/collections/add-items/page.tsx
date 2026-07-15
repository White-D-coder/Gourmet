"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Minus, ShoppingBag, X, Gift, RefreshCw, AlertCircle, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  shortDescription: string;
  category?: {
    name: string;
  };
}

const PACKAGE_MAP: Record<string, { name: string; capacity: number; baseBoxPrice: number }> = {
  "the-botanical-heritage": { name: "The Botanical Heritage Box", capacity: 3, baseBoxPrice: 45.00 },
  "the-ivory-keepsake": { name: "The Ivory Keepsake Box", capacity: 5, baseBoxPrice: 45.00 },
  "the-imperial-executive": { name: "The Imperial Executive Box", capacity: 7, baseBoxPrice: 45.00 },
  "bespoke-gift-box": { name: "Bespoke Gift Box", capacity: 5, baseBoxPrice: 45.00 },
};

function AddItemsWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageSlug = searchParams.get("package") || "bespoke-gift-box";

  // Resolve initial package details
  const config = PACKAGE_MAP[packageSlug] || PACKAGE_MAP["bespoke-gift-box"];
  const packageName = config.name;

  const [mainPackageProduct, setMainPackageProduct] = useState<any>(null);
  const [standaloneItems, setStandaloneItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Selected items inside the box (unlimited quantity)
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  
  // Custom box counts overrides. If null, we default to recommended boxes.
  const [customBoxes, setCustomBoxes] = useState<Record<string, number> | null>(null);

  // Sparkles animation particles
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const [addingToCart, setAddingToCart] = useState(false);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          // Find the product record of the main package
          const mainProd = data.products.find((p: any) => p.slug === packageSlug) || data.products.find((p: any) => p.slug === "bespoke-gift-box");
          setMainPackageProduct(mainProd);

          // Get only standalone gourmet / decor items for filling the box
          const items = data.products.filter(
            (p: any) => p.category?.slug !== "hampers" && p.slug !== "bespoke-gift-box"
          );
          setStandaloneItems(items);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [packageSlug]);

  // Solver: recommends most optimal combination of boxes (Botanical [3], Ivory [5], Executive [7]) for N items
  const getRecommendedBoxes = (n: number) => {
    if (n <= 0) return { "the-botanical-heritage": 0, "the-ivory-keepsake": 0, "the-imperial-executive": 0 };
    
    let bestCost = Infinity;
    let bestCombo = { "the-botanical-heritage": 0, "the-ivory-keepsake": 0, "the-imperial-executive": 0 };

    for (let b = 0; b <= 10; b++) {
      for (let iv = 0; iv <= 10; iv++) {
        for (let ex = 0; ex <= 10; ex++) {
          const cap = b * 3 + iv * 5 + ex * 7;
          if (cap >= n) {
            const cost = (b + iv + ex) * 45.00;
            const emptySlots = cap - n;
            const score = cost * 1000 + emptySlots; // minimize cost primarily, then minimize empty slots
            if (score < bestCost) {
              bestCost = score;
              bestCombo = {
                "the-botanical-heritage": b,
                "the-ivory-keepsake": iv,
                "the-imperial-executive": ex
              };
            }
          }
        }
      }
    }
    return bestCombo;
  };

  const boxQuantities: Record<string, number> = customBoxes || getRecommendedBoxes(selectedItems.length);

  const totalCapacity = 
    (boxQuantities["the-botanical-heritage"] || 0) * 3 +
    (boxQuantities["the-ivory-keepsake"] || 0) * 5 +
    (boxQuantities["the-imperial-executive"] || 0) * 7;

  const totalBoxes = 
    (boxQuantities["the-botanical-heritage"] || 0) +
    (boxQuantities["the-ivory-keepsake"] || 0) +
    (boxQuantities["the-imperial-executive"] || 0);

  // Add item to custom curation
  const handleAddItem = (item: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    // Spawn gold sparkles around button click
    const rect = e.currentTarget.getBoundingClientRect();
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: rect.left + rect.width / 2 + (Math.random() * 40 - 20),
      y: rect.top + window.scrollY + (Math.random() * 20 - 10)
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.some(n => n.id === s.id)));
    }, 1000);

    setSelectedItems(prev => [...prev, item]);
  };

  // Remove item from custom curation
  const handleRemoveItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  // Manual update of box quantities
  const handleUpdateBoxQty = (slug: string, qty: number) => {
    const recommended = getRecommendedBoxes(selectedItems.length);
    const base = customBoxes || recommended;
    setCustomBoxes({
      ...base,
      [slug]: qty
    });
  };

  // Calculations
  const calculatedItemsTotal = selectedItems.reduce((sum, item) => sum + Number(item.basePrice), 0);
  const calculatedBoxTotal = totalBoxes * 45.00;
  const calculatedTotalPrice = calculatedBoxTotal + calculatedItemsTotal;

  // Save selection and add to cart
  const handleAddToBag = async () => {
    if (!mainPackageProduct) {
      alert("Main package product template could not be loaded. Please run seeding script.");
      return;
    }

    setAddingToCart(true);

    try {
      const variantId = mainPackageProduct.variants?.[0]?.id;

      // Group items by name to format nice curation content description
      const itemCounts: Record<string, number> = {};
      selectedItems.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });
      const itemsListStr = Object.entries(itemCounts)
        .map(([name, count]) => `${count}x ${name}`)
        .join(", ");

      const boxCountsStr = Object.entries(boxQuantities)
        .filter(([_, count]) => count > 0)
        .map(([slug, count]) => `${count}x ${slug === "the-botanical-heritage" ? "Botanical Box" : slug === "the-ivory-keepsake" ? "Ivory Box" : "Imperial Box"}`)
        .join(", ");

      const customizationState = {
        "Curation Mode": "Custom Gifting Supervised Configuration",
        "Box Package Base": boxCountsStr || "Empty Box Set",
        "Capacity Limit": `${totalCapacity} items total`,
        "Curation Content": itemsListStr || "Empty Custom Selection",
        "Total Boxes Packed": `${totalBoxes} Box(es)`,
        totalBoxes: totalBoxes, // Used by PricingService during checkout
        selectedItemIds: selectedItems.map(item => item.id), // Used by PricingService during checkout
        variantId,
      };

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: mainPackageProduct.id,
          quantity: 1,
          customizationState,
          priceSnapshot: calculatedTotalPrice, // Set price snapshot for e-commerce cart view
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event('cart-updated'));
        router.push("/cart");
      } else {
        alert("Failed to save custom curation configuration.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding customized boxes to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Filter items by tab
  const filteredItems = standaloneItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.category?.name?.toLowerCase() === activeTab;
  });

  const getProductImage = (slug: string) => {
    switch (slug) {
      case "premium-dark-chocolate-truffles":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.31 (1).jpeg";
      case "single-origin-coffee-beans":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34 (1).jpeg";
      case "silver-plated-tea-infuser":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (2).jpeg";
      case "hand-poured-soy-candle":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32 (3).jpeg";
      case "artisanal-roasted-makhana":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34.jpeg";
      case "premium-dryfruits-mix":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (3).jpeg";
      case "blush-leather-diary":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.35.jpeg";
      case "rose-quartz-crystal-tree":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32 (1).jpeg";
      case "earl-grey-royal-tea-blend":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.31.jpeg";
      case "organic-honey-lavender-jars":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33.jpeg";
      case "gold-foil-playing-cards":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.32.jpeg";
      case "sandalwood-incense-cones":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34 (2).jpeg";
      case "fine-bone-china-cup":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.33 (1).jpeg";
      case "belgian-waffle-crisps":
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.35 (1).jpeg";
      default:
        return "/productspic/WhatsApp Image 2026-07-14 at 20.20.34.jpeg";
    }
  };

  // Generate flat list of active boxes to render
  const getBoxesToRender = () => {
    const list: Array<{ slug: string; name: string; capacity: number }> = [];
    Object.entries(boxQuantities).forEach(([slug, count]) => {
      const cap = slug === "the-botanical-heritage" ? 3 : slug === "the-ivory-keepsake" ? 5 : 7;
      const name = slug === "the-botanical-heritage" ? "Botanical Heritage" : slug === "the-ivory-keepsake" ? "Ivory Keepsake" : "Imperial Executive";
      for (let i = 0; i < count; i++) {
        list.push({ slug, name, capacity: cap });
      }
    });
    return list;
  };

  const activeBoxes = getBoxesToRender();
  let itemIndex = 0;
  const boxesWithItems = activeBoxes.map((box) => {
    const boxItems = selectedItems.slice(itemIndex, itemIndex + box.capacity);
    const boxStartIndex = itemIndex;
    itemIndex += box.capacity;
    return { ...box, items: boxItems, startIndex: boxStartIndex };
  });

  return (
    <main className="min-h-screen bg-sand text-foreground pt-32 pb-48 px-6 md:px-12 selection:bg-gold selection:text-white relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-ivory/40 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Title */}
        <div className="mb-12 text-center lg:text-left">
          <Link href="/collections" className="text-[10px] uppercase tracking-widest text-gold hover:text-clay-dark font-bold mb-3 inline-block transition-colors">
            ← Back to Curation House
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl text-clay-dark mb-3">Custom Gifting Studio</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-clay-light font-medium">
            Select standalone items to curate. We will automatically organize them into matching keepsake boxes under our supervision.
          </p>
        </div>

        {/* Split Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Box Summary Panel (5 cols) */}
          <div className="lg:col-span-5 bg-ivory/80 backdrop-blur-md border border-gold-light/40 p-6 md:p-8 shadow-premium rounded-none sticky top-28 flex flex-col gap-6">
            <div>
              <span className="font-sans text-[9px] uppercase tracking-widest text-gold font-bold block mb-1">Curation Console</span>
              <h3 className="font-serif text-xl text-clay-dark">Your Customized Selection</h3>
            </div>

            {/* Dynamic Box Suggestion / Custon Option Panel */}
            <div className="border border-gold-light/35 p-5 bg-sand/20">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-serif text-xs text-clay-dark flex items-center gap-1.5 font-bold">
                  Curator Packaging Suggestion <Sparkles className="w-3.5 h-3.5 text-gold" />
                </h4>
                {customBoxes && (
                  <button
                    onClick={() => setCustomBoxes(null)}
                    className="text-[8px] uppercase tracking-widest text-gold hover:text-clay-dark font-bold transition-colors cursor-pointer"
                  >
                    Reset to Optimal
                  </button>
                )}
              </div>
              <p className="text-[10px] text-clay-light leading-relaxed mb-4">
                Based on your {selectedItems.length} selected item{selectedItems.length !== 1 && 's'}, we suggest the following box arrangement. Feel free to adjust box counts to your liking:
              </p>

              <div className="space-y-3">
                {[
                  { slug: "the-botanical-heritage", name: "Botanical Heritage Box (Fits 3)", cap: 3 },
                  { slug: "the-ivory-keepsake", name: "Ivory Keepsake Box (Fits 5)", cap: 5 },
                  { slug: "the-imperial-executive", name: "Imperial Executive Box (Fits 7)", cap: 7 },
                ].map((box) => {
                  const qty = boxQuantities[box.slug] || 0;
                  return (
                    <div key={box.slug} className="flex justify-between items-center text-xs border-b border-gold-light/10 pb-2">
                      <span className="font-sans text-[10px] text-clay-dark uppercase tracking-wider font-semibold">{box.name}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateBoxQty(box.slug, Math.max(0, qty - 1))}
                          className="w-5 h-5 rounded-none border border-gold-light/40 flex items-center justify-center hover:bg-gold/10 text-gold font-bold transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-sans text-xs font-bold text-clay-dark w-4 text-center">{qty}</span>
                        <button
                          onClick={() => handleUpdateBoxQty(box.slug, qty + 1)}
                          className="w-5 h-5 rounded-none border border-gold-light/40 flex items-center justify-center hover:bg-gold/10 text-gold font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status and warnings */}
              <div className="mt-4">
                {totalCapacity < selectedItems.length ? (
                  <div className="flex items-start gap-2 text-[#b12a20] text-[9px] font-sans leading-relaxed font-bold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Selected items exceed custom box capacity ({totalCapacity} slots). Please add more boxes to pack safely.</span>
                  </div>
                ) : selectedItems.length > 0 ? (
                  <div className="flex items-start gap-2 text-gold text-[9px] font-sans leading-relaxed font-bold">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Packaged securely: {selectedItems.length} of {totalCapacity} slots filled ({totalCapacity - selectedItems.length} empty slots).</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-clay-light text-[9px] font-sans leading-relaxed">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Select items from the catalog on the right to start packing.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selected box slots list */}
            {selectedItems.length > 0 && (
              <div className="space-y-6 max-h-[30vh] overflow-y-auto pr-1">
                {boxesWithItems.map((box, boxIdx) => {
                  return (
                    <div key={boxIdx} className="border border-gold-light/20 p-4 bg-sand/30 rounded-none relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-serif text-xs text-clay-dark font-medium">{box.name} Box</span>
                        <span className="font-sans text-[9px] text-clay-light uppercase tracking-wider font-bold">
                          {box.items.length} / {box.capacity} slots
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2.5">
                        {Array.from({ length: box.capacity }).map((_, slotIdx) => {
                          const globalIndex = box.startIndex + slotIdx;
                          const selectedItem = box.items[slotIdx];

                          return (
                            <div 
                              key={slotIdx}
                              className={`aspect-square border rounded-none flex items-center justify-center relative transition-all duration-300 group ${
                                selectedItem 
                                  ? "border-gold bg-ivory shadow-sm" 
                                  : "border-dashed border-gold-light/45 bg-ivory/20"
                              }`}
                            >
                              {selectedItem ? (
                                <>
                                  <div className="relative w-full h-full overflow-hidden">
                                    <Image
                                      src={getProductImage(selectedItem.slug)}
                                      alt={selectedItem.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveItem(globalIndex)}
                                    className="absolute -top-1.5 -right-1.5 bg-clay-dark text-ivory rounded-full p-0.5 hover:bg-gold transition-colors shadow-md border border-gold-light z-20 cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                  <div className="absolute inset-0 bg-clay-dark/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-1 text-center pointer-events-none z-10">
                                    <p className="text-[7px] text-ivory leading-none font-semibold truncate w-full">{selectedItem.name}</p>
                                  </div>
                                </>
                              ) : (
                                <Gift className="w-4 h-4 text-gold-light/30" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Curation breakdown and checkout */}
            <div className="border-t border-gold-light/30 pt-6 mt-2 space-y-4">
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-clay-light font-medium">
                  <span>Keepsake Boxes Packed:</span>
                  <span>{totalBoxes} Box(es)</span>
                </div>
                <div className="flex justify-between text-clay-light font-medium">
                  <span>Selected Curation Items:</span>
                  <span>{selectedItems.length} Item(s)</span>
                </div>
                <div className="h-[1px] bg-gold-light/20 my-2" />
                <div className="flex justify-between text-base text-clay-dark font-serif font-bold">
                  <span>Curation Status:</span>
                  <span className="text-gold uppercase tracking-wider font-sans text-xs font-bold">
                    {selectedItems.length > 0 && selectedItems.length <= totalCapacity ? "Approved for packing" : "Awaiting items"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddToBag}
                  disabled={addingToCart || selectedItems.length === 0 || totalCapacity < selectedItems.length}
                  className="flex-1 bg-clay-dark text-ivory py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-premium"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addingToCart ? "Saving Configuration..." : "Add Curation to Bag"}
                </button>
              </div>

              {selectedItems.length === 0 && (
                <div className="flex items-center gap-2 text-gold text-[10px] font-sans justify-center mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Please select at least 1 item to pack.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Grid of Items (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Category selection row */}
            <div className="flex border-b border-gold-light/25 overflow-x-auto gap-6 whitespace-nowrap">
              {["all", "gourmet", "beverage", "keepsake", "decor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-[9px] uppercase tracking-widest font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === tab 
                      ? "border-gold text-clay-dark" 
                      : "border-transparent text-clay-light hover:text-clay-dark"
                  }`}
                >
                  {tab === "all" ? "All Items" : tab}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {filteredItems.map((item) => {
                const countInBox = selectedItems.filter(i => i.id === item.id).length;
                const image = getProductImage(item.slug);
                
                return (
                  <div 
                    key={item.id}
                    className="bg-ivory border border-gold-light/35 p-5 flex flex-col justify-between shadow-premium transition-all duration-300 hover:border-gold"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden mb-4 border border-gold-light/20">
                        <Image 
                          src={image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                        />
                        {countInBox > 0 && (
                          <div className="absolute top-2 right-2 bg-gold text-clay-dark text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none shadow-sm">
                            {countInBox} selected
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <span className="font-sans text-[8px] uppercase tracking-widest text-gold font-bold">
                          {item.category?.name}
                        </span>
                      </div>

                      <h4 className="font-serif text-base text-clay-dark mb-1">{item.name}</h4>
                      <p className="font-sans text-[11px] text-clay-light leading-relaxed mb-4">
                        {item.shortDescription}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleAddItem(item, e)}
                      className="w-full py-2.5 border border-gold-light/75 text-[9px] uppercase tracking-widest font-bold hover:bg-gold hover:text-[#2e2520] transition-colors cursor-pointer text-center"
                    >
                      Add to Curation
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Sparkling particle animation elements */}
      <AnimatePresence>
        {sparkles.map(s => (
          <motion.div
            key={s.id}
            initial={{ x: s.x, y: s.y, scale: 0, opacity: 1 }}
            animate={{ 
              y: s.y - 120 - Math.random() * 50, 
              x: s.x + (Math.random() * 80 - 40),
              scale: Math.random() * 1.3 + 0.6, 
              opacity: 0,
              rotate: Math.random() * 360 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="fixed pointer-events-none z-[100] text-gold"
          >
            <Sparkles className="w-4 h-4 fill-gold text-gold" style={{ filter: "drop-shadow(0 0 4px #cba052)" }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </main>
  );
}

export default function AddItemsWizard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand text-foreground pt-36 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-gold animate-spin" />
        <p className="font-sans text-[10px] uppercase tracking-widest text-clay-light">Loading customization helper...</p>
      </div>
    }>
      <AddItemsWizardContent />
    </Suspense>
  );
}
