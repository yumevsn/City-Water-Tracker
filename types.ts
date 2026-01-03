
export interface WaterReading {
  id: string;
  month: string;
  previousValue: number;
  currentValue: number;
  consumption: number;
  charge: number;
  dateCreated: number;
}

export interface AppSettings {
  fixedCharge: number;
  ratePerUnit: number;
  currency: string;
  unit: string;
  notificationsEnabled: boolean;
  notificationFrequency: 'monthly' | 'bi-monthly' | 'none';
  notificationDay: number;
}

export type TabType = 'history' | 'insights' | 'settings';
