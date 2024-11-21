import React, { useState } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onClose }) => {
  const [receiptFile, setReceiptFile] = useState(null);
  const totalFC = cartItems.reduce((total, item) => total + Number(item.price), 0);
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
      <ul>
        {cartItems.map((item, index) => (
          <li key={index} className="cart-item">
            <img src={item.product_image} alt={item.title} />
            <div>
              <h4>Ref: {item.ref}</h4>
              <p style={{ color: "#007bff", fontWeight: "bold" }}>{item.price} FC</p>
              <p>{(item.price * 100).toLocaleString()} DZD</p>
            </div>
            <button className="remove-item-button" onClick={() => onRemoveItem(index)}>
              <FaTrash style={{ marginTop: "5px" }} />
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p>Total FC: {totalFC} FC</p>
        <p>Total DZD: {totalDZD.toLocaleString()} DZD</p>
      </div>
      <ul>
        <div className="cart-item">
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
      <button className="buy-now-button" onClick={handleBuyNow}>
        Buy Now
      </button>
    </div>
  );
};

export default Cart;
