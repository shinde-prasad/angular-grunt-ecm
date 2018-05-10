searchApp.directive('selectableText', function($window, $timeout) {
  var i = 0;      
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$clickOnNoSelect' + i++,
          _ngClick = tAttrs.ngClick;

      tAttrs.ngClick = fn + '($event)';

      return function(scope) {
        var lastAnchorOffset, lastFocusOffset, timer;

        scope[fn] = function(event) {
          var selection    = $window.getSelection(),
              anchorOffset = selection.anchorOffset,
              focusOffset  = selection.focusOffset;
      
            if (!timer) {
                // delay invoking click so as to watch for user double-clicking 
                // to select words
                timer = $timeout(function () {
                    scope.$eval(_ngClick, {$event: event});
                    timer = null;
                }, 250);
            }

          if(focusOffset - anchorOffset !== 0) {
            if(!(lastAnchorOffset === anchorOffset && lastFocusOffset === focusOffset)) {
              lastAnchorOffset = anchorOffset;
              lastFocusOffset  = focusOffset;
              if(timer) {
                $timeout.cancel(timer);
                timer = null;
                event.stopPropagation();
              }
              return;
            }
          }
          lastAnchorOffset = null;
          lastFocusOffset  = null;

        };
      };
    }
  };
});