export type ProjectImage = {
  url: string;
  alt: string;
  fit?: "cover" | "contain";
};

export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  stack: string[];
  href?: string;
  source?: string;
  status?: string;
  images: ProjectImage[];
};

export const defaultProjects: PortfolioProject[] = [
  {
    id: "01",
    title: "XTalenti",
    category: "Sports & talent platform",
    description: "A platform connecting football talent with coaches, scouts, and clubs through profiles, discovery, messaging, and community features. The mobile app is planned for launch in January 2027.",
    stack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "React Native", "Expo"],
    href: "https://xtalenti.com",
    source: "https://github.com/kresha325/FootballPro",
    status: "Mobile app launches Jan 2027",
    images: [{ url: `${import.meta.env.BASE_URL}project-images/xtalenti.webp`, alt: "XTalenti project preview", fit: "cover" }],
  },
  {
    id: "02",
    title: "All Sports App",
    category: "Mobile app",
    description: "An app in progress for promoting talent across 50 sports, with athlete profiles and dedicated sport communities.",
    stack: ["Flutter", "Dart", "50 sports"],
    href: "https://github.com/kresha325/All_sports",
    status: "In progress",
    images: [],
  },
  {
    id: "03",
    title: "Napoletana Nostra",
    category: "Restaurant website",
    description: "A restaurant website with a rich visual presentation, animated interactions, and ambient video and audio controls.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "YouTube IFrame API"],
    href: "https://napoletananostra.com",
    source: "https://github.com/kresha325/NapoletanaNostra-GranitBllaca",
    images: [{ url: `${import.meta.env.BASE_URL}project-images/napoletana-nostra.webp`, alt: "Napoletana Nostra project preview", fit: "cover" }],
  },
  {
    id: "04",
    title: "Die Energiesparer",
    category: "Energy consulting website",
    description: "A German energy consulting website with guidance and tools to help households explore energy-saving options.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS 4", "Framer Motion"],
    href: "https://dieenergiesparer.com",
    images: [{ url: `${import.meta.env.BASE_URL}project-images/die-energiesparer.webp`, alt: "Die Energiesparer project preview", fit: "cover" }],
  },
  {
    id: "05",
    title: "HAEB Bau",
    category: "Mobile app",
    description: "A Flutter and Firebase project featuring dark and light themes, with localization (l10n).",
    stack: ["Flutter", "Firebase", "Dark / light mode", "Localization (l10n)"],
    images: [{ url: `${import.meta.env.BASE_URL}project-images/haeb-bau.webp`, alt: "HAEB Bau project preview", fit: "cover" }],
  },
  {
    id: "06",
    title: "Lakeside Digital Menu",
    category: "Hotel & restaurant menu",
    description: "A digital menu for Lakeside Hotel Spa & Conference, designed to make browsing the restaurant offering simple on mobile and desktop.",
    stack: ["React", "TypeScript", "Vite", "Sass"],
    href: "https://lakesidemenu.com",
    source: "https://github.com/kresha325/Lakeside-Restaurant",
    images: [{ url: `${import.meta.env.BASE_URL}project-images/lakeside-menu.webp`, alt: "Lakeside Digital Menu project preview", fit: "cover" }],
  },
];
