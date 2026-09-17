import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Info,
  Check,
  Eye,
  RotateCcw,
  Maximize2,
  Tag,
  PenTool,
  Flower2,
  CheckCircle2,
} from "lucide-react";
import { CandleProduct, Layer2D, SculptedFigure, VesselOption } from "../types";
import { woodSoundEngine } from "../utils/audioSynth";
import zorroImg from "../assets/images/zorro_exact.jpg";
import { SingleLayerRenderer } from "./SingleLayerRenderer";
import { LayerStackRenderer } from "./LayerStackRenderer";
import { CandlePreview2D } from "./CandlePreview2D";

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
    name: "Arena Suave",
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
    name: "Carbón Nórdico",
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
    name: "Terracota Cálida",
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
    name: "Ámbar Miel",
    subtitle: "Dorado resinoso otoñal",
    hex: "#D49B55",
    borderHex: "#B87F3B",
    shadowHex: "rgba(184, 127, 59, 0.45)",
    description: "Destellos ambarinos y dorados que multiplican la calidez del resplandor y la atmósfera.",
    waxOverlayColor: "#D19145",
    waxBlendMode: "multiply",
    waxOpacity: 0.7,
  },
];

export interface Candle2DViewerProps {
  candle?: CandleProduct | null;
  figure?: SculptedFigure | null;
  vessel?: VesselOption | { name: string; image?: string; color?: string; material?: string } | null;
  vesselImage?: string;
  vesselColorHex?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  layers2D?: Layer2D[];
  customLayerColors?: Record<string, string>;
  selectedWaxColorHex?: string;
  selectedWaxColorName?: string;
  selectedWaxType?: string;
  onWaxColorChange?: (preset: WaxColorPreset) => void;
  isLit?: boolean;
  onToggleLit?: () => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
  wickX?: number;
  wickY?: number;
  wickType?: string;
  botanicals?: any[];
  botanicalsX?: number;
  botanicalsY?: number;
  botanicalsRadius?: number;
  labelTitle?: string;
  labelSubtitle?: string;
  labelStyle?: any;
  currentStep?: number;
  showControls?: boolean;
  showColorSwatches?: boolean;
  showHotspots?: boolean;
  className?: string;
}

export const Candle2DViewer: React.FC<Candle2DViewerProps> = ({
  candle,
  figure,
  vessel,
  vesselImage,
  vesselColorHex,
  backgroundImage,
  backgroundOpacity,
  layers2D: explicitLayers,
  customLayerColors = {},
  selectedWaxColorHex = "#FAF7F2",
  selectedWaxColorName = "Caliza Blanca",
  selectedWaxType = "Soja",
  onWaxColorChange,
  isLit: externalIsLit,
  onToggleLit,
  isPlayingAudio: externalIsPlayingAudio,
  onToggleAudio,
  wickX: explicitWickX,
  wickY: explicitWickY,
  wickType: explicitWickType,
  botanicals = [],
  botanicalsX: explicitBotanicalsX,
  botanicalsY: explicitBotanicalsY,
  botanicalsRadius: explicitBotanicalsRadius,
  labelTitle = "",
  labelSubtitle = "",
  labelStyle,
  currentStep,
  showControls = true,
  showColorSwatches = true,
  showHotspots = false,
  className = "",
}) => {
  // Local state fallbacks if not controlled from parent
  const [internalIsLit, setInternalIsLit] = useState<boolean>(true);
  const [internalIsPlayingAudio, setInternalIsPlayingAudio] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"candle" | "label">("candle");
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const [activePresetId, setActivePresetId] = useState<string>(() => {
    const found = WAX_COLOR_PRESETS.find(
      (p) => p.hex.toLowerCase() === selectedWaxColorHex.toLowerCase()
    );
    return found ? found.id : "caliza-blanca";
  });

  // Switch to label mode if currently on step 6 of 6-step customizer
  useEffect(() => {
    if (currentStep === 6) {
      setViewMode("label");
    } else if (currentStep && currentStep <= 5) {
      setViewMode("candle");
    }
  }, [currentStep]);

  // Sync active preset when selectedWaxColorHex prop updates
  useEffect(() => {
    const found = WAX_COLOR_PRESETS.find(
      (p) => p.hex.toLowerCase() === selectedWaxColorHex.toLowerCase()
    );
    if (found) setActivePresetId(found.id);
  }, [selectedWaxColorHex]);

  const isLit = externalIsLit !== undefined ? externalIsLit : internalIsLit;
  const isPlayingAudio =
    externalIsPlayingAudio !== undefined ? externalIsPlayingAudio : internalIsPlayingAudio;

  const toggleLit = () => {
    if (onToggleLit) {
      onToggleLit();
    } else {
      setInternalIsLit((prev) => !prev);
    }
  };

  const toggleSound = () => {
    if (onToggleAudio) {
      onToggleAudio();
    } else {
      if (internalIsPlayingAudio) {
        woodSoundEngine.stop();
        setInternalIsPlayingAudio(false);
      } else {
        woodSoundEngine.start();
        setInternalIsPlayingAudio(true);
      }
    }
  };

  const handleColorPresetClick = (preset: WaxColorPreset) => {
    setActivePresetId(preset.id);
    if (onWaxColorChange) {
      onWaxColorChange(preset);
    }
  };

  // Determine effective layers: explicit layers > candle layers (configured by admin) > figure layers
  const effectiveLayers: Layer2D[] =
    explicitLayers && explicitLayers.length > 0
      ? explicitLayers
      : candle?.layers2D && candle.layers2D.length > 0
      ? candle.layers2D
      : figure?.layers2D && figure.layers2D.length > 0
      ? figure.layers2D
      : [];

  // Sort layers strictly and stably by zIndex ascending with id tie-breaking
  const sortedLayers = useMemo(() => {
    return [...effectiveLayers].sort((a, b) => {
      const za = a.zIndex ?? 0;
      const zb = b.zIndex ?? 0;
      if (za !== zb) return za - zb;
      return (a.id || "").localeCompare(b.id || "");
    });
  }, [effectiveLayers]);

  // Vessel and figure image fallbacks
  const effectiveBackgroundImage =
    backgroundImage !== undefined && backgroundImage !== ""
      ? backgroundImage
      : candle?.backgroundImage !== undefined && candle?.backgroundImage !== ""
      ? candle.backgroundImage
      : figure?.backgroundImage !== undefined && figure?.backgroundImage !== ""
      ? figure.backgroundImage
      : "";
  const effectiveBackgroundOpacity =
    backgroundOpacity ??
    candle?.backgroundOpacity ??
    figure?.backgroundOpacity ??
    1;
  const effectiveVesselImage =
    vesselImage || vessel?.image || vessel?.base2DImage || "";

  // Vessel 2D properties
  const vesselObj = vessel as VesselOption | undefined;
  const effectiveFigureImage =
    figure?.image || figure?.base2DImage || candle?.custom2DImageUrl || candle?.base2DImage || candle?.image || "";

  // Base fallback image if no layers configured
  const baseImage =
    candle?.custom2DImageUrl ||
    candle?.base2DImage ||
    candle?.mainImage ||
    candle?.image ||
    zorroImg;

  // Anchor Coordinates
  const effectiveWickX =
    explicitWickX ??
    candle?.wickX ??
    figure?.wickX ??
    candle?.customizer2DConfig?.wickX ??
    31;
  const effectiveWickY =
    explicitWickY ??
    candle?.wickY ??
    figure?.wickY ??
    candle?.customizer2DConfig?.wickY ??
    59;
  const effectiveBotanicalsX =
    explicitBotanicalsX ??
    candle?.botanicalsX ??
    figure?.botanicalsX ??
    candle?.customizer2DConfig?.botanicalsX ??
    31;
  const effectiveBotanicalsY =
    explicitBotanicalsY ??
    candle?.botanicalsY ??
    figure?.botanicalsY ??
    candle?.customizer2DConfig?.botanicalsY ??
    67;
  const effectiveBotanicalsRadius =
    explicitBotanicalsRadius ??
    candle?.botanicalsRadius ??
    figure?.botanicalsRadius ??
    candle?.customizer2DConfig?.botanicalsRadius ??
    11;
  const effectiveWaxMask =
    candle?.waxMaskPolygon ||
    figure?.waxMaskPolygon ||
    candle?.customizer2DConfig?.waxMaskPolygon ||
    "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z";

  const effectiveWaxColorHex = selectedWaxColorHex || "#FAF7F2";
  const isPureWhite =
    effectiveWaxColorHex.toLowerCase() === "#faf7f2" ||
    effectiveWaxColorHex.toLowerCase() === "#ffffff" ||
    activePresetId === "caliza-blanca";

  // Hotspots definitions
  const visualHotspots = [
    {
      id: 0,
      title: explicitWickType || candle?.wickType || "Mecha de Algodón Puro",
      detail: "Mecha ecológica libre de plomo para una llama limpia, silenciosa y constante.",
      coords: `top-[${effectiveWickY}%] left-[${effectiveWickX}%]`,
    },
    {
      id: 1,
      title: figure?.name || candle?.name || "Figura Esculpida 2D",
      detail: "Figura botánica modelada artesanalmente en cera pura y curada en frío.",
      coords: "top-[42%] left-[68%]",
    },
    {
      id: 2,
      title: vessel?.name || candle?.vesselName || "Vaso de Vidrio Artesanal",
      detail: "Contenedor resistente a altas temperaturas, 100% reutilizable.",
      coords: "top-[78%] left-[30%]",
    },
  ];

  return (
    <div
      className={`relative flex flex-col items-center justify-start space-y-3.5 w-full max-w-[380px] mx-auto select-none ${className}`}
      id="candle-2d-viewer-container"
    >
      {/* Top Header: View Switcher (Candle vs Label) & Controls */}
      <div className="w-full flex items-center justify-between px-1">
        {/* View Mode Toggle Pill */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E0DA] shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("candle")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "candle"
                ? "bg-[#4A4541] text-white shadow-2xs"
                : "text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Vela 2D</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("label")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "label"
                ? "bg-[#8C7A6B] text-white shadow-2xs"
                : "text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Etiqueta</span>
          </button>
        </div>

        {/* Flame & Audio controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isPlayingAudio
                ? "bg-[#D98B68] text-white border-[#D98B68]"
                : "bg-white text-[#423D33] border-[#E5E0DA] hover:bg-stone-100"
            }`}
            title={isPlayingAudio ? "Silenciar crepitar" : "Reproducir crepitar de madera"}
          >
            {isPlayingAudio ? (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleLit}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isLit
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-stone-600 border-[#E5E0DA] hover:bg-stone-100"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isLit ? "text-amber-600 fill-amber-500 animate-bounce" : ""}`} />
            <span>{isLit ? "Encendida" : "Apagada"}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: CANDLE COMPOSITE (Steps 1 to 5) - Canonical CandlePreview2D Direct */}
      {viewMode === "candle" ? (
        <CandlePreview2D
          layers={effectiveLayers}
          backgroundImage={effectiveBackgroundImage}
          backgroundOpacity={effectiveBackgroundOpacity}
          customLayerColors={customLayerColors}
          selectedWaxColorHex={selectedWaxColorHex}
          wickX={effectiveWickX}
          wickY={effectiveWickY}
          wickType={explicitWickType || "cotton"}
          isLit={isLit}
          botanicalsX={effectiveBotanicalsX}
          botanicalsY={effectiveBotanicalsY}
          botanicalsRadius={effectiveBotanicalsRadius}
          botanicals={botanicals}
          showBotanicalsArea={false}
          showGuides={false}
          fallbackImage={effectiveFigureImage || baseImage}
          emptyMessage="Sin capas configuradas"
        />
      ) : (
        /* VIEW MODE 2: STEP 6 ARTISANAL PRINTED LABEL PREVIEW */
        <div className="relative w-full max-w-[380px] aspect-[4/5] mx-auto bg-white rounded-2xl p-4 flex items-center justify-center overflow-hidden select-none border border-[#E5E0DA] shadow-xs animate-fade-in">
          <div
            className={`w-full max-w-[320px] p-6 rounded-2xl shadow-xl border-2 text-center transition-all duration-500 relative ${
              labelStyle?.borderClass || "border-[#8C7A6B]"
            } ${labelStyle?.bgClass || "bg-[#FAF7F2] text-[#423D33]"}`}
          >
            {/* Embossed Corner Flourish */}
            <div className="absolute top-2 left-2 text-[10px] opacity-40">❧</div>
            <div className="absolute top-2 right-2 text-[10px] opacity-40">☙</div>
            <div className="absolute bottom-2 left-2 text-[10px] opacity-40">❧</div>
            <div className="absolute bottom-2 right-2 text-[10px] opacity-40">☙</div>

            <div className="space-y-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest uppercase opacity-70 block">
                  AYLLU BOTANICAL CANDLE STUDIO
                </span>
                <div className="w-12 h-[1px] bg-current mx-auto opacity-30 my-1" />
              </div>

              {/* Customized Title */}
              <h4 className="font-serif text-xl font-bold tracking-tight px-2 leading-tight">
                {labelTitle || candle?.name || "Vela Botánica Artesanal"}
              </h4>

              {/* Formula & Wax specs */}
              <p className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">
                Cera 100% {selectedWaxType} • Tono {selectedWaxColorName}
              </p>

              {/* Personal Dedication / Subtitle */}
              {labelSubtitle && (
                <div className="pt-2 border-t border-current/20">
                  <p className="text-xs italic opacity-90 px-3 font-serif">
                    "{labelSubtitle}"
                  </p>
                </div>
              )}

              {/* Footer seal */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] opacity-60">
                <span>Edición Limitada</span>
                <span>•</span>
                <span>Curado Botánico</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar: Wax specs & step indicator */}
      <div className="w-full flex items-center justify-between px-1 text-[11px] text-[#8C7A6B]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0"
            style={{ backgroundColor: effectiveWaxColorHex }}
          />
          <span className="font-medium text-[#423D33]">{selectedWaxColorName}</span>
          <span>•</span>
          <span>{selectedWaxType}</span>
        </div>
        {currentStep && (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FAF7F2] border border-[#E5E0DA] rounded-md text-[#423D33]">
            Paso {currentStep}/6
          </span>
        )}
      </div>

      {/* COLOR SWATCHES BAR (Interactive wax color picker for Step 3 or fast testing) */}
      {showColorSwatches && (
        <div className="w-full bg-white p-3 rounded-2xl border border-[#E5E0DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#423D33] flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full border shadow-2xs"
                style={{ backgroundColor: effectiveWaxColorHex }}
              />
              <span>Tono de Cera: {selectedWaxColorName}</span>
            </span>
            <span className="text-[10px] text-[#8C7A6B]">
              {WAX_COLOR_PRESETS.find((p) => p.id === activePresetId)?.subtitle}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {WAX_COLOR_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleColorPresetClick(preset)}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/50 shadow-xs"
                      : "bg-white border-[#E5E0DA] hover:bg-stone-50"
                  }`}
                  title={`${preset.name} - ${preset.subtitle}`}
                >
                  <span
                    className="w-5 h-5 rounded-full mx-auto block border shadow-2xs transition-transform hover:scale-110"
                    style={{
                      backgroundColor: preset.hex,
                      borderColor: preset.borderHex,
                    }}
                  />
                  <span className="text-[9px] font-semibold text-[#423D33] block mt-1 truncate">
                    {preset.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
