import { StatisticsGroup, StatisticsItem } from "@/components/custom/statistics";
import { api } from "@/trpc/server";
import { Label } from "@radix-ui/react-label";

export async function UserUsageStatistics({ userId }: { userId?: string }) {
  const chatgptSharedResult = await api.resourceLog.sumChatGPTSharedLogsInDurationWindowsByUserId({
    durationWindows: ["3h", "24h", "7d", "30d"],
    userId, // by default is the current user
  });
  const poekmonSharedResult = await api.resourceLog.sumPoekmonSharedLogsInDurationWindowsByUserId({
    durationWindows: ["3h", "24h", "7d", "30d"],
    userId, // by default is the current user
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const allZero = (result: any[]) => result.every((item: any) => item.stats.count === 0);

  return (
    <div>
      {!allZero(chatgptSharedResult) && (
        <div>
          <span className="mx-2 py-3 text-lg">ChatGPT 共享</span>
          <StatisticsGroup className="md:grid-cols-4">
            {chatgptSharedResult.map((item) => (
              <StatisticsItem
                key={item.durationWindow}
                label={`Last ${item.durationWindow}`}
                value={[String(item.stats.count ?? 0), String(item.stats.sumUtf8Length ?? 0)]}
                suffix={["times", "chars"]}
              />
            ))}
          </StatisticsGroup>
        </div>
      )}
      {!allZero(poekmonSharedResult) && (
        <div>
          <span className="mx-2 py-3 text-lg">Poe 共享</span>
          <StatisticsGroup className="md:grid-cols-4">
            {poekmonSharedResult.map((item) => (
              <StatisticsItem
                key={item.durationWindow}
                label={`Last ${item.durationWindow}`}
                value={[String(item.stats.count ?? 0), String(item.stats.sumPoints ?? 0)]}
                suffix={["times", "points"]}
              />
            ))}
          </StatisticsGroup>
        </div>
      )}
      {allZero(chatgptSharedResult) && allZero(poekmonSharedResult) && (
        <div className="mx-auto flex h-[120px] w-full flex-row items-center justify-center align-middle">
          <span className="text-md text-muted-foreground">No statistics available</span>
        </div>
      )}
    </div>
  );
}
