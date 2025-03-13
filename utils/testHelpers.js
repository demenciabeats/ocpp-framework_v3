import { waitForResponse } from './waitForResponse';
import {
    sendBootNotification,
    sendAuthorize,
    sendStartTransaction,
    sendStopTransaction,
    sendHeartbeat,
    sendStatusNotification,
    sendChangeAvailability
} from '../api/ocppMessages';
import { 
    generateAndSendMeterValues, 
    generateAndSendTriphaseMeterValues 
} from './meterValues';

/**
 * Envía un comando a través de API y espera la respuesta WebSocket del sistema central
 * @param {object} request - Objeto request de Playwright
 * @param {object} apiConfig - Configuración de la API a ejecutar
 * @param {object} ocppClient - Cliente OCPP para escuchar la respuesta
 * @param {number} timeoutMs - Tiempo máximo de espera en milisegundos
 * @returns {Promise<object>} - Respuesta del sistema central
 */
export async function sendApiAndWaitForResponse(request, apiConfig, ocppClient, timeoutMs = 60000) {
  console.log(`Enviando petición API: ${apiConfig.name}`);
  
  // Configurar el listener para capturar mensajes antes de enviar la solicitud API
  let messagePromiseResolve;
  let messagePromiseReject;
  let messageReceived = false;
  
  const messagePromise = new Promise((resolve, reject) => {
    messagePromiseResolve = resolve;
    messagePromiseReject = reject;
  });

  function onMessage(raw) {
    try {
      if (messageReceived) return; // Evitar procesar múltiples veces
      
      if (Buffer.isBuffer(raw)) {
        raw = raw.toString('utf-8');
      }
      
      const data = JSON.parse(raw);
      const timestamp = new Date().toISOString();
      console.log(`📥 [${timestamp}] Mensaje recibido:`, data);
      
      // Validar que sea un mensaje de tipo CALL (2) del sistema central
      if (data[0] === 2) {
        // Verificar si es un mensaje relevante para RemoteStartTransaction o RemoteStopTransaction
        if (data[2] === "RemoteStartTransaction" || 
            data[2] === "RemoteStopTransaction" || 
            data[2] === "ChangeAvailability") {
          console.log(`✅ Mensaje del tipo esperado recibido: ${data[2]}`);
          messageReceived = true;
          messagePromiseResolve(data);
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar mensaje durante espera de respuesta del sistema central:', error);
    }
  }
  
  // Agregar el listener
  ocppClient.socket.on('message', onMessage);
  
  // Configurar el timeout
  const timeoutId = setTimeout(() => {
    if (!messageReceived) {
      ocppClient.socket.off('message', onMessage);
      console.error(`⏱️ Timeout esperando mensaje del sistema central después de API ${apiConfig.name}`);
      messagePromiseReject(new Error(`Timeout esperando respuesta del sistema central después de API ${apiConfig.name}`));
    }
  }, timeoutMs);
  
  // Enviar la petición API y esperar el mensaje OCPP en paralelo
  const apiPromise = request[apiConfig.method.toLowerCase()](apiConfig.url, {
    headers: apiConfig.defaultHeaders,
    data: apiConfig.body
  });
  
  try {
    // Esperar a que ambas promesas se resuelvan (o una falle)
    const [centralResponse, apiResponse] = await Promise.allSettled([
      messagePromise,
      apiPromise
    ]);
    
    // Limpiar listener y timeout
    clearTimeout(timeoutId);
    ocppClient.socket.off('message', onMessage);
    
    // Procesar resultados
    if (centralResponse.status === 'fulfilled') {
      console.log("Mensaje OCPP capturado correctamente");
    } else {
      console.warn("No se capturó mensaje OCPP:", centralResponse.reason?.message);
    }
    
    if (apiResponse.status === 'fulfilled') {
      console.log(`Respuesta API ${apiConfig.name} [${apiResponse.value.status()}]`);
    } else {
      console.error("Error en la API:", apiResponse.reason?.message);
    }
    
    return { 
      apiResponse: apiResponse.value, 
      centralResponse: centralResponse.value 
    };
  } catch (error) {
    // Limpiar recursos en caso de error
    clearTimeout(timeoutId);
    ocppClient.socket.off('message', onMessage);
    throw error;
  }
}

export async function bootNotification(ocppClient, bootData) {
    const bootReqId = sendBootNotification(ocppClient, bootData);
    return await waitForResponse(ocppClient, bootReqId);
}

export async function authorize(ocppClient, idTag) {
    const authReqId = sendAuthorize(ocppClient, idTag);
    return await waitForResponse(ocppClient, authReqId);
}

export async function startTransaction(ocppClient, startData) {
    const startReqId = sendStartTransaction(ocppClient, startData);
    return await waitForResponse(ocppClient, startReqId);
}

export async function stopTransaction(ocppClient, stopData) {
    const stopReqId = sendStopTransaction(ocppClient, stopData);
    return await waitForResponse(ocppClient, stopReqId);
}

export async function heartbeat(ocppClient) {
    const heartbeatReqId = sendHeartbeat(ocppClient);
    return await waitForResponse(ocppClient, heartbeatReqId);
}

export async function statusNotification(ocppClient, statusData) {
    const statusReqId = sendStatusNotification(ocppClient, statusData);
    return await waitForResponse(ocppClient, statusReqId);
}

export async function changeAvailability(ocppClient, connectorId, type) {
    const changeAvailReqId = sendChangeAvailability(ocppClient, connectorId, type);
    return await waitForResponse(ocppClient, changeAvailReqId, 30000);
}

export async function simulateCharging(ocppClient, transactionId, intervalSeconds, durationSeconds, connector) {
    await generateAndSendMeterValues(ocppClient, transactionId, intervalSeconds, durationSeconds, connector);
}

export async function flowCharge(ocppClient, authData, startData, statusData, connector) {
    console.log("Iniciando flujo de carga completo...");
    await authorize(ocppClient, authData);
    console.log("Autorización completada, iniciando transacción...");
    const startResponse = await startTransaction(ocppClient, startData);
    const transactionId = startResponse.transactionId;
    console.log(`Transacción iniciada con ID: ${transactionId}`);
    
    const chargingStatus = { ...statusData, status: "Charging", connectorId: startData.connectorId };
    await statusNotification(ocppClient, chargingStatus);
    console.log("Estado de carga enviado: Charging");

    console.log("Esperando 30 segundos antes de enviar MeterValues...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    let finalMeterValueCounter = 0;
    try {
        console.log("Iniciando envío de MeterValues...");

        // Para medición monofásica:
        // finalMeterValueCounter = await generateAndSendMeterValues(ocppClient, transactionId);

        // Para medición trifásica:
        finalMeterValueCounter = await generateAndSendTriphaseMeterValues(ocppClient, transactionId);
    } catch (error) {
        console.error('Error durante el envío de MeterValues:', error);
    } finally {
        console.log("Finalizando transacción...");
        const stopData = {
            transactionId,
            meterStop: finalMeterValueCounter || 0,
            timestamp: new Date().toISOString()
        };
        await stopTransaction(ocppClient, stopData);
        console.log("Transacción finalizada con éxito.");
    }
}
