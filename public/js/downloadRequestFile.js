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
    try {
        const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!pattern.test(url)) {
            showRightBelowToast('<p class="color-red">Download file error!</p>');
            return;
        }

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
    } catch (error) {
        showRightBelowToast(`<p class="color-red">Download file error ${error}!</p>`);
    }
}