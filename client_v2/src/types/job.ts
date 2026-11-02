export interface Salary {
  min: number | null;
  max: number | null;
  currency: string;
  period: "month" | "year" | "hour";
  is_negotiable: boolean;
  text_form: string;
}

export interface Experience {
  min_exp: number | null;
  max_exp: number | null;
  unit: string;
  level:
    | "Junior"
    | "Mid"
    | "Senior"
    | "Lead"
    | "Staff / Architect"
    | "Principal / Director"
    | "Not Specified";
  is_freshers_allowed: boolean;
  text_form: string;
}

export interface Requirements {
  education?: string[];
  required?: string[];
  preferred?: string[];
}

export interface JobDetail {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: string | Salary | null;
  salary_min?: number;
  salary_max?: number;
  experience?: string | number | Experience | null;
  experience_level?: string;
  intro?: string | null;
  responsibilities?: string[];
  requirements?: Requirements | null;
  skills?: string[];
  benefits?: string[];
  description?: string;
  vacancy?: string | number | null;
  deadline?: string | null;
  expires_at?: string | null;
  logo?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  job_type?: string | null;
  category?: string | null;
  url: string;
  first_seen?: string | null;
}
