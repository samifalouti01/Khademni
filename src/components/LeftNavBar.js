import React from "react";
import { FaTachometerAlt, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./LeftNavBar.css";

const LeftNavBar = React.forwardRef((props, ref) => {
  const navigate = useNavigate();

  return (
    <div className="left-navbar" ref={ref}>
      <nav className="nav-menu">
        <button className="nav-item" onClick={() => navigate("/dashboard")}>
          <FaTachometerAlt className="nav-icon" />
          Dashboard
        </button>
        <button className="nav-item" onClick={() => navigate("/helpdesk")}>
          <FaQuestionCircle className="nav-icon" />
          Helpdesk
        </button>
      </nav>
    </div>
  );
});

export default LeftNavBar;