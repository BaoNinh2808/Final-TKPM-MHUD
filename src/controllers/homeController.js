const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

const secureRandomString = require('secure-random-string');
const NodeRSA = require('node-rsa');
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

        let {type, public, date} = req.query;
        const user_id = req.cookies.userID;
        //get all documents of user
        let documents = await db.Document.findAll({
            where: {
                user_id: user_id
            }
        });

        let is_public = null;
        if (public === 'Yes') {
            is_public = true;
        }
        else if (public === 'No') {
            is_public = false;
        }

        let file_format = null;
        if (type){
            file_format = getMimeType(type);
        }

        let date_range = null;
        if (date){
            date_range = parseInt(date);
        }

        //filter documents based on query parameters
        if (type) {
            documents = documents.filter(document => document.file_format === file_format);
        }
        if (is_public !== null) {
            documents = documents.filter(document => document.is_public === is_public);
        }
        if (date_range) {
            documents = documents.filter(document => document.created_date >= new Date(new Date().getTime() - date_range * 24 * 60 * 60 * 1000));
        }

        //render homepage
        res.locals.documents = documents;
        res.locals.type = type;
        res.locals.public = public;
        res.locals.date = date;

        // console.log(documents);
        res.render('home', {
            title: 'Home'
        });
    }
    catch (error) {
        console.error(error);
    }
}

function loadMimeTypes() {
    fsSync.readFile('./src/config/mimeTypes.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading mime types:', err);
            return;
        }

        try {
            const mimeTypes = JSON.parse(data);
            const extensionToMimeType = mimeTypes.acceptType;
            return extensionToMimeType;
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
        }
    });
}

const extensionToMimeType = loadMimeTypes();

// Function to get MIME type from file extension
function getMimeType(extension) {
    if (!extensionToMimeType) {
        extensionToMimeType = loadMimeTypes();
    }
    return extensionToMimeType[extension] || 'application/octet-stream'; // Default MIME type
}


controller.getMimeTypes = async (req, res) => {
    try {
        const mimeTypes = await fs.readFile('./src/config/mimeTypes.json', 'utf8');
        const extensionToMimeType = JSON.parse(mimeTypes);
        res.status(200).json({ acceptType: extensionToMimeType.acceptType });
    } catch (error) {
        console.error('Error loading mime types:', error);
        res.status(500).json({ error: 'Failed to load MIME types' });
    }
}

// Handle file upload
// controller.upload = upload.single('file');
controller.upload = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'iv', maxCount: 1 },
    { name: 'salt', maxCount: 1 }
]);

// Handle file upload processing
controller.handleUpload = async (req, res, next) => {
    const files = req.files; // This will contain the file information
    const body = req.body; // This will contain the non-file fields
    const user_id = req.cookies.userID;

    if (!files || !files.file || !files.iv || !files.salt) {
        return res.status(400).json({ error: 'File, IV, and salt are required' });
    }
    if (!body.has_password || !body.is_public || !body.random_server) {
        return res.status(400).json({ error: 'has_password, is_public and random_server are required' });
    }

    const file = files.file[0];
    const ivFile = files.iv[0];
    const saltFile = files.salt[0];
    
    const targetPath = path.join('uploads', file.originalname); // Adjust the path as needed

    const fileName = file.originalname;
    const fileFormat = file.mimetype; // MIME type (e.g., "image/png", "application/pdf")
    const fileSize = file.size; // File size in bytes

    // console.log(`Name: ${fileName}\nFormat: ${fileFormat}\nSize: ${fileSize} bytes`);
    
    // Read the IV and salt data
    const iv = await fs.readFile(ivFile.path);
    const salt = await fs.readFile(saltFile.path);

    // console.log(`IV: ${iv.toString('hex')}`);
    // console.log(`Salt: ${salt.toString('hex')}`);

     // Access has_password and is_public from req.body
     const hasPassword = body.has_password === 'true'; // Convert from string to boolean
     const isPublic = body.is_public === 'true'; // Convert from string to boolean
     const randomServer = body.random_server;
     
    let password = null;
    if (!hasPassword) {
        password = "password";  // Default password
    }   
    //  console.log(`has_password: ${hasPassword}`);
    //  console.log(`is_public: ${isPublic}`);

    if (user_id){
        try {
            // Create the uploads directory if it doesn't exist
            const targetDir = path.dirname(targetPath);
            await fs.mkdir(targetDir, { recursive: true });
    
            // Read the temporary file and write it to the target location
            const data = await fs.readFile(file.path);
            await fs.writeFile(targetPath, data);
    
            // console.log('File written to target path:', targetPath);
    
            // Upload file to IPFS
            const formData = new FormData();
            formData.append('file', fsSync.createReadStream(file.path));
    
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
                
                let document = null;
                if (isPublic) {
                    // if the file is public, there are no password, iv, salt and random_server
                    document = await db.Document.create({
                        name: fileName,
                        CID: pinataResponse.data.IpfsHash,
                        user_id: user_id,
                        file_format: fileFormat,
                        file_size: fileSize,
                        has_password: false,
                        password: null,
                        random_server: null,
                        iv: null,
                        salt: null,
                        is_public: isPublic,
                        created_date: new Date()
                    });
                }
                else {
                    // Save the file information to the database
                    document = await db.Document.create({
                        name: fileName,
                        CID: pinataResponse.data.IpfsHash,
                        user_id: user_id,
                        file_format: fileFormat,
                        file_size: fileSize,
                        has_password: hasPassword,
                        password: password,
                        random_server: randomServer,
                        iv: iv.toString('hex'),
                        salt: salt.toString('hex'),
                        is_public: isPublic,
                        created_date: new Date()
                    });
                }
                // Delete the temporary file
                await fs.unlink(file.path);
                await fs.unlink(ivFile.path);
                await fs.unlink(saltFile.path);
    
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
                res.status(500).json({ error: 'Failed to pin file' });
            }
        } catch (err) {
            console.error('File operation error:', err);
            res.status(500).json({ error: `Failed to process file ${err}`});
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
    
};

controller.deleteFile = async (req, res) => {
    const fileName = req.body.file_name;
    const user_id = req.cookies.userID;
    console.log('Deleting file:', fileName);
    //check if file exists in database
    const document = await db.Document.findOne({
        where: {
            name: fileName,
            user_id: user_id
        }
    });


    if (document) {
        const response = await fetch(
            `https://api.pinata.cloud/pinning/unpin/${document.CID}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${JWT}`,
              },
            }
          );

        if (response.ok) {
            console.log('File deleted from IPFS:', document.CID);
            //delete file from database
            await db.Document.destroy({
                where: {
                    name: fileName,
                    user_id: user_id
                }
            });
            res.status(200).json({ message: 'File deleted successfully' });
        }
        else {
            console.error('Failed to delete file:', response.status, response.statusText);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
}

controller.getFileInfo = async (req, res) => {
    const fileName = req.body.fileName;
    const cid = req.body.cid;
    const user_id = req.cookies.userID;
    //check if file exists in database
    const document = await db.Document.findOne({
        where: {
            name: fileName,
            user_id: user_id,
            CID: cid
        }
    });

    if (document) {
        res.status(200).json({
            iv: document.iv,
            salt: document.salt,
            has_password: document.has_password,
            password: document.password,
            random_server: document.random_server,
            is_public: document.is_public
        });
        console.log("iv", document.iv);
        console.log("salt", document.salt);
    } else {
        res.status(404).json({ error: 'There is no document have the corresponding data in system' });
    }
}

controller.getServerRandom = async (req, res) => {
    try{
        const clientRandom = req.body.random;
        console.log('Client random:', clientRandom);
        const random = secureRandomString({ length: 32 });  //generate a random string of 32 characters (256 bits)
        const signature = await signMessage(random + clientRandom);
        // console.log('Random string:', random);
        // console.log('Sign random string:', signature);
        res.status(200).json({ random : random, signature: signature });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate random string' });
    }
}

// Function to sign the message
async function signMessage(message) {
    try {
        // Read the private key from the file
        const privateKey = fsSync.readFileSync('./src/private_key/private_key.pem', 'utf8');
        
        // Initialize the NodeRSA object with the private key
        const key = new NodeRSA(privateKey);

        // Set the signing scheme - usually 'pkcs1-sha256' for RSA
        key.setOptions({ signingScheme: 'pkcs1-sha256' });

        // Sign the message
        const signature = key.sign(message, 'base64');

        // Return the signature
        return signature;
    } catch (error) {
        console.error('Error signing the message:', error);
        throw error;
    }
}

module.exports = controller;