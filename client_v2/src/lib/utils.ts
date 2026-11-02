import { Experience, Salary } from "@/types/job";

export type SalaryInput = Salary | string | number | null | undefined;
export type ExperienceInput = Experience | string | number | null | undefined;

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "Unknown Time";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown Time";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 60) {
    return "JUST NOW";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}M Ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}H Ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}D Ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}W Ago`;
  } else {
    return `${diffInMonths}MO Ago`;
  }
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const trimmed = dateString.trim();
  if (/^not\s*specified$/i.test(trimmed) || /^unknown$/i.test(trimmed)) {
    return "No Deadline Set";
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatSalary(
  salary?: SalaryInput,
  salary_min?: number,
  salary_max?: number
): string {
  if (salary && typeof salary === "object") {
    if (salary.text_form && typeof salary.text_form === "string") {
      const text = salary.text_form.trim();
      if (/^not\s*specified$/i.test(text) || /^unknown$/i.test(text)) {
        return "Unknown Salary";
      }
      return text;
    }
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${
        salary.currency || "BDT"
      }/${salary.period || "month"}`;
    }
    if (salary.min) {
      return `From ${salary.min.toLocaleString()} ${salary.currency || "BDT"}/${
        salary.period || "month"
      }`;
    }
    if (salary.is_negotiable) return "Negotiable Salary";
  }
  if (typeof salary === "string") {
    const s = salary.trim();
    if (!s || /^not\s*specified$/i.test(s) || /^unknown$/i.test(s)) {
      return "Unknown Salary";
    }
    return s;
  }
  if (typeof salary === "number" && !isNaN(salary) && salary > 0) {
    return `৳${Math.round(salary / 1000)}k`;
  }
  if (salary_min && salary_max) {
    return `৳${Math.round(salary_min / 1000)}k - ৳${Math.round(
      salary_max / 1000
    )}k`;
  }
  if (salary_min) return `From ৳${Math.round(salary_min / 1000)}k`;
  if (salary_max) return `Up to ৳${Math.round(salary_max / 1000)}k`;
  return "Unknown Salary";
}

export function formatVacancy(
  vacancy: string | number | null | undefined
): string {
  if (
    typeof vacancy === "string" &&
    /^not\s*specified$/i.test(vacancy.trim())
  ) {
    return "Vacancy Unknown";
  }
  const vacancyNumber = Number(vacancy);

  if (vacancy == null || isNaN(vacancyNumber) || vacancyNumber < 1) {
    return "Vacancy Unknown";
  }

  return `${vacancyNumber} ${vacancyNumber === 1 ? "Vacancy" : "Vacancies"}`;
}

export function formatExp(experience?: ExperienceInput): string {
  if (experience && typeof experience === "object") {
    if (experience.text_form && typeof experience.text_form === "string") {
      const text = experience.text_form.trim();
      if (/^not\s*specified$/i.test(text) || /^unknown$/i.test(text)) {
        return "Experience Unknown";
      }
      return text;
    }
    if (experience.level && typeof experience.level === "string") {
      const lvl = experience.level.trim();
      if (/^not\s*specified$/i.test(lvl) || /^unknown$/i.test(lvl)) {
        return "Experience Unknown";
      }
      return lvl;
    }
  }
  if (typeof experience === "string") {
    const s = experience.trim();
    if (!s || /^not\s*specified$/i.test(s) || /^unknown$/i.test(s)) {
      return "Experience Unknown";
    }
    return s;
  }
  const experienceNumber = Number(experience);
  if (experience == null || isNaN(experienceNumber) || experienceNumber < 0) {
    return "Experience Unknown";
  }
  return `${experienceNumber} ${experienceNumber === 1 ? "yr" : "yrs"}`;
}

export function shouldRemindStatusUpdate(
  status: string,
  appliedDateString: string,
  deadlineString?: string | null
): boolean {
  if (status === "OFFER" || status === "REJECTED") return false;

  const now = new Date();

  const applied = new Date(appliedDateString);
  const daysSinceApplied = Math.floor(
    (now.getTime() - applied.getTime()) / (1000 * 3600 * 24)
  );

  let daysSinceDeadline = -1;
  if (deadlineString) {
    const deadline = new Date(deadlineString);
    daysSinceDeadline = Math.floor(
      (now.getTime() - deadline.getTime()) / (1000 * 3600 * 24)
    );
  }

  return daysSinceApplied >= 30 || daysSinceDeadline >= 30;
}
