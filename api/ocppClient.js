import WebSocket from 'ws';
import { handleMessage } from './messageHandler';
import { generateUniqueId } from './utils';

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

    sendMeterValues(transactionId, meterValue) {
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

    async generateAndSendMeterValues(transactionId, intervalSeconds, durationSeconds, connector) {
        const { maxPower, batteryCapacity, initialSoc } = connector;
        let currentSoc = initialSoc;
        let meterValueCounter = 0;

        const intervalId = setInterval(() => {
            if (durationSeconds <= 0) {
                clearInterval(intervalId);
                return;
            }

            const power = maxPower * 1000; // Convertir kW a W
            const energyDelivered = (power * intervalSeconds) / 3600; // Energía en Wh
            meterValueCounter += energyDelivered;
            currentSoc += (energyDelivered / (batteryCapacity * 1000)) * 100; // Actualizar SOC

            const meterValue = {
                timestamp: new Date().toISOString(),
                sampledValue: [
                    {
                        value: `${meterValueCounter}`,
                        unit: "Wh",
                        measurand: "Energy.Active.Import.Register"
                    },
                    {
                        value: `${power}`,
                        unit: "W",
                        measurand: "Power.Active.Import"
                    },
                    {
                        value: `${currentSoc.toFixed(2)}`,
                        unit: "%",
                        measurand: "SoC"
                    }
                ]
            };

            this.sendMeterValues(transactionId, [meterValue]);
            durationSeconds -= intervalSeconds;
        }, intervalSeconds * 1000);
    }
}

export default OcppClient;
