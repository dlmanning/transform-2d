import { mat2d, vec2 } from 'gl-matrix';

const { create: newMat2d, invert, multiply, clone } = mat2d;
const { create: newVec2, transformMat2d } = vec2;
const identity = newMat2d();

export default class Transform2d {
  constructor (opts = {}) {
    this.initialize(opts);
  }

  initialize ({zoomLevel = 1, zoomScale = 0.1, minZoomLevel = 0.1, maxZoomLevel = 10}) {
    this.CTM = newMat2d();
    this.zoomLevel = zoomLevel;
    this.zoomScale = zoomScale;
    this.minZoomLevel = minZoomLevel;
    this.maxZoomLevel = maxZoomLevel;
    this.panOrigin = undefined;
  }

  getCTM () {
    return clone(this.CTM);
  }

  zoom (delta, center) {
    const z = Math.pow(1 + this.zoomScale, delta);

    // unscale and unshift mouse position vector from CTM
    const p = newMat2d();
    p[0] = 0; p[3] = 0; p[4] = center[0]; p[5] = center[1];

    multiply(p, invert(newMat2d(), this.CTM), p);
    p[0] = 1; p[3] = 1;
    const k = multiply(newMat2d(), p, identity);

    if (z * this.zoomLevel < this.maxZoomLevel && z * this.zoomLevel > this.minZoomLevel) {
      k[0] *= z; k[3] *= z;
      this.zoomLevel *= z;
    }

    p[4] *= -1; p[5] *= -1;
    multiply(k, p, k);

    multiply(this.CTM, this.CTM, k);

    return this;
  }

  panStart (vec) {
    const p = newMat2d();
    p[0] = 0; p[3] = 0; p[4] = vec[0]; p[5] = vec[1];

    // set the pan origin relative to the untransformed image
    // coordinates by unapplying the current transform
    this.panOrigin = multiply(newMat2d(), p, invert(newMat2d(), this.CTM));

    return this;
  }

  panEnd () {
    this.panOrigin = undefined;

    return this;
  }

  pan (vec) {
    if (this.panOrigin) {
      var p = newMat2d();
      p[0] = 1; p[3] = 1; p[4] = vec[0]; p[5] = vec[1];

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

  untransform (vec) {
    const x = newVec2(), y = newVec2();
    x[0] = vec[0]; x[1] = vec[1];

    transformMat2d(y, x, invert(newMat2d(), this.CTM));

    return [ y[0], y[1] ];
  }

}
