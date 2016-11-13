---
title: Home
model: data_file
source: assets/graphics/example.html
---

# {{title}}

{{{raw source}}}

{{model.key1}}

{{capitalize examplejson.name}}

{{exampleyaml.name}}

hello --- world

<p>"test"</p>

{{#each collections}}
    <h2><a href="/{{@key}}">{{@key}}</a></h2>
{{/each}}
