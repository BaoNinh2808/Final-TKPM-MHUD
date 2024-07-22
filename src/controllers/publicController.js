const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

controller.getPublicPage = async (req, res) => {
    try {
        //get all public documents
        const documents = await db.Document.findAll({
            where: {
                is_public: true
            }
        });
        //render public page
        res.locals.documents = documents;
        res.render('public', {
            title: 'Public Files'
        });
    }
    catch (error) {
        console.error(error);
    }
}
module.exports = controller;