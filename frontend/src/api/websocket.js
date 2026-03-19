// WebSocket configuration
const WS_BASE_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

export const getWebSocketUrl = () => {
  return `${WS_BASE_URL}/ws`;
};

export default getWebSocketUrl;
