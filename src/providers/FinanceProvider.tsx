import { createContext, useContext, useState, useEffect } from "react";
import { 
  Transaction, 
  Subscription, 
  CreditExpense, 
  CashExpense, 
  Income,
  CategoryType,
  CreditCard
} from "@/types/finance";
import { 
  mockCategories 
} from "@/lib/mockData";
import { v4 as uuidv4 } from "@/lib/utils";

type FinanceContextType = {
  subscriptions: Subscription[];
  creditExpenses: CreditExpense[];
  cashExpenses: CashExpense[];
  incomes: Income[];
  categories: CategoryType[];
  creditCards: CreditCard[];
  
  // CRUD operations
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string, type: Transaction["type"]) => void;
  
  // Categories
  addCategory: (category: Omit<CategoryType, "id">) => void;
  updateCategory: (category: CategoryType) => void;
  deleteCategory: (id: string) => void;
  
  // Credit Cards
  addCreditCard: (creditCard: Omit<CreditCard, "id">) => void;
  updateCreditCard: (creditCard: CreditCard) => void;
  deleteCreditCard: (id: string) => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'garnier-finance-subscriptions',
  CREDIT_EXPENSES: 'garnier-finance-creditExpenses',
  CASH_EXPENSES: 'garnier-finance-cashExpenses',
  INCOMES: 'garnier-finance-incomes',
  CATEGORIES: 'garnier-finance-categories',
  CREDIT_CARDS: 'garnier-finance-creditCards'
};

// Função auxiliar para converter datas em strings para objetos Date
function convertDates<T extends { date: string | Date }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    date: new Date(item.date),
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
  }));
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // State for different transaction types
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [creditExpenses, setCreditExpenses] = useState<CreditExpense[]>([]);
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const loadedSubscriptions = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const loadedCreditExpenses = localStorage.getItem(STORAGE_KEYS.CREDIT_EXPENSES);
      const loadedCashExpenses = localStorage.getItem(STORAGE_KEYS.CASH_EXPENSES);
      const loadedIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES);
      const loadedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const loadedCreditCards = localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);

      // Converte as datas ao carregar os dados
      setSubscriptions(loadedSubscriptions ? convertDates(JSON.parse(loadedSubscriptions)) : []);
      setCreditExpenses(loadedCreditExpenses ? convertDates(JSON.parse(loadedCreditExpenses)) : []);
      setCashExpenses(loadedCashExpenses ? convertDates(JSON.parse(loadedCashExpenses)) : []);
      setIncomes(loadedIncomes ? convertDates(JSON.parse(loadedIncomes)) : []);
      setCategories(loadedCategories ? JSON.parse(loadedCategories) : mockCategories);
      setCreditCards(loadedCreditCards ? JSON.parse(loadedCreditCards) : [{
        id: uuidv4(),
        name: "Main Credit Card",
        closingDay: 15,
        dueDay: 5
      }]);
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      // Em caso de erro, inicializa com arrays vazios
      setSubscriptions([]);
      setCreditExpenses([]);
      setCashExpenses([]);
      setIncomes([]);
      setCategories(mockCategories);
      setCreditCards([{
        id: uuidv4(),
        name: "Main Credit Card",
        closingDay: 15,
        dueDay: 5
      }]);
    }
  }, []);
  
  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDIT_EXPENSES, JSON.stringify(creditExpenses));
  }, [creditExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_EXPENSES, JSON.stringify(cashExpenses));
  }, [cashExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(creditCards));
  }, [creditCards]);

  // Add a new transaction
  const addTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date();
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date(transaction.date),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    switch (transaction.type) {
      case "subscription":
        setSubscriptions((prev) => [
          ...prev,
          newTransaction as Subscription,
        ]);
        break;
      case "credit":
        setCreditExpenses((prev) => [
          ...prev,
          {
            ...newTransaction,
            paidInstallments: [],
            unpaidInstallments: []
          } as CreditExpense,
        ]);
        break;
      case "cash":
        setCashExpenses((prev) => [...prev, newTransaction as CashExpense]);
        break;
      case "income":
        setIncomes((prev) => [...prev, newTransaction as Income]);
        break;
    }
  };

  // Update an existing transaction
  const updateTransaction = (transaction: Transaction) => {
    const now = new Date();
    const updatedTransaction = {
      ...transaction,
      date: new Date(transaction.date),
      updatedAt: now.toISOString(),
    };

    switch (transaction.type) {
      case "subscription":
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === transaction.id
              ? (updatedTransaction as Subscription)
              : item
          )
        );
        break;
      case "credit":
        setCreditExpenses((prev) =>
          prev.map((item) =>
            item.id === transaction.id
              ? (updatedTransaction as CreditExpense)
              : item
          )
        );
        break;
      case "cash":
        setCashExpenses((prev) =>
          prev.map((item) =>
            item.id === transaction.id
              ? (updatedTransaction as CashExpense)
              : item
          )
        );
        break;
      case "income":
        setIncomes((prev) =>
          prev.map((item) =>
            item.id === transaction.id ? (updatedTransaction as Income) : item
          )
        );
        break;
    }
  };

  // Delete a transaction
  const deleteTransaction = (id: string, type: Transaction["type"]) => {
    switch (type) {
      case "subscription":
        setSubscriptions((prev) => prev.filter((item) => item.id !== id));
        break;
      case "credit":
        setCreditExpenses((prev) => prev.filter((item) => item.id !== id));
        break;
      case "cash":
        setCashExpenses((prev) => prev.filter((item) => item.id !== id));
        break;
      case "income":
        setIncomes((prev) => prev.filter((item) => item.id !== id));
        break;
    }
  };

  // Add a new category
  const addCategory = (category: Omit<CategoryType, "id">) => {
    const newCategory = {
      ...category,
      id: uuidv4(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  // Update an existing category
  const updateCategory = (category: CategoryType) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === category.id ? category : item))
    );
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };
  
  // Add a new credit card
  const addCreditCard = (creditCard: Omit<CreditCard, "id">) => {
    const newCreditCard = {
      ...creditCard,
      id: uuidv4(),
    };
    setCreditCards((prev) => [...prev, newCreditCard]);
  };

  // Update an existing credit card
  const updateCreditCard = (creditCard: CreditCard) => {
    setCreditCards((prev) =>
      prev.map((item) => (item.id === creditCard.id ? creditCard : item))
    );
  };

  // Delete a credit card
  const deleteCreditCard = (id: string) => {
    setCreditCards((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        subscriptions,
        creditExpenses,
        cashExpenses,
        incomes,
        categories,
        creditCards,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
