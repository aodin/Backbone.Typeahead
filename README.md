Backbone.Typeahead
==================

A Bootstrap inspired Typeahead for Backbone.js 1.1.0

Looking for Backbone.js 1.0.0 support? Check out release `v0.1.0`.

Now using Bootstrap version 3 styles!
See `docs/bootstrap2.html` for an example using the old Bootstrap styles.

### Quickstart

To quickly create a typeahead, provide the the constructor with an array of objects to be searched. By default, the typeahead will search the key `name`.

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

The typeahead was built for easy extension. Check out the `docs` and `tests` for examples.

> aodin, 2013
