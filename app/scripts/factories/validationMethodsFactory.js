searchApp.factory('ValidationMethods', function () {
    return {
        datetimeRegexp: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
        emailRegexp: /[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+/,
        url: /https?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/,
        phone: /\+?\(?\d{2,4}\)?[\d\s-]{3,}/
    };
});