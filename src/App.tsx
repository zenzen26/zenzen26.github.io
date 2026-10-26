import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import PageLoader from '@/components/ui/PageLoader';
import StaticTransition from '@/components/ui/StaticTransition';

// Page-level code splitting: each page (and its heavy deps) is loaded on
// demand only when its route is visited.
const Home = lazy(() => import('@/pages/Home'));
const Projects = lazy(() => import('@/pages/Projects'));
// The pet is decoration: it loads (with gsap) once the page has settled.
const DesktopPet = lazy(() => import('@/components/ui/DesktopPet'));

const PET_DELAY_MS = 2500;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [showPet, setShowPet] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowPet(true), PET_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <StaticTransition />
      {showPet && (
        <Suspense fallback={null}>
          <DesktopPet />
        </Suspense>
      )}
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
