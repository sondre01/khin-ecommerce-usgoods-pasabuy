import { NextRequest, NextResponse } from 'next/server';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { basePriceUsd, weightLbs, usStateTaxRate, usdToPhpRate, profitMarginRate } = body;

    if (basePriceUsd === undefined) {
      return NextResponse.json({ error: 'basePriceUsd is required' }, { status: 400 });
    }

    const breakdown = calculateLandedCost({
      basePriceUsd: parseFloat(basePriceUsd),
      weightLbs: weightLbs ? parseFloat(weightLbs) : 1.0,
      usStateTaxRate: usStateTaxRate !== undefined ? parseFloat(usStateTaxRate) : DEFAULT_CONFIG.usStateTaxRate,
      usdToPhpRate: usdToPhpRate ? parseFloat(usdToPhpRate) : DEFAULT_CONFIG.usdToPhpRate,
      cargoRatePerLbUsd: DEFAULT_CONFIG.cargoRatePerLbUsd,
      handlingFeeUsd: DEFAULT_CONFIG.handlingFeeUsd,
      profitMarginRate: profitMarginRate ? parseFloat(profitMarginRate) : DEFAULT_CONFIG.profitMarginRate,
    });

    return NextResponse.json({ success: true, breakdown });
  } catch (error) {
    return NextResponse.json({ error: 'Internal calculation error' }, { status: 500 });
  }
}
