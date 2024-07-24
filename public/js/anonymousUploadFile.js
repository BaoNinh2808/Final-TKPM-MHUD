const uploadButton = document.getElementById('upload-new-file-button');
const dropArea = document.querySelector('.drag-area');
const dragText = document.querySelector('.header');

let button = dropArea.querySelector('.button');
let input = dropArea.querySelector('input');
let removeButton = document.querySelector('.remove');

let files = [];

button.onclick = () => {
    input.click();
};

// when browse
input.addEventListener('change', function () {
    files = Array.from(this.files);
    dropArea.classList.add('active');
    displayFiles();
});

// when file is inside drag area
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('active');
    dragText.textContent = 'Release to Upload';
});

// when file leaves the drag area
dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
    dragText.textContent = 'Drag & Drop';
});

// when file is dropped
dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    files = Array.from(event.dataTransfer.files);
    displayFiles();
});

function displayFiles() {
    dropArea.innerHTML = '';
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let fileType = file.type;
        let validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'video/mp4', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

        if (validExtensions.includes(fileType)) {
            let fileReader = new FileReader();
            fileReader.onload = () => {
                let fileURL = fileReader.result;
                console.log("file", fileURL);
                let divTag = document.createElement('div');
                divTag.classList.add('file-preview');
                if (fileType.startsWith('image/')) {
                    divTag.innerHTML = `<img src="${fileURL}" style="max-width: 400px; max-height: 200px; width: auto; height: auto;" alt="">`;
                } else {
                    let iconClass = 'fas fa-file-alt';  // Default icon class
                    if (fileType === 'application/pdf') {
                        iconClass = 'fas fa-file-pdf';  // PDF icon class
                    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                        iconClass = 'fas fa-file-excel';  // Excel icon class
                    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        iconClass = 'fas fa-file-word';  // Word icon class
                    }
                    divTag.innerHTML = `<div class="file-icon"><i class="${iconClass}"></i></div><div class="file-name">${file.name}</div>`;
                }

                dropArea.appendChild(divTag);
                uploadButton.dataset.fileIndex = i;
            };
            fileReader.readAsDataURL(file);
        } else {
            alert('Invalid file type: ' + file.name);
            removeButton.click();
            return;  // Exit the function after handling invalid file
        }
    }
    showButtons();
}


function showButtons() {
    removeButton.style.display = '';
}

removeButton.addEventListener('click', () => {
    uploadButton.dataset.fileIndex = '';
    files = [];
    dropArea.classList.remove('active');
    dropArea.innerHTML = `
        <div class="icon">
            <i class="fas fa-file-upload"></i>
        </div>
        <span class="header">Drag & Drop</span>
        <span class="header">or <span class="button">browse</span></span>
        <input type="file" hidden multiple />
        <span class="support">Supports: JPEG, JPG, PNG, PDF, XLSX, TXT, DOCX</span>
    `;
    removeButton.style.display = 'none';
    button = dropArea.querySelector('.button');
    input = dropArea.querySelector('input');
    button.onclick = () => {
        input.click();
    };
    // when browse
    input.addEventListener('change', function () {
        files = Array.from(this.files);
        dropArea.classList.add('active');
        displayFiles();
    });
});

uploadButton.addEventListener('click', async () => {
    const fileIndex = uploadButton.dataset.fileIndex;
    if (fileIndex === undefined) {
        alert('No file selected for upload');
        return;
    }

    const file = files[fileIndex];

    const form = document.getElementById('emailForm');
    if (!form.checkValidity()) {
        form.reportValidity(); // Show validation messages
        return;
    }

    // Get the email from the input field
    const email = document.getElementById('inputEmail').value;
    const requireEmail = document.getElementById('inputEmail').dataset.emailRequired;

    if (!email) {
        showRightBelowToast(`<p class="color-red">Please enter your email</p>`);
        return;
    }
    if (email != requireEmail) {
        showRightBelowToast(`<p class="color-red">Please enter the correct email</p>`);
        return;
    }
    
    const title = document.getElementById('requestTitle').dataset.title;
    const description = document.getElementById('requestDescription').dataset.description;
    uploadFile(file, email, title, description);
});

async function uploadFile(file, email, title, description) {

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', email);
        formData.append('title', title);
        formData.append('description', description);

        // Disable the upload button
        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';

        try {
            const response = await fetch('/requestFile/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                removeButton.click();

                // Show success message
                showRightBelowToast("File uploaded successfully!");

                await delay(1000);
            } else {
                const data = await response.json();
                showRightBelowToast(`<p class="color-red">${data.error}</p>`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.message || 'Upload file error!';
            showRightBelowToast(`<p class="color-red">${errorMessage} Please login again.</p>`);
        } finally {
            // Re-enable the upload button
            uploadButton.disabled = false;
            uploadButton.textContent = 'Upload';
        }
    } catch (error) {
        console.error('Read file failed:', error);
        showRightBelowToast(`<p class="color-red">Read file failed: ${error.message}</p>`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }