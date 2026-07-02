const ANALYTICAL_METHOD = {
  SHEAR_ANALOGY: 'shear-analogy',
  GAMMA: 'gamma',
};

class CLTLayupType {
  constructor() {
    this.name = 'CLT Layup';
    /**
     * @type {CLTLayerType[]}
     */
    this.layers = [];
    this.beff = 1000;
    this.length = 5;
    this.analyticalMethod = ANALYTICAL_METHOD.SHEAR_ANALOGY;
  }

  // function
  setLayers(layers) {
    this.layers = layers;
    return this;
  }

  setBeff(beff) {
    this.beff = beff;
    return this;
  }

  setLength(length) {
    this.length = length;
    return this;
  }

  setAnalyticalMethod(method) {
    this.analyticalMethod = method;
    return this;
  }

  getLayers() {
    return this.layers;
  }

  get totalLayers() {
    return this.layers.length;
  }

  get totalThickness() {
    return this.layers.reduce((sum, l) => sum + l.thickness, 0);
  }

  get isSymmetric() {
    const n = this.layers.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const top = this.layers[i];
      const bottom = this.layers[n - 1 - i];
      if (
        top.thickness !== bottom.thickness ||
        top.orientation !== bottom.orientation ||
        top.grade !== bottom.grade
      ) {
        return false;
      }
    }
    return true;
  }

  validate() {
    const errors = [];
    const n = this.totalLayers;

    if (n < 3) {
      errors.push('A CLT layup requires at least 3 layers.');
    }

    if (this.analyticalMethod === ANALYTICAL_METHOD.SHEAR_ANALOGY) {
      if (n < 3 || n > 9) {
        errors.push('Shear Analogy method only supports 3 to 9 layers.');
      }
      if (!this.isSymmetric) {
        errors.push('Shear Analogy method requires a symmetric layup (top to bottom).');
      }
    }

    if (this.analyticalMethod === ANALYTICAL_METHOD.GAMMA) {
      if (n !== 3 && n !== 5) {
        errors.push('Gamma method only supports 3 or 5 layers.');
      }
      if (!this.isSymmetric) {
        errors.push('Gamma method requires a symmetric layup (top to bottom).');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CLTLayupType, ANALYTICAL_METHOD };
}