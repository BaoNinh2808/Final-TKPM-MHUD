function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'link' that have the data-bs-toggle attribute
    document.querySelectorAll('.bi-trash3').forEach(function(element) {
        element.addEventListener('click', function() {
            // Get file name
            const file_name = this.dataset.fileName;

            // Find the modal and set its file-name attribute
            const confirmButton = document.getElementById('confirmDeleteBtn');
            if (confirmButton) {
                confirmButton.setAttribute('data-file-name', file_name);
            }
        });
    });
});


// click on delete file modal
const deleteFileButton = document.getElementById('confirmDeleteBtn');

deleteFileButton.addEventListener('click', async function() {
    const file_name = deleteFileButton.dataset.fileName;
    // make the delete button disabled
    deleteFileButton.disabled = true;
    deleteFileButton.innerHTML = 'Deleting...';

    // Add your code to delete the file here
    const response = await fetch(`/home`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({file_name}),
    });

    // Check if the request was successful
    if (response.ok) {
        // Close the modal (if needed)
        let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-delete-file'));
        modal.hide();
        
        showRightBelowToast("File deleted successfully");

        await delay(1200);

        // Reload the page
        location.reload();
    } else {
        showRightBelowToast('<p class="color-red">Failed to delete file!</p>');
        let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-delete-project'));
        modal.hide();
        console.error('Failed to delete the file');
    }

    // Reset the button
    deleteFileButton.disabled = false;
    deleteFileButton.innerHTML = 'Delete';
});