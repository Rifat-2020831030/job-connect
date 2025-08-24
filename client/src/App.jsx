import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Companies from "./pages/Companies";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Unsubscribe from "./pages/Unsubscribe";
import ScrollToSection from "./utils/ScrollToSection";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <Router>
      <ScrollToSection />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:companyName" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
