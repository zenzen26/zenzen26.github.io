import { Mail, Phone, MapPin, Github, Linkedin, LayoutDashboard, Download, PawPrint } from 'lucide-react';

const resumes = [
  { name: 'All', color: 'black', focus: 'All in One', file: '/resumes/Resume All - Zi En Tham.pdf' },
  { name: 'Web', color: 'green', focus: 'React/FrontEnd', file: '/resumes/Resume Web - Zi En Tham.pdf' },
  { name: 'Data/AI', color: 'amber', focus: 'ML/Dashboard', file: '/resumes/Resume DataAI - Zi En Tham.pdf' },
];

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/zenzen26' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/zi-en-tham-605a40161/' },
  { icon: LayoutDashboard, label: 'Tableau', href: 'https://public.tableau.com/app/profile/zenzen26/vizzes' },
];

export default function FooterResume() {
  const colorMap = {
    green: 'bg-green',
    amber: 'bg-amber',
    red: 'bg-red',
    black: 'bg-black',
  };

  const handleDownload = (file: string, name: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = `ZiEn_Tham_${name}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer id="footer" className="bg-black text-white py-16 sm:py-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 4xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          
          <div>
            <div className="mb-8">
              <h2 className="h2 text-amber flex items-center gap-3">
                <PawPrint size={36} /> Coffee Chat?
              </h2>
            </div>
            
            <div className="space-y-4 b1 mb-8">
              <a href="mailto:thamzien@gmail.com" className="flex items-center gap-3 hover:text-amber transition-colors">
                <Mail size={20} /> thamzien@gmail.com
              </a>
              <a href="tel:+61450190503" className="flex items-center gap-3 hover:text-amber transition-colors">
                <Phone size={20} /> +61 450 190 503
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin size={20} /> Sydney, NSW
              </div>
            </div>

            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-white/20 flex items-center justify-center hover:bg-amber hover:border-amber hover:text-black transition-all"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex lg:justify-start justify-end">
              <h3 className="h3">Resume Hub</h3>
            </div>
            
            {/* Clean horizontal layout */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {resumes.map((resume) => (
                <button
                  key={resume.name}
                  onClick={() => handleDownload(resume.file, resume.name)}
                  className={`${colorMap[resume.color as keyof typeof colorMap]} p-2 sm:p-4 border-2 border-white/10 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group text-right overflow-hidden`}
                >
                  <div className="aspect-[3/4] mb-2 sm:mb-3 bg-white/10 flex items-center justify-center border border-dashed border-current">
                    <Download size={16} className="sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="h4 mb-0.5 sm:mb-1 text-xs sm:text-sm truncate">{resume.name}</h4>
                  <p className="b3 opacity-70 text-[10px] sm:text-xs leading-tight line-clamp-2">{resume.focus}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="h4 text-amber">ZENZEN <span className="text-white/60">ฅ^•ﻌ•^ฅ</span></p>
          <p className="b3 text-white/40">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}