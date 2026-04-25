export type BulkTier = {
  units: number;
  pricePerUnitUsdc: number;
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  basePricePerCallUsdc: number;
  bulkTiers: BulkTier[];
  sampleEndpoint: string;
  sampleRequestSnippet: string;
  bulkBuyersThisMonth: number;
};

export type BuyAccessButtonProps = {
  providerId: string;
  providerName: string;
  tierUnits: number;
  totalPriceUsdc: number;
  onSuccess?: (receipt: PurchaseReceipt) => void;
};

export type PurchaseReceipt = {
  txHash: string;
  explorerUrl: string;
  amountUsdc: number;
  timestamp: string;
  providerId: string;
  tierUnits: number;
};
