import React, { useState } from "react";
import {
  VesselOption,
  WaxColorOption,
  WickOption,
  BotanicalOption,
  LabelStyleOption,
  WaxType,
  CandleProduct,
  SculptedFigure,
} from "../types";
import { InteractiveVisualizer2D } from "./InteractiveVisualizer2D";
import { Candle2DViewer } from "./Candle2DViewer";
import { Tag, Sparkles, Eye, RefreshCw, Volume2, Flame, Gift } from "lucide-react";

export interface VisorCustomization {
  vessel: VesselOption;
  vesselColorHex?: string;
  waxColor: WaxColorOption;
  waxType: WaxType;
  wick: WickOption;
  botanicals: BotanicalOption[];
  title: string;
  dedication: string;
  paperStyle: LabelStyleOption;
  includeGiftWrap?: boolean;
  noDedication?: boolean;
  isLit?: boolean;
  isPlayingAudio?: boolean;
  viewMode?: "top" | "front";
  selectedProduct?: CandleProduct | null;
  figure?: SculptedFigure | null;
  customLayerColors?: Record<string, string>;
}

interface VisorSidebarProps {
  currentStep: number;
  totalSteps?: number;
  customization: VisorCustomization;
  onToggleLit?: () => void;
  onToggleAudio?: () => void;
  onViewModeChange?: (mode: "top" | "front") => void;
  onStepChange?: (step: number) => void;
  className?: string;
}

export const VisorSidebar: React.FC<VisorSidebarProps> = ({
  currentStep,
  totalSteps = 6,
  customization,
  onToggleLit,
  onToggleAudio,
  onViewModeChange,
  onStepChange,
  className = "",
}) => {
  // Override to allow manually peeking 2D vs Label on any step
  const [manualMode, setManualMode] = useState<"auto" | "2d" | "label">("auto");

  // Determine active view mode: Last step defaults to label, preceding steps default to 2D
  const isLabelView =
    manualMode === "label" || (manualMode === "auto" && currentStep === totalSteps);

  const {
    vessel,
    waxColor,
    waxType,
    wick,
    botanicals,
    title,
    dedication,
    paperStyle,
    includeGiftWrap,
    noDedication,
    isLit,
    isPlayingAudio,
    viewMode,
    selectedProduct,
    figure,
    customLayerColors,
  } = customization;

  // Convert botanical options to BotanicalVisualItem format expected by visualizer
  const visualBotanicals = botanicals.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    color: b.color,
    visualType: b.visualType,
  }));

  return (
    <div
      className={`w-full flex flex-col items-center justify-start sticky top-24 space-y-4 ${className}`}
    >
      {/* Header Mode Indicator & Quick View Switcher */}
      <div className="w-full max-w-[440px] flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E5E0DA] flex items-center gap-1.5">
            {isLabelView ? (
              <>
                <Tag className="w-3 h-3 text-[#8C7A6B]" />
                <span>Vista de Etiqueta & Impresión</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-[#8C7A6B]" />
                <span>Visor 2D Interactivo de Vela</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-full border border-[#E5E0DA]">
          <button
            type="button"
            onClick={() => setManualMode("2d")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
              !isLabelView
                ? "bg-[#423D33] text-white shadow-2xs"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
            title="Ver modelo 2D de la vela"
          >
            Vela 2D
          </button>
          <button
            type="button"
            onClick={() => setManualMode("label")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
              isLabelView
                ? "bg-[#423D33] text-white shadow-2xs"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
            title="Ver tarjeta de etiqueta botánica"
          >
            Etiqueta
          </button>
          {manualMode !== "auto" && (
            <button
              type="button"
              onClick={() => setManualMode("auto")}
              className="px-1.5 py-1 text-[9px] text-[#8C7A6B] hover:text-[#423D33] transition-colors"
              title="Volver a sincronización automática por pasos"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* VIEWPORT AREA */}
      <div className="w-full flex flex-col items-center justify-center transition-all duration-300">
        {isLabelView ? (
          /* =========================================================
             PASO 5: RENDERIZADO EN TAMAÑO COMPLETO DE LA ETIQUETA
             ========================================================= */
          <div className="w-full max-w-[440px] p-6 sm:p-8 bg-white rounded-3xl border border-[#E5E0DA] shadow-lg space-y-6 animate-fade-in relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FAF7F2] rounded-full blur-2xl pointer-events-none" />

            {/* Label Card Frame */}
            <div
              className={`w-full min-h-[300px] p-6 sm:p-8 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xs ${
                paperStyle.id === "kraft"
                  ? "bg-[#D8C4B0] text-[#3D2E24] border-[#B59E87]"
                  : paperStyle.id === "lino"
                  ? "bg-[#F3EFE9] text-[#423D33] border-[#D6CECE]"
                  : paperStyle.id === "negro"
                  ? "bg-[#23201D] text-[#E5D7C2] border-[#4A433D]"
                  : "bg-[#C4A482] text-[#3B2818] border-[#9E7B5A]"
              }`}
            >
              {/* Inner Decorative Dashed Border Trim */}
              <div
                className={`absolute inset-3 rounded-xl border pointer-events-none ${
                  paperStyle.id === "negro"
                    ? "border-[#9E7B5A]/40"
                    : "border-[#8C7A6B]/40"
                } border-dashed`}
              />

              {/* Watermark / Brand Header */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-1 pt-2">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-75">
                  ayllu • cerería artesanal
                </span>
                <span className="text-[8px] tracking-widest uppercase opacity-60 font-mono">
                  edición personalizada • lote único
                </span>
              </div>

              {/* Title & Dedication Display */}
              <div className="relative z-10 py-6 my-auto flex flex-col items-center justify-center space-y-3 px-2">
                {noDedication ? (
                  <>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60">
                      Grabado Oficial
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-[0.25em] leading-tight text-center break-words max-w-full uppercase text-[#423D33]/90">
                      Ayllu
                    </h3>
                    <div className="w-16 h-px bg-current opacity-25 my-1" />
                    <span className="text-[9px] uppercase tracking-[0.2em] opacity-60 font-mono">
                      Cerería Botánica Silvestre
                    </span>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide leading-tight text-center break-words max-w-full">
                      {title || "Vela Silvestre de Luna"}
                    </h3>
                    <div className="w-12 h-px bg-current opacity-25 my-1" />
                    <p className="text-xs sm:text-sm opacity-90 italic leading-relaxed text-center break-words max-w-full font-serif px-2">
                      "{dedication || "Para iluminar tus momentos de calma y reconexión"}"
                    </p>
                  </>
                )}
              </div>

              {/* Metadata & Botanical Notes Line */}
              <div className="relative z-10 pt-4 border-t border-current/20 space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap text-[8px] tracking-wider uppercase font-mono opacity-80">
                  {figure && (
                    <>
                      <span className="font-semibold">{figure.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="font-semibold">{vessel?.name?.split(" ")[0] || "Vaso"}</span>
                  <span>•</span>
                  <span>{waxColor?.name || "Natural"}</span>
                  <span>•</span>
                  <span>{waxType || "Soja"}</span>
                  <span>•</span>
                  <span>{wick?.name?.split(" ")[0] || "Mecha"}</span>
                </div>

                {botanicals.length > 0 && (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap text-[8px] opacity-75 italic">
                    <Sparkles className="w-2.5 h-2.5 opacity-60" />
                    <span>Botánicos: {botanicals.map((b) => b.name).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Packaging Badge / Info */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA]/80 text-xs">
              <div className="flex items-center gap-2 text-[#423D33]">
                <Gift className="w-4 h-4 text-[#8C7A6B]" />
                <span className="font-medium text-xs">
                  {includeGiftWrap
                    ? "Presentación de Regalo Especial con lazo de lino"
                    : "Empaque Artesanal Sostenible en caja Kraft"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                {paperStyle.name}
              </span>
            </div>
          </div>
        ) : (
          /* =========================================================
             PASOS 1 AL 5: VISOR 2D PERSONALIZADOR DEL CLIENTE
             ========================================================= */
          <Candle2DViewer
            candle={selectedProduct}
            figure={figure}
            vessel={vessel}
            vesselImage={vessel?.image}
            vesselColorHex={
              customization.vesselColorHex ||
              customization.vessel?.defaultColorHex ||
              customization.vessel?.color
            }
            backgroundImage={
              selectedProduct?.backgroundImage ||
              customization.vessel?.backgroundImage ||
              figure?.backgroundImage ||
              ""
            }
            backgroundOpacity={
              selectedProduct?.backgroundOpacity ??
              customization.vessel?.backgroundOpacity ??
              figure?.backgroundOpacity ??
              1
            }
            layers2D={
              selectedProduct?.layers2D && selectedProduct.layers2D.length > 0
                ? selectedProduct.layers2D
                : figure?.layers2D && figure.layers2D.length > 0
                ? figure.layers2D
                : customization.vessel?.layers2D && customization.vessel.layers2D.length > 0
                ? customization.vessel.layers2D
                : (vessel?.layers2D || [])
            }
            customLayerColors={customLayerColors}
            selectedWaxColorHex={waxColor.hex}
            selectedWaxColorName={waxColor.name}
            selectedWaxType={waxType}
            isLit={isLit}
            onToggleLit={onToggleLit}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={onToggleAudio}
            wickX={selectedProduct?.wickX ?? figure?.wickX ?? vessel?.wickX ?? 31}
            wickY={selectedProduct?.wickY ?? figure?.wickY ?? vessel?.wickY ?? 59}
            wickType={wick.type}
            botanicals={visualBotanicals}
            botanicalsX={selectedProduct?.botanicalsX ?? figure?.botanicalsX ?? vessel?.botanicalsX ?? 31}
            botanicalsY={selectedProduct?.botanicalsY ?? figure?.botanicalsY ?? vessel?.botanicalsY ?? 67}
            botanicalsRadius={selectedProduct?.botanicalsRadius ?? figure?.botanicalsRadius ?? vessel?.botanicalsRadius ?? 11}
            labelTitle={title}
            labelSubtitle={dedication}
            labelStyle={paperStyle}
            currentStep={currentStep}
            showControls={true}
            showColorSwatches={false}
            className="w-full flex flex-col items-center"
          />
        )}
      </div>

      {/* Subtle Step Hint */}
      <p className="text-[11px] text-[#8C7A6B] text-center max-w-[380px] px-2 leading-relaxed">
        {currentStep === 1 && "💡 Paso 1: Elige la escultura o figura botánica que dará relieve a tu vela."}
        {currentStep === 2 && "💡 Paso 2: Ajusta el tono mineral en tiempo real para cada capa de cera del relieve."}
        {currentStep === 3 && "💡 Paso 3: Personaliza el color del envase (frasco) con los tonos permitidos."}
        {currentStep === 4 && "💡 Paso 4: Selecciona la esencia aromática y los toppings botánicos secos."}
        {currentStep === 5 && "💡 Paso 5: La etiqueta se imprimirá en papel texturado con tu dedicatoria especial."}
      </p>
    </div>
  );
};
