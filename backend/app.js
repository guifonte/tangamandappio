const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const tasksRoutes = require('./routes/tasks')
const userRoutes = require('./routes/user')
const app = express();

/* mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to database!');
    })
    .catch(() => {
        console.log('Connection failed!');
    }); */
    mongoose.connect(
        "mongodb+srv://tangamandappUser:"
        + process.env.MONGO_ATLAS_PW +
        "@cluster0-8mrgx.mongodb.net/node-angular?retryWrites=true&w=majority", 
        { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to database!');
    })
    .catch(() => {
        console.log('Connection failed!');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "angular")))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    next();
})

app.use("/api/tasks", tasksRoutes);
app.use("/api/user", userRoutes);
/*app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "angular", "index.html"));
});*/

module.exports = app;