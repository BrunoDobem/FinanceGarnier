import { 
  CategoryType, 
  Transaction, 
  Subscription, 
  CreditExpense, 
  CashExpense, 
  Income, 
  MonthlyOverview 
} from "@/types/finance";
import { v4 as uuidv4 } from "@/lib/utils";

export const mockCategories: CategoryType[] = [
  {
    id: "1",
    name: "Moradia",
    color: "#3b82f6",
    icon: "home",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "2",
    name: "Transporte",
    color: "#ef4444",
    icon: "car",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "3",
    name: "Alimentação",
    color: "#10b981",
    icon: "utensils",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "4",
    name: "Entretenimento",
    color: "#f59e0b",
    icon: "film",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "5",
    name: "Saúde",
    color: "#6366f1",
    icon: "heart-pulse",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "6",
    name: "Educação",
    color: "#8b5cf6",
    icon: "graduation-cap",
    type: ["subscription", "credit", "cash"]
  },
  {
    id: "7",
    name: "Salário",
    color: "#059669",
    icon: "wallet",
    type: ["income"]
  },
  {
    id: "8",
    name: "Investimentos",
    color: "#0ea5e9",
    icon: "trending-up",
    type: ["income"]
  },
  {
    id: "9",
    name: "Freelance",
    color: "#14b8a6",
    icon: "laptop",
    type: ["income"]
  }
];

export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    type: "subscription",
    amount: 49.99,
    description: "Netflix",
    category: "4",
    date: "2023-05-15",
    recurring: true,
    billingCycle: "monthly",
    nextBillingDate: "2023-06-15",
    createdAt: "2023-05-15",
    updatedAt: "2023-05-15"
  },
  {
    id: "sub-2",
    type: "subscription",
    amount: 9.99,
    description: "Spotify",
    category: "4",
    date: "2023-05-10",
    recurring: true,
    billingCycle: "monthly",
    nextBillingDate: "2023-06-10",
    createdAt: "2023-05-10",
    updatedAt: "2023-05-10"
  },
  {
    id: "sub-3",
    type: "subscription",
    amount: 1200,
    description: "Aluguel",
    category: "1",
    date: "2023-05-05",
    recurring: true,
    billingCycle: "monthly",
    nextBillingDate: "2023-06-05",
    createdAt: "2023-05-05",
    updatedAt: "2023-05-05"
  }
];

export const mockCreditExpenses: CreditExpense[] = [
  {
    id: "cred-1",
    type: "credit",
    amount: 250,
    description: "Novo Celular",
    category: "4",
    date: "2023-05-20",
    installments: 12,
    currentInstallment: 1,
    paidInstallments: [],
    createdAt: "2023-05-20",
    updatedAt: "2023-05-20"
  },
  {
    id: "cred-2",
    type: "credit",
    amount: 150,
    description: "Material de Escritório",
    category: "6",
    date: "2023-05-18",
    installments: 3,
    currentInstallment: 1,
    paidInstallments: [],
    createdAt: "2023-05-18",
    updatedAt: "2023-05-18"
  }
];

export const mockCashExpenses: CashExpense[] = [
  {
    id: "cash-1",
    type: "cash",
    amount: 80,
    description: "Supermercado",
    category: "3",
    date: "2023-05-22",
    createdAt: "2023-05-22",
    updatedAt: "2023-05-22"
  },
  {
    id: "cash-2",
    type: "cash",
    amount: 35,
    description: "Restaurante",
    category: "3",
    date: "2023-05-21",
    createdAt: "2023-05-21",
    updatedAt: "2023-05-21"
  },
  {
    id: "cash-3",
    type: "cash",
    amount: 50,
    description: "Combustível",
    category: "2",
    date: "2023-05-19",
    createdAt: "2023-05-19",
    updatedAt: "2023-05-19"
  }
];

export const mockIncome: Income[] = [
  {
    id: "inc-1",
    type: "income",
    amount: 3500,
    description: "Salário",
    category: "7",
    date: "2023-05-05",
    source: "Emprego Principal",
    createdAt: "2023-05-05",
    updatedAt: "2023-05-05"
  },
  {
    id: "inc-2",
    type: "income",
    amount: 800,
    description: "Freelance",
    category: "9",
    date: "2023-05-15",
    source: "Projeto Website",
    createdAt: "2023-05-15",
    updatedAt: "2023-05-15"
  }
];

export const mockMonthlyOverview: MonthlyOverview[] = [
  {
    month: "2023-05",
    income: 4300,
    expenses: {
      subscriptions: 1259.98,
      credit: 400,
      cash: 165,
      total: 1824.98
    },
    balance: 2475.02
  },
  {
    month: "2023-04",
    income: 3500,
    expenses: {
      subscriptions: 1259.98,
      credit: 400,
      cash: 200,
      total: 1859.98
    },
    balance: 1640.02
  },
  {
    month: "2023-03",
    income: 3800,
    expenses: {
      subscriptions: 1259.98,
      credit: 400,
      cash: 180,
      total: 1839.98
    },
    balance: 1960.02
  }
];

// Helper function to get all transactions
export const getAllTransactions = (): Transaction[] => {
  return [
    ...mockSubscriptions,
    ...mockCreditExpenses,
    ...mockCashExpenses,
    ...mockIncome
  ];
};

// Helper to get a category by ID
export const getCategoryById = (id: string): CategoryType | undefined => {
  return mockCategories.find(category => category.id === id);
};
