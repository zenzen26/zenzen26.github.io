import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Navigation from '@/components/Navigation';
import PageLoader from '@/components/ui/PageLoader';
import StaticTransition from '@/components/ui/StaticTransition';
import DesktopPet from '@/components/ui/DesktopPet';

// Page-level code splitting: each page (and its heavy deps) is loaded on
// demand only when its route is visited.
const Home = lazy(() => import('@/pages/Home'));
const Projects = lazy(() => import('@/pages/Projects'));

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <StaticTransition />
      <DesktopPet />
      <div className="min-h-screen overflow-x-hidden">
        <Navigation />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
