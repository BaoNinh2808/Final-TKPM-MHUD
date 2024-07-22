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
        let validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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


document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the eye slash icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// uploadButton.addEventListener('click', async () => {
//     const fileIndex = uploadButton.dataset.fileIndex;
//     if (fileIndex === undefined) {
//         alert('No file selected for upload');
//         return;
//     }

//     const file = files[fileIndex];

//     const formData = new FormData();
//     formData.append('file', file);

//     // Disable the upload button
//     uploadButton.disabled = true;
//     uploadButton.textContent = 'Uploading...';

//     try {
//         const response = await fetch('/home', {
//             method: 'PUT',
//             body: formData
//         });

//         if (response.ok) {
//             removeButton.click();
//             // Hide the modal
//             let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-upload-file'));
//             modal.hide();

//             // Reload the page
//             location.reload();
//             // Show success message
//             showRightBelowToast("File uploaded successfully!");
//         } else {
//             // Show error message
//             const data = await response.json();
//             showRightBelowToast(`<p class="color-red">${data.error}</p>`);
//         }
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         const errorMessage = error.message || 'Upload file error!';
//         // Show error message
//         showRightBelowToast(`<p class="color-red">${errorMessage} Please login again.</p>`);
//     } finally {
//         // Re-enable the upload button
//         uploadButton.disabled = false;
//         uploadButton.textContent = 'Upload'; // Optional: reset the button text
//     }
// });


uploadButton.addEventListener('click', async () => {
    const fileIndex = uploadButton.dataset.fileIndex;
    if (fileIndex === undefined) {
        alert('No file selected for upload');
        return;
    }

    const file = files[fileIndex];

    console.log("upload", file);

    const passwordInput = document.getElementById('passwordInput');
    let password = passwordInput.value;
    let has_password = true;

    if (!password || password.trim() === '') {
        password = "password";
        has_password = false;
    }

    const isPublicInput = document.getElementById('publicSharingSelect');
    let is_public = false;
    if (isPublicInput.value === 'Yes') {
        is_public = true;
    }

    if (is_public == true){
        // call the modal to confirm public sharing
        let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-public-sharing'));
        modal.show();
        const confirmPublicSharingButton = document.getElementById('confirmPublicSharingButton');
        confirmPublicSharingButton.onclick = async () => {
            // Hide the modal
            modal.hide();
            // call the upload function
            uploadFile(file, null, false, true);
        };
    }
    else {
        uploadFile(file, password, has_password, is_public);
    }

});

async function uploadFile(file, password, has_password, is_public) {
    
    try {
        const formData = new FormData();
        if (has_password) {
            // Disable the upload button
            uploadButton.disabled = true;
            uploadButton.textContent = 'Encrypting...';

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await deriveKey(password, salt);
            const fileData = await file.arrayBuffer();
            const { iv, encryptedData } = await encryptData(key, fileData);

            // console.log('Encrypted Data:', new Uint8Array(encryptedData));
            // console.log('IV:', iv);
            // console.log('Salt:', salt);

            // Create a Blob from the encrypted data
            const encryptedBlob = new Blob([encryptedData], { type: file.type });

            // Create a FormData object and append the Blob
            
            formData.append('file', encryptedBlob, file.name);
            formData.append('iv', new Blob([iv])); // Append the IV
            formData.append('salt', new Blob([salt])); // Append the salt
            formData.append('has_password', has_password.toString()); // Append as string
            formData.append('is_public', is_public.toString()); // Append as string
        }
        else{
            //create a random salt & IV
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            formData.append('file', file);
            formData.append('iv', new Blob([iv])); // Append the random value
            formData.append('salt', new Blob([salt])); // Append the random value
            formData.append('has_password', has_password.toString()); // Append as string
            formData.append('is_public', is_public.toString()); // Append as string
        }
        // Disable the upload button
        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';

        try {
            const response = await fetch('/home', {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                removeButton.click();
                // Hide the modal
                let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-upload-file'));
                modal.hide();

                
                // Show success message
                showRightBelowToast("File uploaded successfully!");

                await delay(1000);

                // Reload the page
                location.reload();
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
        console.error('Encryption failed:', error);
        showRightBelowToast(`<p class="color-red">Encryption failed: ${error.message}</p>`);
    }

    const isPublicInput = document.getElementById('publicSharingSelect');
    isPublicInput.value = 'No';
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.value = '';
}