import React, { useState } from "react";
import {
  X,
  Flame,
  Clock,
  Star,
  ShieldCheck,
  Heart,
  Sparkles,
  Check,
  Gift,
  PenLine,
  Palette,
  MapPin,
  Leaf,
  Layers,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Package,
  Info,
  Upload,
  Volume2,
  VolumeX,
  RotateCcw
} from "lucide-react";
import { CandleProduct, WaxType } from "../types";
import { useStore } from "../context/StoreContext";
import { InteractiveVisualizer2D } from "./InteractiveVisualizer2D";
import { WAX_COLORS, WICKS, BOTANICALS, LABEL_STYLES, BotanicalOption, WickOption, WaxColorOption, LabelStyleOption } from "./CandleCustomizer";

interface ProductModalProps {
  candle: CandleProduct | null;
  onClose: () => void;
  onCustomize?: (candle: CandleProduct) => void;
  onAddToCart: (
    candle: CandleProduct,
    quantity: number,
    customEngraving?: string,
    giftWrap?: boolean,
    selectedWaxType?: WaxType,
    customDetails?: {
      waxType: WaxType;
      waxColorName?: string;
      waxColorHex?: string;
      selectedImageIndex?: number;
      wickName?: string;
      wickPriceAddon?: number;
      botanicalsList?: string[];
      labelTitle?: string;
      labelSubtitle?: string;
      labelStyle?: string;
    }
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  candle,
  onClose,
  onAddToCart,
  onCustomize,
}) => {
  const { collaborators, updateCandle } = useStore();

  // View Mode: 'photo' (Gallery photography) or 'visualizer2d' (2D interactive color visualizer)
  const [viewMode, setViewMode] = useState<"photo" | "visualizer2d">("photo");
  const [visualizerAngle, setVisualizerAngle] = useState<"top" | "front">("top");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedWaxColor, setSelectedWaxColor] = useState<WaxColorOption>(WAX_COLORS[0]);
  const [selectedWick, setSelectedWick] = useState<WickOption>(WICKS[0]);
  const [selectedBotanicals, setSelectedBotanicals] = useState<BotanicalOption[]>([
    BOTANICALS[0],
    BOTANICALS[1],
    BOTANICALS[2],
  ]);
  const [customLabelTitle, setCustomLabelTitle] = useState<string>(candle?.name || "Nº 03 • Santuario de Lavanda");
  const [customLabelSubtitle, setCustomLabelSubtitle] = useState<string>(candle?.subtitle || "Vertida a mano con cera de soja virgen");
  const [selectedLabelStyle, setSelectedLabelStyle] = useState<LabelStyleOption>(LABEL_STYLES[0]);
  const [isLit2D, setIsLit2D] = useState<boolean>(true);

  // Configuration States
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWax, setSelectedWax] = useState<WaxType>(candle?.waxType || "Soja");
  const [enableEngraving, setEnableEngraving] = useState<boolean>(false);
  const [customEngraving, setCustomEngraving] = useState<string>("");
  const [giftWrap, setGiftWrap] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"olfato" | "ingredientes" | "ritual" | "artesano">("olfato");
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!candle) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            body: JSON.stringify({ image: result, name: candle.name }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              updateCandle(candle.id, {
                image: data.url,
                images: [data.url, ...(candle.images || [])],
              });
              return;
            }
          }
        } catch (err) {
          console.warn("Fallback to direct update:", err);
        }
        updateCandle(candle.id, {
          image: result,
          images: [result, ...(candle.images || [])],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Gallery images array
  const galleryImages = candle.images && candle.images.length > 0 ? candle.images : [candle.image];

  // Matched Collaborator lookup
  const matchedArtist = collaborators.find(
    (c) =>
      c.id === candle.collaboratorId ||
      c.name.toLowerCase() === candle.collaboratorName?.toLowerCase() ||
      c.associatedCandleId === candle.id ||
      c.associatedCandleName?.toLowerCase() === candle.name.toLowerCase()
  );

  // Dynamic Pricing Calculation
  const basePrice = candle.price || 18.0;
  const wickPrice = selectedWick.priceAddon;
  const botanicalsAddon = selectedBotanicals.reduce((sum, b) => sum + b.priceAddon, 0);
  const engravingPrice = enableEngraving ? 3.5 : 0;
  const giftWrapPrice = giftWrap ? 3.5 : 0;
  const unitPrice = basePrice + wickPrice + botanicalsAddon + engravingPrice + giftWrapPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(
      candle,
      quantity,
      enableEngraving ? customEngraving.trim() : undefined,
      giftWrap,
      selectedWax,
      {
        waxType: selectedWax,
        waxColorName: selectedWaxColor.name,
        waxColorHex: selectedWaxColor.hex,
        selectedImageIndex: activeImageIndex,
        wickName: selectedWick.name,
        wickPriceAddon: selectedWick.priceAddon,
        botanicalsList: selectedBotanicals.map((b) => b.name),
        labelTitle: customLabelTitle,
        labelSubtitle: customLabelSubtitle,
        labelStyle: selectedLabelStyle.name,
      }
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2824]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        id="product-detail-modal"
        className="relative bg-[#FDFBF9] w-full max-w-5xl rounded-3xl border border-[#E5E0DA] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[94vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#423D33] border border-[#E5E0DA] flex items-center justify-center shadow-xs cursor-pointer transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT SIDE: MULTI-IMAGE GALLERY & 2D VISUALIZER */}
        <div className="w-full md:w-1/2 bg-[#F2EDE7] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E0DA] overflow-y-auto">
          {/* Main Visual Header with View Mode Switcher */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold bg-[#423D33] text-white px-2 py-0.5 rounded-full">
                {candle.code || "Nº 01"}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B]">
                {candle.category}
              </span>
            </div>

            {/* View Mode Toggle: Photo vs 2D Visualizer */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#E5E0DA] shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("photo")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === "photo"
                    ? "bg-[#4A4541] text-white shadow-xs"
                    : "text-[#423D33]/70 hover:text-[#423D33]"
                }`}
              >
                <span>Foto Real</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("visualizer2d")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === "visualizer2d"
                    ? "bg-[#4A4541] text-white shadow-xs"
                    : "text-[#423D33]/70 hover:text-[#423D33]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#D98B68]" />
                <span>Visualizador 2D</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Photo Display vs 2D Visualizer Display */}
          <div className="relative flex-1 flex items-center justify-center my-2 min-h-[320px]">
            {viewMode === "photo" ? (
              <div className="relative w-full aspect-square max-h-[500px] rounded-2xl overflow-hidden bg-[#F2EDE7] border border-[#E5E0DA] shadow-inner group flex items-center justify-center p-2 sm:p-3">
                {Boolean((galleryImages[activeImageIndex] || candle.image) && (galleryImages[activeImageIndex] || candle.image).trim()) && (
                  <img
                    src={galleryImages[activeImageIndex] || candle.image}
                    alt={`${candle.name} - Vista ${activeImageIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-102"
                  />
                )}

                {/* Exclusive Photorealistic Wax Bed SVG Mask Tinting on Glass Vessel Base (Untouched sculpture, background box & wood) */}
                {selectedWaxColor.id !== "caliza-blanca" && activeImageIndex === 0 && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  >
                    <defs>
                      <filter id="productModalWaxSoftFeather" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="0.45" />
                      </filter>
                    </defs>
                    <path
                      d="M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z"
                      fill={selectedWaxColor.hex}
                      style={{
                        mixBlendMode: "multiply",
                        opacity: selectedWaxColor.id === "carbon" ? 0.78 : 0.72,
                      }}
                      filter="url(#productModalWaxSoftFeather)"
                    />
                  </svg>
                )}

                {/* Upload / Replace Photo Button */}
                <label
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#423D33] px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#E5E0DA] shadow-xs cursor-pointer flex items-center gap-1.5 z-20 transition-all opacity-85 group-hover:opacity-100"
                  title="Subir o cambiar la foto de este producto"
                >
                  <Upload className="w-3 h-3 text-[#D98B68]" />
                  <span>Subir Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Arrow navigation if multiple images */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? galleryImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#423D33] border border-[#E5E0DA] flex items-center justify-center shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === galleryImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#423D33] border border-[#E5E0DA] flex items-center justify-center shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Photo Caption Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] flex items-center justify-between">
                  <span className="font-light truncate">
                    {activeImageIndex === 0 && "Fotografía oficial: Vaso de cristal y cera esculpida"}
                    {activeImageIndex === 1 && "Ángulo de iluminación y textura esculpida en cera"}
                    {activeImageIndex === 2 && "Presentación en caja kraft con ventana troquelada"}
                    {activeImageIndex >= 3 && "Detalles de acabado y grabado botánico"}
                  </span>
                  {galleryImages.length > 1 && (
                    <span className="font-mono text-[9px] opacity-80 shrink-0 ml-2">
                      {activeImageIndex + 1} / {galleryImages.length}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              // 2D INTERACTIVE VECTOR VISUALIZER
              <div className="w-full flex flex-col items-center">
                <InteractiveVisualizer2D
                  selectedProduct={candle}
                  waxColor={selectedWaxColor}
                  wick={selectedWick}
                  botanicals={selectedBotanicals}
                  labelTitle={customLabelTitle}
                  labelSubtitle={customLabelSubtitle}
                  labelStyle={selectedLabelStyle}
                  onLabelTitleChange={setCustomLabelTitle}
                  onLabelSubtitleChange={setCustomLabelSubtitle}
                  onLabelStyleChange={setSelectedLabelStyle}
                  isLit={isLit2D}
                  onToggleLit={() => setIsLit2D((prev) => !prev)}
                  viewMode={visualizerAngle}
                  onViewModeChange={setVisualizerAngle}
                  templateType={candle.sculptureType || "santuario"}
                  candleImage={candle.base2DImage || candle.image}
                  base2DImage={candle.base2DImage || candle.image}
                  waxMaskPolygon={candle.waxMaskPolygon || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z"}
                  wickX={candle.wickX ?? candle.customizer2DConfig?.wickX ?? 31}
                  wickY={candle.wickY ?? candle.customizer2DConfig?.wickY ?? 59}
                  botanicalsX={candle.botanicalsX ?? candle.customizer2DConfig?.botanicalsX ?? 31}
                  botanicalsY={candle.botanicalsY ?? candle.customizer2DConfig?.botanicalsY ?? 67}
                  botanicalsRadius={candle.botanicalsRadius ?? candle.customizer2DConfig?.botanicalsRadius ?? 11}
                  showControls={true}
                />
              </div>
            )}
          </div>

          {/* Thumbnails Navigation Strip (if photo mode and multiple photos) */}
          {viewMode === "photo" && galleryImages.length > 1 && (
            <div className="mt-3 pt-3 border-t border-[#E5E0DA] flex items-center gap-2 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[#423D33] ring-2 ring-[#423D33]/30 scale-105"
                      : "border-[#E5E0DA] opacity-70 hover:opacity-100"
                  }`}
                >
                  {Boolean(imgUrl && imgUrl.trim()) && (
                    <img
                      src={imgUrl}
                      alt={`Miniatura ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: PRODUCT DETAILS, PRICING & OPTIONS */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 overflow-y-auto space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Title and Rating */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                    {candle.vesselName}
                  </span>
                  <span className="text-[#E5E0DA]">•</span>
                  <span className="text-[10px] text-[#608058] font-bold uppercase tracking-wider">
                    {candle.inStock ? "Disponible" : "Agotada"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#8C7A6B]">
                  <Star className="w-3.5 h-3.5 fill-[#8C7A6B] text-[#8C7A6B]" />
                  <span className="font-bold text-[#423D33]">{candle.rating}</span>
                  <span className="text-[11px] text-[#423D33]/60">({candle.reviewsCount} reseñas)</span>
                </div>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#423D33]">
                {candle.name}
              </h2>
              <p className="text-xs text-[#8C7A6B] font-medium mt-1">
                Aroma: <span className="text-[#423D33] font-semibold">{candle.subtitle}</span>
              </p>
            </div>

            {/* Collaborator Badge */}
            {matchedArtist && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA]">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-2xs shrink-0 flex items-center justify-center bg-[#F2EDE7]">
                  {Boolean(matchedArtist.image && matchedArtist.image.trim()) ? (
                    <img
                      src={matchedArtist.image}
                      alt={matchedArtist.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-serif font-bold text-sm text-[#423D33]">
                      {matchedArtist.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-[#D98B68]" />
                    <span className="text-[9px] uppercase font-bold text-[#8C7A6B] tracking-wider">
                      Diseño Esculpido por Colaborador
                    </span>
                  </div>
                  <p className="text-xs font-serif font-bold text-[#423D33] truncate">
                    {matchedArtist.name} • {matchedArtist.location}
                  </p>
                  <p className="text-[10px] text-[#423D33]/70 truncate">
                    {matchedArtist.technique || matchedArtist.discipline}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Specs Bento Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F2EDE7] text-center border border-[#E5E0DA] text-xs">
              <div>
                <span className="block text-[9px] uppercase text-[#8C7A6B] font-bold tracking-wider">
                  Contenido
                </span>
                <span className="font-semibold text-[#423D33]">{candle.weightGrams} g</span>
              </div>
              <div className="border-x border-[#E5E0DA]">
                <span className="block text-[9px] uppercase text-[#8C7A6B] font-bold tracking-wider">
                  Duración
                </span>
                <span className="font-semibold text-[#423D33]">{candle.burnHours}+ h</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-[#8C7A6B] font-bold tracking-wider">
                  Mecha
                </span>
                <span className="font-semibold text-[#423D33]">Algodón 100%</span>
              </div>
            </div>

            {/* WAX TYPE SELECTOR (Soja vs Parafina) */}
            <div className="space-y-2 pt-2 border-t border-[#E5E0DA]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Tipo de Cera Obligatorio</span>
                </span>
                <span className="text-[10px] text-[#423D33]/70 font-medium">
                  {selectedWax === "Soja" ? "100% Vegetal" : "Alta Difusión"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWax("Soja")}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedWax === "Soja"
                      ? "border-[#423D33] bg-[#FAF7F2] ring-1 ring-[#423D33]"
                      : "border-[#E5E0DA] bg-white hover:border-[#8C7A6B]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-[#423D33]">Cera de Soja</span>
                    {selectedWax === "Soja" && (
                      <Check className="w-3.5 h-3.5 text-[#608058]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#423D33]/70 leading-tight">
                    100% vegetal ecológica, quemado limpio
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedWax("Parafina")}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedWax === "Parafina"
                      ? "border-[#423D33] bg-[#FAF7F2] ring-1 ring-[#423D33]"
                      : "border-[#E5E0DA] bg-white hover:border-[#8C7A6B]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-[#423D33]">Cera de Parafina</span>
                    {selectedWax === "Parafina" && (
                      <Check className="w-3.5 h-3.5 text-[#608058]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#423D33]/70 leading-tight">
                    Refinada de alta pureza, máxima proyección
                  </p>
                </button>
              </div>
            </div>

            {/* ADICIONALES (UPSELLING): Grabado + Caja de Regalo */}
            <div className="space-y-2 pt-2 border-t border-[#E5E0DA]">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Personalización & Adicionales
              </span>

              {/* Grabado en Cerámica (+$3.50) */}
              <div className="rounded-2xl border border-[#E5E0DA] p-3 bg-white space-y-2">
                <label className="flex items-center justify-between text-xs font-semibold text-[#423D33] cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    <span className="text-[11px]">Grabado / Dedicatoria en Etiqueta</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#8C7A6B]">+$3.50</span>
                    <input
                      type="checkbox"
                      checked={enableEngraving}
                      onChange={(e) => setEnableEngraving(e.target.checked)}
                      className="accent-[#8C7A6B] w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </label>

                {enableEngraving && (
                  <div className="pt-1 space-y-1.5">
                    <input
                      type="text"
                      maxLength={36}
                      placeholder="Ej: Para Sofía con amor • Luz y Paz"
                      value={customEngraving}
                      onChange={(e) => {
                        setCustomEngraving(e.target.value);
                        setCustomLabelSubtitle(e.target.value);
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#E5E0DA] bg-[#FDFBF9] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                    />
                    <span className="text-[9px] text-[#423D33]/60 block">
                      Impresión caligráfica artesanal en la etiqueta botánica.
                    </span>
                  </div>
                )}
              </div>

              {/* Caja de Regalo Botánica (+$3.50) */}
              <div className="rounded-2xl border border-[#E5E0DA] p-3 bg-white">
                <label className="flex items-center justify-between text-xs font-semibold text-[#423D33] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#D98B68]" />
                    <div>
                      <span className="text-[11px] block">Envoltura de Regalo Botánica</span>
                      <span className="text-[9px] text-[#423D33]/60 font-normal">
                        Caja kraft rígida con lazo de lino y ramas secas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#8C7A6B]">+$3.50</span>
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="accent-[#8C7A6B] w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* TABBED INFORMATION SECTION (Olfactory, Ingredients, Ritual) */}
            <div className="pt-2 border-t border-[#E5E0DA]">
              <div className="flex items-center gap-2 border-b border-[#E5E0DA] pb-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("olfato")}
                  className={`pb-1 font-bold tracking-wider transition-colors cursor-pointer ${
                    activeTab === "olfato"
                      ? "text-[#423D33] border-b-2 border-[#423D33]"
                      : "text-[#8C7A6B] hover:text-[#423D33]"
                  }`}
                >
                  Pirámide Olfativa
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ingredientes")}
                  className={`pb-1 font-bold tracking-wider transition-colors cursor-pointer ${
                    activeTab === "ingredientes"
                      ? "text-[#423D33] border-b-2 border-[#423D33]"
                      : "text-[#8C7A6B] hover:text-[#423D33]"
                  }`}
                >
                  Ingredientes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ritual")}
                  className={`pb-1 font-bold tracking-wider transition-colors cursor-pointer ${
                    activeTab === "ritual"
                      ? "text-[#423D33] border-b-2 border-[#423D33]"
                      : "text-[#8C7A6B] hover:text-[#423D33]"
                  }`}
                >
                  Ritual de Encendido
                </button>
              </div>

              <div className="pt-3 text-xs text-[#423D33]/80 leading-relaxed">
                {activeTab === "olfato" && (
                  <div className="space-y-1.5">
                    {candle.olfactoryPyramid?.corazon || candle.olfactoryPyramid?.fondo ? (
                      <>
                        <p>
                          <strong className="text-[#423D33]">Salida:</strong>{" "}
                          {candle.olfactoryPyramid?.salida || "Cítricos luminosos y hojas frescas"}
                        </p>
                        {candle.olfactoryPyramid?.corazon && (
                          <p>
                            <strong className="text-[#423D33]">Corazón:</strong>{" "}
                            {candle.olfactoryPyramid.corazon}
                          </p>
                        )}
                        {candle.olfactoryPyramid?.fondo && (
                          <p>
                            <strong className="text-[#423D33]">Fondo:</strong>{" "}
                            {candle.olfactoryPyramid.fondo}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        <strong className="text-[#423D33]">Aroma:</strong>{" "}
                        {candle.olfactoryPyramid?.salida || candle.subtitle || "Aroma artesanal botánico"}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "ingredientes" && (
                  <ul className="list-disc pl-4 space-y-1">
                    {candle.ingredients?.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    )) || <li>100% Cera de Soja y Aceites Esenciales Botánicos</li>}
                  </ul>
                )}

                {activeTab === "ritual" && (
                  <p className="leading-relaxed">
                    Recorta la mecha a 5mm antes de cada encendido. En el primer uso, mantén la vela encendida durante 2 a 3 horas hasta que la superficie de cera se derrita por completo de borde a borde.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER: QUANTITY, TOTAL PRICE & ADD TO CART */}
          <div className="pt-5 border-t border-[#E5E0DA] flex items-center justify-between gap-4 mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-[#E5E0DA] rounded-full bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#423D33] hover:bg-[#F2EDE7] cursor-pointer text-sm font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-[#423D33]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#423D33] hover:bg-[#F2EDE7] cursor-pointer text-sm font-bold"
              >
                +
              </button>
            </div>

            {/* Total Price and Action Button */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">Total</span>
                <span className="font-serif text-xl font-bold text-[#423D33]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {onCustomize && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCustomize(candle);
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#8C7A6B]/50 bg-white hover:bg-[#FAF7F2] text-[#423D33] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Abrir en el Taller de Personalización Completo"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D98B68]" />
                  <span>Personalizar en Taller</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAdd}
                className={`px-5 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  isAdded
                    ? "bg-[#608058] text-white shadow-xs"
                    : "bg-[#4A4541] hover:bg-[#35312E] text-white shadow-md"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregada!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D9C5B2]" />
                    <span>Agregar a la Cesta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
