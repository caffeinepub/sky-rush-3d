import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import GameScene from "./GameScene";
import { useGameStore } from "./GameStore";
import HUD from "./HUD";

export default function Game() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 2, 13], fov: 70, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      {gameState === "playing" && <HUD />}
    </div>
  );
}
