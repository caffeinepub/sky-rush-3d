import { Input } from "@/components/ui/input";
import { ChevronRight, RotateCcw, Star, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGameStore } from "../game/GameStore";
import { useSubmitScore } from "../hooks/useQueries";

export default function GameOverScreen() {
  const {
    score,
    highScore,
    multiplier,
    distance,
    isDailyChallenge,
    startGame,
    setGameState,
  } = useGameStore();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = useSubmitScore();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await submitMutation.mutateAsync({ name: name.trim(), score });
      setSubmitted(true);
      toast.success("Score submitted!");
    } catch {
      toast.error("Failed to submit score");
    }
  };

  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.35 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="bg-card/95 border border-border rounded-2xl p-6 space-y-6 glow-box-cyan">
          <div className="text-center space-y-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
            >
              <div className="text-4xl mb-2">
                {isNewHighScore ? "🏆" : "💥"}
              </div>
            </motion.div>
            <h2 className="font-display text-3xl font-black text-foreground">
              {isNewHighScore ? "NEW BEST!" : "GAME OVER"}
            </h2>
            {isDailyChallenge && (
              <div className="inline-flex items-center gap-1.5 bg-accent/20 border border-accent/40 rounded-full px-3 py-0.5 text-accent text-xs font-display font-semibold">
                <Zap className="w-3 h-3" />
                DAILY CHALLENGE
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Score
              </div>
              <div className="text-xl font-display font-bold text-primary neon-cyan">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Max x
              </div>
              <div className="text-xl font-display font-bold text-accent">
                {multiplier}×
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Dist
              </div>
              <div className="text-xl font-display font-bold text-foreground">
                {distance * 4}km
              </div>
            </div>
          </div>

          {highScore > 0 && (
            <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Best
              </span>
              <span className="font-display font-bold text-foreground">
                {highScore.toLocaleString()}
              </span>
            </div>
          )}

          {!submitted ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Submit to leaderboard
              </p>
              <div className="flex gap-2">
                <Input
                  data-ocid="game.name_input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  maxLength={20}
                  className="bg-background/80 border-border/50 text-foreground placeholder:text-muted-foreground font-body"
                />
                <button
                  type="button"
                  data-ocid="game.submit_button"
                  onClick={handleSubmit}
                  disabled={!name.trim() || submitMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-display font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1 shrink-0"
                >
                  {submitMutation.isPending ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-primary py-2">
              <Trophy className="w-4 h-4" />
              <span className="font-display">Score saved!</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              data-ocid="game.restart_button"
              onClick={() => startGame(isDailyChallenge)}
              className="w-full py-3 rounded-xl font-display font-bold text-base bg-primary text-primary-foreground glow-box-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN
            </button>
            <button
              type="button"
              data-ocid="game.leaderboard_button"
              onClick={() => setGameState("leaderboard")}
              className="w-full py-2.5 rounded-xl font-display font-semibold text-sm bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              VIEW LEADERBOARD
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
