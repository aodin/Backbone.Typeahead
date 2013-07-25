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

  Typeahead.extend = Backbone.View.extend;

  _.extend(Typeahead.prototype, Backbone.View.prototype, {
    // Pre-initialization should set up the collection type (remote / local)
    preInitialize: function(models, options) {
      // Set sane defaults
      // TODO Allow compound keys? Introspect first model for a default key?
      options.key || (options.key = 'name');
      options.max || (options.max = 6);

      if (_.isUndefined(options.collection) && _.isArray(models)) {
        // TODO Any properties that passing options can't handle?
        options.collection = new Backbone.Collection(models, options);
      }

      // TODO Build a item view if one was not provided
    },
    // Models were emptied by the preInitialization function
    // The parent Backbone.View constructor function has finished
    // Options have already been parsed by _context()
    postInitialize: function() {
      // Build the cached lookup of models by the given key
      // TODO this must be updated when the collection changes
      // TODO provide an option to turn this cache off
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
  });

  Backbone.Typeahead = Typeahead;

}).call(this);
