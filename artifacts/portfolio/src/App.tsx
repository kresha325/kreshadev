import { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import Lenis from 'lenis';
import Home from './pages/Home';
import MagneticCursor from './components/MagneticCursor';
import NotFound from './pages/not-found';
import Admin from './pages/Admin';

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={import.meta.env.VITE_ENABLE_ADMIN_API === "false" ? NotFound : Admin} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-[#080808] min-h-screen text-[#E8E8E8] font-sans selection:bg-[#0066FF] selection:text-white">
      <MagneticCursor />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </div>
  );
}

export default App;
