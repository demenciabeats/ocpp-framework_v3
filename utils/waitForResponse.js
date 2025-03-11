export async function waitForResponse(ocppClient, requestId, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    function onMessage(raw) {
      try {
        if (Buffer.isBuffer(raw)) {
          raw = raw.toString('utf-8');
        }

        const data = JSON.parse(raw);
        console.log('📥 Mensaje recibido:', data);
        if (data[0] === 3 && String(data[1]) === String(requestId)) {
          ocppClient.socket.off('message', onMessage);
          resolve(data[2]);
        }
        // Manejo de errores: si se recibe respuesta tipo 4 para el requestId, rechaza la promesa
        if (data[0] === 4 && String(data[1]) === String(requestId)) {
          ocppClient.socket.off('message', onMessage);
          return reject(new Error(`Error response: ${data[2]} - ${data[3]}`));
        }
      } catch (error) {
        console.error('❌ Error al procesar el mensaje:', error);
      }
    }

    ocppClient.socket.on('message', onMessage);
    setTimeout(() => {
      ocppClient.socket.off('message', onMessage);
      reject(new Error(`Timeout esperando respuesta a solicitud ${requestId}`));
    }, timeoutMs);
  });
}