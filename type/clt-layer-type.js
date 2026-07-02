class CLTLayerType {
  constructor(index, thickness, orientation, grade) {
    this.index = index;
    this.thickness = thickness;
    this.orientation = orientation; // 0 = longitudinal, 90 = transverse
    this.grade = grade;
  }

  get isLongitudinal() {
    return this.orientation === 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CLTLayerType };
}