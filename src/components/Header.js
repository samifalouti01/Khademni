import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaList } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import LeftNavBar from "./LeftNavBar";
import './Header.css';

const Header = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const navRef = useRef(null); // Reference for LeftNavBar

    const toggleNav = () => {
        setIsNavOpen((prev) => !prev);
    };

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/");
        }, 2000);
    };

    // Close LeftNavBar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="header">
                <FaList className="menu-icon" onClick={toggleNav} />
                <img src="KhademniLogo1.svg" className="logo" alt="logo" />
                <button className="logout-button" onClick={handleLogout} disabled={loading}>
                    {loading ? (
                        <div className="spinner"></div>
                    ) : (
                        <><FiLogOut className="logout-icon" /> Logout</>
                    )}
                </button>
            </header>
            {isNavOpen && <LeftNavBar ref={navRef} />}
        </>
    );
};

export default Header;
