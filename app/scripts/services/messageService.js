'use strict';

searchApp.service('messageService', function ($timeout, $filter, $location) {

    this.messages = [];

    var LevelEnum = {
        error: {class: 'alert-danger'}, warning: {class: 'alert-warning'}, success: {class: 'alert-success'}
    };

    function ErrorMessage(message, options, reason) {
        if (!message || !options || !options.level || !options.groups) {
            throw new Error("Invalid error message: " + message);
        }
        this.count = 1;
        this.message = message;
        this.options = options;
        this.reason = reason;
        this.originViewPath = $location.path();  
        
        var containsOneOf = function (indexValues, queryValues) {
            return queryValues.some(function (q) {
                return indexValues.indexOf(q) >= 0;
            });
        };
        
        this.hasGroup = function(groups) {
            return this.options.groups ? containsOneOf(this.options.groups, groups) : false;
        };
        
        this.hasTargetView = function(targetViews) {
            return this.options.targetViews ? containsOneOf(this.options.targetViews, targetViews) : false;            
        };

        this.getLong = function (withCounter) {
            var m = "";
            if (withCounter && this.count > 1 && this.getLevel() === LevelEnum.error) {
                m = this.count + "x: ";
            }
            if (this.reason) {
                var reasonMessage = this.reason.message || (Object.prototype.toString.call(this.reason) === '[object String]' ? this.reason : "");
                if (!reasonMessage && this.reason.data) {
                    reasonMessage = this.reason.data.message || "";
                }
                if (!reasonMessage && this.reason.status) {
                    reasonMessage = this.reason.status + ' ' + this.reason.statusText;
                }                
                m = m + (reasonMessage ? this.message.trim().replace(/[.:]$/, '') + ' - ' + reasonMessage : this.getShort());
                return m;
            } else {
               return this.getShort();
            }
        };
        
        this.getShort = function(withCounter) {
            return (withCounter && this.count > 1 && this.getLevel() === LevelEnum.error) ? this.count + "x: " + this.message : this.message;
        };
        
        this.getDetails = function() {
            if (this.options.details && this.reason && this.reason.data) {
                return angular.toJson(this.reason.data, true);
            }
        };
        
        this.repeat = function() {
            this.count++;
            this.startTimeout();
        };
        
        this.log = function() {
            if (window.console) {
                console.log(this.getLong() + " --> " + this.getDetails());
            }
        };

        this.getLevel = function () {
            return this.options.level || LevelEnum.success;
        };
        
        this.startTimeout = function() {
            if (this.timeoutPromise) {
                $timeout.cancel(this.timeoutPromise);
            }
            var n = angular.isNumber(options.timeout) ? options.timeout : parseInt(options.timeout);
            if (n > 0) {
                var t = this;
                this.timeoutPromise = $timeout(function() {
                    t.close();
                }, n);
            }            
            
        };
        
        if (options.log) {
            this.log();
        }

    }

    this.addMessage = function (message, options) {
        var t = this;
        return function (reason) {
            if (reason && reason.config && reason.config.ignoreError) {
                return;
            }
            var e = angular.extend(new ErrorMessage(message, options, reason), {
                close: function () {
                    t.messages = t.messages.filter(function (item) {
                        return item !== e;
                    });
                }
            });
            var longMessage = e.getLong(false);
            angular.forEach(t.getMessages(), function(m) {
               if (m.getLong(false) === longMessage) {
                   e = m;
                   e.close();
                   e.repeat();
               } 
            });
            e.startTimeout();                
            t.messages.push(e);
        };
    };
    this.addError = function (message, options) {
        var defaultOptions = {level: LevelEnum.error, groups: ['global'], targetViews: [$location.path()], timeout: 0, log: true, details: true};
        return this.addMessage(message, angular.extend({}, defaultOptions, options));
    };
    this.addWarning = function (message, options) {
        var defaultOptions = {level: LevelEnum.warning, groups: ['global'], targetViews: [$location.path()], timeout: 0, details: false};
        return this.addMessage(message, angular.extend({}, defaultOptions, options));
    };
    this.addSuccess = function (message, options) {
        this.resetLocal();
        var defaultOptions = {level: LevelEnum.success, groups: ['global'], targetViews: [$location.path()], timeout: 5000, details: false};
        return this.addMessage(message, angular.extend({}, defaultOptions, options));
    };
    
    this.getMessages = function () {
        return this.messages;
    };
    
    this.reset = function () {
        this.messages = [];
    };
    
    this.resetLocal = function() {
        var currentRoutePath = $location.path();
        this.messages = this.messages.filter(function(f) {
            return f.originViewPath !== currentRoutePath;
        });
    };
    
    this.getByOptions = function(queryOptions) {
        return this.messages.filter(function (item) {
            var hasTarget = !queryOptions.targetViews || (!item.options.targetViews && !queryOptions.strict) || item.hasTargetView(queryOptions.targetViews);
            var hasGroup = !queryOptions.groups || (!item.options.groups && !queryOptions.strict) || item.hasGroup(queryOptions.groups);
            return hasGroup && hasTarget;
        });
    };
    
    this.filterByOptions = function(options) {
       this.messages = this.getByOptions(options);
    };

});