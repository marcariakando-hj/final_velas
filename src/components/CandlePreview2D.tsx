import React from "react";
import { Layer2D } from "../types";
import { LayerStackRenderer } from "./LayerStackRenderer";
import { Layers, Flower2, Upload } from "lucide-react";

export interface BotanicalVisualItem {
  id?: string;
  name: string;
  color?: string;
  category?: string;
  visualType?: string;
}

export interface CandlePreview2DProps {
  /** Lista de capas 2D ordenadas y configuradas */
  layers: Layer2D[];
  /** Fotografía o fondo opcional para el marco 4:5 */
  backgroundImage?: string;
  /** Opacidad del fondo (0 a 1) */
  backgroundOpacity?: number;
  /** Mapa de colores asignados por ID de capa (para capas colorables) */
  customLayerColors?: Record<string, string>;
  /** Color hexadecimal por defecto de la cera */
  selectedWaxColorHex?: string;

  /** Coordenadas relativas de la mecha (0 a 100%) */
  wickX?: number;
  wickY?: number;
  /** Tipo de mecha: algodón o madera */
  wickType?: "cotton" | "wood" | "algodon" | "madera";
  /** Estado de encendido de la llama */
  isLit?: boolean;

  /** Coordenadas y radio relativo del lecho de botánicos (0 a 100%) */
  botanicalsX?: number;
  botanicalsY?: number;
  botanicalsRadius?: number;
  /** Lista de botánicos seleccionados para renderizar sus flores secas sobre el lecho */
  botanicals?: BotanicalVisualItem[];
  /** Si es true, dibuja la zona punteada con el icono en el editor del administrador */
  showBotanicalsArea?: boolean;
  /** Si es true, muestra guías de edición (círculos punteados, handles, rings de capa activa). En false, muestra la vista limpia final */
  showGuides?: boolean;

  /** Imagen fallback en caso de que layers esté vacío */
  fallbackImage?: string;
  /** Mensaje si no hay capas ni imágenes */
  emptyMessage?: string;

  /** Clases CSS */
  className?: string;
  canvasClassName?: string;
  stageClassName?: string;
  heightClass?: string;

  /** Props de interacción para el modo Administrador */
  stageRef?: React.Ref<HTMLDivElement>;
  canvasRef?: React.Ref<HTMLDivElement>;
  activeLayerId?: string | null;
  draggingLayerId?: string | null;
  onLayerPointerDown?: (e: React.PointerEvent, layerId: string) => void;
  interactiveClickMode?: "none" | "wick" | "botanicals" | "layer" | string;
  onInteractiveClickModeClose?: () => void;
  onCanvasClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCanvasDragOver?: (e: React.DragEvent) => void;
  onCanvasDragLeave?: (e: React.DragEvent) => void;
  onCanvasDrop?: (e: React.DragEvent) => void;
  isCanvasDragOver?: boolean;
  activeLayerName?: string;
  canvasTitle?: string;

  /** Overlays o elementos adicionales dentro del marco canónico 4:5 */
  children?: React.ReactNode;
}

/**
 * CandlePreview2D
 * Componente unificado y canónico de previsualización 2D.
 * Compartido de manera idéntica entre el Administrador y el Cliente.
 * Asegura que cualquier cambio en layers2D, escala, posición, fondo,
 * mecha o botánicos se refleje con 100% de paridad visual exacta.
 */
export const CandlePreview2D: React.FC<CandlePreview2DProps> = ({
  layers,
  backgroundImage,
  backgroundOpacity = 1,
  customLayerColors = {},
  selectedWaxColorHex = "#FAF7F2",
  wickX = 31,
  wickY = 59,
  wickType = "cotton",
  isLit = false,
  botanicalsX = 31,
  botanicalsY = 67,
  botanicalsRadius = 11,
  botanicals = [],
  showBotanicalsArea = false,
  showGuides = false,
  fallbackImage,
  emptyMessage = "Sin capas configuradas",
  className = "relative w-full flex items-center justify-center select-none",
  canvasClassName = "",
  stageClassName = "",
  heightClass = "w-full max-w-[380px] aspect-[4/5] mx-auto",
  stageRef,
  canvasRef,
  activeLayerId = null,
  draggingLayerId = null,
  onLayerPointerDown,
  interactiveClickMode = "none",
  onInteractiveClickModeClose,
  onCanvasClick,
  onCanvasDragOver,
  onCanvasDragLeave,
  onCanvasDrop,
  isCanvasDragOver = false,
  activeLayerName,
  canvasTitle,
  children,
}) => {
  const isWoodWick = wickType === "wood" || wickType === "madera";
  const hasLayers = layers && layers.length > 0;
  const hasBackground = Boolean(backgroundImage && backgroundImage.trim());
  const hasFallback = Boolean(fallbackImage && fallbackImage.trim());

  // Clamped coordinates
  const safeWickX = Number.isFinite(wickX) ? wickX : 31;
  const safeWickY = Number.isFinite(wickY) ? wickY : 59;
  const safeBotanicalsX = Number.isFinite(botanicalsX) ? botanicalsX : 31;
  const safeBotanicalsY = Number.isFinite(botanicalsY) ? botanicalsY : 67;
  const safeBotanicalsRadius = Number.isFinite(botanicalsRadius) ? botanicalsRadius : 11;

  const isInteractive = Boolean(onLayerPointerDown || onCanvasClick || onCanvasDrop);

  return (
    <div className={className} data-testid="candle-preview-2d-root">
      {/* Contenedor Canvas Externo con bordes redondeados y soporte Drag & Drop */}
      <div
        ref={canvasRef}
        onClick={onCanvasClick}
        onDragOver={onCanvasDragOver}
        onDragLeave={onCanvasDragLeave}
        onDrop={onCanvasDrop}
        className={`relative w-full ${heightClass} bg-white rounded-2xl p-4 flex items-center justify-center overflow-hidden select-none border transition-all ${
          interactiveClickMode && interactiveClickMode !== "none"
            ? "cursor-crosshair ring-2 ring-[#8C7A6B] border-[#8C7A6B]"
            : isCanvasDragOver
            ? "ring-4 ring-[#8C7A6B] border-[#8C7A6B] bg-[#FAF7F2]"
            : draggingLayerId
            ? "cursor-grabbing border-[#D98B68] ring-1 ring-[#D98B68]/40"
            : isInteractive
            ? "border-[#E5E0DA] hover:border-[#8C7A6B]"
            : "border-[#E5E0DA]"
        } ${canvasClassName}`}
        title={canvasTitle}
        data-testid="candle-preview-2d-canvas"
      >
        {/* Overlay cuando se arrastra un archivo sobre el canvas (Modo Admin) */}
        {isCanvasDragOver && (
          <div className="absolute inset-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-xs flex flex-col items-center justify-center border-2 border-dashed border-[#8C7A6B] rounded-2xl m-2 text-center p-4 pointer-events-none animate-fade-in">
            <Upload className="w-10 h-10 text-[#8C7A6B] animate-bounce mb-2" />
            <span className="font-bold text-sm text-[#423D33]">
              Suelta el PNG transparente aquí
            </span>
            <span className="text-xs text-[#8C7A6B] mt-1">
              Se asignará automáticamente a: "{activeLayerName || "Capa"}"
            </span>
          </div>
        )}

        {/* Banner de Modo Clic Interactivo (Modo Admin) */}
        {interactiveClickMode && interactiveClickMode !== "none" && (
          <div className="absolute top-2 inset-x-2 z-40 bg-[#4A4541]/90 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center justify-between backdrop-blur-xs shadow-md">
            <span>
              {interactiveClickMode === "wick" && "Haz clic donde debe ubicarse la MECHA"}
              {interactiveClickMode === "botanicals" && "Haz clic en el centro de los BOTÁNICOS"}
              {interactiveClickMode === "layer" && "Haz clic para posicionar la CAPA SELECCIONADA"}
            </span>
            {onInteractiveClickModeClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteractiveClickModeClose();
                }}
                className="text-white hover:text-stone-300 ml-2 cursor-pointer p-0.5"
                title="Cerrar modo interactivo"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Halo de luz ambiente en toda la escena cuando la vela está encendida */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: isLit
              ? "radial-gradient(ellipse at 50% 50%, rgba(255, 238, 205, 0.45) 0%, rgba(250, 247, 242, 0.85) 75%)"
              : "transparent",
            opacity: isLit ? 1 : 0,
          }}
        />

        {/* 1. RENDERIZADOR CANÓNICO DE CAPAS EN MARCO 4:5 */}
        {hasLayers || hasBackground ? (
          <LayerStackRenderer
            layers={layers}
            backgroundImage={backgroundImage}
            backgroundOpacity={backgroundOpacity}
            customLayerColors={customLayerColors}
            selectedWaxColorHex={selectedWaxColorHex}
            activeLayerId={activeLayerId}
            draggingLayerId={draggingLayerId}
            onLayerPointerDown={onLayerPointerDown}
            interactiveClickMode={interactiveClickMode}
            showGuides={showGuides}
            stageRef={stageRef}
            className="relative w-full h-full flex items-center justify-center"
            stageClassName={stageClassName}
          >
            {/* A. Área de Botánicos - Modo Editor Administrador (Guía punteada) - Sólo si showGuides está activo */}
            {showGuides && showBotanicalsArea && (
              <div
                className="absolute pointer-events-none z-20 border-2 border-dashed border-[#8C7A6B]/60 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  top: `${safeBotanicalsY}%`,
                  left: `${safeBotanicalsX}%`,
                  width: `${safeBotanicalsRadius * 2.2}%`,
                  height: `${safeBotanicalsRadius * 1.8}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(140, 122, 107, 0.12)",
                }}
                title={`Zona de botánicos (${safeBotanicalsX}%, ${safeBotanicalsY}%)`}
              >
                <Flower2 className="w-4 h-4 text-[#8C7A6B]/80 animate-pulse" />
              </div>
            )}

            {/* B. Botánicos Secos (Dispersos sobre el lecho de cera) - se muestran en la composición limpia */}
            {(!showGuides || !showBotanicalsArea) && botanicals && botanicals.length > 0 && (
              <div
                className="absolute pointer-events-none z-20 transition-all duration-500"
                style={{
                  top: `${safeBotanicalsY}%`,
                  left: `${safeBotanicalsX}%`,
                  width: `${safeBotanicalsRadius * 2.2}%`,
                  height: `${safeBotanicalsRadius * 1.8}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {botanicals.map((bot, i) => {
                  const total = Math.max(1, botanicals.length);
                  const angle = (i / total) * Math.PI * 2;
                  const dist = 32 + ((i * 19) % 24);
                  const xOff = Math.cos(angle) * dist;
                  const yOff = Math.sin(angle) * (dist * 0.7);
                  return (
                    <div
                      key={bot.id || `${bot.name}-${i}`}
                      className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/10 shadow-xs transition-all duration-500"
                      style={{
                        backgroundColor: bot.color || "#9B88A8",
                        top: `calc(50% + ${yOff}%)`,
                        left: `calc(50% + ${xOff}%)`,
                        transform: `translate(-50%, -50%) scale(${0.8 + ((i % 3) * 0.2)})`,
                        opacity: 0.88,
                      }}
                      title={bot.name}
                    />
                  );
                })}
              </div>
            )}

            {/* C. Resplandor cálido directo de la llama */}
            {isLit && (
              <div
                className="absolute pointer-events-none transition-all duration-700 animate-pulse z-20"
                style={{
                  top: `${safeWickY - 4}%`,
                  left: `${safeWickX}%`,
                  transform: "translate(-50%, -50%)",
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 214, 138, 0.48) 0%, rgba(255, 140, 66, 0.22) 45%, rgba(255, 255, 255, 0) 75%)",
                  filter: "blur(10px)",
                }}
              />
            )}

            {/* D. Mecha y Llama (Posicionada exactamente en wickX%, wickY%) */}
            <div
              className="absolute pointer-events-none z-30 flex flex-col items-center"
              style={{
                top: `${safeWickY}%`,
                left: `${safeWickX}%`,
                transform: "translate(-50%, -100%)",
              }}
              title={`Mecha (${safeWickX}%, ${safeWickY}%)`}
            >
              {isLit ? (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-7 sm:w-5 sm:h-8 bg-gradient-to-t from-[#FF6B2B] via-[#FFA63D] to-[#FFF4D0] rounded-full blur-[0.6px] animate-flame-flicker shadow-[0_0_12px_#FFA63D]" />
                  <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-white rounded-full -mt-3.5 opacity-90 blur-[0.3px]" />
                  {isWoodWick ? (
                    <div className="w-2 h-2.5 bg-[#422513] rounded-xs mt-0.5" />
                  ) : (
                    <div className="w-1 h-2 bg-[#1E1A17] rounded-full mt-0.5" />
                  )}
                </div>
              ) : isWoodWick ? (
                <div className="w-2.5 h-3.5 bg-[#5C4033] rounded-xs border-b border-[#3D2817] shadow-xs" />
              ) : (
                <div className="w-1 h-3 bg-[#423D33] rounded-full" />
              )}
            </div>

            {/* Overlays adicionales pasados como children */}
            {children}
          </LayerStackRenderer>
        ) : hasFallback ? (
          /* Marco 4:5 para imagen fallback si no hay capas ni fondo */
          <div className="relative w-full h-full aspect-[4/5] flex items-center justify-center mx-auto select-none">
            <img
              src={fallbackImage}
              alt="Vista previa vela"
              referrerPolicy="no-referrer"
              className="object-contain max-h-full max-w-full m-auto pointer-events-none select-none"
            />
            {children}
          </div>
        ) : (
          /* Estado vacío si no hay capas ni recursos */
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none text-center p-4 text-[#8C7A6B]">
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <Layers className="w-8 h-8 mx-auto mb-1" />
              <span className="text-xs">{emptyMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
