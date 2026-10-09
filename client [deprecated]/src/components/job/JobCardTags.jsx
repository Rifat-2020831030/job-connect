const JobCardTags = ({ job, getJobTypeColor, getExperienceLevelColor }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-4">
        {job.job_type && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Job Type</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                job.job_type
              )}`}
            >
              {job.job_type}
            </span>
          </div>
        )}
        {job.experience_level && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              Experience Level
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(
                job.experience_level
              )}`}
            >
              {job.experience_level}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCardTags;
