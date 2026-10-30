import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

const ShapeRow: React.FC = () => (
	<div style={{ display: "flex", gap: 28, alignItems: "center", justifyContent: "center" }}>
		<svg width={64} height={64}><circle cx={32} cy={32} r={26} fill={GEO_COLORS.circle} /></svg>
		<svg width={64} height={64}><rect x={6} y={6} width={52} height={52} rx={4} fill={GEO_COLORS.square} /></svg>
		<svg width={64} height={64}><polygon points="32,6 58,52 6,52" fill={GEO_COLORS.triangle} /></svg>
		<svg width={76} height={50}><rect x={4} y={4} width={68} height={42} rx={4} fill={GEO_COLORS.rectangle} /></svg>
	</div>
);

export const S5Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={48}>你都记住了吗？</Hero>

			<div style={{ opacity: enter }}>
				<ShapeRow />
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 30, color: COLORS.text, textAlign: "center" }}>
						环顾四周，找找看它们藏在哪里吧！
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
