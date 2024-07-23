async function loadMimeTypes() {
    try {
        const response = await fetch('/home/mimeTypes', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        const mimeTypes = await response.json();
        const extensionToMimeType = mimeTypes.acceptType;
        return extensionToMimeType;
    } catch (error) {
        console.error('Error loading mime types:', error);
    }
}

const extensionToMimeType = loadMimeTypes();

// Function to get MIME type from file extension
function getMimeType(extension) {
    if (!extensionToMimeType) {
        extensionToMimeType = loadMimeTypes();
    }
    return extensionToMimeType[extension] || 'application/octet-stream'; // Default MIME type
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function uint8ArrayToBase64(uint8Array) {
    let binaryString = '';
    const chunkSize = 0x8000; // Maximum chunk size
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binaryString);
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}