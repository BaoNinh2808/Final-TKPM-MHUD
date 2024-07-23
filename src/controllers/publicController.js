const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');
const fsSync = require('fs');

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

module.exports = controller;