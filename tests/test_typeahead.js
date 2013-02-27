describe('Typeahead Collection', function() {

  beforeEach(function() {});

  var Typeahead = Backbone.Typeahead;

  var example = [
    {name: 'Alabama'},
    {name: 'Michigan'},
    {name: 'Minnesota'},
    {name: 'Nevada'},
    {name: 'Ohio'},
    {name: 'New York'},
  ];
  
  // TODO this is only the local version
  var typeahead = new Typeahead.Collection(example);

  it('should initialize a local collection when no URL exists', function() {
    // Check that the collection models and local methods have been created
    expect(typeahead.matcher).toBe(Typeahead.LocalCollection.matcher);
    expect(typeahead.search).toBe(Typeahead.LocalCollection.search);
    expect(_.map(typeahead.models, function(item) { return item.get('name'); })).toEqual(_.pluck(example, 'name'));
  });

  describe('Local Search', function() {
    var resetFired = false;
    typeahead.on('reset', function() { resetFired = true; });
    
    it('should filter its models when a search is performed', function() {
      typeahead.search.call(typeahead, 'name', 'ne');
      expect(typeahead.length).toEqual(3);
    });

    it('should fire a "reset" signal', function() {
      expect(resetFired).toEqual(true);
    });

    it('does not overwrite the _all parameter', function() {
      expect(typeahead._all).toEqual(example);
    });
    // End local search suite
  });

  describe('Empty Local Search', function() {
    var resetFired = false;
    typeahead.on('reset', function() { resetFired = true; });

    it('should reset the collection with its initial models', function() {
      typeahead.search.call(typeahead, 'name');
      expect(_.map(typeahead.models, function(item) { return item.get('name'); })).toEqual(_.pluck(example, 'name'));
    });

    it('should fire a "reset" signal', function() {
      expect(resetFired).toEqual(true);
    });

    it('does not overwrite the _all parameter', function() {
      expect(typeahead._all).toEqual(example);
    });
    // End empty local search suite
  });

  // End Backbone Typeahead suite
});

describe('Typeahead', function() {

});