import React, { useState } from "react";
import { Scissors, Flame, RotateCcw, ShieldAlert, Sparkles, Sun, CheckCircle2, Heart } from "lucide-react";

export const CandleCareGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const tips = [
    {
      id: 0,
      title: "La Memoria del Primer Encendido",
      tag: "Regla de Oro",
      shortDesc: "2 a 3 horas continuas para crear una piscina completa.",
      fullDesc:
        "La cera vegetal de soja posee memoria molecular. En el primer encendido, deja arder la vela entre 2 y 3 horas hasta que la piscina líquida alcance todo el perímetro cerámico. Esto previene la formación de túneles y garantiza el aprovechamiento del 100% de la cera.",
      icon: Flame,
      keyAction: "Esperar a que la cera líquida toque los bordes antes de apagar.",
    },
    {
      id: 1,
      title: "Corte de la Mecha a 3-5 mm",
      tag: "Combustión",
      shortDesc: "Retira la ceniza antes de cada nuevo encendido.",
      fullDesc:
        "Antes de prender, recorta suavemente la mecha de algodón puro a unos 3 a 5 mm. Una mecha corta produce una llama limpia, silenciosa, constante y libre de humo u hollín.",
      icon: Scissors,
      keyAction: "Quitar la ceniza superior antes de encender.",
    },
    {
      id: 2,
      title: "Sesiones Óptimas de 3 a 4 Horas",
      tag: "Durabilidad",
      shortDesc: "Conserva la pureza de los aceites esenciales.",
      fullDesc:
        "No excedas las 4 horas consecutivas de uso. Esto preserva la fragancia intacta y mantiene la temperatura de la vasija de arcilla mineral en niveles óptimos.",
      icon: Sun,
      keyAction: "Apagar sofocando suavemente con un apagavelas o plato de cerámica.",
    },
    {
      id: 3,
      title: "Segunda Vida de la Cerámica",
      tag: "Sostenibilidad",
      shortDesc: "100% reutilizable como macetero o taza de té.",
      fullDesc:
        "Cuando quede 1 cm de cera, vierte agua templada con jabón neutro. La soja es hidrosoluble y biodegradable. Tu vasija está lista para alojar una planta suculenta, pinceles o servir de taza.",
      icon: RotateCcw,
      keyAction: "Lavar con agua templada y jabón neutro.",
    },
  ];

  return (
    <section id="cuidado-section" className="py-16 bg-[#FDFBF9] border-b border-[#E5E0DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EDE7] border border-[#E5E0DA] text-[#423D33] text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3 text-[#8C7A6B]" />
            <span>Guía de Maestría Artesanal</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#423D33] font-normal">
            El Arte del Cuidado de la Vela de Soja
          </h2>
          <p className="text-xs sm:text-sm text-[#423D33]/70 leading-relaxed">
            Consejos de nuestros maestros cereros para disfrutar al máximo de la difusión olfativa, el crepitar de la mecha y la sostenibilidad de cada pieza.
          </p>
        </div>

        {/* Bento Grid Guide Workspace */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Steps Column (Col 12 / Col 5) */}
          <div className="col-span-12 lg:col-span-5 space-y-2.5">
            {tips.map((tip, index) => {
              const IconComponent = tip.icon;
              const isCurrent = activeStep === index;
              return (
                <button
                  key={tip.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-full p-4 rounded-3xl text-left transition-all cursor-pointer border flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-white border-[#8C7A6B] shadow-xs ring-1 ring-[#8C7A6B]/20"
                      : "bg-[#F2EDE7] border-[#E5E0DA] hover:bg-white text-[#423D33]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? "bg-[#4A4541] text-white border-[#4A4541]"
                          : "bg-white text-[#8C7A6B] border-[#E5E0DA]"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-serif text-sm font-normal text-[#423D33]">
                        {tip.title}
                      </span>
                      <span className="block text-[10px] text-[#423D33]/60 line-clamp-1">
                        {tip.shortDesc}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-white text-[#8C7A6B] border border-[#E5E0DA] shrink-0">
                    {tip.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Tip Bento Display (Col 12 / Col 7) */}
          <div className="col-span-12 lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bento-dot-pattern opacity-15 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#4A4541] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {React.createElement(tips[activeStep].icon, { className: "w-5 h-5 text-[#D9C5B2]" })}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] block">
                    Paso {activeStep + 1} de {tips.length} • {tips[activeStep].tag}
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-[#423D33]">
                    {tips[activeStep].title}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#423D33]/80 leading-relaxed relative z-10">
              {tips[activeStep].fullDesc}
            </p>

            <div className="p-4 rounded-2xl bg-[#F2EDE7] border border-[#E5E0DA] flex items-start gap-3 relative z-10">
              <CheckCircle2 className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#423D33] block">
                  Regla de oro del artesano:
                </span>
                <span className="text-xs text-[#423D33]/80">
                  {tips[activeStep].keyAction}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#423D33]/70 relative z-10 border-t border-[#E5E0DA]">
              <span>¿Tienes dudas sobre tu vela botánica?</span>
              <span className="font-bold text-[#423D33]">taller@lumenbotanica.es</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

