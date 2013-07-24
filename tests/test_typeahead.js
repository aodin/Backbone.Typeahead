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

describe('Typeahead', function() {

  describe('Initialization', function() {
    it('errors if no parameters are given', function() {
      expect(function() { new Typeahead(); }).toThrow();
    });

    it('accepts an array of models as its first parameter', function() {
      var t = new Typeahead(queryset);
      expect(t).toBeDefined();
    });

    it('accepts an options objects as its first parameter', function() {
      var t = new Typeahead({key: 'label'});
      expect(t).toBeDefined();
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('label');
    });

    it('accepts an array of models and an options object', function() {
      var t = new Typeahead(queryset, {key: 'label'});
      expect(t).toBeDefined();
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('label');
    });

    it('sets sane defaults when not given options', function() {
      var t = new Typeahead(queryset);
      expect(_.isObject(t.options)).toBe(true);
      expect(t.options.key).toBe('name');
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


  it('can be created by calling extend()', function() {
    // Create the constructor
    var Extended = Typeahead.extend({
      className: 'extended-class',
    });
    expect(Extended).toBeDefined();

    // Create an instance
    var t = new Extended(queryset);
    expect(t).toBeDefined();

  });

  // End Extended Typeahead test suite
});
