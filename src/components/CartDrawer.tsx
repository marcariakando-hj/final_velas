import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Gift,
  Truck,
  Check,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Building2,
  Banknote,
  Upload,
  FileCheck,
  AlertCircle,
  Copy,
  CheckCircle2,
  Lock,
  ChevronDown,
  Info,
  Leaf
} from "lucide-react";
import confetti from "canvas-confetti";
import { CartItem, PaymentDetails } from "../types";
import { useStore } from "../context/StoreContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

type PaymentMethodType = "transferencia" | "efectivo";

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const { brandConfig, currentUser, createOrder } = useStore();

  const [giftNote, setGiftNote] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderCode, setCompletedOrderCode] = useState<string>("");

  // Customer shipping details
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || "");
  const [customerCity, setCustomerCity] = useState(currentUser?.city || "Quito");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "+1 (555) 000-0000");

  // Payment Selection States (Exclusively Transferencia Bancaria or Efectivo)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("transferencia");

  // Bank Transfer Form States
  const [transferBankName, setTransferBankName] = useState("Banco Pichincha / Banco Guayaquil");
  const [bankReferenceNumber, setBankReferenceNumber] = useState("");
  const [originAccountHolder, setOriginAccountHolder] = useState("");
  const [uploadedReceipt, setUploadedReceipt] = useState<{
    name: string;
    size: string;
    previewUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Cash on Delivery States
  const [cashChangeFor, setCashChangeFor] = useState("Monto exacto");
  const [cashCustomAmount, setCashCustomAmount] = useState("");
  const [cashDeliveryNotes, setCashDeliveryNotes] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    let itemPrice = item.candle.price;
    if (item.customEngraving) itemPrice += 3.5;
    if (item.giftWrap) itemPrice += 2.5;
    return acc + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = brandConfig.shippingFreeThreshold || 50;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 4.5;
  const total = subtotal + shippingCost;

  // Copy Bank Account Helper
  const handleCopyAccount = (accNum: string) => {
    navigator.clipboard.writeText(accNum.replace(/\s/g, ""));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // File Upload Handlers for Bank Transfer Receipt
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      setUploadedReceipt({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      setUploadedReceipt({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
      });
    }
  };

  const handleFinishOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentDetails: PaymentDetails =
      paymentMethod === "transferencia"
        ? {
            method: "Transferencia Bancaria",
            bankName: transferBankName,
            referenceNumber: bankReferenceNumber.trim() || undefined,
            receiptUrl: uploadedReceipt?.previewUrl || undefined,
            receiptFileName: uploadedReceipt?.name || undefined,
            verifiedByAdmin: false,
          }
        : {
            method: "Efectivo (Pago contra entrega)",
            cashChangeFor: cashChangeFor === "Otro" ? `$${cashCustomAmount}` : cashChangeFor,
            deliveryInstructions: cashDeliveryNotes.trim() || undefined,
          };

    // Register order in store for admin verification & management
    const newOrder = createOrder({
      userId: currentUser?.id,
      customerName: customerName || "Cliente Ayllu",
      customerEmail: customerEmail || "cliente@email.com",
      customerPhone: customerPhone || "+1 (555) 000-0000",
      shippingAddress: customerAddress || "Dirección de Entrega",
      shippingCity: customerCity || "Ecuador",
      items: cartItems.map((item) => ({
        ...item,
        selectedWaxType: item.selectedWaxType || item.candle.waxType || "Soja",
      })),
      subtotal,
      shippingCost,
      total,
      status: "Pendiente de verificación",
      paymentMethod:
        paymentMethod === "transferencia"
          ? "Transferencia Bancaria"
          : "Efectivo (Pago contra entrega)",
      paymentDetails,
      notes: giftNote,
    });

    setCompletedOrderCode(newOrder.id);

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#8C7A6B", "#4A4541", "#608058", "#F2EDE7", "#D98B68"],
      });
    } catch {
      // Confetti fallback
    }
    setOrderComplete(true);
  };

  const handleCloseAll = () => {
    setOrderComplete(false);
    setIsCheckingOut(false);
    setUploadedReceipt(null);
    setBankReferenceNumber("");
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#2D2824]/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        id="cart-drawer-panel"
        className="w-full max-w-lg bg-[#FDFBF9] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5E0DA] relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E0DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#8C7A6B]" />
            <h2 className="font-serif text-lg font-normal text-[#423D33]">
              {isCheckingOut ? "Checkout • Verificación de Pago" : `Cesta de ${brandConfig.brandName}`}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F2EDE7] text-[#423D33] border border-[#E5E0DA]">
              {cartItems.reduce((a, b) => a + b.quantity, 0)} {cartItems.length === 1 ? "artículo" : "artículos"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE7] hover:bg-[#E5E0DA] text-[#423D33] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Cerrar cesta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {!orderComplete && (
          <div className="px-5 py-3 bg-[#F2EDE7] border-b border-[#E5E0DA] text-xs">
            <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-[#423D33]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#8C7A6B]" />
                {remainingForFreeShipping === 0
                  ? "¡Envío estándar GRATIS conseguido!"
                  : `Añade $${remainingForFreeShipping.toFixed(2)} para Envío Gratis`}
              </span>
              <span className="font-bold text-[10px]">{progressToFreeShipping.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E5E0DA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8C7A6B] rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {orderComplete ? (
            /* ORDER SUCCESS VIEW */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#608058]/20 text-[#608058] flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-normal text-[#423D33]">
                  ¡Pedido Registrado con Éxito!
                </h3>
                <p className="text-xs text-[#8C7A6B] font-bold">
                  Código de pedido: #{completedOrderCode}
                </p>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5E0DA] text-xs text-[#423D33]/85 text-center leading-relaxed">
                {paymentMethod === "transferencia" ? (
                  <p>
                    Tu pedido ha sido enviado al <strong>panel del administrador</strong> con los datos de la transferencia para su verificación manual. Una vez confirmado el pago, iniciaremos la preparación artesanal.
                  </p>
                ) : (
                  <p>
                    Tu pedido ha sido enviado al <strong>panel del administrador</strong> bajo la modalidad de <strong>Pago contra entrega (Efectivo)</strong>. Realizarás el pago en efectivo directamente al momento de recibir tus velas botánicas.
                  </p>
                )}
              </div>

              {/* Order Summary Confirmation Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#E5E0DA] text-xs text-[#423D33] text-left space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2">
                  <span className="font-bold text-[#8C7A6B] uppercase text-[10px] tracking-wider">
                    Detalles Registrados
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAA93E]/20 text-[#9A6214] font-bold">
                    Pendiente de verificación
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p><strong>Cliente:</strong> {customerName}</p>
                  <p><strong>Dirección:</strong> {customerAddress}, {customerCity}</p>
                  <p><strong>Teléfono:</strong> {customerPhone}</p>
                  <p><strong>Método de Pago:</strong> {
                    paymentMethod === "transferencia"
                      ? "Transferencia Bancaria"
                      : "Efectivo (Pago contra entrega)"
                  }</p>
                  {paymentMethod === "transferencia" && bankReferenceNumber && (
                    <p className="text-[#8C7A6B]">
                      <strong>Nº Referencia:</strong> {bankReferenceNumber}
                    </p>
                  )}
                  {uploadedReceipt && (
                    <p className="text-[#608058] flex items-center gap-1 text-[11px] font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Comprobante adjuntado: {uploadedReceipt.name}</span>
                    </p>
                  )}
                  {paymentMethod === "efectivo" && (
                    <p className="text-[#8C7A6B]">
                      <strong>Cambio solicitado:</strong> {cashChangeFor === "Otro" ? `$${cashCustomAmount}` : cashChangeFor}
                    </p>
                  )}
                  <p className="pt-2 border-t border-[#E5E0DA] flex justify-between font-serif text-sm font-bold">
                    <span>Total a Liquidar:</span>
                    <span>${total.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseAll}
                className="w-full py-3.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                Volver a la Tienda
              </button>
            </div>
          ) : isCheckingOut ? (
            /* CHECKOUT & PAYMENT FORM */
            <form onSubmit={handleFinishOrder} className="space-y-5 text-xs">
              {/* Back to Cart & Title */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DA]">
                <span className="font-serif font-bold text-sm text-[#423D33]">
                  1. Datos de Entrega & Contacto
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-[11px] text-[#8C7A6B] hover:text-[#423D33] underline cursor-pointer"
                >
                  Volver a la cesta
                </button>
              </div>

              {/* Customer Shipping Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Lucía Morales"
                    className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                      Dirección de Entrega *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle principal, número de casa/apto"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                      Ciudad / Sector *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="Quito, Guayaquil, Cuenca..."
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION BLOCK (EXCLUSIVELY 2 OPTIONS) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2">
                  <span className="font-serif font-bold text-sm text-[#423D33] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#608058]" />
                    <span>2. Método de Pago</span>
                  </span>
                  <span className="text-[10px] text-[#8C7A6B] font-semibold">Exclusivo: Transferencia o Efectivo</span>
                </div>

                {/* 2 Payment Options Tabs */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Transferencia Bancaria */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      paymentMethod === "transferencia"
                        ? "border-[#8C7A6B] bg-[#FAF7F2] ring-2 ring-[#8C7A6B]/30 shadow-xs"
                        : "border-[#E5E0DA] bg-white hover:border-[#8C7A6B]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className={`w-5 h-5 ${paymentMethod === "transferencia" ? "text-[#8C7A6B]" : "text-[#423D33]/70"}`} />
                      {paymentMethod === "transferencia" && (
                        <span className="w-4 h-4 rounded-full bg-[#8C7A6B] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#423D33] block">
                        Transferencia Bancaria
                      </span>
                      <span className="text-[10px] text-[#8C7A6B]">
                        Verificación por Administrador
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Efectivo (Pago contra entrega) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      paymentMethod === "efectivo"
                        ? "border-[#8C7A6B] bg-[#FAF7F2] ring-2 ring-[#8C7A6B]/30 shadow-xs"
                        : "border-[#E5E0DA] bg-white hover:border-[#8C7A6B]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className={`w-5 h-5 ${paymentMethod === "efectivo" ? "text-[#608058]" : "text-[#423D33]/70"}`} />
                      {paymentMethod === "efectivo" && (
                        <span className="w-4 h-4 rounded-full bg-[#608058] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#423D33] block">
                        Efectivo Contra Entrega
                      </span>
                      <span className="text-[10px] text-[#8C7A6B]">
                        Pagas al recibir tu pedido
                      </span>
                    </div>
                  </button>
                </div>

                {/* PAYMENT METHOD DETAIL PANELS */}
                {/* 1. TRANSFERENCIA BANCARIA */}
                {paymentMethod === "transferencia" && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-[#423D33] flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#8C7A6B]" />
                        <span>Datos para Transferir (${total.toFixed(2)} USD)</span>
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#608058]/15 text-[#608058] font-bold">
                        Revisión en Panel Admin
                      </span>
                    </div>

                    <p className="text-[11px] text-[#423D33]/75 leading-relaxed">
                      Realiza la transferencia por el total de <strong>${total.toFixed(2)}</strong> a la siguiente cuenta oficial:
                    </p>

                    {/* Bank Info Box */}
                    <div className="p-3 bg-white rounded-xl border border-[#E5E0DA] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C7A6B]">Entidad Bancaria:</span>
                        <span className="font-semibold text-[#423D33]">Banco Pichincha / Cta. Corriente</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C7A6B]">Beneficiario:</span>
                        <span className="font-semibold text-[#423D33]">AYLLU VELAS BOTÁNICAS S.A.</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E5E0DA]/60">
                        <span className="text-[#8C7A6B]">Nº de Cuenta:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-[#423D33] text-[11px]">
                            2100485921
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount("2100485921")}
                            className="p-1 text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                            title="Copiar número de cuenta"
                          >
                            {copiedAccount ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#608058]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C7A6B]">RUC / Identificación:</span>
                        <span className="font-mono text-[#423D33]">1792345890001</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C7A6B]">Monto a Transferir:</span>
                        <span className="font-bold text-[#608058]">${total.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {/* Reference Number Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">
                        Número de Referencia o Comprobante Bancario
                      </label>
                      <input
                        type="text"
                        value={bankReferenceNumber}
                        onChange={(e) => setBankReferenceNumber(e.target.value)}
                        placeholder="Ej. TRANS-849201 o código de autorización"
                        className="w-full p-2.5 text-xs rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                      />
                    </div>

                    {/* RECEIPT UPLOAD ZONE */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-[#8C7A6B] uppercase">
                        Adjuntar Comprobante de Transferencia (Foto o PDF)
                      </span>

                      {uploadedReceipt ? (
                        <div className="p-3 bg-white rounded-xl border border-[#608058]/50 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {Boolean(uploadedReceipt.previewUrl && uploadedReceipt.previewUrl.trim()) ? (
                              <img
                                src={uploadedReceipt.previewUrl}
                                alt="Comprobante"
                                className="w-9 h-9 rounded-lg object-cover border border-[#E5E0DA]"
                              />
                            ) : (
                              <FileCheck className="w-7 h-7 text-[#608058]" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#423D33] truncate">
                                {uploadedReceipt.name}
                              </p>
                              <span className="text-[10px] text-[#608058]">
                                {uploadedReceipt.size} • Listo para envío al administrador
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedReceipt(null)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`p-4 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer bg-white ${
                            isDragging
                              ? "border-[#8C7A6B] bg-[#FAF7F2]"
                              : "border-[#E5E0DA] hover:border-[#8C7A6B]/50"
                          }`}
                        >
                          <input
                            type="file"
                            id="receipt-file-input"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-1">
                            <Upload className="w-5 h-5 text-[#8C7A6B] mx-auto" />
                            <p className="text-xs font-semibold text-[#423D33]">
                              Arrastra el comprobante o haz clic para subirlo
                            </p>
                            <p className="text-[10px] text-[#8C7A6B]">
                              Formatos: JPG, PNG o PDF (Máx. 10MB)
                            </p>
                          </label>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-[#8C7A6B] flex items-center gap-1">
                      <Info className="w-3 h-3 text-[#8C7A6B] shrink-0" />
                      <span>El administrador cotejará los datos antes de despachar el pedido.</span>
                    </p>
                  </div>
                )}

                {/* 2. EFECTIVO (PAGO CONTRA ENTREGA) */}
                {paymentMethod === "efectivo" && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-[#423D33] flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-[#608058]" />
                        <span>Pago en Efectivo al Recibir (${total.toFixed(2)} USD)</span>
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#608058]/15 text-[#608058] font-bold">
                        Contra Entrega
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#E5E0DA] space-y-2 text-xs">
                      <p className="text-[#423D33]/80 leading-relaxed">
                        El cobro se realizará <strong>en efectivo al momento de entregar tus velas</strong> en la dirección registrada. Por favor ten preparado el monto acordado.
                      </p>

                      <div className="pt-2 border-t border-[#E5E0DA]/70">
                        <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1.5">
                          ¿Con cuánto dinero pagarás? (Para llevarte el cambio exacto)
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {["Monto exacto", "$20", "$50", "Otro"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setCashChangeFor(opt)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                                cashChangeFor === opt
                                  ? "bg-[#4A4541] text-white"
                                  : "bg-[#F2EDE7] text-[#423D33] hover:bg-[#E5E0DA]"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {cashChangeFor === "Otro" && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={cashCustomAmount}
                              onChange={(e) => setCashCustomAmount(e.target.value)}
                              placeholder="Ej. Pagaré con billete de $100"
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-[#FDFBF9] text-xs text-[#423D33] outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#E5E0DA]/70">
                        <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">
                          Indicaciones para el repartidor (opcional)
                        </label>
                        <input
                          type="text"
                          value={cashDeliveryNotes}
                          onChange={(e) => setCashDeliveryNotes(e.target.value)}
                          placeholder="Ej. Tocar timbre 3B o llamar al celular antes"
                          className="w-full p-2 rounded-xl border border-[#E5E0DA] bg-[#FDFBF9] text-xs text-[#423D33] outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-[#608058] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>El pedido se enviará al panel admin para coordinar el despacho.</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Order Notes / Dedication */}
              <div>
                <label className="block text-[11px] font-bold text-[#8C7A6B] uppercase mb-1">
                  Notas de Fabricación o Dedicatoria
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Instrucciones para el maestro cerero o empaque..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:ring-1 focus:ring-[#8C7A6B] outline-none"
                />
              </div>

              {/* Security & Wax Integrity Banner */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#423D33]">
                  <ShieldCheck className="w-4 h-4 text-[#608058]" />
                  <span>Compromiso de Elaboración Artesanal Ayllu</span>
                </div>
                <p className="text-[10px] text-[#8C7A6B]">
                  Formulaciones botánicas exclusivas en Cera de Soja 100% Vegetal y Cera de Parafina Pura.
                </p>
              </div>

              {/* Final Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>Confirmar Pedido • ${total.toFixed(2)} USD</span>
                <PackageCheck className="w-4 h-4 text-[#D9C5B2]" />
              </button>
            </form>
          ) : cartItems.length === 0 ? (
            /* EMPTY CART VIEW */
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F2EDE7] text-[#8C7A6B] flex items-center justify-center mx-auto border border-[#E5E0DA]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-normal text-[#423D33]">
                Tu cesta está vacía
              </h3>
              <p className="text-xs text-[#423D33]/70 max-w-xs mx-auto">
                Explora nuestras velas botánicas o diseña tu creación personalizada en {brandConfig.brandName}.
              </p>
            </div>
          ) : (
            /* CART ITEMS LIST WITH DETAILED BREAKDOWN */
            cartItems.map((item, index) => {
              const isBespoke =
                item.candle.category === "Personalizada" ||
                item.candle.id.includes("bespoke") ||
                Boolean(item.customDetails) ||
                Boolean(item.candle.waxColorName);
              const waxType = item.selectedWaxType || item.candle.waxType || "Soja";

              return (
                <div
                  key={index}
                  className="p-4 bg-white rounded-3xl border border-[#E5E0DA] shadow-2xs space-y-3"
                >
                  {/* Top line: image + title + remove */}
                  <div className="flex gap-3 items-start">
                    {Boolean(item.candle.image && item.candle.image.trim()) ? (
                      <img
                        src={item.candle.image}
                        alt={item.candle.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-contain object-center p-1 bg-[#F2EDE7] shrink-0 border border-[#E5E0DA]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#F2EDE7] shrink-0 border border-[#E5E0DA] text-[#8C7A6B]">
                        <span className="font-serif font-bold text-sm text-[#423D33]">
                          {item.candle.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif text-sm font-bold text-[#423D33] truncate">
                          {item.candle.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-[#423D33]/40 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          waxType === "Soja"
                            ? "bg-[#608058]/10 text-[#608058] border border-[#608058]/20"
                            : "bg-[#8C7A6B]/15 text-[#5C4A3A] border border-[#8C7A6B]/25"
                        }`}>
                          <Leaf className="w-2.5 h-2.5" />
                          <span>Cera: {waxType}</span>
                        </span>
                        <span className="text-[10px] text-[#8C7A6B] truncate">
                          {item.candle.subtitle || item.candle.tagline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DETAILED BESPOKE BREAKDOWN CARD */}
                  {isBespoke ? (
                    <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-2 text-[11px]">
                      <div className="flex items-center justify-between border-b border-[#E5E0DA]/70 pb-1.5">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-[#8C7A6B] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D98B68]" />
                          <span>Desglose de Formulación Artesanal</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#423D33]">320g • 65h</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-[10px] sm:text-[11px]">
                        {/* Tipo de Cera */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#8C7A6B]">🌿 Cera Seleccionada:</span>
                          <span className="font-bold text-[#423D33]">
                            Cera de {waxType}
                          </span>
                        </div>

                        {/* Base / Vaso */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#8C7A6B]">🏺 Base / Vaso:</span>
                          <span className="font-semibold text-[#423D33]">
                            {item.customDetails?.vesselName || item.candle.vesselName}
                          </span>
                        </div>

                        {/* Tono de Cera */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#8C7A6B]">🎨 Formulación de Cera:</span>
                          <span className="font-semibold text-[#423D33] flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block shadow-2xs"
                              style={{
                                backgroundColor:
                                  item.customDetails?.waxColorHex ||
                                  item.candle.waxColorHex ||
                                  "#FAF7F2",
                              }}
                            />
                            <span>
                              {item.customDetails?.waxColorName ||
                                item.candle.waxColorName ||
                                `Cera de ${waxType}`}
                            </span>
                          </span>
                        </div>

                        {/* Tipo de Mecha */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#8C7A6B]">🕯️ Tipo de Mecha:</span>
                          <span className="font-semibold text-[#423D33]">
                            {item.customDetails?.wickName || item.candle.wickType || "Mecha de Algodón 100% Orgánico"}
                          </span>
                        </div>

                        {/* Botánicos Aromáticos */}
                        <div className="flex items-start justify-between pt-0.5">
                          <span className="text-[#8C7A6B] shrink-0">🌿 Aromas & Botánicos:</span>
                          <span className="font-medium text-[#423D33] text-right pl-2 truncate max-w-[200px]">
                            {item.customDetails?.botanicalsList?.join(", ") ||
                              item.candle.botanicals?.join(", ") ||
                              "Lavanda, Naranja, Canela"}
                          </span>
                        </div>

                        {/* Zonas de color independientes (Panda, Osito, figuras multicapa) */}
                        {item.customDetails?.customLayersDetail && item.customDetails.customLayersDetail.length > 0 && (
                          <div className="pt-1.5 border-t border-[#E5E0DA]/50 space-y-1">
                            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                              Zonas Esculpidas Personalizadas:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.customDetails.customLayersDetail.map((cl, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="inline-flex items-center gap-1 text-[10px] bg-[#FAF7F2] border border-[#E5E0DA] px-2 py-0.5 rounded-full"
                                >
                                  <span
                                    className="w-2 h-2 rounded-full border border-black/10 inline-block"
                                    style={{ backgroundColor: cl.colorHex }}
                                  />
                                  <span className="font-medium text-[#423D33]">{cl.name}:</span>
                                  <span className="text-[#8C7A6B]">{cl.colorName}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Etiqueta / Dedicatoria */}
                        {(item.candle.customLabelTitle || item.customDetails?.labelTitle) && (
                          <div className="flex items-start justify-between pt-0.5 border-t border-[#E5E0DA]/50">
                            <span className="text-[#8C7A6B] shrink-0">🏷️ Frase Etiqueta:</span>
                            <span className="font-serif italic font-bold text-[#423D33] text-right pl-2 truncate max-w-[200px]">
                              "{item.customDetails?.labelTitle || item.candle.customLabelTitle}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Standard Catalog Candle Breakdown */
                    <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B]">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5E0DA]">
                        {item.candle.vesselName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5E0DA]">
                        {item.candle.burnHours}h de quemado
                      </span>
                    </div>
                  )}

                  {/* Add-ons Badges */}
                  {(item.customEngraving || item.giftWrap) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.customEngraving && (
                        <span className="text-[9px] bg-[#F2EDE7] text-[#8C7A6B] px-2 py-0.5 rounded-full font-medium border border-[#E5E0DA]">
                          Grabado: "{item.customEngraving}" (+ $3.50)
                        </span>
                      )}
                      {item.giftWrap && (
                        <span className="text-[9px] bg-[#F2EDE7] text-[#608058] px-2 py-0.5 rounded-full font-medium border border-[#E5E0DA]">
                          Regalo Botánico (+ $2.50)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quantity and Line Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E0DA]">
                    <div className="flex items-center border border-[#E5E0DA] rounded-full bg-[#FDFBF9] px-1.5 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#423D33] hover:text-black cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium text-[#423D33]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#423D33] hover:text-black cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="text-sm font-serif font-bold text-[#423D33]">
                      $
                      {(
                        (item.candle.price +
                          (item.customEngraving ? 3.5 : 0) +
                          (item.giftWrap ? 2.5 : 0)) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {!orderComplete && cartItems.length > 0 && !isCheckingOut && (
          <div className="p-5 border-t border-[#E5E0DA] bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-[#423D33]/80">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span className="font-medium text-[#423D33]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío ({brandConfig.shippingFreeThreshold}$ gratis):</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-[#608058] font-bold text-[10px] uppercase">GRATIS</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E0DA] text-sm font-normal text-[#423D33]">
                <span>Total:</span>
                <span className="font-serif text-lg font-bold text-[#423D33]">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="proceed-to-checkout-btn"
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold uppercase tracking-widest shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>Tramitar Pedido • Transferencia o Efectivo</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D9C5B2]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

