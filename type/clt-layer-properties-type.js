class CLTLayerPropertiesType {
  constructor() {
    this.index = 0;
    this.thickness = 0;
    this.orientation = 0;
    this.grade = '';
    this.E = 0;
    this.G = 0;
    this.yMid = 0;
    this.a = 0;
    this.ownInertia = 0;
    this.steinerArea = 0;
    this.gamma = 1;
    this.EI = 0;
  }

  static create({ index, thickness, orientation, grade, E, G, yMid, a, ownInertia, steinerArea, gamma, EI }) {
    const props = new CLTLayerPropertiesType();
    props.index = index;
    props.thickness = thickness;
    props.orientation = orientation;
    props.grade = grade;
    props.E = E;
    props.G = G;
    props.yMid = yMid;
    props.a = a;
    props.ownInertia = ownInertia;
    props.steinerArea = steinerArea;
    props.gamma = gamma;
    props.EI = EI;
    return props;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CLTLayerPropertiesType };
}