class PanelPropertiesType {
  constructor() {
    this.layers = [];
    this.method = '';
    this.totalLayers = 0;
    this.totalThickness = 0;
    this.beff = 0;
    this.length = 0;
    this.neutralAxis = 0;
    this.EIeff = 0;
    this.GAeff = null;
  }

  static create({ method, totalLayers, totalThickness, beff, length, neutralAxis, layers, EIeff, GAeff = null }) {
    const result = new PanelPropertiesType();
    result.method = method;
    result.totalLayers = totalLayers;
    result.totalThickness = totalThickness;
    result.beff = beff;
    result.length = length;
    result.neutralAxis = neutralAxis;
    result.layers = layers;
    result.EIeff = EIeff;
    result.GAeff = GAeff;
    return result;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PanelPropertiesType };
}