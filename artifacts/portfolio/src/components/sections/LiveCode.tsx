import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CODE_SNIPPET = `type Athlete = { name: string; sport: string; location: string };

const athletes: Athlete[] = [
  { name: 'Arta', sport: 'football', location: 'Prishtina' },
  { name: 'Luan', sport: 'basketball', location: 'Prizren' },
];

export function findAthletes(sport: string) {
  return athletes.filter((athlete) => athlete.sport === sport);
}

const featured = findAthletes('football');
console.log('Discover talent:', featured);`;

export default function LiveCode() {
  const [code, setCode] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      setCode(CODE_SNIPPET.slice(0, index));
      index += 1;
      if (index > CODE_SNIPPET.length) window.clearInterval(interval);
    }, 20);
    return () => window.clearInterval(interval);
  }, []);

  const highlighted = code
    .replace(/(type|export|function|return|const|new)/g, '<span style="color:#0066FF">$1</span>')
    .replace(/(\/\/.+)/g, '<span style="color:#6b7280">$1</span>')
    .replace(/('.+?')/g, '<span style="color:#10b981">$1</span>')
    .replace(/({|}|\[|\]|\(|\))/g, '<span style="color:#9ca3af">$1</span>');

  return (
    <div className="w-full">
      <h2 className="mb-8 font-mono text-sm text-gray-500 md:text-base">// product.workflow</h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="group relative overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a] p-6 font-mono text-sm leading-relaxed md:p-8">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0066FF] to-transparent opacity-50" />
          <div className="mb-6 flex gap-2">
            <span className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
            <span className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
            <span className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
          </div>
          <pre className="text-gray-300"><code dangerouslySetInnerHTML={{ __html: highlighted }} /><motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="ml-1 inline-block h-4 w-2 align-middle bg-white/50" /></pre>
        </div>

        <div className="flex flex-col justify-center">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <svg viewBox="0 0 400 400" className="h-full w-full" aria-label="Illustration of a digital product workflow">
              <motion.path d="M 200 80 L 200 160 M 200 220 L 200 320 M 200 160 L 100 240 M 200 160 L 300 240" stroke="#0066FF" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, -20] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
              <g transform="translate(140, 20)"><rect width="120" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" /><text x="60" y="35" fill="white" fontSize="14" fontFamily="monospace" textAnchor="middle">[People]</text></g>
              <g transform="translate(140, 160)"><rect width="120" height="60" rx="8" fill="rgba(0,102,255,0.1)" stroke="#0066FF" /><text x="60" y="35" fill="#0066FF" fontSize="14" fontFamily="monospace" textAnchor="middle">[Products]</text></g>
              <g transform="translate(40, 240)"><rect width="120" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" /><text x="60" y="35" fill="white" fontSize="14" fontFamily="monospace" textAnchor="middle">[Web apps]</text></g>
              <g transform="translate(240, 240)"><rect width="120" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" /><text x="60" y="35" fill="white" fontSize="14" fontFamily="monospace" textAnchor="middle">[Mobile apps]</text></g>
              <g transform="translate(140, 320)"><rect width="120" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" /><text x="60" y="35" fill="white" fontSize="14" fontFamily="monospace" textAnchor="middle">[Community]</text></g>
            </svg>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs text-gray-400">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            PRODUCTS IN PROGRESS
          </div>
        </div>
      </div>
    </div>
  );
}
