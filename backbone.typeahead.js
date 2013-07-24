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
      // TODO Should also error if no collection was provided
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
      options.key || (options.key = 'name');

      // TODO Build a collection if none was given
      // TODO Build a item view if none was provided
    },
    // Models were emptied by the preInitialization function
    // The parent Backbone.View constructor function has finished
    // Options have already been parsed by _context()
    postInitialize: function() {
      console.log('options:', this.options);
    },
  });

  Backbone.Typeahead = Typeahead;

}).call(this);
