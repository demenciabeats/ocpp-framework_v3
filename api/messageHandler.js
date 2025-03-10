export function handleMessage(data) {
    let parsedData;

    try {
            if (Buffer.isBuffer(data)) {
            data = data.toString('utf-8');
        }

        parsedData = JSON.parse(data);
        console.log('📥 Mensaje parseado:', parsedData);
    } catch (error) {
        console.error('❌ Error al parsear el mensaje:', error);
        return;
    }
}