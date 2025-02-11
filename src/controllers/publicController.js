const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

const fs = require('fs').promises;

controller.getPublicPage = async (req, res) => {
    try {
        let {type, owner, date} = req.query;

        //get all public documents and join with users table to get user name (call it owner)
        let documents = await db.Document.findAll({
            where: {
                is_public: true
            },
            include: [
                {
                    model: db.User,
                    attributes: ['name'],
                    as : 'user'
                }
            ],
        });

        //get all users
        const users = await db.User.findAll();

        let file_owner = null;
        let owner_name = null;
        if (owner){
            // console.log("owner", owner);
            file_owner = users.find(user => user.name === owner);
            owner_name = file_owner['name'];
        }

        let file_format = null;
        if (type){
            file_format = await getMimeType(type);
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

async function loadMimeTypes() {
    try {
        console.log("mimetype");
        const data = await fs.readFile('./src/config/mimeTypes.json', 'utf8');
        const mimeTypes = JSON.parse(data);
        return mimeTypes.acceptType;
    } catch (err) {
        console.error('Error loading mime types:', err);
    }
}

// Function to get MIME type from file extension
async function getMimeType(extension) {
    try {
        const extensionToMimeType = await loadMimeTypes();
        // console.log(extensionToMimeType);
        return extensionToMimeType[extension] || 'application/octet-stream'; // Default MIME type
    } catch (err) {
        console.error('Error getting MIME type:', err);
        return 'application/octet-stream'; // Default MIME type in case of error
    }
}

module.exports = controller;