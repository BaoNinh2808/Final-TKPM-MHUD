
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
                    divTag.innerHTML = `<img src="${fileURL}" style="max-width: 480px; max-height: 280px; width: auto; height: auto;" alt="">`;
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
            };
            fileReader.readAsDataURL(file);
        } else {
            alert('Invalid file type: ' + file.name);
            removeButton.click();
            return;  // Exit the function after handling invalid file
        }
    }
    showButtons();
    showRightBelowToast("File uploaded successfully!");
}


function showButtons() {
    removeButton.style.display = '';
}

removeButton.addEventListener('click', () => {
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
