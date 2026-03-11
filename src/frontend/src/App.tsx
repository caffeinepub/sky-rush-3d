import { Toaster } from "@/components/ui/sonner";
import Game from "./game/Game";
import { useGameStore } from "./game/GameStore";
import GameOverScreen from "./screens/GameOverScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import StartScreen from "./screens/StartScreen";

export default function App() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      {/* Always-present 3D canvas (shows idle ship on non-playing screens) */}
      <Game />

      {/* Screen overlays */}
      {gameState === "start" && <StartScreen />}
      {gameState === "gameover" && <GameOverScreen />}
      {gameState === "leaderboard" && <LeaderboardScreen />}

      {/* Footer - only on start screen */}
      {gameState === "start" && (
        <div className="absolute bottom-3 left-0 right-0 text-center z-20 pointer-events-none">
          <p className="text-[10px] text-muted-foreground/40 font-body">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="hover:text-muted-foreground transition-colors pointer-events-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      )}

      <Toaster />
    </div>
  );
}
