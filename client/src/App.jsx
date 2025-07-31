import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Unsubscribe from "./pages/Unsubscribe";
import Error from "./pages/Error";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/*" element={<Error />} />
      </Routes>
    </Router>
  );
};

export default App;
