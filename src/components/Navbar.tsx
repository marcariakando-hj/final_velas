import React from "react";
import {
  ShoppingBag,
  Sparkles,
  Flame,
  BookOpen,
  Layers,
  Users,
  Palette,
  User,
  Shield,
  Heart,
  MessageSquare
} from "lucide-react";
import { useStore } from "../context/StoreContext";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  activeSection,
  onNavigate,
  onOpenAuthModal,
  onOpenAdminModal,
}) => {
  const { brandConfig, currentUser } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-[#E5E0DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border border-[#8C7A6B]/30 shadow-xs group-hover:scale-105 transition-transform bg-[#FDFBF9] shrink-0 p-0.5 flex items-center justify-center">
              {Boolean(brandConfig.logoUrl && brandConfig.logoUrl.trim()) ? (
                <img
                  src={brandConfig.logoUrl}
                  alt={brandConfig.brandName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#4A4541] text-white flex items-center justify-center font-serif font-bold text-sm">
                  {brandConfig.brandName ? brandConfig.brandName.charAt(0) : "A"}
                </div>
              )}
            </div>
            <div>
              <span className="font-serif tracking-[0.18em] text-lg sm:text-xl font-medium uppercase text-[#423D33]">
                {brandConfig.brandName}
              </span>
              <span className="block text-[9px] tracking-[0.22em] uppercase text-[#8C7A6B] font-semibold truncate max-w-[200px] sm:max-w-none">
                {brandConfig.slogan}
              </span>
            </div>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest text-[#423D33]/75 font-medium">
            <button
              id="nav-coleccion-btn"
              onClick={() => onNavigate("coleccion")}
              className={`hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "coleccion"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              Colección
            </button>
            <button
              id="nav-nosotros-btn"
              onClick={() => onNavigate("nosotros")}
              className={`flex items-center gap-1.5 hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "nosotros"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#D98B68]" />
              <span>Nosotros</span>
            </button>
            <button
              id="nav-colaboradores-btn"
              onClick={() => onNavigate("colaboradores")}
              className={`flex items-center gap-1.5 hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "colaboradores"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>Artistas</span>
            </button>
            <button
              id="nav-personalizar-btn"
              onClick={() => onNavigate("personalizar")}
              className={`flex items-center gap-1.5 hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "personalizar"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeSection === "personalizar" ? "text-[#8C7A6B]" : "text-[#D98B68]"}`} />
              <span>Personalizar</span>
            </button>
            <button
              id="nav-comentarios-btn"
              onClick={() => onNavigate("comentarios")}
              className={`flex items-center gap-1.5 hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "comentarios"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>Opiniones</span>
            </button>
            <button
              id="nav-cuidado-btn"
              onClick={() => onNavigate("cuidado")}
              className={`hover:text-[#423D33] transition-all py-1.5 relative cursor-pointer ${
                activeSection === "cuidado"
                  ? "text-[#423D33] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8C7A6B] after:rounded-full"
                  : "text-[#423D33]/75"
              }`}
            >
              Guía
            </button>
          </nav>

          {/* Right Controls: Auth/Admin & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard Shortcut (Only if logged in as Admin) */}
            {currentUser?.role === "administrador" && (
              <button
                id="admin-dashboard-btn"
                onClick={onOpenAdminModal}
                className="px-3 py-2 rounded-full bg-[#8C7A6B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#786759] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Abrir Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5 text-[#D9C5B2]" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Auth / Account Profile Button */}
            <button
              id="user-account-btn"
              onClick={onOpenAuthModal}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-full border border-[#E5E0DA] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentUser
                  ? "bg-[#FAF7F2] text-[#423D33] hover:bg-[#F2EDE7]"
                  : "bg-white text-[#423D33] hover:bg-[#F4EFEA]"
              }`}
              title={currentUser ? `Cuenta: ${currentUser.name}` : "Iniciar Sesión"}
            >
              {currentUser?.role === "administrador" ? (
                <Shield className="w-3.5 h-3.5 text-[#D98B68]" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#8C7A6B]" />
              )}
              <span className="hidden sm:inline">
                {currentUser ? currentUser.name.split(" ")[0] : "Entrar"}
              </span>
            </button>

            {/* Cart Button */}
            <button
              id="cart-drawer-toggle-btn"
              onClick={onOpenCart}
              className="relative px-3.5 sm:px-4 py-2.5 rounded-full bg-[#4A4541] text-[#FDFBF9] hover:bg-[#35312E] transition-all cursor-pointer flex items-center gap-2 shadow-xs group text-xs uppercase tracking-wider font-semibold"
              aria-label="Abrir cesta de compras"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D9C5B2] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cesta</span>
              {cartCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-[#8C7A6B] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2.5 border-t border-[#E5E0DA] text-[9px] sm:text-[10px] uppercase tracking-wider text-[#423D33]/80">
          <button
            onClick={() => onNavigate("coleccion")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeSection === "coleccion"
                ? "text-[#423D33] font-bold"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Colección</span>
          </button>
          <button
            onClick={() => onNavigate("nosotros")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeSection === "nosotros"
                ? "text-[#423D33] font-bold"
                : "text-[#D98B68] hover:text-[#423D33]"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Nosotros</span>
          </button>
          <button
            onClick={() => onNavigate("colaboradores")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeSection === "colaboradores"
                ? "text-[#423D33] font-bold"
                : "text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Artistas</span>
          </button>
          <button
            id="mobile-nav-personalizar-btn"
            onClick={() => onNavigate("personalizar")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer relative ${
              activeSection === "personalizar"
                ? "text-[#423D33] font-bold"
                : "text-[#D98B68] hover:text-[#423D33]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalizar</span>
          </button>
          <button
            onClick={() => onNavigate("comentarios")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeSection === "comentarios"
                ? "text-[#423D33] font-bold"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Opiniones</span>
          </button>
          <button
            onClick={() => onNavigate("cuidado")}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeSection === "cuidado"
                ? "text-[#423D33] font-bold"
                : "text-[#423D33]/70 hover:text-[#423D33]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía</span>
          </button>
          <button
            onClick={onOpenAuthModal}
            className="flex flex-col items-center gap-1 hover:text-[#423D33] cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Cuenta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
