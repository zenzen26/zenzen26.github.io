import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '#footer' },
];

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Classic Mac menu bar: logo, menu items, live clock. */
export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(formatTime);
  const location = useLocation();

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (link: (typeof navLinks)[number]) =>
    link.name === 'Contact' ? location.hash === '#footer' : location.pathname === link.href;

  const itemClass = (active: boolean) =>
    `font-pixel b2 px-3 py-1 cursor-pointer ${active ? 'bg-ink text-beige-light' : 'hover:bg-ink hover:text-beige-light'}`;

  const renderLink = (link: (typeof navLinks)[number], onNavigate?: () => void) =>
    link.name === 'Contact' ? (
      <a key={link.name} href="#footer" onClick={handleContactClick} className={itemClass(isActive(link))}>
        {link.name}
      </a>
    ) : (
      <Link key={link.name} to={link.href} onClick={onNavigate} className={itemClass(isActive(link))}>
        {link.name}
      </Link>
    );

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-beige-light text-ink border-b-2 border-ink shadow-[0_2px_0_var(--color-ink)]">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 grid grid-cols-[1fr_auto_1fr] items-center h-12">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 pr-3">
            <img src="/favicon.png" alt="" className="size-9 object-contain" />
            <span className="font-pixel text-xl">ZENZEN</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center">{navLinks.map((link) => renderLink(link))}</div>

        <div className="col-start-3 flex items-center justify-end gap-3">
          <span className="b2 hidden sm:inline">{time}</span>
          <button
            className="lg:hidden p-1 cursor-pointer"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-ink bg-beige-light flex flex-col p-2">
          {navLinks.map((link) => renderLink(link, () => setIsMobileMenuOpen(false)))}
        </div>
      )}
    </nav>
  );
}
