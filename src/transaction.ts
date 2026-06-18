import type { Transaction, MonthlyData } from "./types";
import { StorageService } from "./storage";

export const TransactionService = {
  addTransaction(
    monthYear: string,
    type: "income" | "expense",
    amount: number,
    categoryId: string,
    categoryName: string,
    note: string,
    date: string,
  ): void {
    if (amount <= 0 || isNaN(amount))
      throw new Error("Số tiền phải là số dương lớn hơn 0.");
    if (!date)
      throw new Error("Vui lòng chọn ngày diễn ra giao dịch.");
    if (type === "expense" && (!categoryId || categoryId === "income"))
      throw new Error("Giao dịch chi tiêu cần chọn danh mục hợp lệ.");

    const monthData: MonthlyData = StorageService.getMonthData(monthYear);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: type === "income" ? amount : -amount,
      categoryId: type === "income" ? "income" : categoryId,
      categoryName: type === "income" ? "Thu nhập" : categoryName,
      note: note.trim(),
      date,
    };
    monthData.transactions.push(newTx);
    StorageService.saveMonthData(monthYear, monthData);
  },

  getRecentTransactions(monthYear: string): Transaction[] {
    return StorageService.getMonthData(monthYear)
      .transactions.slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  deleteTransaction(monthYear: string, transactionId: string): void {
    const monthData = StorageService.getMonthData(monthYear);
    monthData.transactions = monthData.transactions.filter((tx) => tx.id !== transactionId);
    StorageService.saveMonthData(monthYear, monthData);
  },
};
