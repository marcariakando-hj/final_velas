import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Clock,
  Heart,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Layers,
  Upload
} from "lucide-react";
import { CandleProduct } from "../types";
import { useStore } from "../context/StoreContext";

interface HeroSectionProps {
  featuredCandles?: CandleProduct[];
  featuredCandle?: CandleProduct;
  onExploreCollection: () => void;
  onOpenCustomizer: () => void;
  onSelectCandle: (candle: CandleProduct) => void;
  onAddToCart?: (candle: CandleProduct) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredCandles = [],
  featuredCandle,
  onExploreCollection,
  onOpenCustomizer,
  onSelectCandle,
  onAddToCart,
}) => {
  // Normalize candidate list of featured candles sorted by order
  const candleList: CandleProduct[] = (
    featuredCandles.length > 0
      ? featuredCandles
      : featuredCandle
      ? [featuredCandle]
      : []
  ).sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));

  const { updateCandle } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedDirectToast, setAddedDirectToast] = useState(false);

  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, candleId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: result, name: "hero_photo" }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              updateCandle(candleId, {
                image: data.url,
                images: [data.url],
              });
              return;
            }
          }
        } catch (err) {
          console.warn("Fallback to local update:", err);
        }
        updateCandle(candleId, {
          image: result,
          images: [result],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Touch swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (candleList.length === 0 && !featuredCandle) {
    return (
      <section id="hero-section" className="relative overflow-hidden bg-[#FDFBF9] py-12 lg:py-16 border-b border-[#E5E0DA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2EDE7] border border-[#E5E0DA] text-[#423D33] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D98B68]" />
            <span>Ayllu • Velas Artesanales & Botánicas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#423D33] font-normal leading-tight">
            Luz, Escultura y Botánica para tu Hogar
          </h1>

          <p className="text-sm sm:text-base text-[#423D33]/70 max-w-2xl mx-auto leading-relaxed">
            Cada creación nace de la fusión entre ceras botánicas de origen vegetal, aromas envolventes y delicadas figuras esculpidas a mano en pequeños lotes de autor.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCustomizer}
              className="px-6 py-3 rounded-full bg-[#423D33] hover:bg-[#2D2824] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>Personalizar una Vela</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D9C5B2]" />
            </button>
            <button
              onClick={onExploreCollection}
              className="px-6 py-3 rounded-full bg-white hover:bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] text-xs uppercase tracking-widest font-semibold transition-all shadow-xs cursor-pointer"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </section>
    );
  }

  const hasMultiple = candleList.length > 1;
  const currentCandle = candleList[currentIndex] || featuredCandle!;

  // Auto-play effect (6.5 seconds)
  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candleList.length);
      setActiveHotspot(null);
      setHoveredHotspot(null);
    }, 6500);

    return () => clearInterval(interval);
  }, [hasMultiple, isPaused, candleList.length]);

  const handlePrev = () => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev === 0 ? candleList.length - 1 : prev - 1));
    setActiveHotspot(null);
    setHoveredHotspot(null);
  };

  const handleNext = () => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev + 1) % candleList.length);
    setActiveHotspot(null);
    setHoveredHotspot(null);
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Direct checkout / add to cart
  const handleDirectAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(currentCandle);
      setAddedDirectToast(true);
      setTimeout(() => setAddedDirectToast(false), 2500);
    } else {
      onSelectCandle(currentCandle);
    }
  };

  // Dynamic Hotspot definitions tailored for sculpted candles and packaging
  const hotspots = [
    {
      id: 0,
      title: currentCandle.wickType || "Mecha de Algodón Puro",
      detail: "Mecha ecológica 100% libre de plomo para una combustión serena, uniforme y sin emisiones nocivas.",
      coords: "top-[24%] left-[28%]",
    },
    {
      id: 1,
      title: "Escultura en Cera Botánica",
      detail: "Figura 3D modelada artesanalmente a mano con curado en frío para mantener los relieves y el aroma.",
      coords: "top-[44%] left-[28%]",
    },
    {
      id: 2,
      title:
        currentCandle.waxType === "Parafina"
          ? "Cera de Parafina & Vaso de Cristal"
          : "Cera de Soja Pura & Vaso Artesanal",
      detail:
        currentCandle.waxType === "Parafina"
          ? `Parafina refinada de alta definición en vaso de cristal fino para hasta ${currentCandle.burnHours || 60} horas de luz.`
          : `100% Cera de soja vegetal en vaso de vidrio artesanal reutilizable con ${currentCandle.burnHours || 60} horas de duración.`,
      coords: "top-[72%] left-[30%]",
    },
    {
      id: 3,
      title: "Empaque Artesanal en Caja Kraft",
      detail: "Caja kraft serigrafiada con ventana troquelada festoneada y etiqueta botánica oficial de la colección Ayllu.",
      coords: "top-[50%] left-[74%]",
    },
  ];

  const currentHotspotIndex = hoveredHotspot !== null ? hoveredHotspot : activeHotspot;
  const isSoy = currentCandle.waxType !== "Parafina";

  return (
    <section id="hero-section" className="relative overflow-hidden bg-[#FDFBF9] py-8 lg:py-12 border-b border-[#E5E0DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Main Bento Grid Container */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* BENTO TILE 1: Master Photography Showcase & Hotspot Explorer */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="col-span-12 lg:col-span-7 bg-[#F2EDE7] rounded-3xl relative overflow-hidden border border-[#E5E0DA] flex flex-col justify-between p-5 sm:p-7 min-h-[540px] lg:min-h-[600px] shadow-xs transition-all"
          >
            {/* Background Dot Pattern */}
            <div className="absolute inset-0 bento-dot-pattern opacity-40 pointer-events-none" />

            {/* Top Bar inside Showcase */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E5E0DA] text-[#423D33] text-[10px] uppercase font-bold tracking-widest shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#D98B68]" />
                  <span>
                    {hasMultiple
                      ? `Destacado ${currentIndex + 1} de ${candleList.length} • Pieza de Autor`
                      : "Edición Limitada • Pieza de Autor"}
                  </span>
                </div>

                {/* Limited Batch Micro-tag */}
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D98B68]/15 border border-[#D98B68]/30 text-[#D98B68] text-[10px] font-bold">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{currentCandle.limitedBatchText || "Tanda Limitada de 50 uds"}</span>
                </div>
              </div>

              {/* Toggle Buttons: Clean View and Optical Zoom */}
              <div className="flex items-center gap-1.5">
                <button
                  id="toggle-clean-image-btn"
                  onClick={() => {
                    setShowHotspots(!showHotspots);
                    setActiveHotspot(null);
                    setHoveredHotspot(null);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-xs border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                    !showHotspots
                      ? "bg-[#4A4541] text-white border-[#4A4541]"
                      : "bg-white/85 hover:bg-white text-[#423D33] border-[#E5E0DA]"
                  }`}
                  title={showHotspots ? "Ocultar marcas para ver la foto limpia" : "Mostrar marcas de detalle"}
                >
                  {!showHotspots ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#D9C5B2]" />
                      <span>Imagen Limpia</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
                      <span>Ver Imagen Limpia</span>
                    </>
                  )}
                </button>

                <button
                  id="hero-zoom-btn"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="bg-white/85 hover:bg-white text-[#423D33] px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-xs border border-[#E5E0DA] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Ampliar detalle de textura"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span className="hidden sm:inline">{isZoomed ? "Vista Normal" : "Zoom 85mm"}</span>
                </button>
              </div>
            </div>

            {/* Photography Center Stage with Interactive Pulsing Hotspots */}
            <div className="relative z-10 my-4 flex-1 flex flex-col items-center justify-center w-full">
              <div className="relative rounded-2xl overflow-hidden aspect-square max-w-md w-full bg-[#F2EDE7] border border-[#D9C5B2] shadow-md group flex items-center justify-center p-2 sm:p-3">
                {Boolean(currentCandle.image && currentCandle.image.trim()) ? (
                  <img
                    key={currentCandle.id}
                    src={currentCandle.image}
                    alt={`Vela artesanal destacada ${currentCandle.name}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-auto max-h-full max-w-full object-contain object-center transition-all duration-700 ${
                      isZoomed ? "scale-125 cursor-zoom-out" : "hover:scale-105 cursor-zoom-in"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B] text-xs p-6 text-center">
                    <span className="font-serif font-bold text-base text-[#423D33] mb-1">{currentCandle.name}</span>
                    <span>Sin imagen disponible</span>
                  </div>
                )}

                {/* Direct Upload Photo Button */}
                <label
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#423D33] px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#E5E0DA] shadow-xs cursor-pointer flex items-center gap-1.5 z-30 transition-all opacity-85 group-hover:opacity-100"
                  title="Subir archivo de imagen de tu dispositivo"
                >
                  <Upload className="w-3 h-3 text-[#D98B68]" />
                  <span>Subir Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHeroPhotoUpload(e, currentCandle.id)}
                    className="hidden"
                  />
                </label>

                {/* Hotspot buttons with Pulsing Rings (Rendered only if showHotspots is true) */}
                {showHotspots &&
                  hotspots.map((spot) => {
                    const isSpotActive = currentHotspotIndex === spot.id;
                    return (
                      <div
                        key={spot.id}
                        className={`absolute ${spot.coords} -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20`}
                      >
                        {/* Subtle Pulsing Ring when idle */}
                        {!isSpotActive && (
                          <span className="absolute -inset-1 rounded-full bg-white/60 animate-ping opacity-75" />
                        )}

                        <button
                          onMouseEnter={() => setHoveredHotspot(spot.id)}
                          onMouseLeave={() => setHoveredHotspot(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHotspot(activeHotspot === spot.id ? null : spot.id);
                          }}
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            isSpotActive
                              ? "bg-[#8C7A6B] text-white ring-4 ring-white/90 scale-120 shadow-xl opacity-100 z-30"
                              : "bg-white/90 text-[#423D33] ring-2 ring-black/10 backdrop-blur-xs opacity-90 hover:opacity-100 hover:scale-115 shadow-sm"
                          }`}
                          title={spot.title}
                          aria-label={`Detalle: ${spot.title}`}
                        >
                          <span className="text-[11px] font-bold">{spot.id + 1}</span>
                        </button>
                      </div>
                    );
                  })}

                {/* Active Hotspot Floating Caption Card */}
                {showHotspots && currentHotspotIndex !== null && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md text-white p-3.5 rounded-xl border border-white/20 shadow-xl animate-fade-in z-30 pointer-events-auto">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C5B2] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#8C7A6B] text-white text-[9px] inline-flex items-center justify-center font-bold">
                          {currentHotspotIndex + 1}
                        </span>
                        <span>{hotspots[currentHotspotIndex].title}</span>
                      </p>
                      <button
                        onClick={() => {
                          setActiveHotspot(null);
                          setHoveredHotspot(null);
                        }}
                        className="text-stone-400 hover:text-white text-xs px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                      {hotspots[currentHotspotIndex].detail}
                    </p>
                  </div>
                )}

                {/* Carousel Navigation Arrow Controls (if 2+ products) */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#423D33] flex items-center justify-center backdrop-blur-xs border border-[#E5E0DA] shadow-md transition-all cursor-pointer z-20 hover:scale-110"
                      title="Vela destacada anterior"
                      aria-label="Vela anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#423D33] flex items-center justify-center backdrop-blur-xs border border-[#E5E0DA] shadow-md transition-all cursor-pointer z-20 hover:scale-110"
                      title="Siguiente vela destacada"
                      aria-label="Siguiente vela"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Hotspot pills selector */}
              {showHotspots ? (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {hotspots.map((spot) => (
                    <button
                      key={spot.id}
                      onMouseEnter={() => setHoveredHotspot(spot.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider transition-all cursor-pointer border ${
                        currentHotspotIndex === spot.id
                          ? "bg-[#4A4541] text-white border-[#4A4541] font-bold shadow-xs"
                          : "bg-white/80 text-[#423D33]/80 border-[#E5E0DA] hover:bg-white hover:text-black"
                      }`}
                    >
                      {spot.id + 1}. {spot.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-[#8C7A6B] italic">
                    Modo imagen limpia activo • Pasa el cursor o activa marcas para inspeccionar detalles
                  </span>
                </div>
              )}

              {/* Carousel Pagination & Preview Thumbnails */}
              {hasMultiple && (
                <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#E5E0DA]/50">
                  {candleList.map((candle, idx) => (
                    <button
                      key={candle.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setActiveHotspot(null);
                      }}
                      className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] transition-all cursor-pointer border ${
                        currentIndex === idx
                          ? "bg-[#8C7A6B] text-white border-[#8C7A6B] font-bold shadow-xs"
                          : "bg-white/70 text-[#423D33]/70 border-[#E5E0DA] hover:bg-white"
                      }`}
                      title={candle.name}
                    >
                      <span>{candle.code || `Nº 0${idx + 1}`}</span>
                      <span className="hidden sm:inline opacity-80 truncate max-w-[90px]">
                        {candle.name.split("•")[1] || candle.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Info Bar inside Showcase */}
            <div className="relative z-10 pt-2 border-t border-[#E5E0DA]/80 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-[#423D33] font-normal leading-tight">
                  {currentCandle.name}
                </h1>
                <p className="text-xs text-[#423D33]/70 max-w-sm mt-0.5">
                  {currentCandle.subtitle} • {currentCandle.vesselName || "Vaso de Vidrio Artesanal"}
                </p>
              </div>

              <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-2xl sm:text-3xl font-serif font-light text-[#423D33]">
                  ${Number(currentCandle.price).toFixed(2)} USD
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#608058] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#608058]" />
                  <span>{currentCandle.inStock ? "Disponible en Taller" : "Edición Agotada"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT BENTO COLUMN: Multi-Card Grid */}
          <div className="col-span-12 lg:col-span-5 grid grid-cols-12 gap-4 lg:gap-6">
            {/* BENTO TILE 2: Olfactory Profile Master Card */}
            <div className="col-span-12 bg-[#8C7A6B] text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full font-semibold">
                  {currentCandle.category || "Eco-Lujo Botánico"}
                </span>
                <span className="text-xs text-white/80 tracking-wider">
                  Esculpido Artesanal
                </span>
              </div>

              <div className="space-y-2 my-1">
                <h2 className="text-xl sm:text-2xl font-serif font-normal">
                  Pirámide Aromática
                </h2>
                <p className="text-xs text-white/90 leading-relaxed italic line-clamp-3">
                  "{currentCandle.tagline || currentCandle.description}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-xs mt-2">
                <div>
                  <span className="block text-[9px] text-white/70 uppercase tracking-wider font-semibold">Salida</span>
                  <span className="font-medium text-white text-[11px] block truncate">
                    {currentCandle.olfactoryPyramid?.salida || "Cítricos & Mandarina"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-white/70 uppercase tracking-wider font-semibold">Corazón</span>
                  <span className="font-medium text-white text-[11px] block truncate">
                    {currentCandle.olfactoryPyramid?.corazon || "Flores Silvestres"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-white/70 uppercase tracking-wider font-semibold">Fondo</span>
                  <span className="font-medium text-white text-[11px] block truncate">
                    {currentCandle.olfactoryPyramid?.fondo || "Vainilla & Cedro"}
                  </span>
                </div>
              </div>
            </div>

            {/* BENTO TILE 3: Eco Credentials - DYNAMIC MATERAL ADAPTATION */}
            <div className="col-span-5 bg-white border border-[#E5E0DA] rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs">
              <div className="w-10 h-10 border border-[#D9C5B2] rounded-full flex items-center justify-center bg-[#FDFBF9] text-[#8C7A6B]">
                {isSoy ? <Leaf className="w-4 h-4 text-[#608058]" /> : <Flame className="w-4 h-4 text-[#D98B68]" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#423D33]">
                {isSoy ? "100% Vegano" : "Alta Difusión"}
              </span>
              <span className="text-[9px] text-[#423D33]/60 leading-tight">
                {isSoy ? "Cera de Soja Pura" : "Parafina Refinada"}
              </span>
            </div>

            {/* BENTO TILE 4: Clean Burn Hours (Col 7) */}
            <div className="col-span-7 bg-[#EAE4DD] border border-[#E5E0DA] rounded-3xl p-5 sm:p-6 flex flex-col justify-center shadow-2xs">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-3xl sm:text-4xl font-serif text-[#423D33]">
                  {currentCandle.burnHours || 60}
                </span>
                <span className="text-xs text-[#423D33]/70 uppercase tracking-widest font-semibold">Horas</span>
              </div>
              <p className="text-[11px] text-[#423D33]/75 leading-tight">
                {isSoy
                  ? "Quemado limpio y lento sin toxinas."
                  : "Difusión aromática potente y prolongada."}
              </p>
              <div className="mt-2.5 h-1.5 bg-[#D9C5B2] w-full rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-[#8C7A6B] rounded-full"></div>
              </div>
            </div>

            {/* BENTO TILE 5: Direct Checkout & Action Controls (Col 12) */}
            <div className="col-span-12 bg-white border border-[#E5E0DA] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1 max-w-xs">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-semibold text-[#423D33]">
                    {currentCandle.vesselName || "Vaso de Vidrio Artesanal"}
                  </p>
                </div>
                <p className="text-[11px] text-[#423D33]/65 leading-snug">
                  Diseño escultural 3D pensado para iluminar y transformar cualquier rincón de tu hogar.
                </p>
              </div>

              {/* High-Conversion Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* DIRECT ADD TO CART / COMPRAR AHORA */}
                <button
                  id="hero-buy-now-btn"
                  onClick={handleDirectAddToCart}
                  className="flex-1 sm:flex-initial bg-[#8C7A6B] hover:bg-[#79695C] text-white px-4 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs hover:scale-105"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>{addedDirectToast ? "¡Añadida!" : "Añadir a Cesta"}</span>
                </button>

                {/* VER FICHA DETALLADA */}
                <button
                  id="hero-view-product-btn"
                  onClick={() => onSelectCandle(currentCandle)}
                  className="flex-1 sm:flex-initial bg-[#4A4541] hover:bg-[#35312E] text-white px-4 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Descubrir</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D98B68]" />
                </button>

                {/* PERSONALIZAR */}
                <button
                  id="hero-personalizar-btn"
                  onClick={onOpenCustomizer}
                  className="bg-[#F2EDE7] hover:bg-[#EAE4DD] text-[#423D33] px-3.5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-semibold border border-[#E5E0DA] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  title="Diseñar vela a medida"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D98B68]" />
                  <span className="hidden sm:inline">Personalizar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
