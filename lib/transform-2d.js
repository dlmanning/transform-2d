"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _glMatrix = require("gl-matrix");

var mat2d = _glMatrix.mat2d;
var vec2 = _glMatrix.vec2;
var newMat2d = mat2d.create;
var invert = mat2d.invert;
var multiply = mat2d.multiply;
var clone = mat2d.clone;
var newVec2 = vec2.create;
var transformMat2d = vec2.transformMat2d;

var identity = newMat2d();

var Transform2d = (function () {
  function Transform2d() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Transform2d);

    this.initialize(opts);
  }

  _createClass(Transform2d, {
    initialize: {
      value: function initialize(_ref) {
        var _ref$zoomLevel = _ref.zoomLevel;
        var zoomLevel = _ref$zoomLevel === undefined ? 1 : _ref$zoomLevel;
        var _ref$zoomScale = _ref.zoomScale;
        var zoomScale = _ref$zoomScale === undefined ? 0.1 : _ref$zoomScale;
        var _ref$minZoomLevel = _ref.minZoomLevel;
        var minZoomLevel = _ref$minZoomLevel === undefined ? 0.1 : _ref$minZoomLevel;
        var _ref$maxZoomLevel = _ref.maxZoomLevel;
        var maxZoomLevel = _ref$maxZoomLevel === undefined ? 10 : _ref$maxZoomLevel;

        this.CTM = newMat2d();
        this.zoomLevel = zoomLevel;
        this.zoomScale = zoomScale;
        this.minZoomLevel = minZoomLevel;
        this.maxZoomLevel = maxZoomLevel;
        this.panOrigin = undefined;
      }
    },
    getCTM: {
      value: function getCTM() {
        return clone(this.CTM);
      }
    },
    zoom: {
      value: function zoom(delta, center) {
        var z = Math.pow(1 + this.zoomScale, delta);

        // unscale and unshift mouse position vector from CTM
        var p = newMat2d();
        p[0] = 0;p[3] = 0;p[4] = center[0];p[5] = center[1];

        multiply(p, invert(newMat2d(), this.CTM), p);
        p[0] = 1;p[3] = 1;
        var k = multiply(newMat2d(), p, identity);

        if (z * this.zoomLevel < this.maxZoomLevel && z * this.zoomLevel > this.minZoomLevel) {
          k[0] *= z;k[3] *= z;
          this.zoomLevel *= z;
        }

        p[4] *= -1;p[5] *= -1;
        multiply(k, p, k);

        multiply(this.CTM, this.CTM, k);

        return this;
      }
    },
    panStart: {
      value: function panStart(vec) {
        var p = newMat2d();
        p[0] = 0;p[3] = 0;p[4] = vec[0];p[5] = vec[1];

        // set the pan origin relative to the untransformed image
        // coordinates by unapplying the current transform
        this.panOrigin = multiply(newMat2d(), p, invert(newMat2d(), this.CTM));

        return this;
      }
    },
    panEnd: {
      value: function panEnd() {
        this.panOrigin = undefined;

        return this;
      }
    },
    pan: {
      value: function pan(vec) {
        if (this.panOrigin) {
          var p = newMat2d();
          p[0] = 1;p[3] = 1;p[4] = vec[0];p[5] = vec[1];

          // unapply current transform to get coordinates
          // relative to svg image's actual size
          multiply(p, p, invert(newMat2d(), this.CTM));

          // calculate new position relative to the point
          // at which we started panning
          p[0] = 1;p[3] = 1;p[4] -= this.panOrigin[4];p[5] -= this.panOrigin[5];
          multiply(this.CTM, p, this.CTM);
        }

        return this;
      }
    },
    untransform: {
      value: function untransform(vec) {
        var x = newVec2(),
            y = newVec2();
        x[0] = vec[0];x[1] = vec[1];

        transformMat2d(y, x, invert(newMat2d(), this.CTM));

        return [y[0], y[1]];
      }
    }
  });

  return Transform2d;
})();

module.exports = Transform2d;