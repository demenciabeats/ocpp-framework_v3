import dotenv from 'dotenv'; // Añadido para cargar .env
dotenv.config();

import WebSocket from 'ws';
import { handleMessage } from './messageHandler';
import { generateUniqueId } from './utils';

class OcppClient {
    constructor(wsUrl, chargePointId) {
        // Usar wsUrl y chargePointId pasados o obtenerlos de process.env
        this.wsUrl = wsUrl || process.env.WS_URL;
        this.chargePointId = chargePointId || process.env.CHARGE_POINT_ID;

        if (!this.wsUrl) {
            throw new Error('El parámetro wsUrl es requerido. Verifica tu archivo .env');
        }
        if (!this.chargePointId) {
            throw new Error('El parámetro chargePointId es requerido. Verifica tu archivo .env');
        }
        this.socket = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                const fullUrl = `${this.wsUrl}/${this.chargePointId}`;
                
                this.socket = new WebSocket(fullUrl, ["ocpp1.6"], {
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
            } catch (error) {
                console.error('❌ Error al crear la conexión WebSocket:', error);
                reject(error);
            }
        });
    }

    sendMessage(message) {
        console.log('📤 Enviando:', JSON.stringify(message));
        this.socket.send(JSON.stringify(message));
    }

    close() {
        console.log('💀 Cerrando WebSocket');
        this.socket.close();
    }
    
    sendBootNotification(vendor, model, serialNumber, chargeBoxSerialNumber, firmwareVersion, iccid, imsi, meterType, meterSerialNumber) {
        const uniqueId = generateUniqueId();
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
        const uniqueId = generateUniqueId();
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
        const uniqueId = generateUniqueId();
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

    sendMeterValues(connectorId, transactionId, meterValue) {
        const uniqueId = generateUniqueId();
        const message = [
            2,
            uniqueId,
            "MeterValues",
            {
                connectorId,
                transactionId,
                meterValue
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendStopTransaction(transactionId, meterStop, timestamp) {
        const uniqueId = generateUniqueId();
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
        const uniqueId = generateUniqueId();
        const message = [
            2,
            uniqueId,
            "Heartbeat",
            {}
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendStatusNotification(connectorId, status, errorCode) {
        const uniqueId = generateUniqueId();
        const message = [
            2,
            uniqueId,
            "StatusNotification",
            {
                connectorId,
                status,
                errorCode,
                timestamp: new Date().toISOString()
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    sendChangeAvailability(connectorId, type) {
        const uniqueId = generateUniqueId();
        const message = [
            2,
            uniqueId,
            "ChangeAvailability",
            {
                connectorId,
                type // "Operative" o "Inoperative"
            }
        ];
        this.sendMessage(message);
        return uniqueId;
    }

    // Nuevo método para procesar la orden ChangeAvailability recibida del CSMS
    handleChangeAvailability(command) {
        console.log('🔄 Procesando ChangeAvailability recibido:', command);
        // Si el comando indica "Unavailable", se responde enviando StatusNotification con "Unavailable"
        if (command.type === "Unavailable") {
            return this.sendStatusNotification(command.connectorId, "Unavailable", "NoError");
        }
        // Se podría manejar otros casos según la lógica
        return null;
    }
}

export default OcppClient;
