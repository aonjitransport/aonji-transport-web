import { create } from "zustand";
import { authFetch } from "../../lib/authFetch";

const branchURL = "/api/branches";

const useBranchStore = create((set, get) => ({
  branches: [],
  branchesExcludeUserBranch: [],
  branchesLoaded: false,

  fetchBranches: async () => {
    const data = await authFetch(branchURL);
    set({ branches: data, branchesLoaded: true   });
  },
  fetchBranchById: async (id) => {
    const data = await authFetch(`${branchURL}/${id}`);
    return data;
  },

  createBranch: async (payload) => {
    return await authFetch(branchURL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // used in invoice page
  getBranchesByServiceArea: (city) => {
    if (!city) return [];
    return get().branches.filter((b) =>
      b.serviceAreas.includes(city),
      console.log("Branches filtered by city:", city)
      
    );
  },
  // used in bills page to exclude user's branch from the list of branches
  fetchBranchesEcludeUserBranch: async () => {
    const data = await authFetch("/api/branches/exclude-user-branch");
    
    set({ branchesExcludeUserBranch: data.branches });
    console.log("Branches excluding user branch fetched:", data.branches);
    return data.branches;
  }
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



export  default useBranchStore;