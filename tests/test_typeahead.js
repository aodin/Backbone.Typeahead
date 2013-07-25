// Fixtures and name shortcut
var Typeahead = Backbone.Typeahead;
var states = [
  {name: 'Alabama'},
  {name: 'Michigan'},
  {name: 'Minnesota'},
  {name: 'Nevada'},
  {name: 'Ohio'},
  {name: 'New York'},
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
      var t = new Typeahead(states, {key: 'label'});
      expect(t).toBeDefined();
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('label');

      // A collection should always exist
      expect(t.collection).toBeDefined();
      expect(t.collection.length).toEqual(states.length);
    });

    it('sets sane defaults when not given options', function() {
      var t = new Typeahead(states);
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('name');
      expect(t.options.max).toBe(6);

      // A collection should always exist
      expect(t.collection).toBeDefined();
      expect(t.collection.length).toEqual(states.length);
    });

  });

  describe('Search', function() {
    var t = new Typeahead(states);

    it('returns case-insensitive results by default', function() {
      // TODO Does order of results matter?
      expect(t.search('MI').length).toEqual(2);
      expect(t.search('mi').length).toEqual(2);
    });

  });

  // describe('Empty Search', function() {
  //   var resetSpy;

  //   beforeEach(function() {
  //     resetSpy = sinon.spy();
  //   });

  //   afterEach(function() {
  //   });

  // });

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

  });

  // End Extended Typeahead test suite
});
