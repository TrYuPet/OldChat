/**
 * Created by tryupet on 17.04.15.
 */

var mongoose = require('mongoose');
var express = require('express');
var MongoStore = require('connect-mongo')(express);

var sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;
