"use client";

import { StatisticsGroup, StatisticsItem } from "@/components/custom/statistics";
import { api } from "@/trpc/react";

export function InstanceUsageStatistics({ instanceId }: { instanceId: string }) {
  const result = api.resourceLog.sumLogsInDurationWindowsByInstance.useQuery({
    durationWindows: ["3h", "1d", "7d", "30d"],
    instanceId,
  });

  return (
    <StatisticsGroup className="md:grid-cols-4">
      {result.data?.map((item) => (
        <StatisticsItem
          key={item.durationWindow}
          label={`Last ${item.durationWindow}`}
          value={[`${item.count}`, `${item.utf8LengthSum}`]}
          suffix={["times", "chars"]}
        />
      ))}
    </StatisticsGroup>
  );
}
