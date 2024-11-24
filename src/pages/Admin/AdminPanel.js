import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUsers, FiBarChart } from "react-icons/fi";
import { FaTasks, FaRegPlusSquare, FaEdit, FaQuestionCircle } from "react-icons/fa";
import Dashboard from "./Components/Dashboard"; 
import Order from "./Components/Order";
import Parrainage from "./Components/Parrainage";
import Post from "./Components/Post";
import Users from "./Components/Users";
import ManagePost from "./Components/ManagePosts";
import Help from "./Components/Help";
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
            case "users":
                return <Users />;
            case "post":
                return <Post />;
            case "manage-post":
                return <ManagePost />;
            case "help":
                return <Help />;
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
                        className={`nav-button ${activeSection === "order" ? "active" : ""}`}
                        onClick={() => setActiveSection("order")}
                    >
                        <FaTasks /> <span>Orders</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "parrainage" ? "active" : ""}`}
                        onClick={() => setActiveSection("parrainage")}
                    >
                        <FiUsers /> <span>Parrainage</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "users" ? "active" : ""}`}
                        onClick={() => setActiveSection("users")}
                    >
                        <FiUsers /> <span>Users</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "post" ? "active" : ""}`}
                        onClick={() => setActiveSection("post")}
                    >
                        <FaRegPlusSquare /> <span>Post</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "manage-post" ? "active" : ""}`}
                        onClick={() => setActiveSection("manage-post")}
                    >
                        <FaEdit /> <span>Manage Post</span>
                    </button>
                    <button
                        className={`nav-button ${activeSection === "help" ? "active" : ""}`}
                        onClick={() => setActiveSection("help")}
                    >
                        <FaQuestionCircle /> <span>HelpDesk</span>
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
