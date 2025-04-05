import { CategoryType } from "@/types/finance";

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
