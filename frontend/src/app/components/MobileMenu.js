import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TiThMenu } from "react-icons/ti";
import { FaEye, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import CountUp from "react-countup";
import stoneLogo from "../../assets/stoneLogo.png";
import { StreamView } from "./chat/StreamView";
import "../../styles/MobileMenu.css";

const MobileMenu = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = !menuOpen ? 'hidden' : 'auto';
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
      document.body.style.overflow = 'auto';
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <div className={`mobileMenu ${props.absolute ? "absolute" : ""}`}>
      <div className="hamburgerIcon" onClick={toggleMenu}>
        <TiThMenu size={20} />
      </div>

      <div className={`mainMenu ${menuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <button className="back-button" onClick={toggleMenu}>
            <FaArrowLeft size={20} />
            Back
          </button>
          <div className="logo-container">
            <Image
              src={stoneLogo}
              alt="Stone Logo"
              width="70"
              style={{
                borderRadius: "0px 0px 50px 50px",
              }}
              priority
              className="mainLogo pointer"
              onClick={() => {
                window.location.href = "/";
                toggleMenu();
              }}
            />
          </div>
        </div>

        {/* Tournament Info Section */}
        {props.challenge && (
          <div className="tournament-section">
            <div className="tournament-header">
              <div className="tournament-title">
                <div className="streamer-avatar">
                  <Image
                    src={props.challenge?.pfp}
                    alt={props.challenge?.name}
                    width={48}
                    height={48}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="streamer-details">
                  <h2>{props.challenge?.name}</h2>
                  <div style={{ color: 'var(--twitch-text-alt)', fontSize: '14px', marginBottom: '8px' }}>
                    {props.challenge?.title}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--twitch-purple)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {props.challenge?.level}
                  </div>
                </div>
              </div>

              <div className="prize-pool">
                <div className="prize-label">PRIZE POOL</div>
                <div className="prize-amount">
                  <CountUp
                    start={0}
                    end={props.usdPrize}
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
                    end={props.prize}
                    preserveValue={true}
                    duration={2.75}
                    decimals={4}
                    decimal="."
                    suffix=" SOL"
                  />
                </div>
              </div>
            </div>

            <div className="tournament-stats">
              <div>
                <FaEye style={{ marginRight: '4px', position: 'relative', top: '2px' }} />
                {props.attempts} messages sent
              </div>
            </div>

            <div className="tournament-description">
              {props.challenge?.label}
            </div>

            <div className="tournament-details">
              <div>Characters Per Message: ~{props.challenge?.characterLimit}</div>
              <div>Context Window: ~{props.challenge?.contextLimit}</div>
              <div>UI Chat Limit: ~{props.challenge?.chatLimit}</div>
              <div>Developer Fee: {props.challenge?.developer_fee}%</div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="menu-nav">
          <Link href="/" className="nav-link" onClick={toggleMenu}>
            Home
          </Link>
          
          <Link href="/viral-token" className="nav-link" onClick={toggleMenu}>
            Tokens
          </Link>
          
          <Link href="/faq" className="nav-link" onClick={toggleMenu}>
            FAQ
          </Link>
          
          {props.activeChallenge && (
            <Link 
              href={`/break/${props.activeChallenge?.name}`} 
              className="nav-link"
              onClick={toggleMenu}
            >
              Play 
              {props.usdPrize && (
                <span className="live-pool">
                  🔴LIVE: ${props.usdPrize?.toLocaleString() || "0"} POOL
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Stream View */}
        {props.challenge && menuOpen && (
          <div className="mobile-stream-view">
            <StreamView
              challenge={props.challenge}
              latestScreenshot={props.latestScreenshot}
              attempts={props.attempts}
              prize={props.prize}
              usdPrize={props.usdPrize}
              expiry={props.expiry}
            />
          </div>
        )}
      </div>
      <div className={`overlay ${menuOpen ? "open" : ""}`} onClick={toggleMenu} />
    </div>
  );
};

export default MobileMenu;
