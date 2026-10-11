import { OrderStatus } from '@/types';

export interface CourierOption {
  name: string;
  code: string;
  trackingUrlPattern?: (trackingNumber: string) => string;
  description: string;
  isPopular?: boolean;
}

export const SUPPORTED_COURIERS: CourierOption[] = [
  {
    name: 'J&T Express',
    code: 'JT',
    trackingUrlPattern: (tn) => `https://www.jtexpress.ph/trajectoryQuery?bills=${encodeURIComponent(tn)}`,
    description: 'Door-to-door nationwide delivery with online waybill tracking',
    isPopular: true,
  },
  {
    name: 'LBC Express',
    code: 'LBC',
    trackingUrlPattern: (tn) => `https://www.lbcexpress.com/track/?tracking_no=${encodeURIComponent(tn)}`,
    description: 'Nationwide door-to-door & branch pickup',
    isPopular: true,
  },
  {
    name: 'Ninja Van Philippines',
    code: 'NINJA',
    trackingUrlPattern: (tn) => `https://www.ninjavan.co/en-ph/tracking?id=${encodeURIComponent(tn)}`,
    description: 'Standard e-commerce express logistics',
    isPopular: true,
  },
  {
    name: 'Flash Express',
    code: 'FLASH',
    trackingUrlPattern: (tn) => `https://www.flashexpress.ph/fle/tracking?se=${encodeURIComponent(tn)}`,
    description: 'Fast nationwide courier delivery',
    isPopular: true,
  },
  {
    name: 'Lalamove',
    code: 'LALAMOVE',
    trackingUrlPattern: () => 'https://www.lalamove.com/en-ph/',
    description: 'Same-day on-demand delivery for Metro Manila & nearby provinces',
    isPopular: true,
  },
  {
    name: '2GO Express',
    code: '2GO',
    trackingUrlPattern: (tn) => `https://supplychain.2go.com.ph/CustomerSupport/etrace/index.asp?page=etrace&awb=${encodeURIComponent(tn)}`,
    description: 'Air and sea cargo delivery across the Philippines',
  },
  {
    name: 'GrabExpress',
    code: 'GRAB',
    trackingUrlPattern: () => 'https://www.grab.com/ph/express/',
    description: 'Instant motorbike parcel delivery (Metro Manila)',
  },
  {
    name: 'Air Cargo Forwarder (Oregon Hub)',
    code: 'BNS_AIR',
    trackingUrlPattern: (tn) => `https://t.17track.net/en#nums=${encodeURIComponent(tn)}`,
    description: 'International air freight forwarder from US to Manila Hub',
  },
];

/**
 * Returns direct tracking URL for the given courier name and tracking/waybill number.
 */
export function getCourierTrackingUrl(courierName?: string, trackingNumber?: string): string | null {
  if (!trackingNumber || !trackingNumber.trim()) return null;
  const tn = trackingNumber.trim();
  const c = (courierName || '').toLowerCase().trim();

  if (c.includes('j&t') || c.includes('jt')) {
    return `https://www.jtexpress.ph/trajectoryQuery?bills=${encodeURIComponent(tn)}`;
  }
  if (c.includes('lbc')) {
    return `https://www.lbcexpress.com/track/?tracking_no=${encodeURIComponent(tn)}`;
  }
  if (c.includes('ninja')) {
    return `https://www.ninjavan.co/en-ph/tracking?id=${encodeURIComponent(tn)}`;
  }
  if (c.includes('flash')) {
    return `https://www.flashexpress.ph/fle/tracking?se=${encodeURIComponent(tn)}`;
  }
  if (c.includes('2go')) {
    return `https://supplychain.2go.com.ph/CustomerSupport/etrace/index.asp?page=etrace&awb=${encodeURIComponent(tn)}`;
  }
  if (c.includes('lalamove')) {
    return 'https://www.lalamove.com/en-ph/';
  }
  if (c.includes('grab')) {
    return 'https://www.grab.com/ph/express/';
  }

  // Universal international or 3rd-party parcel tracking fallback
  return `https://t.17track.net/en#nums=${encodeURIComponent(tn)}`;
}

/**
 * Order pipeline stages reflecting the realistic seller fulfillment boundary.
 * Stages 1 to 4 are directly operated by the personal shopper / US importer.
 * Stages 5 and 6 are handed over to the 3rd-party parcel delivery carrier.
 */
export const ORDER_PIPELINE_STAGES: {
  key: OrderStatus;
  label: string;
  adminLabel: string;
  desc: string;
  isSellerResponsible: boolean;
  handoffNotice?: string;
}[] = [
  {
    key: 'ORDER_PLACED',
    label: 'Order Confirmed',
    adminLabel: '1. Order Confirmed',
    desc: 'Downpayment verified by personal shopper',
    isSellerResponsible: true,
  },
  {
    key: 'PURCHASED_IN_US',
    label: 'Bought in US',
    adminLabel: '2. Bought in US',
    desc: 'Secured at US outlet with physical receipt',
    isSellerResponsible: true,
  },
  {
    key: 'IN_TRANSIT_FORWARDER',
    label: 'US-to-PH Cargo',
    adminLabel: '3. US-to-PH Air Freight',
    desc: 'Shipped via tax-free Oregon air cargo',
    isSellerResponsible: true,
  },
  {
    key: 'ARRIVED_IN_PH',
    label: 'Arrived at PH Hub',
    adminLabel: '4. Arrived PH (Ready for Courier)',
    desc: 'Inspected, packaged & prepared for local dispatch',
    isSellerResponsible: true,
  },
  {
    key: 'OUT_FOR_LOCAL_DELIVERY',
    label: 'Handed to Courier',
    adminLabel: '5. Handed to Courier (Seller Hand-off)',
    desc: 'Handed over to 3rd-party delivery partner; tracked via waybill',
    isSellerResponsible: false,
    handoffNotice: 'Handed over to 3rd-party parcel delivery company. Live transit is managed by courier logistics network.',
  },
  {
    key: 'COMPLETED',
    label: 'Fulfilled / Delivered',
    adminLabel: '6. Fulfilled / Delivered',
    desc: 'Parcel received at customer address',
    isSellerResponsible: false,
  },
];

export function getOrderStageDetails(status: OrderStatus) {
  const found = ORDER_PIPELINE_STAGES.find((s) => s.key === status);
  return found || {
    key: status,
    label: status.replace(/_/g, ' '),
    adminLabel: status.replace(/_/g, ' '),
    desc: 'Current order status',
    isSellerResponsible: false,
  };
}

export const SELLER_COURIER_HANDOFF_DISCLOSURE =
  'Our personal shopper fulfillment is completed once your item has been inspected, packaged, and officially handed over to the delivery company. Because route dispatch and transit are operated directly by the 3rd-party courier, live tracking updates are monitored directly on their platform using your tracking number.';
