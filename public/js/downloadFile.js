document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the class 'link' that have the data-bs-toggle attribute
    document.querySelectorAll('.download').forEach(function (element) {
        element.addEventListener('click', function () {
            // Get CID & name
            const cid = this.dataset.cid;
            const fileName = this.dataset.fileName;

            const link = `https://peach-necessary-quail-650.mypinata.cloud/ipfs/${cid}`;
            // download the file from this link to local
            downFn(link, fileName, cid);
        });
    });
});

async function downFn(url, fileName, cid) {
    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!pattern.test(url)) {
        showRightBelowToast('<p class="color-red">Download file error!</p>');
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network Problem");
        }
        const file = await response.arrayBuffer();

        const encryptedData = new Uint8Array(file);

        console.log("retrive file", encryptedData);

        // Retrieve IV and salt from server
        const infoResponse = await fetch('/home/getFileInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, cid })
        });
        if (!infoResponse.ok) {
            throw new Error("Network Problem");
        }

        const data = await infoResponse.json();
        const ivHex = data.iv;
        const saltHex = data.salt;
        const has_password = data.has_password;

        const iv = hexToUint8Array(ivHex);
        const salt = hexToUint8Array(saltHex);

        console.log("iv", iv);
        console.log("salt", salt);

        // Decrypt the file
        let password = "password";
        if (has_password) {
            // trigger the modal for password
            const base64EncryptedData = uint8ArrayToBase64(encryptedData);
            document.getElementById('enterPassBtn').dataset.base64EncryptedData = base64EncryptedData;
            document.getElementById('enterPassBtn').dataset.ivHex = ivHex;
            document.getElementById('enterPassBtn').dataset.saltHex = saltHex;
            document.getElementById('enterPassBtn').dataset.fileName = fileName;
            let modal = new bootstrap.Modal(document.getElementById('modal-enter-password'));
            modal.show();
        }
        else {
            decryptDataAndDownload(encryptedData, iv, salt, fileName, password);
        }


    } catch (error) {
        showRightBelowToast(`<p class="color-red">Download file error ${error}!</p>`);
    }
}


function extFn(url) {
    const match = url.match(/\.[0-9a-z]+$/i);
    return match ? match[0].slice(1) : "";
}


function hexToUint8Array(hex) {
    // Ensure the hex string is in uppercase and remove any whitespace
    hex = hex.toUpperCase().replace(/\s+/g, '');

    // Create a new Uint8Array with half the length of the hex string
    const byteArray = new Uint8Array(hex.length / 2);

    // Loop through the hex string and populate the Uint8Array
    for (let i = 0; i < byteArray.length; i++) {
        byteArray[i] = parseInt(hex.substr(i * 2, 2), 16);
    }

    return byteArray;
}

// Define the mapping of file extensions to MIME types
const extensionToMimeType = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'ico': 'image/vnd.microsoft.icon',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'mpeg': 'video/mpeg'
};

// Function to get MIME type from file extension
function getMimeType(extension) {
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

async function decryptDataAndDownload(encryptedData, iv, salt, fileName, password) {
    try {
        showRightBelowToast('Downloading File');
        const key = await deriveKey(password, salt);
        console.log("key", key);
        
        const decryptedData = await decryptData(key, iv, encryptedData);

        console.log("decryptedData", decryptedData);

        // Determine the file extension and MIME type
        const extension = extFn(fileName);
        const mimeType = getMimeType(extension);

        // Convert decrypted data to a Blob
        const blob = new Blob([decryptedData], { type: mimeType });

        // Optionally, you can handle the file download here if needed
        let tUrl = URL.createObjectURL(blob);
        const tmp1 = document.createElement("a");
        tmp1.href = tUrl;
        tmp1.download = fileName;
        document.body.appendChild(tmp1);
        tmp1.click();
        URL.revokeObjectURL(tUrl);
        tmp1.remove();
    }
    catch (error) {
        showRightBelowToast(`<p class="color-red">Error ${error}!</p>`);
    }
}

document.getElementById('enterPassBtn').addEventListener('click', async () => {
    const password = document.getElementById('decryptPasswordInput').value.trim();
    const encryptedData = base64ToUint8Array(document.getElementById('enterPassBtn').dataset.base64EncryptedData);
    const iv = hexToUint8Array(document.getElementById('enterPassBtn').dataset.ivHex);
    const salt = hexToUint8Array(document.getElementById('enterPassBtn').dataset.saltHex);
    const fileName = document.getElementById('enterPassBtn').dataset.fileName;

    console.log("password", password.toString());
    console.log("encryptedData",encryptedData);
    console.log("iv",iv);
    console.log("salt",salt);
    console.log("fileName",fileName);

    decryptDataAndDownload(encryptedData, iv, salt, fileName, password);

    console.log("download success");
    //clear data in input field
    document.getElementById('decryptPasswordInput').value = '';
    let modal = bootstrap.Modal.getInstance(document.getElementById('modal-enter-password'));
    modal.hide();
});

document.getElementById('toggleDecryptPassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('decryptPasswordInput');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the eye slash icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

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