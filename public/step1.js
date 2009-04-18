jQuery(function($) {
  var $$ = function(param) {
    var id = $.data($(param)[0]);
    return $.cache[id];
  }
  
  $.fn.tabs = function(options) {
    options = options || {};
    
    // Initialize
    this.each(function() {
      var tabList = $(this);
      $$(tabList).panels = $();
      
      $("li a", tabList)
        .click(function() {
          tabList.trigger("activated", this);
          return false;
        }).each(function() {
          var panel = $($(this).attr("href"));
          $$(tabList).panels = $$(tabList).panels.add(panel);
          tabList.trigger("setupPanel", [panel]);
        });
        
      tabList.trigger("initialize");
    });
    
    return this;
  };
  
  $("ul.tabs").tabs();
});