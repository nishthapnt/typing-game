"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Clock3,
  AlertCircle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { getAuthClient } from "../../lib/graphql-client";
import { gql } from "graphql-request";
import { useAuthStore } from "../../lib/store";
import ThemeToggle from "../../components/ThemeToggle";

const DASHBOARD_QUERY = gql`
  query GetDashboard {
    myGameHistory {
      id
      completionTime
      wrongAttempts
      penaltyTime
      createdAt
    }
  }
`;

export default function Dashboard() {
  const { user } = useAuthStore();

  const [history, setHistory] = useState<{ id: string, completionTime: number, wrongAttempts: number, penaltyTime: number, createdAt: string }[]>([]);
  const [bestScore, setBestScore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const client = getAuthClient();
        const data = (await client.request(DASHBOARD_QUERY)) as { myGameHistory: { id: string, completionTime: number, wrongAttempts: number, penaltyTime: number, createdAt: string }[] };

        setHistory(data.myGameHistory);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
      setBestScore(
        localStorage.getItem("typing-game-best-score")
      );
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-8 text-center text-[var(--text)]">
        Please login.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--text-muted)]">
          Loading your stats...
        </div>
      </div>
    );
  }

  const totalGames = history.length;

  const averageTime =
    totalGames > 0
      ? history.reduce(
        (sum, game) => sum + game.completionTime,
        0
      ) / totalGames
      : 0;

  const totalErrors = history.reduce(
    (sum, game) => sum + game.wrongAttempts,
    0
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors">

      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/game"
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={17} />
            Back to game
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Heading */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Performance
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your dashboard
          </h1>

          <p className="mt-3 text-[var(--text-muted)]">
            Welcome back, {user.name}. Keep improving your speed.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Trophy size={20} />}
            label="Personal Best"
            value={
              bestScore
                ? `${parseFloat(bestScore).toFixed(2)}s`
                : "—"
            }
            accent
          />

          <StatCard
            icon={<Zap size={20} />}
            label="Games Played"
            value={totalGames.toString()}
          />

          <StatCard
            icon={<Clock3 size={20} />}
            label="Average Time"
            value={
              averageTime
                ? `${averageTime.toFixed(2)}s`
                : "—"
            }
          />

          <StatCard
            icon={<AlertCircle size={20} />}
            label="Total Errors"
            value={totalErrors.toString()}
          />

        </div>

        {/* History */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/5">

          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <h2 className="font-semibold text-lg">
                Game history
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Your recent typing tests
              </p>
            </div>

            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {totalGames} games
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
                <Zap size={20} className="text-[var(--accent)]" />
              </div>

              <h3 className="font-semibold">
                No games yet
              </h3>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Complete your first typing test to see your stats.
              </p>

              <Link
                href="/game"
                className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Start typing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Time
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Errors
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Penalty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((game) => (
                    <tr
                      key={game.id}
                      className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-6 py-5 text-sm text-[var(--text-muted)]">
                        {new Date(
                          parseInt(game.createdAt)
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-mono font-bold">
                          {game.completionTime.toFixed(2)}s
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          {game.wrongAttempts}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-mono text-sm text-[var(--text-muted)]">
                        +{game.penaltyTime.toFixed(2)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${accent
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "bg-[var(--background)] text-[var(--text-muted)]"
          }`}
      >
        {icon}
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {label}
      </p>

      <p
        className={`mt-1 font-mono text-2xl font-bold ${accent ? "text-[var(--accent)]" : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
}