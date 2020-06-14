'use strict';
const helpers = require('./index');
exports.validateUserRequest = (req, operation)=>{
    let errorCollection = {}
    let errorExists = false;
    if(operation === 'update account' && helpers.isUndefinedOrNullOrEmpty(req.body.id)){
        errorCollection.id = 'User id not specified';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.email)){
        errorCollection.email = 'Email is required.';
        errorExists = true;
    }
    if(operation === 'add' && helpers.isUndefinedOrNullOrEmpty(req.body.password)){
        errorCollection.password = 'Password is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.firstName)){
        errorCollection.firstName = 'First name is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.lastName)){
        errorCollection.lastName = 'Last name is required.';
        errorExists = true;
    }
    // if(helpers.isUndefinedOrNullOrEmpty(req.body.middleInitial)){
    //     errorCollection.middleInitial = 'Middle initial is required.';
    //     errorExists = true;
    // }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.birthdate)){
        errorCollection.birthdate = 'Birth date is required.';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    }
}

exports.validatePasswordChangeRequest = (req) => {
    let errorCollection = {}
    let errorExists = false;
    if(helpers.isUndefinedOrNullOrEmpty(req.body.id)){
        errorCollection.id = 'User id not specified';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.password)){
        errorCollection.password = 'Password is not defined.';
        errorExists = true;
    }
    return{
        errorExists,
        errors: errorCollection
    }
}

exports.validateLoginRequest = (req) => {
    let errorCollection = {};
    let errorExists = false;
    if(helpers.isUndefinedOrNullOrEmpty(req.body.email)){
        errorCollection.email = 'Email must be provided for login.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.password)){
        errorCollection.password = 'Password must be provided for login.';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    }
}