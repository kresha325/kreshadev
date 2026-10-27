import Hero from '../components/sections/Hero';
import LiveCode from '../components/sections/LiveCode';
import Projects from '../components/sections/Projects';
import AIFuture from '../components/sections/AIFuture';
import ThreeDScene from '../components/sections/ThreeDScene';
import TechStack from '../components/sections/TechStack';
import DevConsole from '../components/sections/DevConsole';
import Contact from '../components/sections/Contact';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            entry.target.classList.remove('section-hidden');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-section').forEach((el) => {
      el.classList.add('section-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="w-full flex flex-col items-center">
      <Hero />
      <div className="w-full max-w-7xl px-6 md:px-12 mx-auto flex flex-col gap-32 py-32">
        <section className="reveal-section w-full"><LiveCode /></section>
        <section className="reveal-section w-full"><Projects /></section>
        <section className="reveal-section w-full"><AIFuture /></section>
        <section className="reveal-section w-full"><ThreeDScene /></section>
        <section className="reveal-section w-full"><TechStack /></section>
        <section className="reveal-section w-full"><DevConsole /></section>
        <section className="reveal-section w-full"><Contact /></section>
      </div>
    </main>
  );
}
