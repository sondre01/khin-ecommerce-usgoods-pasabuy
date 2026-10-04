import { NextRequest, NextResponse } from 'next/server';
import { withAdminGuard } from '@/lib/auth/guards';

interface RouteContext {
  params: {
    id: string;
  };
}

export const POST = withAdminGuard<RouteContext['params']>(async (req, { params, user }) => {
  const paymentId = params.id;
  const body = await req.json();
  const { reviewStatus, rejectionReason } = body;

  if (!reviewStatus || !['APPROVED', 'REJECTED'].includes(reviewStatus)) {
    return NextResponse.json({ error: 'Invalid reviewStatus' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: `Payment ${paymentId} marked as ${reviewStatus} by ${user.fullName}`,
    data: {
      paymentId,
      reviewStatus,
      rejectionReason: reviewStatus === 'REJECTED' ? rejectionReason : null,
      verifiedBy: user.userId,
      verifiedAt: new Date().toISOString(),
    },
  });
});
