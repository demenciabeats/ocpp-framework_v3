import WebSocket from 'ws';
import { handleMessage } from './messageHandler';
import { generateUniqueId } from './utils';

class OcppClient {
    constructor(wsUrl, chargePointId) {
        if (!wsUrl) {
            throw new Error('El parámetro wsUrl es requerido. Verifica tu archivo .env');
        }
        if (!chargePointId) {
            throw new Error('El parámetro chargePointId es requerido. Verifica tu archivo .env');
        }        
        this.wsUrl = wsUrl;
        this.chargePointId = chargePointId;
        this.socket = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                const fullUrl = `${this.wsUrl}/${this.chargePointId}`;
                console.log(`🔗 Intentando conectar a: ${fullUrl}`);
                
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
        console.log('🔌 Cerrando WebSocket');
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
                        value: `${currentSoc.toFixed(2)}`,
                        unit: "Percent",
                        context: "Sample.Periodic",
                        format: "Raw",
                        measurand: "SoC",
                        location: "EVSE"
                    },
                    {
                        value: `${power.toFixed(2)}`,
                        unit: "W",
                        context: "Sample.Periodic",
                        format: "Raw",
                        measurand: "Power.Active.Import",
                        location: "Outlet"
                    },
                    {
                        value: `${energyDelivered.toFixed(2)}`,
                        unit: "A",
                        context: "Sample.Periodic",
                        format: "Raw",
                        measurand: "Current.Import",
                        location: "Outlet"
                    },
                    {
                        value: `${meterValueCounter.toFixed(2)}`,
                        unit: "Wh",
                        context: "Sample.Periodic",
                        format: "Raw",
                        measurand: "Energy.Active.Import.Register",
                        location: "Outlet"
                    }
                ]
            };
            this.sendMeterValues(connector.connectorId, transactionId, [meterValue]);
            durationSeconds -= intervalSeconds;
        }, intervalSeconds * 1000);
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
