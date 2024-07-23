const controller = {};
const { where } = require('sequelize');
const db = require('../models/index');
const { raw } = require('express');

controller.getRequestFile = async (req, res) => {
    const user_id = req.session.user.id;

    res.render('requestFile', {
        title: 'Request File'
    });
}

module.exports = controller;