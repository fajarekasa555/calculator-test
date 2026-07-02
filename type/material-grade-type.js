class MaterialGrade {
  constructor(name, E, E90, G, G90) {
    this.name = name;
    this.E = E;
    this.E90 = E90;
    this.G = G;
    this.G90 = G90;
  }
}

const MATERIAL_GRADES = [
  new MaterialGrade('MGP10', 1100, 110, 687.5, 62.5),
  new MaterialGrade('MGP12', 1100, 110, 687.5, 62.5),
];

function getMaterialGrade(name) {
  const grade = MATERIAL_GRADES.find((g) => g.name === name);
  if (!grade) {
    throw new Error(`Unknown material grade: ${name}`);
  }
  return grade;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MaterialGrade, MATERIAL_GRADES, getMaterialGrade };
}