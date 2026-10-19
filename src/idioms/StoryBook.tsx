import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./StoryArt";

export const StoryBook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opening = interpolate(frame, [fps * 0.5, fps * 3.8], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  return (
    <ThreeCanvas
      width={1050}
      height={690}
      camera={{ position: [0, 5.8, 7.1], fov: 36 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", left: 785, top: 190 }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[-3, 7, 4]} intensity={2.8} color="#fff0d3" />
      <directionalLight position={[4, 3, -3]} intensity={1.2} />
      <group position={[0.8, -0.15, 0]} rotation={[-0.13, -0.24, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[3.4, 0.14, 4.3]} />
          <meshStandardMaterial color="#7c986a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[3.2, 0.24, 4.08]} />
          <meshStandardMaterial color="#fff1d4" roughness={1} />
        </mesh>
        {[-0.075, -0.025, 0.025, 0.075].map((h) => (
          <mesh key={h} position={[0, h, 2.045]}>
            <boxGeometry args={[3.16, 0.008, 0.006]} />
            <meshStandardMaterial color="#d7c49d" />
          </mesh>
        ))}
        <group
          position={[-1.66, 0.16, 0]}
          rotation={[0, 0, opening * Math.PI * 0.94]}
        >
          <mesh position={[1.66, 0, 0]}>
            <boxGeometry args={[3.4, 0.09, 4.3]} />
            <meshStandardMaterial color="#88a477" roughness={0.95} />
          </mesh>
          <mesh position={[1.66, 0.055, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.79, 48]} />
            <meshStandardMaterial color="#eedbab" roughness={1} />
          </mesh>
        </group>
        <group position={[0.25, 0.16, 0]} scale={Math.max(0.001, opening)}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.67, 0.79, 0.08, 48]} />
            <meshStandardMaterial color="#c3ab7c" roughness={1} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.033, 0.05, 1.05, 16]} />
            <meshStandardMaterial color="#769e56" roughness={1} />
          </mesh>
          <mesh
            position={[-0.27, 0.72, 0]}
            rotation={[0, 0, -0.62]}
            scale={[0.5, 0.23, 0.2]}
          >
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#9ab56c" roughness={1} />
          </mesh>
          <mesh
            position={[0.29, 1.0, 0]}
            rotation={[0, 0, 0.55]}
            scale={[0.52, 0.24, 0.19]}
          >
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#86a75f" roughness={1} />
          </mesh>
        </group>
      </group>
    </ThreeCanvas>
  );
};
