import React, { useState, useRef, useEffect } from "react";
import { sendMessageToChatbot } from "../../../utils/chatbotApi";
import ReactMarkdown from "react-markdown";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatbotProps {
  onClose: () => void;
}

const sessionId = "demo-session-1";

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "¡Hola! ¿En qué puedo ayudarte? Ejemplo: '¿tienes sillas para oficina?'" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((msgs) => [...msgs, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessageToChatbot(userMessage, sessionId);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: res.message || res.response || "Sin respuesta" }
      ]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: "bot", text: "Error al conectar con el asistente." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5rem",
        right: "2rem",
        width: 350,
        maxWidth: "90vw",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "70vh",
      }}
    >
      <div style={{ padding: "1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600 }}>Asistente</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto", minHeight: 100, maxHeight: "45vh" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            marginBottom: 8,
          }}>
            <div style={{
              background: msg.sender === "user" ? "#4f46e5" : "#f3f4f6",
              color: msg.sender === "user" ? "#fff" : "#222",
              borderRadius: 12,
              padding: "8px 14px",
              maxWidth: "80%",
              fontSize: 15,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}>
              {msg.sender === "bot"
                ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                : msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #eee", padding: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 15, padding: "8px", borderRadius: 8, background: "#f3f4f6" }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{ marginLeft: 8, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;