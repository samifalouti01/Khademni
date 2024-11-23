import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
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
    card_recto: "",
    card_verso: "",
  });
  const [cardRectoFile, setCardRectoFile] = useState(null);
  const [cardVersoFile, setCardVersoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      setFormData((prev) => ({ ...prev, parrain_id: user.id }));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "recto") setCardRectoFile(file);
    if (type === "verso") setCardVersoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      let cardRectoUrl = "";
      let cardVersoUrl = "";
  
      if (cardRectoFile) {
        const { data: rectoData, error: rectoError } = await supabase.storage
          .from("cards")
          .upload(`recto/${Date.now()}_${cardRectoFile.name}`, cardRectoFile);
        if (rectoError) {
          console.error(rectoError);
          throw new Error("Failed to upload recto image.");
        }
        cardRectoUrl = supabase.storage.from("cards").getPublicUrl(rectoData.path).data.publicUrl;
      }
  
      if (cardVersoFile) {
        const { data: versoData, error: versoError } = await supabase.storage
          .from("cards")
          .upload(`verso/${Date.now()}_${cardVersoFile.name}`, cardVersoFile);
        if (versoError) throw new Error("Failed to upload verso image.");
        cardVersoUrl = supabase.storage.from("cards").getPublicUrl(versoData.path).data.publicUrl;
      }
  
      // Get the current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
  
      // Retrieve the current user's parrain_id
      const { data: currentUserData, error: userDataError } = await supabase
        .from("user_data")
        .select("parrain_id")
        .eq("id", currentUser.id)
        .single();
  
      if (userDataError) throw new Error("Failed to fetch current user data.");
  
      // Get the current user's parrain_id and combine it with the current user's ID
      const parrainId = currentUserData.parrain_id;
      const combinedParrainId = `${currentUser.id},${parrainId || ""}`; // Combine current user ID with parrain_id
  
      const updatedFormData = {
        ...formData,
        card_recto: cardRectoUrl,
        card_verso: cardVersoUrl,
        perso: 0,
        parainage_points: 0,
        parainage_users: 0, // Initialize with 0
        ppcg: 0,
        parrain_id: combinedParrainId, // Set the combined parrain_id
      };
  
      // Insert the new user with the combined parrain_id
      const { error } = await supabase.from("user_data").insert([updatedFormData]);
      if (error) throw error;
  
      // Update the current user's parainage_users field
      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("parainage_users")
        .eq("id", currentUser.id)
        .single();
  
      if (userError) throw new Error("Failed to fetch current user data.");
  
      const currentParainageUsers = parseInt(userData.parainage_users || "0", 10);
      const updatedParainageUsers = currentParainageUsers + 1;
  
      // Update the current user's parainage_users value
      const { error: updateError } = await supabase
        .from("user_data")
        .update({ parainage_users: updatedParainageUsers })
        .eq("id", currentUser.id);
  
      if (updateError) throw new Error("Failed to update parainage_users.");
  
      setSuccess("Parrainage réussi !");
    } catch (err) {
      setError(`Erreur : ${err.message || "Une erreur inconnue s'est produite."}`);
    } finally {
      setLoading(false);
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
        <label className="parrain-label">
          Carte Recto:
          <input
            type="file"
            className="parrain-input"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "recto")}
            required
          />
        </label>
        <label className="parrain-label">
          Carte Verso:
          <input
            type="file"
            className="parrain-input"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "verso")}
            required
          />
        </label>
        <button className="parrain-button" type="submit" disabled={loading}>
          {loading ? "En cours..." : "Parrainer"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
});

export default Parrain;
