export type TransactionType = 
  | "subscription" 
  | "credit" 
  | "cash" 
  | "income";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  recurring?: boolean;
  installments?: number;
  currentInstallment?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription extends Transaction {
  type: "subscription";
  recurring: true;
  billingCycle: "monthly" | "yearly" | "weekly" | "quarterly";
  nextBillingDate: string;
}

export interface CreditExpense extends Transaction {
  type: "credit";
  installments: number;
  currentInstallment: number;
  creditCardId?: string;
  paidInstallments?: number[];
  unpaidInstallments?: number[];
  billingMonth?: string; // Optional field to store which month this expense is billed
}

export interface CashExpense extends Transaction {
  type: "cash";
}

export interface Income extends Transaction {
  type: "income";
  source?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits?: string;
  closingDay: number; // Day of month when billing closes
  dueDay: number; // Day of month when payment is due
  limit?: number;
  color?: string;
}

export type CategoryType = {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: TransactionType[];
};

export type UserPreferences = {
  currency: string;
  language: string;
  theme: "light" | "dark" | "system";
  categories: CategoryType[];
  creditCards: CreditCard[];
};

export type MonthlyOverview = {
  month: string; // "YYYY-MM"
  income: number;
  expenses: {
    subscriptions: number;
    credit: number;
    cash: number;
    total: number;
  };
  balance: number;
};

export type BillingCycle = {
  closingDate: Date;
  dueDate: Date;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  nextPeriod: {
    start: Date;
    end: Date;
  };
  cycleProgress: number;
};
