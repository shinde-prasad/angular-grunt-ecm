searchApp.factory('Channel', function ($filter, Field, FieldScopeEnum, modelDomainService) {
    
     function Channel(config, fields) {
        this.config = config || {};
        this.fields = fields || {};
        var ch = this;
        
        var addFieldEnabledWatch = function(field) {
            var isEnabledChain = field.isEnabled;
            field.isEnabled = function () {
                return ch.isChecked() || (isEnabledChain ? isEnabledChain.call() : false);
            };
        };
        
        angular.forEach(this.fields || {}, function (field, key) {
            if (field instanceof Field) {
                if (!field.getApiName()) {
                    angular.extend(field.config, {"apiName": key});
                }
                field.getUniqueId = function() {
                    return ch.id + '-' + key;
                };
                addFieldEnabledWatch(field);
            } else if (field instanceof Object) {
                angular.forEach(field, function (field, key) {
                    addFieldEnabledWatch(field);
                });
            }
        });
        
        this.getFields = function() {
            var all = [];
            angular.forEach(this.fields, function(field, key) {
                if (field instanceof Field) {
                    all.push(field);
                } else if (field instanceof Object) {
                    angular.forEach(field, function(field, key) {
                        all.push(field);
                    }); 
                }
            });
            if (all.length > 0) {
                return all;
            }
        };
        
        this.getApiName = function() { return this.config.apiName || this.id; }; 
        this.getCaption = function() { return this.config.caption.en; };
        this.getGlyph = function() { return this.config.glyph; };
        this.hasTab = function() { return this.config.hasTab ? this.config.hasTab : false; };
        this.isCollapsed = function() { return this.config.collapse ? this.config.collapse : false; };
        this.getSubChannels = function() { return this.subChannels; };
        this.isChecked = function() { return this[modelDomainService.get()] ? true : false; };
        this.setChecked = function(val) { this[modelDomainService.get()] = val; };        
        
        this.checked = this[modelDomainService.get()] ? true : false;
        
        this.isSubchannelChecked = function() {
            var checked = this.isChecked();
            if (!checked && this.subChannels) {
                angular.forEach(this.subChannels, function (subChannel) {
                    if (subChannel.isSubchannelChecked()) {
                        checked = true;
                    }
                });
            }
            return checked;
        }; 
        
        this.populateFromFields = function (channelList, fields) {
            angular.forEach(fields, function (value, key) {
                if (channelList[key]) {
                    channelList[key].setChecked(value);
                    channelList[key].click();
                } else {
                    var channelField = key.split("-");
                    var channel = channelList[channelField[0]];
                    if (channelField.length !== 2 || !angular.isDefined(channelField[1])) {
                        throw new Error("Cannot reconstuct data model for " + key);
                    }
                    channel.fields[channelField[1]].setValue(value);
                }
            });
        };      
        
        this.populateFromContentSourceFilters = function (contentSourceFilters) {
            if (this.subChannels) {
                angular.forEach(this.subChannels, function (subChannel) {
                    subChannel.populateFromContentSourceFilters(contentSourceFilters);
                });
            } else {
                var channelFilters = $filter('filter')(contentSourceFilters, {name: this.getApiName()});
                if (channelFilters.length === 1) {
                    var chF = channelFilters[0];
                    this.setChecked(true);
                    this.click();
                    angular.forEach(this.getFields(), function (field) {
                        if (angular.isDefined(chF.filters[field.config.apiName])) {
                            field.setValue(chF.filters[field.config.apiName]);
                        }
                    }, this);
                }
            }
        };
        
        this.collectCriteriaWithInfo = function(fi) {
            fi = fi || {csFilters: [], filters: {}, fields: {}, query: {}, info: {}, errorFields: []};
            if (this.subChannels) {
                angular.forEach(this.subChannels, function (subChannel) {
                    subChannel.collectCriteriaWithInfo(fi);
                }); 
            } else {
                var csFilters = {};
                var channelChecked = this.isChecked();
                fi.fields[this.getId()] = channelChecked;
                angular.forEach(this.getFields(), function(field) {
                    if (!field.validate() && !fi.errorFields.includes(field)) {
                        fi.errorFields.push(field);
                    }
                    var value = field.getValue();
                    if (value) {
                        fi.fields[field.getUniqueId()] = field.getValue();
                        if (field.getScope() & FieldScopeEnum.CHANNEL && channelChecked) {
                            csFilters[field.getApiName()] = value;                                
                            var fieldInfoArray = fi.info[field.getCaption()];
                            if (!fieldInfoArray) {
                                fieldInfoArray = [];
                                fi.info[field.getCaption()] = fieldInfoArray;
                            }
                            var label = field.getRawValue().label ?  field.getRawValue().label : value;
                            if (fieldInfoArray.indexOf(label) === -1) {
                                fieldInfoArray.push(label);
                            }
                        }
                        if (field.getScope() & FieldScopeEnum.FILTER) {
                            fi.filters[field.getApiName()] = value;
                        }
                        if (field.getScope() & FieldScopeEnum.QUERY) {
                            fi.query[field.getApiName()] = value;
                        }
                    }
                });
                if (channelChecked) {
                    fi.csFilters.push({"name": this.getApiName(), "filters": csFilters});
                }
            };
            return fi;
        };
        
    
        this.click = function (depth) {
            if (this.getSubChannels()) {
                angular.forEach(this.getSubChannels(), function (channel) {
                    channel.setChecked(this.isChecked());
                    if (channel.getSubChannels()) {
                        channel.click(1);
                    }
                }, this);
            }
            ;
            if (!depth || depth === 0) {
                var channelChecked = true;
                angular.forEach(this.channelHierarchy.all.getSubChannels(), function (channel) {
                    var subChannelChecked = true;
                    if (channel.getSubChannels()) {
                        angular.forEach(channel.getSubChannels(), function (subChannel) {
                            if (!subChannel.isChecked()) {
                                subChannelChecked = false;
                            }
                        });
                    } else {
                        subChannelChecked = channel.isChecked();
                    }
                    channel.setChecked(subChannelChecked);
                    if (subChannelChecked === false) {
                        channelChecked = false;
                    }
                });
                this.channelHierarchy.all.setChecked(channelChecked);
            }
        }; 
            
        
        this.reset = function (includeFields) {
            if (this.subChannels) {
                angular.forEach(this.subChannels, function (subChannel) {
                    subChannel.reset(includeFields);
                });
            } else {
                this.setChecked(false);
                this.click();
                if (includeFields) {
                    angular.forEach(this.getFields(), function (field) {
                        field.reset();
                    });
                }
            }
        };        
         
    };
    
    return Channel;
});