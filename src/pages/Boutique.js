import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import { FaCopy, FaShoppingCart } from "react-icons/fa";
import Cart from "../components/Cart";
import "./Boutique.css";

const Boutique = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const searchRef = useRef(null);
  const cartRef = useRef(null);

  const fetchStoreData = async () => {
    const { data, error } = await supabase
      .from("store")
      .select("id, product_image, title, ref, price, sex");

    if (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Échec de la copie du texte :", err);
    });
  };

  const handleAddToCart = (product) => {
    setCartItems((prevCart) => [...prevCart, product]);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    setSearchQuery(searchRef.current.value);
  };

  const handleClickOutside = (event) => {
    if (cartRef.current && !cartRef.current.contains(event.target)) {
      setIsCartOpen(false);
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Tous" || product.sex === selectedCategory.toLowerCase();
    const matchesSearch = product.ref
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="boutique-container">
      <Header />
      <div className="toolbar">
        <div className="category-buttons">
          <button
            className={selectedCategory === "Tous" ? "active" : ""}
            onClick={() => handleCategoryChange("Tous")}
          >
            Tous
          </button>
          <button
            className={selectedCategory === "Hommes" ? "active" : ""}
            onClick={() => handleCategoryChange("Hommes")}
          >
            Hommes
          </button>
          <button
            className={selectedCategory === "Femmes" ? "active" : ""}
            onClick={() => handleCategoryChange("Femmes")}
          >
            Femmes
          </button>
        </div>
        <input
          ref={searchRef}
          type="text"
          placeholder={`Rechercher dans ${selectedCategory}...`}
          className="search-bar"
          onChange={handleSearch}
        />
        <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
          <FaShoppingCart />
          {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
        </div>
      </div>
      {isCartOpen && (
        <div ref={cartRef}>
          <Cart
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onClose={handleCloseCart}
          />
        </div>
      )}
      <div className="recommended">
        <h2>{selectedCategory}</h2>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => handleAddToCart(product)}
            >
              <div className="pr">
                <img src={product.product_image} alt={product.title} />
                <div className="title-container">
                  <h3>{product.title}</h3>
                  <div className="copy-container">
                    <p>Réf : {product.ref}</p>
                    <FaCopy
                      className="copy-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(product.ref);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="price-container">
                <div className="price">
                  <img src="Coin.svg" alt="pièce" />
                  <p>{product.price} FC</p>
                </div>
                <h3>{(product.price * 100).toLocaleString()} DZD</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Boutique;
