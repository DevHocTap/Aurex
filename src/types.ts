export interface Category {
  id: string;
  name: string;
  limit: number;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  note: string;
  date: string;
}

export interface MonthlyData {
  categories: Category[];
  transactions: Transaction[];
}

export interface AppStorage {
  [monthYear: string]: MonthlyData;
}

export interface CategoryWithExpenses extends Category {
  spent: number;
  isOverLimit: boolean;
}
