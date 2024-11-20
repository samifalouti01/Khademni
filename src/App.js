import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Helpdesk from "./pages/Helpdesk";
import Boutique from "./pages/Boutique";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/boutique" element={<Boutique />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
