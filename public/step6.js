// Takes a bucket of behaviors and runs them with optional options.
//
// Example:
// $("div").setupExtras({fun: [function(options) { 
//    if(options.fun) console.log("OMG FUN");
//    delete options.fun;
// }]}, options);
//
// The purpose of this method is to allow users to extend a plugin
// with additional behaviors that are potentially dependent on the
// options passed in.
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
  // Returns the object bound to a particular node.
  // $$("div").foo is equivalent to $("div").data("foo")
  var $$ = function(param) {
    var id = $.data($(param)[0]);
    return $.cache[id];
  };
  
  // Tabs plugin. The base plugin has no options, but any passed
  // in options are passed to any setup behaviors in options.setup.
  $.fn.tabs = function(options) {
    options = options || {};
    
    // options.setup defaults to $.fn.tabs.base
    this.setupExtras(options.setup || $.fn.tabs.base, options);
    
    // Initialize
    this.each(function() {
      var tabList = $(this);
      
      // Start off the tabList's panels as an empty jQuery object
      $$(tabList).panels = $();
      
      // Find the actual tab links
      $("li a", tabList)
        .click(function() {
          // When a tab link is clicked, fire the activate event.
          // The second parameter to the activate callback will
          // be the link. "this" will be the tabList.
          tabList.trigger("activated", this);
          return false;
        }).each(function() {
          // If the link's href is "#first", its panel is $("#first")
          var panel = $($(this).attr("href"));
          // Add that panel to the tabList's list of panels
          $$(tabList).panels = $$(tabList).panels.add(panel);
          // Trigger the setupPanel event for the panel. The most
          // likely thing to do with this event is to hide the panel.
          // The second parameter to the setupPanel callback will be
          // the panel.
          tabList.trigger("setupPanel", panel);
        });
      
      // Trigger the initialize event. This could be used, for instance,
      // to select a tab to trigger.
      tabList.trigger("initialize");
    });
    
    return this;
  };
  
  var getPanel = function(selected) {
    return $($(selected).attr("href"));
  };
  
  // Default behaviors to setup when the tabs are activated
  $.fn.tabs.base = {
    setupPanel: [function(options) {
      // When setupPanel is triggered, hide the panel
      this.bind("setupPanel", function(e, selector) {
        $(selector).hide();
      });
    }],
    
    initialize: [function(options) {
      // When initialized is triggered, activate the first tab
      this.bind("initialize", function() {
        var firstTab = $(this).find("li a:first")[0];
        $(this).trigger("activated", firstTab);
      });
    }],
    
    // When a tab is activated:
    //   hide all panels
    //   show the panel associated with this tab
    //   remove the active flag from all tabs
    //   add the active flag to the tab
    activate: [function(options) {
      this.bind("activated", function(e, selected) {
        var panel = getPanel(selected);
        $$(this).panels.hide();
        $(panel).show();
        $(this).find("li a").removeClass("active");
        $(selected).addClass("active").blur();
      });
    }]
  };
  
  // Extend the base behaviors
  var wycats = $.extend({}, $.fn.tabs.base);
  // Add a new activate behavior to run before the base one
  wycats.activate.unshift(function(options) {
    // Save off XHR options
    var xhr = options.xhr;
    // On activation, check to see whether the selected tab
    // is in the xhr options. If so, throw in a throbber
    // and load the associated URL into the panel.
    this.bind("activated", function(e, selected) {
      var url = xhr && xhr[$(selected).attr("href")];
      if(url) {
        var panel = getPanel(selected);
        panel.html("<img src='throbber.gif'/>").load(url);
      }
    });
  });
  
  // Adding support for loading based on hash. Delete the
  // default initialize behavior. It is too simple.
  delete wycats.initialize;
  
  wycats.hash = [function(options) {
    var tabs = this;
  
    // On initialize:
    //   Get all the tabs
    //   If there's a hash, filter it down to the tab matching the hash
    //   Activate the first remaining tab
    this.bind("initialize", function() {
      var tab = $(this).find("li a");
      if(window.location.hash) tab = tab.filter("a[href='" + window.location.hash + "']");
      $(this).trigger("activated", tab[0]);
    });
    
    // When a tab is activated, update the hash
    this.bind("activated", function(e, selected) {
      window.location.hash = $(selected).attr("href");
    });
    
    // Because there is no hashchange event, simulate one.
    // When the hash changes, trigger the initialization, which
    // will load the right tab.
    var lastHash = window.location.hash;
    setInterval(function() {
      if(lastHash != window.location.hash) {
        tabs.trigger("initialize");
        lastHash = window.location.hash;
      }
    }, 500);    
  }];
    
  $("ul.tabs").tabs({setup: wycats, xhr: {"#first": "/awesome"}});
});