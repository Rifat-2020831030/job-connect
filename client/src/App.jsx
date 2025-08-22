import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Unsubscribe from "./pages/Unsubscribe";
import ScrollToSection from "./utils/ScrollToSection";

const App = () => {
  return (
    <Router>
      <ScrollToSection />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
};

export default App;
