const axios = require('axios');
const FormData = require('form-data')
const fs = require('fs').promises;
const fsSync = require('fs');
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNzA1MzZhMy0yOTMxLTRhOWYtODc3Zi1iMGZjZTNkMWY1YmIiLCJlbWFpbCI6Im5pbmhxdW9jYmFvMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImY0Y2Q1Y2NlZTM1YzI2ZjNkMTg3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDcxYzcwMGRjNzZkYTYxMjllZmE4NzJhZjM5YzA3MjA0NDg5YWYyMTEwNWMzNDVjZmJiMWVjMTY0OTBmZjZjYyIsImlhdCI6MTcxODc4NTAyNX0.h5Vk6bP9rM98fMElhMvS5y-R60mxIapeEdkPDkCbEog'
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // specify your upload directory
const path = require('path');

//Tất cả các xử lý sẽ nằm trong đây
const controller = {}

// Handle file upload
controller.upload = upload.single('file');

// Handle file upload processing
controller.handleUpload = async (req, res, next) => {
    const file = req.file; // This will contain the file information
    // console.log("Received file:", file);
    const targetPath = path.join('uploads', file.originalname); // Adjust the path as needed
  
    try {
      // Create the uploads directory if it doesn't exist
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });
  
      // Read the temporary file and write it to the target location
      const data = await fs.readFile(file.path);
      await fs.writeFile(targetPath, data);
  
      console.log('File written to target path:', targetPath);
  
      // Upload file to IPFS
      const formData = new FormData();
      formData.append('file', fsSync.createReadStream(targetPath));
  
      const pinataMetadata = JSON.stringify({ name: file.originalname });
      formData.append('pinataMetadata', pinataMetadata);
  
      const pinataOptions = JSON.stringify({ cidVersion: 0 });
      formData.append('pinataOptions', pinataOptions);
  
      const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });
  
      console.log('File uploaded to IPFS:', pinataResponse.data);
  
      // Delete the temporary file
      await fs.unlink(file.path);
      // console.log('Temporary file deleted:', file.path);
      
      // Delete the target file
        await fs.unlink(targetPath);
        // console.log('Target file deleted:', targetPath);
        
      // File stored and uploaded successfully, send response to client
      res.status(200).json({
        message: 'File uploaded, stored successfully, and uploaded to IPFS',
        file: file,
        ipfsData: pinataResponse.data
      });
    } catch (err) {
      console.error('File operation error:', err);
      res.status(500).json({ error: 'Failed to process file' });
    }
  };

module.exports = controller;