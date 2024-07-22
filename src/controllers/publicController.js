const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

controller.getPublicPage = async (req, res) => {
    try {
        let {type, owner, date} = req.query;

        //get all public documents
        let documents = await db.Document.findAll({
            where: {
                is_public: true
            }
        });

        //get all users
        const users = await db.User.findAll();

        let file_owner = null;
        let owner_name = null;
        if (owner){
            console.log("owner", owner);
            file_owner = users.find(user => user.name === owner);
            owner_name = file_owner['name'];
        }

        let file_format = null;
        if (type){
            file_format = getMimeType(type);
        }

        let date_range = null;
        if (date){
            date_range = parseInt(date);
        }

        //filter documents
        if (file_format){
            documents = documents.filter(document => document.file_format === file_format);
        }
        if (file_owner){
            documents = documents.filter(document => document.user_id === file_owner['id']);
        }
        if (date_range){
            documents = documents.filter(document => document.createdAt >= new Date(new Date().setDate(new Date().getDate() - date_range)));
        }

        //render public page
        res.locals.documents = documents;
        res.locals.users = users;
        res.locals.owner = owner_name;
        res.locals.type = type;
        res.locals.date = date;

        res.render('public', {
            title: 'Public Files'
        });
    }
    catch (error) {
        console.error(error);
    }
}

const extensionToMimeType = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'ico': 'image/vnd.microsoft.icon',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'mpeg': 'video/mpeg'
};

// Function to get MIME type from file extension
function getMimeType(extension) {
    return extensionToMimeType[extension] || 'application/octet-stream'; // Default MIME type
}


module.exports = controller;