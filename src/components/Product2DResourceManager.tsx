import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Sparkles,
  Flame,
  Flower2,
  Check,
  Crosshair,
  Sliders,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";
import { WAX_COLOR_PRESETS } from "./CandleVisualizer2D";
import { ImageUploadField } from "./ImageUploadField";

export interface Product2DResources {
  base2DImage: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  waxMaskPolygon: string;
  wickX: number; // %
  wickY: number; // %
  botanicalsX: number; // %
  botanicalsY: number; // %
  botanicalsRadius: number; // %
}

interface Product2DResourceManagerProps {
  initialResources: Partial<Product2DResources>;
  fallbackImage: string;
  onChange: (resources: Product2DResources) => void;
}

const WAX_PRESETS = [
  {
    name: "Vaso de Cristal Lateral (Santuario / Virgen / Zorro)",
    path: "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
    wickX: 31,
    wickY: 59,
    botanicalsX: 31,
    botanicalsY: 67,
    botanicalsRadius: 11,
    description: "Composición de estudio con vaso en cuadrante inferior izquierdo y figura a la derecha.",
  },
  {
    name: "Vaso Frontal Centrado Simétrico",
    path: "M 26 56 Q 50 60 74 56 L 71 77 Q 50 81 29 77 Z",
    wickX: 50,
    wickY: 55,
    botanicalsX: 50,
    botanicalsY: 66,
    botanicalsRadius: 16,
    description: "Para tomas frontales simétricas con vaso en el tercio inferior central.",
  },
  {
    name: "Vaso Base Amplia / Cuenco",
    path: "M 18 50 Q 50 54 82 50 L 78 88 Q 50 92 22 88 Z",
    wickX: 50,
    wickY: 48,
    botanicalsX: 50,
    botanicalsY: 69,
    botanicalsRadius: 22,
    description: "Para velas de diámetro ancho o formato bowl.",
  },
  {
    name: "Vaso Cilíndrico Delgado / Tubo",
    path: "M 32 55 Q 50 58 68 55 L 66 84 Q 50 87 34 84 Z",
    wickX: 50,
    wickY: 54,
    botanicalsX: 50,
    botanicalsY: 69,
    botanicalsRadius: 12,
    description: "Para recipientes altos y estrechos.",
  },
];

export const Product2DResourceManager: React.FC<Product2DResourceManagerProps> = ({
  initialResources,
  fallbackImage,
  onChange,
}) => {
  const [base2DImage, setBase2DImage] = useState<string>(
    initialResources.base2DImage || fallbackImage || ""
  );
  const [waxMaskPolygon, setWaxMaskPolygon] = useState<string>(
    initialResources.waxMaskPolygon || WAX_PRESETS[0].path
  );
  const [wickX, setWickX] = useState<number>(initialResources.wickX ?? 31);
  const [wickY, setWickY] = useState<number>(initialResources.wickY ?? 59);
  const [botanicalsX, setBotanicalsX] = useState<number>(
    initialResources.botanicalsX ?? 31
  );
  const [botanicalsY, setBotanicalsY] = useState<number>(
    initialResources.botanicalsY ?? 67
  );
  const [botanicalsRadius, setBotanicalsRadius] = useState<number>(
    initialResources.botanicalsRadius ?? 11
  );

  // Editor Interaction State
  const [activeClickTarget, setActiveClickTarget] = useState<
    "wick" | "botanicals" | "none"
  >("none");
  const [testColorId, setTestColorId] = useState<string>("carbon");
  const [activeTab, setActiveTab] = useState<"presets" | "anchors" | "code">("presets");

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Sync state whenever props change
  useEffect(() => {
    if (initialResources.base2DImage) setBase2DImage(initialResources.base2DImage);
    if (initialResources.waxMaskPolygon) setWaxMaskPolygon(initialResources.waxMaskPolygon);
    if (initialResources.wickX !== undefined) setWickX(initialResources.wickX);
    if (initialResources.wickY !== undefined) setWickY(initialResources.wickY);
    if (initialResources.botanicalsX !== undefined) setBotanicalsX(initialResources.botanicalsX);
    if (initialResources.botanicalsY !== undefined) setBotanicalsY(initialResources.botanicalsY);
    if (initialResources.botanicalsRadius !== undefined)
      setBotanicalsRadius(initialResources.botanicalsRadius);
  }, [initialResources]);

  // Propagate changes upwards
  const notifyChanges = (updated: Partial<Product2DResources>) => {
    const current: Product2DResources = {
      base2DImage: updated.base2DImage !== undefined ? updated.base2DImage : base2DImage,
      waxMaskPolygon:
        updated.waxMaskPolygon !== undefined ? updated.waxMaskPolygon : waxMaskPolygon,
      wickX: updated.wickX !== undefined ? updated.wickX : wickX,
      wickY: updated.wickY !== undefined ? updated.wickY : wickY,
      botanicalsX:
        updated.botanicalsX !== undefined ? updated.botanicalsX : botanicalsX,
      botanicalsY:
        updated.botanicalsY !== undefined ? updated.botanicalsY : botanicalsY,
      botanicalsRadius:
        updated.botanicalsRadius !== undefined
          ? updated.botanicalsRadius
          : botanicalsRadius,
    };
    onChange(current);
  };

  const handleApplyPreset = (preset: typeof WAX_PRESETS[0]) => {
    setWaxMaskPolygon(preset.path);
    setWickX(preset.wickX);
    setWickY(preset.wickY);
    setBotanicalsX(preset.botanicalsX);
    setBotanicalsY(preset.botanicalsY);
    setBotanicalsRadius(preset.botanicalsRadius);
    notifyChanges({
      waxMaskPolygon: preset.path,
      wickX: preset.wickX,
      wickY: preset.wickY,
      botanicalsX: preset.botanicalsX,
      botanicalsY: preset.botanicalsY,
      botanicalsRadius: preset.botanicalsRadius,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeClickTarget === "none" || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(0, Math.min(100, clickX));
    const clampedY = Math.max(0, Math.min(100, clickY));

    if (activeClickTarget === "wick") {
      setWickX(clampedX);
      setWickY(clampedY);
      notifyChanges({ wickX: clampedX, wickY: clampedY });
      setActiveClickTarget("none");
    } else if (activeClickTarget === "botanicals") {
      setBotanicalsX(clampedX);
      setBotanicalsY(clampedY);
      notifyChanges({ botanicalsX: clampedX, botanicalsY: clampedY });
      setActiveClickTarget("none");
    }
  };

  const activeColorPreset =
    WAX_COLOR_PRESETS.find((p) => p.id === testColorId) || WAX_COLOR_PRESETS[2];
  const displayImage = base2DImage || fallbackImage;

  return (
    <div className="p-4 sm:p-5 bg-[#FAF7F2] rounded-3xl border border-[#E5E0DA] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DA]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#8C7A6B]/15 text-[#8C7A6B] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#423D33] uppercase tracking-wider">
              Recursos 2D & Máscara de Personalización del Producto
            </h4>
            <p className="text-[11px] text-[#8C7A6B]">
              Define de forma independiente el área de cera, origen de la mecha y dispersión de botánicos para este modelo específico.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E5E0DA] text-[10px] font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "presets"
                ? "bg-[#8C7A6B] text-white shadow-xs"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Plantillas de Vaso</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("anchors")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "anchors"
                ? "bg-[#8C7A6B] text-white shadow-xs"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Anclajes (Mecha / Botánicos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "code"
                ? "bg-[#8C7A6B] text-white shadow-xs"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>SVG / Código</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Stage on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive Visualizer Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            ref={previewContainerRef}
            onClick={handleCanvasClick}
            className={`relative aspect-square w-full max-w-[320px] rounded-2xl overflow-hidden bg-[#F2EDE7] border border-[#D9C5B2] shadow-xs select-none ${
              activeClickTarget !== "none" ? "cursor-crosshair ring-2 ring-[#8C7A6B]" : ""
            }`}
          >
            {/* Base Product Image */}
            {Boolean(displayImage && displayImage.trim()) ? (
              <img
                src={displayImage}
                alt="Diseño Base 2D"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B] text-xs p-6 text-center">
                <ImageIcon className="w-8 h-8 opacity-40 mb-2" />
                <span>Asigna una imagen base 2D para calibrar la máscara</span>
              </div>
            )}

            {/* SVG Mask Tint Preview */}
            {waxMaskPolygon && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                <defs>
                  <filter
                    id="adminWaxFeatherFilter"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="0.45" />
                  </filter>
                </defs>
                <path
                  d={waxMaskPolygon}
                  fill={activeColorPreset.waxOverlayColor || activeColorPreset.hex}
                  style={{
                    mixBlendMode: "multiply",
                    opacity: activeColorPreset.id === "carbon" ? 0.78 : 0.72,
                  }}
                  filter="url(#adminWaxFeatherFilter)"
                />
                {/* Outline stroke for visual validation */}
                <path
                  d={waxMaskPolygon}
                  fill="none"
                  stroke="#D98B68"
                  strokeWidth="0.8"
                  strokeDasharray="1.5,1.5"
                  opacity="0.8"
                />
              </svg>
            )}

            {/* Wick Origin Pin Indicator */}
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col items-center"
              style={{ left: `${wickX}%`, top: `${wickY}%` }}
            >
              <div className="w-4 h-6 bg-gradient-to-t from-[#FF6B2B] via-[#FFA63D] to-[#FFF4D0] rounded-full animate-pulse shadow-[0_0_8px_#FFA63D]" />
              <div className="w-1 h-2 bg-[#422513] rounded-xs -mt-1" />
              <span className="bg-[#423D33] text-white font-mono text-[8px] px-1.5 py-0.2 rounded-full mt-0.5 whitespace-nowrap shadow-xs">
                Mecha ({wickX}%, {wickY}%)
              </span>
            </div>

            {/* Botanicals Dispersion Radius Circle Indicator */}
            <div
              className="absolute z-15 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#8E7CC3] bg-[#8E7CC3]/20 flex items-center justify-center"
              style={{
                left: `${botanicalsX}%`,
                top: `${botanicalsY}%`,
                width: `${botanicalsRadius * 2}%`,
                height: `${botanicalsRadius * 2}%`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#8E7CC3]" />
            </div>

            {/* Active click banner prompt */}
            {activeClickTarget !== "none" && (
              <div className="absolute top-2 inset-x-2 bg-[#423D33]/90 text-white text-[10px] py-1 px-2.5 rounded-lg text-center backdrop-blur-xs font-semibold z-30 shadow-md">
                {activeClickTarget === "wick"
                  ? "🎯 Haz clic sobre la imagen para anclar el origen de la MECHA"
                  : "🌸 Haz clic sobre la imagen para ubicar el centro de los BOTÁNICOS"}
              </div>
            )}
          </div>

          {/* Live Color Swatch Tester under preview */}
          <div className="mt-3 w-full max-w-[320px] flex items-center justify-between gap-1 p-2 bg-white rounded-2xl border border-[#E5E0DA]">
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider pl-1">
              Color Cera:
            </span>
            <div className="flex items-center gap-1">
              {WAX_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTestColorId(preset.id)}
                  title={`Probar tono ${preset.name}`}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer border flex items-center justify-center ${
                    testColorId === preset.id
                      ? "ring-2 ring-[#423D33] ring-offset-1 scale-110 shadow-xs"
                      : "border-black/10 hover:scale-105"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {testColorId === preset.id && (
                    <Check className="w-3 h-3 text-white drop-shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings & Coordinates Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Base 2D Cutout Image Upload */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E5E0DA] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Imagen Base 2D Exclusiva (PNG Transparente o Recorte)</span>
              </label>
              {base2DImage && (
                <button
                  type="button"
                  onClick={() => {
                    setBase2DImage(fallbackImage);
                    notifyChanges({ base2DImage: fallbackImage });
                  }}
                  className="text-[10px] text-[#8C7A6B] hover:underline"
                >
                  Usar foto principal
                </button>
              )}
            </div>
            <ImageUploadField
              label=""
              value={base2DImage}
              onChange={(url) => {
                setBase2DImage(url);
                notifyChanges({ base2DImage: url });
              }}
              recommendedSize="PNG transparente con vaso y escultura nítidos (800x800px)"
            />
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Plantillas Geométricas de Vasija:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {WAX_PRESETS.map((p, idx) => {
                  const isCurrent = waxMaskPolygon === p.path;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? "bg-white border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 text-[#423D33] shadow-xs font-semibold"
                          : "bg-white/60 border-[#E5E0DA] hover:bg-white text-[#423D33]/80"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{p.name}</span>
                          {isCurrent && (
                            <span className="bg-[#8C7A6B] text-white text-[9px] font-bold px-2 py-0.2 rounded-full">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8C7A6B] leading-tight">
                          {p.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <Check className="w-5 h-5 text-[#8C7A6B] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ANCHORS (WICK & BOTANICALS) */}
          {activeTab === "anchors" && (
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-[#E5E0DA]">
              {/* Wick Anchor Point */}
              <div className="space-y-2 pb-3 border-b border-[#E5E0DA]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#423D33] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#D98B68]" />
                    <span>Anclaje de Mecha & Llama</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveClickTarget(
                        activeClickTarget === "wick" ? "none" : "wick"
                      )
                    }
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeClickTarget === "wick"
                        ? "bg-[#D98B68] text-white animate-pulse"
                        : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-[#F2EDE7]"
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>{activeClickTarget === "wick" ? "Haz clic en la foto" : "Marcar con Clic"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Posición X (%): {wickX}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={wickX}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWickX(val);
                        notifyChanges({ wickX: val });
                      }}
                      className="w-full accent-[#8C7A6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Posición Y (%): {wickY}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={wickY}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWickY(val);
                        notifyChanges({ wickY: val });
                      }}
                      className="w-full accent-[#8C7A6B]"
                    />
                  </div>
                </div>
              </div>

              {/* Botanicals Dispersion Anchor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#423D33] flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-[#8E7CC3]" />
                    <span>Área & Radio de Botánicos Deshidratados</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveClickTarget(
                        activeClickTarget === "botanicals" ? "none" : "botanicals"
                      )
                    }
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeClickTarget === "botanicals"
                        ? "bg-[#8E7CC3] text-white animate-pulse"
                        : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-[#F2EDE7]"
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>{activeClickTarget === "botanicals" ? "Haz clic en la foto" : "Marcar con Clic"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Centro X (%): {botanicalsX}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={botanicalsX}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBotanicalsX(val);
                        notifyChanges({ botanicalsX: val });
                      }}
                      className="w-full accent-[#8E7CC3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Centro Y (%): {botanicalsY}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={botanicalsY}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBotanicalsY(val);
                        notifyChanges({ botanicalsY: val });
                      }}
                      className="w-full accent-[#8E7CC3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Radio (%): {botanicalsRadius}%
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="35"
                      value={botanicalsRadius}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBotanicalsRadius(val);
                        notifyChanges({ botanicalsRadius: val });
                      }}
                      className="w-full accent-[#8E7CC3]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE / MANUAL SVG PATH */}
          {activeTab === "code" && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E5E0DA]">
              <div>
                <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                  Ruta Vectorial SVG (o Polígono de Cera):
                </label>
                <textarea
                  rows={3}
                  value={waxMaskPolygon}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWaxMaskPolygon(val);
                    notifyChanges({ waxMaskPolygon: val });
                  }}
                  placeholder="M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z"
                  className="w-full p-2.5 rounded-xl border border-[#E5E0DA] font-mono text-xs text-[#423D33]"
                />
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  Acepta rutas SVG absolutas en escala normalizada (0 a 100) o sintaxis <code>polygon(...)</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden inputs to guarantee automatic form payload inclusion */}
      <input type="hidden" name="base2DImage" value={base2DImage} />
      <input type="hidden" name="waxMaskPolygon" value={waxMaskPolygon} />
      <input type="hidden" name="wickX" value={wickX} />
      <input type="hidden" name="wickY" value={wickY} />
      <input type="hidden" name="botanicalsX" value={botanicalsX} />
      <input type="hidden" name="botanicalsY" value={botanicalsY} />
      <input type="hidden" name="botanicalsRadius" value={botanicalsRadius} />
    </div>
  );
};
