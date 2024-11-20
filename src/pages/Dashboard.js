import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaCopy, FaUserFriends, FaCartPlus } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Parrain from "../components/Parrain";
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
    const [totalPoints, setTotalPoints] = useState(0);
    const [level, setLevel] = useState("Distributeur");
    const [levelProgress, setLevelProgress] = useState(0);
    const [nextLevel, setNextLevel] = useState("");
    const [pointsToNextLevel, setPointsToNextLevel] = useState(0);
    const [showParrain, setShowParrain] = useState(false); 
    const parrainModalRef = useRef(null);
    const [userImage, setUserImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
  
    const fetchUserData = useCallback(async (userId) => {
      const { data, error } = await supabase
        .from("user_data")
        .select("id, user_image, identifier, name, perso, parainage_points, parainage_users, ppcg")
        .eq("id", userId)
        .single();
  
      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setIdentifier(data.identifier);
        setName(data.name);
        setPerso(data.perso);
        setParainagePoints(data.parainage_points);
        setParainageUsers(data.parainage_users);
        setPpcg(data.ppcg);
        setUserImage(data.user_image);
        const total = Number(data.perso || 0) + Number(data.parainage_points || 0) + Number(data.ppcg || 0);
        setTotalPoints(total);
        calculateLevel(total);
      }
    }, []);

    console.log(userImage);
  
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.id) {
        fetchUserData(user.id);
      } else {
        navigate("/login");
      }
    }, [fetchUserData, navigate]);
  
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
        pointsNeeded = 0;
      } else {
        progress = (points / 100) * 100;
        pointsNeeded = 100 - points;
      }
  
      setLevel(currentLevel);
      setNextLevel(nextLevel);
      setLevelProgress(progress);
      setPointsToNextLevel(pointsNeeded);
    };
  
    const handleCopy = (text) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setMessage("Text copied to clipboard!");
          setTimeout(() => {
            setMessage("");
          }, 2000);
        })
        .catch((err) => {
          setMessage("Failed to copy text: " + err);
          setTimeout(() => {
            setMessage("");
          }, 2000);
        });
    };
  
    const handleClickOutside = (event) => {
      if (parrainModalRef.current && !parrainModalRef.current.contains(event.target)) {
        setShowParrain(false);
      }
    };
  
    useEffect(() => {
      if (showParrain) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [showParrain]);
  
    const openParrainModal = () => setShowParrain(true); 
    const closeParrainModal = () => setShowParrain(false);

    const handleImageUpload = async (file) => {
        setIsUploading(true);
        setMessage('Uploading...');
        try {
          const user = JSON.parse(localStorage.getItem("user"));
      
          if (!user || !user.id) {
            setMessage("User not logged in.");
            return;
          }
      
          console.log("Uploading file:", file);
      
          // Step 1: Clear the current image in user_data
          const { error: deleteError } = await supabase
            .from("user_data")
            .update({ user_image: null }) // Set the user_image to null
            .eq("id", user.id);
      
          if (deleteError) {
            console.error("Error deleting user image:", deleteError);
            setMessage("Failed to delete previous user image.");
            return;
          }
      
          // Step 2: Generate a unique filename
          const fileName = `${user.id}-${Date.now()}-${file.name}`;
          console.log("Uploading to Supabase Storage with filename:", fileName);
      
          // Step 3: Upload image to Supabase Storage
          const { data: storageData, error: storageError } = await supabase.storage
            .from("user_pic") // Ensure this matches the bucket name
            .upload(fileName, file);
      
          // Log the storage upload response
          if (storageError) {
            console.error("Error uploading file:", storageError);
            setMessage("Failed to upload image.");
            return;
          }
          console.log("File uploaded successfully:", storageData);
      
          // Step 4: Get public URL for the uploaded image
          const { data: publicURLData, error: publicURLError } = supabase.storage
            .from("user_pic")
            .getPublicUrl(fileName);
      
          // Log any errors for URL retrieval
          if (publicURLError) {
            console.error("Error getting public URL:", publicURLError);
            setMessage("Failed to get public URL.");
            return;
          }
      
          const newImageUrl = publicURLData.publicUrl;
          console.log("Public URL retrieved:", newImageUrl);
      
          // Step 5: Update the user's `user_image` in the database with the new image URL
          const { error: dbError } = await supabase
            .from("user_data")
            .update({ user_image: newImageUrl })
            .eq("id", user.id); // This ensures the update is for the correct user
      
          if (dbError) {
            console.error("Error updating user image in database:", dbError);
            setMessage("Failed to update image in database.");
            return;
          }
      
          // Step 6: Update the state and show success message
          setUserImage(newImageUrl);
          setMessage("Image updated successfully!");
        } catch (error) {
          console.error("Error handling image upload:", error);
          setMessage("Something went wrong.");
        }

        const uploadInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev < 100) {
                return prev + 10; // Simulate progress
              } else {
                clearInterval(uploadInterval);
                setMessage('Upload Complete'); // Display completion message
                setIsUploading(false); // Stop uploading
                return 100;
              }
            });
          }, 500);

          setTimeout(() => {
            setUserImage(URL.createObjectURL(file)); // Set image URL
          }, 3000);
    };
    
  
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <Header />
          <div className="float">
            <button onClick={openParrainModal}>
              <FaUserFriends /> Parrainer
            </button>
            <button onClick={() => navigate("/boutique")}>
              <FaCartPlus /> Nouvelle Commande
            </button>
          </div>
          <div className="dashboard-main">
            <div className="column">
              <div className="dashboard-card">
              <div onClick={() => document.getElementById('file-input').click()}>
              <div className="card-image">
              <img src={userImage || "Loading..."} alt="ْ" className="hidden-alt" />
                </div>
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        await handleImageUpload(file);
                    }
                    }}
                    style={{ display: "none" }}
                />

                {isUploading && (
                    <div>
                    <progress value={uploadProgress} max="100"></progress>
                    </div>
                )}
              </div>
                <h1>{name || "Loading..."}</h1>
                <h2 style={{ color: "#9A9A9A", fontWeight: "medium" }}>{level || "Loading..."}</h2>
                <div className="copy-container">
                  <p className="copy-text">{identifier || "Loading..."}</p>
                  <FaCopy className="copy-icon" onClick={() => handleCopy(identifier)} />
                </div>
                {message && (
                  <p style={{ marginTop: "10px", fontSize: "14px", color: "#28a745", fontWeight: "bold" }}>
                    {message}
                  </p>
                )}
              </div>
            </div>
            <div className="wrap">
              <div className="dashboard-card">
                <div className="flex-container">
                  <h3>Perso:</h3>
                  <p>{perso || "Loading..."}</p>
                </div>
                <div className="flex-container">
                  <h3>PPA:</h3>
                  <p>{parainagePoints || "Loading..."}</p>
                </div>
                <div className="flex-container">
                  <h3>Nombre de parrainage:</h3>
                  <p>{parainageUsers || "Loading..."}</p>
                </div>
                <div className="flex-container">
                  <h3>PCG:</h3>
                  <p>{ppcg || "Loading..."}</p>
                </div>
              </div>
              <div className="dashboard-card">
                <h2>
                  Progress to Next Level: <span style={{ color: "#4caf50" }}>{nextLevel}</span>
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
                <p>
                  Points needed to reach <span style={{ color: "#4caf50" }}>{nextLevel}</span>:{" "}
                  {pointsToNextLevel}
                </p>
              </div>
            </div>
          </div>
        </div>
        {showParrain && <Parrain ref={null} onClose={closeParrainModal} />}
      </div>
    );
  };
  

export default Dashboard;
