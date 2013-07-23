(function() {
  var Typeahead = function(models, options) {
    // Immediately create a copy of the given models
    // TODO Allow another collection to be used as models
    models = _.isArray(models) ? models.slice(0) : [];
    this.preInitialize.apply(this, arguments);
    Backbone.Collection.apply(this, arguments);
    this.postInitialize.apply(this, arguments);
  }

  Typeahead.extend = Backbone.Collection.extend;

  Typeahead.Model = Backbone.Model.extend({
    getView: function() {
      if (_.isUndefined(this.view)) {
        this.view = new Typeahead.Item({model: this});
      }
      return this.view;
    },
  });

  _.extend(Typeahead.prototype, Backbone.Collection.prototype, {
    model: Typeahead.Model,
    // Pre-initialization should set up the collection type (remote / local)
    // and clear out the models that would be passed to the initialize
    preInitialize: function(models, options) {
      options || (options = {});
      // Attaching url to "this" also occurs in the constructor
      if (options.url) this.url = options.url;
      if (_.result(this, 'url')) {
        _.extend(this, Typeahead.RemoteCollection);
      } else if (models && models.length) {
        _.extend(this, Typeahead.LocalCollection);
        this._queryset = models.slice(0);
        // Clear out the referenced array object
        models.length = 0;
      } else {
        // For now, the typeahead must have either a URL or initial models
        throw new Error('A typeahead must be created with either initial models (creating a local typeahead) or with a url in the options (creating a remote typeahead)');
      }
    },
    // Models were emptied by the preInitialization function. The parent
    // Backbone.Collection constructor function should have finished.
    postInitialize: function(models, options) {
      // Parse the given options, providing sane defaults where necessary
      options || (options = {});
      this.options = options;

      // If no search key is given, default to 'name'
      this._key = options.key || 'name';

      // TODO what should be loaded directly into the namespace and what should
      // be left in options?

      // Create the view, it should either be provided an 'el' in options or
      // have its setElement function called
      _.extend(options, {collection: this});
      this.view = new Typeahead.View(options);

      // TODO Defaults using .extend()
      options.items || (options.items = 8);

      // menu: '<ul class="typeahead dropdown-menu"></ul>'
      // item: '<li><a href="#"></a></li>'
      // minLength: 1
    },
    render: function(selector) {
      // A proxy to the view's render method
      if (selector) this.view.setElement(selector);
      this.view.render();
    },
  });

  Typeahead.LocalCollection = {
    matcher: function(item, value) {
      return ~item.toLowerCase().indexOf(value.toLowerCase());
    },
    search: function(key, value) {
      // TODO trim value before truthiness testing?
      // Search should be as fast as possible - this does not seem very fast
      var items = value ? _.filter(this._queryset, function(item) { return this.matcher(item[key], value); }, this) : [];
      this.reset(items.slice(0, this.options.items));
    },
  };

  Typeahead.RemoteCollection = {
    // the 'matcher' function is now a server-side operation
    search: function(key, value) {
      // FYI this behavior varies from the normal list
      // On an empty search, it resets the collection
      this._data = this._data || {};
      if (!value) {
        delete this._data[key];
        this.reset();
        return;
      }
      this._data[key] = value;
      this.fetch({data: this._data, reset: true});
    },
  };

  Typeahead.Item = Backbone.View.extend({
    tagName: 'li',
    // TODO by default, this template should display the given key
    template: '<a><%= _.escape(name) %></a>',
    events: {
      'click': 'selectItem',
    },
    render: function() {
      this.$el.html(_.template(this.template, this.model.toJSON()));
      return this;
    },
    selectItem: function() {
      // TODO needs to be combined with select trigger
      this.model.trigger('preselect', this.model);
    },
  });

  Typeahead.View = Backbone.View.extend({
    template: '<input type="text" placeholder="Search" /><ul class="typeahead dropdown-menu"></ul>',
    events: {
      'keyup': 'keyup',
      'keypress': 'keypress',
      'keydown': 'keydown',
      'blur input': 'blur',
      'focus input': 'focus',
      'mouseenter': 'mouseenter',
      'mouseleave': 'mouseleave',
    },
    initialize: function(options) {
      // Parse options passed from the parent collection
      if (options.template) this.template = options.template;

      this.listenTo(this.collection, 'preselect', this.selectModel);
      this.listenTo(this.collection, 'reset', this.renderItems);

      // Boolean toggles
      this.focused = false;
      this.shown = false;
      this.mousedover = false;
      // Rendering
      if (options && options.el) this.el = options.el;
      this.setElement(this.el).render();
    },
    render: function() {
      this.$el.html(_.template(this.template));
      this.$menu = this.$('ul');
      // TODO only supports first input for now - more specific selector?
      this.$input = this.$('input').first();
      return this;
    },
    renderItems: function() {
      this.$menu.empty();
      this.shown = Boolean(this.collection.length);
      _.each(this.collection.models, this.appendItem, this);
      // CSS is handled within the show() and hide() methods
      if (this.shown) {
        this.show();
      } else {
        this.hide();
      }
    },
    appendItem: function(model) {
      this.$menu.append(model.getView().render().el);
      // TODO separate model or just use default?
      // var itemView = new Typeahead.Item({model: model});
      // this.$menu.append(itemView.render().el);
    },
    searchItems: function(e) {
      // TODO wait for input greater than a minimum number of characters
      // TODO put key second so it can be optional?
      // Only remove the selected model if the input has changed
      // TODO last selected model?
      var val = this.$input.val();
      if (this._prev && this._prev !== val) {
        if (!_.isUndefined(this.collection.selected)) {
          this.collection.selected = undefined;
          this.collection.trigger('deselect', this);
        }
      }
      this._prev = val;
      this.collection.search(this.collection._key, val);
    },
    keydown: function(e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27]);
      this.move(e);
    },
    keypress: function(e) {
      // The suppressKeyPressRepeat check exists because keydown and keypress
      // may fire for the same event
      if (this.suppressKeyPressRepeat) return;
      this.move(e);
    },
    keyup: function(e) {
      switch(e.keyCode) {
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
          this.searchItems(e);
      }
      e.stopPropagation();
      e.preventDefault();
    },
    show: function() {
      // Do not show the menu if no models exist
      if (!this.collection.length) return;
      var pos = $.extend(
        {},
        this.$input.position(),
        // FYI the [0] index is needed to return the vanilla HTML object
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
    select: function() {
      var index = this.$menu.find('.active').index();
      // TODO this is a brittle method of accessing the underlying models
      this.selectModel(this.collection.models[index]);
    },
    selectModel: function(model) {
      this.collection.selected = model;
      this.$input.val(model.get(this.collection._key));
      this.hide();
      // Pass the typeahead itself as the second trigger parameter
      this.collection.trigger('select', model, this);
      // Reset the collection and set its search data to an empty value
      // TODO Add the selected model as the only item?
      this.collection.search(this.collection._key, '');
    },
    move: function(e) {
      if (!this.shown) return;
      switch(e.keyCode) {
        case 9: // Tab
        case 13: // Enter
        case 27: // Escape
          e.preventDefault();
          break;
        case 38: // Up arrow
          e.preventDefault();
          this.prevItem();
          break;
        case 40: // Down arrow
          e.preventDefault();
          this.nextItem();
          break;
      }
      e.stopPropagation();
    },
    prevItem: function() {
      // TODO should prev and next be signals sent to the collection?
      var active = this.$menu.find('.active').removeClass('active');
      var prev = active.prev();
      if (!prev.length) prev = this.$menu.find('li').last();
      prev.addClass('active');
    },
    nextItem: function() {
      var active = this.$menu.find('.active').removeClass('active');
      var next = active.next();
      if (!next.length) next = $(this.$menu.find('li')[0]);
      next.addClass('active');
    },
    focus: function() {
      // Only show the results list if there are items indicated by this.shown
      this.focused = true;
      // TODO Only show if no item is selected
      if (!this.shown) this.show();
    },
    blur: function() {
      this.focused = false;
      if (!this.mousedover && this.shown) this.hide();
    },
    mouseenter: function(e) {
      this.mousedover = true;
      // TODO Re-add 'active' class to the current target 
    },
    mouseleave: function(e) {
      this.mousedover = false;
      if (!this.focused && this.shown) this.hide();
    },
  });

  Backbone.Typeahead = Typeahead;

}).call(this);