import "./style.css";
import { CategoryService } from "./category";
import { TransactionService } from "./transaction";
import { UIService } from "./ui";

let editingCategoryId: string | null = null;

function getMonthYear(): string {
  return (document.getElementById("monthPicker") as HTMLInputElement).value;
}

function render(): void {
  UIService.renderAll(getMonthYear());
}

function initMonthPicker(): void {
  const picker = document.getElementById("monthPicker") as HTMLInputElement;
  if (!picker.value) {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    picker.value = `${now.getFullYear()}-${m}`;
  }
}

function setTodayDate(): void {
  const el = document.getElementById("dateTxDate") as HTMLInputElement;
  const now = new Date();
  el.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function resetCategoryForm(): void {
  (document.getElementById("formCategory") as HTMLFormElement).reset();
  (document.getElementById("numCatLimit") as HTMLInputElement).value = "0";
  (document.querySelector("#formCategory button[type='submit']") as HTMLButtonElement).textContent = "Thêm Danh Mục";
  editingCategoryId = null;
}

function bindEvents(): void {
  document.getElementById("monthPicker")!.addEventListener("change", render);

  // Thêm hoặc cập nhật
  document.getElementById("formCategory")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("txtCatName") as HTMLInputElement).value.trim();
    const limit = Number((document.getElementById("numCatLimit") as HTMLInputElement).value) || 0;
    try {
      editingCategoryId
        ? CategoryService.updateCategory(getMonthYear(), editingCategoryId, name, limit)
        : CategoryService.addCategory(getMonthYear(), name, limit);
      resetCategoryForm();
      render();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  // Ẩn/hiện danh mục khi thay đổi
  const selTxType = document.getElementById("selTxType") as HTMLSelectElement;
  const groupTxCat = document.getElementById("groupTxCategory") as HTMLElement;
  selTxType.addEventListener("change", () => {
    groupTxCat.style.display = selTxType.value === "income" ? "none" : "";
  });

  // Thêm giao dịch mới
  document.getElementById("formTransaction")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = (document.getElementById("selTxType") as HTMLSelectElement).value as "income" | "expense";
    const amount = Number((document.getElementById("numTxAmount") as HTMLInputElement).value);
    const catSel = document.getElementById("selTxCategory") as HTMLSelectElement;
    const catName = catSel.options[catSel.selectedIndex]?.text ?? "";
    const note = (document.getElementById("txtTxNote") as HTMLInputElement).value;
    const date = (document.getElementById("dateTxDate") as HTMLInputElement).value;
    try {
      TransactionService.addTransaction(getMonthYear(), type, amount, catSel.value, catName, note, date);
      (document.getElementById("formTransaction") as HTMLFormElement).reset();
      setTodayDate();
      groupTxCat.style.display = "";
      render();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  // Sửa/xóa danh mục
  document.getElementById("divCategoryList")!.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const monthYear = getMonthYear();

    if (target.classList.contains("btn-edit")) {
      editingCategoryId = target.dataset["id"] ?? null;
      (document.getElementById("txtCatName") as HTMLInputElement).value = target.dataset["name"] ?? "";
      (document.getElementById("numCatLimit") as HTMLInputElement).value = target.dataset["limit"] ?? "0";
      (document.querySelector("#formCategory button[type='submit']") as HTMLButtonElement).textContent = "Cập nhật";
      document.getElementById("txtCatName")!.focus();
    }

    if (target.classList.contains("btn-delete")) {
      if (confirm("Xóa danh mục này? Chỉ xóa được nếu chưa có giao dịch liên quan.")) {
        try {
          CategoryService.deleteCategory(monthYear, target.dataset["id"] ?? "");
          resetCategoryForm();
          render();
        } catch (err) {
          alert((err as Error).message);
        }
      }
    }
  });

  // Xóa giao dịch
  document.getElementById("divTransactionList")!.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("btn-delete-tx")) {
      if (confirm("Xóa giao dịch này?")) {
        TransactionService.deleteTransaction(getMonthYear(), target.dataset["id"] ?? "");
        render();
      }
    }
  });
}

initMonthPicker();
setTodayDate();
bindEvents();
render();
