import { Shield, Star, Zap } from "lucide-react";
import { useGameStore } from "./GameStore";
import { inputState } from "./inputState";

const LIFE_KEYS = ["life-1", "life-2", "life-3"];

export default function HUD() {
  const {
    score,
    lives,
    multiplier,
    distance,
    shieldActive,
    doubleScoreActive,
    shieldTimer,
    doubleTimer,
  } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 gap-4">
        <div
          data-ocid="game.score_panel"
          className="bg-black/60 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-2 min-w-[140px]"
        >
          <div className="text-[10px] uppercase tracking-widest text-primary/60 font-body">
            Score
          </div>
          <div className="text-2xl font-display font-bold text-primary neon-cyan tabular-nums">
            {score.toLocaleString()}
          </div>
          {distance > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {distance * 4}km
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {shieldActive && (
            <div className="bg-blue-900/70 border border-blue-400/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-display">
                {shieldTimer.toFixed(1)}s
              </span>
            </div>
          )}
          {doubleScoreActive && (
            <div className="bg-yellow-900/70 border border-yellow-400/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-display">
                {doubleTimer.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {multiplier > 1 && (
            <div className="bg-accent/20 border border-accent/40 rounded-lg px-3 py-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-accent font-display font-bold text-lg neon-gold">
                {multiplier}x
              </span>
            </div>
          )}
          <div
            data-ocid="game.lives_panel"
            className="bg-black/60 backdrop-blur-sm border border-border/40 rounded-lg px-4 py-2 flex items-center gap-2"
          >
            {LIFE_KEYS.map((key, i) => (
              <div
                key={key}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  i < lives
                    ? "bg-primary border-primary shadow-[0_0_8px_oklch(0.78_0.19_195)]"
                    : "bg-transparent border-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile D-pad */}
      <div className="absolute bottom-8 right-6 pointer-events-auto md:hidden">
        <div className="relative w-32 h-32">
          <button
            type="button"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center active:bg-white/25"
            onPointerDown={() => {
              inputState.up = true;
            }}
            onPointerUp={() => {
              inputState.up = false;
            }}
            onPointerLeave={() => {
              inputState.up = false;
            }}
          >
            <span className="text-white text-lg">▲</span>
          </button>
          <button
            type="button"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center active:bg-white/25"
            onPointerDown={() => {
              inputState.down = true;
            }}
            onPointerUp={() => {
              inputState.down = false;
            }}
            onPointerLeave={() => {
              inputState.down = false;
            }}
          >
            <span className="text-white text-lg">▼</span>
          </button>
          <button
            type="button"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center active:bg-white/25"
            onPointerDown={() => {
              inputState.left = true;
            }}
            onPointerUp={() => {
              inputState.left = false;
            }}
            onPointerLeave={() => {
              inputState.left = false;
            }}
          >
            <span className="text-white text-lg">◀</span>
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center active:bg-white/25"
            onPointerDown={() => {
              inputState.right = true;
            }}
            onPointerUp={() => {
              inputState.right = false;
            }}
            onPointerLeave={() => {
              inputState.right = false;
            }}
          >
            <span className="text-white text-lg">▶</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase hidden md:block">
          WASD / Arrow Keys to move
        </p>
      </div>
    </div>
  );
}
