---
title: Home
description: Home Description
model: data_file
source: ../graphics/example.html
openGraph: 
  image: /assets/images/placeholder.png
styles:
  - /styles/main.css
  - //vjs.zencdn.net/5.9.2/video-js.min.css
scripts:
  - //ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
---

# {{title}}

{{{raw source}}}

<br>
<pre>
{{{cssData.[styles/main.css]}}}
</pre>
<br>

{{model.key1}}

{{capitalize globaljson.name}}

{{globalyaml.name}}

hello --- world

<p>"test"</p>

![alt text](/assets/images/placeholder.png "Title Text")

{{#each collections}}
  <h2><a href="/{{@key}}">{{@key}}</a></h2>
{{/each}}
