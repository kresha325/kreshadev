const focusAreas = [
  {
    number: "01",
    title: "Sports products",
    description: "Tools that help athletes and communities connect and grow.",
  },
  {
    number: "02",
    title: "Web experiences",
    description: "Clear, considered websites for businesses and their customers.",
  },
  {
    number: "03",
    title: "Mobile apps",
    description: "Practical app ideas shaped around the people who use them.",
  },
];

export default function About() {
  return (
    <section className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      <div>
        <h2 className="font-mono text-sm text-gray-500 md:text-base">// about.kresha</h2>
        <p className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
          I like turning ideas into digital products people can use.
        </p>
        <p className="mt-6 max-w-lg text-base leading-8 text-gray-400">
          My projects range from sports platforms and mobile app concepts to websites for local businesses. I enjoy shaping the product and building the interface, one thoughtful detail at a time.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {["React", "TypeScript", "Flutter", "Dart", "Firebase", "Vite"].map((skill) => (
            <span key={skill} className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-gray-400">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-white/10 border-y border-white/10">
        {focusAreas.map((area) => (
          <div key={area.number} className="grid grid-cols-[48px_1fr] gap-4 py-6 md:grid-cols-[64px_1fr] md:gap-6 md:py-8">
            <span className="pt-1 font-mono text-sm text-[#0066FF]">{area.number}</span>
            <div>
              <h3 className="text-xl font-medium text-white">{area.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{area.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
