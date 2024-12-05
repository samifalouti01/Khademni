import React from "react";
import { FaTachometerAlt, FaQuestionCircle, FaHistory, FaUsers, FaMoneyBill, FaProjectDiagram, FaCog, FaFileAlt, FaCreativeCommonsSampling } from "react-icons/fa";
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
        <button className="nav-item" onClick={() => navigate("/historique")}>
          <FaHistory className="nav-icon" />
          Order Historique
        </button>
        <button className="nav-item" onClick={() => navigate("/mon-equipe")}>
          <FaUsers className="nav-icon" />
          Mon Équipe
        </button>
        <button className="nav-item" onClick={() => navigate("/payments")}>
          <FaMoneyBill className="nav-icon" />
          Paiment
        </button>
        <button className="nav-item" onClick={() => navigate("/catalogue")}>
          <FaProjectDiagram className="nav-icon" />
          Catalogue
        </button>
        <button className="nav-item" onClick={() => navigate("/settings")}>
          <FaCog className="nav-icon" />
          Settings
        </button>
        <button className="nav-item" onClick={() => navigate("/presentation")}>
          <FaFileAlt className="nav-icon" />
          Presentation
        </button>
        <button className="nav-item" onClick={() => navigate("/creative")}>
          <FaCreativeCommonsSampling className="nav-icon" />
          Creatifs
        </button>
      </nav>
    </div>
  );
});

export default LeftNavBar;