import React, { useState } from "react";
import { Flame, Sparkles, Volume2, VolumeX, Eye, Info, Check } from "lucide-react";
import { CandleProduct } from "../types";
import { woodSoundEngine } from "../utils/audioSynth";
import zorroImg from "../assets/images/zorro_exact.jpg";
import { SingleLayerRenderer } from "./SingleLayerRenderer";

export interface WaxColorPreset {
  id: string;
  name: string;
  subtitle: string;
  hex: string;
  borderHex: string;
  shadowHex: string;
  description: string;
  waxOverlayColor: string;
  waxBlendMode: "normal" | "multiply" | "overlay" | "color" | "darken";
  waxOpacity: number;
}

// Capas por defecto desde el repositorio de GitHub (RAW)
const GITHUB_DEFAULT_LAYERS = [
  {
    id: "layer-glass",
    name: "Vaso de Vidrio",
    imageUrl: "https://raw.githubusercontent.com/marcariakando-hj/Imagenes_AYLLU/main/Flor_vaso_Vidrio.png",
    zIndex: 1,
    colorable: false,
  },
  {
    id: "layer-wax",
    name: "Base de Cera",
    imageUrl: "https://raw.githubusercontent.com/marcariakando-hj/Imagenes_AYLLU/main/Flor_cera.png",
    zIndex: 2,
    colorable: true,
  },
  {
    id: "layer-top",
    name: "Parte Superior Flor",
    imageUrl: "https://raw.githubusercontent.com/marcariakando-hj/Imagenes_AYLLU/main/Flor_parteSuperior.png",
    zIndex: 3,
    colorable: false,
  },
];

export const WAX_COLOR_PRESETS: WaxColorPreset[] = [
  {
    id: "caliza-blanca",
    name: "Caliza Blanca",
    subtitle: "Blanco puro & marfil cálido",
    hex: "#FAF7F2",
    borderHex: "#E5DEC9",
    shadowHex: "rgba(229, 222, 201, 0.4)",
    description: "Tono inmaculado y luminoso que resalta los relieves de la escultura y proyecta serenidad pura.",
    waxOverlayColor: "rgba(250, 247, 242, 0.15)",
    waxBlendMode: "normal",
    waxOpacity: 0.1,
  },
  {
    id: "arena",
    name: "Arena",
    subtitle: "Beige crudo mineral",
    hex: "#E8DFD5",
    borderHex: "#D1C4B5",
    shadowHex: "rgba(209, 196, 181, 0.4)",
    description: "Inspirado en las dunas y la arcilla cruda, aporta calidez orgánica natural a la base.",
    waxOverlayColor: "#C9B9A6",
    waxBlendMode: "multiply",
    waxOpacity: 0.65,
  },
  {
    id: "carbon",
    name: "Carbón",
    subtitle: "Gris antracita volcánico",
    hex: "#383533",
    borderHex: "#22201E",
    shadowHex: "rgba(34, 32, 30, 0.5)",
    description: "Elegancia dramática y contemporánea con marcado contraste entre la cera oscura y el cristal.",
    waxOverlayColor: "#2B2826",
    waxBlendMode: "multiply",
    waxOpacity: 0.88,
  },
  {
    id: "terracota",
    name: "Terracota",
    subtitle: "Arcilla rojiza tostada",
    hex: "#C87A64",
    borderHex: "#A85B46",
    shadowHex: "rgba(168, 91, 70, 0.45)",
    description: "Tono ancestral de alfarería andina que evoca el calor del fuego, la tierra y el otoño.",
    waxOverlayColor: "#BA634A",
    waxBlendMode: "multiply",
    waxOpacity: 0.72,
  },
  {
    id: "ambar",
    name: "Ámbar",
    subtitle: "Dorado miel resinoso",
    hex: "#D49B55",
    borderHex: "#B87F3B",
    shadowHex: "rgba(184, 127, 59, 0.45)",
    description: "Destellos ambarinos y dorados que multiplican la calidez del resplandor y la atmósfera.",
    waxOverlayColor: "#D19145",
    waxBlendMode: "multiply",
    waxOpacity: 0.7,
  },
];

interface CandleVisualizer2DProps {
  candle: CandleProduct;
  selectedWaxColor?: string;
  onWaxColorChange?: (colorPreset: WaxColorPreset) => void;
  interactiveControls?: boolean;
  className?: string;
}

export const CandleVisualizer2D: React.FC<CandleVisualizer2DProps> = ({
  candle,
  selectedWaxColor = "caliza-blanca",
  onWaxColorChange,
  interactiveControls = true,
  className = "",
}) => {
  const [currentColorId, setCurrentColorId] = useState<string>(selectedWaxColor);
  const [isLit, setIsLit] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const activeColor =
    WAX_COLOR_PRESETS.find((c) => c.id === currentColorId) || WAX_COLOR_PRESETS[0];

  const handleColorSelect = (preset: WaxColorPreset) => {
    setCurrentColorId(preset.id);
    if (onWaxColorChange) {
      onWaxColorChange(preset);
    }
  };

  const toggleSound = () => {
    if (isPlayingAudio) {
      woodSoundEngine.stop();
      setIsPlayingAudio(false);
    } else {
      woodSoundEngine.start();
      setIsPlayingAudio(true);
    }
  };

  // Carga candle.layers2D o usa las capas por defecto de GitHub si está vacío
  const rawLayers = (candle.layers2D && candle.layers2D.length > 0) 
    ? candle.layers2D 
    : GITHUB_DEFAULT_LAYERS;

  const sortedLayers = [...rawLayers].sort((a, b) => a.zIndex - b.zIndex);
  const hasLayers = sortedLayers.length > 0;
  const baseImage = candle.custom2DImageUrl || candle.base2DImage || candle.image || zorroImg;
  const waxMask = candle.waxMaskPolygon || "polygon(15% 60%, 85% 60%, 80% 79%, 20% 79%)";

  // Hotspots definitions directly mapped onto the real photograph
  const visualHotspots = [
    {
      id: 0,
      title: candle.wickType || "Mecha de Algodón Puro",
      detail: "Mecha ecológica libre de plomo para una llama limpia y constante.",
      coords: "top-[23%] left-[28%]",
    },
    {
      id: 1,
      title: "Escultura en Cera de Soja 3D",
      detail: "Figura modelada artesanalmente a mano con relieves botánicos y curado en frío.",
      coords: "top-[42%] left-[27%]",
    },
    {
      id: 2,
      title: "Vaso de Vidrio Artesanal",
      detail: "Cristal resistente al calor de alta pureza 100% reutilizable.",
      coords: "top-[78%] left-[26%]",
    },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-between space-y-4 ${className}`}>
      {/* REAL PHOTOGRAPHIC CENTER STAGE WITH PHOTOREALISTIC WAX COLOR TINTING */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-[#F4EFEA] border border-[#D9C5B2] shadow-md select-none group flex items-center justify-center p-3">
        {hasLayers ? (
          /* Multi-layer 2D Stack */
          <div className="relative w-full h-full flex items-center justify-center">
            {sortedLayers.map((layer) => (
              <div
                key={layer.id}
                className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-contain [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-contain"
                style={{
                  transform: `translate(${layer.offsetX ?? layer.posX ?? 0}%, ${layer.offsetY ?? layer.posY ?? 0}%) scale(${
                    layer.scale || 1
                  })`,
                  opacity: layer.opacity ?? 1,
                  zIndex: (layer.zIndex ?? 0) + 1,
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <SingleLayerRenderer
                    imageUrl={layer.imageUrl}
                    colorHex={layer.colorable ? (layer.defaultColorHex || activeColor.hex) : undefined}
                    isColorable={layer.colorable}
                    className="w-full h-full object-contain pointer-events-none"
                    alt={layer.name}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback Single Image + SVG Mask (Only if no layers) */
          <>
            {Boolean(baseImage && baseImage.trim()) && (
              <img
                src={baseImage}
                alt={`Visualizador Fotorrealista 2D - ${candle.name}`}
                referrerPolicy="no-referrer"
                className="object-contain max-h-full max-w-full m-auto transition-transform duration-700 group-hover:scale-102"
              />
            )}

            {activeColor.id !== "caliza-blanca" && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                <defs>
                  <filter id="candleVisualizerWaxSoftFeather" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.45" />
                  </filter>
                </defs>
                <path
                  d={waxMask.startsWith("M") ? waxMask : "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z"}
                  fill={activeColor.waxOverlayColor}
                  style={{
                    mixBlendMode: activeColor.waxBlendMode as any,
                    opacity: activeColor.waxOpacity,
                  }}
                  filter="url(#candleVisualizerWaxSoftFeather)"
                />
              </svg>
            )}
          </>
        )}

        {/* Ambient Warm Atmosphere Halo when candle is lit */}
        {isLit && (
          <div
            className="absolute top-[18%] left-[28%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full pointer-events-none transition-all duration-700 animate-pulse"
            style={{
              background: "radial-gradient(circle, rgba(255, 214, 138, 0.45) 0%, rgba(255, 140, 66, 0.2) 50%, rgba(255, 255, 255, 0) 75%)",
              filter: "blur(8px)",
            }}
          />
        )}

        {/* Animated Flickering Wick Flame */}
        {isLit && (
          <div className="absolute top-[23%] left-[27.5%] -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center">
            {/* Outer Flame Glow */}
            <div className="w-5 h-8 bg-gradient-to-t from-[#FF6B2B] via-[#FFA63D] to-[#FFF4D0] rounded-full blur-[1px] animate-flame-flicker shadow-[0_0_12px_#FFA63D]" />
            {/* Inner Core Flame */}
            <div className="w-2 h-4 bg-white rounded-full -mt-4 opacity-90 blur-[0.5px]" />
          </div>
        )}

        {/* Interactive Hotspots on Real Photography */}
        {visualHotspots.map((spot) => {
          const isActive = activeHotspot === spot.id;
          return (
            <div
              key={spot.id}
              className={`absolute ${spot.coords} -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20`}
            >
              {!isActive && (
                <span className="absolute -inset-1 rounded-full bg-white/60 animate-ping opacity-60" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(isActive ? null : spot.id);
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 text-[10px] font-bold shadow-md ${
                  isActive
                    ? "bg-[#8C7A6B] text-white ring-2 ring-white scale-110"
                    : "bg-white/90 text-[#423D33] hover:scale-110 hover:bg-white"
                }`}
                title={spot.title}
              >
                {spot.id + 1}
              </button>
            </div>
          );
        })}

        {/* Hotspot Floating Caption Box */}
        {activeHotspot !== null && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 shadow-lg z-30 animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9C5B2] flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#8C7A6B] text-white text-[8px] inline-flex items-center justify-center font-bold">
                  {activeHotspot + 1}
                </span>
                <span>{visualHotspots[activeHotspot].title}</span>
              </span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-stone-400 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-stone-200 mt-1 leading-snug">
              {visualHotspots[activeHotspot].detail}
            </p>
          </div>
        )}

        {/* Overlay Controls Bar (Flame Toggle & Crackle Sound) */}
        {interactiveControls && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            {/* Llama Toggle */}
            <button
              type="button"
              onClick={() => setIsLit(!isLit)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border transition-all cursor-pointer shadow-xs flex items-center gap-1 ${
                isLit
                  ? "bg-[#D98B68] text-white border-[#D98B68]"
                  : "bg-white/90 text-[#423D33] border-[#E5E0DA] hover:bg-white"
              }`}
              title={isLit ? "Apagar llama" : "Encender llama"}
            >
              <Flame className={`w-3 h-3 ${isLit ? "fill-white animate-pulse" : "text-[#8C7A6B]"}`} />
              <span className="hidden sm:inline">{isLit ? "Encendida" : "Apagada"}</span>
            </button>

            {/* Crackling Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-xs ${
                isPlayingAudio
                  ? "bg-[#608058] text-white border-[#608058]"
                  : "bg-white/90 text-[#423D33] border-[#E5E0DA] hover:bg-white"
              }`}
              title={isPlayingAudio ? "Silenciar sonido de mecha" : "Activar sonido crepitante"}
            >
              {isPlayingAudio ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#8C7A6B]" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* PHOTOREALISTIC WAX COLOR MINIATURE SELECTION BAR */}
      {interactiveControls && (
        <div className="w-full space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D98B68]" />
              <span>Color de Cera 2D:</span>
              <strong className="text-[#423D33] normal-case ml-1 font-semibold">
                {activeColor.name}
              </strong>
            </span>
            <span className="text-[10px] text-[#423D33]/60 italic">
              {activeColor.subtitle}
            </span>
          </div>

          {/* 5 Photorealistic Miniature Cards */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {WAX_COLOR_PRESETS.map((preset) => {
              const isSelected = preset.id === currentColorId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleColorSelect(preset)}
                  className={`group relative rounded-xl border-2 p-1 transition-all cursor-pointer flex flex-col items-center text-center bg-white shadow-2xs ${
                    isSelected
                      ? "border-[#423D33] ring-2 ring-[#423D33]/25 scale-102"
                      : "border-[#E5E0DA] hover:border-[#8C7A6B]/60 opacity-85 hover:opacity-100"
                  }`}
                  title={`${preset.name} - ${preset.subtitle}`}
                >
                  {/* Miniature frame with the real product and tinted wax preview */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#EAE4DD] border border-[#E5E0DA]">
                    {Boolean(baseImage && baseImage.trim()) && (
                      <img
                        src={baseImage}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Miniature Tint Overlay */}
                    {preset.id !== "caliza-blanca" && (
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <path
                          d="M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z"
                          fill={preset.waxOverlayColor}
                          style={{
                            mixBlendMode: preset.waxBlendMode as any,
                            opacity: preset.waxOpacity,
                          }}
                        />
                      </svg>
                    )}

                    {/* Active Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#423D33] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Label & Swatch Dot */}
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-[9px] font-bold text-[#423D33] truncate max-w-[45px]">
                      {preset.name.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Preset Description Footer */}
          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0DA] text-[11px] text-[#423D33]/80 leading-snug">
            <span className="font-semibold text-[#423D33]">{activeColor.name}: </span>
            <span>{activeColor.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};