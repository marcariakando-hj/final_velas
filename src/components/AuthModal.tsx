import React, { useState } from "react";
import {
  X,
  User,
  Shield,
  Lock,
  Mail,
  UserCheck,
  LogOut,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound
} from "lucide-react";
import { useStore } from "../context/StoreContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel,
}) => {
  const { currentUser, loginUser, registerUser, logoutUser, orders } = useStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"cliente" | "administrador">("cliente");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ type: "error", text: "Por favor introduce tu correo electrónico." });
      return;
    }

    const res = loginUser(email, password);
    if (res.success) {
      setStatusMessage({ type: "success", text: res.message });
      setTimeout(() => {
        setStatusMessage(null);
        if (currentUser?.role === "administrador" || email.includes("admin")) {
          // If admin, keep open or offer dashboard
        }
      }, 1200);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setStatusMessage({ type: "error", text: "Por favor completa tu nombre y correo." });
      return;
    }

    const res = registerUser({ name, email, password, role });
    if (res.success) {
      setStatusMessage({ type: "success", text: res.message });
      setTimeout(() => {
        setStatusMessage(null);
      }, 1500);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = loginUser(demoEmail, demoPass);
    if (res.success) {
      setStatusMessage({ type: "success", text: res.message });
      setTimeout(() => {
        setStatusMessage(null);
      }, 1000);
    } else {
      setStatusMessage({ type: "error", text: res.message });
    }
  };

  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FDFBF9] rounded-3xl max-w-md w-full border border-[#E5E0DA] shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-6 bg-[#F4EFEA] border-b border-[#E5E0DA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4A4541] text-white flex items-center justify-center">
              {currentUser ? (
                currentUser.role === "administrador" ? (
                  <Shield className="w-4 h-4 text-[#D9C5B2]" />
                ) : (
                  <User className="w-4 h-4 text-[#D9C5B2]" />
                )
              ) : (
                <KeyRound className="w-4 h-4 text-[#D9C5B2]" />
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#423D33]">
                {currentUser ? "Tu Cuenta en Ayllu" : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h3>
              <p className="text-[11px] text-[#8C7A6B]">
                {currentUser
                  ? `Rol activo: ${currentUser.role === "administrador" ? "Administrador General" : "Cliente"}`
                  : "Acceso seguro a la plataforma"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white text-[#423D33] hover:bg-[#423D33] hover:text-white transition-colors cursor-pointer border border-[#E5E0DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Status feedback message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-[#608058]/15 text-[#35522e] border border-[#608058]/30"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* If already logged in: View Profile & Quick Actions */}
          {currentUser ? (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-2xl border border-[#E5E0DA] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#EAE4DD] overflow-hidden border border-[#D9C5B2] shrink-0">
                  {Boolean(currentUser.avatar && currentUser.avatar.trim()) ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#423D33] font-bold font-serif text-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-[#423D33] text-sm truncate">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        currentUser.role === "administrador"
                          ? "bg-[#8C7A6B] text-white"
                          : "bg-[#F2EDE7] text-[#8C7A6B]"
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A6B] truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Admin Button Highlight */}
              {currentUser.role === "administrador" && (
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAdminPanel) onOpenAdminPanel();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#D9C5B2]" />
                  <span>Acceder al Panel de Administración</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Client Order Summary */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#423D33] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    <span>Tus Pedidos en Ayllu</span>
                  </span>
                  <span className="text-[#8C7A6B] font-bold">{userOrders.length} pedidos</span>
                </div>

                {userOrders.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {userOrders.slice(0, 2).map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-[#423D33]">{ord.id}</span>
                          <span className="text-[#8C7A6B] block">
                            {ord.items.length} {ord.items.length === 1 ? "artículo" : "artículos"} • ${ord.total.toFixed(2)} USD
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#F4EFEA] text-[#8C7A6B] font-medium text-[10px]">
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#423D33]/60 italic">
                    Aún no has realizado pedidos. Explora nuestro catálogo y personaliza tu primera vela.
                  </p>
                )}
              </div>

              {/* Log Out Button */}
              <button
                onClick={() => {
                  logoutUser();
                  setStatusMessage({ type: "success", text: "Sesión cerrada correctamente." });
                }}
                className="w-full py-2.5 px-4 rounded-full border border-[#E5E0DA] text-[#423D33] text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            /* Login / Register Forms */
            <div className="space-y-5">
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#F2EDE7] rounded-full border border-[#E5E0DA] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setStatusMessage(null);
                  }}
                  className={`py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-[#423D33] shadow-xs"
                      : "text-[#8C7A6B] hover:text-[#423D33]"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setStatusMessage(null);
                  }}
                  className={`py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white text-[#423D33] shadow-xs"
                      : "text-[#8C7A6B] hover:text-[#423D33]"
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {mode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all cursor-pointer shadow-xs"
                  >
                    Iniciar Sesión
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Carmen Navarro"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1">
                      Tipo de Perfil
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as "cliente" | "administrador")}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                    >
                      <option value="cliente">Cliente / Comprador</option>
                      <option value="administrador">Administrador de Ayllu</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all cursor-pointer shadow-xs"
                  >
                    Crear Cuenta
                  </button>
                </form>
              )}

              {/* Demo Accounts Quick Login Box */}
              <div className="pt-3 border-t border-[#E5E0DA] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block text-center">
                  Cuentas de Demostración Rápidas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@ayllu.es", "admin")}
                    className="p-2 rounded-xl bg-[#8C7A6B]/15 hover:bg-[#8C7A6B]/25 border border-[#8C7A6B]/30 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-[#423D33] block flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#D98B68]" />
                      <span>Admin Ayllu</span>
                    </span>
                    <span className="text-[9px] text-[#8C7A6B] block">admin@ayllu.es</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("cliente@ayllu.es", "cliente")}
                    className="p-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E5E0DA] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-[#423D33] block flex items-center gap-1">
                      <User className="w-3 h-3 text-[#8C7A6B]" />
                      <span>Cliente Demo</span>
                    </span>
                    <span className="text-[9px] text-[#8C7A6B] block">cliente@ayllu.es</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
