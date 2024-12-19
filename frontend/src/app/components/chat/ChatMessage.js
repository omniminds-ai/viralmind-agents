import React from "react";
import Image from "next/image";
import TimeAgo from "react-timeago";
import Jdenticon from "react-jdenticon";
import { ParsedText } from "./ParsedText";

export function ChatMessage({ message, challenge, isPartOfSequence, isLastInSequence, isFirstInSequence }) {
  const { role, content, address, date, screenshot } = message;

  // Shorten the address for display
  const shortenedAddress = address ? 
    `${address.slice(0, 4)}...${address.slice(-4)}` : 
    'anonymous';

  return (
    <div className={`chat-bubble ${role} ${isPartOfSequence && !isFirstInSequence ? 'sequence-part' : ''}`}>
      {role === "user" ? (
        <>
          <div className="avatar">
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}>
              <Jdenticon value={address} size={"20"} />
            </div>
          </div>
          <div className="message">
            <span className="username">{shortenedAddress}</span>
            <span className="content">{content}</span>
            <div style={{ 
              fontSize: "11px", 
              color: "var(--twitch-text-alt)",
              marginTop: "2px"
            }}>
              <TimeAgo date={new Date(date)} />
            </div>
          </div>
        </>
      ) : (
        <>
          {(!isPartOfSequence || isFirstInSequence) && (
            <div className="avatar">
              <Image
                alt="Assistant"
                src={challenge?.pfp}
                width="20"
                height="20"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%"
                }}
              />
            </div>
          )}
          <div className={`message`}>
            {(!isPartOfSequence || isFirstInSequence) && (
              <span className="username">{challenge?.name || 'Assistant'} {address && `@ ${shortenedAddress}`}</span>
            )}
            <ParsedText 
              message={content} 
              screenshot={(!isPartOfSequence || isLastInSequence) ? screenshot : undefined} 
            />
            {(!isPartOfSequence || isLastInSequence) && (
              <div style={{ 
                fontSize: "11px", 
                color: "var(--twitch-text-alt)",
                marginTop: "2px"
              }}>
                <TimeAgo date={new Date(date)} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
