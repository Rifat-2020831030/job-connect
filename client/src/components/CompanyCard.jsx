import {
  Briefcase,
  Building2,
  Calendar,
  Globe,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import {useNavigate} from "react-router-dom";

const CompanyCard = ({ company }) => {
  const {
    _id,
    name,
    category,
    hq_location,
    office_locations = [],
    website,
    current_open_jobs,
    total_listed_jobs,
    monthly_job_posting_avg,
    establishment_date,
    description,
  } = company;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <Building2
                className="w-8 h-8 text-gray-400"
                style={{ display: "block" }}
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {name}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    {category}
                  </span>
                  {establishment_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Est. {formatDate(establishment_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Location & Website */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          {hq_location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {hq_location.length > 15 ? (
                <span className="truncate cursor-help" title={hq_location}>
                  {hq_location.substring(0, 15)}...
                </span>
              ) : (
                hq_location
              )}
            </span>
          )}
          {office_locations.length > 0 && (
            <span className="text-xs">
              +{office_locations.length} more location
              {office_locations.length !== 1 ? "s" : ""}
            </span>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-3 h-3" />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Job Statistics Section */}
      <div className="border-t border-gray-100 bg-gray-50 p-6 pt-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Current Open Jobs */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {current_open_jobs || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Open Jobs</div>
          </div>

          {/* Total Listed Jobs */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {total_listed_jobs || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Jobs</div>
          </div>

          {/* Monthly Average */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {monthly_job_posting_avg
                ? monthly_job_posting_avg.toFixed(1)
                : "0.0"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Monthly Avg</div>
          </div>
        </div>

        {/* View Open Jobs */}
        {current_open_jobs > 0 ? (
          <button
          onClick={() => navigate(`/companies/${name}/jobs`)}
          className="mt-4 text-center bg-purple-600 hover:bg-purple-700 text-white transition-colors px-5 py-2 w-full rounded-md"
        >
          View Open Jobs
        </button>
        ): (
          <button
            disabled
            className="mt-4 text-center bg-gray-300 text-gray-500 px-5 py-2 w-full rounded-md cursor-not-allowed"
          >
            No Open Jobs
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
