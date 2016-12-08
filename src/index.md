---
title: Home
model: data_file
source: ../graphics/example.html
---

# {{title}}

{{{raw source}}}

{{model.key1}}

{{capitalize globaljson.name}}

{{globalyaml.name}}

hello --- world

<p>"test"</p>

![alt text](/assets/images/placeholder.png "Title Text")

{{#each collections}}
  <h2><a href="/{{@key}}">{{@key}}</a></h2>
{{/each}}
