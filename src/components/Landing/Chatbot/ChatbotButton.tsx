import React from "react";

interface ChatbotButtonProps {
  onClick: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      borderRadius: "50%",
      width: "60px",
      height: "60px",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "2rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 1000,
      border: "none",
      cursor: "pointer",
    }}
    aria-label="Abrir chat"
  >
    💬
  </button>
);

export default ChatbotButton; 