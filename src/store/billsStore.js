import { create } from "zustand";

const billsURL = "/api/bills";
const navigationURL = "/api/bills/navigation";

const useBillsStore = create((set, get) => ({
  bills: [],
  bill: null,
  billResponse: null,
  loading: true,
  loadingToCreateBill: false,
  billCreateStatus: "idle", // 👈 new status: "idle" | "loading" | "success" | "error"
  prevId: null,
  nextId: null,

createBill: async (data) => {
  try {
    set({ billCreateStatus: "loading" });

    const response = await fetch(billsURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create bill");

    const result = await response.json();
    console.log("✅ Bill created:", result);

    set({
      billCreateStatus: "success",
      billResponse: result,  // <-- MUST SAVE THE CREATED BILL
    });

    return result;
  } catch (error) {
    console.error("❌ Error creating bill:", error);
    set({ billCreateStatus: "error" });
  }
},


  resetBillStatus: () => set({ billCreateStatus: "idle" }),
 

  fetchBills: async () => {
    try {
      const response = await fetch(billsURL);
      const data = await response.json();
      set({ bills: data, loading: false });
      if (data.length > 0) {
        set({ bill: data[data.length - 1] });
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      set({ loading: false });
    }
  },

  fetchBill: async (id) => {
    set({ loading: true });

    if (!id) {
      const state = get();
      if (state.bills.length > 0) {
        set({ bill: state.bills[state.bills.length - 1], loading: false });
      }
      return;
    }

    try {
      const response = await fetch(`${navigationURL}/${id}`);
      if (!response.ok) {
        throw new Error("Bill not found");
      }

      const { bill, prevId, nextId } = await response.json();
      console.log("Navigation response →", bill, prevId, nextId); // ✅ log her

      set({
        bill,
        prevId,
        nextId,
        loading: false,
      });

    } catch (error) {
      console.error("Error fetching bill with navigation:", error);
      set({ bill: null, prevId: null, nextId: null, loading: false });
    }
  },
  fetchBillsByAgency: async (agencyId) => {
    try {
      const response = await fetch(`${billsURL}/agency/${agencyId}`);
      const data = await response.json();
      set({ bills: data, loading: false });
    } catch (error) {
      console.error("Error fetching bills by agency:", error);
      set({ loading: false });
    }
  },
  

  updateBill: async (id, updatedData) => {
    try {
      const response = await fetch(`${billsURL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update bill");

      set((state) => ({
        bills: state.bills.map((bill) =>
          bill.id === id ? { ...bill, ...updatedData } : bill
        ),
      }));
    } catch (error) {
      console.error("Error updating bill:", error);
    }
  },
  
}));

export default useBillsStore;
