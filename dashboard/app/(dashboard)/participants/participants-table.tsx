"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { MicroSparkline, MicroTrend } from "@/components/ui/micro-sparkline";

type ParticipantRow = {
  id: string;
  participantId: string;
  county: string;
  enrollmentStatus: string | null;
  enrollmentDate: Date | null;
  navigatorName: string | null;
  householdSize: number | null;
  fplAtEnrollment: number | null;
  currentFpl: number | null;
  fplChange: number | null;
  wageChange: number | null;
  daysInProgram: number | null;
  outcomeCategory: string | null;
};

function getOutcomeBadgeVariant(category: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (category?.toLowerCase()) {
    case "graduated":
      return "default";
    case "active":
      return "secondary";
    case "dismissed":
    case "withdrawn":
      return "destructive";
    default:
      return "outline";
  }
}

function formatFPL(value: number | null): string {
  if (value === null) return "-";
  return `${value.toFixed(0)}%`;
}

function formatCurrency(value: number | null): string {
  if (value === null) return "-";
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// Performance color based on wage gain amount
function getPerformanceColor(value: number): string {
  if (value >= 20000) return "text-gain-high"; // $20K+ - exceptional
  if (value >= 10000) return "text-gain-mid";  // $10K+ - strong
  if (value > 0) return "text-[#8B9E8B]";      // Any positive
  if (value < 0) return "text-risk-high";      // Negative
  return "text-gray-500";                       // Zero
}

const columns: ColumnDef<ParticipantRow>[] = [
  {
    accessorKey: "participantId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        ID
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-data text-sm text-gray-700">{row.getValue("participantId")}</span>
    ),
  },
  {
    accessorKey: "county",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        County
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-900">{row.getValue("county")}</span>
    ),
  },
  {
    accessorKey: "outcomeCategory",
    header: () => (
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">Status</span>
    ),
    cell: ({ row }) => {
      const category = row.getValue("outcomeCategory") as string | null;
      if (!category) return <span className="text-gray-400">-</span>;
      return (
        <Badge variant={getOutcomeBadgeVariant(category)} className="font-medium">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "incomeTrajectory",
    header: () => (
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">Trajectory</span>
    ),
    cell: ({ row }) => {
      const startFpl = row.original.fplAtEnrollment;
      const currentFpl = row.original.currentFpl;
      if (startFpl === null || currentFpl === null) {
        return <span className="text-gray-400">-</span>;
      }
      return (
        <MicroSparkline
          startValue={startFpl}
          endValue={currentFpl}
          width={56}
          height={20}
        />
      );
    },
  },
  {
    accessorKey: "fplAtEnrollment",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Entry FPL
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-data text-sm text-gray-600">
        {formatFPL(row.getValue("fplAtEnrollment"))}
      </span>
    ),
  },
  {
    accessorKey: "currentFpl",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Current FPL
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-data text-sm text-gray-900 font-medium">
        {formatFPL(row.getValue("currentFpl"))}
      </span>
    ),
  },
  {
    accessorKey: "fplChange",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Delta
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const change = row.getValue("fplChange") as number | null;
      if (change === null) return <span className="text-gray-400">-</span>;
      return <MicroTrend change={change} />;
    },
  },
  {
    accessorKey: "wageChange",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Wage Gain
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const change = row.getValue("wageChange") as number | null;
      if (change === null) return <span className="text-gray-400">-</span>;
      const colorClass = getPerformanceColor(change);
      return (
        <span className={`font-data text-sm font-semibold ${colorClass}`}>
          {change > 0 ? "+" : ""}{formatCurrency(change)}
        </span>
      );
    },
  },
  {
    accessorKey: "daysInProgram",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Days
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const days = row.getValue("daysInProgram") as number | null;
      return (
        <span className="font-data text-sm text-gray-600">
          {days !== null ? days : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "navigatorName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-[10px] font-semibold uppercase tracking-[0.08em]"
      >
        Navigator
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.getValue("navigatorName") || "-"}
      </span>
    ),
  },
];

interface ParticipantsTableProps {
  data: ParticipantRow[];
}

export function ParticipantsTable({ data }: ParticipantsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="county"
      searchPlaceholder="Filter by region..."
    />
  );
}
