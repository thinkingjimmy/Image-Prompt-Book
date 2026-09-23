/**
 * [INPUT]: 依赖 playwright 的 chromium 与 CDP（网络/CPU 节流），依赖一个已启动的站点（默认 http://localhost:3200）
 * [OUTPUT]: CLI：在固定条件下测量首页与详情页的 LCP、CLS、请求数与传输体积，打印 Markdown 表格
 * [POS]: scripts 的性能记录工具；结果只代表所记录的设备/网络/内容条件，不是现场 INP 或全站保证
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { chromium, devices } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3200";
const PAGES = ["/en", "/en/prompts/grokbot-capsule-icon"];
// Roughly "Slow 4G" as used by Lighthouse mobile: 150 ms RTT, 1.6 Mbps down, 750 Kbps up, 4× CPU slowdown.
const NETWORK = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const CPU_RATE = 4;

async function measure(path: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", NETWORK);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_RATE });

  let bytes = 0;
  let requests = 0;
  cdp.on("Network.loadingFinished", (event) => {
    bytes += event.encodedDataLength;
    requests++;
  });

  await page.addInitScript(() => {
    const vitals = { lcp: 0, cls: 0 };
    Object.defineProperty(window, "__vitals", { value: vitals });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) vitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) vitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1500);
  const vitals = await page.evaluate(() => (window as unknown as { __vitals: { lcp: number; cls: number } }).__vitals);
  await browser.close();
  return { path, lcp: Math.round(vitals.lcp), cls: Number(vitals.cls.toFixed(3)), requests, kb: Math.round(bytes / 1024) };
}

async function main() {
  console.log(`Conditions: Chromium, Pixel 7 emulation, ${NETWORK.latency} ms RTT, 1.6 Mbps down, ${CPU_RATE}× CPU, cold cache, base ${BASE}\n`);
  console.log("| Page | LCP (ms) | CLS | Requests | Transferred (KB) |\n| --- | --- | --- | --- | --- |");
  for (const path of PAGES) {
    const result = await measure(path);
    console.log(`| ${result.path} | ${result.lcp} | ${result.cls} | ${result.requests} | ${result.kb} |`);
  }
}

void main();
