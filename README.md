Backbone.Typeahead
==================

A Bootstrap inspired Typeahead for Backbone.js

Can be used to create typeaheads that pull from local or remote sources.

### Example Usage

For local usage, provide it with a queryset as the first parameter. Do **not** provide it with a URL or a remote collection will be created. The typeahead's template will be rendered at the `el` provided in the options.

    var typeahead = new Backbone.Typeahead(queryset, {el: '#main'});

For remote usage, provide the collection with a URL in the options:

    var typeahead = new Backbone.Typeahead([], {url: '/api/queryset', el: '#main'});

Since the Typeahead inherits from the `Backbone.Collection` object, the collection methods can be overwritten by using the `.extend()` method:

    var Inherited = Backbone.Typeahead.extend({
        parse: function(response, options) {
            return response.results || response;
        },
    });


### How It Differs

Changed behaviors include:
* Menu reappears on input focus if not item has been selected

Additions:
* The Typeahead will fire a 'select' event upon Model selection


### Work in Progress

This project is still a work in progress. A few plan improvements:
* Better way to access the typeahead's extended methods (the collection's view, the model, and the model's view are attached directly to the `Typeahead` object; a proxy for extending these underlying objects should exist)
* Better testing of the DOM rendering.
* Better documentation of API / available options