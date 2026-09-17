import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ProductCard } from "./components/ProductCard";
import { ProductModal } from "./components/ProductModal";
import { AboutUsSection } from "./components/AboutUsSection";
import { CollaboratorsSection } from "./components/CollaboratorsSection";
import { CandleCustomizer } from "./components/CandleCustomizer";
import { CandleCareGuide } from "./components/CandleCareGuide";
import { CartDrawer } from "./components/CartDrawer";
import { WhatsAppAssistant } from "./components/WhatsAppAssistant";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { ReviewsSection } from "./components/ReviewsSection";
import { Footer } from "./components/Footer";
import { CandleProduct, CartItem, WaxType } from "./types";
import { Star, CheckCircle, Search, Sparkles, Filter, Leaf } from "lucide-react";

function StorefrontApp() {
  const { candles, brandConfig } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedWaxFilter, setSelectedWaxFilter] = useState<string>("Todas");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedCandle, setSelectedCandle] = useState<CandleProduct | null>(null);
  const [customizerCandle, setCustomizerCandle] = useState<CandleProduct | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add to cart handler
  const handleAddToCart = (
    candle: CandleProduct,
    quantity: number = 1,
    customEngraving?: string,
    giftWrap?: boolean,
    selectedWaxType?: WaxType,
    customDetails?: CartItem["customDetails"]
  ) => {
    const effectiveWaxType = selectedWaxType || candle.waxType || "Soja";
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.candle.id === candle.id &&
          item.customEngraving === customEngraving &&
          item.giftWrap === giftWrap &&
          item.selectedWaxType === effectiveWaxType
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            candle,
            quantity,
            selectedWaxType: effectiveWaxType,
            customEngraving,
            giftWrap,
            customDetails:
              customDetails ||
              (candle.category === "Personalizada"
                ? {
                    waxType: effectiveWaxType,
                    vesselName: candle.vesselName,
                    waxColorName: candle.waxColorName,
                    waxColorHex: candle.waxColorHex,
                    wickName: candle.wickType,
                    botanicalsList: candle.botanicals,
                    labelTitle: candle.customLabelTitle,
                    labelSubtitle: candle.customLabelSubtitle,
                  }
                : undefined),
          },
        ];
      }
    });

    showToast(`"${candle.name}" (${effectiveWaxType}) añadida a tu cesta`);
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast("Artículo eliminado de la cesta");
  };

  // Navigation scroll helper & view activator
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem =
      document.getElementById(`${sectionId}-section`) ||
      document.getElementById(sectionId) ||
      document.getElementById("atelier-wizard");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenCustomizer = (candle?: CandleProduct) => {
    if (candle) {
      setCustomizerCandle(candle);
    }
    handleNavigate("personalizar");
  };

  // Scroll spy to sync active navbar tab with scroll position
  React.useEffect(() => {
    const sectionIds = [
      "hero",
      "coleccion",
      "nosotros",
      "colaboradores",
      "personalizar",
      "comentarios",
      "cuidado",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const elem =
          document.getElementById(`${id}-section`) ||
          (id === "hero" ? document.getElementById("hero-section") : null);
        if (elem) {
          const top = elem.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter candles
  const filteredCandles = candles.filter((candle) => {
    const matchesCategory =
      selectedCategory === "Todos" || candle.category === selectedCategory;
    const matchesWax =
      selectedWaxFilter === "Todas" ||
      (selectedWaxFilter === "Soja" && (candle.waxType === "Soja" || !candle.waxType)) ||
      (selectedWaxFilter === "Parafina" && candle.waxType === "Parafina");
    const matchesSearch =
      searchQuery.trim() === "" ||
      candle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candle.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candle.botanicals.some((b) =>
        b.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (candle.waxType && candle.waxType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesWax && matchesSearch;
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Extract unique categories from actual store candles
  const dynamicCategories = [
    "Todos",
    ...Array.from(new Set(candles.map((c) => c.category).filter(Boolean))),
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#423D33] font-sans antialiased selection:bg-[#8C7A6B] selection:text-white">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-20 left-6 z-50 bg-[#4A4541] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E5E0DA]/30 flex items-center gap-2 text-xs font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#D9C5B2]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
      />

      {/* Main Hero with Photography, Hotspots & Dynamic Carousel */}
      <HeroSection
        featuredCandles={candles.filter((c) => c.featured).length > 0 ? candles.filter((c) => c.featured) : candles.slice(0, 3)}
        featuredCandle={candles[0]}
        onExploreCollection={() => handleNavigate("coleccion")}
        onOpenCustomizer={() => handleNavigate("personalizar")}
        onSelectCandle={(c) => setSelectedCandle(c)}
        onAddToCart={(c) => {
          handleAddToCart(c);
        }}
      />

      {/* Collection Showcase Section */}
      <section
        id="coleccion-section"
        className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Section Heading & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E0DA]">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
              Catálogo Artesanal • {brandConfig.brandName}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#423D33] font-normal">
              Colección Botánica • Ceras de Soja & Parafina
            </h2>
            <p className="text-xs text-[#423D33]/70 max-w-xl">
              Cada vela es vertida a mano en pequeños lotes con ceras exclusivas de Soja 100% vegetal o Parafina de alta pureza, mechas de madera silvestre y vasijas de cerámica mate.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por aroma, botánico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 rounded-full border border-[#E5E0DA] bg-white text-[#423D33] placeholder-[#8C7A6B]/70 focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] w-full sm:w-48"
              />
            </div>

            {/* Wax Type Pills */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-full border border-[#E5E0DA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] px-2 flex items-center gap-1">
                <Leaf className="w-3 h-3 text-[#608058]" /> Cera:
              </span>
              {[
                { key: "Todas", label: "Todas" },
                { key: "Soja", label: "Soja" },
                { key: "Parafina", label: "Parafina" },
              ].map((w) => (
                <button
                  key={w.key}
                  onClick={() => setSelectedWaxFilter(w.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedWaxFilter === w.key
                      ? "bg-[#8C7A6B] text-white shadow-xs"
                      : "text-[#423D33]/70 hover:text-[#423D33]"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#F2EDE7] rounded-full border border-[#E5E0DA]">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#4A4541] text-white shadow-xs"
                      : "text-[#423D33]/70 hover:text-[#423D33]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredCandles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E0DA] p-8 space-y-4 max-w-2xl mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E5E0DA] flex items-center justify-center mx-auto text-[#8C7A6B]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-[#423D33]">Catálogo sin productos activos</h3>
            <p className="text-xs text-[#423D33]/70">
              No hay productos visibles en este momento. Puedes crear y añadir nuevas piezas desde el Panel de Administración o diseñar una vela personalizada en nuestro estudio interactivo.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleNavigate("personalizar")}
                className="px-5 py-2 rounded-full bg-[#423D33] text-white text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#2D2824] cursor-pointer"
              >
                Personalizar Vela
              </button>
              <button
                onClick={() => setIsAdminOpen(true)}
                className="px-5 py-2 rounded-full bg-[#FAF7F2] border border-[#E5E0DA] text-[#423D33] text-xs font-semibold uppercase tracking-wider transition-all hover:bg-white cursor-pointer"
              >
                Administración
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCandles.map((candle) => (
              <ProductCard
                key={candle.id}
                candle={candle}
                onSelect={(c) => setSelectedCandle(c)}
                onAddToCart={(c) => handleAddToCart(c, 1)}
                onCustomize={(c) => handleOpenCustomizer(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* "Nosotros" Philosophy & Brand Manifesto Section */}
      <AboutUsSection
        onNavigateToCollection={() => handleNavigate("coleccion")}
        onNavigateToCollaborators={() => handleNavigate("colaboradores")}
      />

      {/* Collaborators & Artisans Showcase Section */}
      <CollaboratorsSection
        onSelectCandleById={(candleId) => {
          const found = candles.find((c) => c.id === candleId);
          if (found) {
            setSelectedCandle(found);
          }
        }}
      />

      {/* Candle Customization Studio */}
      <CandleCustomizer
        initialCandle={customizerCandle || undefined}
        onAddCustomCandleToCart={(customCandle) => {
          handleAddToCart(
            customCandle,
            1,
            undefined,
            false,
            customCandle.waxType || "Soja",
            {
              waxType: customCandle.waxType || "Soja",
              vesselName: customCandle.vesselName,
              waxColorName: customCandle.waxColorName,
              waxColorHex: customCandle.waxColorHex,
              wickName: customCandle.wickType,
              botanicalsList: customCandle.botanicals,
              labelTitle: customCandle.customLabelTitle,
              labelSubtitle: customCandle.customLabelSubtitle,
            }
          );
          setIsCartOpen(true);
        }}
      />

      {/* Verified Reviews & Community Experiences Section */}
      <ReviewsSection
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Masterclass Candle Care Guide */}
      <CandleCareGuide />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Product Detail Modal */}
      <ProductModal
        candle={selectedCandle}
        onClose={() => setSelectedCandle(null)}
        onCustomize={(c) => handleOpenCustomizer(c)}
        onAddToCart={(candle, qty, eng, gift) =>
          handleAddToCart(candle, qty, eng, gift)
        }
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      {/* Auth / Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
      />

      {/* Admin Panel Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Floating Grounded WhatsApp Assistant */}
      <WhatsAppAssistant />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StorefrontApp />
    </StoreProvider>
  );
}
