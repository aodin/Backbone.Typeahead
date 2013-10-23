(function() {
  var Typeahead = function(models, options) {
    // The first parameter 'model' is an optional parameter
    // If given an array, a copy will be made and passed to preInitialize
    if (_.isArray(models)) {
      // It is copied to prevent overwrite
      // TODO this copy may be unnecessary
      models = models.slice(0);
      if (!_.isObject(options)) options = {};
    } else if (_.isObject(models)) {
      options = models;
      // TODO Should also error if no collection was provided in options
    } else {
      throw new Error('A typeahead must be created with either initial models or have its collection specified in an options object');
    }

    // Initialize
    this.preInitialize.call(this, models, options);
    Backbone.View.call(this, options);
    this.postInitialize.call(this);
  }

  Typeahead.VERSION = '0.1.1';
  Typeahead.extend = Backbone.View.extend;

  // TODO Use a preInit/postInit style view
  Typeahead.ItemView = Backbone.View.extend({
    tagName: 'li',
    events: {
      'click': 'selectItem',
      'mouseover': 'activateItem',
    },
    initialize: function(options) {
      // A reference to the parent view (aka the Typeahead) is required
      this.parent = options.parent;
    },
    render: function() {
      this.$el.html(_.template(this.template, this.model.toJSON()));
      return this;
    },
    // TODO Or use triggers instead?
    selectItem: function() {
      this.parent.selectModel(this.model);
    },
    activateItem: function() {
      this.parent.activateModel(this.model);
    },
  });

  _.extend(Typeahead.prototype, Backbone.View.prototype, {
    // Pre-initialization should set up the collection type (remote / local)
    preInitialize: function(models, options) {
      // Set sane defaults
      // TODO Allow compound keys? Introspect first model for a default key?
      options.key || (options.key = 'name');
      options.limit || (options.limit = 8);

      if (_.isUndefined(options.collection) && _.isArray(models)) {
        // TODO Any properties of collections that options can't handle?
        options.collection = new Backbone.Collection(models, options);
      }

      // Build a item view if one was not provided
      // TODO confirm that any given view is a Backbone.View object
      this.view = options.view;

      // TODO Uhoh, context
      var self = this;
      
      if (_.isUndefined(this.view)) {
        // TODO provide the partially extended view for users to extend
        this.view = Typeahead.ItemView.extend({
          // Dynamically construct a template with the key
          // TODO Allow the item template to be passed through options
          template: options.itemTemplate || '<a><%- ' + options.key + ' %></a>',
        });
      }

      // Attach native events, deferring to custom events
      this.events = _.extend({}, this.nativeEvents, _.result(this, 'events'));

      // Backbone 1.1 no longer binds options to this by default
      this.options = options;

      // TODO Listen to changes on the collection
    },
    // Models were emptied by the preInitialization function
    // The parent Backbone.View constructor function has finished
    // Options have already been parsed by _context()
    postInitialize: function() {
      // TODO Build the cached lookup of models by the given key, which must
      // be updated when the collection changes and an option to turn off
      this.results = []; // matched results as an array of Backbone Models

      // Boolean toggles
      this.focused = false; // Is the input in focus?
      this.shown = false; // Is the menu shown?
      this.mousedover = false; // Is the mouse over the typeahead (incl. menu)?
    },
    template: '<input type="text" class="form-control" placeholder="Search" /><ul class="dropdown-menu"></ul>',
    nativeEvents: {
      'keyup': 'keyup',
      'keypress': 'keypress',
      'keydown': 'keydown',
      'blur input': 'blur',
      'focus input': 'focus',
      'mouseenter': 'mouseenter',
      'mouseleave': 'mouseleave',
    },
    // The render function should be overwritten on extended typeaheads
    render: function() {
      this.$el.html(this.template);
      this.$menu = this.$('ul');
      this.$input = this.$('input');
      return this;
    },
    // Called by searchInput and whenever models change
    rerender: function(models) {
      this.$menu.empty();
      _.each(models, this.renderModel, this);
      models.length ? this.show() : this.hide();
    },
    renderModel: function(model) {
      // TODO Do not re-render views?
      this.$menu.append((new this.view({model: model, parent: this})).render().el);
    },
    // Return the models with a key that matches a portion of the given value
    // TODO compound keys! cached values! the kitchen sink!
    search: function(value) {
      // Use a regex to quickly perform a case-insensitive match
      var re = new RegExp(value, 'i');
      var key = this.options.key;
      return this.collection.filter(function(model) {
          return re.test(model.get(key));
      });
    },
    // Convenience method for clearing the search input
    clearInput: function() {
      this.$input.val('');
    },
    // Pull the value from the search input and re-render the matched models
    searchInput: function() {
      // TODO it'd be nice to limit the results during array iteration
      this.results = this.search(this.$input.val()).slice(0, this.options.limit);
      this.rerender(this.results);
    },
    select: function() {
      // TODO This may go wrong with different templates
      var index = this.$menu.find('.active').index();
      this.selectModel(this.results[index]);
    },
    selectModel: function(model) {
      // Update the input field with the key attribute of the select model
      this.$input.val(model.get(this.options.key));
      // Hide the menu
      this.hide();
      // TODO What other parameters should be in the trigger?
      this.trigger('selected', model, this.collection)
      // Empty the results
      this.results = [];
    },
    activateModel: function(model) {
      this.$menu.find('.active').removeClass('active');
    },
    // Misc. events
    keyup: function(evt) {
      switch(evt.keyCode) {
        case 40: // Down arrow
        case 38: // Up arrow
        case 16: // Shift
        case 17: // Ctrl
        case 18: // Alt
          break;
        // case 9: // Tab - disabled to prevent rogue select on tabbed focus
        // TODO tab should also leave focus
        case 13: // Enter
          // TODO shown needs to be returned to its original function (as an
          // indicator of whether the menu is currently displayed or not)
          if (!this.shown) return;
          this.select();
          break;
        case 27: // escape
          if (!this.shown) return;
          this.hide();
          break
        default:
          this.searchInput();
      }
      evt.stopPropagation();
      evt.preventDefault();
    },
    // Menu state
    focus: function() {
      this.focused = true;
      // TODO Only show the menu if no item has been selected
      if (!this.shown) this.show();
    },
    blur: function() {
      this.focused = false;
      if (!this.mousedover && this.shown) this.hide();
    },
    mouseenter: function() {
      this.mousedover = true;
      // TODO Re-add 'active' class to the current target 
    },
    mouseleave: function() {
      this.mousedover = false;
      if (!this.focused && this.shown) this.hide();
    },
    // Allow the user to change their selection with the keyboard
    keydown: function(evt) {
      // TODO I still hate this array check
      this.suppressKeyPressRepeat = ~$.inArray(evt.keyCode, [40,38,9,13,27]);
      this.move(evt);
    },
    keypress: function(evt) {
      // The suppressKeyPressRepeat check exists because keydown and keypress
      // may fire for the same event
      if (this.suppressKeyPressRepeat) return;
      this.move(evt);
    },
    move: function(evt) {
      if (!this.shown) return;
      switch(evt.keyCode) {
        case 9: // Tab
        case 13: // Enter
        case 27: // Escape
          evt.preventDefault();
          break;
        case 38: // Up arrow
          evt.preventDefault();
          this.prevItem();
          break;
        case 40: // Down arrow
          evt.preventDefault();
          this.nextItem();
          break;
      }
      evt.stopPropagation();
    },
    prevItem: function() {
      // TODO should there be signals for prev and next?
      var active = this.$menu.find('.active').removeClass('active');
      var prev = active.prev();
      if (!prev.length) prev = this.$menu.find('li').last();
      prev.addClass('active');
    },
    nextItem: function() {
      var active = this.$menu.find('.active').removeClass('active');
      var next = active.next();
      if (!next.length) next = this.$menu.find('li').first();
      next.addClass('active');
    },
    // Show or hide the menu depending on the typeahead's state
    show: function() {
      // DO not show if there are no results
      if (!this.results.length) return;
      var pos = $.extend(
        {},
        this.$input.position(),
        // Calling the [0] index returns the vanilla HTML object
        {height: this.$input[0].offsetHeight}
      );
      this.$menu.css({
        top: pos.top + pos.height,
        left: pos.left
      }).show();
      this.shown = true;
      return this;
    },
    hide: function() {
      this.$menu.hide();
      this.shown = false;
      return this;
    },
  });

  Backbone.Typeahead = Typeahead;

}).call(this);
