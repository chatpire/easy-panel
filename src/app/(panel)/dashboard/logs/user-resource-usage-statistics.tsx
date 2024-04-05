import { StatisticsGroup, StatisticsItem } from "@/components/custom/statistics";
import { api } from "@/trpc/server";

export async function UserUsageStatistics({ userId }: { userId?: string }) {
  const result = await api.resourceLog.sumLogsInDurationWindowsByUserId({
    durationWindows: ["3h", "1d", "7d", "30d"],
    userId, // by default is the current user
  });

  return (
    <StatisticsGroup className="md:grid-cols-4">
      {result.map((item) => (
        <StatisticsItem
          key={item.durationWindow}
          label={`Last ${item.durationWindow}`}
          value={[String(item.stats[0]?.count ?? 0), String(item.stats[0]?.sumUtf8Length ?? 0)]}
          suffix={["times", "chars"]}
        />
      ))}
    </StatisticsGroup>
  );
}
