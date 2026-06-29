import { z } from "zod";

// Shared enums
export const VALID_CATEGORIES = [
  "web",
  "ai/ml",
  "data science",
  "devops",
  "mobile",
  "security",
  "design",
  "PM",
  "other",
];
export const VALID_WORK_MODELS = ["Remote", "Onsite", "Hybrid"];
export const VALID_ALERT_TIMINGS = ["Morning", "Evening", "Night"];
export const VALID_EXPERIENCE_LEVELS = [
  "Junior",
  "Mid",
  "Senior",
  "Not Specified",
];

// Helper: validates a 24-char hex MongoDB ObjectId string
const objectId = (fieldName = "ID") =>
  z
    .string()
    .regex(/^[a-f\d]{24}$/i, `Invalid ${fieldName} format`);

// Helper: validates a comma-separated query param where each value must be in the enum list.
// Unknown values are rejected outright (400).
const commaSeparatedEnum = (validValues, fieldName) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return val
          .split(",")
          .map((v) => v.trim())
          .every((v) => validValues.includes(v));
      },
      {
        message: `${fieldName} must be one of: ${validValues.join(", ")}`,
      }
    );

// --- Auth Validators ---
export const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    ipAddress: z.string().optional().nullable(),
    latlong: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().min(1, "Verification code is required"),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const setPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().min(1, "Reset code is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

// --- Email Validators ---
export const subscribeEmailSchema = subscribeSchema;

export const unsubscribeEmailSchema = z.object({
  query: z.object({
    id: objectId("ID"),
  }),
});

export const verifyCodeSchema = verifyOtpSchema;

// --- User Validators ---
export const getPreferencesSchema = z.object({
  params: z.object({
    id: objectId("User ID"),
  }),
});

export const savePreferencesSchema = z.object({
  params: z.object({
    id: objectId("User ID"),
  }),
  body: z.object({
    categories: z
      .array(z.enum(VALID_CATEGORIES))
      .optional()
      .default([]),
    workModel: z
      .array(z.enum(VALID_WORK_MODELS))
      .optional()
      .default([]),
    alertTiming: z.enum(VALID_ALERT_TIMINGS).optional().nullable(),
  }),
});

export const getSavedJobsSchema = getPreferencesSchema;

export const saveJobSchema = z.object({
  params: z.object({
    id: objectId("User ID"),
  }),
  body: z.object({
    jobId: objectId("Job ID"),
  }),
});

export const removeSavedJobSchema = z.object({
  params: z.object({
    id: objectId("User ID"),
    jobId: objectId("Job ID"),
  }),
});

// --- Job Validators ---
export const getJobsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(parseInt(val, 10)), "Page must be a number"),
    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(parseInt(val, 10)), "Limit must be a number"),
    category: commaSeparatedEnum(VALID_CATEGORIES, "category"),
    experience_level: commaSeparatedEnum(VALID_EXPERIENCE_LEVELS, "experience_level"),
    job_type: commaSeparatedEnum(VALID_WORK_MODELS, "job_type"),
    company: z.string().optional(),
    salary_min: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(parseInt(val, 10)), "Salary min must be a number"),
    salary_max: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(parseInt(val, 10)), "Salary max must be a number"),
    sort: z.enum(["recent", "salary_high"]).optional(),
    q: z.string().optional(),
  }),
});

export const getJobByIdSchema = z.object({
  params: z.object({
    id: objectId("Job ID"),
  }),
});
