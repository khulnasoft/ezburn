<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./images/wordmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./images/wordmark-light.svg">
    <img alt="ezburn: An extremely fast JavaScript bundler" src="./images/wordmark-light.svg">
  </picture>
  <br>
  <a href="https://ezburn.github.io/">Website</a> |
  <a href="https://ezburn.github.io/getting-started/">Getting started</a> |
  <a href="https://ezburn.github.io/api/">Documentation</a> |
  <a href="https://ezburn.github.io/plugins/">Plugins</a> |
  <a href="https://ezburn.github.io/faq/">FAQ</a>
</p>

## Why?

Our current build tools for the web are 10-100x slower than they could be:

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./images/benchmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./images/benchmark-light.svg">
    <img alt="Bar chart with benchmark results" src="./images/benchmark-light.svg">
  </picture>
</p>

The main goal of the ezburn bundler project is to bring about a new era of build tool performance, and create an easy-to-use modern bundler along the way.

Major features:

- Extreme speed without needing a cache
- [JavaScript](https://ezburn.github.io/content-types/#javascript), [CSS](https://ezburn.github.io/content-types/#css), [TypeScript](https://ezburn.github.io/content-types/#typescript), and [JSX](https://ezburn.github.io/content-types/#jsx) built-in
- A straightforward [API](https://ezburn.github.io/api/) for CLI, JS, and Go
- Bundles ESM and CommonJS modules
- Bundles CSS including [CSS modules](https://github.com/css-modules/css-modules)
- Tree shaking, [minification](https://ezburn.github.io/api/#minify), and [source maps](https://ezburn.github.io/api/#sourcemap)
- [Local server](https://ezburn.github.io/api/#serve), [watch mode](https://ezburn.github.io/api/#watch), and [plugins](https://ezburn.github.io/plugins/)

Check out the [getting started](https://ezburn.github.io/getting-started/) instructions if you want to give ezburn a try.
