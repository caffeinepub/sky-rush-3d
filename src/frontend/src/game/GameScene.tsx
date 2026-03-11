import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "./GameStore";
import { inputState } from "./inputState";

const OBSTACLE_COUNT = 22;
const GEM_COUNT = 16;
const SHIELD_PU_COUNT = 3;
const DOUBLE_PU_COUNT = 3;
const RING_COUNT = 12;
const RING_SPACING = 18;
const INITIAL_SPEED = 22;
const MAX_SPEED = 58;
const SPEED_INCREASE = 1.8;
const PLAYER_SPEED = 9;
const CORRIDOR_X = 5;
const CORRIDOR_Y = 3;
const SPAWN_Z = -95;
const DESPAWN_Z = 10;
const COLLISION_Z = 2.0;
const COLLISION_XY = 1.3;

const RING_SLOTS = Array.from(
  { length: RING_COUNT },
  (_, idx) => `ring-${idx}`,
);
const OBS_SLOTS = Array.from(
  { length: OBSTACLE_COUNT },
  (_, idx) => `obs-${idx}`,
);
const GEM_SLOTS = Array.from({ length: GEM_COUNT }, (_, idx) => `gem-${idx}`);
const SHIELD_SLOTS = Array.from(
  { length: SHIELD_PU_COUNT },
  (_, idx) => `spu-${idx}`,
);
const DOUBLE_SLOTS = Array.from(
  { length: DOUBLE_PU_COUNT },
  (_, idx) => `dpu-${idx}`,
);

interface ObstacleData {
  active: boolean;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotSpeedX: number;
  rotSpeedY: number;
}

interface GemData {
  active: boolean;
  x: number;
  y: number;
  z: number;
  rot: number;
  baseY: number;
}

interface PuData {
  active: boolean;
  x: number;
  y: number;
  z: number;
  rot: number;
}

function seededRng(seed: number): () => number {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function GameScene() {
  const elapsedTime = useRef(0);
  const gameSpeed = useRef(0);
  const spawnTimer = useRef(0);
  const distanceTimer = useRef(0);
  const invincible = useRef(false);
  const invincibleTimer = useRef(0);
  const gemStreak = useRef(0);
  const shakeAmount = useRef(0);
  const rng = useRef(seededRng(Date.now()));

  const targetPos = useRef({ x: 0, y: 0 });
  const shipRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  const obstacleRefs = useRef<(THREE.Group | null)[]>([]);
  const gemRefs = useRef<(THREE.Group | null)[]>([]);
  const shieldPuRefs = useRef<(THREE.Group | null)[]>([]);
  const doublePuRefs = useRef<(THREE.Group | null)[]>([]);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);

  const obstacles = useRef<ObstacleData[]>(
    Array.from({ length: OBSTACLE_COUNT }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: SPAWN_Z,
      scale: 1,
      rotSpeedX: 0,
      rotSpeedY: 0,
    })),
  );
  const gems = useRef<GemData[]>(
    Array.from({ length: GEM_COUNT }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: SPAWN_Z,
      rot: 0,
      baseY: 0,
    })),
  );
  const shieldPus = useRef<PuData[]>(
    Array.from({ length: SHIELD_PU_COUNT }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: SPAWN_Z,
      rot: 0,
    })),
  );
  const doublePus = useRef<PuData[]>(
    Array.from({ length: DOUBLE_PU_COUNT }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: SPAWN_Z,
      rot: 0,
    })),
  );

  const [flashes, setFlashes] = useState<
    { id: number; pos: THREE.Vector3; color: string }[]
  >([]);

  const addFlash = useCallback(
    (x: number, y: number, z: number, color: string) => {
      const id = performance.now() + Math.random();
      const pos = new THREE.Vector3(x, y, z);
      setFlashes((prev) => [...prev.slice(-5), { id, pos, color }]);
      setTimeout(
        () => setFlashes((prev) => prev.filter((f) => f.id !== id)),
        500,
      );
    },
    [],
  );

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) inputState.up = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) inputState.down = true;
      if (["ArrowLeft", "a", "A"].includes(e.key)) inputState.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) inputState.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) inputState.up = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) inputState.down = false;
      if (["ArrowLeft", "a", "A"].includes(e.key)) inputState.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) inputState.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Reset when game starts
  useEffect(() => {
    let prevGameState = useGameStore.getState().gameState;
    const unsub = useGameStore.subscribe((state) => {
      const gs = state.gameState;
      if (gs === "playing" && prevGameState !== "playing") {
        elapsedTime.current = 0;
        gameSpeed.current = INITIAL_SPEED;
        spawnTimer.current = 0;
        distanceTimer.current = 0;
        invincible.current = false;
        invincibleTimer.current = 0;
        gemStreak.current = 0;
        shakeAmount.current = 0;
        rng.current = seededRng(Date.now());
        targetPos.current = { x: 0, y: 0 };

        for (const o of obstacles.current) o.active = false;
        for (const g of gems.current) g.active = false;
        for (const p of shieldPus.current) p.active = false;
        for (const p of doublePus.current) p.active = false;

        for (const r of obstacleRefs.current) if (r) r.visible = false;
        for (const r of gemRefs.current) if (r) r.visible = false;
        for (const r of shieldPuRefs.current) if (r) r.visible = false;
        for (const r of doublePuRefs.current) if (r) r.visible = false;

        if (shipRef.current) {
          shipRef.current.position.set(0, 0, 0);
          shipRef.current.rotation.set(0, Math.PI, 0);
        }
        inputState.up = false;
        inputState.down = false;
        inputState.left = false;
        inputState.right = false;
      }
      prevGameState = gs;
    });
    return () => unsub();
  }, []);

  const spawnObstacle = useCallback(() => {
    const r = rng.current;
    const slot = obstacles.current.findIndex((o) => !o.active);
    if (slot === -1) return;
    const o = obstacles.current[slot];
    o.active = true;
    o.x = (r() * 2 - 1) * CORRIDOR_X * 0.85;
    o.y = (r() * 2 - 1) * CORRIDOR_Y * 0.85;
    o.z = SPAWN_Z;
    o.scale = 0.5 + r() * 0.9;
    o.rotSpeedX = (r() - 0.5) * 3;
    o.rotSpeedY = (r() - 0.5) * 3;
    const gr = obstacleRefs.current[slot];
    if (gr) {
      gr.position.set(o.x, o.y, o.z);
      gr.scale.setScalar(o.scale);
      gr.visible = true;
    }
  }, []);

  const spawnGem = useCallback(() => {
    const r = rng.current;
    const slot = gems.current.findIndex((g) => !g.active);
    if (slot === -1) return;
    const g = gems.current[slot];
    g.active = true;
    g.x = (r() * 2 - 1) * CORRIDOR_X * 0.7;
    g.baseY = (r() * 2 - 1) * CORRIDOR_Y * 0.7;
    g.y = g.baseY;
    g.z = SPAWN_Z;
    g.rot = 0;
    const gr = gemRefs.current[slot];
    if (gr) {
      gr.position.set(g.x, g.y, g.z);
      gr.visible = true;
    }
  }, []);

  const spawnShieldPu = useCallback(() => {
    const r = rng.current;
    const slot = shieldPus.current.findIndex((p) => !p.active);
    if (slot === -1) return;
    const p = shieldPus.current[slot];
    p.active = true;
    p.x = (r() * 2 - 1) * CORRIDOR_X * 0.6;
    p.y = (r() * 2 - 1) * CORRIDOR_Y * 0.6;
    p.z = SPAWN_Z;
    p.rot = 0;
    const gr = shieldPuRefs.current[slot];
    if (gr) {
      gr.position.set(p.x, p.y, p.z);
      gr.visible = true;
    }
  }, []);

  const spawnDoublePu = useCallback(() => {
    const r = rng.current;
    const slot = doublePus.current.findIndex((p) => !p.active);
    if (slot === -1) return;
    const p = doublePus.current[slot];
    p.active = true;
    p.x = (r() * 2 - 1) * CORRIDOR_X * 0.6;
    p.y = (r() * 2 - 1) * CORRIDOR_Y * 0.6;
    p.z = SPAWN_Z;
    p.rot = 0;
    const gr = doublePuRefs.current[slot];
    if (gr) {
      gr.position.set(p.x, p.y, p.z);
      gr.visible = true;
    }
  }, []);

  // Geometries (memoized)
  const asteroidGeo = useMemo(() => new THREE.IcosahedronGeometry(0.85, 0), []);
  const gemGeo = useMemo(() => new THREE.OctahedronGeometry(0.42, 0), []);
  const shieldGeo = useMemo(() => new THREE.SphereGeometry(0.52, 12, 8), []);
  const doubleGeo = useMemo(() => new THREE.DodecahedronGeometry(0.5, 0), []);
  const ringGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(13, 8.5, 0.05)),
    [],
  );

  useFrame((state, delta) => {
    const gs = useGameStore.getState();
    const dt = Math.min(delta, 0.05);
    const isPlaying = gs.gameState === "playing";

    // Idle animation for non-playing states
    if (!isPlaying) {
      if (shipRef.current) {
        shipRef.current.rotation.y += dt * 0.5;
      }
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = ringRefs.current[i];
        if (!ring) continue;
        ring.position.z += 6 * dt;
        if (ring.position.z > 15) ring.position.z -= RING_COUNT * RING_SPACING;
      }
      return;
    }

    elapsedTime.current += dt;
    gameSpeed.current = Math.min(
      INITIAL_SPEED + elapsedTime.current * SPEED_INCREASE,
      MAX_SPEED,
    );
    const speed = gameSpeed.current;

    if (inputState.up)
      targetPos.current.y = Math.min(
        targetPos.current.y + PLAYER_SPEED * dt,
        CORRIDOR_Y,
      );
    if (inputState.down)
      targetPos.current.y = Math.max(
        targetPos.current.y - PLAYER_SPEED * dt,
        -CORRIDOR_Y,
      );
    if (inputState.left)
      targetPos.current.x = Math.max(
        targetPos.current.x - PLAYER_SPEED * dt,
        -CORRIDOR_X,
      );
    if (inputState.right)
      targetPos.current.x = Math.min(
        targetPos.current.x + PLAYER_SPEED * dt,
        CORRIDOR_X,
      );

    if (shipRef.current) {
      const prevX = shipRef.current.position.x;
      shipRef.current.position.x = THREE.MathUtils.lerp(
        prevX,
        targetPos.current.x,
        0.13,
      );
      shipRef.current.position.y = THREE.MathUtils.lerp(
        shipRef.current.position.y,
        targetPos.current.y,
        0.13,
      );
      const bankDx = targetPos.current.x - shipRef.current.position.x;
      const bankDy = targetPos.current.y - shipRef.current.position.y;
      shipRef.current.rotation.z = THREE.MathUtils.lerp(
        shipRef.current.rotation.z,
        -bankDx * 0.9,
        0.1,
      );
      shipRef.current.rotation.x = THREE.MathUtils.lerp(
        shipRef.current.rotation.x,
        bankDy * 0.3,
        0.08,
      );
    }

    if (engineGlowRef.current) {
      engineGlowRef.current.intensity =
        2.5 + Math.sin(elapsedTime.current * 10) * 0.8;
    }

    if (shakeAmount.current > 0) {
      shakeAmount.current = Math.max(0, shakeAmount.current - dt * 4);
      state.camera.position.x += (Math.random() - 0.5) * shakeAmount.current;
      state.camera.position.y += (Math.random() - 0.5) * shakeAmount.current;
    }

    const shipX = shipRef.current?.position.x ?? 0;
    const shipY = shipRef.current?.position.y ?? 0;
    if (shakeAmount.current <= 0.05) {
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        shipX * 0.35,
        0.06,
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        1.5 + shipY * 0.25,
        0.06,
      );
    }
    state.camera.position.z = 13;
    state.camera.lookAt(shipX * 0.15, shipY * 0.1, -2);

    if (invincible.current) {
      invincibleTimer.current -= dt;
      if (invincibleTimer.current <= 0) invincible.current = false;
      if (shipRef.current) {
        shipRef.current.visible = Math.sin(invincibleTimer.current * 20) > 0;
      }
    } else if (shipRef.current && !shipRef.current.visible) {
      shipRef.current.visible = true;
    }

    useGameStore.getState().tickTimers(dt);

    const playerX = shipRef.current?.position.x ?? 0;
    const playerY = shipRef.current?.position.y ?? 0;

    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const o = obstacles.current[i];
      if (!o.active) continue;
      o.z += speed * dt;
      const gr = obstacleRefs.current[i];
      if (!gr) continue;
      gr.position.z = o.z;
      gr.rotation.x += o.rotSpeedX * dt;
      gr.rotation.y += o.rotSpeedY * dt;

      if (o.z > DESPAWN_Z) {
        o.active = false;
        gr.visible = false;
        continue;
      }

      if (!invincible.current && !gs.shieldActive) {
        const dx = playerX - o.x;
        const dy = playerY - o.y;
        const dz = Math.abs(o.z);
        if (
          dz < COLLISION_Z &&
          Math.sqrt(dx * dx + dy * dy) < COLLISION_XY * o.scale
        ) {
          o.active = false;
          gr.visible = false;
          useGameStore.getState().loseLife();
          invincible.current = true;
          invincibleTimer.current = 2.5;
          shakeAmount.current = 1.0;
          gemStreak.current = 0;
          useGameStore.getState().setMultiplier(1);
          addFlash(o.x, o.y, 0, "#ff4400");
        }
      }
    }

    for (let i = 0; i < GEM_COUNT; i++) {
      const g = gems.current[i];
      if (!g.active) continue;
      g.z += speed * dt;
      g.rot += dt * 2.8;
      const gr = gemRefs.current[i];
      if (!gr) continue;
      gr.position.z = g.z;
      gr.position.y = g.baseY + Math.sin(g.rot * 0.8) * 0.25;
      gr.rotation.y = g.rot;
      gr.rotation.x = g.rot * 0.5;

      if (g.z > DESPAWN_Z) {
        g.active = false;
        gr.visible = false;
        continue;
      }

      const dx = playerX - g.x;
      const dy = playerY - gr.position.y;
      if (Math.abs(g.z) < 2.2 && Math.sqrt(dx * dx + dy * dy) < 2.2) {
        g.active = false;
        gr.visible = false;
        gemStreak.current++;
        const newMult = Math.min(1 + Math.floor(gemStreak.current / 3), 4);
        useGameStore.getState().setMultiplier(newMult);
        useGameStore.getState().addScore(10);
        addFlash(g.x, gr.position.y, 0, "#00ffee");
      }
    }

    for (let i = 0; i < SHIELD_PU_COUNT; i++) {
      const p = shieldPus.current[i];
      if (!p.active) continue;
      p.z += speed * dt;
      p.rot += dt * 2;
      const gr = shieldPuRefs.current[i];
      if (!gr) continue;
      gr.position.z = p.z;
      gr.rotation.y = p.rot;
      gr.rotation.x = p.rot * 0.6;

      if (p.z > DESPAWN_Z) {
        p.active = false;
        gr.visible = false;
        continue;
      }

      const dx = playerX - p.x;
      const dy = playerY - p.y;
      if (Math.abs(p.z) < 2.5 && Math.sqrt(dx * dx + dy * dy) < 2.5) {
        p.active = false;
        gr.visible = false;
        useGameStore.getState().setShield(true, 3);
        addFlash(p.x, p.y, 0, "#4488ff");
      }
    }

    for (let i = 0; i < DOUBLE_PU_COUNT; i++) {
      const p = doublePus.current[i];
      if (!p.active) continue;
      p.z += speed * dt;
      p.rot += dt * 1.8;
      const gr = doublePuRefs.current[i];
      if (!gr) continue;
      gr.position.z = p.z;
      gr.rotation.y = p.rot;
      gr.rotation.x = p.rot * 0.4;

      if (p.z > DESPAWN_Z) {
        p.active = false;
        gr.visible = false;
        continue;
      }

      const dx = playerX - p.x;
      const dy = playerY - p.y;
      if (Math.abs(p.z) < 2.5 && Math.sqrt(dx * dx + dy * dy) < 2.5) {
        p.active = false;
        gr.visible = false;
        useGameStore.getState().setDoubleScore(true, 5);
        useGameStore.getState().setMultiplier(Math.min(gs.multiplier * 2, 8));
        addFlash(p.x, p.y, 0, "#ffdd00");
      }
    }

    spawnTimer.current += dt;
    const spawnInterval = Math.max(0.35, 1.7 - elapsedTime.current * 0.012);
    if (spawnTimer.current >= spawnInterval) {
      spawnTimer.current = 0;
      spawnObstacle();
      if (rng.current() > 0.55) spawnObstacle();
      if (rng.current() > 0.3) spawnGem();
      if (rng.current() > 0.5) spawnGem();
      if (rng.current() > 0.92) spawnShieldPu();
      if (rng.current() > 0.93) spawnDoublePu();
    }

    distanceTimer.current += dt;
    if (distanceTimer.current >= 4) {
      distanceTimer.current = 0;
      useGameStore.getState().addScore(25);
      useGameStore.getState().setDistance(gs.distance + 1);
    }

    for (let i = 0; i < RING_COUNT; i++) {
      const ring = ringRefs.current[i];
      if (!ring) continue;
      ring.position.z += speed * dt;
      if (ring.position.z > 15) ring.position.z -= RING_COUNT * RING_SPACING;
    }
  });

  return (
    <>
      <color attach="background" args={["#04000f"]} />
      <fog attach="fog" args={["#04000f", 40, 130]} />

      <ambientLight intensity={0.15} color="#4488ff" />
      <directionalLight position={[5, 10, 5]} intensity={0.4} color="#ffffff" />

      <Stars
        radius={160}
        depth={70}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1.2}
      />

      {RING_SLOTS.map((slotKey, i) => (
        <group
          key={slotKey}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          position={[0, 0, -i * RING_SPACING]}
        >
          <lineSegments geometry={ringGeo}>
            <lineBasicMaterial color="#00ddff" transparent opacity={0.07} />
          </lineSegments>
          <pointLight
            position={[-6.5, 4.5, 0]}
            color="#0066ff"
            intensity={0.25}
            distance={10}
          />
          <pointLight
            position={[6.5, 4.5, 0]}
            color="#0066ff"
            intensity={0.25}
            distance={10}
          />
          <pointLight
            position={[0, -4.5, 0]}
            color="#220044"
            intensity={0.2}
            distance={8}
          />
        </group>
      ))}

      {/* Player ship */}
      <group ref={shipRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.24, 2.5]} />
          <meshStandardMaterial
            color="#00bbee"
            emissive="#0033cc"
            emissiveIntensity={0.7}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[-1.15, -0.06, 0.3]} castShadow>
          <boxGeometry args={[1.5, 0.07, 0.95]} />
          <meshStandardMaterial
            color="#0088bb"
            emissive="#002299"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[1.15, -0.06, 0.3]} castShadow>
          <boxGeometry args={[1.5, 0.07, 0.95]} />
          <meshStandardMaterial
            color="#0088bb"
            emissive="#002299"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[-1.85, -0.04, 0.3]}>
          <boxGeometry args={[0.08, 0.09, 0.9]} />
          <meshStandardMaterial
            color="#00ffee"
            emissive="#00ffee"
            emissiveIntensity={3}
          />
        </mesh>
        <mesh position={[1.85, -0.04, 0.3]}>
          <boxGeometry args={[0.08, 0.09, 0.9]} />
          <meshStandardMaterial
            color="#00ffee"
            emissive="#00ffee"
            emissiveIntensity={3}
          />
        </mesh>
        <mesh position={[0, 0.17, -0.5]}>
          <sphereGeometry args={[0.21, 10, 7]} />
          <meshStandardMaterial
            color="#aaeeff"
            emissive="#003366"
            emissiveIntensity={1.2}
            transparent
            opacity={0.82}
          />
        </mesh>
        <mesh position={[0.38, 0, 1.25]}>
          <cylinderGeometry args={[0.09, 0.14, 0.32, 8]} />
          <meshStandardMaterial
            color="#001122"
            emissive="#0088ff"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[-0.38, 0, 1.25]}>
          <cylinderGeometry args={[0.09, 0.14, 0.32, 8]} />
          <meshStandardMaterial
            color="#001122"
            emissive="#0088ff"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0, 0, -1.45]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.09, 0.42, 6]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={3}
          />
        </mesh>
        <pointLight
          ref={engineGlowRef}
          position={[0, 0, 1.6]}
          color="#00aaff"
          intensity={3}
          distance={7}
        />
        <pointLight
          position={[0.38, 0, 1.6]}
          color="#0066ff"
          intensity={1.5}
          distance={4}
        />
        <pointLight
          position={[-0.38, 0, 1.6]}
          color="#0066ff"
          intensity={1.5}
          distance={4}
        />
      </group>

      {OBS_SLOTS.map((slotKey, i) => (
        <group
          key={slotKey}
          ref={(el) => {
            obstacleRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={asteroidGeo}>
            <meshStandardMaterial
              color="#cc4411"
              emissive="#881100"
              emissiveIntensity={0.45}
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>
          <pointLight color="#ff5500" intensity={0.6} distance={5} />
        </group>
      ))}

      {GEM_SLOTS.map((slotKey, i) => (
        <group
          key={slotKey}
          ref={(el) => {
            gemRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={gemGeo}>
            <meshStandardMaterial
              color="#00ffee"
              emissive="#00ffcc"
              emissiveIntensity={2.5}
              transparent
              opacity={0.95}
              metalness={0.1}
              roughness={0.05}
            />
          </mesh>
          <pointLight color="#00ffcc" intensity={2} distance={6} />
        </group>
      ))}

      {SHIELD_SLOTS.map((slotKey, i) => (
        <group
          key={slotKey}
          ref={(el) => {
            shieldPuRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={shieldGeo}>
            <meshStandardMaterial
              color="#4488ff"
              emissive="#2255dd"
              emissiveIntensity={2.5}
              transparent
              opacity={0.88}
            />
          </mesh>
          <pointLight color="#4488ff" intensity={2.5} distance={7} />
        </group>
      ))}

      {DOUBLE_SLOTS.map((slotKey, i) => (
        <group
          key={slotKey}
          ref={(el) => {
            doublePuRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={doubleGeo}>
            <meshStandardMaterial
              color="#ffdd00"
              emissive="#cc9900"
              emissiveIntensity={2.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight color="#ffdd00" intensity={2.5} distance={7} />
        </group>
      ))}

      {flashes.map((f) => (
        <pointLight
          key={f.id}
          position={f.pos}
          color={f.color}
          intensity={8}
          distance={12}
        />
      ))}
    </>
  );
}
