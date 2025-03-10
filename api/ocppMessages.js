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

export function sendMeterValues(ocppClient, connectorId, transactionId, meterValues, uniqueId) {
    const message = [
        2,
        uniqueId,
        "MeterValues",
        {
            connectorId,
            transactionId,
            meterValue: meterValues
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

export function sendChangeAvailability(ocppClient, connectorId, type) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "ChangeAvailability",
        {
            connectorId: connectorId,
            type: type // "Operative" o "Inoperative"
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendFirmwareStatusNotification(ocppClient, data) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "FirmwareStatusNotification",
        {
            firmwareVersion: data.firmwareVersion
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendGetDiagnostics(ocppClient, data) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "GetDiagnostics",
        {
            location: data.location,
            retries: data.retries,
            retryInterval: data.retryInterval,
            startTime: data.startTime,
            stopTime: data.stopTime
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendDiagnosticsStatusNotification(ocppClient, data) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "DiagnosticsStatusNotification",
        {
            status: data.status
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}

export function sendUpdateFirmware(ocppClient, data) {
    const uniqueId = generateUniqueId();
    const message = [
        2,
        uniqueId,
        "UpdateFirmware",
        {
            location: data.location,
            retries: data.retries,
            retrieveDate: data.retrieveDate,
            retryInterval: data.retryInterval
        }
    ];
    ocppClient.sendMessage(message);
    return uniqueId;
}