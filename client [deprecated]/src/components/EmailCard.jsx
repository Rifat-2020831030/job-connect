import axios from "axios";
import { useState } from "react";

import Loader from "../utils/Loader";
import Popup from "./PopUp";
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
        setAlertMessage(
          "This email is already registered. Please use a different email."
        );
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
    <>
      {loading && <Loader />}
      {showVerification && (
        <VerificationCard
          setEmail={setEmail}
          showVerification={showVerification}
          setShowVerification={setShowVerification}
          email={email}
          setAlertMessage={setAlertMessage}
          setAlertType={setAlertType}
          setShowAlert={setShowAlert}
        />
      )}
      {showAlert && (
        <>
          <Popup isOpen={showAlert} message={alertMessage} type={alertType} onClose={closeAlert} />
        </>
      )}

      <div className="max-w-2xl mx-auto mb-10 sm:mb-12 px-4">
        <form onSubmit={handleSubmittion} className="relative">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full sm:flex-1 px-4 sm:px-6 py-4 text-gray-700 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 rounded-xl sm:rounded-r-none transition-all duration-200"
              required
            />
            <button
              type="submit"
              className={`w-full sm:w-auto bg-[#2563eb] text-white font-semibold px-6 sm:px-8 py-4 rounded-xl sm:rounded-l-none transition-all duration-200`}
            >
              Get Job Alerts
            </button>
          </div>
        </form>
        <p className="text-sm text-gray-500 mt-3">
          Receive job updates the same day they're posted. No spam, ever.
        </p>
      </div>
    </>
  );
};

export default EmailCard;
