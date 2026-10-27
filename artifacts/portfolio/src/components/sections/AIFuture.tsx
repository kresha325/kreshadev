import { motion } from "framer-motion";

const focusAreas = [
  { title: "Sports & talent", description: "Building tools that bring athletes and communities together." },
  { title: "Web experiences", description: "Designing clear, responsive websites for real businesses." },
  { title: "Mobile apps", description: "Working on practical apps for people on the move." },
];

function NetworkIllustration() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
      {[...Array(6)].map((_, index) => {
        const angle = index * Math.PI / 3;
        const x = 50 + Math.cos(angle) * 30;
        const y = 50 + Math.sin(angle) * 30;
        return <g key={index}><motion.circle cx={x} cy={y} r={3} fill="#00D4FF" animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }} /><path d={`M 50 50 L ${x} ${y}`} stroke="rgba(0,102,255,0.3)" strokeWidth="1" /></g>;
      })}
      <circle cx="50" cy="50" r="4" fill="#0066FF" />
    </svg>
  );
}

function WebIllustration() {
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
      <motion.path d="M 0 50 Q 25 10 50 50 T 100 50" fill="none" stroke="#00D4FF" strokeWidth="2" animate={{ pathLength: [0.65, 1, 0.65], opacity: [0.55, 1, 0.55] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
      <motion.path d="M 0 50 Q 25 90 50 50 T 100 50" fill="none" stroke="#0066FF" strokeWidth="1" className="opacity-50" animate={{ pathLength: [0.65, 1, 0.65], opacity: [0.25, 0.65, 0.25] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }} />
    </svg>
  );
}

function MobileIllustration() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
      <rect x="20" y="20" width="20" height="20" rx="4" fill="none" stroke="#0066FF" strokeWidth="2" />
      <rect x="60" y="60" width="20" height="20" rx="4" fill="none" stroke="#00D4FF" strokeWidth="2" />
      <motion.path d="M 40 30 L 70 30 L 70 60" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, -16] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
      <motion.circle cx="70" cy="60" r="2" fill="#00D4FF" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
    </svg>
  );
}

const illustrations = [NetworkIllustration, WebIllustration, MobileIllustration];

export default function AIFuture() {
  return (
    <div className="w-full">
      <h2 className="mb-8 font-mono text-sm text-gray-500 md:text-base">// focus.areas</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {focusAreas.map((area, index) => {
          const Illustration = illustrations[index];
          return (
            <article key={area.title} className="group relative flex h-80 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm transition-colors duration-500 hover:border-[#0066FF]/50">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0066FF]/0 to-[#0066FF]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex h-32 w-full items-center justify-center"><Illustration /></div>
              <div className="relative z-10">
                <h3 className="mb-2 font-sans text-xl font-semibold text-white transition-colors group-hover:text-[#00D4FF]">{area.title}</h3>
                <p className="font-mono text-sm text-gray-400">{area.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
