import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import { FaCopy } from "react-icons/fa";
import "./Boutique.css";

const Boutique = () => {
    const [products, setProducts] = useState([]);

    const fetchStoreData = async () => {
        const { data, error } = await supabase
            .from("store")
            .select("id, product_image, title, ref, price");

        if (error) {
            console.error("Error fetching product data:", error);
        } else {
            setProducts(data);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard
            .writeText(text)
            .catch((err) => {
                console.error("Failed to copy text:", err);
            });
    };

    return (
        <div className="boutique-container">
            <Header />
            <div className="recommended">
                <h2>Recommended Products</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <div className="product-card" key={product.id}>
                            <img src={product.product_image} alt={product.title} />
                            <h3>{product.title}</h3>
                            <div className="copy-container">
                                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#707988" }}>
                                    Ref: {product.ref}
                                </p>
                                <FaCopy
                                    className="copy-icon"
                                    onClick={() => handleCopy(product.ref)} 
                                />
                            </div>
                            <div className="price">
                                <img src="Coin.svg" alt="coin" />
                                <p>{product.price} FC</p>
                            </div>
                            <h3>{(product.price * 100).toLocaleString()} DZD</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Boutique;
