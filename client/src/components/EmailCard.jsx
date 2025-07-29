import axios from "axios";
import { useState } from "react";

const EmailCard = () => {
  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success or error
  const [loading, setLoading] = useState(false);

  const handleSubmittion = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      // Get IP address using a public API
      let ipAddress = "unknown";
      let latlong = "unknown";
      let country = "unknown";
      try {
        const ipResponse = await axios.get(
          "https://free.freeipapi.com/api/json"
        );
        ipAddress = ipResponse.data.ipAddress;
        latlong = ipResponse.data.latitude + "," + ipResponse.data.longitude;
        country = ipResponse.data.countryName;
      } catch (ipError) {
        console.error("Failed to get IP address:", ipError);
      }

      // Send both email and IP address to backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/email/subscribe`,
        { email, ipAddress, latlong, country }
      );

      setLoading(false);
      if (response.status === 200) {
        setAlertMessage(response.data.message || "Subscription successful!");
        setAlertType("success");
        setShowAlert(true);
        setEmail("");
      } else {
        setAlertMessage(
          response.data.message || "Subscription failed. Please try again."
        );
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("An error occurred. Please try again later.");
      setAlertType("error");
      setShowAlert(true);
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-10 z-10 relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
            <p className="text-lg font-semibold text-gray-800">
              Subscribing...
            </p>
          </div>
        </div>
      )}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center ${
              alertType === "success"
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
            }`}
          >
            <p
              className={`text-lg font-semibold ${
                alertType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {alertMessage}
            </p>
            <button
              onClick={closeAlert}
              className="mt-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
          <div
            className={`bg-white rounded-xl shadow-2xl max-w-md mx-auto w-full transform transition-all duration-300 ease-in-out ${
              alertType === "success"
                ? "border-b-4 border-green-500"
                : "border-b-4 border-red-500"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                {alertType === "success" ? (
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </div>
                )}
                <h3
                  className={`text-lg font-bold ${
                    alertType === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {alertType === "success" ? "Success" : "Error"}
                </h3>
              </div>
              <p className="text-gray-700 mb-5">{alertMessage}</p>
              <div className="text-right">
                <button
                  onClick={closeAlert}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Job Alerts
            </h2>
            <p className="text-lg text-white">
              Subscribe to our newsletter for the latest job openings.
            </p>
          </div>
          <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form
                className="flex flex-col space-y-3"
                onSubmit={handleSubmittion}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-md"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
