import { create } from "zustand";
import { authFetch } from "../../lib/authFetch"; // adjust if your alias is different

const agencyURL = "/api/agencies";

export const useAgencyStore = create((set, get) => ({
  agencies: [],

    fetchAgencies: async () => {
    try {
      const data = await authFetch(agencyURL); // ✅ now auto-sends cookie
      set({ agencies: data });
      console.log("Agencies fetched:", data);
    } catch (error) {
      console.error("Error fetching Agency:", error);
    }
  },

  deleteAgencyById: async (id) => {
    try {
      await authFetch(`${agencyURL}/${id}`, { method: "DELETE" });
      set((state) => ({
        agencies: state.agencies.filter((a) => a._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting agency:", error);
    }
  },

  createAgency: async (data) => {
    try {
      await authFetch(agencyURL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error creating new agency:", error);
    }
  },

  updateAgency: async (id, updatedData) => {
    try {
      await authFetch(`${agencyURL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedData),
      });
      set((state) => ({
        agencies: state.agencies.map((a) =>
          a._id === id ? { ...a, ...updatedData } : a
        ),
      }));
    } catch (error) {
      console.error("Error updating Agency:", error);
    }
  },

  // ✅ Get single/multiple agencies by city
  getAgencyByCity: (city) => {
    const target = city?.trim().toLowerCase();
    const { agencies } = get();
    const matches = agencies.filter(
      (a) => a.city?.trim().toLowerCase() === target
    );
    console.log("🔍 Agency by city:", target, matches);
    return matches;
  },

  getAllAgenciesByCity: (city) => {
    const target = city?.trim().toLowerCase();
    const { agencies } = get();
    return agencies.filter(
      (a) => a.city?.trim().toLowerCase() === target
    );
  },

  // ✅ Filter by service area
  getAgenciesByArea: (area) => {
    const agencies = get().agencies;
    if (!area) return [];
    const lowerArea = area.toLowerCase();
    return agencies.filter(
      (a) =>
        Array.isArray(a.serviceAreas) &&
        a.serviceAreas.some((sa) => sa.toLowerCase() === lowerArea)
    );
  },
}));

// ✅ Delete modal state
export const useAgencyDeleteModal = create((set) => ({
  isOpen: false,
  agencyId: null,
  openModal: (id) => set({ isOpen: true, agencyId: id }),
  closeModal: () => set({ isOpen: false, agencyId: null }),
}));

// ✅ Edit modal state
export const useAgencyEditModal = create((set) => ({
  isOpen: false,
  agencyData: null,
  openModal: (agency) => set({ isOpen: true, agencyData: agency }),
  closeModal: () => set({ isOpen: false, agencyData: null }),
}));
