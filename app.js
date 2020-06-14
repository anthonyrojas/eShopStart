require('dotenv').config()
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./models');
const routes = require('./routes')
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use((err, req, res, next)=>{
    if(err.message){
        return res.status(400).json({message: err.message});
    }else{
        return res.status(500).json({message: 'Oops! Something went wrong'});
    }
});

db.sequelize.authenticate()
.then(()=>{
    console.log('Database authentication successful.')
})
.catch(err => {
    console.error(err);
});

routes(app);

server.listen(process.env.SERVER_PORT, ()=>{
    console.log(`Listening on port ${process.env.SERVER_PORT}`);
})