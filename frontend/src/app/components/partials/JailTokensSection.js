import React from "react";
import BarLoader from "react-spinners/BarLoader";

const override = {
  display: "block",
  margin: "0 auto",
  width: "200px",
};

const JailTokensSection = ({ data, loading }) => {
  return (
    <div style={styles.container} className="jail-token-page">
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "80vh",
          }}
        >
          <div style={{ display: "block" }}>
            <div className="page-loader" style={{ textAlign: "center" }}>
              <BarLoader color="#ccc" size={150} cssOverride={override} />
              <br />
              <span style={{ color: "#ccc" }}>Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>
            $VIRAL Tokens: The Future of the Viralmind Ecosystem
          </h1>
          <span style={styles.address}>Token Address: {data?.address}</span>
          {/* Overview Section */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>🔍 Overview</h2>
            <p>
              $VIRAL tokens are designed to be the{" "}
              <strong>native currency of the Viralmind dApp</strong>, serving
              as the backbone of the platform&apos;s economy. While the full
              utility of $VIRAL tokens will roll out in future updates, the
              groundwork is being laid to ensure their value and relevance
              within the ecosystem.
            </p>
          </section>

          {/* Current Use Cases */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>
              💡 Current Use Cases
            </h2>
            <ul style={styles.list}>
              <li>
                <strong>Prize Pool Allocation:</strong> A portion of every prize
                pool is allocated to
                <strong> buy back $VIRAL tokens</strong> from the market. This
                creates consistent demand for the token.
              </li>
              <li>
                <strong>Market Impact:</strong>
                <ul style={styles.sublist}>
                  <li>
                    The buybacks help support the token&apos;s value by reducing
                    the circulating supply.
                  </li>
                  <li>
                    This strategy establishes a strong foundation for the $VIRAL
                    token economy as the platform scales.
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Tournament Benefits */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>
              🎮 Tournament Benefits
            </h2>
            <p>
              Spend $VIRAL tokens during tournaments to unlock enhanced capabilities:
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Chat Bonuses:</strong> Get additional chat interactions with AI agents
              </li>
              <li>
                <strong>Extended Actions:</strong> Unlock more actions and testing capabilities
              </li>
              <li>
                <strong>Tournament Rewards:</strong> Earn rewards for successfully helping AI agents achieve their goals
              </li>
            </ul>
          </section>

          {/* Earning Opportunities */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>💪 Data Labeling Gym</h2>
            <p>
              Coming soon: Earn $VIRAL tokens by contributing to AI training:
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Training Data:</strong> Provide valuable computer-use data to improve AI models
              </li>
              <li>
                <strong>Quality Rewards:</strong> Earn tokens based on the quality and quantity of your contributions
              </li>
              <li>
                <strong>Community Impact:</strong> Help shape the future of computer-use AI agents
              </li>
            </ul>
          </section>

          {/* Inference API */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>🤖 Inference API Access</h2>
            <p>
              Once our custom computer-use models are released:
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Task Automation:</strong> Use $VIRAL tokens to access our inference API
              </li>
              <li>
                <strong>Custom Integration:</strong> Integrate our AI models as advanced personal agents into your own applications
              </li>
              <li>
                <strong>Efficient Computing:</strong> Automate computer tasks using our trained models
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    color: "#fff",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#09bf99",
    marginBottom: "24px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#09bf99",
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "8px",
    background: "linear-gradient(to right, rgba(9,191,153,0.2), rgba(0,0,0,0.5))",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  section: {
    marginBottom: "40px",
    background: "linear-gradient(145deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid rgba(9,191,153,0.1)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
    }
  },
  list: {
    listStyleType: "none",
    padding: "0",
    color: "#ccc",
    "& li": {
      marginBottom: "12px",
      paddingLeft: "20px",
      position: "relative",
      "&:before": {
        content: "•",
        color: "#09bf99",
        position: "absolute",
        left: "0",
      }
    },
    "& strong": {
      color: "#fff",
      fontWeight: "600",
    }
  },
  sublist: {
    listStyleType: "none",
    marginLeft: "20px",
    marginTop: "8px",
    color: "#ccc",
    "& li": {
      marginBottom: "8px",
      paddingLeft: "16px",
      position: "relative",
      "&:before": {
        content: "○",
        color: "#09bf99",
        position: "absolute",
        left: "0",
      }
    }
  },
  address: {
    fontSize: "16px",
    color: "#ccc",
    background: "linear-gradient(to right, rgba(9,191,153,0.2), rgba(0,0,0,0.5))",
    padding: "12px 20px",
    borderRadius: "8px",
    display: "inline-block",
    marginBottom: "32px",
    border: "1px solid rgba(9,191,153,0.1)",
  },
};

export default JailTokensSection;
