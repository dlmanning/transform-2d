# transform-2d

[![js-standard-style](/badge.png?raw=true)](https://github.com/Flet/semistandard)


A module to keep track of and perform common mutations on a matrix describing a 2d affine transform.

In other words, you can use to do things to images like:

- [x] zooming
- [x] panning
- [ ] rotations
- [ ] sheering

## Usage

```javascript
var Transform2D = require('transform-2d');

var t = new Transform2D();

// [10, 10] -> [5, 5]
t.panStart([10, 10]).pan([5, 5]).panEnd();

// Zoom in a little centered at [5, 5]
t.zoom(3, [5, 5]);
```

## API

### `transform = new Transform2D([options])`

```javascript
options = { // defaults
  zoomLevel: 1, // initial zoom level
  zoomScale: 0.1, // scaling factor per zoom step
  minZoomLevel: 0.1, // minimum zoom level
  maxZoomLevel: 10 // maximum zoom level
}
```

### `transform.zoom(steps : number, point : Array<number>)`

zoom `steps` steps around a `point`. Returns `this`.

### `transform.panStart(point : Array<number>)`

Initiate panning from a particular point, as if the image were pulled at that location. Returns `this`.

### `transform.pan(point : Array<number>)`

Pan to a particular point. Returns `this`.

### `transform.panEnd()`

Terminate panning.

### `transform.getCTM()`

Returns the current transformation matrix in the form `[a, c, b, d, x, y]` corresponding to the 2d augmented matrix `[[a, b, x], [c, d, y]]`.
