import React, { useState, useEffect } from "react";
import {
  Flame,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Layers,
  RotateCcw,
  Tag,
  PenTool,
  Type,
  FileText,
} from "lucide-react";
import { woodSoundEngine } from "../utils/audioSynth";
import { Layer2D } from "../types";
import { SingleLayerRenderer } from "./SingleLayerRenderer";
import { LayerStackRenderer } from "./LayerStackRenderer";
import { CandlePreview2D } from "./CandlePreview2D";

export interface BotanicalVisualItem {
  id: string;
  name: string;
  category: "Salida" | "Corazón" | "Fondo";
  color: string;
  priceAddon: number;
  description: string;
  visualType: string;
}

export interface WaxColorVisualItem {
  id: string;
  name: string;
  subtitle: string;
  hex: string;
  accent: string;
  waxType: "Soja" | "Parafina";
}

export interface WickVisualItem {
  id: string;
  name: string;
  subtitle: string;
  type: "madera" | "algodon";
  priceAddon: number;
  soundEffect: string;
  burnRate: string;
}

export interface LabelStyleVisualItem {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  paperBg?: string;
  paperText?: string;
  paperBorder?: string;
}

export interface VesselVisualItem {
  id: string;
  name: string;
  material: string;
  color: string;
  basePrice: number;
  description: string;
  image: string;
  templateType?: string;
  layers2D?: Layer2D[];
  colorable?: boolean;
  defaultColorHex?: string;
  allowedColorHexes?: string[];
  activeColorHex?: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  zIndex?: number;
}

interface InteractiveVisualizer2DProps {
  vessel?: VesselVisualItem;
  waxColor: WaxColorVisualItem;
  wick: WickVisualItem;
  botanicals: BotanicalVisualItem[];
  labelTitle: string;
  labelSubtitle: string;
  labelStyle: LabelStyleVisualItem;
  isLit?: boolean;
  onToggleLit?: () => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
  viewMode?: "top" | "front";
  onViewModeChange?: (mode: "top" | "front") => void;
  templateType?: string;
  candleImage?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  base2DImage?: string;
  custom2DImageUrl?: string;
  mainImage?: string;
  selectedProduct?: {
    id?: string;
    name?: string;
    image?: string;
    mainImage?: string;
    backgroundImage?: string;
    backgroundOpacity?: number;
    custom2DImageUrl?: string;
    base2DImage?: string;
    waxMaskPolygon?: string;
    wickX?: number;
    wickY?: number;
    botanicalsX?: number;
    botanicalsY?: number;
    botanicalsRadius?: number;
    templateType?: string;
    layers2D?: Layer2D[];
  };
  waxMaskPolygon?: string;
  wickX?: number;
  wickY?: number;
  botanicalsX?: number;
  botanicalsY?: number;
  botanicalsRadius?: number;
  showControls?: boolean;
  showIndependentLabelCard?: boolean;
  onLabelTitleChange?: (val: string) => void;
  onLabelSubtitleChange?: (val: string) => void;
  onLabelStyleChange?: (style: LabelStyleVisualItem) => void;
  availableLabelStyles?: LabelStyleVisualItem[];
  className?: string;
}

export const DEFAULT_LABEL_STYLES: LabelStyleVisualItem[] = [
  {
    id: "kraft",
    name: "Kraft Botánico",
    bgClass: "bg-[#D8C4B0] text-[#3D2E24]",
    textClass: "text-[#3D2E24]",
    borderClass: "border-[#B59E87]",
  },
  {
    id: "lino",
    name: "Lino Crudo",
    bgClass: "bg-[#F3EFE9] text-[#423D33]",
    textClass: "text-[#423D33]",
    borderClass: "border-[#D6CECE]",
  },
  {
    id: "negro",
    name: "Carbón & Oro",
    bgClass: "bg-[#23201D] text-[#E5D7C2]",
    textClass: "text-[#E5D7C2]",
    borderClass: "border-[#4A433D]",
  },
  {
    id: "laser",
    name: "Madera Láser",
    bgClass: "bg-[#C4A482] text-[#3B2818]",
    textClass: "text-[#3B2818]",
    borderClass: "border-[#9E7B5A]",
  },
];

export const InteractiveVisualizer2D: React.FC<InteractiveVisualizer2DProps> = ({
  vessel,
  waxColor,
  wick,
  botanicals,
  labelTitle,
  labelSubtitle,
  labelStyle,
  isLit: externalIsLit,
  onToggleLit: externalOnToggleLit,
  isPlayingAudio: externalIsPlayingAudio,
  onToggleAudio: externalOnToggleAudio,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
  templateType = "santuario",
  candleImage,
  backgroundImage,
  backgroundOpacity,
  base2DImage,
  custom2DImageUrl,
  mainImage,
  selectedProduct,
  waxMaskPolygon = "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
  wickX = 31,
  wickY = 59,
  botanicalsX = 31,
  botanicalsY = 67,
  botanicalsRadius = 11,
  showControls = true,
  showIndependentLabelCard = true,
  onLabelTitleChange,
  onLabelSubtitleChange,
  onLabelStyleChange,
  availableLabelStyles = DEFAULT_LABEL_STYLES,
  className = "",
}) => {
  const current2DImage =
    selectedProduct?.custom2DImageUrl ||
    custom2DImageUrl ||
    selectedProduct?.base2DImage ||
    base2DImage ||
    selectedProduct?.mainImage ||
    selectedProduct?.image ||
    candleImage ||
    mainImage ||
    vessel?.image;

  const effectiveWickX = selectedProduct?.wickX ?? wickX;
  const effectiveWickY = selectedProduct?.wickY ?? wickY;
  const effectiveWaxMask = selectedProduct?.waxMaskPolygon || waxMaskPolygon;
  // Local state fallbacks if not controlled from parent
  const [internalViewMode, setInternalViewMode] = useState<"top" | "front">("front");
  const [internalIsLit, setInternalIsLit] = useState(false);
  const [internalIsPlayingAudio, setInternalIsPlayingAudio] = useState(false);

  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const setViewMode = externalOnViewModeChange || setInternalViewMode;

  const isLit = externalIsLit !== undefined ? externalIsLit : internalIsLit;
  const isPlayingAudio =
    externalIsPlayingAudio !== undefined ? externalIsPlayingAudio : internalIsPlayingAudio;

  const handleToggleFlame = () => {
    if (externalOnToggleLit) {
      externalOnToggleLit();
    } else {
      const nextLit = !internalIsLit;
      setInternalIsLit(nextLit);
      if (nextLit && wick.type === "madera") {
        woodSoundEngine.start();
        woodSoundEngine.setVolume(0.35);
        setInternalIsPlayingAudio(true);
      } else if (!nextLit) {
        woodSoundEngine.stop();
        setInternalIsPlayingAudio(false);
      }
    }
  };

  const handleToggleAudio = () => {
    if (externalOnToggleAudio) {
      externalOnToggleAudio();
    } else {
      if (internalIsPlayingAudio) {
        woodSoundEngine.stop();
        setInternalIsPlayingAudio(false);
      } else {
        woodSoundEngine.start();
        woodSoundEngine.setVolume(0.35);
        setInternalIsPlayingAudio(true);
      }
    }
  };

  // Render SVG Botanical Sprigs in Top-Down view
  const renderBotanicalTop = (
    botanical: BotanicalVisualItem,
    index: number,
    total: number
  ) => {
    const angle = (index * (360 / Math.max(total, 1)) + 25) * (Math.PI / 180);
    const radius = 95 + (index % 2) * 18;
    const cx = 200 + Math.cos(angle) * radius;
    const cy = 200 + Math.sin(angle) * radius;
    const rot = (angle * 180) / Math.PI + 90;

    switch (botanical.visualType || botanical.id) {
      case "lavanda":
        return (
          <g
            key={`bot-${botanical.id}-${index}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot})`}
          >
            <path
              d="M 0 25 Q 2 0 0 -25"
              stroke="#4D5A34"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {[-20, -12, -4, 4, 12, 20].map((y, i) => (
              <g key={i}>
                <ellipse
                  cx={-5}
                  cy={y}
                  rx="4"
                  ry="2.5"
                  transform={`rotate(${i % 2 === 0 ? 30 : -30} -5 ${y})`}
                  fill="#7E68A8"
                  opacity="0.95"
                />
                <ellipse
                  cx={5}
                  cy={y}
                  rx="4"
                  ry="2.5"
                  transform={`rotate(${i % 2 === 0 ? -30 : 30} 5 ${y})`}
                  fill="#9E87C8"
                  opacity="0.95"
                />
                <circle cx={0} cy={y - 2} r="2" fill="#5F4A8B" />
              </g>
            ))}
          </g>
        );

      case "naranja":
        return (
          <g
            key={`bot-${botanical.id}-${index}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot})`}
          >
            <circle cx="0" cy="0" r="24" fill="#C26A18" />
            <circle cx="0" cy="0" r="22" fill="#E69138" />
            <circle cx="0" cy="0" r="20" fill="#F4B258" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={18 * Math.cos((a * Math.PI) / 180)}
                y2={18 * Math.sin((a * Math.PI) / 180)}
                stroke="#C26A18"
                strokeWidth="1.5"
                strokeDasharray="2,1"
              />
            ))}
            <circle cx="0" cy="0" r="3" fill="#FFE5A3" />
          </g>
        );

      case "canela":
        return (
          <g
            key={`bot-${botanical.id}-${index}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot - 35})`}
          >
            <rect
              x="-6"
              y="-28"
              width="12"
              height="56"
              rx="4"
              fill="#7A3618"
              stroke="#53240F"
              strokeWidth="1.5"
            />
            <path
              d="M -4 -24 L -4 24 M 0 -22 L 0 22 M 4 -24 L 4 24"
              stroke="#9E4D27"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          </g>
        );

      case "eucalipto":
        return (
          <g
            key={`bot-${botanical.id}-${index}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot})`}
          >
            <path
              d="M 0 30 Q 8 0 0 -30"
              stroke="#3D4E3A"
              strokeWidth="2"
              fill="none"
            />
            {[-20, -6, 8, 22].map((y, i) => (
              <circle
                key={i}
                cx={i % 2 === 0 ? -10 : 10}
                cy={y}
                r="9"
                fill="#6B8E72"
                stroke="#4F6D55"
                strokeWidth="1"
                opacity="0.9"
              />
            ))}
          </g>
        );

      default:
        return (
          <g
            key={`bot-${botanical.id}-${index}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot})`}
          >
            <circle
              cx="0"
              cy="0"
              r="10"
              fill={botanical.color}
              stroke="#000"
              strokeWidth="0.5"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="4" fill="#FFF" opacity="0.6" />
          </g>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* 2D CANVAS CONTAINER */}
      <div
        className={`relative w-full ${
          viewMode === "front" ? "max-w-[380px] aspect-[4/5]" : "aspect-square max-w-[440px]"
        } rounded-3xl bg-[#F7F4EE] border border-[#E5E0DA] shadow-xs overflow-hidden flex items-center justify-center p-2 transition-all duration-300`}
      >
        {/* VIEW 1: TOP-DOWN ZENITHAL VIEW */}
        {viewMode === "top" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-xl transition-all duration-700"
            >
              <defs>
                {/* Vessel Outer Rim Shadow */}
                <radialGradient id="vesselOuterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#000000" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                </radialGradient>

                {/* Wax Radial Depth Gradient */}
                <radialGradient id="waxRadialDepth" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <stop offset="60%" stopColor={waxColor.hex} stopOpacity="1" />
                  <stop offset="100%" stopColor={waxColor.accent} stopOpacity="1" />
                </radialGradient>

                {/* Wood Wick Grain Pattern */}
                <linearGradient id="woodWickTop" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3E2010" />
                  <stop offset="30%" stopColor="#5C3119" />
                  <stop offset="70%" stopColor="#2A1408" />
                  <stop offset="100%" stopColor="#4A2512" />
                </linearGradient>

                {/* Flame Halo Gradient */}
                <radialGradient id="flameGlowTop" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF9C4" stopOpacity="1" />
                  <stop offset="25%" stopColor="#FFA726" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#FF5722" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer Vessel Rim */}
              <circle
                cx="200"
                cy="200"
                r="185"
                fill={vessel?.color || "#E8DFD5"}
                stroke="#B5A99B"
                strokeWidth="4"
              />
              <circle cx="200" cy="200" r="185" fill="url(#vesselOuterGlow)" />
              <circle
                cx="200"
                cy="200"
                r="170"
                fill="#2E2B27"
                stroke="#1A1815"
                strokeWidth="3"
                opacity="0.85"
              />

              {/* Inner Wax Bed */}
              <circle
                cx="200"
                cy="200"
                r="164"
                fill="url(#waxRadialDepth)"
                stroke="#9E9284"
                strokeWidth="1.5"
              />

              {/* Botanical Sprigs Layer */}
              <g id="botanicals-layer">
                {botanicals.map((bot, idx) =>
                  renderBotanicalTop(bot, idx, botanicals.length)
                )}
              </g>

              {/* Melt Pool Reflection around Wick */}
              <circle
                cx="200"
                cy="200"
                r="42"
                fill="#FFFFFF"
                opacity={isLit ? 0.35 : 0.15}
                filter="blur(3px)"
              />

              {/* Wick Base & Clip */}
              {wick.type === "madera" ? (
                <g transform="translate(200, 200)">
                  <rect
                    x="-20"
                    y="-4"
                    width="40"
                    height="8"
                    rx="2"
                    fill="url(#woodWickTop)"
                    stroke="#1D0E07"
                    strokeWidth="1"
                  />
                  <rect
                    x="-18"
                    y="-1.5"
                    width="36"
                    height="3"
                    fill="#180B05"
                    opacity="0.6"
                  />
                </g>
              ) : (
                <g transform="translate(200, 200)">
                  <circle cx="0" cy="0" r="7" fill="#3D3833" />
                  <circle cx="0" cy="0" r="5" fill="#EFE8DB" stroke="#8C7A6B" strokeWidth="1" />
                  <circle cx="0" cy="0" r="2.5" fill="#1C1814" />
                </g>
              )}

              {/* Dynamic Animated Flame on Top View */}
              {isLit && (
                <g className="animate-pulse">
                  <circle cx="200" cy="200" r="60" fill="url(#flameGlowTop)" />
                  {wick.type === "madera" ? (
                    <g transform="translate(200, 200)">
                      <ellipse cx="0" cy="0" rx="16" ry="6" fill="#FF5722" opacity="0.9" />
                      <ellipse cx="0" cy="0" rx="10" ry="4.5" fill="#FFA726" />
                      <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#FFF9C4" />
                      <circle cx="0" cy="0" r="1.5" fill="#42A5F5" opacity="0.9" />
                    </g>
                  ) : (
                    <g transform="translate(200, 200)">
                      <circle cx="0" cy="0" r="10" fill="#FF5722" opacity="0.85" />
                      <circle cx="0" cy="0" r="7" fill="#FFA726" />
                      <circle cx="0" cy="0" r="4" fill="#FFF9C4" />
                      <circle cx="0" cy="0" r="1.5" fill="#42A5F5" opacity="0.9" />
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>
        )}

        {/* VIEW 2: FRONT ELEVATION / PRODUCT MODEL VIEW (Unified Canonical CandlePreview2D) */}
        {viewMode === "front" && (
          <CandlePreview2D
            layers={
              selectedProduct?.layers2D && selectedProduct.layers2D.length > 0
                ? selectedProduct.layers2D
                : (vessel?.layers2D || [])
            }
            backgroundImage={
              backgroundImage !== undefined
                ? (backgroundImage && backgroundImage.trim() ? backgroundImage.trim() : undefined)
                : (selectedProduct?.backgroundImage && selectedProduct.backgroundImage.trim()) || undefined
            }
            backgroundOpacity={backgroundOpacity ?? selectedProduct?.backgroundOpacity ?? 1}
            selectedWaxColorHex={waxColor.hex}
            wickX={effectiveWickX}
            wickY={effectiveWickY}
            wickType={wick.type}
            isLit={isLit}
            botanicalsX={selectedProduct?.botanicalsX ?? 31}
            botanicalsY={selectedProduct?.botanicalsY ?? 67}
            botanicalsRadius={selectedProduct?.botanicalsRadius ?? 11}
            botanicals={botanicals}
            showBotanicalsArea={false}
            showGuides={false}
            fallbackImage={current2DImage}
            emptyMessage="Vela sin imagen cargada"
            heightClass="w-full max-w-[380px] aspect-[4/5] mx-auto"
            className="w-full h-full flex items-center justify-center pointer-events-none"
            canvasClassName="border-0 shadow-none bg-transparent"
          />
        )}

        {/* LIVE STATUS CHIPS OVERLAY */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-20">
          <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold text-[#423D33] uppercase tracking-wider border border-black/5 shadow-xs flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: waxColor.hex }}
            />
            <span>{waxColor.name}</span>
          </div>
          <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-medium text-[#423D33] border border-black/5 shadow-xs flex items-center gap-1.5">
            <span>{wick.name}</span>
          </div>
        </div>

        {/* ACTIVE BOTANICALS PILL LIST */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar pointer-events-none z-20">
          {botanicals.map((bot, idx) => (
            <span
              key={idx}
              className="bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[8px] font-medium whitespace-nowrap shadow-2xs"
            >
              {bot.name.split(" ")[0]}
            </span>
          ))}
        </div>
      </div>

      {/* INTERACTIVE CONTROLS TOOLBAR */}
      {showControls && (
        <div className="w-full max-w-[440px] mt-3 flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-[#E5E0DA] shadow-xs text-xs">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#F2EDE7] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("front")}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "front"
                  ? "bg-white text-[#423D33] shadow-xs"
                  : "text-[#423D33]/60 hover:text-[#423D33]"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Frontal (2D)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("top")}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "top"
                  ? "bg-white text-[#423D33] shadow-xs"
                  : "text-[#423D33]/60 hover:text-[#423D33]"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Cenital</span>
            </button>
          </div>

          {/* Action Buttons: Flame & Acoustic Audio */}
          <div className="flex items-center gap-1.5">
            {/* Toggle Flame Button */}
            <button
              type="button"
              onClick={handleToggleFlame}
              className={`px-3 py-1.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                isLit
                  ? "bg-[#D98B68] text-white shadow-xs animate-pulse"
                  : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-[#F2EDE7]"
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  isLit ? "text-yellow-200 fill-yellow-200" : "text-[#D98B68]"
                }`}
              />
              <span>{isLit ? "Llama Activa" : "Encender"}</span>
            </button>

            {/* Acoustic Crepitation Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              title="Sonido de crepitación de madera en chimenea"
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isPlayingAudio
                  ? "bg-[#8C7A6B] text-white border-[#8C7A6B]"
                  : "bg-[#FAF7F2] text-[#8C7A6B] border-[#E5E0DA] hover:bg-[#F2EDE7]"
              }`}
            >
              {isPlayingAudio ? (
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. TARJETA INDEPENDIENTE DE ETIQUETA Y DEDICATORIA (SECCIÓN INFERIOR) */}
      {showIndependentLabelCard && (
        <div className="w-full max-w-[440px] mt-4 p-4 sm:p-5 bg-white rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DA]/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#8C7A6B]/15 text-[#8C7A6B] flex items-center justify-center">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#423D33]">
                  Etiqueta & Dedicatoria Personalizada
                </h4>
                <p className="text-[10px] text-[#8C7A6B]">
                  Previsualización independiente sin saturar la figura de la vela
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#8C7A6B] px-2 py-0.5 rounded-full border border-[#E5E0DA]">
              {labelStyle.name}
            </span>
          </div>

          {/* Paper Texture / Label Style Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
              Textura de Papel Botánico:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {availableLabelStyles.map((style) => {
                const isSelected = labelStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onLabelStyleChange && onLabelStyleChange(style)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 font-bold shadow-2xs text-[#423D33]"
                        : "bg-white border-[#E5E0DA] text-[#423D33]/70 hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border ${
                        style.id === "kraft"
                          ? "bg-[#D8C4B0] border-[#B59E87]"
                          : style.id === "lino"
                          ? "bg-[#F3EFE9] border-[#D6CECE]"
                          : style.id === "negro"
                          ? "bg-[#23201D] border-[#4A433D]"
                          : "bg-[#C4A482] border-[#9E7B5A]"
                      }`}
                    />
                    <span className="text-[10px] leading-tight truncate w-full">
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Input Fields with Length Limit Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title / Name (max 32 chars) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  <span>Título / Nombre</span>
                </span>
                <span
                  className={
                    (labelTitle?.length || 0) >= 32 ? "text-red-500 font-bold" : ""
                  }
                >
                  {labelTitle?.length || 0}/32
                </span>
              </div>
              <input
                type="text"
                maxLength={32}
                value={labelTitle}
                onChange={(e) => onLabelTitleChange && onLabelTitleChange(e.target.value)}
                placeholder="Ej. Vela Silvestre de Luna"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-xs font-serif text-[#423D33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C7A6B]/20"
              />
            </div>

            {/* Subtitle / Dedication (max 48 chars) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <PenTool className="w-3 h-3" />
                  <span>Dedicatoria</span>
                </span>
                <span
                  className={
                    (labelSubtitle?.length || 0) >= 48 ? "text-red-500 font-bold" : ""
                  }
                >
                  {labelSubtitle?.length || 0}/48
                </span>
              </div>
              <input
                type="text"
                maxLength={48}
                value={labelSubtitle}
                onChange={(e) =>
                  onLabelSubtitleChange && onLabelSubtitleChange(e.target.value)
                }
                placeholder="Ej. Para iluminar tus momentos de calma"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-xs text-[#423D33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C7A6B]/20"
              />
            </div>
          </div>

          {/* REAL-TIME PREVIEW CARD OF THE CRAFT LABEL */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
              Previsualización de Impresión en Etiqueta:
            </span>
            <div
              className={`w-full p-4 sm:p-5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden shadow-xs ${
                labelStyle.id === "kraft"
                  ? "bg-[#D8C4B0] text-[#3D2E24] border-[#B59E87]"
                  : labelStyle.id === "lino"
                  ? "bg-[#F3EFE9] text-[#423D33] border-[#D6CECE]"
                  : labelStyle.id === "negro"
                  ? "bg-[#23201D] text-[#E5D7C2] border-[#4A433D]"
                  : "bg-[#C4A482] text-[#3B2818] border-[#9E7B5A]"
              }`}
            >
              {/* Delicate Inner Dashed Border Trim */}
              <div
                className={`absolute inset-2 rounded-xl border pointer-events-none ${
                  labelStyle.id === "negro"
                    ? "border-[#9E7B5A]/40"
                    : "border-[#8C7A6B]/40"
                } border-dashed`}
              />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-75">
                  ayllu • cerería artesanal
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold tracking-wide mt-0.5 leading-snug w-full truncate px-2">
                  {labelTitle || "Vela Botánica"}
                </h4>
                <p className="text-[10px] sm:text-[11px] opacity-85 italic leading-tight w-full truncate px-2">
                  {labelSubtitle || "Vertida a mano con cera vegetal pura"}
                </p>

                <div className="pt-2 mt-1 border-t border-current/15 flex items-center justify-center gap-3 text-[7.5px] tracking-wider uppercase font-mono opacity-70">
                  <span>{waxColor.name}</span>
                  <span>•</span>
                  <span>{wick.name.split(" ")[0]}</span>
                  <span>•</span>
                  <span>{waxColor.waxType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
