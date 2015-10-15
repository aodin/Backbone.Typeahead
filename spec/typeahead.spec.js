// Fixtures and name shortcut
var Typeahead = Backbone.Typeahead;
var states = [
  {name: 'Michigan'},
  {name: 'Minnesota'},
  {name: 'Nevada'},
  {name: 'Ohio'},
  {name: 'New York'},
  {name: 'Alabama'},
];

describe('Typeahead', function() {

  describe('Initialization', function() {

    it('errors if no parameters are given', function() {
      expect(function() { new Typeahead(); }).toThrow();
    });

    it('accepts an array of models as its first parameter', function() {
      var t = new Typeahead(states);
      expect(t).toBeDefined();

      // A collection should always exist
      expect(t.collection).toBeDefined();
      expect(t.collection.length).toEqual(states.length);
    });

    it('accepts an options objects as its first parameter', function() {
      // The options object must contain a collection or it will error
      var items = new Backbone.Collection(states);
      var t = new Typeahead({key: 'label', collection: items});
      expect(t).toBeDefined();
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('label');
    });

    it('accepts an array of models and an options object', function() {
      var t = new Typeahead(states, {key: 'label', limit: 5});
      expect(t).toBeDefined();
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('label');
      expect(t.options.limit).toBe(5);

      // A collection should always exist
      expect(t.collection).toBeDefined();
      expect(t.collection.length).toEqual(states.length);
    });

    it('sets sane defaults when not given options', function() {
      var t = new Typeahead(states);
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('name');
      expect(t.options.limit).toBe(8);

      // A collection should always exist
      expect(t.collection).toBeDefined();
      expect(t.collection.length).toEqual(states.length);
    });

    it('allows custom collections', function() {
      var Alpha = Backbone.Collection.extend({
        comparator: function(model) {
          return model.get('name');
        }
      });
      var alpha = new Alpha(states);

      var t = new Typeahead({collection: alpha});

      // The results should now be sorted alphabetically
      expect(t.collection).toBe(alpha);
    })

  });

  describe('Render', function() {

    it('creates a rendered element', function() {
      var t = new Typeahead(states);
      var rendered = t.render().el;

      expect(rendered).toContainHtml(Typeahead.template);
    });

    it('allows an el to passed through options', function() {
      var span = $('<span/>');
      var t = new Typeahead(states, {el: span});
      t.setElement(span).render();

      expect(span).toContainHtml(Typeahead.template);
    });

    it('works with setElement', function() {
      var t = new Typeahead(states);
      var span = $('<span/>');
      t.setElement(span).render();

      expect(span).toContainHtml(Typeahead.template);
    });

    it('defaults to a basic item view', function() {
      var t = (new Typeahead(states)).render();
      t.$input.val('mi');
      t.searchInput();
      var firstItemView = t.$('li').first();
      expect(firstItemView).toContainHtml('<a>' + firstItemView.text() + '</a>');
    });

    it('will render a custom item view template', function() {
      var t = (new Typeahead(states, {itemTemplate: '<a><em><%- name %></em</a>'})).render();
      t.$input.val('mi');
      t.searchInput();
      var firstItemView = t.$('li').first();
      expect(firstItemView).toContainHtml('<a><em>' + firstItemView.text() + '</em></a>');
    });

    it('limits the number of menu items', function() {
      var t = (new Typeahead(states, {limit: 1})).render();
      t.$input.val('m');
      t.searchInput();
      expect(t.$('li')).toHaveLength(1);
    });
  });

  describe('Search', function() {

    var t = new Typeahead(states);

    it('returns case-insensitive results by default', function() {
      // TODO Does order of results matter?
      expect(t.search('MI').length).toEqual(2);
      expect(t.search('mi').length).toEqual(2);
    });

    it('escapes input that would cause regex errors', function() {
      expect(function(){t.search('MI(');}).not.toThrow();
    });

    it('populates the menu when the typeahead has been rendered', function() {
      var span = $('<span/>');
      t.setElement(span).render();
      t.$input.val('mi');
      t.searchInput();

      expect(t.$('li')).toHaveLength(2);
    });

  });

  describe('Events', function() {

    var t, span;
    beforeEach(function() {
      span = $('<span/>');
      t = (new Typeahead(states)).setElement(span).render();
    });

    it('are added natively', function() {
      expect(t.events).toEqual(t.nativeEvents);
    });

    it('searches the models on a character keyup', function() {
      t.$input.val('m');
      // Character code 109 is 'm'
      t.$input.trigger(jQuery.Event('keyup', {keyCode: 109}));
      expect(t.$('li')).toHaveLength(3);
    });

    it('select a model when it is clicked', function() {
      t.$input.val('m');
      t.searchInput();
      expect(t.$('li')).toHaveLength(3);

      var selectSpy = sinon.spy();
      t.on('selected', selectSpy);
      var firstMenuItem = t.$('li').first();
      firstMenuItem.trigger('click');

      expect(t.$input.val()).toEqual(firstMenuItem.text());
      expect(selectSpy.calledOnce).toBe(true);

      // The selected event should fire with a Backbone Model as an arg
      var item = t.collection.findWhere({name: firstMenuItem.text()});
      expect(selectSpy.firstCall.calledWith(item, t.collection));
    });

    it('move the active item with the up and down arrows', function() {
      t.$input.val('m');
      t.searchInput();

      // Down arrow is key 40
      t.$input.trigger(jQuery.Event('keydown', {keyCode: 40}));
      expect(t.$('li').first()).toHaveClass('active');
      // It should be the only item to have the active class
      expect(t.$('.active')).toHaveLength(1);

      // Up arrow is key 38
      t.$input.trigger(jQuery.Event('keydown', {keyCode: 38}));
      expect(t.$('li').last()).toHaveClass('active');
      expect(t.$('.active')).toHaveLength(1);

      t.$input.trigger(jQuery.Event('keydown', {keyCode: 38}));
      // Second item should now be selected
      expect(t.$('li').eq(1)).toHaveClass('active');
      expect(t.$('.active')).toHaveLength(1);
    });

    it('select the active item on enter', function() {
      t.$input.val('m');
      t.searchInput();

      // Up arrow is key 38, Enter is key 13
      t.$input.trigger(jQuery.Event('keydown', {keyCode: 38}));
      var activeItem = t.$('.active').first();
      var item = t.collection.findWhere({name: activeItem.text()});

      var selectSpy = sinon.spy();
      t.on('selected', selectSpy);

      t.$input.trigger(jQuery.Event('keyup', {keyCode: 13}));

      expect(t.$input.val()).toEqual(activeItem.text());
      expect(selectSpy.calledOnce).toBe(true);

      // The selected event should fire with a Backbone Model as an arg
      var item = t.collection.findWhere({name: activeItem.text()});
      expect(selectSpy.firstCall.calledWith(item, t.collection));
    });
  });
  // End Typeahead test suite
});

describe('Extended Typeaheads', function() {

  it('can be created by calling extend', function() {
    // Create the constructor
    var Extended = Typeahead.extend({
      className: 'extended-class',
    });
    expect(Extended).toBeDefined();

    // Create an instance
    var t = new Extended(states);
    expect(t).toBeDefined();
    expect(t.render().el).toHaveClass('extended-class');
  });

  it('can use a different template', function() {
    var Ordered = Typeahead.extend({
      template: '<input type="search" placeholder="Enter a State" /><ol class="typeahead dropdown-menu"></ol>',
      // Render must be overwritten because of the $menu cache
      render: function() {
        this.$el.html(this.template);
        this.$menu = this.$('ol');
        this.$input = this.$('input');
        return this;
      },
    });
    expect(Ordered).toBeDefined();

    var t = new Ordered(states);
    expect(t).toBeDefined();

    var rendered = t.render().el;
    expect(rendered).toContainHtml(Ordered.template);

    t.$input.val('mi');
    t.searchInput();
    expect(t.$('li')).toHaveLength(2);
  });

  // TODO Custom events

  // End Extended Typeahead test suite
});
