import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "./Payments.css";

const Payments = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [income, setIncome] = useState(0);

  const fetchUserData = useCallback(async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      alert("Please log in.");
      return;
    }

    const currentUserId = String(currentUser.id);
    setUserId(currentUserId);

    const { data, error } = await supabase
      .from("user_data")
      .select("id, ppcg, parrain_id, parainage_users")
      .eq("id", currentUserId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      setUserData(data);
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("user_data")
      .select("id, name, ppcg, parrain_id");

    if (error) {
      console.error("Error fetching referrals:", error);
      return;
    }

    const filteredReferrals = data.filter((user) => {
      const parrainIds = user.parrain_id ? user.parrain_id.split(",").map((id) => id.trim()) : [];
      return parrainIds.includes(userId);
    });

    setReferrals(filteredReferrals);
  }, [userId]);

  const calculateIncome = useCallback(() => {
    if (!userData || !referrals.length) return;

    const userLevel = determineLevel(parseFloat(userData.ppcg) || 0);
    let totalIncome = 0;

    const updatedReferrals = referrals.map((referral) => {
      const referralPpcg = parseFloat(referral.ppcg) || 0;
      const referralLevel = determineLevel(parseFloat(referral.ppcg) || 0);
      const commission = getCommission(userLevel, referralLevel);

      const referralIncome = (commission / 100) * referralPpcg;
      totalIncome += referralIncome;

      return { ...referral, referralIncome };
    });

    setReferrals(updatedReferrals);
    setIncome(totalIncome);
  }, [userData, referrals]);

  const determineLevel = (points) => {
    if (isNaN(points)) return "Distributeur";
    if (points >= 30000) return "Manager";
    if (points >= 18700) return "Manager Adjoint";
    if (points >= 6250) return "Animateur";
    if (points >= 100) return "Animateur Adjoint";
    return "Distributeur";
  };

  const getCommission = (userLevel, referralLevel) => {
    const commissionMatrix = {
      "Manager": {
        "Manager": 0,
        "Manager Adjoint": 5,
        "Animateur": 10,
        "Animateur Adjoint": 13,
      },
      "Manager Adjoint": {
        "Manager": 0,
        "Manager Adjoint": 0,
        "Animateur": 3,
        "Animateur Adjoint": 8,
      },
      "Animateur": {
        "Manager": 0,
        "Manager Adjoint": 0,
        "Animateur": 0,
        "Animateur Adjoint": 5,
      },
      "Animateur Adjoint": {
        "Manager": 0,
        "Manager Adjoint": 0,
        "Animateur": 0,
        "Animateur Adjoint": 0,
      },
    };
  
    // Fallback if userLevel or referralLevel are not valid
    if (!commissionMatrix[userLevel]) {
      console.warn(`Invalid userLevel: ${userLevel}`);
      return 0;
    }
    if (!commissionMatrix[userLevel][referralLevel]) {
      console.warn(`Invalid referralLevel: ${referralLevel}`);
      return 0;
    }
  
    return commissionMatrix[userLevel][referralLevel] || 0;
  };  

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    if (userData.id && referrals.length) {
      calculateIncome();
    }
  }, [userData, referrals, calculateIncome]);

  return (
    <div>
        <Header />
        <div className="payments-container">
      <div className="user-info">
        <h1>Level: {userData.ppcg ? determineLevel(parseFloat(userData.ppcg)) : "N/A"}</h1>
        <h2>Total Income: {income ? (income * 100).toFixed(2) : "0.00"} DA</h2>
        <h2>Team Size: {referrals.length}</h2>
      </div>

      <h3>Referral Details:</h3>
      <ul className="referral-list">
        {referrals.map((referral) => (
          <li key={referral.id} className="referral-item">
            <span>{referral.name}</span>
            <span>PCG: {referral.ppcg || "N/A"}</span>
            <span>Income: {referral.referralIncome ? (referral.referralIncome * 100).toFixed(2) : "0.00"} DA</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
};

export default Payments;