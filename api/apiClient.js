import { sendGenericRequest } from './genericClient';

class ApiClient {
  /**
   * Envía una petición genérica sin abrir conexión WebSocket.
   * @param {Object} config - Configuración en formato JSON.
   * @returns {Promise<Object>} Resultado de la petición y validación.
   */
  async sendGenericAPIRequest(config) {
    return sendGenericRequest(config);
  }
}

export default ApiClient;