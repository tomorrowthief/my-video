import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { CodeWindow, type CodeLine } from "../components/Code";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const SCHEMA: readonly CodeLine[] = [
	{
		n: 8,
		text: "// next_id is TEXT because node:sqlite rejects INTEGER results outside JavaScript's safe integer range.",
	},
	{ n: 9, text: "const INITIAL_SCHEMA: readonly string[] = [" },
	{ n: 10, text: "  `CREATE TABLE durable_metadata (" },
	{ n: 11, text: "    singleton INTEGER PRIMARY KEY CHECK (singleton = 1)," },
	{ n: 12, text: "    next_id TEXT NOT NULL," },
	{ n: 13, text: "    next_seq INTEGER NOT NULL" },
	{ n: 14, text: "  ) STRICT`," },
	"⋯",
	{ n: 16, text: "  `CREATE TABLE record_ids (" },
	{ n: 17, text: "    id INTEGER PRIMARY KEY," },
	{
		n: 18,
		text: "    record_type TEXT NOT NULL CHECK (record_type IN ('conversation', 'entry', 'task', 'submission', 'document'))",
	},
	{ n: 19, text: "  ) STRICT`," },
];

const BACKENDS = [
	{ name: "Memory", detail: "测试与短生命周期" },
	{ name: "JSONL", detail: "追加提交标记 + sidecar" },
	{ name: "SQLite", detail: "node 与 Durable Object" },
];

export const S8Storage: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	const focus =
		active === 2 ? [8, 12] : active === 3 ? [18] : active === 4 ? [14, 19] : active === 5 ? [] : [];

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<div style={{ display: "flex", gap: 16 }}>
				{BACKENDS.map((backend) => (
					<Panel
						key={backend.name}
						active={active === 0}
						accent={COLORS.ok}
						pad="18px 26px"
						style={{ flex: 1 }}
					>
						<Mono size={26} color={COLORS.ok}>
							{backend.name}
						</Mono>
						<div style={{ fontFamily: FONT, fontSize: 22, color: COLORS.dim, marginTop: 10 }}>
							{backend.detail}
						</div>
					</Panel>
				))}
			</div>

			<div style={{ display: "flex", gap: 32, alignItems: "stretch" }}>
				<div style={{ flex: 1, minWidth: 0 }}>
					<CodeWindow
						file="src/storage/sqlite/migrations.ts"
						lines={SCHEMA}
						focus={focus}
						fontSize={19}
						badge="INITIAL_SCHEMA"
						stagger={2}
						enterAt={scene.paragraphs[1].startFrame}
					/>
				</div>
				<div style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
					{active >= 2 ? (
						<Reveal at={scene.paragraphs[2].startFrame}>
							<Panel active accent={COLORS.warn} pad="20px 24px">
								<Label color={COLORS.warn} style={{ marginBottom: 12 }}>
									非常具体的坑
								</Label>
								<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.text, lineHeight: 1.5 }}>
									node:sqlite 拒绝超出 JS 安全整数范围的 INTEGER
									<br />
									→ <span style={{ fontFamily: MONO, color: COLORS.warn }}>next_id</span> 只能存 TEXT
								</div>
							</Panel>
						</Reveal>
					) : null}
					{active >= 3 ? (
						<Reveal at={scene.paragraphs[3].startFrame}>
							<Panel active accent={COLORS.accent} pad="20px 24px">
								<Label color={COLORS.accent} style={{ marginBottom: 12 }}>
									record_ids
								</Label>
								<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.text, lineHeight: 1.5 }}>
									五种记录共用
									<span style={{ color: COLORS.accent }}>一个 id 空间</span>
									<br />
									→ ID 永不复用（spec 第 5 条）
								</div>
							</Panel>
						</Reveal>
					) : null}
					{active >= 4 ? (
						<Reveal at={scene.paragraphs[4].startFrame}>
							<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
								<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
									STRICT 表
								</Chip>
								<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
									CHECK (json_valid(record))
								</Chip>
								<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
									写入 = 一次数据库事务
								</Chip>
							</div>
						</Reveal>
					) : null}
					{active >= 5 ? (
						<Reveal at={scene.paragraphs[5].startFrame}>
							<Panel active accent={COLORS.danger} pad="20px 24px">
								<Mono size={23} color={COLORS.danger}>
									admitRead()
								</Mono>
								<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.text, marginTop: 10, lineHeight: 1.5 }}>
									close 等待进行中的多查询读
									<br />
									<span style={{ color: COLORS.dim }}>否则读事务会读到撕裂状态</span>
								</div>
							</Panel>
						</Reveal>
					) : null}
				</div>
			</div>
		</div>
	);
};