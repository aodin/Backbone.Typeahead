Backbone.Typeahead
==================

A Bootstrap inspired Typeahead for Backbone.js


### Install

The typeahead can be installed with [NPM](https://www.npmjs.com/package/backbone.typeahead.js):

    npm install backbone.typeahead.js

Or [yarn](https://yarnpkg.com/package/backbone.typeahead.js):

    yarn add backbone.typeahead.js

This project requires Backbone `1.1.0` or later with [Bootstrap 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/). If you need Backbone `1.0.0` support, check out the `v0.1.0` release of the typeahead. For styling examples using older Bootstrap version, see `docs/`.


### Quickstart

To quickly create a typeahead, provide the constructor with an array of objects to be searched. By default, the typeahead will search the key `name`.

```javascript
var queryset = [
  {name: 'Super Bass-O-Matic 1976'},
  {name: 'Jam Hawkers'},
  {name: 'HiberNol'},
  {name: 'Colon Blow'},
];

var typeahead = new Backbone.Typeahead(queryset);
$('#main').html(typeahead.render().el);
```

The typeahead also plays nice with `setElement`:

```javascript
typeahead.setElement('#main').render();
```

The typeahead will emit a `selected` event when the user selects an item. The selected model is accessible as the first parameter of the callback:

```javascript
typeahead.on('selected', function(model) {
  console.log('The user has selected:', model);
});
```


### Passing a Collection

The typeahead is built upon a `Backbone.View` and accepts a `Backbone.Collection` as the option `collection`:

```javascript
var queryset = [
  {name: 'Super Bass-O-Matic 1976'},
  {name: 'Jam Hawkers'},
  {name: 'HiberNol'},
  {name: 'Colon Blow'},
];
var products = new Backbone.Collection(queryset);

var typeahead = new Backbone.Typeahead({collection: products});
typeahead.setElement('#main').render();
```


### Options

Pass the option `key` to search by a different attribute:

```javascript
var queryset = [
  {label: 'Super Bass-O-Matic 1976', year: 1976},
  {label: 'Jam Hawkers', year: 1977},
  {label: 'HiberNol', year: 1988},
  {label: 'Colon Blow', year: 1983},
];

var typeahead = new Backbone.Typeahead(queryset, {key: 'label'});
$('#main').html(typeahead.render().el);
```

Pass the option `itemTemplate` to render the search results with a different template:

```javascript

var itemTemplate = '<a><strong><%- label %></strong> (<%- year %>)</a>';
var typeahead = new Backbone.Typeahead(queryset, {key: 'label', itemTemplate: itemTemplate});
$('#main').html(typeahead.render().el);
```


### Using a Different Template

To use a different template for the typeahead itself, I recommend extending the Typeahead object:

```javascript
var Extended = Backbone.Typeahead.extend({
  template: '<input type="text" class="form-control" placeholder="Find a State!"><ul class="dropdown-menu"></ul>',
});
```

If the new template has variables, the `render` method must also be extended:

```javascript
var Extended = Backbone.Typeahead.extend({
  template: _.template('<input type="text" class="form-control" placeholder="<%- placeholder %>" /><ul class="dropdown-menu"></ul>'),
  render: function() {
    this.$el.html(this.template({
      placeholder: 'Hello, I am a placeholder!'
    }));

    // Don't forget these!
    this.$menu = this.$('ul');
    this.$input = this.$('input');
    return this;
  }
});
```

### Extension

The typeahead was built for easy extension. Check out `docs` and `spec` for examples.


### Minification

A minified version and source map are provided. Minification is performed with [esbuild](https://esbuild.github.io) using the `npm run build` command.


aodin, 2013-2023
