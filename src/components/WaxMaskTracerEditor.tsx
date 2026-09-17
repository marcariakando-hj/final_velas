import React, { useState, useEffect } from "react";
import { Sparkles, Eye, Sliders, Check, RefreshCw, Layers } from "lucide-react";
import { WAX_COLOR_PRESETS } from "./CandleVisualizer2D";

interface WaxMaskTracerEditorProps {
  imageUrl: string;
  value: string;
  onChange: (newPolygon: string) => void;
}

const PRESETS = [
  {
    name: "Estándar Ayllu (Vaso Lateral Izquierdo)",
    polygon: "polygon(14% 59%, 43% 59%, 40% 77%, 16% 77%)",
    description: "Para composiciones de estudio con vaso en cuadrante inferior izquierdo.",
  },
  {
    name: "Vaso Frontal Centrado",
    polygon: "polygon(26% 56%, 74% 56%, 70% 84%, 30% 84%)",
    description: "Para tomas frontales simétricas con vaso en el tercio inferior central.",
  },
  {
    name: "Vaso Base Amplia / Extendido",
    polygon: "polygon(18% 50%, 82% 50%, 78% 88%, 22% 88%)",
    description: "Para velas con mayor volumen de cera expuesta en la base.",
  },
  {
    name: "Vaso Cilíndrico Delgado",
    polygon: "polygon(22% 58%, 78% 58%, 74% 82%, 26% 82%)",
    description: "Para recipientes altos y estrechos.",
  },
];

export const WaxMaskTracerEditor: React.FC<WaxMaskTracerEditorProps> = ({
  imageUrl,
  value,
  onChange,
}) => {
  const currentPolygon = value || PRESETS[0].polygon;
  const [testColorId, setTestColorId] = useState<string>("terracota");
  const [customText, setCustomText] = useState<string>(currentPolygon);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  useEffect(() => {
    setCustomText(currentPolygon);
  }, [currentPolygon]);

  const activeColorPreset =
    WAX_COLOR_PRESETS.find((p) => p.id === testColorId) || WAX_COLOR_PRESETS[3];

  const handleApplyPreset = (poly: string) => {
    setCustomText(poly);
    onChange(poly);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomText(val);
    if (val.trim().startsWith("polygon(") && val.trim().endsWith(")")) {
      onChange(val.trim());
    }
  };

  return (
    <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#8C7A6B]/15 text-[#8C7A6B] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#423D33] uppercase tracking-wider">
              Trazador de Molde 2D (Área de Cera en Vaso)
            </h4>
            <p className="text-[11px] text-[#8C7A6B]">
              Define el polígono donde se aplicará dinámicamente el tinte de cera sobre la foto real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E0DA] text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "presets"
                ? "bg-[#8C7A6B] text-white"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            Plantillas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-[#8C7A6B] text-white"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            Manual / CSS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Live Preview Canvas */}
        <div className="relative aspect-square max-w-[260px] mx-auto w-full rounded-2xl overflow-hidden bg-[#EAE4DD] border border-[#D9C5B2] shadow-xs select-none">
          {Boolean(imageUrl && imageUrl.trim()) ? (
            <img
              src={imageUrl}
              alt="Previsualización de Molde"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B] text-xs p-4 text-center">
              <span>Sube una fotografía arriba para previsualizar el molde</span>
            </div>
          )}

          {/* Mask Outline in Editor */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300 ring-2 ring-[#D98B68]/60"
            style={{
              clipPath: currentPolygon,
              backgroundColor: activeColorPreset.waxOverlayColor,
              mixBlendMode: activeColorPreset.waxBlendMode as any,
              opacity: activeColorPreset.waxOpacity,
            }}
          />

          {/* Guide Overlay Tag */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[9px] font-mono">
            Molde: {activeColorPreset.name}
          </div>
        </div>

        {/* Controls Column */}
        <div className="space-y-3">
          {activeTab === "presets" ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Selecciona una plantilla de vaso:
              </span>
              <div className="space-y-1.5">
                {PRESETS.map((p, idx) => {
                  const isCurrent = currentPolygon === p.polygon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p.polygon)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? "bg-white border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 text-[#423D33] shadow-2xs font-semibold"
                          : "bg-white/60 border-[#E5E0DA] hover:bg-white text-[#423D33]/80"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[11px]">{p.name}</div>
                        <div className="text-[10px] text-[#8C7A6B] line-clamp-1">
                          {p.description}
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#8C7A6B] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Polígono CSS clip-path:
              </label>
              <input
                type="text"
                value={customText}
                onChange={handleCustomChange}
                placeholder="polygon(14% 59%, 43% 59%, 40% 77%, 16% 77%)"
                className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-white font-mono text-xs text-[#423D33]"
              />
              <p className="text-[10px] text-[#8C7A6B]">
                Formato estándar: <code>polygon(x1% y1%, x2% y2%, x3% y3%, x4% y4%)</code>
              </p>
            </div>
          )}

          {/* Test Wax Colors Strip */}
          <div className="pt-2 border-t border-[#E5E0DA]">
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-1.5">
              Probar tono de cera en vivo:
            </span>
            <div className="flex items-center gap-1.5">
              {WAX_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTestColorId(preset.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                    testColorId === preset.id
                      ? "bg-[#423D33] text-white border-[#423D33] shadow-2xs font-bold"
                      : "bg-white text-[#423D33] border-[#E5E0DA] hover:border-[#8C7A6B]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden input to ensure value is bound if needed in form data */}
      <input type="hidden" name="waxMaskPolygon" value={currentPolygon} />
    </div>
  );
};
