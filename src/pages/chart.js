import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaCopy, FaUserFriends, FaCartPlus } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";
import "./Dashboard.css";
import DoughnutChart from "../components/DoughnutChart";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const Dashboard = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [perso, setPerso] = useState("");
  const [parainagePoints, setParainagePoints] = useState("");
  const [parainageUsers, setParainageUsers] = useState("");
  const [ppcg, setPpcg] = useState(0);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      fetchUserData(user.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("user_data")
      .select("id, identifier, name, perso, parainage_points, parainage_users, ppcg")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      setIdentifier(data.identifier);
      setName(data.name);
      setUserId(data.id);
      setPerso(data.perso);
      setParainagePoints(data.parainage_points);
      setParainageUsers(data.parainage_users);
      setPpcg(data.ppcg);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Text copied to clipboard!");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }).catch(err => {
      setMessage("Failed to copy text: " + err);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    });
  };

  const statusLabel = () => {
    if (ppcg >= 5000) return "CEO";
    if (ppcg >= 4000) return "Manager Senior";
    if (ppcg >= 3000) return "Manager";
    if (ppcg >= 2000) return "Manager Adjoint";
    if (ppcg >= 1000) return "Animateur";
    return "Animateur Adjoint";
  };
  

  const getDoughnutDataByLevel = () => {
    const levels = [
      { threshold: 1000, colors: ['#4caf50', '#d3d3d3'] },
      { threshold: 2000, colors: ['#2196f3', '#d3d3d3'] },
      { threshold: 3000, colors: ['#ff9800', '#d3d3d3'] },
      { threshold: 4000, colors: ['#e91e63', '#d3d3d3'] },
      { threshold: 5000, colors: ['#9c27b0', '#d3d3d3'] },
    ];
  
    const currentLevel = levels.find((level) => ppcg < level.threshold) || levels[levels.length - 1];
    const progress = Math.min(ppcg, currentLevel.threshold);
    const remaining = currentLevel.threshold - progress;
  
    return {
      labels: ["Progress", "Remaining"],
      datasets: [
        {
          data: [progress, remaining],
          backgroundColor: currentLevel.colors,
          borderColor: currentLevel.colors,
          borderWidth: 2,
        },
      ],
    };
  };
  

  const options = {
    animation: {
      duration: 0,
      easing: "easeInOutQuad",
      animateRotate: false,
      loop: false,
    },
    rotation: Math.PI,
    cutout: "70%",
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    responsive: true,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Header />
        <div className="float">
            <button><FaUserFriends /> Parrainer</button>
            <button><FaCartPlus /> Nouvelle Commande</button>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-card">
            <div className="card-image">
              <img src="user.jpg" alt="user" />
            </div>
            <h1>{name || "Loading..."}</h1>
            <h2 style={{ color: '#9A9A9A', fontWeight: 'medium' }}>{statusLabel()}</h2>
            <div className="copy-container">
              <p className="copy-text">{identifier || "Loading..."}</p>
              <FaCopy className="copy-icon" onClick={() => handleCopy(identifier)} />
            </div>
            {message && <p style={{ marginTop: '10px', fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>{message}</p>}
          </div>

          <div className="wrap">
            <div className="dashboard-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <h3>Perso:</h3><p>{perso || "Loading..."}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <h3>PPA:</h3><p>{parainagePoints || "Loading..."}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <h3>Nombre de parinage:</h3><p>{parainageUsers || "Loading..."}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                <h3>PCG:</h3><p>{ppcg || "Loading..."}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Chart</h2>
              <div className="chart-container"style={{ 
                    height: '300px', 
                    position: 'relative', 
                    zIndex: 1000 
                }}
                >
                 <DoughnutChart data={getDoughnutDataByLevel()} options={options} />
              </div>
              <h3>{statusLabel()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
