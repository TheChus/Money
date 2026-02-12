
export interface Transaction {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  mainCategory: string;
  subCategory: string;
  amount: number;
  description: string;
  tags: string[];
}

export interface Budget {
  zhu: number;
  luo: number;
}

export interface MonthlyBudget {
  [monthKey: string]: Budget; // Key format: YYYY-MM
}

export interface CategoryStructure {
  [main: string]: string[];
}
