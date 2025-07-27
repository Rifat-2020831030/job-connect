const JobCard = ({ job }) => {
return (
    <div className="flex flex-col justify-start w-80 p-5 border rounded-lg shadow-lg bg-[#c9d9f0]">
        <img
            className="w-full h-[100px] object-cover rounded-lg bg-blue-100"
            src="https://www.dsinnovators.com/images/dsi_logo.svg"
            alt="Company logo"
        />
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{job.title}</h2>
            <p className="flex justify-between w-full gap-2 mt-2 text-sm">
                <span className="px-2 py-1 bg-yellow-300 rounded-lg">
                    {job.company}
                </span>
                <span className="px-2 py-1 bg-yellow-300 rounded-lg">
                    {job.location}
                </span>
            </p>
        </div>
        <div className="flex flex-col gap-1 mt-4 ml-4">
            <li>Salary: {job.salary}</li>
            <li>Vacancy: {job.vacancy}</li>
            <li>Deadline: {job.deadline}</li>
        </div>
        {/* to cover remaining space */}
        <span className="flex-1"></span>
        <div>
            <a 
                className="block w-full p-2 bg-purple-600 hover:bg-purple-800 cursor-pointer font-semibold text-white text-center no-underline rounded mt-3"
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={()=> console.log(`Applying for job: ${job.title}`)}
            >
                Apply Now
            </a>
        </div>
    </div>
);
};

export default JobCard;
