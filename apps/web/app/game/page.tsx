"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { RotateCcw, Trophy, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../lib/store";
import { getAuthClient } from "../../lib/graphql-client";
import { gql } from "graphql-request";
import { useRouter } from "next/navigation";

const SAVE_GAME_RESULT_MUTATION = gql`
  mutation SaveGameResult(
    $completionTime: Float!
    $correctCharacters: Int!
    $wrongAttempts: Int!
    $penaltyTime: Float!
  ) {
    saveGameResult(
      completionTime: $completionTime
      correctCharacters: $correctCharacters
      wrongAttempts: $wrongAttempts
      penaltyTime: $penaltyTime
    ) {
      id
      completionTime
    }
  }
`;

function generateRandomChars(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
}

export default function Game() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [chars, setChars] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewBest, setIsNewBest] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/");
    }
  }, [mounted, user, router]);

  const initGame = useCallback(() => {
    setChars(generateRandomChars(20));
    setCurrentIndex(0);
    setWrongAttempts(0);
    setStartTime(null);
    setEndTime(null);
    setDisplayTime(0);
    setIsFinished(false);
    setIsNewBest(null);

    setTimeout(() => {
      containerRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      initGame();
    }
  }, [mounted, user, initGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (startTime && !isFinished) {
      interval = setInterval(() => {
        const now = Date.now();
        const baseTime = (now - startTime) / 1000;
        const penaltyTime = wrongAttempts * 0.5;

        setDisplayTime(baseTime + penaltyTime);
      }, 50);
    }

    return () => clearInterval(interval);
  }, [startTime, isFinished, wrongAttempts]);

  const saveResult = async (
    completionTime: number,
    correct: number,
    wrong: number,
    penalty: number
  ) => {
    setIsSaving(true);

    try {
      const client = getAuthClient();

      await client.request(SAVE_GAME_RESULT_MUTATION, {
        completionTime,
        correctCharacters: correct,
        wrongAttempts: wrong,
        penaltyTime: penalty,
      });

      const currentBest = localStorage.getItem(
        "typing-game-best-score"
      );

      if (
        !currentBest ||
        completionTime < parseFloat(currentBest)
      ) {
        localStorage.setItem(
          "typing-game-best-score",
          completionTime.toString()
        );

        setIsNewBest(true);
      } else {
        setIsNewBest(false);
      }
    } catch (e) {
      console.error("Failed to save result", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (isFinished || !chars) return;

    // Only accept alphabetic characters.
    if (!/^[a-zA-Z]$/.test(e.key)) return;

    // Start timer on first valid key.
    if (!startTime) {
      setStartTime(Date.now());
    }

    const key = e.key.toLowerCase();
    const target = chars[currentIndex].toLowerCase();

    if (key === target) {
      if (currentIndex === chars.length - 1) {
        setIsFinished(true);

        const finalTime = Date.now();
        setEndTime(finalTime);

        const totalCompletionTime =
          (finalTime - (startTime || Date.now())) / 1000 +
          wrongAttempts * 0.5;

        setDisplayTime(totalCompletionTime);

        saveResult(
          totalCompletionTime,
          20,
          wrongAttempts,
          wrongAttempts * 0.5
        );
      } else {
        setCurrentIndex((curr) => curr + 1);
      }
    } else {
      setWrongAttempts((curr) => curr + 1);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  const progress =
    chars.length > 0
      ? (currentIndex / chars.length) * 100
      : 0;

  return (
    <main
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        if (startTime && !isFinished) {
          containerRef.current?.focus();
        }
      }}
      className="
        flex
        h-[calc(100vh-4rem)]
        items-center
        justify-center
        overflow-hidden
        bg-[var(--background)]
        px-5
        py-4
        text-[var(--text)]
        outline-none
        transition-colors
        duration-300
      "
    >
      <div className="mx-auto w-full max-w-5xl">

        {!isFinished ? (
          <section className="w-full">

            {/* Stats */}
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5">
              <StatPill
                label="Time"
                value={`${displayTime.toFixed(2)}s`}
                accent
              />

              <StatPill
                label="Progress"
                value={`${currentIndex}/${chars.length}`}
              />

              <StatPill
                label="Errors"
                value={String(wrongAttempts)}
                accent
              />
            </div>

            {/* Game card */}
            <div
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

              <div className="p-6 sm:p-8 lg:p-10">

                {/* Instruction */}
                <div className="mb-6 text-center">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-[var(--text-subtle)]
                    "
                  >
                    Type the character
                  </p>

                  {/* Character */}
                  <div
                    className="
                      mt-4
                      flex
                      h-48
                      items-center
                      justify-center
                      rounded-3xl
                      border border-[var(--border)]
                      bg-[var(--background)]
                      sm:h-52
                    "
                  >
                    <span
                      className="
                        font-mono
                        text-8xl
                        font-bold
                        uppercase
                        leading-none
                        text-[var(--accent)]
                        sm:text-9xl
                      "
                    >
                      {chars[currentIndex] || "?"}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[var(--text-subtle)]">
                      Progress
                    </span>

                    <span className="font-mono font-medium text-[var(--text-muted)]">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div
                    className="
                      h-2
                      overflow-hidden
                      rounded-full
                      bg-[var(--border)]
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-[var(--accent)]
                        transition-all
                        duration-150
                      "
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hint */}
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-sm
                    text-[var(--text-muted)]
                  "
                >
                  <AlertCircle
                    size={16}
                    className="shrink-0 text-[var(--accent)]"
                  />

                  <span>
                    Wrong keys add
                    <strong className="mx-1 text-[var(--accent)]">
                      0.5s
                    </strong>
                    penalty
                  </span>
                </div>
              </div>
            </div>

            {/* Restart */}
            <button
              type="button"
              onClick={initGame}
              className="
                mx-auto
                mt-4
                flex
                items-center
                gap-2
                rounded-xl
                border border-[var(--border)]
                bg-[var(--surface)]
                px-5
                py-2.5
                text-sm
                font-medium
                text-[var(--text-muted)]
                transition-all
                duration-200
                hover:border-[var(--accent)]
                hover:text-[var(--accent)]
                hover:shadow-md
              "
            >
              <RotateCcw size={16} />
              Restart
            </button>
          </section>
        ) : (

          /* Results */
          <section className="mx-auto w-full max-w-2xl">

            {/* Result heading */}
            <div className="mb-6 text-center">
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--accent-soft)]
                  text-[var(--accent)]
                "
              >
                <Trophy size={30} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {isNewBest
                  ? "New personal best!"
                  : "Test complete"}
              </h1>

              <p className="mt-2 text-sm text-[var(--text-muted)] sm:text-base">
                {isNewBest
                  ? "You just beat your previous record."
                  : "Nice run. Ready to try again?"}
              </p>
            </div>

            {/* Results card */}
            <div
              className="
                overflow-hidden
                rounded-[2rem]
                border border-[var(--border)]
                bg-[var(--surface)]
                shadow-xl shadow-black/5
              "
            >
              <div className="h-1 bg-[var(--accent)]" />

              <div className="p-6 sm:p-8">

                {/* Final time */}
                <div className="mb-6 text-center">
                  <div
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[var(--text-subtle)]
                    "
                  >
                    Final Time
                  </div>

                  <div
                    className="
                      mt-2
                      font-mono
                      text-5xl
                      font-bold
                      text-[var(--accent)]
                      sm:text-6xl
                    "
                  >
                    {displayTime.toFixed(2)}
                    <span className="ml-2 text-2xl">
                      s
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div
                  className="
                    grid
                    grid-cols-2
                    overflow-hidden
                    rounded-2xl
                    border border-[var(--border)]
                  "
                >
                  <ResultMetric
                    label="Base time"
                    value={
                      startTime && endTime
                        ? `${(
                            (endTime - startTime) /
                            1000
                          ).toFixed(2)}s`
                        : "0.00s"
                    }
                  />

                  <ResultMetric
                    label="Errors"
                    value={String(wrongAttempts)}
                    accent
                  />

                  <ResultMetric
                    label="Penalty"
                    value={`+${(
                      wrongAttempts * 0.5
                    ).toFixed(2)}s`}
                  />

                  <ResultMetric
                    label="Characters"
                    value="20"
                  />
                </div>

                {/* Play again */}
                <button
                  type="button"
                  onClick={initGame}
                  disabled={isSaving}
                  className="
                    mt-6
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[var(--accent)]
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-orange-500/15
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-[var(--accent-hover)]
                    hover:shadow-xl
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <RotateCcw size={18} />

                  {isSaving
                    ? "Saving result..."
                    : "Play Again"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="
        rounded-full
        border border-[var(--border)]
        bg-[var(--surface)]
        px-4
        py-2
        text-sm
      "
    >
      <span className="text-[var(--text-muted)]">
        {label}
      </span>

      <span
        className={`ml-2 font-mono font-bold ${
          accent
            ? "text-[var(--accent)]"
            : "text-[var(--text)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="
        border-b
        border-[var(--border)]
        p-5
        last:border-b-0
        [&:nth-child(odd)]:border-r
        [&:nth-child(3)]:border-b-0
        [&:nth-child(4)]:border-b-0
      "
    >
      <div
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-[var(--text-subtle)]
        "
      >
        {label}
      </div>

      <div
        className={`mt-1 font-mono text-lg font-bold ${
          accent
            ? "text-[var(--accent)]"
            : "text-[var(--text)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}