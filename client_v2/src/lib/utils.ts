export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "UNKNOWN";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "UNKNOWN";
  
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
    return `${diffInMinutes}M AGO`;
  } else if (diffInHours < 24) {
    return `${diffInHours}H AGO`;
  } else if (diffInDays < 7) {
    return `${diffInDays}D AGO`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}W AGO`;
  } else {
    return `${diffInMonths}MO AGO`;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatSalary(salary?: string, salary_min?: number, salary_max?: number): string {
  if (salary) return salary;
  if (salary_min && salary_max) {
    return `$${Math.round(salary_min / 1000)}k - $${Math.round(salary_max / 1000)}k`;
  }
  if (salary_min) return `From $${Math.round(salary_min / 1000)}k`;
  if (salary_max) return `Up to $${Math.round(salary_max / 1000)}k`;
  return "Not Specified";
}
