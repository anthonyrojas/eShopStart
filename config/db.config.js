require('dotenv').config();
module.exports = {
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "pool": {
            "min": 3,
            "max": 10,
            "idle": 10000,
            "acquire": 30000
        },
    },
    "test": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "pool": {
            "min": 3,
            "max": 10,
            "idle": 10000,
            "acquire": 30000
        }
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "pool": {
            "min": 3,
            "max": 10,
            "idle": 10000,
            "acquire": 30000
        },
        "logging": false
    }
}