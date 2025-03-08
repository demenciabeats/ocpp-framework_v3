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
                handleMessage(data, this.meterValuesLog);
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
}

export default OcppClient;
