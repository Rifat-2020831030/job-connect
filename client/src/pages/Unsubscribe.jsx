import axios from "axios";
import { useEffect, useState } from "react";

const Unsubscribe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const unsubscribeEmail = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/email/unsubscribe?id=${id}`
        );
        if (response.status !== 200) {
          setError(true);
          setErrorMessage(response.data.message);
          return;
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error unsubscribing:", error);
      }
    };
    unsubscribeEmail();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        setRedirecting(true);
        window.location.href = "/";
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        {loading ? (
          <p className="text-gray-700">Unsubscribing...</p>
        ) : error ? (
          <p className="text-red-700 text-lg">
            {errorMessage || "An error occurred while unsubscribing. Please try again later."}
          </p>
        ) : (
          <div>
            <p className="text-green-700 text-3xl font-bold mb-4">
              You have successfully unsubscribed from job alerts.
            </p>
            <p className="text-gray-700 mt-2">
              {redirecting
                ? "Redirecting to home page..."
                : "You will be redirected to the home page in 3 seconds."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
