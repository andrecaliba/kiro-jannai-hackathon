import { create } from "zustand";
import { Item, User, Filters } from "@/types";

export const DEMO_USER: User = {
  name: "Juan dela Cruz",
  email: "jdelacruz@ust.edu.ph",
};

export const MOCK_ITEMS: Item[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801",
    type: "lost",
    title: "Mobile Phone",
    description:
      "Black Samsung Galaxy S23 with a cracked screen protector. Has a dark green case with a lanyard hole. Last seen near the vending machines on the 3rd floor.",
    category: "Electronics",
    location: "Main Building",
    date: "2025-01-15",
    status: "open",
    contact_email: "mreyes@ust.edu.ph",
    reporter_name: "Maria Reyes",
    created_at: "2025-01-15T08:32:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802",
    type: "lost",
    title: "UST ID Card",
    description:
      "UST student ID card for the academic year 2024–2025. Name on card: Jose Santos. College of Engineering. Please return to the Office of the Registrar or contact directly.",
    category: "ID and Cards",
    location: "Benavides Building",
    date: "2025-01-18",
    status: "open",
    contact_email: "jrsantos@ust.edu.ph",
    reporter_name: "Jose Santos",
    created_at: "2025-01-18T10:15:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803",
    type: "lost",
    title: "Brown Leather Wallet",
    description:
      "Small brown bifold leather wallet containing a UST ID, two ATM cards, and approximately PHP 500 in cash. Has initials 'A.L.C.' embossed on the inside flap.",
    category: "Bags and Wallets",
    location: "UST Library",
    date: "2025-01-10",
    status: "claimed",
    contact_email: "alcabrera@ust.edu.ph",
    reporter_name: "Ana Liza Cabrera",
    created_at: "2025-01-10T13:45:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804",
    type: "found",
    title: "Black Backpack",
    description:
      "Medium-sized black Jansport backpack found on a bench near the entrance. Contains notebooks, a pencil case, and what appears to be a packed lunch. No ID found inside.",
    category: "Bags and Wallets",
    location: "Tan Yan Kee Student Center",
    date: "2025-01-20",
    status: "open",
    contact_email: "bpaglinawan@ust.edu.ph",
    reporter_name: "Benito Paglinawan",
    created_at: "2025-01-20T11:00:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805",
    type: "lost",
    title: "Set of Keys",
    description:
      "A keychain with three keys and a small Santo Niño figurine keychain charm. One key appears to be a house key, one a padlock key, and one a smaller cabinet key.",
    category: "Keys",
    location: "Albertus Magnus Building",
    date: "2025-01-05",
    status: "resolved",
    contact_email: "cdeleon@ust.edu.ph",
    reporter_name: "Carlos de Leon",
    created_at: "2025-01-05T09:20:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806",
    type: "found",
    title: "Organic Chemistry Textbook",
    description:
      "Found a copy of 'Organic Chemistry' by Paula Bruice, 8th edition. Has handwritten notes and highlighted sections throughout. A name written on the inside cover is partially erased.",
    category: "Books and Notes",
    location: "Roque Ruano Building",
    date: "2025-01-22",
    status: "open",
    contact_email: "rflores@ust.edu.ph",
    reporter_name: "Rosario Flores",
    created_at: "2025-01-22T14:30:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807",
    type: "found",
    title: "Navy Blue Umbrella",
    description:
      "A compact navy blue folding umbrella with a silver handle. Found leaning against a pillar after the rain. Brand appears to be Esprit. In good condition.",
    category: "Clothing",
    location: "Plaza Mayor",
    date: "2025-01-19",
    status: "claimed",
    contact_email: "lmendoza@ust.edu.ph",
    reporter_name: "Lourdes Mendoza",
    created_at: "2025-01-19T16:05:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567808",
    type: "lost",
    title: "Laptop Charger",
    description:
      "Lenovo 65W USB-C laptop charger with a black cable. The brick has a small piece of white tape with 'GARCIA' written on it. Left behind in a study carrel.",
    category: "Electronics",
    location: "UST Library",
    date: "2025-01-21",
    status: "open",
    contact_email: "agarcia@ust.edu.ph",
    reporter_name: "Antonio Garcia",
    created_at: "2025-01-21T17:50:00.000Z",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567809",
    type: "lost",
    title: "iPhone 14 Pro",
    description:
      "Space black iPhone 14 Pro with a clear case. Has a small crack on the bottom-left corner of the screen.",
    category: "Electronics",
    location: "Main Building",
    date: "2025-01-25",
    status: "open",
    contact_email: "pcruz@ust.edu.ph",
    reporter_name: "Patricia Cruz",
    created_at: "2025-01-25T09:00:00.000Z",
    secret_detail: "What color is the phone case?",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567810",
    type: "lost",
    title: "Calculus Textbook",
    description:
      "Stewart Calculus 8th edition with a blue sticky note on the cover. Name written inside: 'R. Bautista'.",
    category: "Books and Notes",
    location: "UST Library",
    date: "2025-01-26",
    status: "open",
    contact_email: "rbautista@ust.edu.ph",
    reporter_name: "Ramon Bautista",
    created_at: "2025-01-26T11:30:00.000Z",
    secret_detail: "There is a blue sticky note on the front cover.",
  },
];

interface StoreState {
  // State
  user: User | null;
  items: Item[];
  filters: Filters;

  // Actions
  signIn: () => void;
  signOut: () => void;
  addItem: (item: Omit<Item, "id" | "created_at">) => void;
  updateItemStatus: (id: string, status: Item["status"]) => void;
  submitClaimAnswer: (id: string, claim_answer: string, claimant_name: string) => void;
  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;
}

const INITIAL_FILTERS: Filters = {
  search: "",
  type: "",
  category: "",
  status: "",
};

export const useStore = create<StoreState>((set) => ({
  // Initial state
  user: null,
  items: MOCK_ITEMS,
  filters: INITIAL_FILTERS,

  // Actions
  signIn: () => set({ user: DEMO_USER }),

  signOut: () => set({ user: null }),

  addItem: (item) =>
    set((state) => ({
      items: [
        {
          ...item,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        },
        ...state.items,
      ],
    })),

  updateItemStatus: (id, status) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),

  submitClaimAnswer: (id, claim_answer, claimant_name) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, claim_answer, claimant_name } : item
      ),
    })),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  resetFilters: () => set({ filters: INITIAL_FILTERS }),
}));
