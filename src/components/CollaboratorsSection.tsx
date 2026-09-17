import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Palette,
  Heart,
  Flame,
  Feather,
  Compass,
  ArrowRight,
  Quote,
  CheckCircle2,
  X,
  ExternalLink,
  Brush
} from "lucide-react";
import { COLLABORATORS } from "../data/candles";
import { Collaborator, CandleProduct } from "../types";
import { useStore } from "../context/StoreContext";

interface CollaboratorsSectionProps {
  onSelectCandleById?: (candleId: string) => void;
}

export const CollaboratorsSection: React.FC<CollaboratorsSectionProps> = ({
  onSelectCandleById,
}) => {
  const { collaborators, brandConfig, candles } = useStore();
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>(
    collaborators[0]?.id || "collab-valentina"
  );
  const [modalCollaborator, setModalCollaborator] = useState<Collaborator | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");

  const fallbackCollaborator: Collaborator = {
    id: "fallback",
    name: "Creador Ayllu",
    age: 20,
    location: "Quito",
    bio: "",
    image: "",
    discipline: "Arte",
    paletteColors: ["#8C7A6B"],
  };

  const selectedCollaborator: Collaborator =
    collaborators.find((c) => c.id === selectedCollaboratorId) || collaborators[0] || fallbackCollaborator;

  // Helper to find all candles associated with a collaborator (by ID, by Name, or by associatedCandleId/Name)
  const getArtistCandles = (collab: Collaborator): CandleProduct[] => {
    if (!collab) return [];
    const directMatches = candles.filter((c) => {
      // 1. Direct ID match
      if (c.collaboratorId && c.collaboratorId === collab.id) return true;
      // 2. Loose ID match (e.g. "collab-valentina" vs "valentina-morales")
      const cleanCollabId = collab.id.toLowerCase().replace("collab-", "");
      if (
        c.collaboratorId &&
        cleanCollabId &&
        (c.collaboratorId.toLowerCase().includes(cleanCollabId) ||
          cleanCollabId.includes(c.collaboratorId.toLowerCase()))
      ) {
        return true;
      }
      // 3. Name match (case-insensitive)
      if (
        c.collaboratorName &&
        collab.name &&
        c.collaboratorName.trim().toLowerCase() === collab.name.trim().toLowerCase()
      ) {
        return true;
      }
      // 4. Associated Candle ID match
      if (collab.associatedCandleId && c.id === collab.associatedCandleId) return true;
      // 5. Associated Candle Name match
      if (
        collab.associatedCandleName &&
        c.name &&
        c.name.trim().toLowerCase() === collab.associatedCandleName.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    // Deduplicate by candle.id
    const seen = new Set<string>();
    return directMatches.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  };

  const selectedArtistCandles = getArtistCandles(selectedCollaborator);
  const matchedCandle = selectedArtistCandles[0] || null;

  const effectiveInspiration = matchedCandle?.artistInspiration || selectedCollaborator.artistInspiration || "Inspirado en la naturaleza y la armonía biofílica.";
  const effectiveTechnique = matchedCandle?.technique || selectedCollaborator.technique || "Modelado artesanal botánico en cera y pigmentos naturales.";
  const effectiveDesignMeaning = matchedCandle?.designMeaning || selectedCollaborator.designMeaning || "Representa la calma y la conexión serena con el entorno.";
  const effectiveQuote = matchedCandle?.quote || selectedCollaborator.quote || "Cada pieza artesanal es un puente de luz y afecto.";

  const modalCandles = modalCollaborator ? getArtistCandles(modalCollaborator) : [];
  const matchedModalCandle = modalCandles[0] || null;
  const modalInspiration = matchedModalCandle?.artistInspiration || modalCollaborator?.artistInspiration || "";
  const modalTechnique = matchedModalCandle?.technique || modalCollaborator?.technique || "";
  const modalDesignMeaning = matchedModalCandle?.designMeaning || modalCollaborator?.designMeaning || "";
  const modalQuote = matchedModalCandle?.quote || modalCollaborator?.quote || "";

  const locations = ["Todos", "Colombia", "México", "Perú", "Chile"];

  const filteredCollaborators = collaborators.filter((c) => {
    if (activeFilter === "Todos") return true;
    return c.location.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <section
      id="colaboradores-section"
      className="py-20 bg-[#FAF7F2] border-t border-[#E5E0DA] relative overflow-hidden"
    >
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C7A6B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D98B68]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8C7A6B]/10 border border-[#8C7A6B]/20 text-[#8C7A6B] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" />
            <span>Comunidad & Co-Creación • Ayllu</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#423D33] font-normal tracking-tight">
            Nuestros Artistas & Colaboradores
          </h2>

          <p className="text-xs sm:text-sm text-[#423D33]/75 leading-relaxed">
            Cada vela es el fruto de un diálogo sensible entre el aroma botánico y el arte visual.
            Te presentamos a las creadoras y creadores cuyas ilustraciones, pigmentos naturales y
            oficios ancestrales visten cada una de nuestras piezas.
          </p>

          {/* Location / Origin filter pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveFilter(loc)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === loc
                    ? "bg-[#4A4541] text-white shadow-xs"
                    : "bg-white text-[#423D33]/70 border border-[#E5E0DA] hover:border-[#8C7A6B] hover:text-[#423D33]"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Collaborator Bento Hero (Valentina Morales Spotlight) */}
        <div className="bg-white rounded-3xl border border-[#E5E0DA] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Portrait & Quick Bio */}
          <div className="lg:col-span-5 relative bg-[#F4EFEA] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E5E0DA]">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] bg-white px-3 py-1 rounded-full border border-[#E5E0DA]">
                  Colaborador Destacado
                </span>
                <span className="text-xs text-[#8C7A6B] font-serif italic flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D98B68]" />
                  {selectedCollaborator.location}
                </span>
              </div>

              {/* Portrait Image with subtle frame */}
              <div className="relative group mx-auto max-w-[280px] sm:max-w-[320px]">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white flex items-center justify-center bg-[#F2EDE7]">
                  {Boolean(selectedCollaborator.image && selectedCollaborator.image.trim()) ? (
                    <img
                      src={selectedCollaborator.image}
                      alt={selectedCollaborator.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-serif font-bold text-4xl text-[#423D33]">
                      {selectedCollaborator.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Color Palette Swatches */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#E5E0DA] shadow-xs flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold mr-1">
                    Pigmentos:
                  </span>
                  {selectedCollaborator.paletteColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: color }}
                      title={`Pigmento ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Personal Info Header */}
              <div className="text-center pt-2 space-y-1">
                <h3 className="font-serif text-2xl font-bold text-[#423D33]">
                  {selectedCollaborator.name}
                </h3>
                <p className="text-xs text-[#8C7A6B] font-medium">
                  {selectedCollaborator.age} años • {selectedCollaborator.location}
                </p>
                <p className="text-xs text-[#423D33]/80 pt-1 leading-relaxed max-w-sm mx-auto">
                  {selectedCollaborator.bio}
                </p>
              </div>
            </div>

            {/* Associated Candles Showcase for Featured Artist */}
            <div className="mt-6 pt-4 border-t border-[#E5E0DA] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D98B68]" />
                  <span>Velas Co-Diseñadas ({selectedArtistCandles.length})</span>
                </span>
                {selectedArtistCandles.length > 0 && (
                  <span className="text-[10px] text-[#35522e] bg-[#608058]/10 px-2 py-0.5 rounded-full font-semibold">
                    En Catálogo
                  </span>
                )}
              </div>

              {selectedArtistCandles.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedArtistCandles.map((candle) => (
                    <div
                      key={candle.id}
                      onClick={() => onSelectCandleById && onSelectCandleById(candle.id)}
                      className="flex items-center justify-between gap-2.5 p-2.5 bg-white/90 hover:bg-white rounded-2xl border border-[#E5E0DA] hover:border-[#8C7A6B] transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E5E0DA] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                          {candle.image ? (
                            <img
                              src={candle.image}
                              alt={candle.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <Flame className="w-4 h-4 text-[#D98B68]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-serif font-bold text-xs text-[#423D33] truncate group-hover:text-[#8C7A6B] transition-colors">
                            {candle.code ? `${candle.code} • ` : ""}{candle.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B]">
                            <span className="font-semibold text-[#423D33]">${Number(candle.price).toFixed(2)}</span>
                            <span>•</span>
                            <span className="truncate">{candle.waxType || "Soja"}</span>
                          </div>
                        </div>
                      </div>

                      {onSelectCandleById && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCandleById(candle.id);
                          }}
                          className="p-1.5 rounded-full bg-[#FAF7F2] group-hover:bg-[#4A4541] text-[#8C7A6B] group-hover:text-white transition-colors shrink-0 cursor-pointer"
                          title="Ver ficha de la vela"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white/60 rounded-2xl border border-[#E5E0DA]/70 text-center text-xs text-[#8C7A6B] italic">
                  Próximas piezas botánicas en proceso de taller.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: In-depth Story & Creative Pillars */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            {/* Discipline tag & Inspiration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#8C7A6B]/10 text-[#8C7A6B] text-xs font-semibold">
                  {selectedCollaborator.discipline}
                </span>
              </div>

              {/* Inspiración del Artista */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D98B68]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Inspiración del Artista</span>
                </div>
                <p className="text-sm text-[#423D33] leading-relaxed font-normal bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA]">
                  {effectiveInspiration}
                </p>
              </div>

              {/* Grid with Técnica & Significado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Técnica */}
                <div className="bg-[#FDFBF9] p-4 rounded-2xl border border-[#E5E0DA] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    <Brush className="w-3.5 h-3.5" />
                    <span>Técnica Utilizada</span>
                  </div>
                  <p className="text-xs text-[#423D33]/85 leading-relaxed">
                    {effectiveTechnique}
                  </p>
                </div>

                {/* Significado del Diseño */}
                <div className="bg-[#FDFBF9] p-4 rounded-2xl border border-[#E5E0DA] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Significado del Diseño</span>
                  </div>
                  <p className="text-xs text-[#423D33]/85 leading-relaxed">
                    {effectiveDesignMeaning}
                  </p>
                </div>
              </div>

              {/* Relación entre el Diseño y el Aroma */}
              {Boolean(selectedCollaborator.aromaDesignRelation) && (
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Relación entre el Diseño y el Aroma</span>
                  </div>
                  <p className="text-xs text-[#423D33]/90 leading-relaxed font-serif italic text-base">
                    "{selectedCollaborator.aromaDesignRelation}"
                  </p>
                </div>
              )}
            </div>

            {/* Quote of the Artist */}
            <div className="pt-4 border-t border-[#E5E0DA] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4A4541] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-3.5 h-3.5 text-[#D9C5B2]" />
              </div>
              <div>
                <p className="font-serif italic text-sm sm:text-base text-[#423D33] font-medium leading-snug">
                  "{effectiveQuote}"
                </p>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold block mt-1">
                  — {selectedCollaborator.name}, {selectedCollaborator.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid: All Collaborator Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl text-[#423D33] font-normal">
              Conoce a Todo el Colectivo Creativo
            </h3>
            <span className="text-xs text-[#8C7A6B] font-medium">
              {COLLABORATORS.length} Artistas en Residencia
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCollaborators.map((collab) => {
              const isSelected = selectedCollaboratorId === collab.id;
              const collabCandles = getArtistCandles(collab);
              return (
                <div
                  key={collab.id}
                  id={`collaborator-card-${collab.id}`}
                  onClick={() => setSelectedCollaboratorId(collab.id)}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? "border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-md transform -translate-y-1"
                      : "border-[#E5E0DA] hover:border-[#8C7A6B]/60 shadow-xs hover:shadow-sm"
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* Collaborator Photo with overlay tag */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2EDE7] flex items-center justify-center">
                      {Boolean(collab.image && collab.image.trim()) ? (
                        <img
                          src={collab.image}
                          alt={collab.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-serif font-bold text-3xl text-[#423D33]">
                          {collab.name.charAt(0)}
                        </span>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#423D33] border border-black/5 shadow-2xs">
                        {collab.age} años
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#D98B68]" />
                        {collab.location}
                      </div>
                    </div>

                    {/* Artist Names & Discipline */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-bold text-[#423D33] group-hover:text-[#8C7A6B] transition-colors">
                          {collab.name}
                        </h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#8C7A6B]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#8C7A6B] font-semibold">
                        {collab.discipline}
                      </p>
                      <p className="text-xs text-[#423D33]/70 line-clamp-2 pt-1 leading-relaxed">
                        {collab.bio}
                      </p>
                    </div>

                    {/* Palette Dots */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-bold">
                        Pigmentos:
                      </span>
                      {collab.paletteColors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    {/* Assigned / Co-designed Products Badges */}
                    <div className="pt-2 border-t border-[#E5E0DA]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#D98B68]" />
                          <span>Velas Co-Diseñadas:</span>
                        </span>
                        <span className="text-[#423D33] font-semibold">{collabCandles.length}</span>
                      </div>
                      {collabCandles.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {collabCandles.slice(0, 3).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectCandleById) onSelectCandleById(c.id);
                              }}
                              className="text-[10px] bg-[#FAF7F2] hover:bg-[#4A4541] text-[#423D33] hover:text-white border border-[#E5E0DA] hover:border-[#4A4541] px-2 py-0.5 rounded-lg truncate max-w-[130px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title={`Ver ${c.name} (${Number(c.price).toFixed(2)}€)`}
                            >
                              <span className="truncate">{c.code || c.name}</span>
                              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                          {collabCandles.length > 3 && (
                            <span className="text-[9px] text-[#8C7A6B] font-semibold">
                              +{collabCandles.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#8C7A6B] italic">En creación de taller</span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#E5E0DA] flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalCollaborator(collab);
                      }}
                      className="text-[#8C7A6B] hover:text-[#423D33] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Ficha Completa</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setSelectedCollaboratorId(collab.id)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#4A4541] text-white"
                          : "bg-white text-[#423D33] border border-[#E5E0DA] hover:bg-[#8C7A6B] hover:text-white"
                      }`}
                    >
                      {isSelected ? "Activo" : "Explorar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collective Philosophy Footer Card in Bento style */}
        <div className="bg-[#423D33] text-white rounded-3xl p-8 sm:p-10 border border-[#423D33] shadow-md relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-[#D9C5B2] text-xs font-bold uppercase tracking-widest">
              <Heart className="w-4 h-4 fill-[#D9C5B2]" />
              <span>Manifiesto Creativo Ayllu</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug">
              "Porque juntos somos más que un grupo: somos manos que crean, sueños que se unen y luces que inspiran."
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-serif italic">
              Cada vela que elaboramos lleva una parte de nuestra historia y nos recuerda que las
              mejores cosas nacen cuando crecemos en comunidad.
            </p>
          </div>
        </div>
      </div>

      {/* Collaborator Full Detail Modal */}
      {modalCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FDFBF9] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E0DA] shadow-2xl p-6 sm:p-8 space-y-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setModalCollaborator(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#F2EDE7] text-[#423D33] hover:bg-[#423D33] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header with Portrait & Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#E5E0DA] pb-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 flex items-center justify-center bg-[#F2EDE7]">
                {Boolean(modalCollaborator.image && modalCollaborator.image.trim()) ? (
                  <img
                    src={modalCollaborator.image}
                    alt={modalCollaborator.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-serif font-bold text-4xl text-[#423D33]">
                    {modalCollaborator.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] bg-[#8C7A6B]/10 px-3 py-0.5 rounded-full">
                  {modalCollaborator.discipline}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#423D33]">
                  {modalCollaborator.name}
                </h3>
                <p className="text-xs text-[#8C7A6B] font-medium">
                  {modalCollaborator.age} años • {modalCollaborator.location}
                </p>
                <p className="text-xs text-[#423D33]/85 leading-relaxed pt-1">
                  {modalCollaborator.bio}
                </p>
              </div>
            </div>

            {/* Modal Detail Sections */}
            <div className="space-y-4 text-xs">
              {/* Inspiración del Artista */}
              {Boolean(modalInspiration) && (
                <div className="space-y-1 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA]">
                  <span className="font-bold uppercase tracking-wider text-[#D98B68] block">
                    Inspiración del Artista
                  </span>
                  <p className="text-[#423D33] leading-relaxed">
                    {modalInspiration}
                  </p>
                </div>
              )}

              {/* Técnica */}
              {Boolean(modalTechnique) && (
                <div className="space-y-1 bg-white p-4 rounded-2xl border border-[#E5E0DA]">
                  <span className="font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Técnica
                  </span>
                  <p className="text-[#423D33] leading-relaxed">
                    {modalTechnique}
                  </p>
                </div>
              )}

              {/* Significado del Diseño */}
              {Boolean(modalDesignMeaning) && (
                <div className="space-y-1 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA]">
                  <span className="font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Significado del Diseño
                  </span>
                  <p className="text-[#423D33] leading-relaxed">
                    {modalDesignMeaning}
                  </p>
                </div>
              )}

              {/* Relación entre el Diseño y el Aroma */}
              {Boolean(modalCollaborator.aromaDesignRelation) && (
                <div className="space-y-1 bg-white p-4 rounded-2xl border border-[#E5E0DA]">
                  <span className="font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Relación entre el Diseño y el Aroma
                  </span>
                  <p className="text-[#423D33] font-serif italic text-sm leading-relaxed">
                    "{modalCollaborator.aromaDesignRelation}"
                  </p>
                </div>
              )}

              {/* Quote */}
              {Boolean(modalQuote) && (
                <div className="bg-[#4A4541] text-white p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D9C5B2] font-bold block">
                    Cita del Creador
                  </span>
                  <p className="font-serif italic text-sm text-white/95">
                    "{modalQuote}"
                  </p>
                </div>
              )}

              {/* Associated Candles in modal */}
              <div className="space-y-3 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E5E0DA]">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[#D98B68] flex items-center gap-1.5 text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Velas & Creaciones de este Artista ({modalCandles.length})</span>
                  </span>
                  {modalCandles.length > 0 && (
                    <span className="text-[10px] text-[#35522e] bg-[#608058]/10 px-2.5 py-0.5 rounded-full font-semibold">
                      Disponibles en Tienda
                    </span>
                  )}
                </div>

                {modalCandles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalCandles.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setModalCollaborator(null);
                          if (onSelectCandleById) onSelectCandleById(c.id);
                        }}
                        className="p-3 bg-white rounded-xl border border-[#E5E0DA] hover:border-[#8C7A6B] transition-all cursor-pointer flex items-center gap-3 group shadow-2xs hover:shadow-xs"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#E5E0DA] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Flame className="w-4 h-4 text-[#D98B68]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h6 className="font-serif font-bold text-xs text-[#423D33] truncate group-hover:text-[#8C7A6B] transition-colors">
                            {c.name}
                          </h6>
                          <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B]">
                            <span className="font-bold text-[#423D33]">${Number(c.price).toFixed(2)}</span>
                            <span>•</span>
                            <span className="truncate">{c.waxType || "Soja"}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8C7A6B] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C7A6B] italic">
                    Este artista no tiene velas asignadas actualmente en el catálogo.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Action Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalCollaborator(null)}
                className="px-5 py-2.5 rounded-full border border-[#E5E0DA] text-xs font-semibold text-[#423D33] hover:bg-[#F2EDE7] transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
              {onSelectCandleById && modalCandles.length > 0 && (
                <button
                  onClick={() => {
                    const candleId = modalCandles[0].id;
                    setModalCollaborator(null);
                    onSelectCandleById(candleId);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#4A4541] text-white text-xs font-semibold hover:bg-[#8C7A6B] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Ver Vela en Catálogo ({modalCandles[0].code || modalCandles[0].name})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
