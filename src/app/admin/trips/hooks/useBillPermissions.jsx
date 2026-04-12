import { useMemo } from "react";

export const useBillPermissions = (bill, userBranchId) => {
  return useMemo(() => {
    if (!bill || !userBranchId) {
      return {
        allowedStatuses: [],
        isDisabled: true,
      };
    }

    const isOrigin =
      bill.fromBranch?._id?.toString() === userBranchId?.toString();

    const isDestination =
      bill.toBranch?._id?.toString() === userBranchId?.toString();

    const transitionMap = {
      CREATED: isOrigin ? ["ADDED_TO_TRIP"] : [],
      ADDED_TO_TRIP: isOrigin ? ["IN_TRANSIT"] : [],
      IN_TRANSIT: isDestination ? ["ARRIVED_AT_BRANCH"] : [],
      ARRIVED_AT_BRANCH: isDestination ? ["OUT_FOR_DELIVERY"] : [],
      OUT_FOR_DELIVERY: isDestination ? ["DELIVERED"] : [],
      DELIVERED: isDestination ? ["POD_RECEIVED"] : [],
      POD_RECEIVED: [],
    };

    const allowedStatuses = transitionMap[bill.status] || [];

    return {
      allowedStatuses,
      isDisabled: allowedStatuses.length === 0,
    };
  }, [bill, userBranchId]);
};