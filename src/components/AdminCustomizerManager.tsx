import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  WaxColorOption,
  WickOption,
  BotanicalOption,
  LabelStyleOption,
  CustomizerOptionsCatalog,
} from "../types";
import {
  Layers,
  Sparkles,
  Flame,
  Tag,
  Palette,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Sliders,
  DollarSign,
  Info,
  Eye,
} from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";

export const AdminCustomizerManager: React.FC<{ notify: (msg: string) => void }> = ({ notify }) => {
  const {
    customizerOptions,
    addCustomizerOption,
    editCustomizerOption,
    deleteCustomizerOption,
    resetCustomizerOptionsToDefault,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    "waxColors" | "botanicals" | "labelStyles"
  >("waxColors");

  // Modal / Form state for item editing
  const [editingItemType, setEditingItemType] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Wax Color Form State
  const [waxColorForm, setWaxColorForm] = useState<Partial<WaxColorOption>>({
    name: "",
    subtitle: "",
    hex: "#FAF7F2",
    accent: "#E2DCD0",
    description: "",
    mood: "",
  });

  // Botanical Form State
  const [botanicalForm, setBotanicalForm] = useState<Partial<BotanicalOption>>({
    name: "",
    category: "Corazón",
    scentFamily: "Floral",
    color: "#8E7CC3",
    priceAddon: 0.0,
    description: "",
    visualType: "lavanda",
  });

  // Label Style Form State
  const [labelStyleForm, setLabelStyleForm] = useState<Partial<LabelStyleOption>>({
    name: "",
    bgClass: "bg-[#D8C4B0] text-[#3D2E24]",
    textClass: "text-[#3D2E24]",
    borderClass: "border-[#B59E87]",
    paperBg: "#D8C4B0",
    paperText: "#3D2E24",
    paperBorder: "#B59E87",
  });

  // Open Edit Modal
  const handleStartEdit = (category: keyof CustomizerOptionsCatalog, item: any) => {
    setEditingItemType(category);
    setEditingItem(item);
    setIsAddingNew(false);

    if (category === "waxColors") setWaxColorForm(item);
    else if (category === "botanicals") setBotanicalForm(item);
    else if (category === "labelStyles") setLabelStyleForm(item);
  };

  // Open Add Modal
  const handleStartAdd = (category: keyof CustomizerOptionsCatalog) => {
    setEditingItemType(category);
    setEditingItem(null);
    setIsAddingNew(true);

    const generatedId = `custom-${Date.now()}`;
    if (category === "waxColors") {
      setWaxColorForm({
        id: generatedId,
        name: "",
        subtitle: "",
        hex: "#FAF7F2",
        accent: "#E2DCD0",
        description: "",
        mood: "",
      });
    } else if (category === "botanicals") {
      setBotanicalForm({
        id: generatedId,
        name: "",
        category: "Corazón",
        scentFamily: "Floral",
        color: "#8E7CC3",
        priceAddon: 0.0,
        description: "",
        visualType: "lavanda",
      });
    } else if (category === "labelStyles") {
      setLabelStyleForm({
        id: generatedId,
        name: "",
        bgClass: "bg-[#D8C4B0] text-[#3D2E24]",
        textClass: "text-[#3D2E24]",
        borderClass: "border-[#B59E87]",
        paperBg: "#D8C4B0",
        paperText: "#3D2E24",
        paperBorder: "#B59E87",
      });
    }
  };

  const handleCloseModal = () => {
    setEditingItemType(null);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  // Save changes
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemType) return;

    if (editingItemType === "waxColors") {
      if (isAddingNew) {
        addCustomizerOption("waxColors", waxColorForm as WaxColorOption);
        notify(`Tono de cera "${waxColorForm.name}" añadido.`);
      } else {
        editCustomizerOption("waxColors", editingItem.id, waxColorForm);
        notify(`Tono de cera "${waxColorForm.name}" actualizado.`);
      }
    } else if (editingItemType === "botanicals") {
      if (isAddingNew) {
        addCustomizerOption("botanicals", botanicalForm as BotanicalOption);
        notify(`Botánico "${botanicalForm.name}" añadido.`);
      } else {
        editCustomizerOption("botanicals", editingItem.id, botanicalForm);
        notify(`Botánico "${botanicalForm.name}" actualizado.`);
      }
    } else if (editingItemType === "labelStyles") {
      if (isAddingNew) {
        addCustomizerOption("labelStyles", labelStyleForm as LabelStyleOption);
        notify(`Estilo de papel "${labelStyleForm.name}" añadido.`);
      } else {
        editCustomizerOption("labelStyles", editingItem.id, labelStyleForm);
        notify(`Estilo de papel "${labelStyleForm.name}" actualizado.`);
      }
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-[#423D33]">
              Catálogo Administrable del Personalizador 2D
            </h3>
            <span className="text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#E5E0DA] font-bold">
              localStorage Sync
            </span>
          </div>
          <p className="text-xs text-[#8C7A6B] mt-0.5">
            Configura los tonos de cera, botánicos y texturas de papel del asistente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("¿Estás seguro de restablecer todas las opciones del personalizador a sus valores originales?")) {
                resetCustomizerOptionsToDefault();
                notify("Opciones del personalizador restauradas a valores por defecto.");
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8C7A6B] hover:text-[#423D33] hover:bg-[#FAF7F2] border border-[#E5E0DA] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartAdd(activeSubTab)}
            className="px-4 py-2 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Opción</span>
          </button>
        </div>
      </div>

      {/* Sub Category Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "waxColors", label: `Tonos Cera (${customizerOptions.waxColors.length})`, icon: Palette },
          { id: "botanicals", label: `Botánicos (${customizerOptions.botanicals.length})`, icon: Sparkles },
          { id: "labelStyles", label: `Papeles (${customizerOptions.labelStyles.length})`, icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#423D33] text-white shadow-xs"
                  : "bg-white text-[#423D33]/80 border border-[#E5E0DA] hover:bg-[#FAF7F2]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW 2: TONOS DE CERA (WAX COLORS)
          ========================================================================= */}
      {activeSubTab === "waxColors" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {customizerOptions.waxColors.map((color) => (
            <div
              key={color.id}
              className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full border border-black/10 shrink-0 shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <h4 className="font-serif font-bold text-[#423D33] text-sm">
                      {color.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#8C7A6B]">{color.hex}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8C7A6B]">{color.subtitle}</p>
                <p className="text-xs text-[#423D33]/80 italic">{color.mood}</p>
              </div>

              <div className="pt-3 border-t border-[#E5E0DA]/70 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEdit("waxColors", color)}
                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customizerOptions.waxColors.length <= 1) {
                      alert("Debe haber al menos 1 color de cera.");
                      return;
                    }
                    if (confirm(`¿Eliminar tono de cera "${color.name}"?`)) {
                      deleteCustomizerOption("waxColors", color.id);
                      notify(`Tono "${color.name}" eliminado.`);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: BOTÁNICOS (BOTANICALS)
          ========================================================================= */}
      {activeSubTab === "botanicals" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in">
          {customizerOptions.botanicals.map((botanical) => (
            <div
              key={botanical.id}
              className="bg-white p-4 rounded-2xl border border-[#E5E0DA] shadow-xs flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: botanical.color }}
                    />
                    <h4 className="font-serif font-bold text-xs text-[#423D33] truncate">
                      {botanical.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#8C7A6B]">
                    {botanical.priceAddon > 0 ? `+$${botanical.priceAddon.toFixed(2)}` : "Gratis"}
                  </span>
                </div>
                <p className="text-[10px] text-[#8C7A6B] mt-1 line-clamp-2">
                  {botanical.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-between text-[9px] text-[#8C7A6B]">
                <span className="uppercase font-semibold">{botanical.category}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit("botanicals", botanical)}
                    className="p-1 rounded-md bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customizerOptions.botanicals.length <= 2) {
                        alert("Se requieren al menos 2 botánicos en el catálogo.");
                        return;
                      }
                      if (confirm(`¿Eliminar botánico "${botanical.name}"?`)) {
                        deleteCustomizerOption("botanicals", botanical.id);
                        notify(`Botánico "${botanical.name}" eliminado.`);
                      }
                    }}
                    className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          VIEW 5: PAPELES DE ETIQUETA (LABEL STYLES)
          ========================================================================= */}
      {activeSubTab === "labelStyles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {customizerOptions.labelStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white p-4 rounded-3xl border border-[#E5E0DA] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2 text-center flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center text-xs font-serif font-bold shadow-2xs"
                  style={{
                    backgroundColor: style.paperBg || "#D8C4B0",
                    color: style.paperText || "#3D2E24",
                    borderColor: style.paperBorder || "#B59E87",
                  }}
                >
                  Aa
                </div>
                <h4 className="font-serif font-bold text-xs text-[#423D33]">
                  {style.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEdit("labelStyles", style)}
                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customizerOptions.labelStyles.length <= 1) {
                      alert("Debe haber al menos 1 estilo de papel.");
                      return;
                    }
                    if (confirm(`¿Eliminar estilo de papel "${style.name}"?`)) {
                      deleteCustomizerOption("labelStyles", style.id);
                      notify(`Estilo "${style.name}" eliminado.`);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          EDIT / ADD MODAL DIALOG
          ========================================================================= */}
      {editingItemType && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-3xl border border-[#E5E0DA] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0DA]">
              <h4 className="font-serif text-base font-bold text-[#423D33]">
                {isAddingNew ? "Añadir Nueva Opción" : "Editar Opción del Catálogo"}
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-white text-[#8C7A6B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* WAX COLOR FORM */}
              {editingItemType === "waxColors" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={waxColorForm.name || ""}
                        onChange={(e) => setWaxColorForm({ ...waxColorForm, name: e.target.value })}
                        placeholder="Ej. Caliza Blanca"
                        className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-serif"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Color HEX *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={waxColorForm.hex || "#FAF7F2"}
                          onChange={(e) => setWaxColorForm({ ...waxColorForm, hex: e.target.value })}
                          className="w-9 h-9 p-0 rounded-xl border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          required
                          value={waxColorForm.hex || ""}
                          onChange={(e) => setWaxColorForm({ ...waxColorForm, hex: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={waxColorForm.subtitle || ""}
                      onChange={(e) => setWaxColorForm({ ...waxColorForm, subtitle: e.target.value })}
                      placeholder="Ej. Puro marfil & luz"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Atmósfera / Mood</label>
                    <input
                      type="text"
                      value={waxColorForm.mood || ""}
                      onChange={(e) => setWaxColorForm({ ...waxColorForm, mood: e.target.value })}
                      placeholder="Ej. Luz, Pureza & Devoción"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white italic"
                    />
                  </div>
                </>
              )}

              {/* BOTANICAL FORM */}
              {editingItemType === "botanicals" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={botanicalForm.name || ""}
                        onChange={(e) => setBotanicalForm({ ...botanicalForm, name: e.target.value })}
                        placeholder="Ej. Lavanda Silvestre"
                        className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-serif"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Nivel en Pirámide</label>
                      <select
                        value={botanicalForm.category || "Corazón"}
                        onChange={(e) => setBotanicalForm({ ...botanicalForm, category: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                      >
                        <option value="Salida">Salida (Notas Altas)</option>
                        <option value="Corazón">Corazón (Notas Medias)</option>
                        <option value="Fondo">Fondo (Notas Base)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Familia Olfativa</label>
                      <input
                        type="text"
                        value={botanicalForm.scentFamily || ""}
                        onChange={(e) => setBotanicalForm({ ...botanicalForm, scentFamily: e.target.value })}
                        placeholder="Ej. Floral Relajante"
                        className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Suplemento ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={botanicalForm.priceAddon || 0}
                        onChange={(e) => setBotanicalForm({ ...botanicalForm, priceAddon: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Descripción de Notas</label>
                    <textarea
                      rows={2}
                      value={botanicalForm.description || ""}
                      onChange={(e) => setBotanicalForm({ ...botanicalForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                    />
                  </div>
                </>
              )}

              {/* LABEL STYLE FORM */}
              {editingItemType === "labelStyles" && (
                <>
                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Nombre del Papel *</label>
                    <input
                      type="text"
                      required
                      value={labelStyleForm.name || ""}
                      onChange={(e) => setLabelStyleForm({ ...labelStyleForm, name: e.target.value })}
                      placeholder="Ej. Papel Kraft Botánico"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Color Fondo</label>
                      <input
                        type="text"
                        value={labelStyleForm.paperBg || "#D8C4B0"}
                        onChange={(e) => setLabelStyleForm({ ...labelStyleForm, paperBg: e.target.value })}
                        className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Color Texto</label>
                      <input
                        type="text"
                        value={labelStyleForm.paperText || "#3D2E24"}
                        onChange={(e) => setLabelStyleForm({ ...labelStyleForm, paperText: e.target.value })}
                        className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#8C7A6B] uppercase mb-1">Color Borde</label>
                      <input
                        type="text"
                        value={labelStyleForm.paperBorder || "#B59E87"}
                        onChange={(e) => setLabelStyleForm({ ...labelStyleForm, paperBorder: e.target.value })}
                        className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit / Actions */}
              <div className="pt-4 border-t border-[#E5E0DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white font-bold cursor-pointer shadow-xs"
                >
                  Guardar Opción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
