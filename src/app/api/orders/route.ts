import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentSessionUser } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentSessionUser();
    const body = await req.json();

    const {
      items,
      subtotalPhp,
      shippingFeePhp = 150,
      totalAmountPhp,
      amountPaidPhp = 0,
      paymentPlan = 'FULL_PAYMENT',
      paymentMethod = 'GCASH',
      referenceNumber = '',
      proofReceiptUrl = '',
      deliveryAddress,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
    } = body;

    const orderNumber =
      body.orderNumber ||
      `PB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderId = `ord-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

    const orderRecord = {
      id: orderId,
      order_number: orderNumber,
      user_id: user?.userId || null,
      customer_email: customerEmail || user?.email || 'guest@usgoodspasabuy.ph',
      customer_name: customerName || user?.fullName || 'Customer',
      customer_phone: customerPhone || '+63 900 000 0000',
      status: 'ORDER_PLACED',
      payment_plan: paymentPlan,
      payment_status: amountPaidPhp >= totalAmountPhp ? 'FULLY_PAID' : amountPaidPhp > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      subtotal_php: Number(subtotalPhp) || 0,
      shipping_fee_ph_php: Number(shippingFeePhp) || 150,
      total_amount_php: Number(totalAmountPhp) || Number(subtotalPhp) + Number(shippingFeePhp),
      amount_paid_php: Number(amountPaidPhp) || 0,
      delivery_address: deliveryAddress || {},
      customer_notes: customerNotes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Sync to Supabase
    try {
      const supabase = getSupabaseServiceClient();
      if (supabase) {
        const { error: orderErr } = await supabase.from('orders').insert([orderRecord]);
        if (orderErr) {
          console.warn('[SUPABASE_SYNC] Notice on inserting order:', orderErr.message);
        } else {
          console.log(`[SUPABASE_SYNC] Successfully synchronized order ${orderNumber} to Supabase`);

          if (Array.isArray(items) && items.length > 0) {
            const itemRecords = items.map((it: any) => ({
              id: `item-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`,
              order_id: orderId,
              product_id: it.productId || it.id || null,
              product_title: it.title || it.productTitle || 'US Item',
              quantity: it.quantity || 1,
              unit_price_usd: Number(it.priceUsd) || 0,
              unit_price_php: Number(it.pricePhp) || Number(it.sellingPricePhp) || 0,
              variant_details: it.variantDetails || {},
              landed_cost_snapshot: it.landedCost || {},
              created_at: new Date().toISOString(),
            }));

            await supabase.from('order_items').insert(itemRecords);
          }

          if (referenceNumber || proofReceiptUrl) {
            await supabase.from('payments').insert([
              {
                id: `pay-${Date.now().toString(36)}`,
                order_id: orderId,
                amount_php: Number(amountPaidPhp) || Number(totalAmountPhp),
                payment_type: paymentPlan,
                method: paymentMethod,
                reference_number: referenceNumber,
                proof_receipt_url: proofReceiptUrl,
                review_status: 'PENDING_REVIEW',
                created_at: new Date().toISOString(),
              },
            ]);
          }
        }
      }
    } catch (err: any) {
      console.warn('[SUPABASE_SYNC] Order sync notice:', err.message);
    }

    return NextResponse.json({
      success: true,
      order: orderRecord,
      orderNumber,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order.' },
      { status: 500 }
    );
  }
}
