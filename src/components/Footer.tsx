import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  ShieldCheck
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { brandConfig } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [liveConfig, setLiveConfig] = useState<Partial<typeof brandConfig>>({});

  // Carga reactiva directa desde Supabase al montar el componente
  useEffect(() => {
    let isMounted = true;
    const fetchFooterConfig = async () => {
      if (!isSupabaseConfigured()) return;

      // 1. Consulta en la tabla oficial store_settings
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("key, value")
          .in("key", ["brand_config", "footer_settings"]);

        if (isMounted && !error && data && data.length > 0) {
          const row = data.find((d) => d.key === "brand_config") || data[0];
          if (row?.value && typeof row.value === "object") {
            setLiveConfig((prev) => ({ ...prev, ...row.value }));
          }
        }
      } catch (err) {
        console.warn("Aviso al consultar configuración del pie de página en Supabase store_settings:", err);
      }

      // 2. Consulta de respaldo si existe tabla relacional footer_settings
      try {
        const { data } = await supabase
          .from("footer_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (isMounted && data) {
          setLiveConfig((prev) => ({
            ...prev,
            brandName: data.brand_name || prev.brandName,
            logoUrl: data.logo_url || prev.logoUrl,
            footerSubtitle: data.footer_subtitle || prev.footerSubtitle,
            footerDescription: data.footer_description || prev.footerDescription,
            footerBadge: data.footer_badge || prev.footerBadge,
            contactEmail: data.contact_email || prev.contactEmail,
            contactPhone: data.contact_phone || prev.contactPhone,
            whatsappNumber: data.whatsapp_number || prev.whatsappNumber,
            footerHoursWeekdays: data.footer_hours_weekdays || prev.footerHoursWeekdays,
            footerHoursWeekends: data.footer_hours_weekends || prev.footerHoursWeekends,
            footerWhatsAppText: data.footer_whatsapp_text || prev.footerWhatsAppText,
            footerWhatsAppMessage: data.footer_whatsapp_message || prev.footerWhatsAppMessage,
          }));
        }
      } catch {
        // Silencioso si la tabla secundaria no existe
      }
    };

    fetchFooterConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const elem = document.getElementById(`${sectionId}-section`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Combinar estado global de StoreContext con la carga en vivo de Supabase
  const activeConfig = { ...brandConfig, ...liveConfig };

  const cleanWhatsAppNumber = (activeConfig.whatsappNumber || activeConfig.contactPhone || "+34 612 345 678").replace(/[^0-9]/g, "");
  const defaultWhatsAppMsg = activeConfig.footerWhatsAppMessage || `Hola ${activeConfig.brandName || "Ayllu"}, me gustaría consultar sobre sus velas botánicas personalizadas y proyectos con jóvenes creadores.`;

  // Subtítulo: prioridad footerSubtitle, slogan, y fallback
  const displaySubtitle = activeConfig.footerSubtitle || activeConfig.slogan || "Velas Botánicas & Creadores con Alma";
  
  // Descripción: prioridad footerDescription, aboutDescription, y fallback
  const displayDescription = activeConfig.footerDescription || activeConfig.aboutDescription || 
    "Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente en colaboración con jóvenes creadores e ilustradores con habilidades especiales. Cada pieza ilumina un hogar e impulsa la autonomía inclusiva.";

  const displayBadge = activeConfig.footerBadge || "Filosofía AYNI • Apoyo Mutuo";
  const displayContactTitle = activeConfig.footerContactTitle || "Atención & Contacto";
  const displayEmail = activeConfig.contactEmail || "taller@aylluvelas.es";
  const displayPhone = activeConfig.contactPhone || activeConfig.whatsappNumber || "+34 912 345 678";
  const displayHoursWeekdays = activeConfig.footerHoursWeekdays || "Lunes a Viernes: 09:30 - 19:30";
  const displayHoursWeekends = activeConfig.footerHoursWeekends || "Sábados: 10:00 - 14:00";
  const displayWhatsAppText = activeConfig.footerWhatsAppText || "Chat en Vivo con un Asesor";

  return (
    <footer id="contacto-section" className="bg-[#2D2824] text-[#FDFBF9] pt-16 pb-8 border-t border-[#423D33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
          {/* Columna 1: Marca e Identidad (Actualizable desde el Administrador y Supabase) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-xs shrink-0 bg-[#FDFBF9] p-0.5 flex items-center justify-center">
                {Boolean(activeConfig.logoUrl && activeConfig.logoUrl.trim()) ? (
                  <img
                    src={activeConfig.logoUrl}
                    alt={activeConfig.brandName || "Ayllu"}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/10 text-white flex items-center justify-center font-serif font-bold text-sm">
                    {activeConfig.brandName ? activeConfig.brandName.charAt(0) : "A"}
                  </div>
                )}
              </div>
              <div>
                <span className="font-serif tracking-[0.2em] text-lg font-bold uppercase text-white block">
                  {activeConfig.brandName || "AYLLU"}
                </span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#D9C5B2] font-semibold block">
                  {displaySubtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              {displayDescription}
            </p>

            {displayBadge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] text-[#D9C5B2] font-medium border border-white/10">
                <Sparkles className="w-3 h-3 text-[#D98B68]" />
                <span>{displayBadge}</span>
              </div>
            )}
          </div>

          {/* Columna 2: Navegación Rápida (Estándar Fijo) */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-normal uppercase tracking-wider border-b border-white/15 pb-2">
              Navegación Rápida
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <button
                  onClick={() => handleNavClick("coleccion")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Colección Botánica</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("nosotros")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Nosotros</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("personalizar")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Personaliza tu Vela</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("colaboradores")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Jóvenes Artistas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("comentarios")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Opiniones & Reseñas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("cuidado")}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-[#D9C5B2]">›</span>
                  <span>Guía de Cuidado</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente & Contacto (Actualizable desde el Administrador) */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-normal uppercase tracking-wider border-b border-white/15 pb-2">
              {displayContactTitle}
            </h4>
            <div className="space-y-3 text-xs text-white/80">
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Correo Electrónico</span>
                  <span>{displayEmail}</span>
                </div>
              </a>

              <a
                href={`tel:${displayPhone}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Teléfono de Contacto</span>
                  <span>{displayPhone}</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Horario de Atención</span>
                  <span className="text-white/70 block">{displayHoursWeekdays}</span>
                  <span className="text-white/70 block">{displayHoursWeekends}</span>
                </div>
              </div>

              {/* Direct WhatsApp Button */}
              {cleanWhatsAppNumber && (
                <a
                  href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(defaultWhatsAppMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>{displayWhatsAppText}</span>
                </a>
              )}
            </div>
          </div>

          {/* Columna 4: Comunidad / Newsletter (Estándar Fijo) */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-normal uppercase tracking-wider border-b border-white/15 pb-2">
              Comunidad • Club Botánico
            </h4>
            <p className="text-xs text-white/75 leading-relaxed">
              Únete a nuestra membresía para recibir la Guía Digital de Rituales del Hogar y acceso anticipado a piezas numeradas.
            </p>

            {subscribed ? (
              <div className="p-3.5 rounded-2xl bg-white/15 text-[#D9C5B2] text-xs flex items-center gap-2 border border-white/15 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>¡Gracias por unirte! Te hemos enviado la guía a tu correo.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    required
                    type="email"
                    placeholder="Tu correo electrónico..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-xs text-white placeholder-white/45 focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] focus:bg-white/15"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#8C7A6B] hover:bg-[#9d8b7c] text-white text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Únete al Club</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D9C5B2]" />
                </button>
              </form>
            )}

            <p className="text-[10px] text-white/50 italic">
              * Sin spam. Puedes cancelar tu suscripción en cualquier momento con un clic.
            </p>
          </div>
        </div>

        {/* Barra Inferior (Sub-footer): Línea estándar */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} {activeConfig.brandName || "Ayllu"} Artesanal. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#terminos" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Políticas de Privacidad
            </a>
            <span>•</span>
            <a href="#privacidad" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Términos del Servicio
            </a>
            <span>•</span>
            <a href="#envios" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
              Envíos & Devoluciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
