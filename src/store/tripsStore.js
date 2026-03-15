import { create } from "zustand";
let currentFetchId = 0;

const useTripsStore = create((set, get) => ({
  trips: [],
  tripCreateStatus: "idle", // "idle" | "loading" | "success" | "error"
  loading: false,
  error: null,

  fetchTrips: async (reqBody) => {
    if (!reqBody?.branch) return;

    const fetchId = ++currentFetchId;
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (reqBody.month) params.append("month", reqBody.month);
      if (reqBody.year) params.append("year", reqBody.year);
      if (reqBody.branch) params.append("branch", reqBody.branch);

      const res = await fetch(`/api/trips?${params.toString()}`);
      const data = await res.json();

      if (fetchId === currentFetchId) {
        set({ trips: data, loading: false });
      }
    } catch (error) {
      if (fetchId === currentFetchId) set({ error, loading: false });
    }
  },

  fetchAllTripsByAgency: async (agencyId) => {
    if (!agencyId) return;
    set({ loading: true, error: null });

    try {
      const res = await fetch(`/api/trips?agency=${agencyId}`);
      if (!res.ok) throw new Error("Failed to fetch trips");

      const data = await res.json();
      set({ trips: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

 createTrip: async (tripData) => {
  try {
    set({ tripCreateStatus: "loading" });

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) throw new Error("Failed to create trip");

    const result = await response.json();
    console.log("✅ trip created:", result);

    set({ tripCreateStatus: "success" });
    return result;

  } catch (error) {
    console.error("❌ Error creating trip:", error);
    set({ tripCreateStatus: "error" });
  }
},
  resetTripStatus: () => set({ tripCreateStatus: "idle" }),

  clearError: () => set({ error: null }),
}));

export default useTripsStore;
