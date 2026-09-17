import React, { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Info,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { BrandConfig } from "../types";
import { ImageUploadField } from "./ImageUploadField";
import { isSupabaseConfigured } from "../lib/supabase";

interface FooterSettingsTabProps {
  brandForm: BrandConfig;
  setBrandForm: React.Dispatch<React.SetStateAction<BrandConfig>>;
  onSave: (form: BrandConfig) => Promise<{ success: boolean; message: string; error?: any; supabaseSynced: boolean } | void> | void;
  onReset: () => void;
  notify: (msg: string) => void;
}

export const FooterSettingsTab: React.FC<FooterSettingsTabProps> = ({
  brandForm,
  setBrandForm,
  onSave,
  onReset,
  notify,
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const hasSupabase = isSupabaseConfigured();

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    // Preparar payload completo y asegurar que los campos de la primera columna y atención & contacto estén alineados
    const payload: BrandConfig = {
      ...brandForm,
      slogan: brandForm.footerSubtitle || brandForm.slogan,
      footerSubtitle: brandForm.footerSubtitle || brandForm.slogan,
      aboutDescription: brandForm.footerDescription || brandForm.aboutDescription,
      footerDescription: brandForm.footerDescription || brandForm.aboutDescription,
    };

    console.log("Enviando cambios del pie de página (Columna 1 y Atención & Contacto) a Supabase...", payload);

    try {
      const res = await onSave(payload);
      if (res && typeof res === "object" && "error" in res && res.error) {
        console.error("Supabase rechazó la actualización del pie de página:", res.error);
        setSaveStatus({
          type: "error",
          message: `Guardado en local, pero Supabase reportó: ${res.error.message || JSON.stringify(res.error)}. Verifica las políticas RLS de la tabla 'store_settings'.`
        });
        notify(`Guardado localmente. Error en Supabase: ${res.error.message || res.error}`);
      } else {
        console.log("✓ Guardado de pie de página confirmado:", res);
        setSaveStatus({
          type: "success",
          message: (res && typeof res === "object" && "supabaseSynced" in res && res.supabaseSynced)
            ? "✓ Cambios guardados y sincronizados con éxito en Supabase (store_settings). El pie de página y la vista previa se han actualizado."
            : "✓ Cambios guardados exitosamente en la tienda."
        });
        notify((res && typeof res === "object" && "message" in res && res.message) ? res.message : "Pie de página (Primera Columna y Atención & Contacto) guardado y sincronizado.");
      }
    } catch (err: any) {
      console.error("Error al procesar el guardado:", err);
      setSaveStatus({
        type: "error",
        message: `Fallo de conexión o guardado: ${err?.message || err}`
      });
      notify("Error al guardar: " + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof BrandConfig, value: any) => {
    setBrandForm((prev) => {
      const next = { ...prev, [field]: value };
      // Mantener subtítulo y eslogan mutuamente alineados
      if (field === "footerSubtitle") {
        next.slogan = value;
      } else if (field === "slogan" && !prev.footerSubtitle) {
        next.footerSubtitle = value;
      }
      // Mantener descripción mutuamente alineada
      if (field === "footerDescription") {
        next.aboutDescription = value;
      }
      return next;
    });
  };

  const cleanWhatsAppNumber = (brandForm.whatsappNumber || brandForm.contactPhone || "+34 612 345 678").replace(/[^0-9]/g, "");

  const displaySubtitle = brandForm.footerSubtitle || brandForm.slogan || "Velas Botánicas & Creadores con Alma";
  const displayDescription = brandForm.footerDescription || brandForm.aboutDescription || 
    "Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente en colaboración con jóvenes creadores e ilustradores con habilidades especiales. Cada pieza ilumina un hogar e impulsa la autonomía inclusiva.";
  const displayBadge = brandForm.footerBadge || "Filosofía AYNI • Apoyo Mutuo";
  const displayContactTitle = brandForm.footerContactTitle || "Atención & Contacto";
  const displayEmail = brandForm.contactEmail || "taller@aylluvelas.es";
  const displayPhone = brandForm.contactPhone || brandForm.whatsappNumber || "+34 912 345 678";
  const displayHoursWeekdays = brandForm.footerHoursWeekdays || "Lunes a Viernes: 09:30 - 19:30";
  const displayHoursWeekends = brandForm.footerHoursWeekends || "Sábados: 10:00 - 14:00";
  const displayWhatsAppText = brandForm.footerWhatsAppText || "Chat en Vivo con un Asesor";

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#8C7A6B] text-xs font-bold uppercase tracking-wider mb-1 flex-wrap">
              <Mail className="w-4 h-4 text-[#D98B68]" />
              <span>Configuración del Pie de Página & Contacto</span>
              {hasSupabase ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Supabase Activo (store_settings)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Modo Local
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-[#423D33]">
              Editor de Primera Columna y Atención & Contacto
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Modifica la identidad, logotipo, misión, datos de contacto, horarios y WhatsApp. Los cambios persisten en Supabase y se sincronizan en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3.5 py-2 rounded-full border border-[#E5E0DA] hover:bg-[#F7F4EE] text-xs font-semibold text-[#423D33] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>{showPreview ? "Ocultar Vista Previa" : "Ver Vista Previa"}</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleFormSubmit()}
              className="px-5 py-2 rounded-full bg-[#4A4541] hover:bg-[#35312E] disabled:opacity-60 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {saveStatus && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
              saveStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{saveStatus.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
        {/* BLOQUE 1: COLUMNA 1 (Marca, Logotipo, Subtítulo y Misión) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-5">
          <div className="border-b border-[#E5E0DA] pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-serif text-base font-bold text-[#423D33] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F4EFEA] text-[#8C7A6B] inline-flex items-center justify-center text-xs font-mono font-bold">1</span>
                <span>Primera Columna: Identidad, Logotipo & Misión</span>
              </h4>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                Esta información encabeza la primera columna del pie de página oficial de la tienda
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-[#D98B68]" />
          </div>

          {/* Logo Upload Component */}
          <div className="bg-[#FDFBF9] p-4 rounded-2xl border border-[#E5E0DA]">
            <ImageUploadField
              label="Logotipo Oficial en Pie de Página (Subir imagen)"
              value={brandForm.logoUrl}
              onChange={(newLogoUrl) => handleChange("logoUrl", newLogoUrl)}
              aspectRatio="circle"
              recommendedSize="500x500px (PNG o JPG transparente)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Nombre de la Marca *
              </label>
              <input
                type="text"
                required
                value={brandForm.brandName || ""}
                onChange={(e) => handleChange("brandName", e.target.value)}
                placeholder="Ej. AYLLU"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] font-serif font-bold text-sm focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Subtítulo / Lema de Cabecera *
              </label>
              <input
                type="text"
                value={brandForm.footerSubtitle || brandForm.slogan || ""}
                onChange={(e) => handleChange("footerSubtitle", e.target.value)}
                placeholder="Ej. Velas Botánicas & Creadores con Alma"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
              Descripción / Manifiesto del Pie de Página *
            </label>
            <textarea
              rows={3}
              value={brandForm.footerDescription || brandForm.aboutDescription || ""}
              onChange={(e) => handleChange("footerDescription", e.target.value)}
              placeholder="Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente..."
              className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] leading-relaxed focus:outline-none focus:border-[#8C7A6B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
              Insignia / Filosofía Destacada (Píldora)
            </label>
            <input
              type="text"
              value={brandForm.footerBadge || ""}
              onChange={(e) => handleChange("footerBadge", e.target.value)}
              placeholder="Ej. Filosofía AYNI • Apoyo Mutuo"
              className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
            />
          </div>
        </div>

        {/* BLOQUE 2: ATENCIÓN AL CLIENTE & CONTACTO */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-5">
          <div className="border-b border-[#E5E0DA] pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-serif text-base font-bold text-[#423D33] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F4EFEA] text-[#8C7A6B] inline-flex items-center justify-center text-xs font-mono font-bold">2</span>
                <span>Atención y Contacto: Datos Directos, Horarios & WhatsApp</span>
              </h4>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                Configura los canales por los que tus clientes se comunicarán contigo
              </p>
            </div>
            <Phone className="w-4 h-4 text-[#8C7A6B]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Título del Bloque de Contacto
              </label>
              <input
                type="text"
                value={brandForm.footerContactTitle || ""}
                onChange={(e) => handleChange("footerContactTitle", e.target.value)}
                placeholder="Ej. Atención & Contacto"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Correo Electrónico de Contacto
              </label>
              <input
                type="email"
                value={brandForm.contactEmail || ""}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="taller@aylluvelas.es"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Teléfono de Contacto Directo
              </label>
              <input
                type="text"
                value={brandForm.contactPhone || ""}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="+34 912 345 678"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>
          </div>

          {/* Horarios de Atención */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Horario Días Laborables (Lun - Vie)
              </label>
              <input
                type="text"
                value={brandForm.footerHoursWeekdays || ""}
                onChange={(e) => handleChange("footerHoursWeekdays", e.target.value)}
                placeholder="Ej. Lunes a Viernes: 09:30 - 19:30"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                Horario Fines de Semana (Sábados)
              </label>
              <input
                type="text"
                value={brandForm.footerHoursWeekends || ""}
                onChange={(e) => handleChange("footerHoursWeekends", e.target.value)}
                placeholder="Ej. Sábados: 10:00 - 14:00"
                className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
              />
            </div>
          </div>

          {/* WhatsApp Directo */}
          <div className="p-4 bg-[#FDFBF9] rounded-2xl border border-[#E5E0DA] space-y-4">
            <div className="flex items-center gap-2 text-[#423D33] font-bold text-xs">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>Canal de Atención WhatsApp</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                  Número de WhatsApp (con código país)
                </label>
                <input
                  type="text"
                  value={brandForm.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="+34 612 345 678"
                  className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                  Texto del Botón de WhatsApp
                </label>
                <input
                  type="text"
                  value={brandForm.footerWhatsAppText || ""}
                  onChange={(e) => handleChange("footerWhatsAppText", e.target.value)}
                  placeholder="Ej. Chat en Vivo con un Asesor"
                  className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                  Mensaje Predeterminado al Hacer Clic
                </label>
                <input
                  type="text"
                  value={brandForm.footerWhatsAppMessage || ""}
                  onChange={(e) => handleChange("footerWhatsAppMessage", e.target.value)}
                  placeholder="Hola Ayllu, me gustaría consultar..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] hover:bg-[#F7F4EE] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores Predeterminados</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#4A4541] hover:bg-[#35312E] disabled:opacity-60 text-white font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sincronizando con Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios del Pie de Página</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="space-y-3 pt-4 border-t border-[#E5E0DA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8C7A6B]" />
              <h4 className="font-serif text-sm font-bold text-[#423D33]">
                Vista Previa en Vivo del Pie de Página
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#25D366] font-semibold bg-[#25D366]/10 px-2.5 py-0.5 rounded-full border border-[#25D366]/20">
                Columna 1 y Atención & Contacto en vivo
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md border border-[#423D33]">
            <footer className="bg-[#2D2824] text-[#FDFBF9] pt-12 pb-6 px-6 sm:px-8 border-t border-[#423D33]">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                  {/* Col 1 (Editable) */}
                  <div className="space-y-3 relative p-3 rounded-2xl border border-[#D98B68]/30 bg-white/5">
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-[#D98B68] text-white text-[9px] font-bold uppercase tracking-wider">
                      Columna 1 (Actualizable)
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-[#FDFBF9] p-0.5 flex items-center justify-center shrink-0">
                        {brandForm.logoUrl ? (
                          <img
                            src={brandForm.logoUrl}
                            alt={brandForm.brandName || "Ayllu"}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="font-serif font-bold text-xs text-[#423D33]">
                            {(brandForm.brandName || "A").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-serif tracking-[0.2em] text-base font-bold uppercase text-white block">
                          {brandForm.brandName || "AYLLU"}
                        </span>
                        <span className="text-[9px] tracking-[0.15em] uppercase text-[#D9C5B2] font-semibold block">
                          {displaySubtitle}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/75 leading-relaxed">
                      {displayDescription}
                    </p>
                    {displayBadge && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] text-[#D9C5B2] font-medium border border-white/10">
                        <Sparkles className="w-2.5 h-2.5 text-[#D98B68]" />
                        <span>{displayBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Col 2 (Estándar Fijo) */}
                  <div className="space-y-3 opacity-80">
                    <h5 className="font-serif text-sm text-white font-normal uppercase tracking-wider border-b border-white/15 pb-1.5">
                      Navegación Rápida
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-white/75">
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Colección Botánica</li>
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Nosotros</li>
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Personaliza tu Vela</li>
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Jóvenes Artistas</li>
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Opiniones & Reseñas</li>
                      <li className="flex items-center gap-1.5"><span className="text-[#D9C5B2]">›</span> Guía de Cuidado</li>
                    </ul>
                  </div>

                  {/* Col 3 (Editable: Atención & Contacto) */}
                  <div className="space-y-3 relative p-3 rounded-2xl border border-[#25D366]/30 bg-white/5">
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-[#25D366] text-white text-[9px] font-bold uppercase tracking-wider">
                      Atención & Contacto (Actualizable)
                    </div>
                    <h5 className="font-serif text-sm text-white font-normal uppercase tracking-wider border-b border-white/15 pb-1.5 pt-1">
                      {displayContactTitle}
                    </h5>
                    <div className="space-y-2 text-[11px] text-white/80">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#D9C5B2]" />
                        <span>{displayEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#D9C5B2]" />
                        <span>{displayPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D9C5B2] shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-white/70">{displayHoursWeekdays}</span>
                          <span className="block text-white/70">{displayHoursWeekends}</span>
                        </div>
                      </div>
                      <div className="w-full px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mt-1">
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        <span>{displayWhatsAppText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 4 (Estándar Fijo) */}
                  <div className="space-y-3 opacity-80">
                    <h5 className="font-serif text-sm text-white font-normal uppercase tracking-wider border-b border-white/15 pb-1.5">
                      Comunidad • Club Botánico
                    </h5>
                    <p className="text-[11px] text-white/75 leading-relaxed">
                      Únete a nuestra membresía para recibir la Guía Digital de Rituales del Hogar y acceso anticipado...
                    </p>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        disabled
                        placeholder="Tu correo electrónico..."
                        className="w-full px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] text-white/60"
                      />
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 rounded-full bg-[#8C7A6B] text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        <span>Únete al Club</span>
                      </button>
                    </div>
                    <p className="text-[9px] text-white/50 italic">
                      * Sin spam. Puedes cancelar cuando quieras.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/60 gap-3">
                  <p>© {new Date().getFullYear()} {brandForm.brandName || "Ayllu"} Artesanal. Todos los derechos reservados.</p>
                  <div className="flex items-center gap-3">
                    <span>Políticas de Privacidad</span>
                    <span>•</span>
                    <span>Términos del Servicio</span>
                    <span>•</span>
                    <span>Envíos & Devoluciones</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
