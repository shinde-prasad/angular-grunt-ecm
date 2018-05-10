'use strict';

searchApp.directive('validateCron', function () {
  return {
    restrict: "A",
    require: '?ngModel',
    link: function (scope, elm, attrs, ngModel) {
      var CRON_SEC_MIN_REGEXP = /^(([1-5]\d|\d)-([1-5]\d|[1-9])|[1-5]\d|\d)(,(([1-5]\d|\d)-([1-5]\d|[1-9])|[1-5]\d|\d))+$|^([1-5]\d|\d)[-\/]([1-5]\d|[1-9])$|^[1-5]\d$|^\d$|^\*$|^\?$/;
      var CRON_HOUR_REGEXP = /^((2[0-3]|1\d|\d)-(2[0-3]|1\d|[1-9])|2[0-3]|1\d|\d)(,((2[0-3]|1\d|\d)-(2[0-3]|1\d|[1-9])|2[0-3]|1\d|\d))+$|^(2[0-3]|1\d|\d)[-\/](2[0-3]|1\d|[1-9])$|^2[0-3]$|^1\d$|^\d$|^\*$|^\?$/;
      var CRON_DAY_MONTH_REGEXP = /^((3[01]|2\d|1\d|[1-9])-(3[01]|2\d|1\d|[1-9])|3[01]|2\d|1\d|[1-9])(,((3[01]|2\d|1\d|[1-9])-(3[01]|2\d|1\d|[1-9])|3[01]|2\d|1\d|[1-9]))+$|^(3[01]|2\d|1\d|[1-9])[-\/](3[01]|2\d|1\d|[1-9])$|^3[01][LW]?$|^2\d[LW]?$|^1\d[LW]?$|^[1-9][LW]?$|^[LW]$|^\*$|^\?$/;
      var CRON_MONTH_REGEXP = /^((((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9])-((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9]))|(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9])(,((((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9])-((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9]))|(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9]))+$|^((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9])-((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)|1[012]|[1-9])$|^(1[012]|[1-9])\/(1[012]|[1-9])$|^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$|^1[012]$|^[1-9]$|^\*$|^\?$/;
      var CRON_DAY_WEEK_REGEXP = /^((((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7])-((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7]))|(SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7])(,((((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7])-((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7]))|(SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7]))+$|^((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7])-((SUN|MON|TUE|WED|THU|FRI|SAT)|[1-7])$|^[1-7]\/[1-7]$|^(SUN|MON|TUE|WED|THU|FRI|SAT)$|^[1-7](L|#\d)?$|^\*$|^\?$/;
      var CRON_YEAR_REGEXP = /^(20\d\d|19[7-9]\d)(,(20\d\d|19[7-9]\d))+$|^(20\d\d|19[7-9]\d)-(20\d\d|19[7-9]\d)$|^(20\d\d|19[7-9]\d)\/(\d{1,2}|1[012]\d)$|^20\d\d$|^19[7-9]\d$|^\*$|^\?$/;
      /*
       if (!attrs.validCron)
       return;
       */
      ngModel.$validators.cron = function(modelValue, viewValue) {

        //console.log("running cron validator");

        if (ngModel.$isEmpty(modelValue))
          return true;

        var cron_parts = angular.isString(viewValue) ? viewValue.replace(/[ ]+/g, ' ').split(' ') : [];

        if ((cron_parts.length < 6) || (cron_parts.length > 7)) {
          return false;
        }

        if (!CRON_SEC_MIN_REGEXP.test(cron_parts[0]))
          return false;

        if (!CRON_SEC_MIN_REGEXP.test(cron_parts[1]))
          return false;

        if (!CRON_HOUR_REGEXP.test(cron_parts[2]))
          return false;

        if (!CRON_DAY_MONTH_REGEXP.test(cron_parts[3]))
          return false;

        if (!CRON_MONTH_REGEXP.test(cron_parts[4]))
          return false;

        if (!CRON_DAY_WEEK_REGEXP.test(cron_parts[5]) ||
          (cron_parts[5] === '?' && cron_parts[3] === '?') ||  (cron_parts[3] != '?' && cron_parts[5] != '?'))
          return false;

        if (cron_parts.length == 7) {
          if (!CRON_YEAR_REGEXP.test(cron_parts[6]))
            return false;
        }
        return true;
      };
    }
  };
});
