import { create } from "zustand";

export type GameScreenState = "start" | "playing" | "gameover" | "leaderboard";

interface GameStore {
  gameState: GameScreenState;
  score: number;
  lives: number;
  multiplier: number;
  highScore: number;
  isDailyChallenge: boolean;
  distance: number;
  shieldActive: boolean;
  doubleScoreActive: boolean;
  shieldTimer: number;
  doubleTimer: number;

  setGameState: (s: GameScreenState) => void;
  startGame: (daily?: boolean) => void;
  endGame: () => void;
  addScore: (pts: number) => void;
  loseLife: () => void;
  resetGame: () => void;
  setShield: (active: boolean, duration?: number) => void;
  setDoubleScore: (active: boolean, duration?: number) => void;
  setMultiplier: (m: number) => void;
  setDistance: (d: number) => void;
  tickTimers: (dt: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: "start",
  score: 0,
  lives: 3,
  multiplier: 1,
  highScore: 0,
  isDailyChallenge: false,
  distance: 0,
  shieldActive: false,
  doubleScoreActive: false,
  shieldTimer: 0,
  doubleTimer: 0,

  setGameState: (s) => set({ gameState: s }),

  startGame: (daily = false) =>
    set({
      gameState: "playing",
      score: 0,
      lives: 3,
      multiplier: 1,
      isDailyChallenge: daily,
      distance: 0,
      shieldActive: false,
      doubleScoreActive: false,
      shieldTimer: 0,
      doubleTimer: 0,
    }),

  endGame: () =>
    set((state) => ({
      gameState: "gameover",
      highScore: Math.max(state.highScore, state.score),
    })),

  addScore: (pts) =>
    set((state) => {
      const multiplied =
        pts * state.multiplier * (state.doubleScoreActive ? 2 : 1);
      return { score: state.score + multiplied };
    }),

  loseLife: () => {
    const { lives, endGame, shieldActive } = get();
    if (shieldActive) return;
    if (lives <= 1) {
      endGame();
    } else {
      set({ lives: lives - 1, multiplier: 1 });
    }
  },

  resetGame: () =>
    set({
      gameState: "start",
      score: 0,
      lives: 3,
      multiplier: 1,
      distance: 0,
      shieldActive: false,
      doubleScoreActive: false,
    }),

  setShield: (active, duration = 3) =>
    set({ shieldActive: active, shieldTimer: active ? duration : 0 }),

  setDoubleScore: (active, duration = 5) =>
    set({ doubleScoreActive: active, doubleTimer: active ? duration : 0 }),

  setMultiplier: (m) => set({ multiplier: m }),
  setDistance: (d) => set({ distance: d }),

  tickTimers: (dt) =>
    set((state) => {
      const newShieldTimer = Math.max(0, state.shieldTimer - dt);
      const newDoubleTimer = Math.max(0, state.doubleTimer - dt);
      return {
        shieldTimer: newShieldTimer,
        doubleTimer: newDoubleTimer,
        shieldActive: newShieldTimer > 0,
        doubleScoreActive: newDoubleTimer > 0,
      };
    }),
}));
