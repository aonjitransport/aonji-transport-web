// src/app/admin/trips/hooks/useBillPermissions.jsx
import { useMemo } from "react";

/**
 * Determines what bill status transitions are allowed
 * based on BOTH the bill's current status AND the trip's current status.
 *
 * The key rule: bill status cannot jump ahead of the trip status.
 *
 * Trip flow:    PLANNED → IN_TRANSIT → REACHED → COMPLETED (auto)
 * Bill flow:    ADDED_TO_TRIP → IN_TRANSIT → ARRIVED_AT_BRANCH → OUT_FOR_DELIVERY → DELIVERED → POD_RECEIVED (auto)
 *
 * Dependency:
 *   Bill IN_TRANSIT         requires Trip IN_TRANSIT  (auto-synced, not manual)
 *   Bill ARRIVED_AT_BRANCH  requires Trip REACHED     (auto-synced, not manual)
 *   Bill OUT_FOR_DELIVERY   requires Trip REACHED
 *   Bill DELIVERED          requires Trip REACHED
 *   Bill POD_RECEIVED       set by admin via POD verification only
 */
export const useBillPermissions = (bill, userBranchId, tripStatus) => {
  return useMemo(() => {
    if (!bill || !userBranchId) {
      return { allowedStatuses: [], isDisabled: true };
    }

    const isOrigin =
      bill.fromBranch?._id?.toString() === userBranchId?.toString();
    const isDestination =
      bill.toBranch?._id?.toString() === userBranchId?.toString();

    /*
      Manual transitions the UI can trigger.
      IN_TRANSIT and ARRIVED_AT_BRANCH are AUTO-SYNCED by the trip status update —
      agents do NOT manually set these. They are removed from the manual map.
    */
    const transitionMap = {
      CREATED: [], // not yet in trip
      ADDED_TO_TRIP: [], // waits for trip to start
      IN_TRANSIT: [], // auto — trip sets this
      ARRIVED_AT_BRANCH:
        isDestination && tripStatus === "REACHED" // destination manually sets OFD
          ? ["OUT_FOR_DELIVERY"]
          : [],
      OUT_FOR_DELIVERY:
        isDestination && tripStatus === "REACHED" ? ["DELIVERED"] : [],
      DELIVERED: [], // POD_RECEIVED is set by admin via POD verification only
      POD_RECEIVED: [],
      MISSING: [],
    };

    const allowedStatuses = transitionMap[bill.status] || [];

    return {
      allowedStatuses,
      isDisabled: allowedStatuses.length === 0,
    };
  }, [bill, userBranchId, tripStatus]);
};
