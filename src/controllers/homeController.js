const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

const axios = require('axios');
const FormData = require('form-data')
const fs = require('fs').promises;
const fsSync = require('fs');
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNzA1MzZhMy0yOTMxLTRhOWYtODc3Zi1iMGZjZTNkMWY1YmIiLCJlbWFpbCI6Im5pbmhxdW9jYmFvMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImY0Y2Q1Y2NlZTM1YzI2ZjNkMTg3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDcxYzcwMGRjNzZkYTYxMjllZmE4NzJhZjM5YzA3MjA0NDg5YWYyMTEwNWMzNDVjZmJiMWVjMTY0OTBmZjZjYyIsImlhdCI6MTcxODc4NTAyNX0.h5Vk6bP9rM98fMElhMvS5y-R60mxIapeEdkPDkCbEog'
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // specify your upload directory
const path = require('path');

controller.getHomePage = async (req, res) => {
    try {
        const user_id = 1;
        //get all documents of user
        const documents = await db.Document.findAll({
            where: {
                user_id: user_id
            }
        });
        //render homepage
        res.locals.documents = documents;
        // console.log(documents);
        res.render('homepage', {
            layout: false,
            title: 'Home'
        });
    }
    catch (error) {
        console.error(error);
    }
}



// Handle file upload
controller.upload = upload.single('file');

// Handle file upload processing
controller.handleUpload = async (req, res, next) => {
    const file = req.file; // This will contain the file information
    console.log("Received file:", file);
    const targetPath = path.join('uploads', file.originalname); // Adjust the path as needed

    const fileName = file.originalname;
    const fileFormat = file.mimetype; // MIME type (e.g., "image/png", "application/pdf")
    const fileSize = file.size; // File size in bytes

    console.log(`
    Name: ${fileName}
    Format: ${fileFormat}
    Size: ${fileSize} bytes`);

    
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

        // Check if the response status is within the successful range (2xx)
        if (pinataResponse.status >= 200 && pinataResponse.status < 300) {
            console.log('File uploaded to IPFS:', pinataResponse.data);

            // Save the file information to the database
            const document = await db.Document.create({
                name: fileName,
                CID: pinataResponse.data.IpfsHash,
                user_id: 1,
                file_format: fileFormat,
                file_size: fileSize,
                has_password: false,
                password_hash: null,
                is_public: true,
                created_date: new Date()
            });

            // Delete the temporary file
            await fs.unlink(file.path);
            // console.log('Temporary file deleted:', file.path);

            // Delete the target file
            await fs.unlink(targetPath);
            // console.log('Target file deleted:', targetPath);

            // File stored and uploaded successfully, send response to client
            res.status(200).json({
                message: 'File uploaded, stored successfully, and uploaded to IPFS',
                file: document,
                ipfsData: pinataResponse.data
            });
        } else {
            console.error('Failed to pin file:', pinataResponse.status, pinataResponse.statusText);
            res.status(500).json({ error: 'Failed to process file' });
        }
    } catch (err) {
        console.error('File operation error:', err);
        res.status(500).json({ error: 'Failed to process file' });
    }
};

module.exports = controller;