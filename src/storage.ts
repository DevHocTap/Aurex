import type { AppStorage, MonthlyData } from "./types";

const STORAGE_KEY = "aurex_data";

const seedData: AppStorage = {
  "2026-06": {
    categories: [
      { id: "cat-1", name: "Ăn uống", limit: 3000000 },
      { id: "cat-2", name: "Di chuyển", limit: 1000000 },
      { id: "cat-3", name: "Mua sắm", limit: 2000000 },
    ],
    transactions: [
      { id: "tx-1", amount: 18200000, categoryId: "income", categoryName: "Thu nhập", note: "Lương tháng 6", date: "2026-06-01" },
      { id: "tx-2", amount: -2100000, categoryId: "cat-1", categoryName: "Ăn uống", note: "Đi chợ cả tháng", date: "2026-06-15" },
      { id: "tx-3", amount: -450000, categoryId: "cat-2", categoryName: "Di chuyển", note: "Đổ xăng", date: "2026-06-10" },
      { id: "tx-4", amount: -1800000, categoryId: "cat-3", categoryName: "Mua sắm", note: "Mua quần áo", date: "2026-06-14" },
    ],
  },
};

export const StorageService = {
  getAllData(): AppStorage {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    }
    try {
      return JSON.parse(raw) as AppStorage;
    } catch {
      return seedData;
    }
  },

  saveAllData(data: AppStorage): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getMonthData(monthYear: string): MonthlyData {
    const all = this.getAllData();
    if (!all[monthYear]) {
      all[monthYear] = { categories: [], transactions: [] };
      this.saveAllData(all);
    }
    return all[monthYear];
  },

  saveMonthData(monthYear: string, data: MonthlyData): void {
    const all = this.getAllData();
    all[monthYear] = data;
    this.saveAllData(all);
  },
};
