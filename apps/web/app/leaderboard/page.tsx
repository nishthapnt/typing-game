"use client";

import { useEffect, useState } from "react";
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

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data: any = await client.request(LEADERBOARD_QUERY);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
        <p className="text-gray-500">Fastest typing speeds across all players</p>
      </div>
      
      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading leaderboard...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold text-center w-24">Rank</th>
                  <th className="px-6 py-4 font-semibold">Player</th>
                  <th className="px-6 py-4 font-semibold text-right">Best Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No scores recorded yet. Be the first!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr key={entry.rank} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                          ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                            entry.rank === 2 ? 'bg-gray-200 text-gray-700' : 
                            entry.rank === 3 ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-50 text-gray-500'}
                        `}>
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {entry.player}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 text-right">
                        {entry.bestTime.toFixed(2)}s
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
