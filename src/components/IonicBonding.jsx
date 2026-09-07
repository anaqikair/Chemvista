import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

/* =========================================================
   DATA: ELEMENTS 1–20
   ========================================================= */

const ELEMENTS_1_20 = [
  { atomicNumber: 1, name: 'Hydrogen', malayName: 'Hidrogen', symbol: 'H', arrangement: [1], category: 'special', note: 'H+' },
  { atomicNumber: 2, name: 'Helium', malayName: 'Helium', symbol: 'He', arrangement: [2], category: 'noble', note: 'Stabil' },
  { atomicNumber: 3, name: 'Lithium', malayName: 'Litium', symbol: 'Li', arrangement: [2, 1], ionType: 'cation', ionCharge: 1 },
  { atomicNumber: 4, name: 'Beryllium', malayName: 'Berilium', symbol: 'Be', arrangement: [2, 2], ionType: 'cation', ionCharge: 2 },
  { atomicNumber: 5, name: 'Boron', malayName: 'Boron', symbol: 'B', arrangement: [2, 3], category: 'metalloid', note: 'Tidak biasa membentuk ion ringkas' },
  { atomicNumber: 6, name: 'Carbon', malayName: 'Karbon', symbol: 'C', arrangement: [2, 4], category: 'nonmetal_special', note: 'Biasanya kovalen' },
  { atomicNumber: 7, name: 'Nitrogen', malayName: 'Nitrogen', symbol: 'N', arrangement: [2, 5], ionType: 'anion', ionCharge: -3, anionName: 'nitrida' },
  { atomicNumber: 8, name: 'Oxygen', malayName: 'Oksigen', symbol: 'O', arrangement: [2, 6], ionType: 'anion', ionCharge: -2, anionName: 'oksida' },
  { atomicNumber: 9, name: 'Fluorine', malayName: 'Fluorin', symbol: 'F', arrangement: [2, 7], ionType: 'anion', ionCharge: -1, anionName: 'fluorida' },
  { atomicNumber: 10, name: 'Neon', malayName: 'Neon', symbol: 'Ne', arrangement: [2, 8], category: 'noble', note: 'Stabil' },
  { atomicNumber: 11, name: 'Sodium', malayName: 'Natrium', symbol: 'Na', arrangement: [2, 8, 1], ionType: 'cation', ionCharge: 1 },
  { atomicNumber: 12, name: 'Magnesium', malayName: 'Magnesium', symbol: 'Mg', arrangement: [2, 8, 2], ionType: 'cation', ionCharge: 2 },
  { atomicNumber: 13, name: 'Aluminium', malayName: 'Aluminium', symbol: 'Al', arrangement: [2, 8, 3], ionType: 'cation', ionCharge: 3 },
  { atomicNumber: 14, name: 'Silicon', malayName: 'Silikon', symbol: 'Si', arrangement: [2, 8, 4], category: 'metalloid', note: 'Biasanya kovalen' },
  { atomicNumber: 15, name: 'Phosphorus', malayName: 'Fosforus', symbol: 'P', arrangement: [2, 8, 5], ionType: 'anion', ionCharge: -3, anionName: 'fosfida' },
  { atomicNumber: 16, name: 'Sulfur', malayName: 'Sulfur', symbol: 'S', arrangement: [2, 8, 6], ionType: 'anion', ionCharge: -2, anionName: 'sulfida' },
  { atomicNumber: 17, name: 'Chlorine', malayName: 'Klorin', symbol: 'Cl', arrangement: [2, 8, 7], ionType: 'anion', ionCharge: -1, anionName: 'klorida' },
  { atomicNumber: 18, name: 'Argon', malayName: 'Argon', symbol: 'Ar', arrangement: [2, 8, 8], category: 'noble', note: 'Stabil' },
  { atomicNumber: 19, name: 'Potassium', malayName: 'Kalium', symbol: 'K', arrangement: [2, 8, 8, 1], ionType: 'cation', ionCharge: 1 },
  { atomicNumber: 20, name: 'Calcium', malayName: 'Kalsium', symbol: 'Ca', arrangement: [2, 8, 8, 2], ionType: 'cation', ionCharge: 2 }
];

const metalElements = ELEMENTS_1_20.filter(element => element.ionType === 'cation');
const nonMetalElements = ELEMENTS_1_20.filter(element => element.ionType === 'anion');

const SCENE_WIDTH = 980;

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function toSubscript(number) {
  const map = {
    0: '₀',
    1: '₁',
    2: '₂',
    3: '₃',
    4: '₄',
    5: '₅',
    6: '₆',
    7: '₇',
    8: '₈',
    9: '₉'
  };

  if (number === 1) return '';

  return String(number)
    .split('')
    .map(digit => map[digit])
    .join('');
}

function chargeText(charge) {
  const absoluteCharge = Math.abs(charge);

  if (charge > 0) return absoluteCharge === 1 ? '⁺' : `${absoluteCharge}⁺`;
  if (charge < 0) return absoluteCharge === 1 ? '⁻' : `${absoluteCharge}⁻`;

  return '';
}

function arrangementText(arrangement) {
  return arrangement.join('.');
}

function coefficientText(number) {
  return number > 1 ? String(number) : '';
}

function calculateIonicCompound(metal, nonmetal) {
  const positiveCharge = Math.abs(metal.ionCharge);
  const negativeCharge = Math.abs(nonmetal.ionCharge);
  const divisor = gcd(positiveCharge, negativeCharge);

  const metalCount = negativeCharge / divisor;
  const nonmetalCount = positiveCharge / divisor;
  const totalElectronsTransferred = metalCount * positiveCharge;

  return {
    metalCount,
    nonmetalCount,
    totalElectronsTransferred,
    formula: `${metal.symbol}${toSubscript(metalCount)}${nonmetal.symbol}${toSubscript(nonmetalCount)}`,
    metalIon: `${metal.symbol}${chargeText(metal.ionCharge)}`,
    nonmetalIon: `${nonmetal.symbol}${chargeText(nonmetal.ionCharge)}`
  };
}

/* =========================================================
   ELECTRON-TRANSFER MODEL
   ========================================================= */

function buildTransferPlan(compound, metal, nonmetal) {
  const electronsPerMetal = Math.abs(metal.ionCharge);
  const electronsPerNonmetal = Math.abs(nonmetal.ionCharge);
  const receiverRemaining = Array(compound.nonmetalCount).fill(electronsPerNonmetal);
  const plan = [];
  let receiverIndex = 0;

  for (let donorIndex = 0; donorIndex < compound.metalCount; donorIndex += 1) {
    for (let electronNumber = 0; electronNumber < electronsPerMetal; electronNumber += 1) {
      while (
        receiverIndex < receiverRemaining.length &&
        receiverRemaining[receiverIndex] === 0
      ) {
        receiverIndex += 1;
      }

      if (receiverIndex >= receiverRemaining.length) {
        throw new Error('Pelan pemindahan elektron tidak seimbang.');
      }

      plan.push({ donorIndex, receiverIndex });
      receiverRemaining[receiverIndex] -= 1;
    }
  }

  return plan;
}

function getCompletedTransferCounts(transferPlan, transferredCount, compound) {
  const lostByMetal = Array(compound.metalCount).fill(0);
  const gainedByNonmetal = Array(compound.nonmetalCount).fill(0);

  transferPlan.slice(0, transferredCount).forEach(transfer => {
    lostByMetal[transfer.donorIndex] += 1;
    gainedByNonmetal[transfer.receiverIndex] += 1;
  });

  return { lostByMetal, gainedByNonmetal };
}

function getMetalArrangement(element, electronsLost) {
  const arrangement = [...element.arrangement];
  const outerShellIndex = arrangement.length - 1;

  arrangement[outerShellIndex] = Math.max(
    0,
    arrangement[outerShellIndex] - electronsLost
  );

  while (arrangement.length > 1 && arrangement[arrangement.length - 1] === 0) {
    arrangement.pop();
  }

  return arrangement;
}

function getNonmetalArrangement(element, electronsGained) {
  const arrangement = [...element.arrangement];
  const outerShellIndex = arrangement.length - 1;

  arrangement[outerShellIndex] = Math.min(
    8,
    arrangement[outerShellIndex] + electronsGained
  );

  return arrangement;
}

function buildAtomStates(
  compound,
  metal,
  nonmetal,
  transferPlan,
  transferredCount
) {
  const { lostByMetal, gainedByNonmetal } = getCompletedTransferCounts(
    transferPlan,
    transferredCount,
    compound
  );

  const metals = Array.from({ length: compound.metalCount }, (_, index) => {
    const electronsLost = lostByMetal[index];
    const required = Math.abs(metal.ionCharge);
    const currentCharge = electronsLost;

    return {
      key: `metal-${index}`,
      role: 'metal',
      index,
      element: metal,
      arrangement: getMetalArrangement(metal, electronsLost),
      electronsChanged: electronsLost,
      isStable: electronsLost === required,
      displaySymbol:
        currentCharge > 0
          ? `${metal.symbol}${chargeText(currentCharge)}`
          : metal.symbol
    };
  });

  const nonmetals = Array.from({ length: compound.nonmetalCount }, (_, index) => {
    const electronsGained = gainedByNonmetal[index];
    const required = Math.abs(nonmetal.ionCharge);
    const currentCharge = -electronsGained;

    return {
      key: `nonmetal-${index}`,
      role: 'nonmetal',
      index,
      element: nonmetal,
      arrangement: getNonmetalArrangement(nonmetal, electronsGained),
      electronsChanged: electronsGained,
      isStable: electronsGained === required,
      displaySymbol:
        currentCharge < 0
          ? `${nonmetal.symbol}${chargeText(currentCharge)}`
          : nonmetal.symbol
    };
  });

  return { metals, nonmetals };
}

/* =========================================================
   RESPONSIVE, COLLISION-FREE ATOM LAYOUT
   ========================================================= */

function getLayoutRadius(compound, metal, nonmetal) {
  const maximumColumnCount = Math.max(compound.metalCount, compound.nonmetalCount);
  const maximumShellCount = Math.max(
    metal.arrangement.length,
    nonmetal.arrangement.length
  );

  let radius;

  if (maximumColumnCount >= 3) radius = 68;
  else if (maximumColumnCount === 2) radius = 84;
  else radius = 108;

  if (maximumShellCount === 4 && maximumColumnCount === 1) {
    radius = 112;
  }

  return radius;
}

function getColumnPositions(count, centerX, layoutRadius, sceneHeight) {
  const verticalGap = Math.max(38, Math.round(layoutRadius * 0.45));
  const spacing = layoutRadius * 2 + verticalGap;
  const columnHeight = count * layoutRadius * 2 + Math.max(0, count - 1) * verticalGap;
  const availableTop = 46;
  const usableHeight = sceneHeight - 120;
  const startY = availableTop + Math.max(0, (usableHeight - columnHeight) / 2) + layoutRadius;

  return Array.from({ length: count }, (_, index) => ({
    x: centerX,
    y: startY + index * spacing
  }));
}

function calculateSceneLayout(
  compound,
  metal,
  nonmetal,
  atomStates,
  attractionProgress
) {
  const layoutRadius = getLayoutRadius(compound, metal, nonmetal);
  const maximumColumnCount = Math.max(compound.metalCount, compound.nonmetalCount);
  const verticalGap = Math.max(38, Math.round(layoutRadius * 0.45));
  const maximumColumnHeight =
    maximumColumnCount * layoutRadius * 2 +
    Math.max(0, maximumColumnCount - 1) * verticalGap;

  const sceneHeight = Math.max(460, maximumColumnHeight + 150);

  const restingMetalX = 235;
  const restingNonmetalX = SCENE_WIDTH - 235;
  const bondedMetalX = SCENE_WIDTH / 2 - (layoutRadius + 28);
  const bondedNonmetalX = SCENE_WIDTH / 2 + (layoutRadius + 28);

  const metalX =
    restingMetalX + (bondedMetalX - restingMetalX) * attractionProgress;
  const nonmetalX =
    restingNonmetalX + (bondedNonmetalX - restingNonmetalX) * attractionProgress;

  const metalPositions = getColumnPositions(
    compound.metalCount,
    metalX,
    layoutRadius,
    sceneHeight
  );

  const nonmetalPositions = getColumnPositions(
    compound.nonmetalCount,
    nonmetalX,
    layoutRadius,
    sceneHeight
  );

  const atoms = [
    ...atomStates.metals.map((atom, index) => ({
      ...atom,
      ...metalPositions[index]
    })),
    ...atomStates.nonmetals.map((atom, index) => ({
      ...atom,
      ...nonmetalPositions[index]
    }))
  ];

  return {
    atoms,
    layoutRadius,
    sceneHeight,
    restingMetalX,
    restingNonmetalX,
    bondedMetalX,
    bondedNonmetalX
  };
}

/* =========================================================
   ATOM DRAWING HELPERS
   ========================================================= */

function getAtomGeometry(element, layoutRadius) {
  const originalShellCount = element.arrangement.length;
  const nucleusRadius = Math.max(10, layoutRadius * 0.14);
  const electronRadius = clamp(layoutRadius * 0.045, 3.1, 5);
  const firstShellRadius = nucleusRadius + Math.max(13, layoutRadius * 0.13);
  const outerShellRadius = layoutRadius - Math.max(12, electronRadius * 2.5);

  let shellRadii;

  if (originalShellCount === 1) {
    shellRadii = [Math.min(outerShellRadius, firstShellRadius + layoutRadius * 0.14)];
  } else {
    shellRadii = Array.from({ length: originalShellCount }, (_, index) => {
      const progress = index / (originalShellCount - 1);
      return firstShellRadius + (outerShellRadius - firstShellRadius) * progress;
    });
  }

  return {
    nucleusRadius,
    electronRadius,
    shellRadii
  };
}

function getElectronPosition(electronIndex, electronCount, shellRadius) {
  if (electronCount <= 0) return { x: 0, y: 0 };

  const angle =
    (Math.PI * 2 * electronIndex) / electronCount - Math.PI / 2;

  return {
    x: Math.cos(angle) * shellRadius,
    y: Math.sin(angle) * shellRadius
  };
}

function getVisibleBoundaryRadius(atom, geometry) {
  const visibleShellCount = atom.arrangement.length;
  const outerShellRadius = geometry.shellRadii[visibleShellCount - 1];

  return outerShellRadius + geometry.electronRadius + 10;
}

function IonCard({ element, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card"
      style={{
        padding: '12px',
        border: selected
          ? '2px solid var(--accent-blue)'
          : '1px solid var(--border-color)',
        cursor: 'pointer',
        textAlign: 'left'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <strong style={{ color: 'var(--text-main)', fontSize: '16px' }}>
          {element.symbol}
        </strong>

        <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>
          {chargeText(element.ionCharge)}
        </span>
      </div>

      <p
        style={{
          margin: '4px 0 0',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}
      >
        {element.malayName}
      </p>

      <p
        style={{
          margin: '4px 0 0',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}
      >
        {arrangementText(element.arrangement)}
      </p>
    </button>
  );
}

function ElementInfoTable() {
  return (
    <div
      className="glass-card"
      style={{ width: '100%', marginTop: '20px', overflowX: 'auto' }}
    >
      <h3
        style={{
          color: 'var(--text-main)',
          fontSize: '18px',
          fontWeight: 800,
          marginBottom: '12px'
        }}
      >
        Unsur 1–20 dan Ion Biasa
      </h3>

      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}
      >
        <thead>
          <tr
            style={{
              color: 'var(--text-main)',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <th style={{ padding: '8px', textAlign: 'left' }}>No.</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Unsur</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Simbol</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Susunan</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Ion biasa</th>
          </tr>
        </thead>

        <tbody>
          {ELEMENTS_1_20.map(element => (
            <tr
              key={element.atomicNumber}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                {element.atomicNumber}
              </td>
              <td style={{ padding: '8px', color: 'var(--text-main)' }}>
                {element.malayName}
              </td>
              <td
                style={{
                  padding: '8px',
                  color: 'var(--text-main)',
                  fontWeight: 800
                }}
              >
                {element.symbol}
              </td>
              <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                {arrangementText(element.arrangement)}
              </td>
              <td style={{ padding: '8px', color: 'var(--text-main)' }}>
                {element.ionCharge
                  ? `${element.symbol}${chargeText(element.ionCharge)}`
                  : element.note || 'Tiada ion ringkas biasa'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function IonicBonding({ onActionCompleted }) {
  const [activeStep, setActiveStep] = useState(0);

  const [selectedMetalSymbol, setSelectedMetalSymbol] = useState('Mg');
  const [selectedNonMetalSymbol, setSelectedNonMetalSymbol] = useState('Cl');

  const [selectedPredictionMetal, setSelectedPredictionMetal] = useState(null);
  const [selectedPredictionNonMetal, setSelectedPredictionNonMetal] = useState(null);

  const [transferredCount, setTransferredCount] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [isDraggingElectron, setIsDraggingElectron] = useState(false);
  const [electronPointerPosition, setElectronPointerPosition] = useState({
    x: 0,
    y: 0
  });

  const [attractionProgress, setAttractionProgress] = useState(0);
  const [isDraggingAttraction, setIsDraggingAttraction] = useState(false);
  const [bondFormed, setBondFormed] = useState(false);

  const svgRef = useRef(null);
  const activeElectronPointerIdRef = useRef(null);
  const attractionDragRef = useRef({
    pointerId: null,
    startClientX: 0,
    startProgress: 0
  });

  const selectedMetal = useMemo(
    () =>
      metalElements.find(element => element.symbol === selectedMetalSymbol) ||
      metalElements[0],
    [selectedMetalSymbol]
  );

  const selectedNonMetal = useMemo(
    () =>
      nonMetalElements.find(
        element => element.symbol === selectedNonMetalSymbol
      ) || nonMetalElements[0],
    [selectedNonMetalSymbol]
  );

  const compound = useMemo(
    () => calculateIonicCompound(selectedMetal, selectedNonMetal),
    [selectedMetal, selectedNonMetal]
  );

  const transferPlan = useMemo(
    () => buildTransferPlan(compound, selectedMetal, selectedNonMetal),
    [compound, selectedMetal, selectedNonMetal]
  );

  const nextTransfer = transferPlan[transferredCount] || null;

  const atomStates = useMemo(
    () =>
      buildAtomStates(
        compound,
        selectedMetal,
        selectedNonMetal,
        transferPlan,
        transferredCount
      ),
    [
      compound,
      selectedMetal,
      selectedNonMetal,
      transferPlan,
      transferredCount
    ]
  );

  const effectiveAttractionProgress = bondFormed ? 1 : attractionProgress;

  const sceneLayout = useMemo(
    () =>
      calculateSceneLayout(
        compound,
        selectedMetal,
        selectedNonMetal,
        atomStates,
        effectiveAttractionProgress
      ),
    [
      compound,
      selectedMetal,
      selectedNonMetal,
      atomStates,
      effectiveAttractionProgress
    ]
  );

  const nextDonorAtom = useMemo(() => {
    if (!nextTransfer) return null;

    return sceneLayout.atoms.find(
      atom => atom.role === 'metal' && atom.index === nextTransfer.donorIndex
    );
  }, [nextTransfer, sceneLayout.atoms]);

  const nextReceiverAtom = useMemo(() => {
    if (!nextTransfer) return null;

    return sceneLayout.atoms.find(
      atom =>
        atom.role === 'nonmetal' && atom.index === nextTransfer.receiverIndex
    );
  }, [nextTransfer, sceneLayout.atoms]);

  const allElectronsTransferred =
    transferredCount >= compound.totalElectronsTransferred;

  const resetSimulationOnly = () => {
    setSelectedPredictionMetal(null);
    setSelectedPredictionNonMetal(null);
    setTransferredCount(0);
    setFeedback('');
    setIsDraggingElectron(false);
    setElectronPointerPosition({ x: 0, y: 0 });
    setAttractionProgress(0);
    setIsDraggingAttraction(false);
    setBondFormed(false);
    activeElectronPointerIdRef.current = null;
    attractionDragRef.current = {
      pointerId: null,
      startClientX: 0,
      startProgress: 0
    };
  };

  const resetAll = () => {
    sounds.playElectron();
    resetSimulationOnly();
    setActiveStep(0);
  };

  const handleStart = () => {
    sounds.playElectron();
    resetSimulationOnly();
    setActiveStep(1);
  };

  const stepBack = () => {
    sounds.playElectron();

    if (activeStep === 4) {
      setBondFormed(false);
      setAttractionProgress(0);
      setActiveStep(3);
      return;
    }

    if (activeStep === 3) {
      if (transferredCount > 0) {
        setTransferredCount(previous => Math.max(0, previous - 1));
        setFeedback('Satu pemindahan elektron telah diterbalikkan.');
      } else {
        setSelectedPredictionNonMetal(null);
        setActiveStep(2);
      }
      return;
    }

    if (activeStep === 2) {
      setSelectedPredictionMetal(null);
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  const handlePredictMetal = option => {
    setSelectedPredictionMetal(option);

    if (option === 'lose') {
      sounds.playCorrect();
      setFeedback(
        `Betul! ${selectedMetal.malayName} menderma ${Math.abs(
          selectedMetal.ionCharge
        )} elektron untuk membentuk ${compound.metalIon}.`
      );
    } else {
      sounds.playError();
      setFeedback(
        `${selectedMetal.malayName} ialah logam. Logam biasanya menderma elektron dan membentuk ion positif.`
      );
    }

    window.setTimeout(() => {
      setFeedback('');
      setActiveStep(2);
    }, 2500);
  };

  const handlePredictNonMetal = option => {
    setSelectedPredictionNonMetal(option);

    if (option === 'gain') {
      sounds.playCorrect();
      setFeedback(
        `Betul! ${selectedNonMetal.malayName} menerima elektron untuk membentuk ${compound.nonmetalIon}.`
      );
    } else {
      sounds.playError();
      setFeedback(
        `${selectedNonMetal.malayName} ialah bukan logam. Bukan logam biasanya menerima elektron dan membentuk ion negatif.`
      );
    }

    window.setTimeout(() => {
      setFeedback('');
      setActiveStep(3);
    }, 2500);
  };

  const clientPointToSvgPoint = event => {
    const svg = svgRef.current;

    if (!svg) return null;

    const screenMatrix = svg.getScreenCTM();

    if (!screenMatrix) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const converted = point.matrixTransform(screenMatrix.inverse());

    return { x: converted.x, y: converted.y };
  };

  const handleElectronPointerDown = event => {
    if (!nextTransfer || allElectronsTransferred || bondFormed) return;

    event.preventDefault();
    event.stopPropagation();

    const point = clientPointToSvgPoint(event);

    if (!point) return;

    sounds.playElectron();
    activeElectronPointerIdRef.current = event.pointerId;
    setElectronPointerPosition(point);
    setIsDraggingElectron(true);

    if (svgRef.current?.setPointerCapture) {
      try {
        svgRef.current.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers do not allow pointer capture on SVG roots.
      }
    }
  };

  const handleSvgPointerMove = event => {
    if (!isDraggingElectron) return;

    if (
      activeElectronPointerIdRef.current !== null &&
      event.pointerId !== activeElectronPointerIdRef.current
    ) {
      return;
    }

    const point = clientPointToSvgPoint(event);

    if (point) {
      setElectronPointerPosition(point);
    }
  };

  const finishElectronDrag = event => {
    if (!isDraggingElectron) return;

    if (
      activeElectronPointerIdRef.current !== null &&
      event.pointerId !== activeElectronPointerIdRef.current
    ) {
      return;
    }

    const releasePoint = clientPointToSvgPoint(event) || electronPointerPosition;
    setIsDraggingElectron(false);
    activeElectronPointerIdRef.current = null;

    if (!nextReceiverAtom) return;

    const receiverGeometry = getAtomGeometry(
      nextReceiverAtom.element,
      sceneLayout.layoutRadius
    );
    const receiverBoundary = getVisibleBoundaryRadius(
      nextReceiverAtom,
      receiverGeometry
    );

    const distance = Math.hypot(
      releasePoint.x - nextReceiverAtom.x,
      releasePoint.y - nextReceiverAtom.y
    );

    const droppedOnCorrectAtom = distance <= receiverBoundary + 30;

    if (droppedOnCorrectAtom) {
      const nextCount = Math.min(
        transferredCount + 1,
        compound.totalElectronsTransferred
      );

      sounds.playCorrect();
      setTransferredCount(nextCount);

      if (nextCount >= compound.totalElectronsTransferred) {
        setFeedback(
          `Semua ${compound.totalElectronsTransferred} elektron telah dipindahkan. Ion ${compound.metalIon} dan ${compound.nonmetalIon} telah terbentuk.`
        );
      } else {
        setFeedback(
          `Elektron berjaya dipindahkan. Lagi ${compound.totalElectronsTransferred - nextCount
          } elektron diperlukan.`
        );
      }
    } else {
      sounds.playError();
      setFeedback(
        `Seret elektron ke atom ${selectedNonMetal.symbol} yang diserlahkan.`
      );
    }
  };

  const handleAttractionPointerDown = event => {
    if (!allElectronsTransferred || bondFormed) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    sounds.playElectron();
    setIsDraggingAttraction(true);
    attractionDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startProgress: attractionProgress
    };
  };

  const handleAttractionPointerMove = event => {
    if (!isDraggingAttraction) return;
    if (event.pointerId !== attractionDragRef.current.pointerId) return;

    const distanceMoved = event.clientX - attractionDragRef.current.startClientX;
    const nextProgress = clamp(
      attractionDragRef.current.startProgress + distanceMoved / 130,
      0,
      1
    );

    setAttractionProgress(nextProgress);

    if (nextProgress >= 0.96) {
      setAttractionProgress(1);
      setIsDraggingAttraction(false);
      setBondFormed(true);
      setActiveStep(4);
      sounds.playBond();

      if (onActionCompleted) {
        onActionCompleted('ionic_bond');
      }
    }
  };

  const handleAttractionPointerUp = event => {
    if (!isDraggingAttraction) return;
    if (event.pointerId !== attractionDragRef.current.pointerId) return;

    setIsDraggingAttraction(false);

    if (!bondFormed && attractionProgress < 0.96) {
      setAttractionProgress(0);
      setFeedback('Seret anak panah sehingga ion-ion menghampiri satu sama lain.');
    }
  };

  const renderElectronShells = atom => {
    const geometry = getAtomGeometry(atom.element, sceneLayout.layoutRadius);
    const visibleShellCount = atom.arrangement.length;
    const originalOuterShellIndex = atom.element.arrangement.length - 1;
    const currentOuterShellIndex = visibleShellCount - 1;
    const originalValenceCount = atom.element.arrangement[originalOuterShellIndex];

    return atom.arrangement.map((electronCount, shellIndex) => {
      const shellRadius = geometry.shellRadii[shellIndex];
      const isOuterShell = shellIndex === currentOuterShellIndex;

      return (
        <g key={`${atom.key}-shell-${shellIndex}`}>
          <circle
            cx="0"
            cy="0"
            r={shellRadius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />

          {Array.from({ length: electronCount }, (_, electronIndex) => {
            const position = getElectronPosition(
              electronIndex,
              electronCount,
              shellRadius
            );

            const isCurrentDonorElectron =
              atom.role === 'metal' &&
              nextTransfer &&
              atom.index === nextTransfer.donorIndex &&
              isOuterShell &&
              electronIndex === electronCount - 1;

            const hideBecauseDragging =
              isCurrentDonorElectron && isDraggingElectron;

            const isReceivedElectron =
              atom.role === 'nonmetal' &&
              isOuterShell &&
              electronIndex >= originalValenceCount;

            if (hideBecauseDragging) return null;

            const electronFill = isCurrentDonorElectron
              ? 'var(--accent-purple)'
              : isReceivedElectron
                ? 'var(--accent-purple)'
                : isOuterShell
                  ? 'var(--accent-blue)'
                  : 'var(--text-main)';

            return (
              <g
                key={`${atom.key}-electron-${shellIndex}-${electronIndex}`}
                transform={`translate(${position.x}, ${position.y})`}
                onPointerDown={
                  isCurrentDonorElectron
                    ? handleElectronPointerDown
                    : undefined
                }
                style={
                  isCurrentDonorElectron
                    ? { cursor: 'grab', touchAction: 'none' }
                    : undefined
                }
              >
                {isCurrentDonorElectron && (
                  <>
                    <circle
                      cx="0"
                      cy="0"
                      r={geometry.electronRadius + 8}
                      fill="var(--accent-purple)"
                      opacity="0.25"
                      className="animate-pulse-ring"
                    />
                    <text
                      x="0"
                      y={-(geometry.electronRadius + 13)}
                      textAnchor="middle"
                      fill="var(--accent-purple)"
                      style={{ fontSize: '10px', fontWeight: 900 }}
                    >
                      SERET
                    </text>
                  </>
                )}

                <circle
                  cx="0"
                  cy="0"
                  r={geometry.electronRadius}
                  fill={electronFill}
                  stroke={
                    isCurrentDonorElectron
                      ? 'rgba(255,255,255,0.8)'
                      : 'none'
                  }
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </g>
      );
    });
  };

  const renderAtom = atom => {
    const isMetal = atom.role === 'metal';
    const geometry = getAtomGeometry(atom.element, sceneLayout.layoutRadius);
    const boundaryRadius = getVisibleBoundaryRadius(atom, geometry);
    const isNextDonor =
      nextTransfer &&
      isMetal &&
      atom.index === nextTransfer.donorIndex &&
      !allElectronsTransferred;
    const isNextReceiver =
      nextTransfer &&
      !isMetal &&
      atom.index === nextTransfer.receiverIndex &&
      !allElectronsTransferred;

    const hasCharge = atom.electronsChanged > 0;
    const currentCharge = isMetal ? atom.electronsChanged : -atom.electronsChanged;
    const chargeString = chargeText(currentCharge);
    const bR = boundaryRadius + 10;

    return (
      <g key={atom.key} transform={`translate(${atom.x}, ${atom.y})`}>
        {isNextReceiver && (
          <circle
            cx="0"
            cy="0"
            r={boundaryRadius + 24}
            fill="rgba(245, 158, 11, 0.05)"
            stroke="var(--color-almost)"
            strokeWidth="2"
            strokeDasharray="6,6"
            className="animate-pulse-ring"
          />
        )}

        {isNextDonor && (
          <circle
            cx="0"
            cy="0"
            r={boundaryRadius + 17}
            fill="none"
            stroke="var(--accent-purple)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            opacity="0.65"
          />
        )}

        <circle
          cx="0"
          cy="0"
          r={boundaryRadius}
          fill="rgba(255,255,255,0.02)"
          stroke={atom.isStable ? 'var(--color-stable)' : 'var(--border-color)'}
          strokeWidth="2"
          strokeDasharray={atom.isStable ? 'none' : '4,4'}
        />

        {renderElectronShells(atom)}

        {/* Square Bracket & Outside Charge for Ions */}
        {hasCharge && (
          <g key={`${atom.key}-ion-bracket`}>
            {/* Left bracket '[' */}
            <path
              d={`M ${-bR + 12} ${-bR} L ${-bR} ${-bR} L ${-bR} ${bR} L ${-bR + 12} ${bR}`}
              fill="none"
              stroke="var(--text-main)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right bracket ']' */}
            <path
              d={`M ${bR - 12} ${-bR} L ${bR} ${-bR} L ${bR} ${bR} L ${bR - 12} ${bR}`}
              fill="none"
              stroke="var(--text-main)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Charge badge outside top-right */}
            <text
              x={bR + 6}
              y={-bR + 14}
              textAnchor="start"
              fill={isMetal ? 'var(--accent-blue)' : 'var(--accent-purple)'}
              style={{
                fontWeight: 900,
                fontSize: `${clamp(sceneLayout.layoutRadius * 0.26, 16, 26)}px`
              }}
            >
              {chargeString}
            </text>
          </g>
        )}

        <circle
          cx="0"
          cy="0"
          r={geometry.nucleusRadius}
          fill="var(--bg-app)"
          stroke="var(--border-color)"
          strokeWidth="2.5"
        />

        {/* Element symbol in center nucleus ONLY */}
        <text
          x="0"
          y={geometry.nucleusRadius * 0.33}
          textAnchor="middle"
          fill="var(--text-main)"
          style={{
            fontWeight: 900,
            fontSize: `${clamp(sceneLayout.layoutRadius * 0.19, 13, 20)}px`
          }}
        >
          {atom.element.symbol}
        </text>

        <text
          x="0"
          y={-(sceneLayout.layoutRadius + 15)}
          textAnchor="middle"
          fill={isMetal ? 'var(--accent-blue)' : 'var(--accent-purple)'}
          style={{ fontWeight: 800, fontSize: '12px' }}
        >
          {arrangementText(atom.arrangement)}
          {atom.isStable ? ' Stabil' : ''}
        </text>
      </g>
    );
  };

  const targetInstruction = nextTransfer
    ? `Seret elektron daripada ${selectedMetal.symbol} atom ${nextTransfer.donorIndex + 1
    } ke ${selectedNonMetal.symbol} atom ${nextTransfer.receiverIndex + 1}.`
    : '';

  const metalEquation = `${coefficientText(compound.metalCount)}${selectedMetal.symbol
    } → ${coefficientText(compound.metalCount)}${compound.metalIon} + ${compound.totalElectronsTransferred
    }e⁻`;

  const nonmetalEquation = `${coefficientText(compound.nonmetalCount)}${selectedNonMetal.symbol
    } + ${compound.totalElectronsTransferred}e⁻ → ${coefficientText(
      compound.nonmetalCount
    )}${compound.nonmetalIon}`;

  const compoundEquation = `${coefficientText(compound.metalCount)}${compound.metalIon
    } + ${coefficientText(compound.nonmetalCount)}${compound.nonmetalIon
    } → ${compound.formula}`;

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
          display: 'flex',
          width: '100%',
          maxWidth: '980px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '14px'
        }}
      >
        {activeStep > 0 ? (
          <button
            type="button"
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
        ) : (
          <div style={{ width: '92px' }} />
        )}

        <div style={{ textAlign: 'center' }}>
          <h1
            className="gradient-text"
            style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}
          >
            Makmal Ikatan Ionik
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}
          >
            Pilih unsur 1–20 dan bina formula ionik yang betul.
          </p>
        </div>

        {activeStep > 0 ? (
          <button
            type="button"
            className="gradient-btn"
            onClick={resetAll}
            aria-label="Tetapkan semula eksperimen"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg-card)'
            }}
          >
            <RefreshCw size={16} />
          </button>
        ) : (
          <div style={{ width: '44px' }} />
        )}
      </div>

      {activeStep === 0 && (
        <div style={{ width: '100%', maxWidth: '980px' }}>
          <div
            className="glass-card"
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                Pilih Kation
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Logam menderma elektron dan menjadi ion positif.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))',
                  gap: '10px'
                }}
              >
                {metalElements.map(element => (
                  <IonCard
                    key={element.symbol}
                    element={element}
                    selected={selectedMetalSymbol === element.symbol}
                    onClick={() => setSelectedMetalSymbol(element.symbol)}
                  />
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
                Pilih Anion
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Bukan logam menerima elektron dan menjadi ion negatif.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))',
                  gap: '10px'
                }}
              >
                {nonMetalElements.map(element => (
                  <IonCard
                    key={element.symbol}
                    element={element}
                    selected={selectedNonMetalSymbol === element.symbol}
                    onClick={() => setSelectedNonMetalSymbol(element.symbol)}
                  />
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
                flexWrap: 'wrap',
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
                  Sebatian yang terbentuk:
                </p>

                <h2
                  style={{
                    color: 'var(--text-main)',
                    margin: '6px 0 0',
                    fontSize: '34px',
                    fontWeight: 900
                  }}
                >
                  {compound.formula}
                </h2>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    margin: '6px 0 0',
                    fontSize: '14px'
                  }}
                >
                  {compound.metalCount} × {compound.metalIon} dan{' '}
                  {compound.nonmetalCount} × {compound.nonmetalIon}
                </p>
              </div>

              <button
                type="button"
                className="gradient-btn"
                onClick={handleStart}
                style={{ padding: '12px 22px', borderRadius: '10px' }}
              >
                Mula Eksperimen
              </button>
            </div>
          </div>

          <ElementInfoTable />
        </div>
      )}

      {activeStep === 1 && (
        <div
          className="glass-card"
          style={{
            maxWidth: '560px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: 'var(--accent-blue)',
              fontWeight: 700
            }}
          >
            Soalan 1 / 2
          </span>

          <h3
            style={{
              fontSize: '21px',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.4
            }}
          >
            Bagaimanakah {selectedMetal.malayName} ({selectedMetal.symbol}:{' '}
            {arrangementText(selectedMetal.arrangement)}) menjadi stabil?
          </h3>

          <button
            type="button"
            className="glass-card"
            onClick={() => handlePredictMetal('lose')}
            style={{ padding: '16px', textAlign: 'left', cursor: 'pointer' }}
          >
            <strong style={{ color: 'var(--text-main)' }}>
              Derma {Math.abs(selectedMetal.ionCharge)} elektron
            </strong>

            <p
              style={{
                color: 'var(--text-muted)',
                margin: '5px 0 0',
                fontSize: '13px'
              }}
            >
              Membentuk ion positif {compound.metalIon}.
            </p>
          </button>

          <button
            type="button"
            className="glass-card"
            onClick={() => handlePredictMetal('gain')}
            style={{ padding: '16px', textAlign: 'left', cursor: 'pointer' }}
          >
            <strong style={{ color: 'var(--text-main)' }}>
              Terima elektron
            </strong>

            <p
              style={{
                color: 'var(--text-muted)',
                margin: '5px 0 0',
                fontSize: '13px'
              }}
            >
              Pilihan ini biasanya tidak berlaku untuk logam.
            </p>
          </button>

          {feedback && (
            <div
              style={{
                color:
                  selectedPredictionMetal === 'lose'
                    ? 'var(--color-stable)'
                    : 'var(--color-unstable)',
                fontWeight: 800
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      )}

      {activeStep === 2 && (
        <div
          className="glass-card"
          style={{
            maxWidth: '560px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: 'var(--accent-purple)',
              fontWeight: 700
            }}
          >
            Soalan 2 / 2
          </span>

          <h3
            style={{
              fontSize: '21px',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.4
            }}
          >
            Apakah yang diperlukan oleh {selectedNonMetal.malayName} (
            {selectedNonMetal.symbol}:{' '}
            {arrangementText(selectedNonMetal.arrangement)}) untuk stabil?
          </h3>

          <button
            type="button"
            className="glass-card"
            onClick={() => handlePredictNonMetal('gain')}
            style={{ padding: '16px', textAlign: 'left', cursor: 'pointer' }}
          >
            <strong style={{ color: 'var(--text-main)' }}>
              Terima {Math.abs(selectedNonMetal.ionCharge)} elektron
            </strong>

            <p
              style={{
                color: 'var(--text-muted)',
                margin: '5px 0 0',
                fontSize: '13px'
              }}
            >
              Membentuk ion negatif {compound.nonmetalIon}.
            </p>
          </button>

          <button
            type="button"
            className="glass-card"
            onClick={() => handlePredictNonMetal('lose')}
            style={{ padding: '16px', textAlign: 'left', cursor: 'pointer' }}
          >
            <strong style={{ color: 'var(--text-main)' }}>
              Derma elektron
            </strong>

            <p
              style={{
                color: 'var(--text-muted)',
                margin: '5px 0 0',
                fontSize: '13px'
              }}
            >
              Pilihan ini biasanya tidak berlaku untuk bukan logam.
            </p>
          </button>

          {feedback && (
            <div
              style={{
                color:
                  selectedPredictionNonMetal === 'gain'
                    ? 'var(--color-stable)'
                    : 'var(--color-unstable)',
                fontWeight: 800
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      )}

      {activeStep >= 3 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '980px',
            gap: '18px'
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              padding: '16px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Formula sebatian:
              </span>

              <h2
                style={{
                  margin: '4px 0 0',
                  color: 'var(--text-main)',
                  fontSize: '30px',
                  fontWeight: 900
                }}
              >
                {compound.formula}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-main)',
                  fontWeight: 800
                }}
              >
                Elektron dipindahkan: {transferredCount} /{' '}
                {compound.totalElectronsTransferred}
              </p>

              <p
                style={{
                  margin: '4px 0 0',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}
              >
                {compound.metalCount} × {compound.metalIon} +{' '}
                {compound.nonmetalCount} × {compound.nonmetalIon}
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: `${sceneLayout.sceneHeight}px`,
              background: 'var(--bg-canvas)',
              border: '2px solid var(--border-color)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SCENE_WIDTH} ${sceneLayout.sceneHeight}`}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              onPointerMove={handleSvgPointerMove}
              onPointerUp={finishElectronDrag}
              onPointerCancel={finishElectronDrag}
              style={{
                display: 'block',
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              {nextReceiverAtom && !allElectronsTransferred && (() => {
                const geometry = getAtomGeometry(
                  nextReceiverAtom.element,
                  sceneLayout.layoutRadius
                );
                const boundary = getVisibleBoundaryRadius(
                  nextReceiverAtom,
                  geometry
                );

                return (
                  <circle
                    cx={nextReceiverAtom.x}
                    cy={nextReceiverAtom.y}
                    r={boundary + 28}
                    fill="rgba(245, 158, 11, 0.035)"
                    stroke="var(--color-almost)"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity="0.8"
                  />
                );
              })()}

              {sceneLayout.atoms.map(atom => renderAtom(atom))}

              {allElectronsTransferred && (
                <line
                  x1={sceneLayout.bondedMetalX}
                  y1={sceneLayout.sceneHeight / 2}
                  x2={sceneLayout.bondedNonmetalX}
                  y2={sceneLayout.sceneHeight / 2}
                  stroke="var(--accent-blue)"
                  strokeWidth="3"
                  strokeDasharray="8,8"
                  opacity={0.25 + effectiveAttractionProgress * 0.55}
                />
              )}

              {isDraggingElectron && (
                <g
                  transform={`translate(${electronPointerPosition.x}, ${electronPointerPosition.y})`}
                  pointerEvents="none"
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="14"
                    fill="var(--accent-purple)"
                    opacity="0.28"
                    className="animate-pulse-ring"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="6"
                    fill="var(--accent-purple)"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1"
                  />
                </g>
              )}
            </svg>

            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                pointerEvents: 'none'
              }}
            >
              <div
                className="glass-card"
                style={{
                  padding: '10px 18px',
                  background: 'var(--bg-card)',
                  display: 'inline-block',
                  borderRadius: '8px',
                  maxWidth: 'calc(100% - 70px)'
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 800,
                    color: 'var(--text-main)'
                  }}
                >
                  {!allElectronsTransferred
                    ? targetInstruction
                    : !bondFormed
                      ? 'Seret anak panah ke kanan untuk menunjukkan tarikan elektrostatik antara ion.'
                      : `Ikatan ion lengkap. ${compound.formula} telah terbentuk.`}
                </p>
              </div>
            </div>

            {allElectronsTransferred && !bondFormed && (
              <button
                type="button"
                onPointerDown={handleAttractionPointerDown}
                onPointerMove={handleAttractionPointerMove}
                onPointerUp={handleAttractionPointerUp}
                onPointerCancel={handleAttractionPointerUp}
                aria-label="Seret untuk membentuk tarikan elektrostatik"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '52px',
                  height: '52px',
                  transform: `translate(calc(-50% + ${attractionProgress * 72
                    }px), -50%)`,
                  background: 'var(--accent-blue)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDraggingAttraction ? 'grabbing' : 'grab',
                  boxShadow: '0 0 20px var(--accent-blue)',
                  touchAction: 'none',
                  zIndex: 3
                }}
              >
                <ChevronRight size={28} color="white" />
              </button>
            )}
          </div>

          {feedback && (
            <div
              className="glass-card"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderColor: 'var(--accent-blue)',
                background: 'rgba(37,99,235,0.15)'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-main)'
                }}
              >
                {feedback}
              </p>
            </div>
          )}

          {activeStep === 4 && (
            <div
              className="glass-card"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: 'var(--color-stable)',
                background: 'rgba(16,185,129,0.15)'
              }}
            >
              <h3
                style={{
                  color: 'var(--color-stable)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '20px',
                  fontWeight: 800,
                  margin: 0
                }}
              >
                <Sparkles size={22} />
                Tahniah! Sebatian ion {compound.formula} telah terbentuk.
              </h3>

              <p
                style={{
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: 0
                }}
              >
                {selectedMetal.malayName} mendermakan elektron kepada{' '}
                {selectedNonMetal.malayName}. Ion {compound.metalIon} dan{' '}
                {compound.nonmetalIon} tertarik melalui tarikan elektrostatik.
              </p>

              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  lineHeight: 1.7
                }}
              >
                <strong>Persamaan ion:</strong>
                <br />
                {metalEquation}
                <br />
                {nonmetalEquation}
                <br />
                {compoundEquation}
              </div>

              <button
                type="button"
                className="gradient-btn"
                onClick={resetAll}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  width: 'fit-content'
                }}
              >
                Pilih Unsur Lain
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
