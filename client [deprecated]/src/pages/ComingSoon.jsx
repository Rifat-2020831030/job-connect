import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-grow min-h-[calc(100vh-16rem)] px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6 max-w-lg w-full">
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Under Construction
        </h1>
        <p className="text-base text-gray-500">
          Working to develop the feature. Check back soon updates!
        </p>
        <div className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;