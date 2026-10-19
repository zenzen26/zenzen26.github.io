import { useEffect, useRef, useState } from 'react';
import './Hero.css';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        url?: string;
        'loading-anim-type'?: string;
      }, HTMLElement>;
    }
  }
}

const SPLINE_VIEWER_SRC = 'https://unpkg.com/@splinetool/viewer@1.12.70/build/spline-viewer.js';

// Load the heavy Spline web-component script once, on demand. Returns a promise
// that resolves when <spline-viewer> is registered.
let splineScriptPromise: Promise<void> | null = null;
function loadSplineViewer(): Promise<void> {
  if (splineScriptPromise) return splineScriptPromise;
  splineScriptPromise = new Promise<void>((resolve, reject) => {
    if (customElements.get('spline-viewer')) return resolve();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = SPLINE_VIEWER_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load spline-viewer'));
    document.head.appendChild(script);
  });
  return splineScriptPromise;
}

// Minimal loading placeholder: a soft, pulsing brand-colored orb shown while
// the Spline viewer script loads (and permanently if it fails). Zero network
// cost; the pulse is a pure CSS animation.
const SplinePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-amber/40 to-green/40 blur-2xl animate-pulse" />
  </div>
);

const SplineCrystal = () => (
  <spline-viewer
    url="https://prod.spline.design/FVsu1AvKPm62BE3J/scene.splinecode"
    style={{ width: '100%', height: '100%' }}
  />
);

// Eagerly loads the Spline viewer on mount so the 3D scene appears as soon as
// possible. A lightweight pulsing placeholder holds the space until the viewer
// script is registered, and stays permanently if the script fails to load.
const EagerSpline = () => {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSplineViewer()
      .then(() => { if (!cancelled) setReady(true); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {ready && !failed ? <SplineCrystal /> : <SplinePlaceholder />}
    </div>
  );
};

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered reveal of the hero content. The keyframe/animation classes
    // (animate-float / -pulse-rotate / -bounce-slow) live in Hero.css, so no
    // runtime <style> injection is needed here. Batch the initial write and
    // the reveal write into single rAF passes to avoid layout thrash.
    const el = contentRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];

    children.forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      child.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    });

    const raf = requestAnimationFrame(() => {
      children.forEach((child) => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="min-h-screen pt-20 lg:pt-0 flex items-center overflow-hidden">
      <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)] lg:min-h-screen">
          
          <div className="lg:col-span-7 xl:col-span-6 relative order-2 lg:order-1">
            <div className="animate-float relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center">
              <div className="spline-container absolute inset-0 lg:-left-12 xl:-left-24 flex items-center justify-center">
                <EagerSpline />
              </div>
              <div className="absolute top-10 right-10 w-20 h-20 bg-amber/20 rounded-full blur-xl animate-pulse pointer-events-none" />
              <div className="absolute bottom-20 left-10 w-16 h-16 bg-green/20 rounded-full blur-xl animate-pulse delay-700 pointer-events-none" />
            </div>
          </div>

          <div ref={contentRef} className="xl:pl-30 lg:col-span-5 xl:col-span-6 order-1 lg:order-2 hero-content">
            <div className="inline-block mb-6 animate-pulse-rotate">
              <div className="bg-green text-white b2 px-4 py-2 border-4 border-green border-dashed">
                OPEN TO WORK
              </div>
            </div>

            <h1 className="h1 leading-none mb-4 text-shadow-retro">
              ZEN<span className="text-amber">ZEN</span>
            </h1>

            <p className="b1 text-amber mb-6">
              Web Developer & Server Engineer
            </p>

            <p className="b1 text-black/80 max-w-md mb-8 leading-relaxed">
              Full-stack web development, server management, and AI workflow automation with n8n. I build and ship reliable systems end to end, combining technology, design, and creativity to deliver engaging digital experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-4 bg-red text-white b2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer"
              >
                <span className="relative z-10">View Projects</span>
                <div className="absolute inset-0 bg-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={() => document.querySelector('#footer')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-amber text-black b2 hover:bg-amber hover:text-black transition-all hover:-translate-y-1 hover:cursor-pointer"
              >
                Contact Me
              </button>
            </div>

            <div className="flex flex-wrap gap-2 b3">
              {['React', 'TypeScript', 'Docker', 'n8n', 'PHP'].map((tech) => (
                <span 
                  key={tech} 
                  className="px-3 py-1 bg-black/5 border border-black/10 hover:bg-amber/20 hover:border-amber transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}