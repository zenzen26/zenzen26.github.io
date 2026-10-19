import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import './Navigation.css';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '#footer' }, // Changed to hash only
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const footer = document.getElementById('footer');
    if (footer) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: footer, offsetY: 0 },
        ease: 'power2.inOut',
      });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-paper/95 backdrop-blur-sm shadow-sm' : 'bg-paper'
      } paper-texture`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link 
              to="/" 
              className="font-permanent-marker text-2xl sm:text-3xl md:text-4xl text-black transform -rotate-2 hover:rotate-0 transition-transform duration-300 flex items-center gap-2"
            >
              <img src="/favicon.png" alt="ZENZEN" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
              <span>ZENZEN</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                link.name === 'Contact' ? (
                  <a
                    key={link.name}
                    href="#footer"
                    onClick={handleContactClick}
                    className={`relative px-4 py-2 font-share-tech text-sm xl:text-base transition-all duration-300 transform cursor-pointer ${
                      location.hash === '#footer'
                        ? 'bg-amber text-black -translate-y-1 shadow-md' 
                        : 'hover:-translate-y-0.5 hover:bg-paper-dark'
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-4 py-2 font-share-tech text-sm xl:text-base transition-all duration-300 transform ${
                      location.pathname === link.href
                        ? 'bg-amber text-black -translate-y-1 shadow-md' 
                        : 'hover:-translate-y-0.5 hover:bg-paper-dark'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            <button
              className="lg:hidden p-2 text-black hover:text-amber transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-paper z-[60] transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 pb-20">
          {navLinks.map((link) => (
            link.name === 'Contact' ? (
              <a
                key={link.name}
                href="#footer"
                onClick={handleContactClick}
                className="font-permanent-marker text-3xl sm:text-4xl text-black hover:text-amber transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-permanent-marker text-3xl sm:text-4xl text-black hover:text-amber transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-[55] cursor-pointer"
          style={{ top: '64px' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}