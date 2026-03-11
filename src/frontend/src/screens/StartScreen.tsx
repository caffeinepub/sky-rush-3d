import { Rocket, Shield, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useGameStore } from "../game/GameStore";
import { useGetTopScores } from "../hooks/useQueries";

export default function StartScreen() {
  const { startGame, setGameState, highScore } = useGameStore();
  const { data: scores } = useGetTopScores();

  const topScore = scores?.[0]?.score ?? 0n;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div
          className="absolute w-full h-[2px] bg-primary"
          style={{ animation: "scan-line 4s linear infinite" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="relative inline-block">
            <h1 className="font-display text-6xl sm:text-7xl font-black tracking-tight text-primary neon-cyan">
              SKY RUSH
            </h1>
            <div className="absolute -top-2 -right-2">
              <span className="text-accent font-display font-black text-2xl neon-gold">
                3D
              </span>
            </div>
          </div>
          <p className="text-muted-foreground font-body text-sm tracking-[0.3em] uppercase mt-2">
            ENDLESS SPACE RUNNER
          </p>
        </motion.div>

        {(highScore > 0 || Number(topScore) > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-6 text-center"
          >
            {highScore > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your Best
                </div>
                <div className="text-xl font-display font-bold text-accent neon-gold">
                  {highScore.toLocaleString()}
                </div>
              </div>
            )}
            {Number(topScore) > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  World Best
                </div>
                <div className="text-xl font-display font-bold text-primary neon-cyan">
                  {Number(topScore).toLocaleString()}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col w-full gap-3"
        >
          <button
            type="button"
            data-ocid="game.play_button"
            onClick={() => startGame(false)}
            className="w-full py-4 rounded-xl font-display font-bold text-xl tracking-wide bg-primary text-primary-foreground glow-box-cyan hover:scale-[1.03] active:scale-[0.98] transition-all duration-150"
          >
            <span className="flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" />
              LAUNCH
            </span>
          </button>

          <button
            type="button"
            data-ocid="game.daily_button"
            onClick={() => startGame(true)}
            className="w-full py-3.5 rounded-xl font-display font-bold text-lg tracking-wide bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 glow-box-gold"
          >
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              DAILY CHALLENGE
            </span>
          </button>

          <button
            type="button"
            data-ocid="game.leaderboard_button"
            onClick={() => setGameState("leaderboard")}
            className="w-full py-3 rounded-xl font-display font-semibold text-base tracking-wide bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all duration-150"
          >
            <span className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              LEADERBOARD
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-6 text-xs text-muted-foreground font-body"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_#4488ff]" />
            <span>Shield (3s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_#ffdd00]" />
            <span>2× Score (5s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-primary" />
            <span>3 lives</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
