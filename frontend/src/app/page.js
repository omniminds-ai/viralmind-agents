"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";
import SocialIcons from "./components/partials/SocialIcons";
import { FaChevronCircleRight, FaTrophy, FaFlag, FaGem } from "react-icons/fa";
import axios from "axios";
import { StreamView } from "./components/chat/StreamView";
import BarLoader from "react-spinners/BarLoader";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiPayMoney,
  GiOpenTreasureChest,
} from "react-icons/gi";

import "./page.css";

export default function Home() {
  const [data, setData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestScreenshot, setLatestScreenshot] = useState(null);

  const fetchLatestScreenshot = async (challengeName) => {
    try {
      const response = await axios.get(`/api/challenges/get-challenge?name=${challengeName}`);
      if (response.data.latestScreenshot) {
        setLatestScreenshot(response.data.latestScreenshot);
        // Update active challenge with latest data
        setActiveChallenge({
          ...activeChallenge,
          ...response.data.challenge,
          prize: response.data.prize,
          usdPrize: response.data.usdPrize,
          expiry: response.data.expiry
        });
      }
    } catch (error) {
      console.error('Failed to fetch latest screenshot', error);
    }
  };

  useEffect(() => {
    let screenshotInterval;

    const getEndpoints = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/settings`);
        const fetchedData = response.data;
        
        setActiveChallenge(fetchedData.activeChallenge);
        
        if (fetchedData.activeChallenge) {
          // Initial screenshot fetch
          await fetchLatestScreenshot(fetchedData.activeChallenge.name);
          
          // Set up interval for active challenges
          if (fetchedData.activeChallenge.status === 'active') {
            screenshotInterval = setInterval(() => {
              fetchLatestScreenshot(fetchedData.activeChallenge.name);
            }, 1000); // Update every second
          }
        }
        
        setData(fetchedData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch endpoints', error);
        setLoading(false);
      }
    };

    getEndpoints();

    // Cleanup interval on unmount
    return () => {
      if (screenshotInterval) {
        clearInterval(screenshotInterval);
      }
    };
  }, []);

  const override = {
    display: "block",
    margin: "0 auto",
    width: "200px",
  };

  return !loading ? (
    <main className="main">
      {/* Header */}
      <Header 
        activeChallenge={activeChallenge} 
        usdPrize={activeChallenge?.usdPrize}
        />
      
      {/* Hero Section */}
      <div className="hero">
        <div className="homepage">
          <SocialIcons />

          <h1 className="slogan">
            The first decentralized effort to train and test upcoming computer-use and game-playing AI agents.
          </h1>          
          {/* Start Playing Button */}
          {activeChallenge && (
            <Link
              href={`/break/${activeChallenge?.name}`}
              className="start-playing-link"
            >
              <button className="styledBtn">
                START PLAYING <FaChevronCircleRight />
              </button>
            </Link>
          )}
          
        </div>
      </div>

      <div className="homepage">
        
        {/* Tournament Section */}
        <div className="tournament-section">
          <h2>TOURNAMENTS</h2>
          
          {/* Tournament Steps */}
          <div className="tournament-steps">
            <div className="step">
              <FaTrophy className="step-icon" />
              <h3>1. Choose a tournament</h3>
              <p>Select from active AI challenges</p>
            </div>
            <div className="step">
              <FaFlag className="step-icon" />
              <h3>2. Reach the goal</h3>
              <p>Complete the objective</p>
            </div>
            <div className="step">
              <FaGem className="step-icon" />
              <h3>3. Win the prize pool</h3>
              <p>Earn rewards for success</p>
            </div>
          </div>

          {/* Tournament Stats */}
          <div className="tournament-stats">
            <div className="stat">
              <GiBreakingChain size={28} />
              <CountUp
                start={0}
                end={data?.breakAttempts || 0}
                duration={2.75}
                decimals={0}
                decimal="."
                style={{ fontSize: '24px', fontWeight: '600' }}
              />
              <span>ATTEMPTS</span>
            </div>
            <div className="stat">
              <GiOpenTreasureChest size={28} />
              <CountUp
                start={0}
                end={data?.treasury || 0}
                duration={2.75}
                decimals={0}
                decimal="."
                prefix="$"
                style={{ fontSize: '24px', fontWeight: '600' }}
              />
              <span>TREASURY</span>
            </div>
            <div className="stat">
              <GiPayMoney size={28} />
              <CountUp
                start={0}
                end={data?.total_payout || 0}
                duration={2.75}
                decimals={0}
                decimal="."
                prefix="$"
                style={{ fontSize: '24px', fontWeight: '600' }}
              />
              <span>PAID OUT</span>
            </div>
          </div>

          {/* Live Tournament View */}
          {activeChallenge && (
            <div className="live-tournament">
              {/* Live Tournament Header */}
              {activeChallenge.status === 'active' && (
                <div className="live-tournament-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '4px',
                  marginBottom: '12px'
                }}>
                  {/* Prize Pool */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ color: '#09bf99', fontWeight: 'bold' }}>
                      ${activeChallenge.usdPrize?.toFixed(2)} Prize Pool
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9em' }}>
                      {activeChallenge.prize?.toFixed(4)} SOL
                    </div>
                  </div>
                  
                  {/* Live Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ff0000',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>CURRENTLY ACTIVE TOURNAMENT</span>
                  </div>


                  {/* Join Button */}
                  <Link href={`/break/${activeChallenge.name}`}>
                    <button style={{
                      backgroundColor: '#09bf99',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 48px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}>
                      Join Now
                    </button>
                  </Link>
                </div>
              )}

              <StreamView 
                challenge={activeChallenge}
                latestScreenshot={latestScreenshot}
                attempts={data?.breakAttempts}
                prize={activeChallenge?.prize}
                usdPrize={activeChallenge?.usdPrize}
                expiry={activeChallenge?.expiry}
              />
            </div>
          )}
        </div>

        {/* Training & API Section */}
        <div className="features-row">
          <div className="section">
            <h2>TRAINING</h2>
            <div className="coming-soon">
              <p>Earn our tokens by completing tasks in a VM. Earnings from the API and tournaments are used to buy back tokens to fund this training program.</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>
          </div>

          <div className="section">
            <h2>INFERENCE API</h2>
            <div className="coming-soon">
              <p>Use our latest trained models here!</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  ) : (
    <div>
      <Header />
      <div className="loading-container">
        <div className="page-loader">
          <BarLoader color="#ccc" size={150} cssOverride={override} />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}
