angular.module('ui.bootstrap.collapsible',['ui.bootstrap.transition'])

// The collapsible directive indicates a block of html that will expand and collapse
.directive('collapsible', ['$parse', '$transition', '$timeout', function($parse, $transition, $timeout) {
  // CSS transitions don't work with height: auto, so we have to manually change the height to a
  // specific value and then once the animation completes, we can reset the height to auto.
  // Unfortunately if you do this while the CSS transitions are specified (i.e. in the CSS class
  // "collapse") then you trigger a change to height 0 in between.
  // The fix is to remove the "collapse" CSS class while changing the height back to auto - phew!
  var fixUpHeight = function(scope, element, height) {
    // We remove the collapse CSS class to prevent a transition when we change to height: auto
    element.removeClass('collapse');
    element.css({ height: height });
    // It appears that  reading offsetWidth makes the browser realise that we have changed the
    // height already :-/
    var x = element[0].offsetWidth;
    element.addClass('collapse');
  };

  return {
    link: function(scope, element, attrs) {

      var isCollapsed;

      scope.$watch(attrs.isCollapsed, function(value) {
        if (value) {
          collapse();
        } else {
          expand();
        }
      });

      var currentTransition;
      var doTransition = function(change) {
        if ( currentTransition ) {
          currentTransition.cancel();
        }
        currentTransition = $transition(element,change);
        currentTransition.then(
          function() { currentTransition = undefined; },
          function() { currentTransition = undefined; }
        );
        return currentTransition;
      };

      var expand = function() {
        doTransition({ height : element[0].scrollHeight + 'px' })
        .then(function() {
          // This check ensures that we don't accidentally update the height if the user has closed
          // the group while the animation was still running
          if ( !isCollapsed ) {
            fixUpHeight(scope, element, 'auto');
          }
        });
        isCollapsed = false;
      };
      
      collapse = function() {
        if ( !isCollapsed ) {
          isCollapsed = true;
          fixUpHeight(scope, element, element[0].scrollHeight + 'px');
          doTransition({'height':'0'});
        }
      };
    }
  };
}]);