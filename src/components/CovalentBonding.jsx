import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

/*
  CovalentBonding.jsx

  Improved covalent-bonding model:
  - Valence electrons use permanent IDs and fixed shell positions.
  - An electron never jumps or changes slot before the user drags it.
  - The exact electron on the shell becomes the draggable electron.
  - Wrong drops return the electron to the same original shell slot.
  - Shared electrons settle inside the real overlap of both valence shells.
  - Shared pairs use the original purple and blue ChemVista colours.
  - Shared electrons remain visible after settling; they are not hidden by CSS animation.
  - Lone pairs stay on their original atoms throughout the experiment.
  - Only valence shells overlap; nuclei and inner shells remain separated.
  - Single, double and triple bonds are generated for every listed molecule.
  - Pointer Events support mouse, stylus and touchscreen input.
*/

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 620;
const DRAWING_TOP = 28;
const DRAWING_BOTTOM = 510;
const INSTRUCTION_TOP = 540;

const ELECTRON_COLORS = {
  // Original ChemVista electron colours.
  inner: 'var(--text-main)',
  innerStroke: 'white',
  central: 'var(--accent-purple)',
  centralStroke: 'white',
  terminal: 'var(--accent-blue)',
  terminalStroke: 'white'
};

const NON_METALS_1_20 = [
  {
    number: 1,
    symbol: 'H',
    name: 'Hidrogen',
    arrangement: [1],
    valence: 1,
    target: 2,
    status: 'reactive',
    groupLabel: 'Duplet'
  },
  {
    number: 2,
    symbol: 'He',
    name: 'Helium',
    arrangement: [2],
    valence: 2,
    target: 2,
    status: 'noble',
    groupLabel: 'Gas adi'
  },
  {
    number: 6,
    symbol: 'C',
    name: 'Karbon',
    arrangement: [2, 4],
    valence: 4,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 7,
    symbol: 'N',
    name: 'Nitrogen',
    arrangement: [2, 5],
    valence: 5,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 8,
    symbol: 'O',
    name: 'Oksigen',
    arrangement: [2, 6],
    valence: 6,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 9,
    symbol: 'F',
    name: 'Fluorin',
    arrangement: [2, 7],
    valence: 7,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 10,
    symbol: 'Ne',
    name: 'Neon',
    arrangement: [2, 8],
    valence: 8,
    target: 8,
    status: 'noble',
    groupLabel: 'Gas adi'
  },
  {
    number: 15,
    symbol: 'P',
    name: 'Fosforus',
    arrangement: [2, 8, 5],
    valence: 5,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 16,
    symbol: 'S',
    name: 'Sulfur',
    arrangement: [2, 8, 6],
    valence: 6,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 17,
    symbol: 'Cl',
    name: 'Klorin',
    arrangement: [2, 8, 7],
    valence: 7,
    target: 8,
    status: 'reactive',
    groupLabel: 'Oktet'
  },
  {
    number: 18,
    symbol: 'Ar',
    name: 'Argon',
    arrangement: [2, 8, 8],
    valence: 8,
    target: 8,
    status: 'noble',
    groupLabel: 'Gas adi'
  }
];

const COVALENT_MOLECULES = [
  {
    id: 'H2',
    formula: 'H₂',
    name: 'Molekul Hidrogen',
    central: 'H',
    terminals: [{ symbol: 'H', bondOrder: 1 }],
    correctBondType: 'single',
    shape: 'diatomic',
    rule: 'duplet'
  },
  {
    id: 'F2',
    formula: 'F₂',
    name: 'Molekul Fluorin',
    central: 'F',
    terminals: [{ symbol: 'F', bondOrder: 1 }],
    correctBondType: 'single',
    shape: 'diatomic',
    rule: 'oktet'
  },
  {
    id: 'Cl2',
    formula: 'Cl₂',
    name: 'Molekul Klorin',
    central: 'Cl',
    terminals: [{ symbol: 'Cl', bondOrder: 1 }],
    correctBondType: 'single',
    shape: 'diatomic',
    rule: 'oktet'
  },
  {
    id: 'O2',
    formula: 'O₂',
    name: 'Molekul Oksigen',
    central: 'O',
    terminals: [{ symbol: 'O', bondOrder: 2 }],
    correctBondType: 'double',
    shape: 'diatomic',
    rule: 'oktet'
  },
  {
    id: 'N2',
    formula: 'N₂',
    name: 'Molekul Nitrogen',
    central: 'N',
    terminals: [{ symbol: 'N', bondOrder: 3 }],
    correctBondType: 'triple',
    shape: 'diatomic',
    rule: 'oktet'
  },
  {
    id: 'HCl',
    formula: 'HCl',
    name: 'Hidrogen Klorida',
    central: 'Cl',
    terminals: [{ symbol: 'H', bondOrder: 1 }],
    correctBondType: 'single',
    shape: 'diatomic',
    rule: 'duplet + oktet'
  },
  {
    id: 'H2O',
    formula: 'H₂O',
    name: 'Air',
    central: 'O',
    terminals: [
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'bent',
    rule: 'duplet + oktet'
  },
  {
    id: 'NH3',
    formula: 'NH₃',
    name: 'Ammonia',
    central: 'N',
    terminals: [
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'trigonal',
    rule: 'duplet + oktet'
  },
  {
    id: 'CH4',
    formula: 'CH₄',
    name: 'Metana',
    central: 'C',
    terminals: [
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'tetra',
    rule: 'duplet + oktet'
  },
  {
    id: 'CO2',
    formula: 'CO₂',
    name: 'Karbon Dioksida',
    central: 'C',
    terminals: [
      { symbol: 'O', bondOrder: 2 },
      { symbol: 'O', bondOrder: 2 }
    ],
    correctBondType: 'double',
    shape: 'linear',
    rule: 'oktet'
  },
  {
    id: 'PH3',
    formula: 'PH₃',
    name: 'Fosfina',
    central: 'P',
    terminals: [
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'trigonal',
    rule: 'duplet + oktet'
  },
  {
    id: 'H2S',
    formula: 'H₂S',
    name: 'Hidrogen Sulfida',
    central: 'S',
    terminals: [
      { symbol: 'H', bondOrder: 1 },
      { symbol: 'H', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'bent',
    rule: 'duplet + oktet'
  },
  {
    id: 'PCl3',
    formula: 'PCl₃',
    name: 'Fosforus Triklorida',
    central: 'P',
    terminals: [
      { symbol: 'Cl', bondOrder: 1 },
      { symbol: 'Cl', bondOrder: 1 },
      { symbol: 'Cl', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'trigonal',
    rule: 'oktet'
  },
  {
    id: 'CCl4',
    formula: 'CCl₄',
    name: 'Karbon Tetraklorida',
    central: 'C',
    terminals: [
      { symbol: 'Cl', bondOrder: 1 },
      { symbol: 'Cl', bondOrder: 1 },
      { symbol: 'Cl', bondOrder: 1 },
      { symbol: 'Cl', bondOrder: 1 }
    ],
    correctBondType: 'single',
    shape: 'tetra',
    rule: 'oktet'
  }
];

const selectableElements = NON_METALS_1_20.filter(
  element => element.status !== 'noble'
);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function arrangementText(arrangement) {
  return arrangement.join('.');
}

function getElement(symbol) {
  return NON_METALS_1_20.find(element => element.symbol === symbol);
}

function findMolecule(symbol1, symbol2) {
  const selectedSymbols = Array.from(new Set([symbol1, symbol2]))
    .sort()
    .join(',');

  return COVALENT_MOLECULES.find(molecule => {
    const moleculeSymbols = Array.from(
      new Set([
        molecule.central,
        ...molecule.terminals.map(terminal => terminal.symbol)
      ])
    )
      .sort()
      .join(',');

    return moleculeSymbols === selectedSymbols;
  });
}

function normalizeVector(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

function getSceneScale(molecule) {
  const symbols = [
    molecule.central,
    ...molecule.terminals.map(terminal => terminal.symbol)
  ];

  const largestShellCount = Math.max(
    ...symbols.map(symbol => getElement(symbol)?.arrangement.length || 1)
  );

  const terminalCount = molecule.terminals.length;

  if (terminalCount === 1) {
    if (largestShellCount === 1) return 1.45;
    if (largestShellCount === 2) return 1.18;
    return 1.0;
  }

  if (terminalCount === 2) {
    return largestShellCount >= 3 ? 0.98 : 1.14;
  }

  if (terminalCount === 3) {
    return largestShellCount >= 3 ? 0.82 : 1.18;
  }

  return largestShellCount >= 3 ? 0.82 : 1.18;
}

function getAtomMetrics(element, scale) {
  const shellCount = element?.arrangement.length || 1;
  const baseShellRadii = [52, 88, 124, 160];

  const shellRadii = baseShellRadii
    .slice(0, shellCount)
    .map(radius => radius * scale);

  const outerRadius = shellRadii[shellRadii.length - 1];

  return {
    shellRadii,
    outerRadius,
    visualRadius: outerRadius + Math.max(10, 14 * scale),
    nucleusRadius: Math.max(17, 22 * scale),
    electronRadius: Math.max(4.2, 5.2 * scale)
  };
}

function getDirectionVectors(molecule) {
  const count = molecule.terminals.length;

  if (count === 1) {
    return [{ x: 1, y: 0 }];
  }

  if (count === 2 && molecule.shape === 'linear') {
    return [
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];
  }

  if (count === 2) {
    return [
      { x: -0.82, y: 0.58 },
      { x: 0.82, y: 0.58 }
    ];
  }

  if (count === 3) {
    return [
      { x: 0, y: -1 },
      { x: -0.87, y: 0.5 },
      { x: 0.87, y: 0.5 }
    ];
  }

  return [
    { x: -0.72, y: -0.69 },
    { x: 0.72, y: -0.69 },
    { x: -0.72, y: 0.69 },
    { x: 0.72, y: 0.69 }
  ];
}

function getCoreRadius(metrics) {
  if (metrics.shellRadii.length > 1) {
    return metrics.shellRadii[metrics.shellRadii.length - 2];
  }

  return metrics.nucleusRadius * 1.1;
}

function getSafeBondDistance(centralMetrics, terminalMetrics, scale) {
  const smallerOuterRadius = Math.min(
    centralMetrics.outerRadius,
    terminalMetrics.outerRadius
  );

  /*
    Use a clearly visible valence-shell overlap, similar to a textbook
    dot-and-cross diagram. The core-distance check still prevents nuclei
    and inner shells from colliding.
  */
  const desiredOverlap = clamp(
    smallerOuterRadius * 0.38,
    Math.max(16, 18 * scale),
    Math.max(30, 42 * scale)
  );

  const valenceOverlapDistance =
    centralMetrics.outerRadius +
    terminalMetrics.outerRadius -
    desiredOverlap;

  const minimumCoreDistance =
    getCoreRadius(centralMetrics) +
    getCoreRadius(terminalMetrics) +
    Math.max(14, 18 * scale);

  return Math.max(valenceOverlapDistance, minimumCoreDistance);
}

function getRawCenter(molecule) {
  if (molecule.terminals.length === 1) {
    return { x: SVG_WIDTH / 2, y: 260 };
  }

  if (molecule.terminals.length === 2 && molecule.shape === 'bent') {
    return { x: SVG_WIDTH / 2, y: 210 };
  }

  if (molecule.terminals.length === 3) {
    return { x: SVG_WIDTH / 2, y: 290 };
  }

  return { x: SVG_WIDTH / 2, y: 260 };
}

function shiftLayoutIntoBounds(central, terminals) {
  const allAtoms = [
    {
      position: central.position,
      radius: central.metrics.visualRadius + 18
    },
    ...terminals.map(terminal => ({
      position: terminal.target,
      radius: terminal.metrics.visualRadius + 18
    }))
  ];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  allAtoms.forEach(atom => {
    minX = Math.min(minX, atom.position.x - atom.radius);
    maxX = Math.max(maxX, atom.position.x + atom.radius);
    minY = Math.min(minY, atom.position.y - atom.radius);
    maxY = Math.max(maxY, atom.position.y + atom.radius);
  });

  const leftLimit = 26;
  const rightLimit = SVG_WIDTH - 26;
  const topLimit = DRAWING_TOP + 8;
  const bottomLimit = DRAWING_BOTTOM - 8;

  let shiftX = 0;
  let shiftY = 0;

  if (minX < leftLimit) shiftX += leftLimit - minX;
  if (maxX + shiftX > rightLimit) shiftX -= maxX + shiftX - rightLimit;
  if (minY < topLimit) shiftY += topLimit - minY;
  if (maxY + shiftY > bottomLimit) shiftY -= maxY + shiftY - bottomLimit;

  return {
    central: {
      ...central,
      position: {
        x: central.position.x + shiftX,
        y: central.position.y + shiftY
      }
    },
    terminals: terminals.map(terminal => ({
      ...terminal,
      target: {
        x: terminal.target.x + shiftX,
        y: terminal.target.y + shiftY
      }
    }))
  };
}

function getMoleculeLayout(molecule) {
  const scale = getSceneScale(molecule);
  const centralElement = getElement(molecule.central);
  const centralMetrics = getAtomMetrics(centralElement, scale);
  const directions = getDirectionVectors(molecule).map(normalizeVector);
  const rawCenter = getRawCenter(molecule);

  if (molecule.terminals.length === 1) {
    const terminalElement = getElement(molecule.terminals[0].symbol);
    const terminalMetrics = getAtomMetrics(terminalElement, scale);
    const bondDistance = getSafeBondDistance(
      centralMetrics,
      terminalMetrics,
      scale
    );

    const central = {
      position: {
        x: SVG_WIDTH / 2 - bondDistance / 2,
        y: rawCenter.y
      },
      metrics: centralMetrics,
      element: centralElement
    };

    const terminals = [
      {
        index: 0,
        direction: { x: 1, y: 0 },
        target: {
          x: SVG_WIDTH / 2 + bondDistance / 2,
          y: rawCenter.y
        },
        metrics: terminalMetrics,
        element: terminalElement,
        bondOrder: molecule.terminals[0].bondOrder
      }
    ];

    const bounded = shiftLayoutIntoBounds(central, terminals);
    const terminal = bounded.terminals[0];
    const startDistance = Math.max(70, terminal.metrics.outerRadius * 0.72);

    terminal.start = {
      x: clamp(
        terminal.target.x + startDistance,
        terminal.metrics.visualRadius + 26,
        SVG_WIDTH - terminal.metrics.visualRadius - 26
      ),
      y: terminal.target.y
    };

    return {
      scale,
      central: bounded.central,
      terminals: [terminal]
    };
  }

  const central = {
    position: rawCenter,
    metrics: centralMetrics,
    element: centralElement
  };

  const terminals = molecule.terminals.map((terminal, index) => {
    const terminalElement = getElement(terminal.symbol);
    const terminalMetrics = getAtomMetrics(terminalElement, scale);
    const direction = directions[index];
    const bondDistance = getSafeBondDistance(
      centralMetrics,
      terminalMetrics,
      scale
    );

    return {
      index,
      direction,
      target: {
        x: rawCenter.x + direction.x * bondDistance,
        y: rawCenter.y + direction.y * bondDistance
      },
      metrics: terminalMetrics,
      element: terminalElement,
      bondOrder: terminal.bondOrder
    };
  });

  const bounded = shiftLayoutIntoBounds(central, terminals);

  const withStarts = bounded.terminals.map(terminal => {
    const startDistance = Math.max(
      68,
      terminal.metrics.outerRadius * 0.55 + 30
    );

    const rawStart = {
      x: terminal.target.x + terminal.direction.x * startDistance,
      y: terminal.target.y + terminal.direction.y * startDistance
    };

    return {
      ...terminal,
      start: {
        x: clamp(
          rawStart.x,
          terminal.metrics.visualRadius + 26,
          SVG_WIDTH - terminal.metrics.visualRadius - 26
        ),
        y: clamp(
          rawStart.y,
          DRAWING_TOP + terminal.metrics.visualRadius + 16,
          DRAWING_BOTTOM - terminal.metrics.visualRadius - 16
        )
      }
    };
  });

  return {
    scale,
    central: bounded.central,
    terminals: withStarts
  };
}

function buildContributionState(molecule, contributionPlan, completedCount) {
  const state = molecule.terminals.map(terminal =>
    Array.from({ length: terminal.bondOrder }, () => ({
      central: false,
      terminal: false
    }))
  );

  contributionPlan.slice(0, completedCount).forEach(contribution => {
    const pair =
      state[contribution.terminalIndex]?.[contribution.pairIndex];

    if (pair) {
      pair[contribution.source] = true;
    }
  });

  return state;
}

function getBondGeometry(
  start,
  end,
  centralOuterRadius,
  terminalOuterRadius,
  requiredOrder,
  pairIndex,
  scale = 1
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / length, y: dy / length };
  const perpendicular = { x: -unit.y, y: unit.x };

  /*
    The radical-axis position gives the centre of the actual overlap lens,
    so unequal atoms such as H-Cl do not place their shared pair at a plain
    centre-to-centre midpoint.
  */
  const rawAxisDistance =
    (centralOuterRadius ** 2 -
      terminalOuterRadius ** 2 +
      length ** 2) /
    (2 * length);

  const overlapDepth = Math.max(
    8,
    centralOuterRadius + terminalOuterRadius - length
  );

  const axisDistance = clamp(
    rawAxisDistance,
    centralOuterRadius - overlapDepth,
    centralOuterRadius
  );

  const overlapCenter = {
    x: start.x + unit.x * axisDistance,
    y: start.y + unit.y * axisDistance
  };

  const pairSpacing = Math.max(16, 20 * scale);
  const offset =
    (pairIndex - (requiredOrder - 1) / 2) * pairSpacing;

  const pairCenter = {
    x: overlapCenter.x + perpendicular.x * offset,
    y: overlapCenter.y + perpendicular.y * offset
  };

  const electronSeparation = Math.max(5.2, 6.6 * scale);

  return {
    unit,
    perpendicular,
    offset,
    overlapDepth,
    overlapCenter,
    pairCenter,
    centralTarget: {
      x: pairCenter.x - perpendicular.x * electronSeparation,
      y: pairCenter.y - perpendicular.y * electronSeparation
    },
    terminalTarget: {
      x: pairCenter.x + perpendicular.x * electronSeparation,
      y: pairCenter.y + perpendicular.y * electronSeparation
    },
    sharedZone: {
      center: overlapCenter,
      rx: Math.max(15, overlapDepth * 0.72),
      ry: Math.max(
        23,
        18 + ((requiredOrder - 1) * pairSpacing) / 2
      ),
      angle:
        (Math.atan2(unit.y, unit.x) * 180) / Math.PI
    }
  };
}

function getLocalShellPoint(radius, direction, tangentOffset = 0) {
  const unit = normalizeVector(direction);
  const perpendicular = { x: -unit.y, y: unit.x };
  const safeOffset = clamp(
    tangentOffset,
    -radius * 0.55,
    radius * 0.55
  );
  const radialDistance = Math.sqrt(
    Math.max(0, radius ** 2 - safeOffset ** 2)
  );

  return {
    x: unit.x * radialDistance + perpendicular.x * safeOffset,
    y: unit.y * radialDistance + perpendicular.y * safeOffset
  };
}

function angleDifference(angleA, angleB) {
  let difference = Math.abs(angleA - angleB) % (Math.PI * 2);
  if (difference > Math.PI) difference = Math.PI * 2 - difference;
  return difference;
}

function pickLoneGroupAngles(groupCount, occupiedAngles) {
  if (groupCount <= 0) return [];

  const candidates = Array.from({ length: 16 }, (_, index) =>
    -Math.PI / 2 + (index * Math.PI * 2) / 16
  );

  const selected = [];

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    let bestAngle = candidates[0];
    let bestScore = -Infinity;

    candidates.forEach(candidate => {
      const distances = [
        ...occupiedAngles.map(angle => angleDifference(candidate, angle)),
        ...selected.map(angle => angleDifference(candidate, angle) * 0.9)
      ];

      const nearest =
        distances.length > 0 ? Math.min(...distances) : Math.PI;

      /* Prefer the upper and side regions very slightly for readability. */
      const readabilityBonus =
        Math.abs(Math.sin(candidate)) * 0.035;
      const score = nearest + readabilityBonus;

      if (score > bestScore) {
        bestScore = score;
        bestAngle = candidate;
      }
    });

    selected.push(bestAngle);
  }

  return selected;
}

function buildAtomElectronLayout(element, metrics, bondSlots) {
  const bondElectrons = bondSlots.map(slot => ({
    id: slot.id,
    kind: 'bond-source',
    terminalIndex: slot.terminalIndex,
    pairIndex: slot.pairIndex,
    position: getLocalShellPoint(
      metrics.outerRadius,
      slot.direction,
      slot.tangentOffset
    )
  }));

  const remainingElectronCount = Math.max(
    0,
    element.valence - bondElectrons.length
  );

  const pairCount = Math.floor(remainingElectronCount / 2);
  const singleCount = remainingElectronCount % 2;
  const occupiedAngles = bondSlots.map(slot =>
    Math.atan2(slot.direction.y, slot.direction.x)
  );
  const loneGroupAngles = pickLoneGroupAngles(
    pairCount + singleCount,
    occupiedAngles
  );

  const loneElectrons = [];
  const pairTangentOffset = Math.max(
    metrics.electronRadius * 1.45,
    6.2
  );

  for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
    const angle = loneGroupAngles[pairIndex];
    const direction = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };

    [-pairTangentOffset, pairTangentOffset].forEach(
      (tangentOffset, electronIndex) => {
        loneElectrons.push({
          id: `lone-pair-${pairIndex}-${electronIndex}`,
          kind: 'lone-pair',
          position: getLocalShellPoint(
            metrics.outerRadius,
            direction,
            tangentOffset
          )
        });
      }
    );
  }

  if (singleCount > 0) {
    const angle = loneGroupAngles[loneGroupAngles.length - 1];
    loneElectrons.push({
      id: 'lone-single-0',
      kind: 'lone-single',
      position: getLocalShellPoint(
        metrics.outerRadius,
        { x: Math.cos(angle), y: Math.sin(angle) },
        0
      )
    });
  }

  return [...bondElectrons, ...loneElectrons];
}

function buildElectronSystem(molecule, layout) {
  const contributionPlan = [];
  const pairGeometries = molecule.terminals.map(terminal =>
    Array.from({ length: terminal.bondOrder })
  );
  const centralBondSlots = [];
  const terminalBondSlots = molecule.terminals.map(() => []);

  molecule.terminals.forEach((terminal, terminalIndex) => {
    const terminalLayout = layout.terminals[terminalIndex];

    for (let pairIndex = 0; pairIndex < terminal.bondOrder; pairIndex += 1) {
      const geometry = getBondGeometry(
        layout.central.position,
        terminalLayout.target,
        layout.central.metrics.outerRadius,
        terminalLayout.metrics.outerRadius,
        terminal.bondOrder,
        pairIndex,
        layout.scale
      );

      pairGeometries[terminalIndex][pairIndex] = geometry;

      const centralElectronId =
        `central-t${terminalIndex}-p${pairIndex}`;
      const terminalElectronId =
        `terminal-t${terminalIndex}-p${pairIndex}`;

      centralBondSlots.push({
        id: centralElectronId,
        terminalIndex,
        pairIndex,
        direction: terminalLayout.direction,
        tangentOffset: geometry.offset
      });

      terminalBondSlots[terminalIndex].push({
        id: terminalElectronId,
        terminalIndex,
        pairIndex,
        direction: {
          x: -terminalLayout.direction.x,
          y: -terminalLayout.direction.y
        },
        /* Reversing the direction also reverses its local perpendicular. */
        tangentOffset: -geometry.offset
      });

      contributionPlan.push({
        terminalIndex,
        pairIndex,
        source: 'central',
        electronId: centralElectronId
      });
      contributionPlan.push({
        terminalIndex,
        pairIndex,
        source: 'terminal',
        electronId: terminalElectronId
      });
    }
  });

  const centralElectrons = buildAtomElectronLayout(
    layout.central.element,
    layout.central.metrics,
    centralBondSlots
  );

  const terminalElectrons = layout.terminals.map(
    (terminalLayout, terminalIndex) =>
      buildAtomElectronLayout(
        terminalLayout.element,
        terminalLayout.metrics,
        terminalBondSlots[terminalIndex]
      )
  );

  return {
    contributionPlan,
    pairGeometries,
    centralElectrons,
    terminalElectrons
  };
}

function getShellElectronPositions(count, radius) {
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });
}

function getPointerPosition(event, svgElement) {
  if (!svgElement) return { x: 0, y: 0 };

  const point = svgElement.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const matrix = svgElement.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };

  const transformed = point.matrixTransform(matrix.inverse());

  return {
    x: transformed.x,
    y: transformed.y
  };
}

function getBondTypeLabel(type) {
  if (type === 'double') return 'ikatan kovalen ganda dua';
  if (type === 'triple') return 'ikatan kovalen ganda tiga';
  return 'ikatan kovalen tunggal';
}

function safeSound(soundName) {
  if (sounds && typeof sounds[soundName] === 'function') {
    sounds[soundName]();
  }
}

function AtomModel({
  element,
  position,
  metrics,
  accentColor,
  electronColor,
  electronStrokeColor,
  electronLayout,
  hiddenElectronIds,
  activeElectronId,
  stable
}) {
  const outerShellIndex = element.arrangement.length - 1;

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {element.arrangement.map((electronCount, shellIndex) => {
        const radius = metrics.shellRadii[shellIndex];
        const isOuterShell = shellIndex === outerShellIndex;
        const innerPositions = isOuterShell
          ? []
          : getShellElectronPositions(electronCount, radius);

        return (
          <g key={`${element.symbol}-shell-${shellIndex}`}>
            <circle
              cx="0"
              cy="0"
              r={radius}
              fill={
                isOuterShell && stable
                  ? 'rgba(16,185,129,0.025)'
                  : 'none'
              }
              stroke={
                isOuterShell && stable
                  ? 'rgba(52,211,153,0.86)'
                  : 'var(--border-color)'
              }
              strokeWidth={isOuterShell && stable ? 1.9 : 1.5}
              opacity={isOuterShell ? 0.94 : 0.68}
            />

            {innerPositions.map((electronPosition, electronIndex) => (
              <g
                key={`${element.symbol}-inner-${shellIndex}-${electronIndex}`}
                transform={`translate(${electronPosition.x}, ${electronPosition.y})`}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={metrics.electronRadius + 2.6}
                  fill={ELECTRON_COLORS.inner}
                  opacity="0.11"
                />
                <circle
                  cx="0"
                  cy="0"
                  r={metrics.electronRadius}
                  fill={ELECTRON_COLORS.inner}
                  stroke={ELECTRON_COLORS.innerStroke}
                  strokeWidth="0.8"
                />
              </g>
            ))}
          </g>
        );
      })}

      {(electronLayout || []).map(electron => {
        if (hiddenElectronIds?.has(electron.id)) return null;

        const isActive = electron.id === activeElectronId;

        return (
          <g
            key={`${element.symbol}-${electron.id}`}
            transform={`translate(${electron.position.x}, ${electron.position.y})`}
            pointerEvents="none"
          >
            {isActive && (
              <circle
                cx="0"
                cy="0"
                r={metrics.electronRadius + 9}
                fill={electronColor}
                opacity="0.16"
                className="animate-pulse-ring"
              />
            )}

            <circle
              cx="0"
              cy="0"
              r={metrics.electronRadius + 2.7}
              fill={electronColor}
              opacity={isActive ? 0.2 : 0.13}
            />
            <circle
              cx="0"
              cy="0"
              r={metrics.electronRadius}
              fill={electronColor}
              stroke={electronStrokeColor}
              strokeWidth="0.85"
            />
          </g>
        );
      })}

      <circle
        cx="0"
        cy="0"
        r={metrics.nucleusRadius}
        fill="rgba(7,12,26,0.98)"
        stroke={accentColor}
        strokeWidth="2.8"
      />

      <text
        x="0"
        y={metrics.nucleusRadius * 0.35}
        textAnchor="middle"
        fill="white"
        style={{
          fontWeight: 900,
          fontSize: `${Math.max(17, metrics.nucleusRadius * 1.05)}px`,
          pointerEvents: 'none'
        }}
      >
        {element.symbol}
      </text>
    </g>
  );
}

function AtomLabel({
  position,
  metrics,
  direction,
  text,
  accentColor
}) {
  const outward = normalizeVector(direction);
  const distance = metrics.outerRadius + 25;
  const labelPosition = {
    x: position.x + outward.x * distance,
    y: position.y + outward.y * distance
  };

  let textAnchor = 'middle';
  if (outward.x > 0.35) textAnchor = 'start';
  if (outward.x < -0.35) textAnchor = 'end';

  return (
    <text
      x={labelPosition.x}
      y={labelPosition.y + 4}
      textAnchor={textAnchor}
      fill={accentColor}
      style={{
        fontSize: '12px',
        fontWeight: 800,
        pointerEvents: 'none'
      }}
    >
      {text}
    </text>
  );
}

function StableBadge({ position, metrics, direction }) {
  const outward = normalizeVector(direction);
  const distance = metrics.outerRadius + 17;
  const badgePosition = {
    x: position.x + outward.x * distance,
    y: position.y + outward.y * distance
  };

  return (
    <g
      transform={`translate(${badgePosition.x}, ${badgePosition.y})`}
      pointerEvents="none"
    >
      <circle
        cx="0"
        cy="0"
        r="11"
        fill="rgba(16,185,129,0.18)"
        stroke="var(--color-stable)"
        strokeWidth="1.4"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fill="var(--color-stable)"
        style={{ fontWeight: 900, fontSize: '12px' }}
      >
        ✓
      </text>
    </g>
  );
}

export default function CovalentBonding({ onActionCompleted }) {
  const [activeStep, setActiveStep] = useState(0);
  const [element1Id, setElement1Id] = useState('H');
  const [element2Id, setElement2Id] = useState('O');

  const [snappedAtoms, setSnappedAtoms] = useState([]);
  const [completedContributions, setCompletedContributions] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [draggedAtomIndex, setDraggedAtomIndex] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  const [electronPhase, setElectronPhase] = useState('idle');
  const [draggedElectronPosition, setDraggedElectronPosition] = useState({
    x: 0,
    y: 0
  });
  const [electronTrail, setElectronTrail] = useState([]);
  const [electronGrabOffset, setElectronGrabOffset] = useState({
    x: 0,
    y: 0
  });

  const svgRef = useRef(null);
  const pointerIdRef = useRef(null);
  const timersRef = useRef([]);
  const completionReportedRef = useRef(false);

  const molecule = useMemo(
    () => findMolecule(element1Id, element2Id),
    [element1Id, element2Id]
  );

  const element1 = useMemo(() => getElement(element1Id), [element1Id]);
  const element2 = useMemo(() => getElement(element2Id), [element2Id]);

  const layout = useMemo(
    () => (molecule ? getMoleculeLayout(molecule) : null),
    [molecule]
  );

  const electronSystem = useMemo(
    () =>
      molecule && layout
        ? buildElectronSystem(molecule, layout)
        : null,
    [molecule, layout]
  );

  const contributionPlan = useMemo(
    () => electronSystem?.contributionPlan || [],
    [electronSystem]
  );

  const contributionState = useMemo(
    () =>
      molecule
        ? buildContributionState(
            molecule,
            contributionPlan,
            completedContributions
          )
        : [],
    [molecule, contributionPlan, completedContributions]
  );

  const activeContribution =
    contributionPlan[completedContributions] || null;

  const completedPairCount = useMemo(
    () =>
      contributionState.reduce(
        (total, terminalPairs) =>
          total +
          terminalPairs.filter(pair => pair.central && pair.terminal).length,
        0
      ),
    [contributionState]
  );

  const totalPairCount = contributionPlan.length / 2;

  const terminalCompletedPairCounts = useMemo(
    () =>
      contributionState.map(
        terminalPairs =>
          terminalPairs.filter(pair => pair.central && pair.terminal).length
      ),
    [contributionState]
  );

  const activeTerminalLayout = activeContribution
    ? layout?.terminals[activeContribution.terminalIndex]
    : null;

  const activeBondGeometry = useMemo(() => {
    if (!electronSystem || !activeContribution) return null;

    return (
      electronSystem.pairGeometries[
        activeContribution.terminalIndex
      ]?.[activeContribution.pairIndex] || null
    );
  }, [electronSystem, activeContribution]);

  const activeElectronDescriptor = useMemo(() => {
    if (!electronSystem || !activeContribution) return null;

    const electronList =
      activeContribution.source === 'central'
        ? electronSystem.centralElectrons
        : electronSystem.terminalElectrons[
            activeContribution.terminalIndex
          ] || [];

    return (
      electronList.find(
        electron => electron.id === activeContribution.electronId
      ) || null
    );
  }, [electronSystem, activeContribution]);

  const activeElectronSource = useMemo(() => {
    if (
      !layout ||
      !activeContribution ||
      !activeElectronDescriptor ||
      !activeTerminalLayout
    ) {
      return { x: 0, y: 0 };
    }

    const atomPosition =
      activeContribution.source === 'central'
        ? layout.central.position
        : activeTerminalLayout.target;

    return {
      x: atomPosition.x + activeElectronDescriptor.position.x,
      y: atomPosition.y + activeElectronDescriptor.position.y
    };
  }, [
    layout,
    activeContribution,
    activeElectronDescriptor,
    activeTerminalLayout
  ]);

  const activeElectronTarget = useMemo(() => {
    if (!activeContribution || !activeBondGeometry) {
      return { x: 0, y: 0 };
    }

    return activeContribution.source === 'central'
      ? activeBondGeometry.centralTarget
      : activeBondGeometry.terminalTarget;
  }, [activeContribution, activeBondGeometry]);

  const hiddenCentralElectronIds = useMemo(() => {
    const hidden = new Set(
      contributionPlan
        .slice(0, completedContributions)
        .filter(contribution => contribution.source === 'central')
        .map(contribution => contribution.electronId)
    );

    if (
      activeContribution?.source === 'central' &&
      electronPhase !== 'idle'
    ) {
      hidden.add(activeContribution.electronId);
    }

    return hidden;
  }, [
    contributionPlan,
    completedContributions,
    activeContribution,
    electronPhase
  ]);

  const hiddenTerminalElectronIds = useMemo(() => {
    const hidden = molecule
      ? molecule.terminals.map(() => new Set())
      : [];

    contributionPlan
      .slice(0, completedContributions)
      .filter(contribution => contribution.source === 'terminal')
      .forEach(contribution => {
        hidden[contribution.terminalIndex]?.add(
          contribution.electronId
        );
      });

    if (
      activeContribution?.source === 'terminal' &&
      electronPhase !== 'idle'
    ) {
      hidden[activeContribution.terminalIndex]?.add(
        activeContribution.electronId
      );
    }

    return hidden;
  }, [
    molecule,
    contributionPlan,
    completedContributions,
    activeContribution,
    electronPhase
  ]);

  const activeCentralElectronId =
    activeStep === 4 &&
    electronPhase === 'idle' &&
    activeContribution?.source === 'central'
      ? activeContribution.electronId
      : null;

  const clearTimers = () => {
    timersRef.current.forEach(timerId => window.clearTimeout(timerId));
    timersRef.current = [];
  };

  const schedule = (callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.push(timerId);
    return timerId;
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (
      activeStep === 4 &&
      activeContribution &&
      electronPhase === 'idle'
    ) {
      setDraggedElectronPosition(activeElectronSource);
      setElectronTrail([]);
    }
  }, [
    activeStep,
    activeContribution,
    activeElectronSource.x,
    activeElectronSource.y,
    electronPhase
  ]);

  useEffect(() => {
    if (electronPhase !== 'settling') return undefined;

    let frameId;

    const animate = () => {
      setDraggedElectronPosition(previous => {
        const dx = activeElectronTarget.x - previous.x;
        const dy = activeElectronTarget.y - previous.y;

        return {
          x:
            Math.abs(dx) < 0.25
              ? activeElectronTarget.x
              : previous.x + dx * 0.3,
          y:
            Math.abs(dy) < 0.25
              ? activeElectronTarget.y
              : previous.y + dy * 0.3
        };
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [
    electronPhase,
    activeElectronTarget.x,
    activeElectronTarget.y
  ]);

  const resetDragState = () => {
    setDraggedAtomIndex(null);
    setPointerPosition({ x: 0, y: 0 });
    setElectronPhase('idle');
    setDraggedElectronPosition({ x: 0, y: 0 });
    setElectronTrail([]);
    setElectronGrabOffset({ x: 0, y: 0 });
    pointerIdRef.current = null;
  };

  const resetAll = () => {
    clearTimers();
    safeSound('playElectron');
    setActiveStep(0);
    setSnappedAtoms([]);
    setCompletedContributions(0);
    setFeedback('');
    completionReportedRef.current = false;
    resetDragState();
  };

  const handleStart = () => {
    if (!molecule) return;

    clearTimers();
    safeSound('playElectron');
    setSnappedAtoms(new Array(molecule.terminals.length).fill(false));
    setCompletedContributions(0);
    setFeedback('');
    completionReportedRef.current = false;
    resetDragState();
    setActiveStep(1);
  };

  const stepBack = () => {
    clearTimers();
    safeSound('playElectron');
    setFeedback('');
    resetDragState();

    if (activeStep === 5) {
      setCompletedContributions(previous => Math.max(0, previous - 1));
      setActiveStep(4);
      completionReportedRef.current = false;
      return;
    }

    if (activeStep === 4) {
      if (completedContributions > 0) {
        setCompletedContributions(previous => Math.max(0, previous - 1));
        setFeedback('Elektron terakhir telah dikembalikan ke atom asal.');
      } else {
        setSnappedAtoms(new Array(molecule.terminals.length).fill(false));
        setActiveStep(3);
      }
      return;
    }

    if (activeStep === 3) {
      setSnappedAtoms(new Array(molecule.terminals.length).fill(false));
      setActiveStep(element1Id === element2Id ? 1 : 2);
      return;
    }

    if (activeStep === 2) {
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  const handlePrediction = (isCorrect, element, nextStep) => {
    clearTimers();

    if (isCorrect) {
      safeSound('playCorrect');
      const needed = element.target - element.valence;

      setFeedback(
        `Betul! ${element.name} memerlukan ${needed} elektron lagi dan mencapainya melalui perkongsian elektron.`
      );

      schedule(() => {
        setFeedback('');
        setActiveStep(nextStep);
      }, 1700);

      return;
    }

    safeSound('playError');
    setFeedback(
      `Kurang tepat. ${element.name} ialah unsur bukan logam dan membentuk ikatan kovalen melalui perkongsian elektron.`
    );
  };

  const capturePointer = event => {
    pointerIdRef.current = event.pointerId;

    if (svgRef.current?.setPointerCapture) {
      try {
        svgRef.current.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail in a few browser edge cases.
      }
    }
  };

  const releasePointer = event => {
    if (svgRef.current?.releasePointerCapture) {
      try {
        svgRef.current.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors when capture has already ended.
      }
    }

    pointerIdRef.current = null;
  };

  const handleAtomPointerDown = (event, terminalIndex) => {
    if (activeStep !== 3 || snappedAtoms[terminalIndex]) return;

    event.preventDefault();
    safeSound('playElectron');
    capturePointer(event);

    setDraggedAtomIndex(terminalIndex);
    setPointerPosition(getPointerPosition(event, svgRef.current));
  };

  const handleElectronPointerDown = event => {
    if (
      activeStep !== 4 ||
      electronPhase !== 'idle' ||
      !activeContribution
    ) {
      return;
    }

    event.preventDefault();
    safeSound('playElectron');
    capturePointer(event);

    const pointer = getPointerPosition(event, svgRef.current);

    setElectronGrabOffset({
      x: activeElectronSource.x - pointer.x,
      y: activeElectronSource.y - pointer.y
    });
    setElectronPhase('dragging');
    setDraggedElectronPosition(activeElectronSource);
    setElectronTrail([activeElectronSource]);
  };

  const handlePointerMove = event => {
    if (
      pointerIdRef.current !== null &&
      event.pointerId !== pointerIdRef.current
    ) {
      return;
    }

    if (draggedAtomIndex === null && electronPhase !== 'dragging') return;

    const position = getPointerPosition(event, svgRef.current);
    setPointerPosition(position);

    if (electronPhase === 'dragging') {
      const adjustedPosition = {
        x: position.x + electronGrabOffset.x,
        y: position.y + electronGrabOffset.y
      };

      setDraggedElectronPosition(adjustedPosition);
      setElectronTrail(previous =>
        [...previous, adjustedPosition].slice(-8)
      );
    }
  };

  const finishAtomDrag = event => {
    if (draggedAtomIndex === null || !layout) return;

    const terminalIndex = draggedAtomIndex;
    const terminalLayout = layout.terminals[terminalIndex];
    const dropPosition = getPointerPosition(event, svgRef.current);
    const distance = Math.hypot(
      dropPosition.x - terminalLayout.target.x,
      dropPosition.y - terminalLayout.target.y
    );

    setDraggedAtomIndex(null);

    const threshold = Math.max(
      45,
      terminalLayout.metrics.outerRadius * 0.55
    );

    if (distance <= threshold) {
      safeSound('playBond');

      const nextSnappedAtoms = [...snappedAtoms];
      nextSnappedAtoms[terminalIndex] = true;
      setSnappedAtoms(nextSnappedAtoms);

      if (nextSnappedAtoms.every(Boolean)) {
        setFeedback(
          'Semua atom berada pada kedudukan yang betul. Kawasan pertindihan petala valens kini menjadi kawasan perkongsian.'
        );

        schedule(() => {
          setFeedback('');
          setActiveStep(4);
        }, 1200);
      } else {
        setFeedback(
          `Atom ${terminalIndex + 1} berjaya diletakkan. Teruskan dengan atom seterusnya.`
        );
      }

      return;
    }

    safeSound('playError');
    setFeedback(
      'Letakkan atom pada sasaran hijau. Nukleus dan petala dalaman tidak boleh bertindih.'
    );
  };

  const finishElectronDrag = event => {
    if (electronPhase !== 'dragging' || !activeContribution) return;

    const pointer = getPointerPosition(event, svgRef.current);
    const dropPosition = {
      x: pointer.x + electronGrabOffset.x,
      y: pointer.y + electronGrabOffset.y
    };
    const distance = Math.hypot(
      dropPosition.x - activeElectronTarget.x,
      dropPosition.y - activeElectronTarget.y
    );

    const threshold = Math.max(30, 38 * (layout?.scale || 1));

    if (distance <= threshold) {
      safeSound('playCorrect');
      setElectronPhase('settling');
      setDraggedElectronPosition(dropPosition);

      schedule(() => {
        const nextCount = completedContributions + 1;
        const completed = nextCount >= contributionPlan.length;

        setCompletedContributions(nextCount);
        setElectronPhase('idle');
        setElectronTrail([]);
        setElectronGrabOffset({ x: 0, y: 0 });

        if (completed) {
          safeSound('playBond');
          setFeedback(
            `Tahniah! Molekul ${molecule.formula} stabil. Setiap ikatan terbentuk daripada satu elektron setiap atom.`
          );
          setActiveStep(5);

          if (!completionReportedRef.current && onActionCompleted) {
            completionReportedRef.current = true;
            onActionCompleted(`covalent_bond_${molecule.id}`);
          }
        } else {
          const nextContribution = contributionPlan[nextCount];

          if (
            nextContribution &&
            nextContribution.terminalIndex ===
              activeContribution.terminalIndex &&
            nextContribution.pairIndex === activeContribution.pairIndex
          ) {
            setFeedback(
              'Elektron pertama berada dalam kawasan perkongsian. Sekarang lengkapkan pasangan dengan elektron daripada atom yang satu lagi.'
            );
          } else {
            setFeedback(
              `Satu pasangan elektron lengkap. ${completedPairCount + 1}/${totalPairCount} pasangan telah terbentuk.`
            );
          }
        }
      }, 430);

      return;
    }

    safeSound('playError');
    setElectronPhase('idle');
    setElectronTrail([]);
    setElectronGrabOffset({ x: 0, y: 0 });
    setDraggedElectronPosition(activeElectronSource);
    setFeedback(
      'Seret elektron yang berkelip dari slot asalnya ke kawasan perkongsian hijau.'
    );
  };

  const handlePointerUp = event => {
    if (
      pointerIdRef.current !== null &&
      event.pointerId !== pointerIdRef.current
    ) {
      return;
    }

    if (draggedAtomIndex !== null) {
      finishAtomDrag(event);
    } else if (electronPhase === 'dragging') {
      finishElectronDrag(event);
    }

    releasePointer(event);
  };

  const renderSharedZones = () =>
    layout.terminals.map((terminalLayout, terminalIndex) => {
      const geometry =
        electronSystem?.pairGeometries[terminalIndex]?.[0];

      if (!geometry) return null;

      const isActive =
        activeStep === 4 &&
        activeContribution?.terminalIndex === terminalIndex;

      return (
        <ellipse
          key={`shared-zone-${terminalIndex}`}
          cx={geometry.sharedZone.center.x}
          cy={geometry.sharedZone.center.y}
          rx={geometry.sharedZone.rx}
          ry={geometry.sharedZone.ry}
          transform={`rotate(${geometry.sharedZone.angle} ${geometry.sharedZone.center.x} ${geometry.sharedZone.center.y})`}
          fill={
            isActive
              ? 'rgba(16,185,129,0.105)'
              : 'rgba(148,163,184,0.035)'
          }
          stroke={
            isActive
              ? 'rgba(52,211,153,0.72)'
              : 'rgba(148,163,184,0.16)'
          }
          strokeWidth={isActive ? 1.7 : 1.1}
          strokeDasharray={isActive ? '4 5' : '3 7'}
          className={isActive ? 'animate-pulse-ring' : ''}
          pointerEvents="none"
        />
      );
    });

  const renderBondPairs = (terminalLayout, terminalIndex) => {
    const pairStates = contributionState[terminalIndex] || [];

    return pairStates.map((pairState, pairIndex) => {
      const geometry =
        electronSystem?.pairGeometries[terminalIndex]?.[pairIndex];

      if (!geometry) return null;

      const complete = pairState.central && pairState.terminal;

      return (
        <g key={`bond-${terminalIndex}-pair-${pairIndex}`}>
          {complete && (
            <line
              x1={geometry.centralTarget.x}
              y1={geometry.centralTarget.y}
              x2={geometry.terminalTarget.x}
              y2={geometry.terminalTarget.y}
              stroke="rgba(226,232,240,0.26)"
              strokeWidth="1.15"
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}

          {pairState.central && (
            <g
              transform={`translate(${geometry.centralTarget.x}, ${geometry.centralTarget.y})`}
              pointerEvents="none"
              style={{ opacity: 1 }}
            >
              <circle
                cx="0"
                cy="0"
                r={Math.max(6.7, 7.5 * layout.scale)}
                fill={ELECTRON_COLORS.central}
                opacity="0.13"
              />
              <circle
                cx="0"
                cy="0"
                r={Math.max(4.2, 5.2 * layout.scale)}
                fill={ELECTRON_COLORS.central}
                stroke={ELECTRON_COLORS.centralStroke}
                strokeWidth="0.85"
              />
            </g>
          )}

          {pairState.terminal && (
            <g
              transform={`translate(${geometry.terminalTarget.x}, ${geometry.terminalTarget.y})`}
              pointerEvents="none"
              style={{ opacity: 1 }}
            >
              <circle
                cx="0"
                cy="0"
                r={Math.max(6.7, 7.5 * layout.scale)}
                fill={ELECTRON_COLORS.terminal}
                opacity="0.13"
              />
              <circle
                cx="0"
                cy="0"
                r={Math.max(4.2, 5.2 * layout.scale)}
                fill={ELECTRON_COLORS.terminal}
                stroke={ELECTRON_COLORS.terminalStroke}
                strokeWidth="0.85"
              />
            </g>
          )}
        </g>
      );
    });
  };

  const getCentralOutwardDirection = () => {
    if (layout.terminals.length === 1) {
      return {
        x: -layout.terminals[0].direction.x,
        y: -layout.terminals[0].direction.y
      };
    }

    return { x: 0, y: -1 };
  };

  const getTerminalName = (terminalLayout, terminalIndex) => {
    const sameSymbolCount = molecule.terminals.filter(
      terminal => terminal.symbol === terminalLayout.element.symbol
    ).length;

    if (sameSymbolCount > 1) {
      return `${terminalLayout.element.name} ${terminalIndex + 1}`;
    }

    return terminalLayout.element.name;
  };

  const getInstruction = () => {
    if (activeStep === 3) {
      return 'Seret setiap atom luar ke sasaran hijau. Hanya petala valens perlu bertindih.';
    }

    if (activeStep === 5) {
      return `Molekul ${molecule.formula} lengkap. Setiap pasangan mengandungi satu elektron daripada setiap atom.`;
    }

    if (!activeContribution || !activeTerminalLayout) return '';

    const terminalName = getTerminalName(
      activeTerminalLayout,
      activeContribution.terminalIndex
    );

    if (activeContribution.source === 'central') {
      return `Seret satu elektron daripada ${layout.central.element.name} (atom pusat) ke kawasan perkongsian.`;
    }

    return `Sekarang seret satu elektron daripada ${terminalName} ke kawasan yang sama untuk melengkapkan pasangan.`;
  };

  const renderSimulation = () => {
    if (!molecule || !layout || !electronSystem) return null;

    const centralStable =
      layout.central.element.valence + completedPairCount >=
      layout.central.element.target;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1100px',
          gap: '16px'
        }}
      >
        <div
          className="glass-card"
          style={{
            width: '100%',
            padding: '14px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Molekul dipilih
            </span>
            <h2
              style={{
                margin: '3px 0 0',
                color: 'var(--text-main)',
                fontSize: '30px',
                fontWeight: 900
              }}
            >
              {molecule.formula}
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: 0,
                color: 'var(--text-main)',
                fontWeight: 850,
                fontSize: '14px'
              }}
            >
              Elektron dikongsi: {completedContributions} /{' '}
              {contributionPlan.length}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                color: 'var(--text-muted)',
                fontSize: '12px'
              }}
            >
              Pasangan lengkap: {completedPairCount} / {totalPairCount}
            </p>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at center, rgba(17,24,39,0.96) 0%, rgba(7,12,25,0.995) 100%)',
            boxShadow: '0 12px 34px rgba(0,0,0,0.42)'
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              display: 'block',
              touchAction: 'none',
              userSelect: 'none'
            }}
          >
            <rect
              x="0"
              y="0"
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              fill="transparent"
            />

            <line
              x1="26"
              y1={INSTRUCTION_TOP - 13}
              x2={SVG_WIDTH - 26}
              y2={INSTRUCTION_TOP - 13}
              stroke="rgba(255,255,255,0.065)"
              strokeWidth="1"
            />

            {activeStep >= 4 && renderSharedZones()}

            {activeStep === 3 &&
              layout.terminals.map((terminalLayout, terminalIndex) => {
                if (snappedAtoms[terminalIndex]) return null;

                return (
                  <g key={`target-${terminalIndex}`} pointerEvents="none">
                    {terminalLayout.metrics.shellRadii.map(
                      (radius, shellIndex) => (
                        <circle
                          key={`target-${terminalIndex}-${shellIndex}`}
                          cx={terminalLayout.target.x}
                          cy={terminalLayout.target.y}
                          r={radius}
                          fill="none"
                          stroke="var(--color-stable)"
                          strokeWidth={
                            shellIndex ===
                            terminalLayout.metrics.shellRadii.length - 1
                              ? 2
                              : 1
                          }
                          strokeDasharray="5 6"
                          opacity={
                            shellIndex ===
                            terminalLayout.metrics.shellRadii.length - 1
                              ? 0.5
                              : 0.15
                          }
                        />
                      )
                    )}
                  </g>
                );
              })}

            <AtomModel
              element={layout.central.element}
              position={layout.central.position}
              metrics={layout.central.metrics}
              accentColor="var(--accent-purple)"
              electronColor={ELECTRON_COLORS.central}
              electronStrokeColor={ELECTRON_COLORS.centralStroke}
              electronLayout={electronSystem?.centralElectrons || []}
              hiddenElectronIds={hiddenCentralElectronIds}
              activeElectronId={activeCentralElectronId}
              stable={activeStep >= 4 && centralStable}
            />

            {activeStep === 3 && (
              <AtomLabel
                position={layout.central.position}
                metrics={layout.central.metrics}
                direction={getCentralOutwardDirection()}
                text={`${layout.central.element.name} (Pusat)`}
                accentColor="var(--accent-purple)"
              />
            )}

            {activeStep >= 4 && centralStable && (
              <StableBadge
                position={layout.central.position}
                metrics={layout.central.metrics}
                direction={getCentralOutwardDirection()}
              />
            )}

            {layout.terminals.map((terminalLayout, terminalIndex) => {
              const isSnapped =
                activeStep > 3 || snappedAtoms[terminalIndex];

              const isDragging = draggedAtomIndex === terminalIndex;

              const position = isSnapped
                ? terminalLayout.target
                : isDragging
                  ? pointerPosition
                  : terminalLayout.start;

              const completedPairs =
                terminalCompletedPairCounts[terminalIndex] || 0;

              const stable =
                terminalLayout.element.valence + completedPairs >=
                terminalLayout.element.target;

              const activeTerminalSource =
                activeStep === 4 &&
                activeContribution?.source === 'terminal' &&
                activeContribution.terminalIndex === terminalIndex;

              return (
                <g
                  key={`terminal-${terminalIndex}`}
                  onPointerDown={
                    !isSnapped && activeStep === 3
                      ? event =>
                          handleAtomPointerDown(event, terminalIndex)
                      : undefined
                  }
                  style={{
                    cursor:
                      !isSnapped && activeStep === 3 ? 'grab' : 'default',
                    touchAction: 'none'
                  }}
                >
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={terminalLayout.metrics.visualRadius + 14}
                    fill="transparent"
                  />

                  <AtomModel
                    element={terminalLayout.element}
                    position={position}
                    metrics={terminalLayout.metrics}
                    accentColor="var(--accent-blue)"
                    electronColor={ELECTRON_COLORS.terminal}
                    electronStrokeColor={ELECTRON_COLORS.terminalStroke}
                    electronLayout={
                      electronSystem?.terminalElectrons[terminalIndex] || []
                    }
                    hiddenElectronIds={
                      hiddenTerminalElectronIds[terminalIndex]
                    }
                    activeElectronId={
                      activeTerminalSource && electronPhase === 'idle'
                        ? activeContribution.electronId
                        : null
                    }
                    stable={activeStep >= 4 && stable}
                  />

                  {activeStep === 3 && (
                    <AtomLabel
                      position={position}
                      metrics={terminalLayout.metrics}
                      direction={terminalLayout.direction}
                      text={getTerminalName(
                        terminalLayout,
                        terminalIndex
                      )}
                      accentColor="var(--accent-blue)"
                    />
                  )}

                  {activeStep >= 4 && stable && (
                    <StableBadge
                      position={position}
                      metrics={terminalLayout.metrics}
                      direction={terminalLayout.direction}
                    />
                  )}
                </g>
              );
            })}

            {activeStep >= 4 &&
              layout.terminals.map((terminalLayout, terminalIndex) => (
                <g key={`bond-pairs-${terminalIndex}`}>
                  {renderBondPairs(terminalLayout, terminalIndex)}
                </g>
              ))}

            {activeStep === 4 &&
              activeContribution &&
              activeTerminalLayout &&
              activeBondGeometry && (
                <g>
                  <circle
                    cx={activeElectronTarget.x}
                    cy={activeElectronTarget.y}
                    r={Math.max(16, 20 * layout.scale)}
                    fill="rgba(16,185,129,0.095)"
                    stroke="rgba(52,211,153,0.78)"
                    strokeWidth="1.6"
                    strokeDasharray="4 5"
                    className={
                      electronPhase === 'idle'
                        ? 'animate-pulse-ring'
                        : ''
                    }
                    pointerEvents="none"
                  />

                  {electronPhase === 'dragging' &&
                    electronTrail.map((trailPoint, index) => (
                      <circle
                        key={`trail-${index}`}
                        cx={trailPoint.x}
                        cy={trailPoint.y}
                        r={2.1 + index * 0.3}
                        fill={
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.central
                            : ELECTRON_COLORS.terminal
                        }
                        opacity={
                          (index + 1) /
                          (electronTrail.length * 2.6)
                        }
                        pointerEvents="none"
                      />
                    ))}

                  {electronPhase === 'idle' && (
                    <g
                      transform={`translate(${activeElectronSource.x}, ${activeElectronSource.y})`}
                      onPointerDown={handleElectronPointerDown}
                      style={{
                        cursor: 'grab',
                        touchAction: 'none'
                      }}
                    >
                      <circle cx="0" cy="0" r="25" fill="transparent" />
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(11, 13.5 * layout.scale)}
                        fill={
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.central
                            : ELECTRON_COLORS.terminal
                        }
                        opacity="0.11"
                        className="animate-pulse-ring"
                        pointerEvents="none"
                      />
                    </g>
                  )}

                  {electronPhase !== 'idle' && (
                    <g
                      transform={`translate(${draggedElectronPosition.x}, ${draggedElectronPosition.y})`}
                      style={{
                        pointerEvents: 'none',
                        filter: `drop-shadow(0 0 8px ${
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.central
                            : ELECTRON_COLORS.terminal
                        })`
                      }}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(7, 8.5 * layout.scale)}
                        fill={
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.central
                            : ELECTRON_COLORS.terminal
                        }
                        opacity="0.15"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(4.2, 5.2 * layout.scale)}
                        fill={
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.central
                            : ELECTRON_COLORS.terminal
                        }
                        stroke={
                          activeContribution.source === 'central'
                            ? ELECTRON_COLORS.centralStroke
                            : ELECTRON_COLORS.terminalStroke
                        }
                        strokeWidth="0.9"
                      />
                    </g>
                  )}
                </g>
              )}

            <foreignObject
              x="28"
              y={INSTRUCTION_TOP}
              width={SVG_WIDTH - 56}
              height="64"
              pointerEvents="none"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    padding: '11px 17px',
                    borderRadius: '11px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: '4px solid var(--accent-purple)',
                    background: 'rgba(4,8,18,0.93)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 760,
                    lineHeight: 1.45
                  }}
                >
                  {getInstruction()}
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>

        {feedback && (
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              padding: '13px 18px',
              borderColor:
                activeStep === 5
                  ? 'var(--color-stable)'
                  : 'var(--accent-purple)',
              background:
                activeStep === 5
                  ? 'rgba(16,185,129,0.07)'
                  : 'rgba(168,85,247,0.055)'
            }}
          >
            <p
              style={{
                margin: 0,
                color: 'var(--text-main)',
                fontWeight: 700,
                lineHeight: 1.5,
                fontSize: '14px'
              }}
            >
              {feedback}
            </p>
          </div>
        )}

        {activeStep === 5 && (
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              padding: '18px 20px',
              borderColor: 'var(--color-stable)',
              background: 'rgba(16,185,129,0.1)'
            }}
          >
            <h3
              style={{
                margin: 0,
                color: 'var(--color-stable)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '19px',
                fontWeight: 900
              }}
            >
              <Sparkles size={21} />
              Molekul {molecule.formula} berjaya dibina
            </h3>

            <p
              style={{
                margin: '9px 0 0',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 620,
                lineHeight: 1.55
              }}
            >
              {molecule.name} mempunyai {totalPairCount} pasangan elektron
              yang dikongsi dan membentuk{' '}
              {getBondTypeLabel(molecule.correctBondType)}. Elektron tidak
              dipindahkan; setiap pasangan terdiri daripada satu elektron
              yang disumbangkan oleh setiap atom.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="screen-container"
      style={{
        padding: '24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 120px',
          width: '100%',
          maxWidth: '1100px',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <div>
          {activeStep > 0 && (
            <button
              className="gradient-btn"
              onClick={stepBack}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)'
              }}
            >
              <ArrowLeft size={16} />
              Undur
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            className="gradient-text"
            style={{ fontSize: '32px', fontWeight: 850, margin: 0 }}
          >
            Makmal Ikatan Kovalen
          </h1>
          <p
            style={{
              margin: '5px 0 0',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}
          >
            Bina molekul kovalen melalui perkongsian elektron.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {activeStep > 0 && (
            <button
              className="gradient-btn"
              onClick={resetAll}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--bg-card)'
              }}
              aria-label="Tetapkan semula simulasi"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {activeStep === 0 && (
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <div
            className="glass-card"
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}
          >
            <div>
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '20px',
                  fontWeight: 800
                }}
              >
                Pilih Unsur 1
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Unsur bukan logam pertama.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px'
                }}
              >
                {selectableElements.map(element => (
                  <button
                    key={`element-1-${element.symbol}`}
                    onClick={() => setElement1Id(element.symbol)}
                    className="glass-card"
                    style={{
                      padding: '12px',
                      border:
                        element1Id === element.symbol
                          ? '2px solid var(--accent-blue)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '16px'
                      }}
                    >
                      {element.symbol}
                    </strong>
                    <p
                      style={{
                        margin: '4px 0 0',
                        color: 'var(--text-muted)',
                        fontSize: '12px'
                      }}
                    >
                      {element.name} ·{' '}
                      {arrangementText(element.arrangement)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '20px',
                  fontWeight: 800
                }}
              >
                Pilih Unsur 2
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Unsur bukan logam kedua.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px'
                }}
              >
                {selectableElements.map(element => (
                  <button
                    key={`element-2-${element.symbol}`}
                    onClick={() => setElement2Id(element.symbol)}
                    className="glass-card"
                    style={{
                      padding: '12px',
                      border:
                        element2Id === element.symbol
                          ? '2px solid var(--accent-blue)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '16px'
                      }}
                    >
                      {element.symbol}
                    </strong>
                    <p
                      style={{
                        margin: '4px 0 0',
                        color: 'var(--text-muted)',
                        fontSize: '12px'
                      }}
                    >
                      {element.name} ·{' '}
                      {arrangementText(element.arrangement)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                padding: '18px',
                borderRadius: '14px',
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    margin: 0,
                    fontSize: '14px'
                  }}
                >
                  Molekul yang terbentuk:
                </p>

                {molecule ? (
                  <>
                    <h2
                      style={{
                        color: 'var(--text-main)',
                        margin: '6px 0 0',
                        fontSize: '34px',
                        fontWeight: 900
                      }}
                    >
                      {molecule.formula}
                    </h2>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        margin: '6px 0 0',
                        fontSize: '14px'
                      }}
                    >
                      {molecule.name} · {molecule.rule} ·{' '}
                      {getBondTypeLabel(molecule.correctBondType)}
                    </p>
                  </>
                ) : (
                  <p
                    style={{
                      color: 'var(--color-warning)',
                      margin: '10px 0 0',
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    Kombinasi ini belum tersedia dalam simulasi. Cuba H + O,
                    C + O, N + H atau C + Cl.
                  </p>
                )}
              </div>

              {molecule && (
                <button
                  type="button"
                  className="gradient-btn"
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleStart();
                  }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  Mula Eksperimen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeStep === 1 || activeStep === 2) && (
        <div
          className="glass-card animate-fade-in"
          style={{
            maxWidth: '620px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            padding: '32px'
          }}
        >
          {(() => {
            const currentElement =
              activeStep === 1 ? element1 : element2;

            const sameElement = element1Id === element2Id;
            const totalQuestions = sameElement ? 1 : 2;
            const nextStep =
              activeStep === 1 && sameElement
                ? 3
                : activeStep + 1;

            return (
              <>
                <span
                  style={{
                    fontSize: '14px',
                    color: 'var(--accent-blue)',
                    fontWeight: 700
                  }}
                >
                  Soalan {activeStep} / {totalQuestions}
                </span>

                <h3
                  style={{
                    fontSize: '21px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: 1.4,
                    margin: 0
                  }}
                >
                  Bagaimanakah {currentElement.name} (
                  {arrangementText(currentElement.arrangement)}) mencapai
                  susunan elektron yang stabil?
                </h3>

                <button
                  className="glass-card"
                  onClick={() =>
                    handlePrediction(
                      false,
                      currentElement,
                      nextStep
                    )
                  }
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ color: 'var(--text-main)' }}>
                    Menderma atau menerima elektron sepenuhnya
                  </strong>
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      margin: '5px 0 0',
                      fontSize: '13px'
                    }}
                  >
                    Proses ini lebih berkaitan dengan pembentukan ikatan
                    ionik.
                  </p>
                </button>

                <button
                  className="glass-card"
                  onClick={() =>
                    handlePrediction(
                      true,
                      currentElement,
                      nextStep
                    )
                  }
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ color: 'var(--text-main)' }}>
                    Berkongsi{' '}
                    {currentElement.target -
                      currentElement.valence}{' '}
                    elektron
                  </strong>
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      margin: '5px 0 0',
                      fontSize: '13px'
                    }}
                  >
                    Unsur bukan logam berkongsi elektron untuk mencapai
                    duplet atau oktet.
                  </p>
                </button>

                {feedback && (
                  <div
                    style={{
                      color: feedback.includes('Betul')
                        ? 'var(--color-stable)'
                        : 'var(--color-unstable)',
                      fontWeight: 800,
                      marginTop: '4px'
                    }}
                  >
                    {feedback}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeStep >= 3 && renderSimulation()}
    </div>
  );
}
