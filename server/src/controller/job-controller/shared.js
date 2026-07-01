export const activeJobsFilter = () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return {
    $or: [
      { deadline: { $ne: null, $gte: new Date().toISOString() } },
      { deadline: null, first_seen: { $gte: thirtyDaysAgo.toISOString() } },
    ],
  };
};

export const expiredJobsFilter = () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return {
    $nor: [
      { deadline: { $ne: null, $gte: new Date().toISOString() } },
      { deadline: null, first_seen: { $gte: thirtyDaysAgo.toISOString() } },
    ],
  };
};

export const hasDeadlineFilter = () => ({
  deadline: { $ne: null, $gte: new Date().toISOString() },
});

export const LIST_PROJECTION = {
  title: 1,
  company: 1,
  logo: 1,
  location: 1,
  salary: 1,
  salary_min: 1,
  salary_max: 1,
  experience: 1,
  experience_level: 1,
  job_type: 1,
  skills: 1,
  vacancy: 1,
  deadline: 1,
  first_seen: 1,
  category: 1,
  url: 1,
};

export const DETAIL_PROJECTION = {
  title: 1,
  company: 1,
  logo: 1,
  location: 1,
  salary: 1,
  salary_min: 1,
  salary_max: 1,
  experience: 1,
  experience_level: 1,
  job_type: 1,
  skills: 1,
  benefits: 1,
  vacancy: 1,
  deadline: 1,
  first_seen: 1,
  url: 1,
  category: 1,
  industry: 1,
};

export const VALID_CATEGORIES = new Set([
  "web",
  "ai/ml",
  "data science",
  "devops",
  "mobile",
  "security",
  "design",
  "PM",
  "other",
]);
export const VALID_EXPERIENCE_LEVELS = new Set([
  "Junior",
  "Mid",
  "Senior",
  "Not Specified",
]);
export const VALID_JOB_TYPES = new Set([
  "Remote",
  "Onsite",
  "Hybrid",
  "Not Specified",
]);
export const VALID_SORTS = new Set(["recent", "salary_high"]);

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pickUniqueByCompany(jobs, n) {
  const seen = new Set();
  const result = [];
  for (const job of jobs) {
    const key = (job.company || "").trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(job);
    }
    if (result.length >= n) break;
  }
  return result;
}
