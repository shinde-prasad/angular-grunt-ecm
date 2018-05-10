searchApp.factory('FieldTypeValidators', function () {
    return {
        DATETIME: function (value) {
            if (value && value.trim().length > 0 && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value.trim()) === false) {
                return {valid: false, message: 'Invalid datetime value [' + value + '].'};                 
            } else {
                return {valid: true};
            }
        }
    };
})
.factory('FieldTypeEnum', function (FieldTypeValidators) {
    
    var sharedCode = {
        GENERIC: {
            toModel: function(value) { return value; },
            toFilter: function(value) { return value; }
        },         
        STRING: {
            toModel: function(value) {
                return value.trim ? value.trim() : value;
            },
            toFilter: function(value) {
                return value.trim ? value.trim() : value;
            }
        },        
        DATETIME: {
            name: 'datetime',
            validate: FieldTypeValidators.DATETIME,
            toModel: function(value) {
                value = value.replace(/^(\d{4})-(\d{2})-(\d{2})[T|\s+](\d{2}):(\d{2}):(\d{2}).*$/,'$1-$2-$3 $4:$5');
                return value;
            },
            toFilter: function(value) {
                if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)) {
                    value = value.replace(' ', 'T') + ":00";
                }
                return value;
            }            
        },
        OBJECTARRAY: {
            name: 'multiselect',
            toModel: function (value) {
                if (angular.isDefined(value.id)) {
                    value = [value];
                }
                var a = Array.isArray(value) ? value : (value.split ? value.split(",") : [value]);
                return $.map(a, function (item) {
                    if (typeof item === 'object') {
                        return {id: String(item.id)};
                    } else {
                        return {id: String(item)};
                    }
                });
            },
            toFilter: function(value) {
                return $.map(value, function(item) {
                    return item.id;
                }).join();
            }
        }
    };

    return {
        GENERIC: sharedCode.GENERIC,
        BOOLEAN: {
            name: 'checkbox',
            toModel: function(value) {
                return value && value.toLocaleString() === 'true' ? true : false; 
            },
            toFilter: function(value) {
                return value ? 'true' : 'false'; 
            }
        },         
        DATETIME: sharedCode.DATETIME,
        DATETIME_TO: angular.extend({}, sharedCode.DATETIME, {
            toModel: function(value) {
                return sharedCode.DATETIME.toModel(value).replace(/(.+)?00:00/, '$123:59');
            },
            toFilter: function(value) {
                return sharedCode.DATETIME.toFilter(value).replace(/(.+)?00:00/, '$123:59');
            }
        }),         
        STRING: angular.extend({}, sharedCode.STRING, {name: 'text'}),
        RICHTEXT: angular.extend({}, sharedCode.STRING, {name: 'summernote'}),        
        EMAIL: angular.extend({}, sharedCode.STRING, {name: 'email'}),        
        NUMBER: angular.extend({}, sharedCode.GENERIC, {name: 'number'}),
        OBJECTARRAY: sharedCode.OBJECTARRAY,      
        OBJECT: angular.extend({}, sharedCode.OBJECTARRAY, {
            name: 'select',
            toFilter: function(value) {
                return value.id;
            }            
        }),
        TYPEAHEAD: angular.extend({}, sharedCode.STRING, {
            name: 'text',
            toFilter: function(value) {
                return value.id || value;
            }
        })
    };
})
.factory('FieldScopeEnum', function () {
    return {
        QUERY: 1, // added to the query
        FILTER: 2, // added to the query as filter array       
        CHANNEL: 4 // added as criteria for each channel
    };
})
.factory('Field', function ($q, $filter, messageService, FieldTypeEnum, FieldScopeEnum, modelDomainService) {
    
    function Field(config) {
        
        this.config = config || {};
        
        this.getApiName = function() { return this.config.apiName || this.id; };
        this.getUniqueId = function() { return this.getApiName(); };
        this.isRequired = function() { return this.config.required;  };        
        this.getType = function() { return this.config.type || (this.options ? FieldTypeEnum.OBJECTARRAY : FieldTypeEnum.STRING); };
        this.getCaption = function() { return this.config.caption.en; }; 
        this.getScope = function() { return this.config.scope || FieldScopeEnum.CHANNEL; };
        this.getRawValue = function() { return this[modelDomainService.get()]; };      
        
        this.getValue = function() {
            if (this.getType() === FieldTypeEnum.BOOLEAN) {
                return this.getType().toFilter(this[modelDomainService.get()]);
            }
            var value;            
            if (this[modelDomainService.get()]) {
                value = this.getType().toFilter(this[modelDomainService.get()]); 
            }
            return value ? value : null;
        };
        
        this.validate = function () {
            if (this.getType().validate && this[modelDomainService.get()]) {
                return this.getType().validate(this[modelDomainService.get()]);
            } else {
                return {valid: true};
            }
        };
 
        this.setValue = function (value) {
            if (angular.isDefined(value)) {
                var originalValue = value;                
                value = this.getType().toModel(value);
                if (this.options && this.getType() !== FieldTypeEnum.TYPEAHEAD) {
                    var filteredOptions = [];
                    var numberComparision = (typeof this.options[this.options.length - 1].id === 'number');
                    angular.forEach(value, function (item) {
                        if (item.id) { // !!! some OPTIONS with numeric ID have first empty item with '' (string) value
                            item.id = numberComparision ? parseInt(item.id) : String(item.id);
                        }
                        Array.prototype.push.apply(filteredOptions, $filter('filter')(this.options, item, true));
                    }, this);
                    if (filteredOptions.length === value.length) {
                        value = (this.getType() === FieldTypeEnum.OBJECTARRAY ? value = filteredOptions : value = filteredOptions[0]);
                    } else {
                        if (originalValue === "") {
                            value = null; // We don't have option for "", never mind, let's apply default value
                        } else {
                            messageService.addWarning("Attempt to set invalid values for \"" + this.getCaption() + "\": " + JSON.stringify(value))();
                            // throw new Error("Some invalid options for " + this.getCaption() + ": " + JSON.stringify(value));
                        }
                    }
                }
            }
            if (this.getType() === FieldTypeEnum.BOOLEAN) {
                this[modelDomainService.get()] = value;
            } else {
                this[modelDomainService.get()] = value || this.config.initValue || null;
            }
        };
        
        this.reset = function () {
            if (angular.isDefined(this.config.initValue)) {
                this.setValue(angular.copy(this.config.initValue));
            } else {
                this[modelDomainService.get()] = null;
                // delete this[modelDomainService.get()];
            }
        };
        
        if (this.config.options) {
            if (typeof this.config.options === 'function') {
                var f = this;
                this.initOptions = function (forceInit) {
                    if (f.optionsPromise) {
                        return f.optionsPromise.then(function() {
                            if (forceInit) {
                                delete f.optionsPromise;
                                return f.initOptions();
                            }
                        }, function() {
                            delete f.optionsPromise;
                            return f.initOptions();                        
                        });
                    } else {
                        f.optionsPromise = $q.when(config.options());
                        return f.optionsPromise.then(function (data) {
                            var activeOption = f.getValue();
                            f.options = data;
                            if (activeOption) {
                                f.setValue(activeOption);
                            } else {
                                f.reset();
                            }
                        }, function(err) {
                            return $q.reject(err);
                        });
                    }
                };
            } else {
                this.options = this.config.options;
                this.reset();
            }
        }
        
        if (angular.isDefined(config.initValue)) {
            if (!this.config.options) {
                this[modelDomainService.get()] = angular.copy(config.initValue);
            }
        }           
    }
    
    return Field;
});