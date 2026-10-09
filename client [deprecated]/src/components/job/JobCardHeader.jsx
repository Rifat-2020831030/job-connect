const JobCardHeader = ({ job, isRecent, isUrgent }) => {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Job Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
              {job.title}
            </h3>
            <p className="text-lg font-semibold text-blue-600 mb-1">
              {job.company}
            </p>
            <div className="flex items-center text-gray-600 text-sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.location || "Location not specified"}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col items-end space-y-2">
          {isRecent() && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {isUrgent() && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              Closing Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCardHeader;
