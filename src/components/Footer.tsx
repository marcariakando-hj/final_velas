import React, { useState } from "react";
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

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { brandConfig } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const cleanWhatsAppNumber = (brandConfig.whatsappNumber || "+34 612 345 678").replace(/[^0-9]/g, "");

  return (
    <footer id="contacto-section" className="bg-[#2D2824] text-[#FDFBF9] pt-16 pb-8 border-t border-[#423D33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
          {/* Columna 1: Marca e Identidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-xs shrink-0 bg-[#FDFBF9] p-0.5 flex items-center justify-center">
                {Boolean(brandConfig.logoUrl && brandConfig.logoUrl.trim()) ? (
                  <img
                    src={brandConfig.logoUrl}
                    alt={brandConfig.brandName}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/10 text-white flex items-center justify-center font-serif font-bold text-sm">
                    {brandConfig.brandName ? brandConfig.brandName.charAt(0) : "A"}
                  </div>
                )}
              </div>
              <div>
                <span className="font-serif tracking-[0.2em] text-lg font-bold uppercase text-white block">
                  {brandConfig.brandName}
                </span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#D9C5B2] font-semibold block">
                  Velas Botánicas & Creadores con Alma
                </span>
              </div>
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente en colaboración con jóvenes creadores e ilustradores con habilidades especiales. Cada pieza ilumina un hogar e impulsa la autonomía inclusiva.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] text-[#D9C5B2] font-medium border border-white/10">
              <Sparkles className="w-3 h-3 text-[#D98B68]" />
              <span>Filosofía AYNI • Apoyo Mutuo</span>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
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

          {/* Columna 3: Atención al Cliente & Contacto */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-normal uppercase tracking-wider border-b border-white/15 pb-2">
              Atención & Contacto
            </h4>
            <div className="space-y-3 text-xs text-white/80">
              <a
                href={`mailto:${brandConfig.contactEmail}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Correo Electrónico</span>
                  <span>{brandConfig.contactEmail}</span>
                </div>
              </a>

              <a
                href={`tel:${brandConfig.contactPhone}`}
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Teléfono de Contacto</span>
                  <span>{brandConfig.contactPhone}</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D9C5B2] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#D9C5B2]">Horario de Atención</span>
                  <span className="text-white/70 block">Lunes a Viernes: 09:30 - 19:30</span>
                  <span className="text-white/70 block">Sábados: 10:00 - 14:00</span>
                </div>
              </div>

              {/* Direct WhatsApp Button */}
              <a
                href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent("Hola Ayllu, me gustaría consultar sobre sus velas botánicas personalizadas y proyectos con jóvenes creadores.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat en Vivo con un Asesor</span>
              </a>
            </div>
          </div>

          {/* Columna 4: Comunidad / Newsletter */}
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

        {/* Barra Inferior (Sub-footer): Línea única */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© 2026 {brandConfig.brandName} Artesanal. Todos los derechos reservados.</p>
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
