export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  tech_stack: string;
  image_url: string;
  live_url: string;
  github_url: string;
  case_study_url?: string;
  featured: boolean;
  featured_size: 'small' | 'medium' | 'large' | 'full';
  color_tag: 'green' | 'amber' | 'red' | 'black';
  date: string;
  detail_description?: string;
  challenges?: string;
  solution?: string;
  outcome?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  tech_stack: string;
  color: 'green' | 'amber' | 'red' | 'black';
  type: string;
  featured: boolean;
  detail_description?: string;
  achievements?: string;
  responsibilities?: string;
  location?: string;
}
