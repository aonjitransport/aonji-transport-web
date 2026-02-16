import { create } from "zustand";

export const useLoadStatementsStore = create((set, get) => ({
  loadStatements: [],
  loading: false,
  error: null,

  // ✅ Fetch statements by agency
 fetchLoadStatements: async (agencyId, filters = {}) => {
  try {
    set({ loading: true });
    const params = new URLSearchParams({
      agency: agencyId,
      month: filters.month || "",
      year: filters.year || "",
      paymentStatus:
        filters.paymentStatus !== undefined ? filters.paymentStatus : "",
    }).toString();

    const res = await fetch(`/api/load-statements?${params}`);
    const data = await res.json();
    set({ loadStatements: data, loading: false });
  } catch (err) {
    console.error("Error fetching load statements:", err);
    set({ error: "Failed to fetch load statements", loading: false });
  }
},



  // ✅ Close statement (mark as paid)
  closeLoadStatement: async (statementId) => {
    try {
      const res = await fetch(`/api/load-statements/${statementId}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        const updated = get().loadStatements.map((ls) =>
          ls._id === statementId ? { ...ls, paymentStatus: true } : ls
        );
        set({ loadStatements: updated });
      }
      return data;
    } catch (err) {
      console.error("Error closing statement:", err);
    }
  },

  // ✅ Manually trigger generation
  generateLoadStatements: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/load-statements/generate", {
        method: "POST",
      });
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (err) {
      console.error("Error generating load statements:", err);
      set({ loading: false });
    }
  },
}));
