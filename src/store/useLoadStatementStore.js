import { create } from "zustand";

export const useLoadStatementsStore = create((set, get) => ({
  loadStatements: [],
  loading: false,
  error: null,

  // ✅ Fetch statements by agency
// In useLoadStatementStore — the fetch should look like:
fetchLoadStatements: async (branchId, filters) => {
  if (!branchId) return; // ✅ guard here too
  const params = new URLSearchParams();
  params.set("branchId", branchId);
  if (filters.month) params.set("month", filters.month);
  if (filters.year) params.set("year", filters.year);
  
  const res = await fetch(`/api/load-statements?${params.toString()}`, {
    credentials: "include",
  });
  const data = await res.json();
  set({ loadStatements: data });
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
