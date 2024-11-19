import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa"; // Import the close icon
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Parrain.css";

const Parrain = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    parrain_id: "",
    name: "",
    identifier: "",
    password: "",
    phone: "",
    email: "",
    birthdate: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, parrain_id: user.id })); // Set parrain_id
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from("user_data").insert([formData]);
      if (error) {
        console.error("Error inserting data:", error);
      } else {
        console.log("Data inserted successfully:", data);
        alert("Parrainage réussi !");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="parrain" ref={ref}>
      <div className="parrain-header">
        <h2 className="parrain-title">Parrainer</h2>
        <button className="close-button" onClick={props.onClose}>
          <FaTimes size={24} />
        </button>
      </div>

      <form className="parrain-form" onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="parrain_id"
          value={formData.parrain_id}
          onChange={handleChange}
        />
        <label className="parrain-label">
          Nom et Prénom:
          <input
            type="text"
            name="name"
            className="parrain-input"
            value={formData.name}
            placeholder=""
            onChange={handleChange}
            required
          />
        </label>
        <label className="parrain-label">
          ID Numéro:
          <input
            type="text"
            name="identifier"
            className="parrain-input"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
        </label>
        <label className="parrain-label">
          Mot de Passe:
          <input
            type="password"
            name="password"
            className="parrain-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label className="parrain-label">
          Téléphone:
          <input
            type="text"
            name="phone"
            className="parrain-input"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label className="parrain-label">
          Email:
          <input
            type="email"
            name="email"
            className="parrain-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="parrain-label">
          Date de Naissance:
          <input
            type="date"
            name="birthdate"
            className="parrain-input"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </label>
        <button className="parrain-button" type="submit">
          Parrainer
        </button>
      </form>
    </div>
  );
});

export default Parrain;
