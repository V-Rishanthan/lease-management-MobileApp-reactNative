export interface Transaction {
  id: string;
  name?: string; // Used for Income
  title?: string; // Used for Expenses
  acres?: number;
  amount?: number;
  date: string;
  bank?: string;
  reference?: string;
}

export type YearFilter = "All" | "2024" | "2025" | "2026";
