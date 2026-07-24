import { API_BASE_URL } from "@/lib/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export const handleApplyClick = ({ url, _id }) => {
  if (url && url !== "#") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    toast.error("No application URL provided for this job.");
  }
  if (_id && process.env.NODE_ENV !== "development") {
    fetch(`${API_BASE_URL}/stat/jobs/clicks?jobID=${_id}`).catch((error) => {
      logger.error({ error }, "Failed to register job click stat");
    });
  }
};
