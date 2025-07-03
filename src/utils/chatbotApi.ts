import axios from "axios";

export const sendMessageToChatbot = async (message: string, sessionId: string) => {
  const response = await axios.post(
    "https://chat-boot-m722.onrender.com/chat",
    { message, session_id: sessionId },
    { timeout: 20000 } // 20 segundos, ajusta según lo que tarde tu API
  );
  return response.data;
}; 