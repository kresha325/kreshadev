import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

function Orbit({ diameter, duration, delay, color, tilt }: {
  diameter: number;
  duration: number;
  delay: number;
  color: string;
  tilt: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ perspective: 800 }}>
      <motion.div
        animate={reduceMotion ? undefined : { rotateZ: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear", delay }}
        style={{
          width: `min(${diameter}px, 82vw)`,
          height: `min(${diameter}px, 82vw)`,
          borderRadius: "50%",
          border: `1px solid ${color}`,
          rotateX: tilt,
          position: "absolute",
          boxShadow: `0 0 24px ${color}36`,
        }}
      >
        <div
          className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}, 0 0 24px ${color}` }}
        />
      </motion.div>
    </div>
  );
}

function FloatingNode({ x, y, size, delay, color }: {
  x: string;
  y: string;
  size: number;
  delay: number;
  color: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="absolute"
      style={{ left: x, top: y }}
      animate={reduceMotion ? undefined : { y: [0, -16, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `1px solid ${color}`,
          transform: "rotate(45deg)",
          boxShadow: `0 0 10px ${color}60`,
        }}
      />
    </motion.div>
  );
}

export default function ThreeDScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width;
      canvas.height = bounds.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const streams = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5,
      length: 30 + Math.random() * 60,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    let frame = 0;
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      streams.forEach((stream) => {
        const gradient = context.createLinearGradient(stream.x, stream.y, stream.x, stream.y + stream.length);
        gradient.addColorStop(0, "rgba(0, 102, 255, 0)");
        gradient.addColorStop(0.5, `rgba(0, 102, 255, ${stream.opacity})`);
        gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(stream.x, stream.y);
        context.lineTo(stream.x, stream.y + stream.length);
        context.stroke();
        stream.y += stream.speed;
        if (stream.y > canvas.height) {
          stream.y = -stream.length;
          stream.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      aria-label="Animated orbital illustration"
      className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050505] md:h-[600px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,102,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,.055) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

      <Orbit diameter={460} duration={18} delay={-5} color="#0066FF" tilt={20} />
      <Orbit diameter={360} duration={12} delay={0} color="#0066FF" tilt={60} />
      <Orbit diameter={260} duration={8} delay={-2} color="#00D4FF" tilt={-40} />
      <Orbit diameter={180} duration={6} delay={-1} color="#00D4FF80" tilt={75} />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          className="h-20 w-20 rounded-full border border-[#0066FF]"
          animate={reduceMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 40px #0066FF60, inset 0 0 40px #0066FF20" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute h-[120px] w-[120px] rounded-full border border-[#0066FF40]"
          animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <FloatingNode x="10%" y="20%" size={16} delay={0} color="#0066FF" />
      <FloatingNode x="80%" y="15%" size={10} delay={1} color="#00D4FF" />
      <FloatingNode x="85%" y="70%" size={14} delay={2} color="#0066FF" />
      <FloatingNode x="12%" y="75%" size={8} delay={0.5} color="#00D4FF" />
      <FloatingNode x="50%" y="10%" size={12} delay={1.5} color="#0066FF" />
      <FloatingNode x="50%" y="85%" size={10} delay={3} color="#00D4FF" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-8">
        <h2 className="font-mono text-sm text-gray-500 md:text-base">// spatial.computing</h2>
        <div className="flex select-none justify-between font-sans text-2xl font-bold tracking-tighter text-white opacity-[0.08] md:text-5xl">
          <span>DEPTH</span>
          <span className="self-center">PRECISION</span>
          <span className="self-end">SCALE</span>
        </div>
      </div>
    </section>
  );
}
