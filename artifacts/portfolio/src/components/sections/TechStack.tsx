const row1 = ["React", "TypeScript", "Vite", "Flutter", "Dart", "Firebase"];
const row2 = ["Node.js", "Express", "PostgreSQL", "Tailwind CSS", "Framer Motion", "Sass"];

export default function TechStack() {
  return (
    <div className="w-full overflow-hidden py-12">
      <h2 className="mb-12 font-mono text-sm text-gray-500 md:text-base">// stack.manifest</h2>
      <div className="relative flex flex-col gap-8">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-[#080808] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-[#080808] to-transparent" />
        <div className="relative flex w-max">
          <div className="animate-marquee-left flex whitespace-nowrap">
            {[...row1, ...row1, ...row1].map((tech, index) => <div key={`${tech}-${index}`} className="mx-4 flex items-center font-mono text-2xl text-[#E8E8E8]/40 transition-colors duration-300 hover:text-[#0066FF] md:text-4xl"><span>{tech}</span><span className="mx-8 text-[#0066FF]/30">•</span></div>)}
          </div>
        </div>
        <div className="relative ml-[-50%] flex w-max">
          <div className="animate-marquee-right flex whitespace-nowrap">
            {[...row2, ...row2, ...row2].map((tech, index) => <div key={`${tech}-${index}`} className="mx-4 flex items-center font-mono text-2xl text-[#E8E8E8]/40 transition-colors duration-300 hover:text-[#00D4FF] md:text-4xl"><span>{tech}</span><span className="mx-8 text-[#00D4FF]/30">•</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
