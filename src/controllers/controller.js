const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNzA1MzZhMy0yOTMxLTRhOWYtODc3Zi1iMGZjZTNkMWY1YmIiLCJlbWFpbCI6Im5pbmhxdW9jYmFvMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImY0Y2Q1Y2NlZTM1YzI2ZjNkMTg3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDcxYzcwMGRjNzZkYTYxMjllZmE4NzJhZjM5YzA3MjA0NDg5YWYyMTEwNWMzNDVjZmJiMWVjMTY0OTBmZjZjYyIsImlhdCI6MTcxODc4NTAyNX0.h5Vk6bP9rM98fMElhMvS5y-R60mxIapeEdkPDkCbEog'
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // specify your upload directory
const path = require('path');

//Tất cả các xử lý sẽ nằm trong đây
const controller = {}

//xử lý cho trang chủ
controller.home = async (req, res, next) => {
    const formData = new FormData();
    const src = "Orig1708.png";

    const file = fs.createReadStream(src)
    formData.append('file', file)
    console.log("file", file);
    const pinataMetadata = JSON.stringify({
        name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    console.log("formdata", formData);

    // try{
    //   const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    //     maxBodyLength: "Infinity",
    //     headers: {
    //       'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
    //       'Authorization': `Bearer ${JWT}`
    //     }
    //   });
    //   console.log(res.data);
    // } catch (error) {
    //   console.log(error);
    // }
}

// Handle file upload
controller.upload = upload.single('file');

// Handle file upload processing
controller.handleUpload = async (req, res, next) => {
    const file = req.file; // this will contain the file information
    console.log("Received file:", file);
    const targetPath = path.join('uploads/', file.originalname); // Adjust the path as needed

    // Read the temporary file and write it to the target location
    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to process file' });
        }

        const targetDir = path.join(__dirname, '../uploads');

        // Create the uploads directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Write file to target location
        fs.writeFile(targetPath, data, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Failed to store file' });
            }

            // File stored successfully, send response to client
            res.status(200).json({ message: 'File uploaded and stored successfully', file: file });
        });
    });

    // Upload file to IPFS
    const formData = new FormData();
    
    const ipfs_file = fs.createReadStream(targetPath)
    formData.append('file', ipfs_file)
    
    const pinataMetadata = JSON.stringify({
      name: file.originalname,
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }

    // Delete the temporary file
    fs.unlink(file.path, (err) => {
        if (err) {
            console.error('Error deleting temp file:', err);
        }
    });
};

module.exports = controller;