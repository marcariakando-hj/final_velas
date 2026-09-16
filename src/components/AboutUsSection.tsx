import React from "react";
import {
  Sparkles,
  Heart,
  Users,
  Leaf,
  Flame,
  Globe2,
  Compass,
  Palette,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useStore } from "../context/StoreContext";

interface AboutUsSectionProps {
  onNavigateToCollection?: () => void;
  onNavigateToCollaborators?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  onNavigateToCollection,
  onNavigateToCollaborators,
}) => {
  const { brandConfig, collaborators } = useStore();

  const values = [
    {
      icon: Users,
      title: "Comunidad & Ayni",
      subtitle: "Reciprocidad Ancestral",
      description:
        "Creemos que ningún logro es solitario. Cada producto es una alianza donde todos crecemos, compartiendo reconocimiento, beneficios justos y visibilidad.",
    },
    {
      icon: Palette,
      title: "Jóvenes Creadores",
      subtitle: "Plataforma de Arte Vivo",
      description:
        "Damos voz a ilustradores, ceramistas y artistas emergentes, transformando cada vasija y etiqueta en un lienzo de expresión botánica auténtica.",
    },
    {
      icon: Leaf,
      title: "Materia Prima Consciente",
      subtitle: "Ceras de Soja & Parafina Puras",
      description:
        "Cera vegetal de soja biodegradable y parafina refinada de alta pureza, mechas de madera silvestre de podas éticas y aceites botánicos puros.",
    },
    {
      icon: Flame,
      title: "Ritual & Presencia",
      subtitle: "Calma para los Sentidos",
      description:
        "Diseñamos cada aroma no como un simple ambientador, sino como un puente sensorial hacia la calma, la meditación y el calor de hogar.",
    },
  ];

  return (
    <section
      id="nosotros-section"
      className="py-20 bg-[#F5EFEB] border-t border-[#E5E0DA] relative overflow-hidden"
    >
      {/* Background Decorative Lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#8C7A6B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#D98B68]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        {/* Section Header with Ayllu Manifesto Pill */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8C7A6B]/15 border border-[#8C7A6B]/25 text-[#423D33] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Heart className="w-3 h-3 text-[#D98B68] fill-[#D98B68]" />
            <span>Manifiesto & Origen • {brandConfig.brandName}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#423D33] font-normal tracking-tight">
            Sobre Nosotros
          </h2>

          <p className="text-sm sm:text-base text-[#8C7A6B] font-medium tracking-wide">
            {brandConfig.aboutTagline}
          </p>
        </div>

        {/* Hero Manifesto Card - Featuring exact user quote */}
        <div className="bg-[#423D33] text-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-[#423D33] shadow-lg relative overflow-hidden">
          {/* Subtle Organic Background Textures */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#8C7A6B]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#D98B68]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 text-[#D9C5B2] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#D9C5B2]" />
                <span>Nuestra Esencia Compartida</span>
              </div>

              {/* Exact user requested phrase */}
              <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FDFBF9] font-normal leading-snug">
                "{brandConfig.aboutDescription}"
              </blockquote>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans max-w-2xl">
                {brandConfig.aboutDetailedStory}
              </p>

              {/* Quick links buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {onNavigateToCollaborators && (
                  <button
                    onClick={onNavigateToCollaborators}
                    className="px-5 py-2.5 rounded-full bg-white text-[#423D33] text-xs font-bold uppercase tracking-wider hover:bg-[#D9C5B2] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Conoce a los {collaborators.length} Creadores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onNavigateToCollection && (
                  <button
                    onClick={onNavigateToCollection}
                    className="px-5 py-2.5 rounded-full bg-transparent border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Explorar Colección Botánica
                  </button>
                )}
              </div>
            </div>

            {/* Right Side Stats & Symbol */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="text-center pb-4 border-b border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D9C5B2] block">
                  El Significado de
                </span>
                <span className="font-serif text-3xl font-bold tracking-widest uppercase text-white block mt-1">
                  A Y L L U
                </span>
                <span className="text-[11px] text-white/70 italic mt-1 block">
                  (Voz quechua: "Comunidad unida por el afecto y la labor común")
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="font-serif text-2xl font-bold text-[#D9C5B2] block">
                    100%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/75 font-medium">
                    Cera Vegetal Soja
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="font-serif text-2xl font-bold text-[#D9C5B2] block">
                    0%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/75 font-medium">
                    Humo Tóxico
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="font-serif text-2xl font-bold text-[#D9C5B2] block">
                    {collaborators.length}+
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/75 font-medium">
                    Artistas Co-Creadores
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="font-serif text-2xl font-bold text-[#D9C5B2] block">
                    65h+
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/75 font-medium">
                    Combustión Acústica
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Ayllu Bento Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
              Nuestros Pilares
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#423D33] font-normal">
              ¿Por qué hacemos lo que hacemos?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-[#E5E0DA] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] text-[#8C7A6B] group-hover:bg-[#4A4541] group-hover:text-white transition-colors flex items-center justify-center border border-[#E5E0DA]">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
                        {val.subtitle}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-[#423D33] mt-0.5">
                        {val.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#423D33]/80 leading-relaxed">
                      {val.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E0DA]/60 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                    <span>Compromiso Ayllu</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
