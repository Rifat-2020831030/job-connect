import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Companies from "./pages/Companies";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Unsubscribe from "./pages/Unsubscribe";
import ComingSoon from "./pages/ComingSoon";
import ScrollToSection from "./utils/ScrollToSection";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ScrollToSection />
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:companyName" element={<Home />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/salary" element={<ComingSoon />} />
            <Route path="/experience" element={<ComingSoon />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
