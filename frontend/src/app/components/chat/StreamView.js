import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaEye, FaChevronUp, FaChevronDown } from "react-icons/fa";
import CountUp from "react-countup";
import Timer from "../../components/partials/Timer";
import EmoteOverlay from "./EmoteOverlay";

export function StreamView({ challenge, latestScreenshot, attempts, prize, usdPrize, expiry }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="stream-section">
      {/* Stream/Screenshot Display */}
      <div className="stream-view" style={{ position: 'relative' }}>
        <EmoteOverlay character={challenge?.name} />
        {latestScreenshot ? (
          <>
            {/* Use regular img tag for API-served screenshots */}
            <img
              src={latestScreenshot.url}
              alt="Latest interaction"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
            {/* Live indicator */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff0000',
                animation: 'pulse 2s infinite'
              }} />
              LIVE
            </div>
            <style jsx>{`
              @keyframes pulse {
                0% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
                100% {
                  opacity: 1;
                }
              }
            `}</style>
          </>
        ) : (
          <div className="stream-placeholder">
            No screenshots yet
          </div>
        )}
      </div>

      {/* Tournament Info (like Twitch stream info) */}
      <div className={`tournament-info ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="tournament-header">
          <div className="tournament-title">
            <div className="streamer-avatar">
              <Image
                src={challenge?.pfp}
                alt={challenge?.name}
                width={96}
                height={96}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="streamer-details">
              <h2>{challenge?.name}</h2>
              <div style={{ 
                color: 'var(--twitch-text-alt)', 
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                {challenge?.title}
              </div>
              <div className="level-badge" style={{
                display: 'inline-block',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--twitch-purple)',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {challenge?.level}
              </div>
            </div>
          </div>

          <div className="prize-pool">
            <div className="prize-label">PRIZE POOL</div>
            <div className="prize-amount">
              <CountUp
                style={{ 
                  color: "#09bf99",
                  fontSize: '28px',
                  fontWeight: '600'
                }}
                start={0}
                end={usdPrize}
                preserveValue={true}
                duration={2.75}
                decimals={2}
                decimal="."
                prefix="$"
              />
            </div>
            <div className="prize-sol">
              <CountUp
                start={0}
                end={prize}
                preserveValue={true}
                duration={2.75}
                decimals={4}
                decimal="."
                suffix=" SOL"
                style={{ 
                  fontSize: '14px', 
                  color: 'var(--twitch-text-alt)' 
                }}
              />
            </div>
          </div>
        </div>

        <div className="tournament-stats">
          <div>
            <FaEye style={{ marginRight: '4px', position: 'relative', top: '2px' }} />
            {attempts} messages sent
          </div>
        </div>

        <div className="tournament-description">
          {challenge?.label}
        </div>

        

        <div style={{
          backgroundColor: 'rgba(145, 71, 255, 0.1)',
          border: '1px solid rgba(145, 71, 255, 0.2)',
          borderRadius: '4px',
          padding: '12px',
          paddingTop: '0px',
          marginTop: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#fff',
          lineHeight: '1.5'
        }}>
          <h4 style={{ 
              color: "var(--twitch-text-alt)", 
              fontSize: "12px", 
              marginTop: "6px",
              marginBottom: "8px" 
            }}>
            HOW TO WIN
          </h4>
          {challenge?.win_condition}
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          fontSize: '13px',
          color: 'var(--twitch-text-alt)',
          lineHeight: '1.6'
        }}>
          <div>Characters Per Message: ~{challenge?.characterLimit}</div>
          <div>Context Window: ~{challenge?.contextLimit}</div>
          <div>UI Chat Limit: ~{challenge?.chatLimit}</div>
          <div>Developer Fee: {challenge?.developer_fee}%</div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Show details" : "Hide details"}
      >
        {isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
      </button>
    </div>
  );
}
