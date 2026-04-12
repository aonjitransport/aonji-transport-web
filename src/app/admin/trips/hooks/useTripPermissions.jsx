import { useMemo } from "react";

export const useTripPermissions = (trip, userBranchId) => {
  return useMemo(() => {
    if (!trip || !userBranchId) {
      return {
        allowedStatuses: [],
        isDisabled: true,
      };
    }

    const isOrigin =
      trip.originBranch?._id?.toString() === userBranchId?.toString();

    const isDestination =
      trip.destinationBranch?._id?.toString() === userBranchId?.toString();

    const transitionMap = {
      PLANNED: isOrigin ? ["IN_TRANSIT"] : [],
      IN_TRANSIT: isDestination ? ["REACHED"] : [],
      REACHED: isDestination ? ["COMPLETED"] : [],
      COMPLETED: [],
    };

    const allowedStatuses = transitionMap[trip.status] || [];

    return {
      allowedStatuses,
      isDisabled: allowedStatuses.length === 0,
    };
  }, [trip, userBranchId]);
};