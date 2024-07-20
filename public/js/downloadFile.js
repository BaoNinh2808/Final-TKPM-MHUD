document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'link' that have the data-bs-toggle attribute
    document.querySelectorAll('.download').forEach(function(element) {
        element.addEventListener('click', function() {
            // Get CID & name
            const cid = this.dataset.cid;
            const fileName = this.dataset.fileName;

            const link = `https://peach-necessary-quail-650.mypinata.cloud/ipfs/${cid}`;
            // download the file from this link to local
            downFn(link, fileName);
        });
    });
});

function downFn(url, fileName) {
    showRightBelowToast('Downloading File');

    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!pattern.test(url)) {
        showRightBelowToast('<p class="color-red">Download file error!</p>');
        return;
    }

    fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network Problem");
            }
            return res.blob();
        })
        .then((file) => {
            
            let tUrl = URL.createObjectURL(file);
            const tmp1 = document.createElement("a");
            tmp1.href = tUrl;
            tmp1.download = fileName;
            document.body.appendChild(tmp1);
            tmp1.click();

            URL.revokeObjectURL(tUrl);
            tmp1.remove();
        })
        .catch(() => {
            showRightBelowToast('<p class="color-red">Download file error!</p>');
        });
}

function extFn(url) {
    const match = url.match(/\.[0-9a-z]+$/i);
    return match ? match[0].slice(1) : "";
}