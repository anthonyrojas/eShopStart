require('dotenv').config()
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./models');
const routes = require('./routes');
const e = require('express');
const Sequelize = require('sequelize');
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

db.sequelize.authenticate()
.then(()=>{
    console.log('Database authentication successful.')
})
.catch(err => {
    console.error(err);
});

routes(app);

app.use((err, req, res, next)=>{
    if(err.name.includes(Sequelize.ValidationError.name)){
        let errorCollection = {};
        if(e !== undefined && Array.isArray(err.errors)){
            err.errors.forEach(element => {
                errorCollection[element.path] = element.message;
            });
            return res.status(400).json({
                type: err.name,
                statusMessage: 'There are errors in your submission.',
                errors: errorCollection
            });
        }else{
            return res.status(400).json({
                type: err.name,
                statusMessage: 'There are errors in your submission.',
                errors: errorCollection
            });
        }
    }else if(res.locals.errOperation === 'dbAdd') {
        return res.status(500).json({
            type: err.name, 
            statusMessage: 'Failed to create resource.'
        });
    }else{
        return res.status(500).json({
            type: err.name,
            statusMessage: 'Oops! Something went wrong.',
            errorMessage: err.message
        });
    }
});

server.listen(process.env.SERVER_PORT, ()=>{
    console.log(`Listening on port ${process.env.SERVER_PORT}`);
})