# postcss-droproot

> Remove :root rules

## Installation

```sh
npm install postcss-droproot
postcss -u postcss-droproot -o dist/index.css src/index.css
```

## Usage

Let's say you have `:root {}` rules you want to remove from the compiled output. This plugin turns this:

```css
:root {
	--prefix-component-background-color: blue;
}

.foo {
	background-color: var(--prefix-component-background-color);
}
```

Into this:

```css
.foo {
	background-color: var(--prefix-component-background-color);
}
```
