import { useEffect, useRef, useState, type FormEvent, type ChangeEvent, type ReactNode } from "react";
import { Link } from "wouter";
import { type PortfolioProject } from "@/data/projects";

type DraftImage = {
  url?: string;
  data?: string;
  name?: string;
  alt: string;
  fit?: "cover" | "contain";
};
type ProjectDraft = {
  id?: string;
  title: string;
  category: string;
  description: string;
  stack: string;
  href: string;
  source: string;
  status: string;
  images: DraftImage[];
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  createdAt: string;
};

const emptyDraft = (): ProjectDraft => ({
  title: "",
  category: "",
  description: "",
  stack: "",
  href: "",
  source: "",
  status: "",
  images: [],
});

function draftFromProject(project: PortfolioProject): ProjectDraft {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    stack: project.stack.join(", "),
    href: project.href ?? "",
    source: project.source ?? "",
    status: project.status ?? "",
    images: (project.images ?? []).map((image) => ({ ...image })),
  };
}

async function optimizeImage(file: File) {
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name}: fotografia origjinale është mbi 20 MB.`);
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nuk u përgatit dot imazhi.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const quality of [0.86, 0.78, 0.7, 0.62, 0.54]) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.type === "image/webp" && blob.size <= 750 * 1024) break;
    }
    if (!blob || blob.type !== "image/webp" || blob.size > 750 * 1024) {
      throw new Error(`${file.name}: nuk mundi të zvogëlohej nën 750 KB.`);
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Nuk u lexua dot fotografia."));
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Fotografi e pavlefshme."));
      reader.readAsDataURL(blob);
    });
    return dataUrl.split(",")[1];
  } finally {
    bitmap.close();
  }
}

async function responseError(response: Response) {
  const body = await response.json().catch(() => ({}));
  return typeof body.error === "string" ? body.error : "Ndodhi një gabim. Provo përsëri.";
}

export default function Admin() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadProjects() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) throw new Error(await responseError(response));
    setProjects(await response.json() as PortfolioProject[]);
  }

  async function loadMessages() {
    const response = await fetch("/api/admin/messages", { cache: "no-store" });
    if (!response.ok) throw new Error(await responseError(response));
    setMessages(await response.json() as ContactMessage[]);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response));
        return response.json() as Promise<{ configured: boolean; authenticated: boolean }>;
      })
      .then(async (session) => {
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await Promise.all([loadProjects(), loadMessages()]);
      })
      .catch(() => {
        if (active) {
          setConnectionFailed(true);
          setConfigured(false);
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const refreshMessages = async () => {
      try {
        const response = await fetch("/api/admin/messages", { cache: "no-store" });
        if (!response.ok) return;
        const latest = await response.json() as ContactMessage[];
        if (active) setMessages(latest);
      } catch {
        // Keep the last loaded inbox if a background refresh briefly fails.
      }
    };
    const interval = window.setInterval(refreshMessages, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [authenticated]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setPassword("");
      setAuthenticated(true);
      await Promise.all([loadProjects(), loadMessages()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hyrja dështoi.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setDraft(null);
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const payload = {
        title: draft.title,
        category: draft.category,
        description: draft.description,
        stack: draft.stack.split(",").map((item) => item.trim()).filter(Boolean),
        href: draft.href,
        source: draft.source,
        status: draft.status,
        images: draft.images.map(({ url, data, name, alt, fit }) => ({ url, data, name, alt, fit })),
      };
      const response = await fetch(draft.id ? `/api/admin/projects/${encodeURIComponent(draft.id)}` : "/api/admin/projects", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseError(response));
      await loadProjects();
      setDraft(null);
      setNotice("Projekti u ruajt me sukses.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Projekti nuk u ruajt.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(project: PortfolioProject) {
    if (!window.confirm(`A dëshiron ta fshish projektin “${project.title}”?`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      await loadProjects();
      setNotice("Projekti u fshi.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Projekti nuk u fshi.");
    } finally {
      setBusy(false);
    }
  }

  async function addImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!draft || selected.length === 0) return;
    const remaining = 10 - draft.images.length;
    if (remaining <= 0) {
      setError("Lejohen maksimumi 10 imazhe për projekt.");
      return;
    }
    setError("");
    const files = selected.slice(0, remaining);
    if (selected.length > remaining) setNotice(`U përzgjodhën vetëm ${remaining} imazhe; kufiri është 10.`);
    setBusy(true);
    try {
      const images = await Promise.all(files.map(async (file) => ({
        name: file.name,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        data: await optimizeImage(file),
        fit: "cover" as const,
      })));
      setDraft((current) => current ? { ...current, images: [...current.images, ...images].slice(0, 10) } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imazhi nuk u përgatit.");
    } finally {
      setBusy(false);
    }
  }

  function updateImage(index: number, changes: Partial<DraftImage>) {
    setDraft((current) => current ? {
      ...current,
      images: current.images.map((image, imageIndex) => imageIndex === index ? { ...image, ...changes } : image),
    } : current);
  }

  if (configured === null) {
    return <AdminShell><p className="text-sm text-gray-400">Duke u lidhur me panelin…</p></AdminShell>;
  }

  if (connectionFailed) {
    return <AdminShell><p role="alert" className="max-w-2xl text-sm leading-7 text-red-300">Nuk u lidh dot me serverin. Nise aplikacionin me `pnpm run dev:portfolio` që admini të punojë.</p></AdminShell>;
  }

  return (
    <AdminShell>
      {!configured ? (
        <div className="max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6 text-sm leading-7 text-amber-100">
          Paneli është gati, por mungojnë cilësimet e hyrjes në server. Krijo `.env` nga `.env.example`, vendos një fjalëkalim dhe çelës sesioni, pastaj nise portofolin me `pnpm run dev:portfolio`.
        </div>
      ) : !authenticated ? (
        <form onSubmit={signIn} className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D4FF]">Private workspace</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Hyr në admin</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">Menaxho projektet dhe galeritë e portofolit.</p>
          <label className="mt-8 block text-sm text-gray-300" htmlFor="admin-password">Fjalëkalimi</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#00D4FF]"
          />
          {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-lg bg-[#0066FF] px-4 py-3 font-medium text-white transition hover:bg-[#1476ff] disabled:opacity-50">
            {busy ? "Duke hyrë…" : "Hyr"}
          </button>
        </form>
      ) : draft ? (
        <form onSubmit={saveProject} className="max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D4FF]">Project editor</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{draft.id ? "Ndrysho projektin" : "Projekt i ri"}</h1>
            </div>
            <button type="button" onClick={() => { setDraft(null); setError(""); }} className="text-sm text-gray-400 hover:text-white">Anulo</button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminField label="Emri i projektit" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} required />
            <AdminField label="Kategoria" value={draft.category} onChange={(category) => setDraft({ ...draft, category })} required />
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300" htmlFor="project-description">Përshkrimi</label>
              <textarea id="project-description" required rows={4} maxLength={3000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#00D4FF]" />
            </div>
            <AdminField label="Teknologjitë / veçoritë (ndaji me presje)" value={draft.stack} onChange={(stack) => setDraft({ ...draft, stack })} />
            <AdminField label="Statusi (p.sh. In progress)" value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
            <AdminField label="Lidhja e projektit" value={draft.href} onChange={(href) => setDraft({ ...draft, href })} placeholder="https://…" />
            <AdminField label="Lidhja GitHub / source" value={draft.source} onChange={(source) => setDraft({ ...draft, source })} placeholder="https://github.com/…" />
          </div>

          <section className="mt-9 border-t border-white/10 pt-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-white">Fotografitë dhe logot</h2>
                <p className="mt-1 text-sm text-gray-400">Deri në 10 për projekt. Imazhet zvogëlohen automatikisht.</p>
              </div>
              <button type="button" onClick={() => fileInput.current?.click()} disabled={busy || draft.images.length >= 10} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white hover:border-[#00D4FF]/60 disabled:opacity-40">
                Zgjidh imazhe ({draft.images.length}/10)
              </button>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addImages} />
            </div>
            {draft.images.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {draft.images.map((image, index) => (
                  <div key={`${image.url ?? image.name}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.04]">
                      <img src={image.data ? `data:image/webp;base64,${image.data}` : image.url} alt={image.alt} className={`h-full w-full ${image.fit === "contain" ? "object-contain p-2" : "object-cover"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="block text-xs text-gray-400" htmlFor={`image-alt-${index}`}>Përshkrimi i imazhit</label>
                      <input id={`image-alt-${index}`} value={image.alt} maxLength={180} onChange={(event) => updateImage(index, { alt: event.target.value })} className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-[#00D4FF]" />
                      <label className="mt-2 block text-xs text-gray-400" htmlFor={`image-fit-${index}`}>Paraqitja</label>
                      <select id={`image-fit-${index}`} value={image.fit ?? "cover"} onChange={(event) => updateImage(index, { fit: event.target.value as "cover" | "contain" })} className="mt-1 w-full rounded border border-white/10 bg-[#111] px-2 py-1.5 text-sm text-white">
                        <option value="cover">Foto (mbushe hapësirën)</option>
                        <option value="contain">Logo (shfaqe të plotë)</option>
                      </select>
                      <button type="button" onClick={() => setDraft({ ...draft, images: draft.images.filter((_, imageIndex) => imageIndex !== index) })} className="mt-2 text-xs text-red-300 hover:text-red-200">Hiqe imazhin</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <button disabled={busy} className="rounded-lg bg-[#0066FF] px-5 py-3 font-medium text-white hover:bg-[#1476ff] disabled:opacity-50">{busy ? "Duke ruajtur…" : "Ruaje projektin"}</button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-white/15 px-5 py-3 text-gray-300 hover:text-white">Anulo</button>
          </div>
        </form>
      ) : (
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D4FF]">Private workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Projektet</h1>
              <p className="mt-2 text-sm text-gray-400">Shto, ndrysho ose hiq projektet e portofolit.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setError(""); setDraft(emptyDraft()); }} className="rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1476ff]">+ Projekt i ri</button>
              <button type="button" onClick={signOut} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-gray-300 hover:text-white">Dil</button>
            </div>
          </div>
          {notice && <p role="status" className="mb-5 text-sm text-emerald-300">{notice}</p>}
          {error && <p role="alert" className="mb-5 text-sm text-red-300">{error}</p>}
          <section className="mb-12 border-t border-white/10 pt-8">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Mesazhet e projekteve</h2>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500">{messages.length} mesazhe</span>
            </div>
            {messages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-5 py-6 text-sm text-gray-500">Nuk ka ende kërkesa për projekte.</p>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => (
                  <article key={message.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{message.name}</h3>
                        <a href={`mailto:${message.email}`} className="mt-1 inline-block text-sm text-[#00D4FF] hover:text-white">{message.email}</a>
                        {message.phone && <a href={`tel:${message.phone.replace(/[^+0-9]/g, "")}`} className="ml-3 inline-block text-sm text-gray-400 hover:text-white">{message.phone}</a>}
                      </div>
                      <time dateTime={message.createdAt} className="font-mono text-xs text-gray-500">{new Date(message.createdAt).toLocaleString("sq-XK")}</time>
                    </div>
                    <p className="mt-4 font-mono text-xs uppercase tracking-wider text-gray-500">{message.projectType}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-300">{message.message}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article key={project.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                {project.images?.[0] ? (
                  <img src={project.images[0].url} alt={project.images[0].alt} className={`h-20 w-24 shrink-0 rounded-lg bg-white/[0.04] ${project.images[0].fit === "contain" ? "object-contain p-2" : "object-cover"}`} />
                ) : (
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 text-xs text-gray-500">Pa imazh</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">{project.category}</p>
                  <h2 className="mt-1 truncate text-lg font-medium text-white">{project.title}</h2>
                  <p className="mt-1 text-xs text-gray-500">{project.images?.length ?? 0}/10 imazhe{project.status ? ` · ${project.status}` : ""}</p>
                  <div className="mt-3 flex gap-4">
                    <button type="button" onClick={() => { setError(""); setDraft(draftFromProject(project)); }} className="text-sm text-[#00D4FF] hover:text-white">Ndrysho</button>
                    <button type="button" disabled={busy} onClick={() => deleteProject(project)} className="text-sm text-red-300 hover:text-red-200 disabled:opacity-40">Fshije</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </AdminShell>
  );
}

function AdminField({ label, value, onChange, required, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <label className="block text-sm text-gray-300" htmlFor={id}>{label}</label>
      <input id={id} value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-[#00D4FF]" />
    </div>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#080808] px-5 py-8 text-[#E8E8E8] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-sm text-gray-400 transition-colors hover:text-[#00D4FF]">← Kthehu te portofoli</Link>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
