import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { defaultProjects, type PortfolioProject, type ProjectImage } from "@/data/projects";

function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] md:h-56">
        <img src={current.url} alt={current.alt || `${title} project image`} className={`h-full w-full ${current.fit === "contain" ? "object-contain p-5" : "object-cover"}`} loading="lazy" />
      </div>
      {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`${title} project images`}>
        {images.map((image, index) => <button key={image.url} type="button" onClick={() => setActive(index)} aria-label={`Show image ${index + 1} of ${images.length}`} aria-pressed={active === index} className={`h-12 w-16 shrink-0 overflow-hidden rounded border ${active === index ? "border-[#0066FF]" : "border-white/10"}`}>
          <img src={image.url} alt="" className={`h-full w-full ${image.fit === "contain" ? "object-contain p-1" : "object-cover"}`} loading="lazy" />
        </button>)}
      </div>}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(defaultProjects);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_ADMIN_API === "false") return;
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() as Promise<PortfolioProject[]> : Promise.reject()))
      .then((data) => setProjects(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <div className="w-full">
      <h2 className="mb-12 font-mono text-sm text-gray-500 md:text-base">// select.projects</h2>

      <div className="flex flex-col border-t border-white/10">
        {projects.map((project, index) => {
          const id = project.id || String(index + 1).padStart(2, "0");
          const isOpen = hoveredId === id || selectedId === id;
          const images = project.images ?? [];
          return (
            <article key={project.id} className="group relative border-b border-white/10 py-8" onMouseEnter={() => setHoveredId(id)} onMouseLeave={() => setHoveredId((current) => current === id ? null : current)}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-baseline gap-6 md:gap-12">
                  <span className="font-mono text-sm text-gray-600">{id}</span>
                  <button type="button" aria-expanded={isOpen} onClick={() => setSelectedId((current) => current === id ? null : id)} className="text-left font-sans text-3xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-[#0066FF] md:text-5xl">
                    {project.title}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {project.stack.map((tech) => <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-gray-400 transition-colors duration-300 group-hover:border-[#0066FF]/30 group-hover:text-[#0066FF]/80">{tech}</span>)}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 overflow-hidden">
                  <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:gap-16">
                    <div>
                      <p className="text-lg leading-relaxed text-gray-400">{project.description}</p>
                      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm">
                        {project.href && <a href={project.href} target="_blank" rel="noreferrer" className="text-white transition-colors hover:text-[#0066FF]">Open project ↗</a>}
                        {project.source && <a href={project.source} target="_blank" rel="noreferrer" className="text-gray-500 transition-colors hover:text-[#00D4FF]">Source on GitHub ↗</a>}
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                      {images.length ? <ProjectGallery images={images} title={project.title} /> : <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2"><span className="font-mono text-xs uppercase text-gray-600">Category</span><span className="font-mono text-sm text-[#E8E8E8]">{project.category}</span></div>
                        <div className="flex flex-col gap-2"><span className="font-mono text-xs uppercase text-gray-600">Status</span><span className="font-mono text-sm text-[#E8E8E8]">{project.status || "Selected"}</span></div>
                        <div className="flex flex-col gap-2"><span className="font-mono text-xs uppercase text-gray-600">Images</span><span className="font-mono text-sm text-[#E8E8E8]">0 / 10</span></div>
                      </div>}
                    </div>
                  </div>
                </motion.div>}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </div>
  );
}
