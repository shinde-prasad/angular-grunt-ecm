'use strict';

searchApp.provider('Environment', function () {

    var environments = {};
    var selectedEnv = 'undefined';
    var self = this;

    this.setEnvironments = function (envs) {
        if (!Object.keys(envs).length)
            throw new Error('At least one environment is required!');
        environments = envs;
    };

    this.setActive = function (env) {
        if (!environments[env])
            throw new Error('No such environment present: ' + env);
        selectedEnv = env;
        return self.getActive();
    };

    this.getEnvironment = function (env) {
        if (!env)
            throw new Error('No such environment present: ' + env);
        return environments[env];
    };

    this.getActive = function () {
        if (!selectedEnv)
            throw new Error('You must configure at least one environment');

        return environments[selectedEnv];
    };

    this.getRestapiHost = function () {
        var active = self.getActive();
        return active.restapiHost;
    };

    this.$get = [function () {
        return self;
    }];
}).config(function (EnvironmentProvider) {

    //This even allows you to change environment in runtime.
    EnvironmentProvider.setEnvironments({
        dev: {
            restapiHost: ''
        },
        localonly: {
            restapiHost: 'http://10.10.70.163:8080'
        },
        prod: {
            restapiHost: ''
        }
    });

    //Set prod as the active schema
    var port = location.port;
    if (port === "8383") {
        EnvironmentProvider.setActive('localonly');
    } else {
        EnvironmentProvider.setActive('prod');
    }
}); 

