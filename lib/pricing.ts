import { ServiceType } from '@prisma/client';

export const pricing = {
  standardCleaning: 5000,
  deepCleaning: 7000,
  airbnbTurnover: 2500,
  moveOutCleaning: 8500,
} as const;

export const PLATFORM_COMMISSION = 0.25;

export const SERVICE_BASE_PRICING: Record<ServiceType, number> = {
  [ServiceType.STANDARD]: pricing.standardCleaning,
  [ServiceType.DEEP]: pricing.deepCleaning,
  [ServiceType.MOVE_OUT]: pricing.moveOutCleaning,
};

export function getBasePriceForService(serviceType: ServiceType) {
  return SERVICE_BASE_PRICING[serviceType];
}
