import { MapPin, Calendar, Award, Briefcase } from 'lucide-react';
import ModalOverlay from '@/components/ui/ModalOverlay';
import TechStack from '@/components/ui/TechStack';
import type { Experience } from '@/types';

interface ExperiencePopupProps {
  experience: Experience | null;
  onClose: () => void;
}

/** Splits a sentence-per-line CSV cell into bullet points. */
const bullets = (text: string) => text.split(/\.(?:\s+|$)/).filter((s) => s.trim());

export default function ExperiencePopup({ experience, onClose }: ExperiencePopupProps) {
  if (!experience) return null;

  return (
    <ModalOverlay title={`${experience.company}.doc`} onClose={onClose} widthClassName="max-w-2xl">
      <div className="crt p-6 sm:p-8 border-b-2 border-ink">
        <span className="b3 px-2 border-2 border-phosphor inline-block mb-3">{experience.type}</span>
        <h2 className="h3 mb-1">{experience.role}</h2>
        <p className="b1">@ {experience.company}</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap gap-4 b2 text-ink/60">
          <span className="flex items-center gap-1"><Calendar size={16} /> {experience.duration}</span>
          {experience.location && <span className="flex items-center gap-1"><MapPin size={16} /> {experience.location}</span>}
        </div>

        <div>
          <h3 className="h4 mb-2 flex items-center gap-2"><Briefcase size={18} /> Overview</h3>
          <p className="b1">{experience.detail_description || experience.description}</p>
        </div>

        {experience.responsibilities && (
          <div>
            <h3 className="h4 mb-2">Responsibilities</h3>
            <ul className="list-disc list-inside b1 space-y-1">
              {bullets(experience.responsibilities).map((r, i) => <li key={i}>{r.trim()}</li>)}
            </ul>
          </div>
        )}

        {experience.achievements && (
          <div>
            <h3 className="h4 mb-2 flex items-center gap-2"><Award size={18} /> Achievements</h3>
            <ul className="list-disc list-inside b1 space-y-1">
              {bullets(experience.achievements).map((a, i) => <li key={i}>{a.trim()}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h3 className="h4 mb-2">Tech Stack</h3>
          <TechStack stack={experience.tech_stack} />
        </div>
      </div>
    </ModalOverlay>
  );
}
