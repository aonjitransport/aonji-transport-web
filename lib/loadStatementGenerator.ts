import { Branch } from "../models/Branch";
import { LoadStatement } from "../models/LoadStatement";
import { Trip } from "../models/Trip";

type GenerateOptions = {
  month: number;
  year: number;
  branchId?: string;
};

type BranchResult = {
  branchId: string;
  branchCode: string;
  branchName?: string;
  status: "generated" | "skipped_existing" | "skipped_no_trips" | "failed";
  loadStatementId?: string;
  tripCount?: number;
  totalFreightAmount?: number;
  agencyCommission?: number;
  netPayableToMain?: number;
  error?: string;
};

export function getPreviousMonthPeriod(baseDate = new Date()) {
  const currentMonth = baseDate.getMonth();

  if (currentMonth === 0) {
    return {
      month: 12,
      year: baseDate.getFullYear() - 1,
    };
  }

  return {
    month: currentMonth,
    year: baseDate.getFullYear(),
  };
}

export function getMonthDateRange(month: number, year: number) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1)),
    endDate: new Date(Date.UTC(year, month, 1)),
  };
}

export async function generateLoadStatementsForPeriod({
  month,
  year,
  branchId,
}: GenerateOptions) {
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new Error("month must be a number between 1 and 12");
  }

  if (!Number.isInteger(yearNum) || yearNum < 2000) {
    throw new Error("year must be a valid year");
  }

  const { startDate, endDate } = getMonthDateRange(monthNum, yearNum);
  const branchQuery: Record<string, unknown> = { type: "AGENT", isActive: true };

  if (branchId) {
    branchQuery._id = branchId;
  }

  const branches = await Branch.find(branchQuery).select("_id code name");
  const monthStr = String(monthNum).padStart(2, "0");
  const results: BranchResult[] = [];

  for (const branch of branches) {
    const branchIdString = branch._id.toString();
    const baseResult = {
      branchId: branchIdString,
      branchCode: branch.code,
      branchName: branch.name,
    };

    try {
      const existing = await LoadStatement.findOne({
        branch: branch._id,
        month: monthNum,
        year: yearNum,
      }).select("loadStatementId");

      if (existing) {
        results.push({
          ...baseResult,
          status: "skipped_existing",
          loadStatementId: existing.loadStatementId,
        });
        continue;
      }

      const trips = await Trip.find({
        destinationBranch: branch._id,
        status: { $in: ["REACHED", "COMPLETED"] },
        createdAt: { $gte: startDate, $lt: endDate },
      });

      if (!trips.length) {
        results.push({
          ...baseResult,
          status: "skipped_no_trips",
          tripCount: 0,
        });
        continue;
      }

      const totalFreightAmount = Number(
        trips.reduce((sum, trip) => sum + (trip.totalAmount || 0), 0).toFixed(2)
      );
      const agencyCommission = Number(
        trips
          .reduce((sum, trip) => sum + (trip.agencyCharges?.chargeAmount || 0), 0)
          .toFixed(2)
      );
      const netPayableToMain = Number((totalFreightAmount - agencyCommission).toFixed(2));
      const loadStatementId = `LS-${branch.code || "XX"}-${yearNum}-${monthStr}`;

      const statement = await LoadStatement.create({
        loadStatementId,
        branch: branch._id,
        trips: trips.map((trip) => trip._id),
        totalFreightAmount,
        agencyCommission,
        netPayableToMain,
        paidAmount: 0,
        balanceDue: netPayableToMain,
        paymentStatus: "pending",
        month: monthNum,
        year: yearNum,
      });

      results.push({
        ...baseResult,
        status: "generated",
        loadStatementId: statement.loadStatementId,
        tripCount: trips.length,
        totalFreightAmount,
        agencyCommission,
        netPayableToMain,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      results.push({
        ...baseResult,
        status: "failed",
        error: message,
      });
    }
  }

  return {
    month: monthNum,
    year: yearNum,
    startDate,
    endDate,
    totalBranches: branches.length,
    generated: results.filter((result) => result.status === "generated").length,
    skippedExisting: results.filter((result) => result.status === "skipped_existing").length,
    skippedNoTrips: results.filter((result) => result.status === "skipped_no_trips").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  };
}
