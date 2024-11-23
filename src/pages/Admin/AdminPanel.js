import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUsers, FiSettings, FiBarChart } from "react-icons/fi";
import { FaTasks, FaRegPlusSquare } from "react-icons/fa";
import Dashboard from "./Components/Dashboard"; 
import Order from "./Components/Order";
import Parrainage from "./Components/Parrainage";
import Post from "./Components/Post";
import "./AdminPanel.css";

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoading(true);
        try {
            // Simulate logout logic
            await new Promise((resolve) => setTimeout(resolve, 2000));
            navigate("/");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <Dashboard />; // Render the Dashboard component
            case "order":
                return <Order />;
            case "parrainage":
                return <Parrainage />;
            case "post":
                return <Post />;
            case "settings":
                return <h2>System Settings</h2>;
            default:
                return <h2>Welcome to the Admin Panel!</h2>;
        }
    };

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="sidebar">
                <h1 className="logo">AdminPanel</h1>
                <nav>
                    <button
                        className={`nav-button ${activeSection === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveSection("dashboard")}
                    >
                        <FiBarChart /> <span>Dashboard</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "users" ? "active" : ""}`}
                        onClick={() => setActiveSection("order")}
                    >
                        <FaTasks /> <span>Orders</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "analytics" ? "active" : ""}`}
                        onClick={() => setActiveSection("parrainage")}
                    >
                        <FiUsers style={{ fontSize: "40px"}} /> <span>Parrainage</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "settings" ? "active" : ""}`}
                        onClick={() => setActiveSection("post")}
                    >
                        <FaRegPlusSquare /> <span>Post</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "settings" ? "active" : ""}`}
                        onClick={() => setActiveSection("settings")}
                    >
                        <FiSettings /> <span>Settings</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main>
                <header className="admin-header">
                    <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
                    <button
                        className="logout-buttonn"
                        onClick={handleLogout}
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <div className="spinner" aria-hidden="true"></div>
                        ) : (
                            <>
                                <FiLogOut className="logout-icon" /> Logout
                            </>
                        )}
                    </button>
                </header>

                <div className="admin-content">{renderContent()}</div>
            </main>
        </div>
    );
};

export default AdminPanel;
