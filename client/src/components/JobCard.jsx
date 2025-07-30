const JobCard = ({ job }) => {
  // Helper function to check if job is recent (within 3 days)
  const isRecent = () => {
    if (!job.timeStamp) return false;
    const jobDate = new Date(job.timeStamp);
    const currentDate = new Date();
    const diffTime = currentDate - jobDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays <= 5;
  };

  const deadline = new Date(job.deadline).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});;

  return (
    <div className="flex flex-col justify-start w-80 p-5 border rounded-xl shadow-lg bg-[#c9d9f0]">
      <div className="relative">
        <img
          className="w-full h-[100px] rounded-lg bg-[#74b2e2] bg-transparent object-contain"
          src={job.logo}
          alt="Company logo"
        />
        {isRecent() && (
          <span className="text-xs absolute top-4 left-4 px-2 py-1 bg-blue-500 text-white font-bold rounded-lg">
            NEW
          </span>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{job.title}</h2>
        <p className="flex justify-between w-full gap-2 mt-2 text-sm">
          <span className="px-2 py-1 bg-blue-300 text-blue-900 font-bold rounded-lg">
            {job.company}
          </span>
          <span className="px-2 py-1 bg-blue-300 text-blue-900 font-bold rounded-lg">
            {job.location}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-1 mt-4 ml-4">
        <li>Salary: {job.salary}</li>
        <li>Vacancy: {job.vacancy}</li>
        <li>Deadline: {deadline}</li>
      </div>
      {/* to cover remaining space */}
      <span className="flex-1"></span>
      <div>
        <a
          className="block w-full p-2 bg-[#1d1160] hover:bg-[#1d1160c6] cursor-pointer font-semibold text-white text-center no-underline rounded mt-3"
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => console.log(`Applying for job: ${job.title}`)}
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default JobCard;
