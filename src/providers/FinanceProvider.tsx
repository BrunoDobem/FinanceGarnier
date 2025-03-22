
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
  mockSubscriptions, 
  mockCreditExpenses, 
  mockCashExpenses, 
  mockIncome,
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

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // State for different transaction types
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [creditExpenses, setCreditExpenses] = useState<CreditExpense[]>([]);
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  // Load mock data on initial render
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    setSubscriptions(mockSubscriptions);
    setCreditExpenses(mockCreditExpenses);
    setCashExpenses(mockCashExpenses);
    setIncomes(mockIncome);
    setCategories(mockCategories);
    
    // Initialize with a default credit card
    const savedCreditCards = localStorage.getItem('garnier-finance-creditCards');
    if (savedCreditCards) {
      setCreditCards(JSON.parse(savedCreditCards));
    } else {
      setCreditCards([
        {
          id: uuidv4(),
          name: "Main Credit Card",
          closingDay: 15,
          dueDay: 5
        }
      ]);
    }
  }, []);
  
  // Save credit cards to localStorage whenever they change
  useEffect(() => {
    if (creditCards.length) {
      localStorage.setItem('garnier-finance-creditCards', JSON.stringify(creditCards));
    }
  }, [creditCards]);

  // Add a new transaction
  const addTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
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
          newTransaction as CreditExpense,
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
    const updatedTransaction = {
      ...transaction,
      updatedAt: new Date().toISOString(),
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
