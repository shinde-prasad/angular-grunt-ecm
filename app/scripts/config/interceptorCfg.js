/* global searchApp */

'use strict';

var httpErrors = [
    {
        "status": 400,
        "title": "Bad Request",
        "message": "The request cannot be fulfilled due to bad syntax."
    },
    {
        "status": 401,
        "title": "Unauthorized",
        "message": "The request was a legal request, but requires user authentication."
    },
    {
        "status": 403,
        "title": "Forbidden",
        "message": "The server understood the request, but is refusing to fulfill it."
    },
    {
        "status": 404,
        "title": "Not Found",
        "message": "The requested resource could not be found but may be available again in the future."
    },
    {
        "status": 405,
        "title": "Method Not Allowed",
        "message": "A request was made of a resource using a request method not supported by that resource."
    },
    {
        "status": 406,
        "title": "Not Acceptable",
        "message": "The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request."
    },
    {
        "status": 407,
        "title": "Proxy Authentication Required",
        "message": "The client must first authenticate itself with the proxy."
    },
    {
        "status": 408,
        "title": "Request Timeout",
        "message": "The server timed out waiting for the request."
    },
    {
        "status": 409,
        "title": "Conflict",
        "message": "The request could not be completed due to a conflict with the current state of the resource."
    },
    {
        "status": 410,
        "title": "Gone",
        "message": "The resource requested is no longer available and will not be available again."
    },
    {
        "status": 411,
        "title": "Length Required",
        "message": "The request did not specify the length of its content, which is required by the requested resource."
    },
    {
        "status": 412,
        "title": "Precondition Failed",
        "message": "The server does not meet one of the preconditions that the requester put on the request."
    },
    {
        "status": 413,
        "title": "Request Entity Too Large",
        "message": "The request is larger than the server is willing or able to process."
    },
    {
        "status": 414,
        "title": "Request-URI Too Long",
        "message": "The URI provided was too long for the server to process."
    },
    {
        "status": 415,
        "title": "Request Entity Too Large",
        "message": "The request is larger than the server is willing or able to process."
    },
    {
        "status": 416,
        "title": "Requested Range Not Satisfiable",
        "message": "The client has asked for a portion of the file, but the server cannot supply that portion."
    },
    {
        "status": 417,
        "title": "Expectation Failed",
        "message": "The server cannot meet the requirements of the Expect request-header field."
    },
    {
        "status": 496,
        "title": "No Cert",
        "message": "The client must provide a certificate to fulfill the request."
    },
    {
        "status": 498,
        "title": "Token expired",
        "message": "Token was expired or is in invalid state."
    },
    {
        "status": 499,
        "title": "Token required",
        "message": "A token is required to fulfill the request."
    },
    {
        "status": 500,
        "title": "Internal Server Error",
        "message": "The server encountered an internal error and was unable to complete your request."
    },
    {
        "status": 501,
        "title": "Not Implemented",
        "message": "The server either does not recognize the request method, or it lacks the ability to fulfil the request."
    },
    {
        "status": 502,
        "title": "Bad Gateway",
        "message": "The server was acting as a gateway or proxy and received an invalid response from the upstream server."
    },
    {
        "status": 503,
        "title": "Service Unavailable",
        "message": "The server is currently unavailable (because it is overloaded or down for maintenance)."
    }
];

searchApp.factory('sessionInjector', ['$cookieStore', function($cookieStore) {
    var sessionInjector = {
        request: function(config) {
            config.headers['Authorization'] = $cookieStore.get("searchApp_token");
            return config;
        }
    };
    return sessionInjector;
}]);


searchApp.factory('errorInterceptor', function($cookieStore, $location, $q, messageService) {    
  var errorInterceptor = {
        responseError: function (errorResponse) {
            if (!errorResponse.statusText) {
                $.map(httpErrors, function(e) { if (e.status === errorResponse.status) { errorResponse.statusText = e.title; }} );
            }            
            if (errorResponse.status === 401 && errorResponse.config.url !== "/restapi/services/user/login") {
                errorResponse.config.ignoreError = true;
                messageService.addWarning('Your session has expired, please log in again.', {groups: ['login'], targetViews: ['login']})();
                $cookieStore.remove("searchApp_token");
                $location.url('/login');
                return $q.resolve(errorResponse);                
            }
            if (errorResponse.status === 404) {
                errorResponse.data = {resource: errorResponse.config.url, suggestion: 'Server down or invalid url'};
            }  
            return $q.reject(errorResponse);
        }
    };
    return errorInterceptor;
});


searchApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionInjector');
    $httpProvider.interceptors.push('errorInterceptor');
}]);

searchApp.config(['$httpProvider', function($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);