import { PLATFORM_COMMISSION } from '@/lib/pricing';

export function calculateCommission(total: number) {
  const platformFee = Math.round(total * PLATFORM_COMMISSION);
  const cleanerPay = total - platformFee;

  return {
    total,
    platformFee,
    cleanerPay,
  };
}
