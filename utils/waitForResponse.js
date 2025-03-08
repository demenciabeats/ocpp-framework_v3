export async function waitForResponse(ocppClient, requestId, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    function onMessage(raw) {
      try {
        const data = JSON.parse(raw);
        // data[0] = 3 => Respuesta, data[1] = requestId, data[2] = payload
        if (data[0] === 3 && data[1] === requestId) {
          ocppClient.socket.off('message', onMessage);
          resolve(data[2]);
        }
      } catch {}
    }

    ocppClient.socket.on('message', onMessage);
    setTimeout(() => {
      ocppClient.socket.off('message', onMessage);
      reject(new Error(`Timeout esperando respuesta a solicitud ${requestId}`));
    }, timeoutMs);
  });
}