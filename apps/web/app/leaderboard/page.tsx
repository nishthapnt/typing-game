"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Clock, Users } from "lucide-react";
import { client } from "../../lib/graphql-client";
import { gql } from "graphql-request";

const LEADERBOARD_QUERY = gql`
  query GetLeaderboard {
    leaderboard {
      rank
      player
      bestTime
    }
  }
`;

type LeaderboardEntry = {
  rank: number;
  player: string;
  bestTime: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = (await client.request(
          LEADERBOARD_QUERY
        )) as {
          leaderboard: LeaderboardEntry[];
        };

        setLeaderboard(data.leaderboard);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <main
      className="
        min-h-[calc(100vh-4rem)]
        bg-[var(--background)]
        px-5 py-10
        text-[var(--text)]
        transition-colors duration-300
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">

          <div
            className="
              mx-auto mb-4
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-[var(--accent-soft)]
              text-[var(--accent)]
            "
          >
            <Trophy size={27} />
          </div>

          <h1
            className="
              text-3xl font-bold tracking-tight
              sm:text-4xl
            "
          >
            Global Leaderboard
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)] sm:text-base">
            The fastest players on TypeSpeed.
          </p>
        </div>

        {/* Quick stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <InfoCard
            icon={<Users size={17} />}
            label="Players"
            value={leaderboard.length.toString()}
          />

          <InfoCard
            icon={<Clock size={17} />}
            label="Best Time"
            value={
              leaderboard.length > 0
                ? `${leaderboard[0].bestTime.toFixed(2)}s`
                : "--"
            }
          />

          <InfoCard
            icon={<Trophy size={17} />}
            label="Top Rank"
            value={leaderboard.length > 0 ? "#1" : "--"}
            className="hidden sm:flex"
          />
        </div>

        {/* Leaderboard card */}
        <section
          className="
            overflow-hidden
            rounded-[2rem]
            border border-[var(--border)]
            bg-[var(--surface)]
            shadow-xl shadow-black/5
          "
        >
          {/* Orange accent */}
          <div className="h-1 bg-[var(--accent)]" />

          {/* Card heading */}
          <div
            className="
              flex items-center justify-between
              border-b border-[var(--border)]
              px-5 py-5
              sm:px-7
            "
          >
            <div>
              <h2 className="font-semibold">
                Top Players
              </h2>

              <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
                Ranked by fastest completion time
              </p>
            </div>

            <Trophy
              size={19}
              className="text-[var(--accent)]"
            />
          </div>

          {loading ? (
            <LoadingState />
          ) : leaderboard.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[500px] text-left">

                <thead>
                  <tr
                    className="
                      border-b border-[var(--border)]
                      bg-[var(--background)]
                    "
                  >
                    <th
                      className="
                        w-24
                        px-5 py-4
                        text-center
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--text-subtle)]
                        sm:px-7
                      "
                    >
                      Rank
                    </th>

                    <th
                      className="
                        px-5 py-4
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--text-subtle)]
                      "
                    >
                      Player
                    </th>

                    <th
                      className="
                        px-5 py-4
                        text-right
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--text-subtle)]
                        sm:px-7
                      "
                    >
                      Best Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaderboard.map((entry) => (
                    <LeaderboardRow
                      key={entry.rank}
                      entry={entry}
                    />
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>

        {/* Footer hint */}
        {!loading && leaderboard.length > 0 && (
          <p className="mt-5 text-center text-xs text-[var(--text-subtle)]">
            Lower completion times rank higher.
          </p>
        )}
      </div>
    </main>
  );
}

/* ---------------------------------- */
/* Leaderboard row */
/* ---------------------------------- */

function LeaderboardRow({
  entry,
}: {
  entry: LeaderboardEntry;
}) {
  const isFirst = entry.rank === 1;
  const isSecond = entry.rank === 2;
  const isThird = entry.rank === 3;

  return (
    <tr
      className="
        border-b border-[var(--border)]
        last:border-b-0
        transition-colors
        hover:bg-[var(--surface-hover)]
      "
    >
      {/* Rank */}
      <td className="px-5 py-4 text-center sm:px-7">
        <RankBadge rank={entry.rank} />
      </td>

      {/* Player */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">

          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-full
              border border-[var(--border)]
              bg-[var(--background)]
              text-sm
              font-semibold
              text-[var(--text-muted)]
            "
          >
            {entry.player.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div
              className="
                max-w-[180px]
                truncate
                font-medium
                text-[var(--text)]
              "
            >
              {entry.player}
            </div>

            {isFirst && (
              <div
                className="
                  mt-0.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[var(--accent)]
                "
              >
                Current champion
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Time */}
      <td className="px-5 py-4 text-right sm:px-7">
        <span
          className={`
            font-mono
            text-sm
            font-bold
            sm:text-base
            ${
              isFirst
                ? "text-[var(--accent)]"
                : "text-[var(--text)]"
            }
          `}
        >
          {entry.bestTime.toFixed(2)}s
        </span>
      </td>
    </tr>
  );
}

/* ---------------------------------- */
/* Rank badge */
/* ---------------------------------- */

function RankBadge({ rank }: { rank: number }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <div
      className={`
        mx-auto
        flex h-9 w-9
        items-center justify-center
        rounded-xl
        text-xs
        font-bold
        ${
          isFirst
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : isSecond
              ? "bg-[var(--background)] text-[var(--text-muted)]"
              : isThird
                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "bg-[var(--background)] text-[var(--text-subtle)]"
        }
      `}
    >
      {isFirst ? (
        <Medal size={17} />
      ) : (
        `#${rank}`
      )}
    </div>
  );
}

/* ---------------------------------- */
/* Info card */
/* ---------------------------------- */

function InfoCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`
        items-center gap-3
        rounded-2xl
        border border-[var(--border)]
        bg-[var(--surface)]
        px-4 py-3
        shadow-sm
        ${className || "flex"}
      `}
    >
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl
          bg-[var(--accent-soft)]
          text-[var(--accent)]
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
          {label}
        </div>

        <div className="mt-0.5 truncate font-mono text-sm font-bold text-[var(--text)]">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Loading */
/* ---------------------------------- */

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">

        <div
          className="
            mx-auto mb-4
            h-8 w-8
            animate-spin
            rounded-full
            border-2
            border-[var(--border)]
            border-t-[var(--accent)]
          "
        />

        <p className="text-sm text-[var(--text-muted)]">
          Loading leaderboard...
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Empty state */
/* ---------------------------------- */

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

      <div
        className="
          mb-4
          flex h-12 w-12
          items-center justify-center
          rounded-2xl
          bg-[var(--accent-soft)]
          text-[var(--accent)]
        "
      >
        <Trophy size={22} />
      </div>

      <h3 className="font-semibold text-[var(--text)]">
        No scores yet
      </h3>

      <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
        Be the first player to complete a typing test
        and claim the top spot.
      </p>
    </div>
  );
}