// Turns raw portfolio files into web-ready media + a manifest the site reads.
//
//   npm run media                       (reads ../althea-media-raw)
//   npm run media -- "D:/some/raw/dir"  (custom input folder)
//
// Input:  <raw>/<category>/<files>   e.g. raw/organic/clip.mov, raw/email/news.png
//         Category folder names must match portfolio ids in src/data/site.ts.
// Output: public/portfolio/<category>/<n>.mp4|.webp (+ <n>-poster.webp for videos)
//         src/data/media.json  — { category: [{ type, src, poster?, width, height }] }
//
// Videos → H.264 MP4, max 1280px on the long side, CRF 28, faststart (plays while loading).
// Images → WebP, max 1600px wide. Already-processed files are skipped, so re-runs are fast.
// Needs ffmpeg/ffprobe on PATH (or set FFMPEG / FFPROBE env vars).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const RAW = resolve(process.argv[2] ?? "../althea-media-raw");
const OUT = resolve("public/portfolio");
const MANIFEST = resolve("src/data/media.json");
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE ?? "ffprobe";

const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const run = (bin, args) => execFileSync(bin, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();

function size(file) {
  const [w, h] = run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file])
    .trim()
    .split("x")
    .map(Number);
  return { width: w, height: h };
}

const manifest = {};

for (const category of readdirSync(RAW).filter((d) => statSync(join(RAW, d)).isDirectory()).sort()) {
  const files = readdirSync(join(RAW, category))
    .filter((f) => VIDEO.has(extname(f).toLowerCase()) || IMAGE.has(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  mkdirSync(join(OUT, category), { recursive: true });
  manifest[category] = [];

  files.forEach((file, i) => {
    const input = join(RAW, category, file);
    const n = String(i + 1).padStart(2, "0");
    const isVideo = VIDEO.has(extname(file).toLowerCase());

    if (isVideo) {
      const out = join(OUT, category, `${n}.mp4`);
      const poster = join(OUT, category, `${n}-poster.webp`);
      if (!existsSync(out)) {
        console.log(`video  ${category}/${file} → ${n}.mp4`);
        run(FFMPEG, [
          "-y", "-i", input,
          // Fit inside 1280×1280 keeping aspect ratio; even dimensions for H.264.
          "-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
          "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
          out,
        ]);
      }
      if (!existsSync(poster)) {
        run(FFMPEG, ["-y", "-ss", "1", "-i", out, "-frames:v", "1", "-c:v", "libwebp", "-quality", "75", poster]);
      }
      manifest[category].push({ type: "video", src: `/portfolio/${category}/${n}.mp4`, poster: `/portfolio/${category}/${n}-poster.webp`, ...size(out) });
    } else {
      const out = join(OUT, category, `${n}.webp`);
      if (!existsSync(out)) {
        console.log(`image  ${category}/${file} → ${n}.webp`);
        run(FFMPEG, ["-y", "-i", input, "-vf", "scale='min(1600,iw)':-2", "-c:v", "libwebp", "-quality", "80", out]);
      }
      manifest[category].push({ type: "image", src: `/portfolio/${category}/${n}.webp`, ...size(out) });
    }
  });
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nWrote ${MANIFEST}`);
for (const [k, v] of Object.entries(manifest)) console.log(`  ${k}: ${v.length} items`);
