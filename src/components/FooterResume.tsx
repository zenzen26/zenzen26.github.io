import { Mail, Phone, MapPin, Github, Linkedin, LayoutDashboard } from 'lucide-react';
import FloppyIcon from '@/components/ui/FloppyIcon';
import PixelCat from '@/components/ui/PixelCat';
import MacWindow from '@/components/ui/MacWindow';

const resumes = [
  { name: 'All', tone: 'ink', focus: 'All in One', file: '/resumes/Resume All - Zi En Tham.pdf' },
  { name: 'Web', tone: 'moss', focus: 'React/FrontEnd', file: '/resumes/Resume Web - Zi En Tham.pdf' },
  { name: 'Data/AI', tone: 'forest', focus: 'ML/Dashboard', file: '/resumes/Resume DataAI - Zi En Tham.pdf' },
] as const;

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/zenzen26' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/zi-en-tham-605a40161/' },
  { icon: LayoutDashboard, label: 'Tableau', href: 'https://public.tableau.com/app/profile/zenzen26/vizzes' },
];

export default function FooterResume() {
  const handleDownload = (file: string, name: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = `ZiEn_Tham_${name}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer id="footer" className="bg-black text-phosphor py-16 sm:py-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-12">
          <div>
            <h2 className="h2 mb-6">&gt; Coffee Chat?<span className="cursor-blink">_</span></h2>

            <div className="space-y-3 b1 mb-8">
              <a href="mailto:thamzien@gmail.com" className="flex items-center gap-3 hover:text-white">
                <Mail size={20} /> thamzien@gmail.com
              </a>
              <a href="tel:+61450190503" className="flex items-center gap-3 hover:text-white">
                <Phone size={20} /> +61 450 190 503
              </a>
              <div className="flex items-center gap-3 opacity-70"><MapPin size={20} /> Sydney, NSW</div>
            </div>

            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="size-12 border-2 border-phosphor flex items-center justify-center hover:bg-phosphor hover:text-forest transition-colors"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <MacWindow title="Resume Hub" className="text-ink" bodyClassName="p-5 sm:p-6">
            <p className="b3 text-ink/60 mb-4">Click a disk to download.</p>
            <div className="grid grid-cols-3 gap-3">
              {resumes.map((resume) => (
                <FloppyIcon
                  key={resume.name}
                  label={resume.name}
                  caption={resume.focus}
                  tone={resume.tone}
                  onClick={() => handleDownload(resume.file, resume.name)}
                />
              ))}
            </div>
          </MacWindow>
        </div>

        <div className="border-t-2 border-phosphor/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PixelCat scale={3} className="animate-pixel-bob" />
            <p className="h4">ZENZEN</p>
          </div>
          <p className="b3 opacity-60">© {new Date().getFullYear()} All rights reserved. ฅ^•ﻌ•^ฅ</p>
        </div>
      </div>
    </footer>
  );
}
