import { NextRequest, NextResponse } from 'next/server';
import { withAdminGuard } from '@/lib/auth/guards';
import { OrderStatus } from '@/types';

interface RouteContext {
  params: {
    id: string;
  };
}

export const PATCH = withAdminGuard<RouteContext['params']>(async (req, { params, user }) => {
  const orderId = params.id;
  const body = await req.json();
  const { status, cargoTrackingNumber, localCourierName, localTrackingNumber } = body;

  return NextResponse.json({
    success: true,
    message: `Order ${orderId} updated by ${user.fullName}`,
    data: {
      orderId,
      status: status as OrderStatus,
      cargoTrackingNumber,
      localCourierName,
      localTrackingNumber,
      updatedBy: user.userId,
      timestamp: new Date().toISOString(),
    },
  });
});
