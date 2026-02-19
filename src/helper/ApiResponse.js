function success(res, data = {}, message = '')
{
    return res.status(200).json({
        success: true,
        data: data,
        message: message
    });
}

function error(res, message, statusCode = 400)
{
    return res.status(statusCode).json({
        success: false,
        message: message,
        data: null
    });
}

function validationError(res, message)
{
    return res.status(422).json({
        success: false,
        message: message,
        data: null
    });
}

module.exports = {
    success, error, validationError
}