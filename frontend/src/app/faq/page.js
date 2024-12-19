"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import SocialIcons from "../components/partials/SocialIcons";
import BarLoader from "react-spinners/BarLoader";

const FAQ = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const getFaqData = async () => {
      try {
        const response = await axios.get(`/api/settings`);
        setFaqData(response.data.faq);
      } catch (error) {
        console.error('Failed to fetch FAQ data', error);
      } finally {
        setLoading(false);
      }
    };

    getFaqData();
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
          <h1 className="slogan">Frequently Asked Questions</h1>
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
          <div className="faq-section">
            <div className="faq-items">
              {faqData.map((item, index) => (
                <div key={index} className="faq-item">
                  <div
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: '16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#fff',
                      marginBottom: activeIndex === index ? '0' : '8px'
                    }}
                  >
                    {item.question}
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {activeIndex === index ? '−' : '+'}
                    </span>
                  </div>
                  {activeIndex === index && (
                    <div 
                      className="faq-answer"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '16px',
                        color: '#ccc',
                        marginBottom: '8px',
                        borderBottomLeftRadius: '4px',
                        borderBottomRightRadius: '4px'
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FAQ;
