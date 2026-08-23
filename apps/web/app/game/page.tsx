"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../../lib/store";
import { getAuthClient } from "../../lib/graphql-client";
import { gql } from "graphql-request";
import { useRouter } from "next/navigation";

const SAVE_GAME_RESULT_MUTATION = gql`
  mutation SaveGameResult($completionTime: Float!, $correctCharacters: Int!, $wrongAttempts: Int!, $penaltyTime: Float!) {
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
    result += chars.charAt(Math.floor(Math.random() * chars.length));
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

  const containerRef = useRef<HTMLDivElement>(null);

  // Focus container so it receives key events
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const initGame = useCallback(() => {
    setChars(generateRandomChars(20));
    setCurrentIndex(0);
    setWrongAttempts(0);
    setStartTime(null);
    setEndTime(null);
    setDisplayTime(0);
    setIsFinished(false);
    setIsNewBest(null);
    if (containerRef.current) containerRef.current.focus();
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isFinished || !chars) return;

    // Ignore non-alphabet keys like modifiers
    if (!/^[a-zA-Z]$/.test(e.key)) return;
    
    // Start timer on first valid key press
    if (!startTime) {
      setStartTime(Date.now());
    }

    const key = e.key.toLowerCase();
    const target = chars[currentIndex].toLowerCase();

    if (key === target) {
      if (currentIndex === chars.length - 1) {
        // Game finished
        setIsFinished(true);
        const finalTime = Date.now();
        setEndTime(finalTime);
        const totalCompletionTime = (finalTime - (startTime || Date.now())) / 1000 + (wrongAttempts * 0.5);
        setDisplayTime(totalCompletionTime);
        saveResult(totalCompletionTime, 20, wrongAttempts, wrongAttempts * 0.5);
      } else {
        setCurrentIndex(curr => curr + 1);
      }
    } else {
      // Incorrect key
      setWrongAttempts(curr => curr + 1);
    }
  };

  const saveResult = async (completionTime: number, correct: number, wrong: number, penalty: number) => {
    setIsSaving(true);
    try {
      const client = getAuthClient();
      await client.request(SAVE_GAME_RESULT_MUTATION, {
        completionTime,
        correctCharacters: correct,
        wrongAttempts: wrong,
        penaltyTime: penalty,
      });

      // Update local storage best score
      const currentBest = localStorage.getItem("typing-game-best-score");
      if (!currentBest || completionTime < parseFloat(currentBest)) {
        localStorage.setItem("typing-game-best-score", completionTime.toString());
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

  if (!user) return null;

  return (
    <div 
      className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={containerRef}
      onBlur={() => {
        // Auto-refocus logic if user clicks away during active game
        if (startTime && !isFinished && containerRef.current) {
          containerRef.current.focus();
        }
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-center">
        {!isFinished ? (
          <>
            <div className="mb-8 flex justify-between items-center text-gray-500">
              <div className="font-semibold text-lg">
                Time: <span className="text-gray-900 font-mono">{displayTime.toFixed(2)}s</span>
              </div>
              <div className="font-semibold text-lg">
                Progress: <span className="text-gray-900">{currentIndex} / 20</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl mb-8 border-2 border-gray-100">
              <span className="text-8xl font-bold uppercase tracking-widest text-blue-600">
                {chars[currentIndex] || "?"}
              </span>
            </div>

            <div className="text-sm text-gray-400">
              Type the character above. Wrong keys add 0.5s penalty.
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              {isNewBest ? (
                <span className="text-green-600">Success! New Personal Best! 🎉</span>
              ) : (
                <span className="text-gray-800">Failure / Try Again</span>
              )}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-xl">
              <div className="text-gray-500">Final Time:</div>
              <div className="font-mono font-bold text-lg text-right">{displayTime.toFixed(2)}s</div>
              
              <div className="text-gray-500">Base Time:</div>
              <div className="font-mono text-right">{((endTime! - startTime!) / 1000).toFixed(2)}s</div>
              
              <div className="text-gray-500">Wrong Attempts:</div>
              <div className="font-mono text-red-500 text-right">{wrongAttempts}</div>
              
              <div className="text-gray-500">Penalty Time:</div>
              <div className="font-mono text-red-500 text-right">+{(wrongAttempts * 0.5).toFixed(2)}s</div>
            </div>

            <button
              onClick={initGame}
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Play Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
