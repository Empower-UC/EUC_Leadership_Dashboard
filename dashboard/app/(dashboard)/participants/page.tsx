import { ParticipantsClient } from "./participants-client";
import participantsData from "@/lib/data/participants.json";

export default function ParticipantsPage() {
  const data = participantsData.participants.map((p, index) => ({
    id: String(index + 1),
    participantId: p.participantId ?? "",
    county: p.county ?? "",
    enrollmentStatus: p.enrollmentStatus,
    enrollmentDate: p.enrollmentDate ? new Date(p.enrollmentDate) : null,
    navigatorName: p.navigatorName,
    householdSize: p.householdSize,
    fplAtEnrollment: p.fplAtEnrollment,
    currentFpl: p.currentFpl,
    fplChange: p.fplChange,
    wageChange: p.wageChange,
    daysInProgram: p.daysInProgram,
    outcomeCategory: p.outcomeCategory,
  }));

  return (
    <ParticipantsClient
      data={data}
      metrics={{
        totalFamilies: participantsData.metrics.totalFamilies,
        totalWageGains: participantsData.metrics.totalWageGains,
        avgFplChange: participantsData.metrics.avgFplChange,
        positiveOutcomes: participantsData.metrics.positiveOutcomes,
      }}
    />
  );
}
