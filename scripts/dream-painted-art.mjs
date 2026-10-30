// Hand-painted plates for the painted boat shot, generated with Bailian qwen-image.
// node scripts/dream-painted-art.mjs [plate|whale ...]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
const KEY = process.env.DASHSCOPE_API_KEY;
if (!KEY) throw new Error("缺少 DASHSCOPE_API_KEY。");
const OUT = join(ROOT, "public/dream/painted");
mkdirSync(OUT, { recursive: true });

const STYLE =
  "Hand-painted 2D animated feature film background art, traditional gouache and watercolor on paper, visible soft brush strokes, painterly texture, warm nostalgic storybook mood, rich layered color, gentle cel-shaded characters with simple clean outlines, 1980s-1990s Japanese hand-drawn animation aesthetic.";
const NEGATIVE =
  "photorealistic, 3D render, CGI, plastic, glossy, text, letters, watermark, logo, signature, frame border, collage, horror, extra limbs, deformed hands";

const PLATES = {
  plate: `${STYLE} Wide 16:9 night scene on a calm sea that reflects the stars like a mirror. A small boat made from one big curled green leaf floats center-right on the water. In the boat sits a 7-year-old East Asian girl with a short dark bob haircut and fringe, ivory long pajamas and a knitted shawl, smiling softly; next to her a tiny woodland fairy in a moss-green coat and curled hat with translucent moth wings. At the front tip of the leaf boat sits a small round friendly glowing sun creature, warm orange light spilling onto the leaf and the water. Far behind, a pale stone castle with slate spires on a misty island, tiny golden windows. Huge soft moonlit cumulus clouds, deep indigo and teal sky full of stars, horizon about 45 percent from the top. Lower 15 percent of the frame is quiet calm water. Gentle ripples around the boat. No text.`,
  whale: `${STYLE} A single gentle whale made of soft glowing pale-blue and gold starlight, swimming gracefully through the air, seen from the side, facing left, faint sparkling trail behind its tail. Isolated on a pure solid black background, nothing else in the frame, whole whale visible with wide black margins. No text.`,
};

const curl = (url, body) =>
  new Promise((done, fail) => {
    const config = [
      `url = ${JSON.stringify(url)}`,
      "silent",
      "show-error",
      "connect-timeout = 20",
      "max-time = 180",
      `header = ${JSON.stringify(`Authorization: Bearer ${KEY}`)}`,
    ];
    if (body) {
      config.push(`header = "Content-Type: application/json"`);
      config.push(`data = ${JSON.stringify(JSON.stringify(body))}`);
    }
    const child = spawn("curl", ["--config", "-"], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks = [];
    const errs = [];
    child.stdout.on("data", (c) => chunks.push(c));
    child.stderr.on("data", (c) => errs.push(c));
    child.on("close", (code) =>
      code === 0
        ? done(Buffer.concat(chunks))
        : fail(new Error(Buffer.concat(errs).toString() || `curl ${code}`)),
    );
    child.stdin.end(config.join("\n"));
  });

const generate = async (name) => {
  const res = JSON.parse(
    (
      await curl(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          model: "qwen-image",
          input: {
            messages: [{ role: "user", content: [{ text: PLATES[name] }] }],
          },
          parameters: {
            size: "1664*928",
            negative_prompt: NEGATIVE,
            prompt_extend: false,
            watermark: false,
          },
        },
      )
    ).toString(),
  );
  const url = res.output?.choices?.[0]?.message?.content?.find(
    (c) => c.image,
  )?.image;
  if (!url) throw new Error(`${name}: ${JSON.stringify(res).slice(0, 400)}`);
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, await curl(url));
  console.log(`${name} → ${file}`);
};

const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(PLATES);
for (const n of names) await generate(n);
// Keep prompts next to the assets so the frames can be regenerated or edited.
writeFileSync(
  join(OUT, "prompts.json"),
  JSON.stringify({ model: "qwen-image", STYLE, NEGATIVE, PLATES }, null, 2),
);
