import errorimage from "../assets/404.webm";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <video
        src={errorimage}
        autoPlay
        loop
        muted
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      <h1 className="text-4xl font-bold text-gray-800 mt-8">Page Not Found</h1>
      <p className="text-gray-600 mt-4">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default Error;
