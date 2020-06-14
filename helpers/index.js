exports.isUndefinedOrNullOrEmpty = (val) => {
    return (val === undefined || val === null || val.trim() === '');
}

exports.isUndefinedOrNull = (val) => {
    return (val === undefined || val === null)
}

exports.isEmpty = (val) => {
    return (val.trim() === '');
}