import axios from "axios";
import { useState } from "react";

const VerificationCard = ({
  setEmail,
  setShowVerification,
  email,
  setAlertType,
  setAlertMessage,
  setShowAlert,
}) => {
  const [code, setCode] = useState("");
  const handleVerification = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/email/verify-code`,
        { email, code }
      );
      if (response.status === 200 || response.data.status) {
        setEmail("");
        setShowVerification(false);
        setAlertMessage("Verification successful!");
        setAlertType("success");
        setShowAlert(true);
        return;
      }
      alert(
        response.data?.message ||
          "Verification failed. Please check your code and try again."
      );
      setShowVerification(true);
    } catch (error) {
      console.error("Verification failed:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please try again later.";
      setAlertMessage(errorMessage);
      setAlertType("error");
      setShowAlert(true);
      // Keep the verification modal open so can try again
      setShowVerification(true);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
        <p className="text-gray-600 mb-4 text-lg">
          Please enter the verification code sent to your email.
        </p>
        <p className="text-red-400 text-sm mb-4">Check your spam folder as well</p>
        <input
          type="text"
          placeholder="Enter verification code"
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 w-1/2 min-w-fit"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleVerification}
            className="py-2 px-4 bg-violet-400 hover:bg-violet-500 text-white font-semibold rounded"
          >
            Verify
          </button>
          <button
            onClick={() => setShowVerification(false)}
            className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCard;
