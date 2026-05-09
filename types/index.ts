export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
}

export interface VehicleInfo {
  id: string;
  user_id: string;
  vehicle_name: string;
  total_value: number;
  lease_amount: number;
  monthly_due: number;
  balance_amount: number;
  total_years: number;
  set_reminder: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  vehicle_info_id: string;
  date: string;
  time: string | null;
  reminder_status: "pending" | "sent" | "dismissed";
  created_at: string;
}

export interface Income {
  id: string;
  vehicle_info_id: string;
  land_owner_name: string;
  date: string;
  total_area: number | null;
  income_amount: number;
  notes: string | null;
  receipt: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  vehicle_info_id: string;
  paid_amount: number;
  date: string;
  bank_name: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Experience {
  id: string;
  vehicle_info_id: string;
  experience_name: string;
  date: string;
  price: number;
  created_at: string;
}
