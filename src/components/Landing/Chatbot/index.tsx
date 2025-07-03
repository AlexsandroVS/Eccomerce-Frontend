import React, { useState } from "react";
import ChatbotButton from "./ChatbotButton";
import Chatbot from "./Chatbot";

const ChatbotContainer: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && <ChatbotButton onClick={() => setOpen(true)} />}
      {open && <Chatbot onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatbotContainer; 