jQuery.fn.setupExtras = function(setup, options) {
  for(extra in setup) {
    var self = this;
    if(setup[extra] instanceof Array) {
      for(var i=0; i<setup[extra].length; i++) 
        setup[extra][i].call(self, options);
    } else {
      setup[extra].call(self, options);
    }
  }
};

jQuery(function($) {
  var $$ = function(param) {
    var id = $.data($(param)[0]);
    return $.cache[id];
  }
  
  $.fn.tabs = function(options) {
    options = options || {};
    
    this.setupExtras(options.setup || $.fn.tabs.base, options);
    
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
  
  var getPanel = function(selected) {
    return $($(selected).attr("href"));
  }
  
  $.fn.tabs.base = {
    setupPanel: [function(options) {
      this.bind("setupPanel", function(e, selector) {
        $(selector).hide();
      });
    }],
    
    initialize: [function(options) {
      this.bind("initialize", function() {
        var firstTab = $(this).find("li a:first")[0];
        $(this).trigger("activated", firstTab);
      });
    }],
    
    activate: [function(options) {
      this.bind("activated", function(e, selected) {
        var panel = getPanel(selected);
        $$(this).panels.hide()
        $(panel).show();
        $(this).find("li a").removeClass("active");
        $(selected).addClass("active").blur();
      });
    }]
  };
  
  var wycats = $.extend({}, $.fn.tabs.base);
  wycats.activate.unshift(function(options) {
    var xhr = options.xhr;
    this.bind("activated", function(e, selected) {
      var url = xhr && xhr[$(selected).attr("href")];
      if(url) {
        var panel = getPanel(selected);
        panel.html("<img src='throbber.gif'/>").load(url)
      }
    });
  });
    
  $("ul.tabs").tabs({setup: wycats, xhr: {"#first": "/awesome"}});
});