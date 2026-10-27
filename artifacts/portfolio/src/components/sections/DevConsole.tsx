import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Line = { type: "input" | "output"; content: string };

const intro: Line[] = [
  { type: "input", content: "whoami" },
  { type: "output", content: "KreshaDev — building web and mobile products from Kosovo." },
  { type: "output", content: "Type 'help' to see the available commands." },
];

const responses: Record<string, string> = {
  whoami: "KreshaDev — building web and mobile products from Kosovo.",
  projects: "XTalenti · All Sports App · Napoletana Nostra · Die Energiesparer · HAEB Bau · Lakeside Digital Menu",
  skills: "React · TypeScript · Vite · Flutter · Dart · Firebase · Node.js · Express · PostgreSQL",
  contact: "WhatsApp: +383 44 416 502 · Email: kresha325@gmail.com",
  help: "Available commands: whoami, projects, skills, contact, clear, easter egg, help",
};

export default function DevConsole() {
  const [logs, setLogs] = useState<Line[]>(intro);
  const [input, setInput] = useState("");
  const [matrixActive, setMatrixActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [logs]);

  useEffect(() => {
    if (!matrixActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%#&(){}<>[]";
    const fontSize = 14;
    const drops = Array.from({ length: Math.ceil(canvas.width / fontSize) }, () => 1);
    const draw = () => {
      context.fillStyle = "rgba(10, 10, 10, 0.12)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#0F0";
      context.font = `${fontSize}px monospace`;
      drops.forEach((drop, index) => {
        context.fillText(chars[Math.floor(Math.random() * chars.length)], index * fontSize, drop * fontSize);
        if (drop * fontSize > canvas.height && Math.random() > 0.975) drops[index] = 0;
        drops[index] += 1;
      });
    };
    const interval = window.setInterval(draw, 45);
    const timeout = window.setTimeout(() => setMatrixActive(false), 2400);
    return () => {
      window.removeEventListener("resize", resize);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [matrixActive]);

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !input.trim()) return;
    const command = input.trim().toLowerCase();
    setInput("");
    if (command === "clear") {
      setLogs([]);
      return;
    }
    setLogs((current) => [...current, { type: "input", content: command }]);
    if (command === "easter egg") {
      setMatrixActive(true);
      setLogs((current) => [...current, { type: "output", content: "Starting a short visual effect…" }]);
      return;
    }
    setLogs((current) => [
      ...current,
      { type: "output", content: responses[command] ?? `command not found: ${command}. Type 'help' for commands.` },
    ]);
  };

  return (
    <section className="w-full" aria-labelledby="console-heading">
      <h2 id="console-heading" className="mb-8 font-mono text-sm text-gray-500 md:text-base">// developer.console</h2>
      <div className="relative flex h-[360px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] font-mono text-sm shadow-2xl md:h-[400px]">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 bg-white/5 px-4">
          <span className="h-3 w-3 rounded-full bg-red-500/50" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
          <span className="h-3 w-3 rounded-full bg-green-500/50" />
          <span className="ml-4 text-xs text-gray-500">kreshadev@portfolio:~</span>
        </div>

        {matrixActive && <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-10 z-10 h-[calc(100%-2.5rem)] w-full" />}

        <div className="custom-scrollbar z-20 flex-1 overflow-y-auto p-5 md:p-6">
          <div className="flex flex-col gap-3">
            {logs.map((line, index) => (
              <div key={`${index}-${line.content}`} className={`flex ${line.type === "input" ? "text-[#E8E8E8]" : "text-green-400"}`}>
                {line.type === "input" && <span className="mr-2 text-[#0066FF]">➜</span>}
                <span className="break-words">{line.content}</span>
              </div>
            ))}
            <label className="flex items-center text-[#E8E8E8]">
              <span className="mr-2 text-[#0066FF]" aria-hidden="true">➜</span>
              <span className="sr-only">Terminal command</span>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleCommand}
                className="min-w-0 flex-1 border-none bg-transparent text-[#E8E8E8] outline-none focus:ring-0"
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal command"
              />
              <span className="h-4 w-2 animate-pulse bg-white/70" aria-hidden="true" />
            </label>
            <div ref={endRef} />
          </div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:4px}`}</style>
    </section>
  );
}
