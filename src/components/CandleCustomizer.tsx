import React from "react";
import {
  CandleProduct,
  CartItem,
  VesselOption,
  WaxColorOption,
  WickOption,
  BotanicalOption,
  LabelStyleOption,
} from "../types";
import {
  DEFAULT_VESSELS,
  DEFAULT_WAX_COLORS,
  DEFAULT_WICKS,
  DEFAULT_BOTANICALS,
  DEFAULT_LABEL_STYLES,
} from "../data/defaultCustomizerOptions";
import { CustomizerWizard } from "./CustomizerWizard";

export type {
  VesselOption,
  WaxColorOption,
  WickOption,
  BotanicalOption,
  LabelStyleOption,
};

export const VESSELS = DEFAULT_VESSELS;
export const WAX_COLORS = DEFAULT_WAX_COLORS;
export const WICKS = DEFAULT_WICKS;
export const BOTANICALS = DEFAULT_BOTANICALS;
export const LABEL_STYLES = DEFAULT_LABEL_STYLES;

interface CandleCustomizerProps {
  onAddCustomCandleToCart: (customCandle: CandleProduct) => void;
  initialCandle?: CandleProduct;
}

export const CandleCustomizer: React.FC<CandleCustomizerProps> = ({
  onAddCustomCandleToCart,
  initialCandle,
}) => {
  const handleAddToCartFromWizard = (item: CartItem) => {
    onAddCustomCandleToCart(item.candle);
  };

  return (
    <section id="personalizar-section" className="w-full scroll-mt-20">
      <CustomizerWizard
        onAddToCart={handleAddToCartFromWizard}
        initialProduct={initialCandle}
      />
    </section>
  );
};
