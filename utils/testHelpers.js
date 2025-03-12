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
import { generateAndSendMeterValues } from './meterValues';

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

    // Reducir el tiempo de espera inicial para no agotar el timeout del test
    console.log("Esperando 30 segundos antes de enviar MeterValues...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Reducir la cantidad de ciclos para completar más rápido
    const cycles = 12; //(12 ciclos de 10 segundos)
    let meterValueCounter = 0;
    let currentSoc = connector.initialSoc;

    try {
        console.log(`Iniciando envío de MeterValues: ${cycles} ciclos de 10 segundos...`);
        // Enviar MeterValues: inmediato y cada 10 segundos por 2 minutos (12 ciclos)
        for (let i = 0; i <= cycles; i++) {
            console.log(`MeterValue ciclo ${i+1}/${cycles+1}`);
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
            ocppClient.sendMeterValues(connector.connectorId, transactionId, [meterValue]);

            if (i < cycles) {
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
    } catch (error) {
        console.error('Error durante el envío de MeterValues:', error);
    } finally {
        console.log("Finalizando transacción...");
        // Este bloque se ejecuta siempre, asegurando que se llame a stopTransaction
        const stopData = {
            transactionId,
            meterStop: meterValueCounter,
            timestamp: new Date().toISOString()
        };
        await stopTransaction(ocppClient, stopData);
        console.log("Transacción finalizada con éxito.");
    }
}
