import React from "react";
import { FaChartLine, FaClock } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";
import CountUp from "react-countup";
import Timer from "../../components/partials/Timer";

export function ChatStats({ usdPrice, price, expiry, maxActions }) {
  return (
    <div className="statsWrapper">
      <div className="stats">
        <div className="chatComingSoonMenuItem">
          <h4 style={{ 
            color: "var(--twitch-text-alt)", 
            fontSize: "12px", 
            marginBottom: "2px" 
          }}>
            <FaClock style={{ marginRight: '4px' }} />
            TIME REMAINING
          </h4>
          <Timer expiryDate={expiry} />
          <div style={{ 
            fontSize: "12px", 
            color: "var(--twitch-text-alt)",
            lineHeight: "1.2"
          }}>
            Last sender wins when timer ends • Messages extend timer to 1hr if under
          </div>
        </div>
        <div className="chatComingSoonMenuItem">
          <h4><FaChartLine style={{ marginRight: '4px' }} /> Message Price</h4>
          <div className="price-display">
            <CountUp
              preserveValue={true}
              start={0}
              end={price}
              duration={2.75}
              decimals={4}
              decimal="."
              suffix=" SOL"
            />
            <CountUp
              preserveValue={true}
              start={0}
              end={usdPrice}
              duration={2.75}
              decimals={2}
              decimal="."
              prefix="($"
              style={{ 
                fontSize: '10px', 
                color: 'var(--twitch-text-alt)',
                marginLeft: '4px'
              }}
              suffix=")"
            />
          </div>
        </div>
        <div className="chatComingSoonMenuItem">
          <h4>
            <FaRobot style={{ marginRight: '4px' }} />
            Actions Per Message
          </h4>
          <div className="actions-display" style={{ fontSize: '16px' }}>
            {maxActions || 3}
          </div>
        </div>
      </div>
    </div>
  );
}
