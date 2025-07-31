import axios from "axios";
import { useState } from "react";

import VerificationCard from "./VerificationCard";

const EmailCard = () => {
  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // success or error
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

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
      if (response.data.status || response.status === 200) {
        setShowVerification(true);
      } else {
        setAlertMessage(
          response.data?.message || "Subscription failed. Please try again."
        );
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setLoading(false);
      
      // Handle 409 Conflict (email already exists)
      if (error.response && error.response.status === 409) {
        setAlertMessage("This email is already registered. Please use a different email.");
        setAlertType("error");
        setShowAlert(true);
      } else {
        setAlertMessage("An error occurred. Please try again later.");
        setAlertType("error");
        setShowAlert(true);
      }
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-400 py-10 z-10 relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
            <p className="text-lg font-semibold text-gray-800">
              Subscribing...
            </p>
          </div>
        </div>
      )}
      {showVerification && <VerificationCard setEmail={setEmail} setShowVerification={setShowVerification} email={email} setAlertMessage={setAlertMessage} setAlertType={setAlertType} setShowAlert={setShowAlert} />}
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
