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
