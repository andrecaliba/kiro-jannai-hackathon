export interface Item {
  id: string; // UUID (crypto.randomUUID())
  type: "lost" | "found";
  title: string;
  description: string;
  category: string; // one of CATEGORIES
  location: string; // one of LOCATIONS
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  image_url?: string; // optional image URL
  status: "open" | "claimed" | "resolved";
  contact_email: string; // ust.edu.ph address
  reporter_name: string; // Filipino name
  created_at: string; // ISO 8601 datetime string
  secret_detail?: string; // set by reporter; never shown publicly
  claim_answer?: string; // set by claimant after revealing secret_detail
  claimant_name?: string; // display name of the claimant
}

export interface User {
  name: string;
  email: string;
}

export interface Filters {
  search: string;
  type: "" | "lost" | "found";
  category: string;
  status: "" | "open" | "claimed" | "resolved";
}
