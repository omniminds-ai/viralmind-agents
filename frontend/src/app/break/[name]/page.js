"use client"
import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { FaSadCry } from "react-icons/fa";
import RingLoader from "react-spinners/RingLoader";
import BarLoader from "react-spinners/BarLoader";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { PiPaperPlaneRightFill } from "react-icons/pi";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { ChatMessage } from "../../components/chat/ChatMessage";
import { ChatStats } from "../../components/chat/ChatStats";
import { StreamView } from "../../components/chat/StreamView";
import MobileMenu from "../../components/MobileMenu";
import { SOLANA_RPC, delay, hashString, calculateDiscriminator } from "../../utils/crypto";

import "../../../styles/Chat.css";

export default function Challenge({ params }) {
  const name = use(params).name;
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [challenge, setChallenge] = useState({});
  const [prompt, setPrompt] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [writing, setWriting] = useState(false);
  const [lastMessageDate, setLastMessageDate] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [price, setPrice] = useState(0);
  const [prize, setPrize] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);
  const [usdPrize, setUsdPrize] = useState(0);
  const [expiry, setExpiry] = useState(null);
  const [latestScreenshot, setLatestScreenshot] = useState(null);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const { publicKey, sendTransaction, connected } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (publicKey) {
      localStorage.setItem("address", publicKey.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    // scrollToBottom();
  }, [pageLoading]);

  useEffect(() => {
    if (writing) {
      // scrollToBottom();
    }
  }, [conversation]);

  useEffect(() => {
    getChallenge(false);
    const interval = setInterval(() => getChallenge(true), 3000);
    return () => clearInterval(interval);
  }, [name]);

  // Update latest screenshot when conversation or API response changes
  useEffect(() => {
    if (conversation.length > 0) {
      const screenshots = conversation
        .filter(msg => msg.screenshot?.url)
        .map(msg => ({
          url: msg.screenshot.url,
          date: new Date(msg.date)
        }));
      
      if (screenshots.length > 0) {
        const mostRecentChat = screenshots[screenshots.length - 1];
        // Only update if this chat screenshot is more recent than current
        if (!latestScreenshot?.date || mostRecentChat.date > latestScreenshot.date) {
          setLatestScreenshot(mostRecentChat);
        }
      }
    }
  }, [conversation]);

  async function read(reader) {
    setWriting(true);
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream completed");
      setWriting(false);
      return;
    }
    const chunk = new TextDecoder("utf-8").decode(value);

    setConversation((prevMessages) => {
      setLoading(false);
      let messagesCopy = [...prevMessages];
      const lastMessage = messagesCopy[messagesCopy.length - 1];
      
      let parsedChunk;
      try {
        parsedChunk = JSON.parse(chunk);
        // If this is a new screenshot, check if it's more recent than current
        if (parsedChunk.screenshot?.url) {
          const newScreenshot = {
            url: parsedChunk.screenshot.url,
            date: new Date(parsedChunk.date || new Date())
          };
          if (!latestScreenshot?.date || newScreenshot.date > latestScreenshot.date) {
            setLatestScreenshot(newScreenshot);
          }
        } else if(!parsedChunk.content) {
          parsedChunk = { content: chunk };
        }
      } catch (e) {
        parsedChunk = { content: chunk };
      }

      if (lastMessage && lastMessage.role === "assistant") {
        messagesCopy[messagesCopy.length - 1] = {
          ...lastMessage,
          ...parsedChunk,
          content: lastMessage.content + (parsedChunk.content || ""),
          date: messagesCopy.date ? messagesCopy.date : new Date().toISOString(),
        };
      } else {
        messagesCopy = [
          ...messagesCopy,
          {
            role: "assistant",
            ...parsedChunk,
            content: parsedChunk.content || "",
            date: messagesCopy.date ? messagesCopy.date : new Date().toISOString(),
          },
        ];
      }
      return messagesCopy;
    });

    await delay(150);
    return read(reader);
  }

  const conversationCall = async (url, body) => {
    setLoading(true);
    setPageLoading(false);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setError("");
        const reader = response.body.getReader();
        return read(reader);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Failed to send message");
      throw err;
    }
  };

  const getChallenge = async (noLoading) => {
    if (!noLoading) {
      setPageLoading(true);
    }
    try {
      const data = await axios
        .get(
          `/api/challenges/get-challenge?name=${name}&initial=${!noLoading}&price=${price}`
        )
        .then((res) => res.data)
        .catch((err) => err);
      setError(null);
      if (!writing) {
        setChallenge((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data.challenge)
            ? data.challenge
            : prev
        );
        setAttempts((prev) =>
          prev !== data.break_attempts ? data.break_attempts : prev
        );
        setPrice((prev) =>
          prev !== data.message_price ? data.message_price : prev
        );
        setPrize((prev) => (prev !== data.prize ? data.prize : prev));
        setUsdPrice((prev) =>
          prev !== data.usdMessagePrice ? data.usdMessagePrice : prev
        );
        setUsdPrize((prev) => (prev !== data.usdPrize ? data.usdPrize : prev));
        setExpiry((prev) => (prev !== data.expiry ? data.expiry : prev));

        // Update latest screenshot if API returns a more recent one
        if (data.latestScreenshot) {
          const apiScreenshot = {
            url: data.latestScreenshot.url,
            date: new Date(data.latestScreenshot.date)
          };
          if (!latestScreenshot?.date || apiScreenshot.date > latestScreenshot.date) {
            setLatestScreenshot(apiScreenshot);
          }
        }

        const lastMessage = data.chatHistory[data.chatHistory?.length - 1];
        const address = localStorage.getItem("address");

        if (!noLoading) {
          console.log("Updated initial conversation");
          setConversation(data.chatHistory);
        } else if (address && lastMessage?.address != publicKey?.toBase58()) {
          console.log("Updated conversation with new user message");
          setConversation(data.chatHistory);
        }
      }

      setPageLoading(false);
    } catch (err) {
      console.error(err);
      setPageLoading(false);
      setError("Failed to fetch challenge");
    }
  };

  const processPayment = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return false;
    }

    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const tournamentAccountInfo = await connection.getAccountInfo(
        new PublicKey(challenge.tournamentPDA)
      );
      if (!tournamentAccountInfo) {
        throw new Error("Tournament account not found");
      }

      const solutionHash = hashString(prompt);
      const discriminator = calculateDiscriminator("submit_solution");

      const data = Buffer.concat([discriminator, solutionHash]);

      const keys = [
        {
          pubkey: new PublicKey(challenge.tournamentPDA),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const instruction = new TransactionInstruction({
        keys,
        programId: new PublicKey(challenge.idl.address),
        data,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed");

      return signature;
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
      setLoadingPayment(false);
      return false;
    }
  };

  const sendPrompt = async () => {
    try {
      setWriting(true);
      setLoadingPayment(true);
      const signature = await processPayment();
      if (!signature) return;
      setLoadingPayment(false);
      setConversation((prevMessages) => [
        ...prevMessages,
        {
          role: "user",
          content: prompt,
          address: publicKey.toString(),
          date: new Date().toISOString(),
        },
      ]);

      const promptUrl = `/api/conversation/submit/${challenge._id}`;
      const body = {
        prompt,
        walletAddress: publicKey.toString(),
        signature,
      };

      setPrompt("");
      await conversationCall(promptUrl, body);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await sendPrompt();
  };

  const onChange = (e) => {
    const value = e.target.value;
    let sanitizedValue = value;

    if (challenge?.disable?.includes("special_characters")) {
      sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    if (sanitizedValue.length > challenge.characterLimit) {
      sanitizedValue = sanitizedValue.slice(0, challenge.characterLimit);
    }

    if (challenge.charactersPerWord) {
      const maxWordLength = challenge.charactersPerWord;
      const words = sanitizedValue.split(" ");
      const processedWords = words.map((word) => {
        if (word.length > maxWordLength) {
          const chunks = word.match(new RegExp(`.{1,${maxWordLength}}`, "g"));
          return chunks.join(" ");
        }
        return word;
      });

      sanitizedValue = processedWords.join(" ");
    }

    setPrompt(sanitizedValue);
  };

  const override = {
    display: "block",
    margin: "0 auto",
    width: "200px",
  };

  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "75vh",
        }}
      >
        <div className="page-loader">
          <BarLoader color="#ccc" size={150} cssOverride={override} />
          <br />
          <span style={{ textTransform: "capitalize" }}>
            Loading {name} Interface...
          </span>
        </div>
      </div>
    );
  }

  // Helper function to determine if a message is part of an assistant sequence
  const isPartOfAssistantSequence = (index) => {
    if (index === 0) return false;
    const currentMessage = conversation[index];
    const previousMessage = conversation[index - 1];
    if (index + 1 < conversation.length)
      return currentMessage.role === "assistant" && (previousMessage.role === "assistant" || conversation[index + 1].role === "assistant");
    return currentMessage.role === "assistant" && previousMessage.role === "assistant";
  };

  // Helper function to determine if a message is the last in an assistant sequence
  const isLastInAssistantSequence = (index) => {
    if (index === conversation.length - 1) return true;
    const currentMessage = conversation[index];
    const nextMessage = conversation[index + 1];
    return currentMessage.role === "assistant" && nextMessage.role !== "assistant";
  };

  // Helper function to determine if a message is the first in an assistant sequence
  const isFirstInAssistantSequence = (index) => {
    if (index === 0) return true;
    const currentMessage = conversation[index];
    const previousMessage = conversation[index - 1];
    return currentMessage.role === "assistant" && previousMessage.role !== "assistant";
  };

  return (
    <main className="main">
      <div className="chatPageWrapper">
        <div className="chatHeader">
          <Header
            challenge={challenge}
            attempts={attempts}
            price={price}
            prize={prize}
            usdPrice={usdPrice}
            usdPrize={usdPrize}
            hiddenItems={["API", "BREAK", "SOCIAL"]}
          />
        </div>
        <div className="chatPageMain">
          {/* Main Content Area */}
          <div className="conversationSection">
            <StreamView 
              challenge={challenge}
              latestScreenshot={latestScreenshot}
              attempts={attempts}
              prize={prize}
              usdPrize={usdPrize}
              expiry={expiry}
            />
          </div>

          {/* Chat Sidebar */}
          <div className="chatMenu">
            <div className="chat-header">
              <ChatStats 
                usdPrice={usdPrice}
                price={price}
                expiry={expiry}
                maxActions={challenge?.max_actions}
              />
            </div>
            <div className="chat-container">
              <div ref={chatRef} className="conversation">
                {conversation && conversation.length > 0 ? (
                  conversation.map((message, index) => (
                    <ChatMessage 
                      key={index} 
                      message={message} 
                      challenge={challenge}
                      isPartOfSequence={message.role === "assistant" && isPartOfAssistantSequence(index)}
                      isLastInSequence={message.role === "assistant" && isLastInAssistantSequence(index)}
                      isFirstInSequence={message.role === "assistant" && isFirstInAssistantSequence(index)}
                    />
                  ))
                ) : error ? (
                  <div className="error-message">
                    <FaSadCry size={44} />
                    <h2>{error}</h2>
                  </div>
                ) : null}
                {loading && conversation?.length > 0 && (
                  <div className="loading-indicator">
                    <RingLoader color="#9147ff" size={30} />
                  </div>
                )}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="chat-footer">
                <Footer
                  status={challenge?.status}
                  value={prompt}
                  task={challenge?.task}
                  start_date={challenge?.start_date}
                  submit={(e) => {
                    e.preventDefault();
                    submit(e);
                  }}
                  onChange={onChange}
                  allowed={true}
                  button={
                    connected ? (
                      <button
                        type="submit"
                        disabled={loadingPayment}
                      >
                        {loadingPayment ? (
                          <RingLoader color="#fff" size={18} />
                        ) : (
                          <PiPaperPlaneRightFill size={20} />
                        )}
                      </button>
                    ) : (
                      <WalletMultiButton />
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu with Stream View */}
        <MobileMenu
          challenge={challenge}
          latestScreenshot={latestScreenshot}
          attempts={attempts}
          prize={prize}
          usdPrize={usdPrize}
          usdPrice={usdPrice}
          expiry={expiry}
          hiddenItems={["API", "BREAK", "SOCIAL"]}
          absolute={true}
        />
      </div>
    </main>
  );
}
