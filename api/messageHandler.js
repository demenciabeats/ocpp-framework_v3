export function handleMessage(data) {
    console.log('📥 Recibido:', data);

    let parsedData;

    try {
        // Convertir buffer a cadena de texto si es necesario
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