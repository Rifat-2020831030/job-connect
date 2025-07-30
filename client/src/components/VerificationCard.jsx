import axios from "axios";
import { useState } from "react";

const VerificationCard = ({
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
      console.log("Verification response:", response);
      if (response.status === 200) {
        setShowVerification(false);
        setAlertMessage("Verification successful!");
        setAlertType("success");
        setShowAlert(true);
      } else {
        alert("Verification failed. Please check your code and try again.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setShowVerification(false);
      alert("Verification failed. Please try again later.");
    }
  };
return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto text-center">
            <p className="text-gray-600 mb-4">
                Please enter the verification code sent to your email.
            </p>
            <input
                type="text"
                placeholder="Enter verification code"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 w-full"
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
