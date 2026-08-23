"use client";

import { useEffect, useState } from "react";
import { getAuthClient } from "../../lib/graphql-client";
import { gql } from "graphql-request";
import { useAuthStore } from "../../lib/store";

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
  const [history, setHistory] = useState<any[]>([]);
  const [bestScore, setBestScore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const client = getAuthClient();
        const data: any = await client.request(DASHBOARD_QUERY);
        setHistory(data.myGameHistory);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboard();
      setBestScore(localStorage.getItem("typing-game-best-score"));
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please login.</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Personal Best</h2>
        <div className="text-4xl font-mono font-bold text-blue-600">
          {bestScore ? `${parseFloat(bestScore).toFixed(2)}s` : "No games played yet"}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Game History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">No history available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-500 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Completion Time</th>
                  <th className="px-6 py-3 font-medium">Wrong Attempts</th>
                  <th className="px-6 py-3 font-medium">Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(parseInt(game.createdAt)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {game.completionTime.toFixed(2)}s
                    </td>
                    <td className="px-6 py-4 text-red-500 font-medium">
                      {game.wrongAttempts}
                    </td>
                    <td className="px-6 py-4 text-red-500 font-medium">
                      +{game.penaltyTime.toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
