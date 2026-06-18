import { StorageService } from "./storage";
import { CategoryService } from "./category";
import { TransactionService } from "./transaction";
import type { Category, CategoryWithExpenses, Transaction } from "./types";

const fmt = (n: number): string => n.toLocaleString("vi-VN") + " ₫";

export const UIService = {
  renderAll(monthYear: string): void {
    const monthData = StorageService.getMonthData(monthYear);
    const categoriesWithExpenses = CategoryService.getCategoriesWithExpenses(monthYear);
    const recentTransactions = TransactionService.getRecentTransactions(monthYear);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalBudget = 0;

    monthData.transactions.forEach((tx: Transaction) => {
      if (tx.amount > 0) totalIncome += tx.amount;
      else totalExpense += Math.abs(tx.amount);
    });

    monthData.categories.forEach((cat: Category) => {
      totalBudget += cat.limit;
    });

    document.getElementById("lblBalance")!.innerText = fmt(totalIncome - totalExpense);
    document.getElementById("lblTotalIncome")!.innerText = fmt(totalIncome);
    document.getElementById("lblTotalExpense")!.innerText = fmt(totalExpense);

    const budgetNote = document.getElementById("lblBudgetStatus")!;
    const budgetBadge = document.getElementById("lblBudgetPercent") as HTMLElement;
    const barFill = document.getElementById("barBudgetProgress") as HTMLElement;

    if (totalBudget > 0) {
      const pct = Math.min(Math.round((totalExpense / totalBudget) * 100), 100);
      const remaining = totalBudget - totalExpense;
      barFill.style.width = `${pct}%`;

      if (remaining >= 0) {
        barFill.style.background = "var(--blue)";
        budgetBadge.className = "budget-percent-badge";
        budgetBadge.innerText = `${pct}%`;
        budgetNote.innerText = `Còn lại ${fmt(remaining)} / Ngân sách ${fmt(totalBudget)}`;
      } else {
        barFill.style.background = "var(--red)";
        budgetBadge.className = "budget-percent-badge over";
        budgetBadge.innerText = `Vượt ${pct - 100}%`;
        budgetNote.innerText = `Đã vượt ngân sách ${fmt(Math.abs(remaining))}!`;
      }
    } else {
      barFill.style.width = "0%";
      budgetBadge.className = "budget-percent-badge";
      budgetBadge.innerText = "0%";
      budgetNote.innerText = "Chưa thiết lập hạn mức cho danh mục nào.";
    }

    const catListEl = document.getElementById("divCategoryList")!;
    const selTxCategory = document.getElementById("selTxCategory") as HTMLSelectElement;
    catListEl.innerHTML = "";
    selTxCategory.innerHTML = "";

    categoriesWithExpenses.forEach((cat: CategoryWithExpenses) => {
      const barPct = cat.limit > 0 ? Math.min(Math.round((cat.spent / cat.limit) * 100), 100) : 0;
      const barColor = cat.isOverLimit ? "var(--red)" : "var(--blue)";

      const item = document.createElement("div");
      item.className = `cat-item${cat.isOverLimit ? " over-budget" : ""}`;
      item.innerHTML = `
        <div class="cat-item-top">
          <div class="cat-info">
            <span class="cat-name">${cat.name}</span>
            <span class="cat-limit">Hạn mức: ${fmt(cat.limit)}</span>
            ${cat.isOverLimit ? `<span class="over-badge">⚠ Vượt hạn mức</span>` : ""}
          </div>
          <div class="cat-item-right">
            <span class="cat-spent ${cat.isOverLimit ? "over" : ""}">${fmt(cat.spent)}</span>
            <div class="item-actions">
              <button class="btn-edit"
                data-id="${cat.id}"
                data-name="${cat.name}"
                data-limit="${cat.limit}">Sửa</button>
              <button class="btn-delete" data-id="${cat.id}">Xóa</button>
            </div>
          </div>
        </div>
        <div class="cat-bar-bg">
          <div class="cat-bar-fill" style="width:${barPct}%; background:${barColor};"></div>
        </div>
      `;
      catListEl.appendChild(item);

      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.innerText = cat.name;
      selTxCategory.appendChild(opt);
    });

    const txListEl = document.getElementById("divTransactionList")!;
    txListEl.innerHTML = "";

    recentTransactions.forEach((tx: Transaction) => {
      const isIncome = tx.amount > 0;
      const item = document.createElement("div");
      item.className = "tx-item";
      item.innerHTML = `
        <div class="tx-left">
          <span class="tx-amount ${isIncome ? "income" : "expense"}">
            ${isIncome ? "+" : "−"} ${fmt(Math.abs(tx.amount))}
          </span>
          <div class="tx-meta">
            <span class="tx-cat">${tx.categoryName}</span>
            ${tx.note ? `<span class="tx-note">${tx.note}</span>` : ""}
          </div>
          <span class="tx-date">${tx.date}</span>
        </div>
        <button class="btn-delete-tx" data-id="${tx.id}">Xóa</button>
      `;
      txListEl.appendChild(item);
    });

    const tbody = document.getElementById("summaryTableBody")!;
    tbody.innerHTML = "";

    Object.keys(StorageService.getAllData())
      .sort()
      .forEach((mYear: string) => {
        let mIncome = 0;
        let mExpense = 0;
        StorageService.getAllData()[mYear].transactions.forEach((t: Transaction) => {
          if (t.amount > 0) mIncome += t.amount;
          else mExpense += Math.abs(t.amount);
        });
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>Tháng ${mYear}</strong></td>
          <td>${fmt(mIncome)}</td>
          <td>${fmt(mExpense)}</td>
          <td>${fmt(mIncome - mExpense)}</td>
        `;
        tbody.appendChild(tr);
      });
  },
};
