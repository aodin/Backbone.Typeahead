// Fixtures and name shortcut
var Typeahead = Backbone.Typeahead;
var queryset = [
  {name: 'Alabama'},
  {name: 'Michigan'},
  {name: 'Minnesota'},
  {name: 'Nevada'},
  {name: 'Ohio'},
  {name: 'New York'},
];

describe('Objects Inherited from Typeahead', function() {
  // Create a new object that inherits from typeahead

  var Inherited = Typeahead.extend({
    method: function() {
      // A blank, extended method
    }
  });
  var inherit = new Inherited(queryset)

  it('should function as a typeahead', function() {
    // A queryset should have been created, but no models
    expect(inherit.length).toEqual(0);
    expect(inherit._queryset).toEqual(queryset);
  });

  // TODO attempt to overwrite some behaviors


});

describe('Typeahead', function() {

  // TODO this is only the local version
  // TODO separate suite of test for default options?
  var typeahead = new Typeahead(queryset);
  
  beforeEach(function() {
    typeahead.search.call(typeahead, typeahead.key, '');
  });

  it('should initialize a local collection when no URL exists', function() {
    // Check that the local methods have been created
    expect(typeahead.matcher).toBe(Typeahead.LocalCollection.matcher);
    expect(typeahead.search).toBe(Typeahead.LocalCollection.search);

    // A queryset should have been created, but no models
    expect(typeahead.length).toEqual(0);
    expect(typeahead._queryset).toEqual(queryset);
  });

  it('should display sane defaults', function() {
    expect(typeahead._key).toBe('name');
    // TODO minimum entry length, length of menus, and other parameters
  })

  describe('Local Search', function() {
    // TODO use a spy? turn triggers off after test
    var resetFired = false;
    typeahead.on('reset', function() { resetFired = true; });
    
    it('should filter its models when a search is performed', function() {
      typeahead.search.call(typeahead, 'name', 'ne');
      expect(typeahead.length).toEqual(3);
    });

    it('should fire a "reset" signal', function() {
      expect(resetFired).toEqual(true);
    });

    it('does not overwrite the _queryset parameter', function() {
      expect(typeahead._queryset).toEqual(queryset);
    });
    // End local search suite
  });

  describe('Empty Local Search', function() {
    // TODO use a spy? turn triggers off after test
    var resetFired = false;
    typeahead.on('reset', function() { resetFired = true; });

    it('should empty the models', function() {
      typeahead.search.call(typeahead, 'name');
      expect(typeahead.length).toEqual(0);
    });

    it('should fire a "reset" signal', function() {
      expect(resetFired).toEqual(true);
    });

    it('does not overwrite the _queryset parameter', function() {
      expect(typeahead._queryset).toEqual(queryset);
    });
    // End empty local search suite
  });

  describe('Local Search Selection', function() {
    // TODO Use a spy or something
    var selectFired = false;
    var selectedModel;
    typeahead.on('select', function(model) {
      selectFired = true;
      selectedModel = model;
    });

    it('should fire the select trigger', function() {
      typeahead.search.call(typeahead, typeahead._key, 'mi');

      // Select the first item by marking the 'li' with the 'active' class
      typeahead.view.$menu.find('li').first().addClass('active');
      typeahead.view.select.call(typeahead.view);

      expect(selectFired).toEqual(true);
      expect(selectedModel).toBeDefined();
    });

  });

  describe('Options', function() {
    var typeahead = new Typeahead(queryset, {key: 'label'});

    it ('should allow changing the search key', function() {
      expect(typeahead._key).toBe('label');
    });
  });

  // End Backbone Typeahead suite
});