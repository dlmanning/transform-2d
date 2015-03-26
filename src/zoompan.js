const {
  mat2d: { 
    create: newMat2d,
    invert,
    multiply
  }
} = require('gl-matrix');

const identity = newMat2d();

export default class ZoomPan {
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

  zoom (delta, x, y) {
    const z = Math.pow(1 + this.zoomScale, delta);

    // unscale and unshift mouse position vector from CTM
    const p = newMat2d();
    p[0] = 0; p[3] = 0; p[4] = x; p[5] = y;

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

  panStart (x, y) {
    const p = newMat2d();
    p[0] = 0; p[3] = 0; p[4] = x; p[5] = y;

    // set the pan origin relative to the untransformed image
    // coordinates by unapplying the current transform
    this.panOrigin = multiply(newMat2d(), p, invert(newMat2d(), this.CTM));

    return this;
  }

  panEnd () {
    this.panOrigin = undefined;

    return this;
  }

  pan (dx, dy) {
    if (this.panOrigin) {
      const p = newMat2d();
      p[0] = 1; p[3] = 1; p[4] = dx; p[5] = dy;

      // unapply current transform to get coordinates
      // relative to svg image's actual size
      multiply(p, p, invert(newMat2d(), this.CTM));

      // calculate new position relative to the point
      // at which we started panning
      p[0] = 1; p[3] = 1; p[4] -= this.panOrigin[4]; p[5] -= this.panOrigin[5];
      multiply(this.CTM, p, this.CTM);
    }

    return this;
  }


}