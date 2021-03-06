'use strict';
const helpers = require('./index');
const enums = require('./enums')
exports.validateUserRequest = (req, operation, userRole=null)=>{
    let validRoles = ['SuperAdmin'];
    let errorCollection = {}
    let errorExists = false;
    if(operation === 'update account' && helpers.isUndefinedOrNullOrEmpty(req.body.id)){
        errorCollection.id = 'User id not specified';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.email.trim())){
        errorCollection.email = 'Email is required.';
        errorExists = true;
    }
    if(operation === 'add' && helpers.isUndefinedOrNullOrEmpty(req.body.password)){
        errorCollection.password = 'Password is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.firstName.trim())){
        errorCollection.firstName = 'First name is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.lastName.trim())){
        errorCollection.lastName = 'Last name is required.';
        errorExists = true;
    }
    if(userRole === 'SuperAdmin' && helpers.isUndefinedOrNullOrEmpty(req.body.role.trim())){
        errorCollection.role = 'Role is required.';
        errorExists = true;
    }else if(userRole === 'SuperAdmin' && !enums.roles.includes(req.body.role)){
        errorCollection.role = 'Valid role must be assigned to this user.';
        errorExists = true;
    }
    // if(helpers.isUndefinedOrNullOrEmpty(req.body.middleInitial)){
    //     errorCollection.middleInitial = 'Middle initial is required.';
    //     errorExists = true;
    // }
    if(helpers.isUndefinedOrNull(req.body.birthdate)){
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
    if(helpers.isUndefinedOrNullOrEmpty(req.body.email.trim())){
        errorCollection.email = 'Email must be provided for login.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.password.trim())){
        errorCollection.password = 'Password must be provided for login.';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    }
}

exports.validateProductRequest = (req) => {
    let errorCollection = {};
    let errorExists = false;
    if(helpers.isUndefinedOrNullOrEmpty(req.body.name)){
        errorCollection.name = 'Product name is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.description)){
        errorCollection.description = 'Product description is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNull(req.body.price)){
        errorCollection.price = 'Product price is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNull(req.body.isDeliverable)){
        errorCollection.isDeliverable = 'Must mark if the product is deliverable or not.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNull(req.body.isDigital)){
        errorCollection.isDigital = 'Must mark if the product is digital.';
        errorExists = true;
    }
    if(!req.body.isDigital && helpers.isUndefinedOrNull(req.body.weight)){
        errorCollection.weight = 'Product weight is required. It must be entered in ounces.';
        errorExists = true;
    }
    else if(req.body.isDigital && helpers.isUndefinedOrNullOrEmpty(req.body.downloadsPermitted)){
        errorCollection.downloadsPermitted = 'Product downloads permitted is required when the product is a digital product.';
        errorExists = true;
    }
    if(!req.body.isDigital && helpers.isUndefinedOrNull(req.body.height)){
        errorCollection.height = 'Product packaging height is required. It must be entered in inches.';
        errorExists = true;
    }
    if(!req.body.isDigital && helpers.isUndefinedOrNull(req.body.length)){
        errorCollection.length = 'Product packaging length is required. It must be entered in inches.';
        errorExists = true;
    }
    if(!req.body.isDigital && helpers.isUndefinedOrNull(req.body.width)){
        errorCollection.width = 'Product packaging width is required. It must be entered in inches.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNull(req.body.isActive)){
        errorCollection.isActive = 'Product must be marked active or non-active';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    };
}

exports.validateCategoryRequest = (req, operation) => {
    let errorExists = false;
    let errorCollection = {};
    if(operation === 'update' && helpers.isUndefinedOrNullOrEmpty(req.body.id)){
        errorCollection.id = 'Category id is required.';
        errorExists = true;
    }
    if(helpers.isUndefinedOrNullOrEmpty(req.body.name)){
        errorCollection.name = 'Category name is required.';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    };
}

exports.validateInventoryRequest = (req) => {
    let errorExists =  false;
    let errorCollection = {};
    if(helpers.isUndefinedOrNull(req.body.amount) || req.body.amount < 0){
        errorCollection.amount = 'Inventory amount is required.';
        errorExists = true;
    }
    return {
        errorExists,
        errors: errorCollection
    }
}