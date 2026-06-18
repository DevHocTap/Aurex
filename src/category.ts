import type { Category, CategoryWithExpenses, MonthlyData } from "./types";
import { StorageService } from "./storage";

export const CategoryService = {
  getCategoriesWithExpenses(monthYear: string): CategoryWithExpenses[] {
    const monthData: MonthlyData = StorageService.getMonthData(monthYear);
    return monthData.categories.map((category) => {
      const spent = monthData.transactions
        .filter((tx) => tx.categoryId === category.id && tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return { ...category, spent, isOverLimit: spent > category.limit };
    });
  },

  addCategory(monthYear: string, name: string, limit: number): void {
    if (!name.trim()) throw new Error("Tên danh mục không được để trống.");
    if (limit < 0) throw new Error("Hạn mức không được là số âm.");
    const monthData = StorageService.getMonthData(monthYear);
    const newCategory: Category = { id: `cat-${Date.now()}`, name: name.trim(), limit };
    monthData.categories.push(newCategory);
    StorageService.saveMonthData(monthYear, monthData);
  },

  updateCategory(monthYear: string, categoryId: string, newName: string, newLimit: number): void {
    if (!newName.trim()) throw new Error("Tên danh mục không được để trống.");
    if (newLimit < 0) throw new Error("Hạn mức không được là số âm.");
    const monthData = StorageService.getMonthData(monthYear);
    const cat = monthData.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.name = newName.trim();
      cat.limit = newLimit;

      monthData.transactions.forEach((tx) => {
        if (tx.categoryId === categoryId) tx.categoryName = newName.trim();
      });
      StorageService.saveMonthData(monthYear, monthData);
    }
  },

  deleteCategory(monthYear: string, categoryId: string): void {
    const monthData = StorageService.getMonthData(monthYear);

    if (monthData.transactions.some((tx) => tx.categoryId === categoryId)) {
      throw new Error("Không thể xóa danh mục đã có giao dịch. Xóa các giao dịch liên quan trước.");
    }
    monthData.categories = monthData.categories.filter((c) => c.id !== categoryId);
    StorageService.saveMonthData(monthYear, monthData);
  },
};
