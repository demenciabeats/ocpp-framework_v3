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
    // Aumentamos el timeout a 15000ms (15 segundos) para esperar la respuesta del CSMS
    return await waitForResponse(ocppClient, changeAvailReqId, 30000);
}

export async function simulateCharging(ocppClient, transactionId, intervalSeconds, durationSeconds, connector) {
    await generateAndSendMeterValues(ocppClient, transactionId, intervalSeconds, durationSeconds, connector);
}