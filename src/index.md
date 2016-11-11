---
title: Home
model: data_file
---

# {{title}}

{{model.key1}}

{{capitalize examplejson.name}}

{{exampleyaml.name}}

hello --- world

<p>"test"</p>

{{#each collections}}
    <h2><a href="/{{@key}}">{{@key}}</a></h2>
{{/each}}
