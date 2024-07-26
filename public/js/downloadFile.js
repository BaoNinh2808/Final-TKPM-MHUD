document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the class 'link' that have the data-bs-toggle attribute
    document.querySelectorAll('.download').forEach(function (element) {
        element.addEventListener('click', function () {
            // Get CID & name
            const cid = this.dataset.cid;
            const fileName = this.dataset.fileName;

            const link = `https://peach-necessary-quail-650.mypinata.cloud/ipfs/${cid}`;
            console.log("link", link);
            console.log("cid", cid);
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
        const password = data.password;
        const random_server = data.random_server;
        const is_public = data.is_public;

        

        // Decrypt the file if it is password-protected
        if (is_public === false) {
            showRightBelowToast('Downloading File');
            const iv = hexToUint8Array(ivHex);
            const salt = hexToUint8Array(saltHex);

            console.log("iv", iv);
            console.log("salt", salt);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network Problem");
            }
            const file = await response.arrayBuffer();

            const encryptedData = new Uint8Array(file);

            console.log("retrive file", encryptedData);    
            
            // if has password
            if (has_password === true) {
                // trigger the modal for password
                const base64EncryptedData = uint8ArrayToBase64(encryptedData);
                document.getElementById('enterPassBtn').dataset.base64EncryptedData = base64EncryptedData;
                document.getElementById('enterPassBtn').dataset.ivHex = ivHex;
                document.getElementById('enterPassBtn').dataset.saltHex = saltHex;
                document.getElementById('enterPassBtn').dataset.fileName = fileName;
                document.getElementById('enterPassBtn').dataset.random_server = random_server;
                let modal = new bootstrap.Modal(document.getElementById('modal-enter-password'));
                modal.show();
            }
            else {
                decryptDataAndDownload(encryptedData, iv, salt, random_server, fileName, password);
            }
        }
        else {
            //file not encrypt, just download it
            showRightBelowToast('Downloading File');
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network Problem");
            }
            const file = await response.blob();

            // decryptDataAndDownload(encryptedData, iv, salt, fileName, password);
            let tUrl = URL.createObjectURL(file);
            const tmp1 = document.createElement("a");
            tmp1.href = tUrl;
            tmp1.download = fileName;
            document.body.appendChild(tmp1);
            tmp1.click();
            URL.revokeObjectURL(tUrl);
            tmp1.remove();
        }


    } catch (error) {
        showRightBelowToast(`<p class="color-red">Download file error ${error}!</p>`);
    }
}


function extFn(url) {
    const match = url.match(/\.[0-9a-z]+$/i);
    return match ? match[0].slice(1) : "";
}


async function decryptDataAndDownload(encryptedData, iv, salt, random_server, fileName, password) {
    try {
        showRightBelowToast('Decrypting File');
        const concat_password = password + random_server;
        const key = await deriveKey(concat_password, salt);
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

if (document.getElementById('enterPassBtn')){
    document.getElementById('enterPassBtn').addEventListener('click', async () => {
        const password = document.getElementById('decryptPasswordInput').value.trim();
        const encryptedData = base64ToUint8Array(document.getElementById('enterPassBtn').dataset.base64EncryptedData);
        const iv = hexToUint8Array(document.getElementById('enterPassBtn').dataset.ivHex);
        const salt = hexToUint8Array(document.getElementById('enterPassBtn').dataset.saltHex);
        const fileName = document.getElementById('enterPassBtn').dataset.fileName;
        const random_server = document.getElementById('enterPassBtn').dataset.random_server;

        console.log("password", password.toString());
        console.log("encryptedData",encryptedData);
        console.log("iv",iv);
        console.log("salt",salt);
        console.log("fileName",fileName);
        console.log("random_server",random_server);

        decryptDataAndDownload(encryptedData, iv, salt, random_server, fileName, password);

        console.log("download success");
        //clear data in input field
        document.getElementById('decryptPasswordInput').value = '';
        let modal = bootstrap.Modal.getInstance(document.getElementById('modal-enter-password'));
        modal.hide();
    });
}

if (document.getElementById('toggleDecryptPassword')){
    document.getElementById('toggleDecryptPassword').addEventListener('click', function () {
        const passwordInput = document.getElementById('decryptPasswordInput');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    
        // Toggle the eye slash icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}
