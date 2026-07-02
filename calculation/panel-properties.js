/**
 * Class Panel Properties is used to calculate the properties of panel CLT Layup.
 * Panel properties can calculate
 *  - Shear Analogy Method
 *  - Gamma Method
 *
 * How to use :
 * calculate(CLTLayup) => PanelProperties
 */

// Base class for panel properties
class PanelProperties {
  calculate(cltLayup) {
    const { valid, errors } = cltLayup.validate();
    if (!valid) {
      throw new Error(errors.join(' '));
    }

    if (cltLayup.analyticalMethod === ANALYTICAL_METHOD.SHEAR_ANALOGY) {
      return new ShearAnalogyMethod().calculate(cltLayup);
    }
    return new GammaMethod().calculate(cltLayup);
  }

  _resolveStiffness(layer) {
    const grade = getMaterialGrade(layer.grade);
    return layer.isLongitudinal
      ? { E: grade.E, G: grade.G }
      : { E: grade.E90, G: grade.G90 };
  }

  _geometry(cltLayup) {
    let cumulative = 0;
    const yMids = cltLayup.getLayers().map((layer) => {
      const yMid = cumulative + layer.thickness / 2;
      cumulative += layer.thickness;
      return yMid;
    });
    const totalThickness = cumulative;
    const neutralAxis = totalThickness / 2;
    return { yMids, totalThickness, neutralAxis };
  }
}

class ShearAnalogyMethod extends PanelProperties {
  calculate(cltLayup) {
    const layers = cltLayup.getLayers();
    const { beff, length } = cltLayup;
    const { yMids, totalThickness, neutralAxis } = this._geometry(cltLayup);

    let EIeff = 0;
    const layerProperties = layers.map((layer, i) => {
      const { E, G } = this._resolveStiffness(layer);
      const a = Math.abs(yMids[i] - neutralAxis);
      const ownInertia = (beff * Math.pow(layer.thickness, 3)) / 12;
      const steinerArea = beff * layer.thickness * Math.pow(a, 2);
      const EI = (ownInertia + steinerArea) * E;
      EIeff += EI;

      return CLTLayerPropertiesType.create({
        index: layer.index,
        thickness: layer.thickness,
        orientation: layer.orientation,
        grade: layer.grade,
        E,
        G,
        yMid: yMids[i],
        a,
        ownInertia,
        steinerArea,
        gamma: 1,
        EI,
      });
    });

    let sumFlexibility = 0;
    let totalSpan = 0;
    for (let i = 0; i < layers.length - 1; i++) {
      const gap = yMids[i + 1] - yMids[i];
      const crossLayer = layers[i].isLongitudinal ? layers[i + 1] : layers[i];
      const { G: Gcross } = this._resolveStiffness(crossLayer);
      sumFlexibility += gap / (Gcross * beff);
      totalSpan += gap;
    }
    const GAeff = sumFlexibility > 0 ? Math.pow(totalSpan, 2) / sumFlexibility : null;

    return PanelPropertiesType.create({
      method: ANALYTICAL_METHOD.SHEAR_ANALOGY,
      totalLayers: layers.length,
      totalThickness,
      beff,
      length,
      neutralAxis,
      layers: layerProperties,
      EIeff,
      GAeff,
    });
  }
}

class GammaMethod extends PanelProperties {
  calculate(cltLayup) {
    const layers = cltLayup.getLayers();
    const { beff, length } = cltLayup;
    const { yMids, totalThickness, neutralAxis } = this._geometry(cltLayup);
    const lengthMm = length * 1000;
    const n = layers.length;

    const adjacentCrossLayer = (i) => {
      if (i < Math.floor(n / 2)) return layers[i + 1];
      if (i > Math.floor(n / 2)) return layers[i - 1];
      return null;
    };

    let EIeff = 0;
    const layerProperties = layers.map((layer, i) => {
      const { E, G } = this._resolveStiffness(layer);
      const a = Math.abs(yMids[i] - neutralAxis);
      const ownInertia = (beff * Math.pow(layer.thickness, 3)) / 12;
      const steinerArea = beff * layer.thickness * Math.pow(a, 2);

      let gamma = 1;
      if (layer.isLongitudinal && a > 0) {
        const crossLayer = adjacentCrossLayer(i);
        if (crossLayer) {
          const { G: Gcross } = this._resolveStiffness(crossLayer);
          const Across = beff * crossLayer.thickness;
          gamma =
            1 /
            (1 +
              (Math.pow(Math.PI, 2) * E * beff * layer.thickness * a) /
                (Gcross * Across * Math.pow(lengthMm, 2)));
        }
      }

      const EI = ownInertia * E + gamma * steinerArea * E;
      EIeff += EI;

      return CLTLayerPropertiesType.create({
        index: layer.index,
        thickness: layer.thickness,
        orientation: layer.orientation,
        grade: layer.grade,
        E,
        G,
        yMid: yMids[i],
        a,
        ownInertia,
        steinerArea,
        gamma,
        EI,
      });
    });

    return PanelPropertiesType.create({
      method: ANALYTICAL_METHOD.GAMMA,
      totalLayers: n,
      totalThickness,
      beff,
      length,
      neutralAxis,
      layers: layerProperties,
      EIeff,
      GAeff: null,
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PanelProperties, ShearAnalogyMethod, GammaMethod };
}