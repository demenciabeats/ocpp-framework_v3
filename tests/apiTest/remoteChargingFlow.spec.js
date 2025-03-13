import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRequest from '../../utils/apiClient';
import apiConfig from '../../api/apiConfig';
import { 
  sendApiAndWaitForResponse, 
  startTransaction, 
  statusNotification, 
  stopTransaction,
  heartbeat
} from '../../utils/testHelpers';
import { generateAndSendMeterValues } from '../../utils/meterValues';
import OcppClient from '../../api/ocppClient';
import testData from '../../data/testData'; // Añadir esta importación

// Cargar variables de entorno desde el archivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', '.env');

if (fs.existsSync(envPath)) {
  console.log(`Cargando variables de entorno desde: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`No se encontró .env en ${envPath}`);
}

// Verificar que las variables de entorno estén disponibles
console.log("WS_URL:", process.env.WS_URL);
console.log("CHARGE_POINT_ID:", process.env.CHARGE_POINT_ID);

// Forzar un mayor timeout para dar tiempo a completar el flujo
test.setTimeout(600000); // 10 minutos

test.describe('Flujo de carga remota', () => {
  test('Carga remota con Start/Stop Transaction', async () => {
    const remoteStartConfig = {
      ...apiConfig.remoteStartFull,
      body: {
        ...apiConfig.remoteStartFull.body
      }
    };
    const remoteStartResponse = await apiRequest(remoteStartConfig);
    expect(remoteStartResponse?.body).toBeDefined();

    // 2. Escuchar el mensaje proveniente del sistema central y capturar transactionId
    const centralMessage = await listenForCentralSystemMessage();
    const transactionId = centralMessage.transactionId;
    expect(transactionId).toBeDefined();

    // 3. Enviar StartTransaction
    const startTxResponse = await sendStartTransaction(transactionId);
    expect(startTxResponse).toBeDefined();

    // 4. Enviar StatusNotification a "Charging"
    const statusResponse = await sendStatusNotification(transactionId, 'Charging');
    expect(statusResponse).toBeDefined();

    // 5. Esperar 30 segundos
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 6. Enviar MeterValues por 2 minutos
    const meterValuesDuration = 2 * 60 * 1000;
    const meterStartTime = Date.now();
    while (Date.now() - meterStartTime < meterValuesDuration) {
      await sendMeterValues(transactionId);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    const ocppClient = new OcppClient(wsUrl, chargePointId);
    await ocppClient.connect();
    
    try {
      // Asegurarse de que el cargador esté listo y disponible
      const connectorId = apiConfig.remoteStartFull.body.ocpiPhyConnectorId;
      console.log(`1. Enviando StatusNotification 'Available' para el conector ID: ${connectorId}`);
      await statusNotification(ocppClient, {
        connectorId: connectorId,
        status: "Available",
        errorCode: "NoError"
      });
      
      // Reducir esperas iniciales para compensar la espera de 30 segundos más adelante
      console.log("2. Esperando 2 segundos para asegurar que el sistema registre el estado...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enviar heartbeat para mantener la conexión activa
      console.log("3. Enviando Heartbeat para mantener la conexión activa...");
      await heartbeat(ocppClient);
      
      console.log(`4. Enviando StatusNotification 'Preparing' para el conector ID: ${connectorId}`);
      await statusNotification(ocppClient, {
        connectorId: connectorId,
        status: "Preparing",
        errorCode: "NoError"
      });
      
      // Reducir tiempo de espera
      console.log("5. Esperando 2 segundos para asegurar que el sistema registre el estado...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Usar la configuración exacta de apiConfig sin modificaciones
      console.log("6. Enviando API RemoteStartTransaction para conector ID:", connectorId);
      try {
        const { apiResponse, centralResponse } = await sendApiAndWaitForResponse(
          request, 
          apiConfig.remoteStartFull, // Usar la configuración original sin modificar
          ocppClient,
          5000
        );
        
        console.log("7. Respuesta API recibida:", apiResponse.status());
        
        // Verificar si la respuesta contiene el mensaje de timeout pero aún así tenemos el mensaje OCPP
        const responseBody = JSON.parse(await apiResponse.text());
        
        if (responseBody && responseBody.code === 3 && responseBody.message === "Connector responded as timeout") {
          console.log("8. API informó timeout en el conector, pero el mensaje OCPP fue capturado correctamente");
          console.log("   (Este comportamiento es normal en el entorno de pruebas)");
        } else if (apiResponse.status() === 200) {
          console.log("8. API aceptada con éxito");
        } else {
          console.log("8. API devolvió código de error:", apiResponse.status());
        }
        
        // Verificar que tengamos el mensaje del sistema central sin importar la respuesta de la API
        if (!centralResponse) {
          throw new Error("No se recibió mensaje OCPP del sistema central");
        }
        
        // Extraer información necesaria del mensaje del sistema central
        const messageType = centralResponse[2]; // Típicamente "RemoteStartTransaction"
        const messageBody = centralResponse[3]; // Cuerpo del mensaje con los detalles
        console.log(`9. Mensaje recibido del sistema central: ${messageType}`, messageBody);
        
        // Responder al mensaje RemoteStartTransaction exactamente con el mismo connectorId
        console.log("10. Iniciando transacción con conector ID:", connectorId);
        try {
          const startTxResponse = await startTransaction(ocppClient, {
            connectorId: connectorId, // Usar el ID de conector de la configuración
            idTag: messageBody.idTag || "TESTCARD",
            meterStart: 0,
            timestamp: new Date().toISOString()
          });
        
          expect(startTxResponse).toBeDefined();
          expect(startTxResponse.transactionId).toBeDefined();
          const transactionId = startTxResponse.transactionId;
          console.log(`12. TransactionId recibido: ${transactionId}`);
          
          // Continuar con StatusNotification usando el mismo connectorId
          console.log("13. Enviando StatusNotification 'Charging' para conector ID:", connectorId);
          await statusNotification(ocppClient, {
            connectorId: connectorId,
            status: "Charging",
            errorCode: "NoError"
          });
          
          // Añadir una espera de 30 segundos después de StatusNotification
          console.log("14. Esperando 30 segundos después de StatusNotification...");
          await new Promise(resolve => setTimeout(resolve, 30000));
          
          // Utilizar la función generateAndSendMeterValues para enviar MeterValues durante 1 minuto
          console.log("15. Iniciando envío de MeterValues para conector ID:", connectorId);
          
          // Guardar la configuración original de MeterValues
          const originalInterval = testData.meterValuesConfig.intervalSeconds;
          const originalDuration = testData.meterValuesConfig.durationSeconds;
          
          // Modificar temporalmente para este test: 3 mensajes cada 20 segundos (total 60 segundos)
          testData.meterValuesConfig.intervalSeconds = 20;
          testData.meterValuesConfig.durationSeconds = 60;
          
          // Usar la función existente para generar y enviar MeterValues
          const meterValueCounter = await generateAndSendMeterValues(ocppClient, transactionId);
          console.log(`MeterValues enviados. Contador final: ${meterValueCounter.toFixed(2)} Wh`);
          
          // Restaurar la configuración original
          testData.meterValuesConfig.intervalSeconds = originalInterval;
          testData.meterValuesConfig.durationSeconds = originalDuration;
          
          // No esperar después del envío de MeterValues, pasar directamente a StopTransaction
          console.log("16. Todos los MeterValues enviados, procediendo con StopTransaction");
          
          console.log("17. Enviando StopTransaction...");
          await stopTransaction(ocppClient, {
            transactionId,
            meterStop: meterValueCounter,
            timestamp: new Date().toISOString()
          });
          
          console.log("18. Test completado con éxito");
        } catch (error) {
          console.error("Error procesando la transacción:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error en el procesamiento de la API:", error);
        throw error;
      }
    } finally {
      // Reducir espera antes de cerrar la conexión
      console.log("Esperando 2 segundos antes de cerrar la conexión...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      ocppClient.close();
    }
  });
});