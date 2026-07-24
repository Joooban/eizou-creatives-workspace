export interface QuotaCategory {
  completed: number;
  quota: number;
}

export interface ClientQuota {
  clientId: number;
  month: number;
  year: number;
  graphics: QuotaCategory;
  photo: QuotaCategory;
  reels: QuotaCategory;
}