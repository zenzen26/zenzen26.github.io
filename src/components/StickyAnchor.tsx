import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'hero', label: 'Back to Top' },
  { id: 'projects', label: 'Projects' },
  { id: 'industries', label: 'Industries' },
  { id: 'experience', label: 'Experience' },
  { id: 'footer', label: 'Contact' },
];

export default function StickyAnchor() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: element, offsetY: id === 'hero' ? 0 : 80 },
        ease: 'power2.inOut',
      });
    }
  };

  return (
    <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block pointer-events-none">
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            aria-label={section.label}
            className={`group pointer-events-auto cursor-pointer flex items-center justify-end gap-3 py-2 pl-6 transition-all duration-300 ${
              activeSection === section.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <span className="b3 transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-beige-light/70">
              {section.label}
            </span>
            <span className={`w-1 h-6 transition-all duration-300 ${
              activeSection === section.id ? 'bg-phosphor scale-y-125' : 'bg-grey'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}