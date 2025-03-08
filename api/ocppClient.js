import WebSocket from 'ws';
import { handleMessage } from './messageHandler';

class OcppClient {
    constructor(wsUrl, chargePointId) {
        this.wsUrl = wsUrl;
        this.chargePointId = chargePointId;
        this.socket = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`${this.wsUrl}/${this.chargePointId}`, ["ocpp1.6"], {
                headers: {
                    "Sec-WebSocket-Protocol": "ocpp1.6",
                    "User-Agent": "OCPP-Test-Client"
                }
            });

            this.socket.on('open', () => {
                console.log('✅ Conectado a WebSocket OCPP con subprotocolo ocpp1.6');
                resolve();
            });

            this.socket.on('message', (data) => {
                handleMessage(data);
            });

            this.socket.on('error', (err) => {
                console.error('❌ Error en WebSocket:', err);
                reject(err);
            });
        });
    }

    sendMessage(message) {
        console.log('📤 Enviando:', JSON.stringify(message));
        this.socket.send(JSON.stringify(message));
    }

    close() {
        console.log('🔌 Cerrando WebSocket');
        this.socket.close();
    }

    // Métodos para construir y enviar mensajes OCPP específicos
    sendBootNotification(vendor, model, serialNumber, chargeBoxSerialNumber, firmwareVersion, iccid, imsi, meterType, meterSerialNumber) {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "BootNotification",
            {
                chargePointVendor: vendor,
                chargePointModel: model,
                chargePointSerialNumber: serialNumber,
                chargeBoxSerialNumber: chargeBoxSerialNumber,
                firmwareVersion: firmwareVersion,
                iccid: iccid,
                imsi: imsi,
                meterType: meterType,
                meterSerialNumber: meterSerialNumber
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendAuthorize(idTag) {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "Authorize",
            { idTag }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendStartTransaction(connectorId, idTag, meterStart, timestamp) {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "StartTransaction",
            {
                connectorId,
                idTag,
                meterStart,
                timestamp
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendMeterValues(transactionId, meterValue) {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "MeterValues",
            {
                transactionId,
                meterValue
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendStopTransaction(transactionId, meterStop, timestamp) {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "StopTransaction",
            {
                transactionId,
                meterStop,
                timestamp
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendHeartbeat() {
        const uniqueId = this.generateUniqueId();
        const message = [
            2,
            uniqueId,
            "Heartbeat",
            {}
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default OcppClient;
