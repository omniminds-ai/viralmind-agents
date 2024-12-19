"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import SocialIcons from "../components/partials/SocialIcons";
import JailTokensSection from "../components/partials/JailTokensSection";
import BarLoader from "react-spinners/BarLoader";

const Token = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/settings`);
        setData(response.data?.jailToken);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const override = {
    display: "block",
    margin: "0 auto",
    width: "200px",
  };

  return (
    <main className="main">
      <Header />
      
      <div className="hero">
        <div className="homepage">
          <SocialIcons />
          <h1 className="slogan">$VIRAL Tokens</h1>
        </div>
      </div>

      <div className="homepage">
        {loading ? (
          <div className="loading-container">
            <div className="page-loader">
              <BarLoader color="#ccc" size={150} cssOverride={override} />
              <span>Loading...</span>
            </div>
          </div>
        ) : (
          <JailTokensSection data={data} loading={false} />
        )}
      </div>
    </main>
  );
};

export default Token;
