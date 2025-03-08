import { generateUniqueId } from './utils';

export function sendBootNotification(ocppClient, bootData) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "BootNotification",
        {
            chargePointVendor: bootData.vendor,
            chargePointModel: bootData.model,
            chargePointSerialNumber: bootData.serialNumber,
            chargeBoxSerialNumber: bootData.chargeBoxSerialNumber,
            firmwareVersion: bootData.firmwareVersion,
            iccid: bootData.iccid,
            imsi: bootData.imsi,
            meterType: bootData.meterType,
            meterSerialNumber: bootData.meterSerialNumber
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendAuthorize(ocppClient, idTag) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "Authorize",
        { idTag }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendStartTransaction(ocppClient, startData) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "StartTransaction",
        {
            connectorId: startData.connectorId,
            idTag: startData.idTag,
            meterStart: startData.meterStart,
            timestamp: startData.timestamp
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendMeterValues(ocppClient, transactionId, meterValue) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "MeterValues",
        {
            transactionId,
            meterValue
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendStopTransaction(ocppClient, stopData) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "StopTransaction",
        {
            transactionId: stopData.transactionId,
            meterStop: stopData.meterStop,
            timestamp: stopData.timestamp
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendHeartbeat(ocppClient) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "Heartbeat",
        {}
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendStatusNotification(ocppClient, statusData) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "StatusNotification",
        {
            connectorId: statusData.connectorId,
            status: statusData.status,
            errorCode: statusData.errorCode,
            timestamp: new Date().toISOString()
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}