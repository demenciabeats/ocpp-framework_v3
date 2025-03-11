import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { sendMeterValues } from './ocppMessages';
import testData from '../data/testData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateUniqueId() {
    return uuidv4();
}

let stopRequested = false;

export function stopMeterValues() {
    stopRequested = true;
}

export async function generateAndSendMeterValues(ocppClient, transactionId) {
    const { maxPower, batteryCapacity, initialSoc, connectorId } = testData.connector;
    let { intervalSeconds, durationSeconds } = testData.meterValuesConfig;
    let currentSoc = initialSoc;
    let meterValueCounter = 0;
    const meterValues = [];

    const filePath = path.resolve(__dirname, '../data/meterValues.json');

 
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }

    
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
       
            if (stopRequested || durationSeconds <= 0) {
                clearInterval(intervalId);
              
                fs.writeFileSync(filePath, JSON.stringify(meterValues, null, 2));
                resolve(); 
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

            meterValues.push(meterValue);
            const uniqueId = generateUniqueId();
            sendMeterValues(ocppClient, connectorId, transactionId, [meterValue], uniqueId);
            durationSeconds -= intervalSeconds;
        }, intervalSeconds * 1000);
    });
}