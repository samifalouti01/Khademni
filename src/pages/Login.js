import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error } = await supabase
            .from("user_data")
            .select("id, identifier, name")
            .eq("identifier", identifier)
            .eq("password", password);

        setLoading(false);

        if (error || data.length === 0) {
            setError("Invalid username or password");
        } else {
            const user = data[0];
            localStorage.setItem("user", JSON.stringify(user)); 
            navigate("/dashboard");
        }
    };

    return (
        <div className="login-container">
            <img src="KhademniLogo2.svg" alt="Logo" className="login-logo" />
            <form onSubmit={handleLogin} className="login-form">
                <h1 className="login-title">Login</h1>
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username"
                    className="login-input"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="login-input"
                    required
                />
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? <div className="spinner"></div> : "Login"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
