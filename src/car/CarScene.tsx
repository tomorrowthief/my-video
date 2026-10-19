import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  PerspectiveCamera,
  Shape,
  Vector3,
} from "three";

export type CarPhase =
  | "intro"
  | "battery"
  | "inverter"
  | "drive"
  | "regen"
  | "recap";
export const DRIVE_COLOR = "#49e3c2";
export const REGEN_COLOR = "#ffbd6a";
const W = 1240;
const H = 700;
type Point = [number, number, number];

const cameraAt = (seconds: number): Point => {
  const angle = 0.79 + Math.sin(seconds * 0.055) * 0.11;
  return [Math.cos(angle) * 8.6, 5.1, Math.sin(angle) * 8.6];
};

const Camera = ({ seconds }: { seconds: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cameraAt(seconds));
    camera.lookAt(0, 0.65, 0);
    camera.updateProjectionMatrix();
  }, [camera, seconds]);
  return null;
};

const bodyGeometry = () => {
  const s = new Shape();
  s.moveTo(-2.62, 0.63);
  s.lineTo(-2.65, 0.88);
  s.quadraticCurveTo(-2.55, 1.08, -1.65, 1.13);
  s.lineTo(-0.95, 1.69);
  s.quadraticCurveTo(-0.8, 1.8, -0.55, 1.8);
  s.lineTo(0.5, 1.8);
  s.quadraticCurveTo(0.75, 1.79, 0.9, 1.6);
  s.lineTo(1.36, 1.16);
  s.lineTo(2.35, 1.08);
  s.quadraticCurveTo(2.7, 1.04, 2.7, 0.77);
  s.lineTo(2.6, 0.63);
  s.closePath();
  const geo = new ExtrudeGeometry(s, {
    depth: 1.54,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 16,
  });
  geo.translate(0, 0, -0.77);
  return geo;
};

const glassGeometry = () => {
  const s = new Shape();
  s.moveTo(-1.43, 1.17);
  s.lineTo(-0.86, 1.67);
  s.lineTo(0.55, 1.67);
  s.lineTo(1.06, 1.17);
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth: 1.8, bevelEnabled: false });
  geo.translate(0, 0, -0.9);
  return geo;
};

const Box = ({
  position,
  size,
  color,
  emissive = "#000000",
  intensity = 0,
  opacity = 1,
}: {
  position: Point;
  size: Point;
  color: string;
  emissive?: string;
  intensity?: number;
  opacity?: number;
}) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial
      color={color}
      metalness={0.45}
      roughness={0.36}
      emissive={emissive}
      emissiveIntensity={intensity}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
    />
  </mesh>
);

const Wheel = ({
  x,
  z,
  angle,
  regen,
}: {
  x: number;
  z: number;
  angle: number;
  regen: boolean;
}) => (
  <group position={[x, 0.43, z]} rotation={[0, 0, angle]}>
    <mesh>
      <torusGeometry args={[0.315, 0.115, 12, 40]} />
      <meshStandardMaterial color="#151c25" roughness={0.85} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.255, 0.255, 0.16, 40]} />
      <meshStandardMaterial color="#a6b8c9" metalness={0.8} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0, z > 0 ? 0.09 : -0.09]}>
      <torusGeometry args={[0.23, 0.016, 8, 36]} />
      <meshBasicMaterial color={regen && x > 0 ? REGEN_COLOR : "#d0e1ed"} />
    </mesh>
    {Array.from({ length: 5 }, (_, i) => (
      <group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
        <Box
          position={[0, 0.105, z > 0 ? 0.1 : -0.1]}
          size={[0.032, 0.19, 0.035]}
          color="#28394b"
        />
      </group>
    ))}
    <mesh position={[0, 0, z > 0 ? 0.12 : -0.12]}>
      <sphereGeometry args={[0.065, 12, 12]} />
      <meshStandardMaterial color="#d6e7f2" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

const Battery = ({
  active,
  color,
  seconds,
}: {
  active: boolean;
  color: string;
  seconds: number;
}) => (
  <group position={[-0.45, 0.26, 0]}>
    <Box position={[0, -0.035, 0]} size={[2.9, 0.22, 1.5]} color="#354d60" />
    {Array.from({ length: 18 }, (_, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      return (
        <Box
          key={i}
          position={[-1.15 + col * 0.46, 0.11, -0.48 + row * 0.48]}
          size={[0.4, 0.16, 0.39]}
          color={active ? "#2e9d8e" : "#476c77"}
          emissive={color}
          intensity={active ? 0.3 + 0.2 * Math.sin(seconds * 2 - col) : 0.05}
        />
      );
    })}
    <Box
      position={[0, 0.2, -0.72]}
      size={[2.82, 0.025, 0.025]}
      color={color}
      emissive={color}
      intensity={0.7}
    />
    <Box
      position={[0, 0.2, 0.72]}
      size={[2.82, 0.025, 0.025]}
      color={color}
      emissive={color}
      intensity={0.7}
    />
  </group>
);

const Inverter = ({ active, color }: { active: boolean; color: string }) => (
  <group position={[0.93, 0.78, 0]}>
    <Box
      position={[0, 0, 0]}
      size={[0.66, 0.31, 0.78]}
      color={active ? "#658da8" : "#465d72"}
      emissive={color}
      intensity={active ? 0.3 : 0.02}
    />
    {Array.from({ length: 8 }, (_, i) => (
      <Box
        key={i}
        position={[-0.27 + i * 0.078, 0.2, 0]}
        size={[0.025, 0.12, 0.65]}
        color="#9ab1c2"
      />
    ))}
    <Box
      position={[0, -0.02, 0.4]}
      size={[0.38, 0.035, 0.025]}
      color={color}
      emissive={color}
      intensity={1.4}
    />
  </group>
);

const Motor = ({
  seconds,
  active,
  color,
}: {
  seconds: number;
  active: boolean;
  color: string;
}) => (
  <group position={[1.67, 0.49, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.34, 0.34, 0.8, 40]} />
      <meshStandardMaterial
        color="#507a99"
        transparent
        opacity={0.22}
        depthWrite={false}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
    {[0, Math.PI].map((offset) => (
      <group key={offset} rotation={[0, 0, -seconds * 2.5 + offset]}>
        <Box
          position={[0.13, 0, 0]}
          size={[0.18, 0.16, 0.6]}
          color={offset === 0 ? "#e58a7d" : "#719cef"}
        />
      </group>
    ))}
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.045, 0.045, 0.63, 8]} />
          <meshStandardMaterial
            color="#c9905c"
            metalness={0.7}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={active ? 0.35 : 0}
          />
        </mesh>
      );
    })}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 1.94, 12]} />
      <meshStandardMaterial color="#b8cbd8" metalness={0.85} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.49]} rotation={[0, 0, -seconds * 2.5]}>
      <torusGeometry args={[0.21, 0.055, 8, 16]} />
      <meshStandardMaterial color="#b7cada" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

const Flow = ({
  points,
  color,
  seconds,
  reverse,
  active,
}: {
  points: Point[];
  color: string;
  seconds: number;
  reverse: boolean;
  active: boolean;
}) => {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.022, 6, false]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.6 : 0.13}
        />
      </mesh>
      {active &&
        Array.from({ length: 9 }, (_, i) => {
          const t = (seconds * 0.34 + i / 9) % 1;
          const p = curve.getPointAt(reverse ? 1 - t : t);
          return (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.046, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
    </group>
  );
};

const ELECTRIC_PATH: Point[] = [
  [-0.5, 0.5, 0.12],
  [0.1, 0.5, 0.45],
  [0.55, 0.63, 0.45],
  [0.93, 0.78, 0.42],
];
const MOTOR_PATH: Point[] = [
  [0.93, 0.78, 0.42],
  [1.22, 0.8, 0.48],
  [1.52, 0.62, 0.45],
  [1.67, 0.5, 0.42],
];
const LEFT_AXLE: Point[] = [
  [1.67, 0.5, 0.1],
  [1.67, 0.5, 0.65],
  [1.67, 0.44, 0.99],
];
const RIGHT_AXLE: Point[] = [
  [1.67, 0.5, -0.1],
  [1.67, 0.5, -0.65],
  [1.67, 0.44, -0.99],
];

const CarModel = ({
  frame,
  phase,
  explode,
}: {
  frame: number;
  phase: CarPhase;
  explode: number;
}) => {
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const regen = phase === "regen";
  const color = regen ? REGEN_COLOR : DRIVE_COLOR;
  const body = useMemo(bodyGeometry, []);
  const glass = useMemo(glassGeometry, []);
  const moving = phase === "drive" || regen || phase === "recap";
  const wheelAngle = moving ? -seconds * (regen ? 0.8 : 2.4) : 0;
  return (
    <>
      <Camera seconds={seconds} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 8, 5]} intensity={3.5} color="#d0e4ff" />
      <directionalLight
        position={[-6, 3, -4]}
        intensity={2.2}
        color="#59c9c2"
      />
      <pointLight position={[1, 3, -3]} intensity={12} color="#5f8cfa" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[4.25, 80]} />
        <meshStandardMaterial
          color="#172638"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>
      <gridHelper
        args={[9, 18, "#2c4659", "#203446"]}
        position={[0, -0.025, 0]}
      />
      {moving &&
        Array.from({ length: 9 }, (_, i) => (
          <Box
            key={i}
            position={[
              3.8 - ((seconds * (regen ? 0.55 : 1.4) + i) % 8),
              -0.005,
              1.85,
            ]}
            size={[0.43, 0.008, 0.035]}
            color={color}
            opacity={0.4}
          />
        ))}
      <Box position={[0, 0.2, 0]} size={[4.7, 0.12, 1.65]} color="#283d51" />
      <Box
        position={[0, 0.35, -0.78]}
        size={[4.4, 0.1, 0.07]}
        color="#6c879d"
      />
      <Box position={[0, 0.35, 0.78]} size={[4.4, 0.1, 0.07]} color="#6c879d" />
      <Battery
        active={phase === "battery" || regen || phase === "recap"}
        color={color}
        seconds={seconds}
      />
      <Inverter active={phase === "inverter" || regen} color={color} />
      <Motor
        seconds={moving ? seconds : seconds * 0.2}
        active={phase === "drive" || regen}
        color={color}
      />
      {[-1.69, 1.67].flatMap((x) =>
        [-0.98, 0.98].map((z) => (
          <Wheel
            key={`${x}-${z}`}
            x={x}
            z={z}
            angle={wheelAngle}
            regen={regen}
          />
        )),
      )}
      <group position={[0, explode * 1.5, 0]}>
        <mesh geometry={body}>
          <meshStandardMaterial
            color="#c8e0ed"
            metalness={0.65}
            roughness={0.26}
            transparent
            opacity={1 - explode * 0.83}
            depthWrite={explode < 0.2}
          />
        </mesh>
        <mesh geometry={glass} renderOrder={2}>
          <meshStandardMaterial
            color="#133d55"
            metalness={0.45}
            roughness={0.12}
            transparent
            opacity={0.85 - explode * 0.71}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[1.11, 1.45, 0]}
          rotation={[0, 0, 0.85]}
          renderOrder={2}
        >
          <boxGeometry args={[0.055, 0.79, 1.48]} />
          <meshStandardMaterial
            color="#143b52"
            metalness={0.35}
            roughness={0.25}
            transparent
            opacity={0.96 - explode * 0.8}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[-1.28, 1.43, 0]}
          rotation={[0, 0, -0.9]}
          renderOrder={2}
        >
          <boxGeometry args={[0.045, 0.68, 1.46]} />
          <meshStandardMaterial
            color="#143b52"
            metalness={0.35}
            roughness={0.25}
            transparent
            opacity={0.96 - explode * 0.8}
            depthWrite={false}
          />
        </mesh>
        <Box
          position={[2.61, 0.91, 0]}
          size={[0.035, 0.045, 1.36]}
          color="#d3f7ff"
          emissive="#a9eaff"
          intensity={1.2}
          opacity={1 - explode * 0.5}
        />
        <Box
          position={[-2.61, 0.88, 0]}
          size={[0.035, 0.04, 1.36]}
          color="#e5837a"
          emissive="#e5837a"
          intensity={0.7}
          opacity={1 - explode * 0.5}
        />
        {[-0.91, 0.91].map((z) => (
          <Box
            key={z}
            position={[-0.1, 1.42, z]}
            size={[0.05, 0.61, 0.035]}
            color="#638798"
            opacity={1 - explode * 0.7}
          />
        ))}
      </group>
      <Flow
        points={ELECTRIC_PATH}
        color={color}
        seconds={seconds}
        reverse={regen}
        active={phase !== "intro"}
      />
      <Flow
        points={MOTOR_PATH}
        color={color}
        seconds={seconds}
        reverse={regen}
        active={["inverter", "drive", "regen", "recap"].includes(phase)}
      />
      <Flow
        points={LEFT_AXLE}
        color={color}
        seconds={seconds}
        reverse={regen}
        active={moving}
      />
      <Flow
        points={RIGHT_AXLE}
        color={color}
        seconds={seconds}
        reverse={regen}
        active={moving}
      />
    </>
  );
};

const LABELS: {
  title: string;
  position: Point;
  phase: CarPhase;
  offset: [number, number];
}[] = [
  {
    title: "动力电池",
    position: [-1.0, 0.45, 0.55],
    phase: "battery",
    offset: [-150, 85],
  },
  {
    title: "逆变器",
    position: [0.93, 0.98, 0],
    phase: "inverter",
    offset: [-115, -65],
  },
  {
    title: "电机 · 减速传动",
    position: [1.67, 0.7, 0.25],
    phase: "drive",
    offset: [100, -85],
  },
  {
    title: "前驱车轮",
    position: [1.67, 0.44, 0.99],
    phase: "drive",
    offset: [100, 90],
  },
];

export const CarScene = ({
  frame,
  phase,
  explode,
}: {
  frame: number;
  phase: CarPhase;
  explode: number;
}) => {
  const { fps } = useVideoConfig();
  const color = phase === "regen" ? REGEN_COLOR : DRIVE_COLOR;
  const camera = new PerspectiveCamera(35, W / H, 0.1, 100);
  camera.position.set(...cameraAt(frame / fps));
  camera.lookAt(0, 0.65, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const labelsOpacity = interpolate(explode, [0.2, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ left: 610, top: 126, width: W, height: H }}>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{
          fov: 35,
          position: cameraAt(frame / fps),
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={1}
      >
        <CarModel frame={frame} phase={phase} explode={explode} />
      </ThreeCanvas>
      <svg
        width={W}
        height={H}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: labelsOpacity,
        }}
      >
        {LABELS.map((label) => {
          const p = new Vector3(...label.position).project(camera);
          const x = ((p.x + 1) * W) / 2;
          const y = ((1 - p.y) * H) / 2;
          const lx = x + label.offset[0];
          const ly = y + label.offset[1];
          const active =
            phase === label.phase || phase === "regen" || phase === "recap";
          return (
            <g key={label.title} opacity={active ? 1 : 0.5}>
              <polyline
                points={`${x},${y} ${lx},${ly} ${lx + (label.offset[0] > 0 ? 36 : -36)},${ly}`}
                fill="none"
                stroke={active ? color : "#607b90"}
                strokeWidth={1.5}
              />
              <circle cx={x} cy={y} r={4} fill={active ? color : "#8ba4b8"} />
              <text
                x={lx}
                y={ly - 12}
                fill={active ? "#e5f8fa" : "#90a9bc"}
                fontSize={23}
                fontFamily="PingFang SC, sans-serif"
                textAnchor={label.offset[0] > 0 ? "start" : "end"}
              >
                {label.title}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
