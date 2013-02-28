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

  // TODO attempt to overwrite some behaviors, such as parse, comparator

});

describe('Improperly Configured Typeahead', function() {

  it('can not be created', function() {
    expect(function() { new Typeahead(); }).toThrow();
  });

});

describe('Local Typeahead', function() {

  // TODO this is only the local version
  // TODO separate suite of test for default options?
  var typeahead = new Typeahead(queryset);

  beforeEach(function() {
    // typeahead.search.call(typeahead, typeahead._key, '');
  });

  afterEach(function() {

  });

  it('should initialize a local collection when no URL exists', function() {
    // Check that the local methods have been created
    expect(typeahead.matcher).toBe(Typeahead.LocalCollection.matcher);
    expect(typeahead.search).toBe(Typeahead.LocalCollection.search);

    // A queryset should have been created, but no models
    expect(typeahead.length).toEqual(0);
    expect(typeahead._queryset).toEqual(queryset);
  });

  it('should have sane defaults', function() {
    expect(typeahead._key).toBe('name');
    // TODO minimum entry length, length of menus, and other parameters
  })

  describe('Search', function() {
    // TODO turn off triggers after test
    var resetSpy;

    beforeEach(function() {
      resetSpy = sinon.spy();
      typeahead.on('reset', resetSpy);
      typeahead.search.call(typeahead, 'name', 'ne');
    });

    afterEach(function() {
      typeahead.off('reset', resetSpy)
    });
    
    it('should filter its models', function() {
      expect(typeahead.length).toEqual(3);
    });

    it('should fire a "reset" signal', function() {
      expect(resetSpy.calledOnce).toBeTruthy();
    });

    it('does not overwrite the _queryset parameter', function() {
      expect(typeahead._queryset).toEqual(queryset);
    });
    // End local search suite
  });

  describe('Empty Search', function() {
    var resetSpy;

    beforeEach(function() {
      resetSpy = sinon.spy();
      typeahead.on('reset', resetSpy);
      typeahead.search.call(typeahead, 'name');
    });

    afterEach(function() {
      typeahead.off('reset', resetSpy)
    });

    it('should empty the models', function() {
      expect(typeahead.length).toEqual(0);
    });

    it('should fire a "reset" signal', function() {
      expect(resetSpy.calledOnce).toBeTruthy();
    });

    it('does not overwrite the _queryset parameter', function() {
      expect(typeahead._queryset).toEqual(queryset);
    });
    // End empty local search suite
  });

  describe('Search Selection', function() {
    // TODO need before and after functions
    var selectSpy = sinon.spy();
    typeahead.on('select', selectSpy);

    it('should fire the select trigger', function() {
      typeahead.search.call(typeahead, typeahead._key, 'mi');

      // Select the first item by marking the 'li' with the 'active' class
      typeahead.view.$menu.find('li').first().addClass('active');
      typeahead.view.select.call(typeahead.view);

      expect(selectSpy.calledOnce).toBeTruthy();
      // Check the first argument of the first call (hence [0][0])
      // TODO check that the returned object is an instance of a model
      expect(selectSpy.args[0][0]).toBeDefined()

      // TODO test multiple calls
      // console.log('spy:', selectSpy.callCount)
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

describe('Remote Typeahead', function() {

  // TODO separate suite of test for default options?
  // TODO Should all initialization go in the beforeEach function?
  var typeahead = new Typeahead([], {url: '/queryset'});

  // Our fake sinon.js remote API
  var server;

  // TODO build this array dynamically from the initial queryset
  var ne_set = [
    {name: 'Minnesota'},
    {name: 'Nevada'},
    {name: 'New York'},
  ];
  
  it('should initialize a remote collection when an URL exists', function() {
    // Check that the local methods have been created
    expect(typeahead.search).toBe(Typeahead.RemoteCollection.search);

    // No models should have been added
    expect(typeahead.length).toEqual(0);
  });

  it('should have sane defaults', function() {
    expect(typeahead._key).toBe('name');
    // TODO minimum entry length, length of menus, and other parameters
  })

  describe('Search', function() {
    var resetSpy;

    beforeEach(function() {
      server = sinon.fakeServer.create();
      typeahead.search.call(typeahead, typeahead.key, '');

      resetSpy = sinon.spy();
      typeahead.on('reset', resetSpy);
    });

    afterEach(function() {
      server.restore();
      typeahead.off('reset', resetSpy)
    });

    it('should retrieve models from the server', function() {
      var response = [
        200,
        {'Content-Type': 'application/json'},
        '[{"name": "Minnesota"}, {"name": "Nevada"}, {"name": "New York"}]'
      ];
      server.respondWith("GET", "/queryset?name=ne", response);
      typeahead.search.call(typeahead, typeahead._key, 'ne');
      server.respond(); // Process all requests so far
      expect(typeahead.length).toEqual(3);

      expect(resetSpy.calledOnce).toBeTruthy();
    });

  });

  describe('Empty Search', function() {
    var resetSpy;
    
    beforeEach(function() {
      server = sinon.fakeServer.create();
      resetSpy = sinon.spy();
      typeahead.on('reset', resetSpy);
    });

    afterEach(function() {
      server.restore();
      typeahead.off('reset', resetSpy)
    });

    it('should not make a call to the server', function() {

      var response = [
        200,
        {'Content-Type': 'application/json'},
        '[{"name": "Minnesota"}, {"name": "Nevada"}, {"name": "New York"}]'
      ];
      server.respondWith("GET", "/queryset?name=ne", response);

      // Replay a working search
      typeahead.search.call(typeahead, typeahead._key, 'ne');
      server.respond(); // Process all requests so far
      expect(typeahead.length).toEqual(3);
      expect(server.requests.length).toEqual(1);
      expect(resetSpy.callCount).toEqual(1);

      // Send an empty search
      typeahead.search.call(typeahead, typeahead._key, '');
      server.respond();
      expect(server.requests.length).toEqual(1);
      expect(typeahead.length).toEqual(0);
      expect(resetSpy.callCount).toEqual(2);
    });


  });


  // End Backbone Typeahead suite
});