import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const roles = [
    "web developer",
    "digital product builder",
    "mobile app developer"
  ];

  // Particle background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];
    
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: Math.random() * 0.5 - 1, // drift upwards
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 255, ${p.opacity})`;
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Start after a delay to match entrance
    setTimeout(() => {
      draw();
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    const currentRole = roles[typingIndex];
    
    const typeSpeed = isDeleting ? 50 : 100;
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typingText.length < currentRole.length) {
          setTypingText(currentRole.slice(0, typingText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typingText.length > 0) {
          setTypingText(currentRole.slice(0, typingText.length - 1));
        } else {
          setIsDeleting(false);
          setTypingIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typeSpeed);
    
    return () => clearTimeout(timeout);
  }, [typingText, typingIndex, isDeleting, roles]);

  const taglineWords = "Building useful digital products for sport, business, and community.".split(" ");

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
      />

      <div className="z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[clamp(2.8rem,10vw,14rem)] font-bold text-white tracking-tighter leading-none mb-8"
        >
          KreshaDev
        </motion.h1>
        
        <div className="flex flex-wrap justify-center gap-2 text-xl md:text-2xl font-mono text-gray-400 mb-8 max-w-2xl">
          {taglineWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + (i * 0.1), ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="font-mono text-lg md:text-xl text-[#0066FF] flex items-center gap-1 h-8"
        >
          <span className="text-gray-500 mr-2">{">"}</span>
          <span>{typingText}</span>
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-5 bg-[#0066FF] inline-block"
          />
        </motion.div>
      </div>
    </section>
  );
}
