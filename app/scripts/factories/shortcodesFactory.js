'use strict';

searchApp.factory('Shortcodes', function ($filter, messageService) {

    function Shortcode(definition) {
        var self = this;
        this.definition = definition;
        this.counter = 0;
        
        this.generateDescription = function() {
            var result = {};
            result['Allowed attributes (options, filters) for shortcode [' + self.definition.id + ']'] = {
                options: $.map(self.definition.options, function (option, key) {
                        var o = {};
                        o[key] = option;
                        return o;
                }),
                filters: $.map(self.definition.dataFilters, function (selector) {
                    if (selector.public) {
                        var f = {};
                        f[selector.id] = selector.description;
                        return f;
                    }
                })
            };
            return result;
        };
        
        this.validate = function(attr) {
            var isValid = true;
            angular.forEach(attr, function (value, name) {
                if (!self.definition.options[name] && $filter('filter')(self.definition.dataFilters, {id: name}, true).length === 0) {
                    messageService.addError("Unknown shortcode attribute: " + self.definition.id + "->" + name, {targetViews:['search']})({data: self.generateDescription()});
                    isValid = false;
                }
            });  
            return isValid;
        };       

        shortcode.add(self.definition.id, function (buf, attr, data) {
            if (self.validate(attr)) {
                if (data && self.definition.dataFilters) {
                    angular.forEach(self.definition.dataFilters, function (selector) {
                        data = selector.filter(attr[selector.id], data);
                    });
                }
                if (self.definition.options) {
                    angular.forEach(self.definition.options, function (option, key) {
                        if (!attr.hasOwnProperty(key) && option.defaultValue) {
                            attr[key] = option.defaultValue;
                        }
                    });
                }
                return self.definition.render ? self.definition.render(self, buf, attr, data) : buf;
            } else {
                throw new Error('Invalid shortcode!');
            }

        });
        
        this.generateUniqueId = function() {
            this.counter++;
            return self.definition.id + '-' + this.counter;
        };
    }

    return {
        parser: shortcode,
        items: {
            messages: new Shortcode({
                id: 'messages',
                dataFilters: [
                    {id: 'published', description: "Filters out unpublished items", filter: function (filterValue, items) {
                            return items.filter(function (item) {
                                return typeof filterValue === 'undefined' ? item.published : (item.published === filterValue);
                            });
                        }
                    },                     
                    {id: 'category', public: true, description: "Filters items by category", filter: function (filterValue, items) {
                            return items.filter(function (item) {
                                return (typeof filterValue === 'undefined' || (item.category && item.category === filterValue));
                            });
                        }
                    }, 
                    {id: 'minpriority', public: true, description: "Filters items with lower priority out", filter: function (filterValue, items) {
                            return items.filter(function (item) {
                                return (typeof filterValue === 'undefined' || (item.priority && item.priority >= filterValue));
                            });
                        }
                    },   
                    {id: 'validNow', description: "SQL condition - serverside check", filter: function (filterValue, items) {
                            return items.filter(function (item) {
                                return (typeof item.validNow === 'undefined' || item.validNow);
                            });
                        }
                    },                     
                    {id: 'limit', public: true, description: "Maximum items to display", filter: function (filterValue, items) {
                            return items.filter(function (item, index) {
                                return (typeof filterValue === 'undefined' || (index < filterValue));
                            });
                        }
                    }
                ],
                options: {
                    view: {
                        description: "How to render messages",
                        defaultValue: 'list',
                        values: {
                            carousel: function (uniqueId, buf, attr, data) {
                                var output = '';
                                output += '<div id="' + uniqueId + '" class="carousel slide" style="width: ' + attr['width'] + '">';
                                output += '<div class="carousel-inner">';
                                angular.forEach(data, function (item, index) {
                                    output += '<div class="item ' + (index === 0 ? 'active' : '') + '">' + item.content + '</div>';
                                });
                                output += '</div>';
                                output += '<ol class="carousel-indicators">';
                                angular.forEach(data, function (item, index) {
                                    output += '<li data-target="#' + uniqueId + '" data-slide-to="' + index + '"></li>';
                                });
                                output += '</ol>';
                                output += '<span class="left carousel-control" data-target="#' + uniqueId + '" data-slide="prev"><span class="glyphicon glyphicon-chevron-left"></span></span>';
                                output += '<span class="right carousel-control" data-target="#' + uniqueId + '" data-slide="next"><span class="glyphicon glyphicon-chevron-right"></span></span>';
                                output += '</div>';
                                return output;
                            },
                            list: function (uniqueId, buf, attr, data) {
                                var output = '';
                                output += '<div id="' + uniqueId + '" style="width: ' + attr['width'] + '">';
                                output += '<ul class="list-group">';
                                angular.forEach(data, function (item, index) {
                                    output += '<li class="list-group-item" style="border: none">' + item.content + '</li>';
                                });
                                output += '</ul>';
                                output += '</div>';
                                return output;
                            }                            
                        }
                    }, 
                    width: {
                        description: "Width of the widget",
                        defaultValue: '100%'
                    }
                },
                render: function (self, buf, attr, data) {
                    var template = self.definition.options.view.values[attr.view || 'carousel'];
                    return template(self.generateUniqueId(), buf, attr, data);
                }
            })
        }
    };

});

