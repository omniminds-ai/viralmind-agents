"use client";
import React, { useState } from "react";
import Image from "next/image";
import stoneLogo from "../../assets/stoneLogo.png";
import MainMenu from "../components/MainMenu";
import MobileMenu from "../components/MobileMenu";

const Terms = () => {
  const [loading, setLoading] = useState(false);

  return (
    <main>
      <MobileMenu absolute={true} />
      <div
        style={{ textAlign: "center", display: "grid", placeItems: "center" }}
      >
        <Image
          alt="logo"
          src={stoneLogo}
          width="80"
          style={{
            borderRadius: "0px 0px 150px 150px",
            marginBottom: "10px",
          }}
        />
        <h2 className="terms-title">Terms and Conditions</h2>
      </div>
      <hr />
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "75vh",
            color: "#ccc",
          }}
        >
          Loading Terms and Conditions...
        </div>
      ) : (
        <div className="docsPage" style={{ color: "#ccc" }}>
          <MainMenu />
          <div className="terms-container">
            <h1>Welcome to ViralMind.ai</h1>
            <hr />
            <p>
              Please carefully read these Terms and Conditions before using our
              platform. By accessing or using ViralMind.ai, you agree to be bound
              by these terms. If you do not agree, please refrain from using our
              services.
            </p>

            <section>
              <h3>1. Overview</h3>
              <p>
                ViralMind.ai is a gamified platform for training and testing
                computer-use and game-playing AI agents. By using ViralMind.ai, you agree
                to engage with the platform in a fair and ethical manner, adhering to the
                rules of each tournament and testing scenario.
              </p>
            </section>

            <section>
              <h3>2. User Responsibilities</h3>
              <ul>
                <li>
                  Users are prohibited from attempting to hack, exploit, or
                  otherwise interfere with the functionality of the AI or
                  platform.
                </li>
                <li>
                  Users must comply with all tournament-specific rules and
                  refrain from sharing answers, hacks, or solutions publicly.
                </li>
              </ul>
            </section>

            <section>
              <h3>3. Platform Content</h3>
              <p>
                ViralMind.ai provides AI agent testing environments and tournaments
                for training and evaluation purposes. While we aim for accuracy and
                consistency in our testing scenarios, results may vary based on
                agent behavior and user interaction.
              </p>
              <p>
                ViralMind.ai reserves the right to update, modify, or remove
                tournaments and content without notice.
              </p>
            </section>

            <section>
              <h3>4. Privacy</h3>
              <p>
                Your privacy is important to us. By using ViralMind.ai, you agree
                to our collection and use of your data as outlined in our
                Privacy Policy. Wallet addresses used for authentication are
                stored securely. Conversations may be logged and analyzed for
                platform improvement but will never be shared with third
                parties.
              </p>
            </section>

            <section>
              <h3>5. Prohibited Actions</h3>
              <p>Users must not:</p>
              <ul>
                <li>
                  Attempt to bypass security measures or manipulate AI-generated
                  responses.
                </li>
                <li>
                  Use offensive, abusive, or inappropriate language in their
                  prompts or interactions.
                </li>
                <li>
                  Violate any applicable laws, regulations, or third-party
                  rights.
                </li>
                <li>
                  Share or distribute any proprietary content, including
                  tournament instructions or secret solutions.
                </li>
              </ul>
            </section>

            <section>
              <h3>6. Intellectual Property</h3>
              <p>
                All content, designs, and tournaments on ViralMind.ai are the
                intellectual property of ViralMind.ai. You are not allowed to
                copy, distribute, or publicly display any platform content
                without explicit permission.
              </p>
            </section>

            <section>
              <h3>7. Rewards and Prize Pool</h3>
              <p>
                Rewards for successful tournaments are credited based on
                adherence to tournament rules. Users found to exploit, cheat, or
                otherwise manipulate the platform will be disqualified from
                rewards. ViralMind.ai reserves the right to modify reward 
                structures or eligibility criteria at any time.
              </p>
            </section>

            <section>
              <h3>8. Limitation of Liability</h3>
              <p>
                ViralMind.ai is provided &quot;as is,&quot; and we make no
                guarantees about the functionality or availability of the
                platform. We are not liable for any damages resulting from your
                use of the platform, including but not limited to financial
                loss, data loss, or interruptions in service. Your participation
                in tournaments is at your own risk.
              </p>
            </section>

            <section>
              <h3>9. Account Suspension or Termination</h3>
              <p>
                ViralMind.ai reserves the right to suspend or terminate any user
                account found in violation of these Terms and Conditions without
                prior notice.
              </p>
            </section>

            <section>
              <h3>10. Changes to the Terms</h3>
              <p>
                We may update these Terms and Conditions from time to time. The
                updated version will be posted on this page, and continued use
                of ViralMind.ai constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h3>11. Contact Information</h3>
              <p>
                For any questions or concerns regarding these Terms and
                Conditions, please contact us at contact@viralmind.ai.
              </p>
            </section>
          </div>
        </div>
      )}
    </main>
  );
};

export default Terms;
