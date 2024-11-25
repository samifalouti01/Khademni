import React, { useState } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useUser } from "./UserContext";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onClose }) => {
  const { level, calculateLevel } = useUser();
  const [receiptFile, setReceiptFile] = useState(null);

  // Define discount percentages for each level
  const discountPercentages = {
    "Animateur Adjoint": 0.35, // 35%
    "Animateur": 0.38,         // 38%
    "Manager Adjoint": 0.40,   // 40%
    "Manager": 0.48,           // 48%
  };

  // Get the discount multiplier based on the level
  const discountMultiplier = discountPercentages[level] || 0; // Default to 0 (no discount) if level is not found

  // Calculate discounted prices for each item
  const discountedItems = cartItems.map((item) => ({
    ...item,
    discountedPrice: item.price * (1 - discountMultiplier),
  }));

  // Calculate total FC (with discounts applied)
  const totalFC = discountedItems.reduce((total, item) => total + item.discountedPrice, 0);

  // Calculate total DZD (using the discounted total in FC)
  const totalDZD = totalFC * 100;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setReceiptFile(file);
  };

  const handleBuyNow = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
      alert("Please log in before making a purchase.");
      return;
    }
  
    if (!receiptFile) {
      alert("Please upload a receipt before proceeding.");
      return;
    }
  
    try {
      const fileName = `${user.id}-${Date.now()}-${receiptFile.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("receipt")
        .upload(fileName, receiptFile);
  
      if (storageError || !storageData?.path) {
        alert("Failed to upload the receipt. Please try again.");
        return;
      }
  
      const { data: publicUrlData } = supabase.storage
        .from("receipt")
        .getPublicUrl(storageData.path);
  
      const publicUrl = publicUrlData?.publicUrl;
  
      if (!publicUrl) {
        alert("Failed to retrieve receipt URL. Please try again.");
        return;
      }
  
      const { data: userDetails, error: userError } = await supabase
        .from("user_data")
        .select("email, phone")
        .eq("id", user.id)
        .single();
  
      if (userError || !userDetails) {
        alert("Unable to fetch user details. Please try again.");
        return;
      }
  
      const orderData = {
        user_id: user.id,
        name: user.name,
        phone: userDetails.phone,
        email: userDetails.email,
        product_ref: cartItems.map((item) => item.ref).join(", "),
        total_price: totalFC,
        receipt: publicUrl,
        order_status: "en attente", 
      };
  
      const { error: orderError } = await supabase.from("order").insert(orderData);
  
      if (orderError) {
        alert("Failed to place the order. Please try again.");
      } else {
        alert("Order placed successfully!");
  
        onRemoveItem();  
        onClose();  
      }
    } catch {
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="cart-dropdown">
      <h3>Your Cart</h3>
      <button className="close-button" onClick={onClose}>
        <FaTimes size={24} />
      </button>
      
      <h2 style={{ color: "#9A9A9A", fontWeight: "medium" }}>{level || "Loading..."}</h2>
      <h1 style={{ color: "#007bff", fontWeight: "bold" }}>Discount: {discountMultiplier * 100}%</h1>

      <ul>
        {discountedItems.map((item, index) => (
          <li key={index} className="cart-item">
            <img src={item.product_image} alt={item.title} />
            <div>
              <h4>Ref: {item.ref}</h4>
              <p style={{ color: "#007bff", fontWeight: "bold" }}>
                {item.discountedPrice.toFixed(2)} FC
              </p>
              <p>{(item.discountedPrice * 100).toLocaleString()} DZD</p>
            </div>
            <button className="remove-item-button" onClick={() => onRemoveItem(index)}>
              <FaTrash style={{ marginTop: "5px" }} />
            </button>
          </li>
        ))}
      </ul>
      
      <div className="cart-summary">
        <p>Total FC: {totalFC.toFixed(2)} FC</p>
        <p>Total DZD: {totalDZD.toLocaleString()} DZD</p>
        <br />
        <br />
      </div>
      
      <ul>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <p style={{ fontWeight: "normal" }}>RIP: <span style={{ fontWeight: "bold" }}>002494729723</span></p>
          <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
            <img
              style={{ width: "auto", height: "50px" }}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/AlgeriePoste.svg/1200px-AlgeriePoste.svg.png"
              alt="poste"
            />
            <img
              style={{ width: "auto", height: "50px" }}
              src="https://seeklogo.com/images/B/baridimob-logo-2E48D2A2FB-seeklogo.com.png"
              alt="baridi"
            />
          </div>
          <label className="paiment_label">
            Envoyer le reçu:
            <input
              type="file"
              className="paiment-input"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </label>
        </div>
      </ul>
      
      <br />
      <button className="buy-now-button" onClick={handleBuyNow}>
        Buy Now
      </button>
    </div>
  );
};

export default Cart;
