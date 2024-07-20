document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'link' that have the data-bs-toggle attribute
    document.querySelectorAll('.bi-share').forEach(function(element) {
        element.addEventListener('click', function() {
            // Get CID
            const cid = this.dataset.cid;

            // update the sharing link in the modal
            const link = document.querySelector('.sharing-link');
            link.innerHTML = `https://peach-necessary-quail-650.mypinata.cloud/ipfs/${cid}`;

            // Find the modal and set its cid attribute
            const copyLinkButton = document.getElementById('copyLinkBtn');
            if (copyLinkButton) {
                copyLinkButton.setAttribute('data-cid', cid);
            }
        });
    });
});

const copyLinkBtn = document.getElementById('copyLinkBtn');

copyLinkBtn.addEventListener('click', async function() {
    const cid = copyLinkBtn.dataset.cid;

    //copy the link to clipboard
    navigator.clipboard.writeText(`https://peach-necessary-quail-650.mypinata.cloud/ipfs/${cid}`);
    
    //show message
    showRightBelowToast('Link copied to clipboard');
}
);