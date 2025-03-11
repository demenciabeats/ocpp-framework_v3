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
import { generateAndSendMeterValues } from '../api/utils';

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

// Nuevo flujo flowCharge
export async function flowCharge(ocppClient, authData, startData, statusData, connector) {
  // Autorizar
  await authorize(ocppClient, authData);
  // Iniciar Transacción y obtener la respuesta para extraer el transactionId real
  const startResponse = await startTransaction(ocppClient, startData);
  const transactionId = startResponse.transactionId; // Se extrae el transactionId de la respuesta
  // Enviar statusNotification con estado "Charging"
  const chargingStatus = { ...statusData, status: "Charging", connectorId: startData.connectorId };
  await statusNotification(ocppClient, chargingStatus);
  
  // Esperar 30 segundos
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Enviar MeterValues: inmediato y cada 10 segundos por 1 minuto y medio (9 ciclos)
  const cycles = 9;
  let meterValueCounter = 0;
  let currentSoc = connector.initialSoc;
  for (let i = 0; i <= cycles; i++) {
    const now = new Date().toISOString();
    const power = connector.maxPower * 1000; // Convertir kW a W
    const energyDelivered = (power * 10) / 3600; // Energía en Wh para intervalo de 10 seg.
    meterValueCounter += energyDelivered;
    currentSoc += (energyDelivered / (connector.batteryCapacity * 1000)) * 100;
  
    const meterValue = {
      timestamp: now,
      sampledValue: [
        {
          value: currentSoc.toFixed(2),
          unit: "Percent",
          context: "Sample.Periodic",
          format: "Raw",
          measurand: "SoC",
          location: "EVSE"
        },
        {
          value: power.toFixed(2),
          unit: "W",
          context: "Sample.Periodic",
          format: "Raw",
          measurand: "Power.Active.Import",
          location: "Outlet"
        },
        {
          value: energyDelivered.toFixed(2),
          unit: "A",
          context: "Sample.Periodic",
          format: "Raw",
          measurand: "Current.Import",
          location: "Outlet"
        },
        {
          value: meterValueCounter.toFixed(2),
          unit: "Wh",
          context: "Sample.Periodic",
          format: "Raw",
          measurand: "Energy.Active.Import.Register",
          location: "Outlet"
        }
      ]
    };
    // Enviar MeterValues usando el transactionId obtenido de la respuesta
    ocppClient.sendMeterValues(connector.connectorId, transactionId, [meterValue]);
    if (i < cycles) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  // Enviar StopTransaction con el acumulado
  const stopData = {
    transactionId,
    meterStop: meterValueCounter,
    timestamp: new Date().toISOString()
  };
  await stopTransaction(ocppClient, stopData);
}