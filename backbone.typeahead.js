(function() {
  // TODO We could create one monster object: inherit the attributes of both
  // collections and view
  var Typeahead = function(models, options) {
    this.collection = new Typeahead.Collection(models, options);
    this.view = new Typeahead.View({collection: this.collection});

    // TODO bootstrap options
    // items: 8
    // menu: '<ul class="typeahead dropdown-menu"></ul>'
    // item: '<li><a href="#"></a></li>'
    // minLength: 1
  }

  Typeahead.LocalCollection = {
    matcher: function(item, value) {
      return ~item.toLowerCase().indexOf(value.toLowerCase());
    },
    search: function(key, value) {
      // TODO trim first?
      if (!value) {
        this.reset(this._all);
        return;
      }
      this.reset(_.filter(this._all, function(item) { return this.matcher(item[key], value); }, this));
    },
  };

  Typeahead.RemoteCollection = {
    // the 'matcher' function is now a server-side operation
  };

  Typeahead.Model = Backbone.Model.extend({
    getView: function() {
      if (_.isUndefined(this.view)) {
        this.view = new Typeahead.Item({model: this});
      }
      return this.view;
    },
  });

  Typeahead.Collection = Backbone.Collection.extend({
    model: Typeahead.Model,
    initialize: function(models, options) {
      if (_.result(this, 'url')) {
        console.log('this is a remote collection');
      } else {
        // TODO A local collection should only be created if initial models exist
        _.extend(this, Typeahead.LocalCollection);
        this._all = models.slice(0);
      }
      // Create the view, it should either be provided an 'el' in options or have
      // its setElement function called
    },
  });

  Typeahead.Item = Backbone.View.extend({
    tagName: 'li',
    template: '<a><%= _.escape(name) %></a>',
    events: {
      'click': 'selectItem',
    },
    render: function() {
      this.$el.html(_.template(this.template, this.model.toJSON()));
      return this;
    },
    selectItem: function() {
      console.log('select item:', this);
    },
  });

  Typeahead.View = Backbone.View.extend({
    template: '<input type="text" data-key="name" placeholder="Search Names" /><ul class="typeahead dropdown-menu"></ul>',
    events: {
      'keyup': 'keyup',
      'keypress': 'keypress',
      'keydown': 'keydown',
      'blur input': 'blur',
      'focus input': 'focus',
      'mouseenter': 'mouseenter',
      'mouseleave': 'mouseleave',
    },
    initialize: function() {
      this.collection.on('selected', this.selectModel, this);
      this.collection.on('reset', this.renderItems, this);
      // Boolean toggles
      this.focused = false;
      this.shown = false;
      this.mousedover = false;
    },
    render: function() {
      this.$el.html(_.template(this.template));
      this.$ul = this.$('ul');
      // TODO only supports one input for now
      this.$input = this.$('input');
      return this;
    },
    renderItems: function() {
      this.$ul.empty();
      this.shown = Boolean(this.collection.length);
      _.each(this.collection.models, this.appendItem, this);
      // The CSS is handle by the show() and hide() methods
      if (this.shown) {
        this.show();
      } else {
        this.hide();
      }
    },
    appendItem: function(model) {
      this.$ul.append(model.getView().render().el);
      // TODO separate model or just use default?
      // var itemView = new Typeahead.Item({model: model});
      // this.$ul.append(itemView.render().el);
    },
    searchItems: function(e) {
      // TODO collection can either be 'remote' or 'local'
      // var target = $(e.currentTarget);
      var target = this.$input;
      // TODO wait for input greater than a minimum number of characters
      this.collection.search(target.attr('data-key'), target.val());
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
      var pos = $.extend(
        {},
        this.$input.position(),
        // FYI the [0] index is needed to return the vanilla HTML object
        {height: this.$input[0].offsetHeight}
      );
      this.$ul.css({
        top: pos.top + pos.height,
        left: pos.left
      }).show();
      this.shown = true;
      return this;
    },
    hide: function() {
      this.$ul.hide();
      this.shown = false;
      return this;
    },
    select: function() {
      console.log('select');
      // TODO Select triggers should be off-loaded to the models
      var id = this.$ul.find('.active').find('a').attr('data-id');
      this.selectModel(this.collection.get(id));
    },
    selectModel: function(model) {
      console.log('selectModel', model);
      // TODO send triggers to the collection?
      // TODO reset the collection and add this model as the only item
      this.collection.selected = model;
      this.$input.val(model.get('name'));
      this.hide();
      // Bubble a onSelect event with the selected model to the parent event
      this.trigger('onSelect', model);
      // Reset the collection and set its search data to this value
      this.collection.search('name', '');
      // Clear the typeahead input value
      this.$input.val('');
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
      var active = this.$ul.find('.active').removeClass('active');
      var prev = active.prev();
      if (!prev.length) prev = this.$ul.find('li').last();
      prev.addClass('active');
    },
    nextItem: function() {
      var active = this.$ul.find('.active').removeClass('active');
      var next = active.next();
      if (!next.length) next = $(this.$ul.find('li')[0]);
      next.addClass('active');
    },
    focus: function() {
      // Only show the results list if there are items (indicated by this.shown)
      // if (this.shown) this.show();
      console.log('focus', this.focused, this.mousedover, this.shown);
      this.focused = true;
    },
    blur: function() {
      this.focused = false;
      console.log('blur:', this.focused, this.mousedover, this.shown);
      if (!this.mousedover && this.shown) this.hide();
    },
    mouseenter: function(e) {
      console.log('mouse enter');
      this.mousedover = true;
      // TODO Re-add 'active' class to the current target 
    },
    mouseleave: function(e) {
      this.mousedover = false;
      console.log('mouse leave:', this.focused, this.mousedover, this.shown);
      if (!this.focused && this.shown) this.hide()
    },
  });

  Backbone.Typeahead = Typeahead;

}).call(this);