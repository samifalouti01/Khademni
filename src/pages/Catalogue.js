import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaCopy, FaArrowUp } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Catalogue.css";

const Catalogue = () => {
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const navigate = useNavigate();
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("store")
          .select("id, title, price, product_image, ref, sex");
        if (error) throw error;
        setCatalogItems(data);
      } catch (err) {
        setError("Failed to load catalog data.");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsScrollVisible(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy text:", err);
    });
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector(".catalogue-container"); // The element to capture

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true, // Enable cross-origin handling
      allowTaint: false, // Prevent tainting the canvas
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if the content exceeds one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Catalogue.pdf");
  };

  // Separate render states for loading and error
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="catalogue">
      {/* Download PDF Button */}
      <button className="download-pdf-button" onClick={handleDownloadPDF}>
        Download PDF
      </button>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-button ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode("grid")}
        >
          Grid View
        </button>
        <button
          className={`toggle-button ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          List View
        </button>
      </div>

      <h1 className="catalogue-header">Our Catalogue</h1>

      {/* Dynamic Layout */}
      <div className={`catalogue-container ${viewMode}`}>
        {catalogItems.map((item) => (
          <div key={item.id} className={`catalogue-card ${viewMode}`}>
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.title}
                className={`catalogue-image ${viewMode}`}
              />
            )}
            <div className="catalogue-details">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  margin: "0px",
                  padding: "0px",
                  gap: "10px",
                }}
              >
                <h2 className="catalogue-title">{item.title}</h2>
                <p
                  style={{ cursor: "pointer", fontSize: "14px", marginTop: "20px" }}
                  className="catalogue-sex"
                >
                  {item.sex}
                </p>
              </div>
              <p className="catalogue-price">
                Prix de vente:{" "}
                <span style={{ color: "#000", fontWeight: "bold" }}>
                  {item.price * 100} DA
                </span>
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  margin: "0px",
                  padding: "0px",
                  gap: "10px",
                }}
              >
                <FaCopy
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    marginTop: "-18px",
                    marginLeft: "-18px",
                    padding: "0px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.ref);
                  }}
                />
                <p className="catalogue-ref">Réf : {item.ref}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to Top Button */}
      {isScrollVisible && (
        <button className="scroll-to-top" onClick={handleScrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default Catalogue;
