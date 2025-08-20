import { CurrencyDollarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const JobCardDetails = ({ job, formatSalary, formatDeadline, isUrgent }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100">
      {/* Salary and Positions Row */}
      <div className="flex items-center justify-between mb-4 p-4 rounded-xl">
        <div className="flex justify-between items-center space-x-6">
          {/* Salary */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <CurrencyDollarIcon />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Salary</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>
          </div>

          {/* Positions */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <UserGroupIcon />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Positions</p>
              <p className="text-sm font-semibold text-gray-900">
                {job.vacancy === -1 ||
                job.vacancy === null ||
                job.vacancy === undefined
                  ? "Not Specified"
                  : `${job.vacancy} ${
                      parseInt(job.vacancy || 1) > 1 ? "positions" : "position"
                    }`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Experience and Deadline Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium">Experience</p>
          <p className="text-sm font-semibold text-gray-900">
            {job.experience === null ||
            job.experience === undefined ||
            job.experience === -1
              ? "Not Specified"
              : job.experience+ " Years"}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${
            isUrgent() ? "bg-green-100" : "bg-green-100"
          }`}
        >
          <p
            className={`text-xs font-medium ${
              isUrgent() ? "text-red-600" : "text-gray-500"
            }`}
          >
            Deadline
          </p>
          <p
            className={`text-sm font-semibold ${
              isUrgent() ? "text-red-700" : "text-gray-900"
            }`}
          >
            {formatDeadline(job.deadline)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobCardDetails;
