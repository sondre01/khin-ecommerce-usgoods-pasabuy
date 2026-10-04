import { LandedCostInput, LandedCostBreakdown } from '@/types';

/**
 * Calculates Landed Cost in Philippine Pesos (PHP) for US Goods.
 *
 * Formula:
 * 1. Base USD + US State Tax (0% if Oregon tax-free forwarder) + Cargo Air/Sea Freight + Handling Fee
 * 2. Multiplied by Buffered USD/PHP Exchange Rate
 * 3. Multiplied by Service Margin (e.g. 15%)
 * 4. Derives downpayment requirement (50% or 100%)
 */
export function calculateLandedCost(input: LandedCostInput): LandedCostBreakdown {
  const {
    basePriceUsd,
    weightLbs,
    usStateTaxRate = 0.0, // Defaults to 0% for tax-free Oregon/Delaware forwarders
    cargoRatePerLbUsd = 7.5, // Standard Air Cargo forwarder rate per lb
    handlingFeeUsd = 3.0,   // Standard box handling & repacking fee
    usdToPhpRate,
    profitMarginRate = 0.15,
  } = input;

  const validWeight = Math.max(Number(weightLbs) || 1.0, 0.5);
  const validBasePrice = Math.max(Number(basePriceUsd) || 0, 0);

  const usStateTaxUsd = validBasePrice * usStateTaxRate;
  const estCargoFeeUsd = validWeight * cargoRatePerLbUsd;
  const totalLandedUsd = validBasePrice + usStateTaxUsd + estCargoFeeUsd + handlingFeeUsd;

  const baseCostPhp = totalLandedUsd * usdToPhpRate;
  const marginAmountPhp = baseCostPhp * profitMarginRate;
  const sellingPriceRaw = baseCostPhp + marginAmountPhp;

  // Round up to nearest whole peso for clean pricing in Philippine e-commerce
  const finalSellingPricePhp = Math.ceil(sellingPriceRaw);
  const minimum50PctDownpaymentPhp = Math.ceil(finalSellingPricePhp * 0.5);

  return {
    usBasePriceUsd: Number(validBasePrice.toFixed(2)),
    usStateTaxUsd: Number(usStateTaxUsd.toFixed(2)),
    estCargoFeeUsd: Number(estCargoFeeUsd.toFixed(2)),
    handlingFeeUsd: Number(handlingFeeUsd.toFixed(2)),
    totalLandedUsd: Number(totalLandedUsd.toFixed(2)),
    effectiveExchangeRate: usdToPhpRate,
    baseCostPhp: Math.round(baseCostPhp),
    marginAmountPhp: Math.round(marginAmountPhp),
    finalSellingPricePhp,
    minimum50PctDownpaymentPhp,
  };
}

export const DEFAULT_CONFIG = {
  usdToPhpRate: 59.0, // Includes FX spread buffer for PH debit/credit card conversion
  cargoRatePerLbUsd: 7.5,
  handlingFeeUsd: 3.0,
  profitMarginRate: 0.15,
  usStateTaxRate: 0.0,
};
