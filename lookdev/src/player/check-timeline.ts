// Asserts the timeline model's behavior on a real story without rendering.
// Run: npx esbuild src/player/check-timeline.ts --bundle --platform=node --outfile=out/check-timeline.cjs --log-level=warning && node out/check-timeline.cjs [storyId]
import { readFileSync } from "node:fs";
import { parseStory } from "./story";
import { actorAt, beatAt, blinkAt, cameraAt, captionAt, shotAt } from "./timeline";

const storyId = process.argv[2] ?? "mahabharat-ganga-shantanu-en";
const dir = `public/stories/${storyId}`;
const story = parseStory(JSON.parse(readFileSync(`${dir}/story.json`, "utf8")), JSON.parse(readFileSync(`${dir}/timing.json`, "utf8")));
const place = { groundY: 0.82, actorScale: 1, figureHeight: 520 };
let failures = 0;
const check = (ok: boolean, what: string) => {
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
};

const last = story.beats[story.beats.length - 1];
check(last.from + last.frames === story.frames, `beats cover all ${story.frames} frames`);
check(beatAt(story, 0).beat.id === story.beats[0].id && beatAt(story, story.frames - 1).beat.id === last.id, "beatAt maps first and last frame");

const keys = [...new Set(story.beats.flatMap((b) => b.actors.map((a) => a.key)))];
for (const key of keys) {
  const starts: number[] = [];
  for (let f = 1; f < story.frames; f++) if (blinkAt(key, f, story.fps) > 0 && blinkAt(key, f - 1, story.fps) === 0) starts.push(f);
  const gaps = starts.slice(1).map((s, i) => (s - starts[i]) / story.fps);
  check(gaps.every((g) => g >= 3 && g <= 5), `${key} blinks ${starts.length}x, gaps ${Math.min(...gaps).toFixed(2)}-${Math.max(...gaps).toFixed(2)} s`);
}

for (const beat of story.beats) {
  for (const cue of beat.actors) {
    const states = Array.from({ length: beat.frames }, (_, l) => actorAt(cue, beat, l, beat.from + l, story.fps, place));
    if (cue.toX !== undefined) {
      const xs = states.map((s) => s.x);
      const monotonic = xs.every((x, i) => i === 0 || Math.sign(x - xs[i - 1]) !== -Math.sign(cue.toX! - cue.x));
      const arrive = xs.findIndex((x) => Math.abs(x - cue.toX! * 1920) < 0.5);
      check(monotonic && arrive > 0 && arrive <= Math.round(beat.frames * 0.7), `${beat.id} ${cue.key} walks ${cue.x}->${cue.toX}, arrives at frame ${arrive}/${beat.frames}`);
      const walking = states.filter((s) => s.props.pose === "walk");
      check(walking.length > 0 && new Set(walking.map((s) => s.props.walkPhase.toFixed(2))).size > 10, `${beat.id} ${cue.key} walkPhase advances over ${walking.length} walking frames`);
      check(states.filter((s) => s.props.pose !== "walk").every((s) => s.props.walkPhase === 0), `${beat.id} ${cue.key} settles to ${states[beat.frames - 1].props.pose} with walkPhase 0`);
    }
    const mouths = states.map((s) => s.props.mouth);
    if (cue.speaks) {
      check(mouths.every((m, l) => m === beat.envelope[l]), `${beat.id} ${cue.key} mouth follows envelope (${new Set(states.map((s) => s.props.viseme)).size} visemes used)`);
    } else {
      check(mouths.every((m) => m === 0), `${beat.id} ${cue.key} silent`);
    }
  }
  const views = Array.from({ length: beat.frames }, (_, l) => cameraAt(beat.camera, l, beat.frames));
  const inFrame = views.every((v) => v.cx - 0.5 / v.zoom >= -1e-9 && v.cx + 0.5 / v.zoom <= 1 + 1e-9 && v.cy - 0.5 / v.zoom >= -1e-9 && v.cy + 0.5 / v.zoom <= 1 + 1e-9);
  const [a, z] = [views[0], views[beat.frames - 1]];
  const moved = { hold: a.zoom === z.zoom && a.cx === z.cx, "push-in": z.zoom > a.zoom, "pan-right": z.cx > a.cx }[beat.camera.move];
  check(inFrame && moved, `${beat.id} camera ${beat.camera.move} zoom ${a.zoom.toFixed(2)}->${z.zoom.toFixed(2)} cx ${a.cx.toFixed(3)}->${z.cx.toFixed(3)}, never past stage edge`);
  const shown = beat.captions.map((c) => captionAt(beat, Math.floor((c.from + c.to) / 2))?.text);
  check(shown.every((t, i) => t === beat.captions[i].text) && beat.captions.every((c) => c.to <= beat.frames), `${beat.id} ${beat.captions.length} captions shown inside the beat`);
}

const fades = Array.from({ length: story.frames }, (_, f) => shotAt(story, f)).filter((s) => s.previous).length;
const changes = story.beats.filter((b, i) => i > 0 && (b.set !== story.beats[i - 1].set || b.mood !== story.beats[i - 1].mood)).length;
check(fades === changes * 8, `${fades} crossfade frames for ${changes} set/mood changes`);

console.log(failures === 0 ? "all checks passed" : `${failures} checks failed`);
process.exit(failures === 0 ? 0 : 1);
