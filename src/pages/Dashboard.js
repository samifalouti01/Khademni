import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaCopy, FaUserFriends, FaCartPlus } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./Dashboard.css";

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
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState("Distributeur");
  const [levelProgress, setLevelProgress] = useState(0);
  const [nextLevel, setNextLevel] = useState("");
  const [pointsToNextLevel, setPointsToNextLevel] = useState(0);

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

      const total = 
      Number(data.perso || 0) + 
      Number(data.parainage_points || 0) + 
      Number(data.ppcg || 0);

    setTotalPoints(total);
    calculateLevel(total);
  }
};

const calculateLevel = (points) => {
    let currentLevel = "Distributeur";
    let nextLevel = "Animateur Adjoint";
    let progress = 0;
    let pointsNeeded = 0;
  
    if (points >= 100 && points < 6250) {
      currentLevel = "Animateur Adjoint";
      nextLevel = "Animateur";
      progress = ((points - 100) / (6250 - 100)) * 100;
      pointsNeeded = 6250 - points;
    } else if (points >= 6250 && points < 18700) {
      currentLevel = "Animateur";
      nextLevel = "Manager Adjoint";
      progress = ((points - 6250) / (18700 - 6250)) * 100;
      pointsNeeded = 18700 - points;
    } else if (points >= 18700 && points < 30000) {
      currentLevel = "Manager Adjoint";
      nextLevel = "Manager";
      progress = ((points - 18700) / (30000 - 18700)) * 100;
      pointsNeeded = 30000 - points;
    } else if (points >= 30000) {
      currentLevel = "Manager";
      nextLevel = "Maximum Level Achieved";
      progress = 100;
      pointsNeeded = 0; // No points needed for the top level
    } else {
      progress = (points / 100) * 100;
      pointsNeeded = 100 - points; // Points needed to reach "Animateur Adjoint"
    }
  
    setLevel(currentLevel);
    setNextLevel(nextLevel);
    setLevelProgress(progress);
    setPointsToNextLevel(pointsNeeded);
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Header />
        <div className="float">
          <button><FaUserFriends /> Parrainer</button>
          <button><FaCartPlus /> Nouvelle Commande</button>
        </div>
        <div className="dashboard-main">
        <div className="column">
          <div className="dashboard-card">
            <div className="card-image">
              <img src="user.jpg" alt="user" />
            </div>
            <h1>{name || "Loading..."}</h1>
            <h2 style={{ color: '#9A9A9A', fontWeight: 'medium' }}>{level}</h2>
            <div className="copy-container">
              <p className="copy-text">{identifier || "Loading..."}</p>
              <FaCopy className="copy-icon" onClick={() => handleCopy(identifier)} />
            </div>
            {message && <p style={{ marginTop: '10px', fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>{message}</p>}
          </div>
          </div>

          <div className="wrap">
          <div className="dashboard-card">
          <div className="flex-container">
                <h3>Perso:</h3><p>{perso || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>PPA:</h3><p>{parainagePoints || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>Nombre de parinage:</h3><p>{parainageUsers || "Loading..."}</p>
              </div>
              <div className="flex-container">
                <h3>PCG:</h3><p>{ppcg || "Loading..."}</p>
              </div>
            </div>
            <div className="dashboard-card">
            <h2>
            Progress to Next Level: <span style={{ color: '#4caf50' }}>{nextLevel}</span>
            </h2>
                <div className="donut-container">
                    <CircularProgressbar
                    value={levelProgress}
                    text={`${levelProgress.toFixed(1)}%`}
                    styles={buildStyles({
                        textColor: "#4caf50",
                        pathColor: "#4caf50",
                        trailColor: "#d3d3d3",
                    })}
                    />
                </div>
                <h3>{level}</h3>
                <p>Total Points: {totalPoints}</p>
                <p>Points needed to reach <span style={{ color: '#4caf50' }}>{nextLevel}</span>: {pointsToNextLevel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
