import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, '../data/meterValues.json'); // 🔹 Ruta corregida

if (!fs.existsSync(filePath)) {
    console.error('❌ Error: El archivo meterValues.json no existe.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

console.log('🔍 Analizando MeterValues...');

let errores = [];
let valoresEnergia = [];

for (let i = 0; i < data.length; i++) {
    const transactionId = data[i].transactionId;
    const meterValue = data[i].meterValue;

    for (const measurement of meterValue) {
        const timestamp = measurement.timestamp;
        const sampledValues = measurement.sampledValue;

        for (const sample of sampledValues) {
            const { value, unit, measurand } = sample;
            const numericValue = parseFloat(value);

            if (measurand === "Energy.Active.Import.Register") {
                valoresEnergia.push(numericValue);
                if (i > 0 && numericValue < valoresEnergia[i - 1]) {
                    errores.push(`⚠️ Energía bajó de ${valoresEnergia[i - 1]} a ${numericValue} ${unit} en ${timestamp}`);
                }
            }
        }
    }
}

if (errores.length > 0) console.log(errores.join('\n'));
else console.log('✅ Todos los valores están dentro del rango esperado.');
