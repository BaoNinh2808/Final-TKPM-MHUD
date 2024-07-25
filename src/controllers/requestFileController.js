const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');
const nodemailer = require('nodemailer');


const FormData = require('form-data')
const fs = require('fs').promises;
const fsSync = require('fs');
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNzA1MzZhMy0yOTMxLTRhOWYtODc3Zi1iMGZjZTNkMWY1YmIiLCJlbWFpbCI6Im5pbmhxdW9jYmFvMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImY0Y2Q1Y2NlZTM1YzI2ZjNkMTg3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDcxYzcwMGRjNzZkYTYxMjllZmE4NzJhZjM5YzA3MjA0NDg5YWYyMTEwNWMzNDVjZmJiMWVjMTY0OTBmZjZjYyIsImlhdCI6MTcxODc4NTAyNX0.h5Vk6bP9rM98fMElhMvS5y-R60mxIapeEdkPDkCbEog'
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // specify your upload directory
const path = require('path');
const axios = require('axios');

controller.getRequestFile = async (req, res) => {
    const user_id = req.cookies.userID;

    //get all requests file of user
    const documents = await db.RequestDocument.findAll(
        {
            where: {
                user_id: user_id
            }
        }
    )

    res.locals.documents = documents;
    res.render('requestFile', {
        title: 'Request File'
    });
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huymasterpiece@gmail.com',
        pass: 'egsl weqx svkh ukue'
    } 
});

controller.sendRequestFile = async (req, res) => {

    try {

        let { title, description,  emails, setDeadline, deadlineDate, deadlineTime } = req.body;

        // if setDeadline is not checked, set deadlineDate and deadlineTime to null
        let deadline_date = null;
        if (setDeadline == "on") {
            deadline_date = new Date(deadlineDate + " " + deadlineTime);
        } else {
            deadline_date = null;
        }
        const user_id = req.cookies.userID;

        // Save request to database
        // convert mail to list of mails
        const emailList = emails.split(',').map(email => email.trim());
        for (let email of emailList) {
            const request = await db.RequestUser.create({
                title: title,
                description: description,
                user_id: user_id,
                email: email,
                deadline: deadline_date,
                is_uploaded: false
            });
        
            // Send email
            const mailOptions = {
                from: 'huymasterpiece@gmail.com',
                to: email,
                subject: `File Request: ${title}`,
                text: `
                    You have received a new file request.

                    Title: ${title}
                    Description: ${description}
                    Deadline: ${deadlineDate} ${deadlineTime}

                    Please upload the requested files using the following link:
                    https://final-tkpm-mhud.onrender.com/requestFile/upload?id=${request.id}
                `.trim()
            };

            await transporter.sendMail(mailOptions);
        }

        res.status(200).send("Request sent successfully");
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send("Error sending request");
    }

};

controller.getAnonymousUpload = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).send({ error: 'Please provide a request ID' });
    }

    const user = await db.RequestUser.findOne({
        where: {
            id: id
        }
    });

    if (!user) {
        return res.status(404).send({ error: 'File Not Found' });
    }

    const owner = await db.User.findOne({
        where: {
            id: user.user_id
        }
    });
    res.locals.ownerName = owner.name;
    res.locals.email = user.email;
    res.locals.requestTitle = user.title;
    res.locals.requestDescription = user.description;

    res.render('anonymousUpload', {
        layout: false,
        title: 'Upload Files'
    });
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


controller.upload = upload.single('file');

controller.postAnonymousUpload = async (req, res) => {
    try {
        const { email, title, description} = req.body;
        console.log(req.body);
        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: 'Please upload a file' });
        }
        if (!email) {
            return res.status(400).send({ error: 'Please enter your email' });
        }

        const request = await db.RequestUser.findOne({
            where: {
                email: email,
                title: title,
                description: description
            }
        });

        if (!request) {
            return res.status(400).send({ error: 'Not found request' });
        }
        
        const user_id = request.user_id;
        //check if this request is able to uploaded
        const deadline = request.deadline;
        if (deadline && new Date() > deadline) {
            return res.status(400).send({ error: 'Deadline has passed' });
        }
        if (request.email !== email) {
            return res.status(400).send({ error: 'Email does not match' });
        }
        
        const targetPath = path.join('uploads', file.originalname);
        const fileName = file.originalname;
        const fileFormat = file.mimetype;
        const fileSize = file.size;

        // Create the uploads directory if it doesn't exist
        const targetDir = path.dirname(targetPath);
        await fs.mkdir(targetDir, { recursive: true });

        // Read the temporary file and write it to the target location
        const data = await fs.readFile(file.path);
        await fs.writeFile(targetPath, data);

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

            //update is_uploaded to true
            await db.RequestUser.update({
                is_uploaded: true
            }, {
                where: {
                    id: request.id
                }
            });

            let document = await db.RequestDocument.create({
                name: fileName,
                CID: pinataResponse.data.IpfsHash,
                user_id: user_id,
                file_format: fileFormat,
                file_size: fileSize,
                is_public: false,
                uploader_email: email,
                created_date: new Date()
            });
            
            // Delete the temporary file
            await fs.unlink(file.path);

            // Delete the target file
            await fs.unlink(targetPath);

            // File stored and uploaded successfully, send response to client
            res.status(200).json({
                message: 'File uploaded, stored successfully, and uploaded to IPFS'
            });
        } else {
            console.error('Failed to pin file:', pinataResponse.status, pinataResponse.statusText);
            res.status(500).json({ error: 'Failed to pin file' });
        }
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({ error: 'Error uploading file' });
    }
}

module.exports = controller;
