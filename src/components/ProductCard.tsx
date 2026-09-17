import React from "react";
import { Flame, Clock, Star, Plus, Eye, Sparkles } from "lucide-react";
import { CandleProduct } from "../types";

interface ProductCardProps {
  candle: CandleProduct;
  onSelect: (candle: CandleProduct) => void;
  onAddToCart: (candle: CandleProduct) => void;
  onCustomize?: (candle: CandleProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  candle,
  onSelect,
  onAddToCart,
  onCustomize,
}) => {
  return (
    <div
      id={`product-card-${candle.id}`}
      className="bg-white rounded-3xl border border-[#E5E0DA] hover:border-[#8C7A6B]/60 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group"
    >
      <div className="p-5 space-y-4">
        {/* Product Photo Container */}
        <div
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F2EDE7] cursor-pointer flex items-center justify-center p-2 sm:p-2.5"
          onClick={() => onSelect(candle)}
        >
          {Boolean(candle.image && candle.image.trim()) ? (
            <img
              src={candle.image}
              alt={candle.name}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-full max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B] text-xs p-4 text-center">
              <span className="font-serif font-bold text-sm text-[#423D33]">{candle.name}</span>
            </div>
          )}

          {/* Category Pill */}
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#423D33] uppercase tracking-widest border border-black/5 shadow-2xs">
            {candle.category}
          </div>

          {/* Burn Time Badge */}
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1 shadow-2xs">
            <Clock className="w-2.5 h-2.5 text-[#D9C5B2]" />
            <span>{candle.burnHours}h</span>
          </div>

          {/* Quick View overlay on hover */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(candle);
              }}
              className="px-3 py-1.5 rounded-full bg-white text-[#423D33] text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-[#F2EDE7] flex items-center gap-1.5 cursor-pointer transform translate-y-1 group-hover:translate-y-0 transition-all"
            >
              <Eye className="w-3 h-3 text-[#8C7A6B]" />
              <span>Ver Ficha</span>
            </button>
          </div>
        </div>

        {/* Product Details Body */}
        <div className="space-y-2">
          {/* Rating, Wax Type and Vessel */}
          <div className="flex items-center justify-between text-xs text-[#8C7A6B]">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#8C7A6B] text-[#8C7A6B]" />
              <span className="font-semibold text-[#423D33]">{candle.rating}</span>
              <span className="text-[11px] text-[#423D33]/60">({candle.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                  candle.waxType === "Parafina"
                    ? "bg-stone-100 text-[#423D33] border-stone-300"
                    : "bg-[#608058]/10 text-[#35522e] border-[#608058]/30"
                }`}
              >
                {candle.waxType === "Parafina" ? "Parafina" : "Soja"}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold bg-[#F2EDE7] px-2 py-0.5 rounded-full text-[#423D33]/80 border border-[#E5E0DA]">
                {candle.vesselName}
              </span>
            </div>
          </div>

          {/* Titles */}
          <h3
            onClick={() => onSelect(candle)}
            className="font-serif text-lg font-bold text-[#423D33] group-hover:text-[#8C7A6B] transition-colors cursor-pointer leading-tight"
          >
            {candle.name}
          </h3>
          <p className="text-xs text-[#423D33]/70 line-clamp-2 leading-relaxed">
            {candle.subtitle}
          </p>

          {/* Botanical tags */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {candle.botanicals.slice(0, 3).map((botanical, idx) => (
              <span
                key={idx}
                className="text-[9px] uppercase tracking-wider bg-[#FDFBF9] text-[#423D33]/80 px-2 py-0.5 rounded-full border border-[#E5E0DA]"
              >
                {botanical}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Price & Add Button */}
      <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#E5E0DA] flex items-center justify-between text-xs gap-2">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#8C7A6B] block font-bold">Edición</span>
          <span className="text-base font-serif font-bold text-[#423D33]">
            ${Number(candle.price).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onCustomize && (
            <button
              type="button"
              onClick={() => onCustomize(candle)}
              className="px-2.5 py-1.5 rounded-full border border-[#E5E0DA] bg-white hover:bg-[#F2EDE7] text-[#8C7A6B] hover:text-[#423D33] text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              title={`Personalizar ${candle.name} en el taller 2D`}
            >
              <Sparkles className="w-3 h-3 text-[#D98B68]" />
              <span className="hidden sm:inline">Personalizar</span>
            </button>
          )}

          <button
            id={`add-to-cart-btn-${candle.id}`}
            onClick={() => onAddToCart(candle)}
            className="px-3.5 py-1.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all shrink-0"
            aria-label={`Añadir ${candle.name} a la cesta`}
          >
            <Plus className="w-3.5 h-3.5 text-[#D9C5B2]" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

