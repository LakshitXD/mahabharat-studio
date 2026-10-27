// CPU (SwiftShader) raster-cost split probe: node probe-cdp.mjs <chrome> <variants.json> <gl>
import { spawn } from "node:child_process"; import fs from "node:fs";
const [chrome, vfile, gl="swiftshader"] = process.argv.slice(2);
const V = JSON.parse(fs.readFileSync(vfile, "utf8"));
const p = spawn(chrome, ["--headless", "--remote-debugging-port=0", `--use-angle=${gl}`, "--enable-unsafe-swiftshader", "--hide-scrollbars", "--force-color-profile=srgb", "--user-data-dir=" + process.cwd() + "/chrome-prof", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((r) => { let b = ""; p.stderr.on("data", (d) => { b += d; const m = b.match(/ws:\/\/\S+/); if (m) r(m[0]); }); });
const port = new URL(wsUrl).port;
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pend = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
await send("Runtime.evaluate", { expression: `document.body.style.margin=0; document.body.innerHTML='<div id=s></div>'` });
const set = (svg) => send("Runtime.evaluate", { expression: `document.getElementById("s").innerHTML=${JSON.stringify(svg)}; 1` });
const shot = async () => { const t = performance.now(); const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 30 }); return [performance.now() - t, r]; };
const res = {};
for (const k of (process.env.VARIANTS ?? Object.keys(V).join(",")).split(",")) {
  await set(V[k][0]); await shot(); await shot();
  const base = []; for (let i = 0; i < 3; i++) base.push((await shot())[0]);
  const ch = []; for (let i = 0; i < 4; i++) { const tS = performance.now(); await set(V[k][(i + 1) % 2]); const [t] = await shot(); ch.push(performance.now() - tS); }
  const med = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
  res[k] = { changedMs: med(ch).toFixed(0), unchangedMs: med(base).toFixed(0) };
  console.log(k, JSON.stringify(res[k]));
}
ws.close(); p.kill();
