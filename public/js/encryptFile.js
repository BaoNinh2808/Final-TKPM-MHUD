async function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
}

async function deriveKey(password, salt) {
    const keyMaterial = await getKeyMaterial(password);
    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(key, data) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );
    return { iv, encryptedData };
}

async function decryptData(key, iv, encryptedData) {
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encryptedData
    );
    return decryptedData;
}

// document.getElementById('encryptButton').addEventListener('click', async () => {
//     const fileInput = document.getElementById('fileInput');
//     const passwordInput = document.getElementById('passwordInput');
//     const file = fileInput.files[0];
//     const password = passwordInput.value;

//     if (!file || !password) {
//         alert('Please select a file and enter a password.');
//         return;
//     }

//     try {
//         const salt = crypto.getRandomValues(new Uint8Array(16));
//         const key = await deriveKey(password, salt);
//         const fileData = await file.arrayBuffer();
//         const { iv, encryptedData } = await encryptData(key, fileData);

//         console.log('Encrypted Data:', new Uint8Array(encryptedData));
//         console.log('IV:', iv);

//         // Store the key, iv, salt, and encrypted data for decryption
//         window.encryptionData = { salt, iv, encryptedData };
//     } catch (error) {
//         console.error('Encryption failed:', error);
//     }
// });

// document.getElementById('decryptButton').addEventListener('click', async () => {
//     const passwordInput = document.getElementById('passwordInput');
//     const password = passwordInput.value;

//     if (!window.encryptionData || !password) {
//         alert('Please encrypt a file first and enter the password.');
//         return;
//     }

//     const { salt, iv, encryptedData } = window.encryptionData;

//     try {
//         const key = await deriveKey(password, salt);
//         const decryptedData = await decryptData(key, iv, encryptedData);

//         console.log('Decrypted Data:', decryptedData);
//     } catch (error) {
//         console.error('Decryption failed:', error);
//     }
// });