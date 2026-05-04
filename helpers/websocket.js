let wssInstance = null;

export function initWebSocket(wss) {
  wssInstance = wss;
}

export function broadcast(data) {
  if (!wssInstance) return;
  const payload = JSON.stringify(data);
  wssInstance.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}
