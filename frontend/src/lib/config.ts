export function getApiUrls() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const envWs = process.env.NEXT_PUBLIC_WS_URL;

  if (envApi && envWs) {
    return {
      api: envApi,
      ws: envWs,
    };
  }

  // Fallback for local development (supports both localhost and LAN IP)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  return {
    api: `http://${hostname}:6969`,
    ws: `ws://${hostname}:6969`,
  };
}
