import React from "react";
import Image from "next/image";

export function ChallengeTitle({ challenge, isMobile = false }) {
  if (isMobile) {
    return (
      <div className="challengeTitle mobileOnly" style={{
        background: "transparent",
        padding: "12px 20px",
        margin: 0,
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div>
            <Image
              alt="logo"
              src={challenge?.pfp}
              width="30"
              height="30"
              className="pfp"
              style={{ borderRadius: "3px" }}
            />
          </div>
          <span style={{
            color: "#ececf1",
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            {challenge?.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="challengeTitle">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px"
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            margin: "0 0 8px",
            color: "#ececf1",
            fontSize: "20px",
            fontWeight: "600"
          }}>
            {challenge?.title}
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className={`${challenge?.level} level`} style={{
              margin: 0,
              backgroundColor: "#343541",
              color: "#09bf99",
              fontWeight: "500"
            }}>
              {challenge?.level}
            </span>
            <span style={{ 
              color: "#8e8ea0",
              fontSize: "14px"
            }}>
              •
            </span>
            <span style={{ 
              color: "#8e8ea0",
              fontSize: "14px"
            }}>
              {challenge?.label}
            </span>
          </div>
        </div>
        <div>
          <Image
            onClick={() => {
              window.open(`/agent/${challenge?.name}`, "_blank");
            }}
            alt="logo"
            src={challenge?.pfp}
            width="40"
            height="40"
            className="pfp pointer"
            style={{ 
              borderRadius: "3px",
              transition: "opacity 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          />
        </div>
      </div>
    </div>
  );
}
