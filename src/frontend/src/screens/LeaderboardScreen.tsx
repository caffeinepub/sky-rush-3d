import { ArrowLeft, Crown, Loader2, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { ScoreEntry } from "../backend.d";
import { useGameStore } from "../game/GameStore";
import { useGetTopScores } from "../hooks/useQueries";

export default function LeaderboardScreen() {
  const { setGameState } = useGameStore();
  const { data: scores, isLoading, isError } = useGetTopScores();

  const rankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-4 h-4 text-gray-300" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return (
      <span className="text-muted-foreground text-sm font-display w-5 text-center">
        {rank + 1}
      </span>
    );
  };

  const rankClass = (i: number) => {
    if (i === 0) return "bg-yellow-400/10 border border-yellow-400/30";
    if (i === 1) return "bg-gray-400/10 border border-gray-400/20";
    if (i === 2) return "bg-amber-700/10 border border-amber-700/20";
    return "bg-muted/30 border border-transparent";
  };

  const scoreKey = (entry: ScoreEntry, i: number) => `${entry.name}-${i}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="bg-card/95 border border-border rounded-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary/20 to-accent/10 border-b border-border px-5 py-4">
            <button
              type="button"
              data-ocid="game.back_button"
              onClick={() => setGameState("start")}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h2 className="font-display font-black text-xl text-foreground tracking-wide">
                LEADERBOARD
              </h2>
            </div>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {isLoading && (
              <div
                data-ocid="game.loading_state"
                className="flex items-center justify-center py-12 text-muted-foreground"
              >
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading scores...
              </div>
            )}

            {isError && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Could not load scores.</p>
              </div>
            )}

            {scores && scores.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-display">No scores yet.</p>
                <p className="text-sm mt-1">
                  Be the first to make it on the board!
                </p>
              </div>
            )}

            {scores && scores.length > 0 && (
              <div className="space-y-2">
                {scores.map((entry, i) => (
                  <motion.div
                    key={scoreKey(entry, i)}
                    data-ocid={`game.leaderboard.item.${i + 1}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${rankClass(i)}`}
                  >
                    <div className="flex items-center justify-center w-6">
                      {rankIcon(i)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">
                        {entry.name}
                      </p>
                    </div>
                    <div
                      className={`font-display font-bold text-lg tabular-nums ${
                        i === 0 ? "text-yellow-400 neon-gold" : "text-primary"
                      }`}
                    >
                      {Number(entry.score).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border px-5 py-3">
            <button
              type="button"
              onClick={() => setGameState("start")}
              className="w-full py-2.5 rounded-xl font-display font-semibold text-sm bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all"
            >
              BACK TO MENU
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
