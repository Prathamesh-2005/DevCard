import { useEffect, useState, useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";

function filterLastYear(contributions) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return contributions.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= oneYearAgo;
  });
}

export default function GithubContributionGraph({ githubUrl }) {
  const [contributions, setContributions] = useState([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blockSize, setBlockSize] = useState(11);
  const graphRef = useRef(null);

  useEffect(() => {
    if (!githubUrl) {
      setIsLoading(false);
      return;
    }

    // Extract username from GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)/);
    if (!match) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const username = match[1];

    async function fetchData() {
      try {
        setIsLoading(true);
        setHasError(false);

        // Fetch from public GitHub API
        const response = await fetch(
          `https://github-contributions-api.deno.dev/${username}.json`
        );

        if (!response.ok) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data?.contributions && Array.isArray(data.contributions)) {
          const flattenedContributions = data.contributions.flat();
          const contributionLevelMap = {
            NONE: 0,
            FIRST_QUARTILE: 1,
            SECOND_QUARTILE: 2,
            THIRD_QUARTILE: 3,
            FOURTH_QUARTILE: 4,
          };

          const validContributions = flattenedContributions
            .filter(
              (item) =>
                typeof item === "object" &&
                item !== null &&
                "date" in item &&
                "contributionCount" in item &&
                "contributionLevel" in item
            )
            .map((item) => ({
              date: String(item.date),
              count: Number(item.contributionCount || 0),
              level: contributionLevelMap[item.contributionLevel] || 0,
            }));

          if (validContributions.length > 0) {
            const total = validContributions.reduce(
              (sum, item) => sum + item.count,
              0
            );
            setTotalContributions(total);
            setContributions(filterLastYear(validContributions));
          } else {
            setHasError(true);
          }
        } else {
          setHasError(true);
        }
      } catch (err) {
        console.error("Failed to fetch GitHub contributions:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [githubUrl]);

  useEffect(() => {
    function computeBlockSize() {
      if (!graphRef.current) return;

      const availableWidth = graphRef.current.clientWidth;
      const weeks = 53;
      const margin = 4;
      const weekdayLabelWidth = 28;

      const computed = Math.floor(
        (availableWidth - weekdayLabelWidth - margin * (weeks - 1)) / weeks
      );

      setBlockSize(Math.max(5, Math.min(14, computed)));
    }

    computeBlockSize();

    const observer = new ResizeObserver(computeBlockSize);
    if (graphRef.current) observer.observe(graphRef.current);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-zinc-600">Fetching your GitHub activity...</p>
      </div>
    );
  }

  if (hasError || contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <p className="font-medium text-zinc-400">Unable to load contributions</p>
        <p className="text-sm text-zinc-600">Check your GitHub profile directly</p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View on GitHub
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-zinc-600">Last year activity</p>
        <p className="font-semibold text-emerald-400">
          {totalContributions.toLocaleString()} contributions
        </p>
      </div>

      {/* Heatmap */}
      <div ref={graphRef} className="w-full overflow-x-auto bg-black/20 rounded-lg p-3">
        <ActivityCalendar
          data={contributions}
          blockSize={blockSize}
          blockMargin={4}
          fontSize={12}
          maxLevel={4}
          labels={{
            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            weekdays: ["", "M", "", "W", "", "F", ""],
            totalCount: "{{count}} contributions",
          }}
          theme={{
            dark: [
              "rgb(22, 27, 34)",
              "rgb(14, 68, 41)",
              "rgb(0, 109, 50)",
              "rgb(38, 166, 65)",
              "rgb(57, 211, 83)",
            ],
          }}
          colorScheme="dark"
          showWeekdayLabels
        />
      </div>
    </div>
  );
}
