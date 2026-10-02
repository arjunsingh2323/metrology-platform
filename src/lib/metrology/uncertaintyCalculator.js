/**
 * uncertaintyCalculator.js - Core Metrology Measurement Uncertainty Engine
 * 
 * Implements the Guide to the Expression of Uncertainty in Measurement (GUM / ISO/IEC Guide 98-3:2008).
 * Pure mathematical functions for calculating combined standard uncertainty and expanded uncertainty.
 * 
 * Assumptions:
 * - Input quantities are independent and uncorrelated (covariances cov(xi, xj) = 0).
 * - Component values represent standard uncertainties or half-widths of known probability distributions.
 */

// Supported probability distributions and their standard uncertainty divisors
export const PROBABILITY_DISTRIBUTIONS = {
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard Uncertainty (1s)',
    divisor: 1.0,
    description: 'Direct standard uncertainty (k = 1)'
  },
  NORMAL_K2: {
    id: 'NORMAL_K2',
    name: 'Normal (Expanded k = 2, 95.45%)',
    divisor: 2.0,
    description: 'Calibration certificate expanded uncertainty U (k = 2)'
  },
  RECTANGULAR: {
    id: 'RECTANGULAR',
    name: 'Rectangular / Uniform (a / √3)',
    divisor: Math.sqrt(3),
    description: 'Digital resolution / least count, digital truncation, certificate bounds with uniform probability'
  },
  TRIANGULAR: {
    id: 'TRIANGULAR',
    name: 'Triangular (a / √6)',
    divisor: Math.sqrt(6),
    description: 'Symmetric linear limits with values centered around nominal'
  },
  U_SHAPED: {
    id: 'U_SHAPED',
    name: 'U-Shaped / Bimodal (a / √2)',
    divisor: Math.sqrt(2),
    description: 'Thermostatic cyclic variation, RF mismatch'
  }
};

/**
 * Common standard units categorized by dimension
 */
export const METROLOGY_UNITS = [
  { label: 'Mass: Kilogram (kg)', value: 'kg', dimension: 'mass' },
  { label: 'Mass: Gram (g)', value: 'g', dimension: 'mass' },
  { label: 'Mass: Milligram (mg)', value: 'mg', dimension: 'mass' },
  { label: 'Volume: Liter (L)', value: 'L', dimension: 'volume' },
  { label: 'Volume: Milliliter (mL)', value: 'mL', dimension: 'volume' },
  { label: 'Length: Meter (m)', value: 'm', dimension: 'length' },
  { label: 'Length: Millimeter (mm)', value: 'mm', dimension: 'length' },
  { label: 'Pressure: Kilopascal (kPa)', value: 'kPa', dimension: 'pressure' },
  { label: 'Pressure: Bar (bar)', value: 'bar', dimension: 'pressure' },
  { label: 'Temperature: Degree Celsius (°C)', value: '°C', dimension: 'temperature' },
  { label: 'Dimensionless / Count', value: '', dimension: 'none' }
];

/**
 * Standard Metrology Presets for one-click sample demonstration
 */
export const UNCERTAINTY_PRESETS = [
  {
    name: 'Class III Platform Scale (50 kg Test)',
    description: 'Commercial 50 kg scale verification against calibrated test masses per OIML R 76.',
    measuredValue: 50.002,
    unit: 'kg',
    coverageFactor: 2,
    components: [
      {
        id: 'comp-1',
        name: 'Repeatability of 5 repeat weighings (Type A)',
        value: 0.0015,
        distribution: 'STANDARD',
        notes: 'Standard deviation of mean from 5 observation cycles'
      },
      {
        id: 'comp-2',
        name: 'Calibrated M1 Standard Mass Certificate (Type B)',
        value: 0.0025,
        distribution: 'NORMAL_K2',
        notes: 'Certificate expanded uncertainty U = 0.0025 kg (k=2)'
      },
      {
        id: 'comp-3',
        name: 'Scale Resolution / Least Count (d = 0.005 kg)',
        value: 0.0025,
        distribution: 'RECTANGULAR',
        notes: 'Half-division (d/2 = 0.0025 kg) rectangular distribution'
      },
      {
        id: 'comp-4',
        name: 'Air Buoyancy & Convection Drift',
        value: 0.0008,
        distribution: 'RECTANGULAR',
        notes: 'Barometric fluctuation drift limits'
      }
    ]
  },
  {
    name: 'Class II Analytical Laboratory Balance (200 g Test)',
    description: 'Precision laboratory analytical balance verification per Legal Metrology rules.',
    measuredValue: 200.0008,
    unit: 'g',
    coverageFactor: 2,
    components: [
      {
        id: 'comp-1',
        name: 'Repeatability of observations (Type A)',
        value: 0.0003,
        distribution: 'STANDARD',
        notes: 'Std dev of 10 replicate readings'
      },
      {
        id: 'comp-2',
        name: 'Reference E2 Standard Weight Certificate',
        value: 0.0004,
        distribution: 'NORMAL_K2',
        notes: 'Accredited certificate uncertainty U at k=2'
      },
      {
        id: 'comp-3',
        name: 'Display Digital Scale Resolution (d = 0.0001 g)',
        value: 0.00005,
        distribution: 'RECTANGULAR',
        notes: 'Least count interval width'
      },
      {
        id: 'comp-4',
        name: 'Environmental Temperature Variation',
        value: 0.0002,
        distribution: 'TRIANGULAR',
        notes: 'Thermal sensitivity coefficient across 2 deg C'
      }
    ]
  },
  {
    name: 'Fuel Dispensing Measure Prover (20 L Delivery Test)',
    description: 'Periodic retail fuel dispenser meter check using a 20 L conical prover.',
    measuredValue: 20.015,
    unit: 'L',
    coverageFactor: 2,
    components: [
      {
        id: 'comp-1',
        name: 'Dispenser Meter Delivery Repeatability',
        value: 0.006,
        distribution: 'STANDARD',
        notes: 'Run-to-run standard deviation of 3 delivery cycles'
      },
      {
        id: 'comp-2',
        name: 'Conical Measure Calibration Certificate',
        value: 0.010,
        distribution: 'NORMAL_K2',
        notes: 'Legal Metrology secondary standard certificate'
      },
      {
        id: 'comp-3',
        name: 'Prover Neck Scale Graduation Resolution',
        value: 0.005,
        distribution: 'RECTANGULAR',
        notes: 'Visual meniscus parallax resolution limit'
      },
      {
        id: 'comp-4',
        name: 'Fuel Liquid Temperature Expansion',
        value: 0.008,
        distribution: 'RECTANGULAR',
        notes: 'Temperature differential between nozzle and prover'
      }
    ]
  }
];

/**
 * Validates a single uncertainty component
 * @param {Object} component 
 * @returns {string|null} Error message or null if valid
 */
export const validateComponent = (component) => {
  if (!component.name || component.name.trim() === '') {
    return 'Component name cannot be empty.';
  }
  const val = parseFloat(component.value);
  if (isNaN(val)) {
    return `Component "${component.name}": Value must be a valid number.`;
  }
  if (val <= 0) {
    return `Component "${component.name}": Uncertainty magnitude must be greater than zero.`;
  }
  return null;
};

/**
 * Computes standard uncertainty u_i from a specified distribution
 * @param {number} value Raw uncertainty or half-width limit
 * @param {string} distributionKey ID in PROBABILITY_DISTRIBUTIONS
 * @returns {number} Standard uncertainty (k = 1)
 */
export const computeStandardUncertainty = (value, distributionKey = 'STANDARD') => {
  const dist = PROBABILITY_DISTRIBUTIONS[distributionKey] || PROBABILITY_DISTRIBUTIONS.STANDARD;
  const numVal = parseFloat(value);
  if (isNaN(numVal) || numVal < 0) return 0;
  return numVal / dist.divisor;
};

/**
 * Core Combined Uncertainty Evaluation
 * 
 * Formula:
 * u_c = sqrt( sum( u_i^2 ) )
 * U = k * u_c
 * 
 * @param {Object} params
 * @param {number|string} params.measuredValue
 * @param {string} params.unit
 * @param {number|string} params.coverageFactor
 * @param {Array<Object>} params.components
 * @returns {Object} Complete calculation results, steps, breakdown, and validity flags
 */
export const calculateUncertainty = ({
  measuredValue,
  unit = '',
  coverageFactor = 2,
  components = []
}) => {
  const errors = [];

  // 1. Validate Measured Value
  const val = parseFloat(measuredValue);
  if (isNaN(val)) {
    errors.push('Measured value must be a valid numeric quantity.');
  }

  // 2. Validate Coverage Factor
  const k = parseFloat(coverageFactor);
  if (isNaN(k) || k <= 0) {
    errors.push('Coverage factor (k) must be a positive number (typically 2 for approx. 95.45% confidence).');
  }

  // 3. Validate Components
  if (!Array.isArray(components) || components.length === 0) {
    errors.push('At least one uncertainty component is required to calculate uncertainty.');
  }

  const processedComponents = [];
  let sumOfSquares = 0;

  components.forEach((comp, idx) => {
    const compError = validateComponent(comp);
    if (compError) {
      errors.push(compError);
      return;
    }

    const rawVal = parseFloat(comp.value);
    const distKey = comp.distribution || 'STANDARD';
    const dist = PROBABILITY_DISTRIBUTIONS[distKey] || PROBABILITY_DISTRIBUTIONS.STANDARD;
    const stdUncertainty = rawVal / dist.divisor;
    const variance = Math.pow(stdUncertainty, 2);

    sumOfSquares += variance;

    processedComponents.push({
      id: comp.id || `comp-${idx}`,
      name: comp.name,
      rawValue: rawVal,
      distribution: dist.name,
      divisor: dist.divisor,
      stdUncertainty,
      variance,
      notes: comp.notes || ''
    });
  });

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      combinedStandardUncertainty: null,
      expandedUncertainty: null,
      coverageFactor: k,
      processedComponents: []
    };
  }

  // Combined standard uncertainty: u_c = sqrt( sum( u_i^2 ) )
  const combinedStandardUncertainty = Math.sqrt(sumOfSquares);

  // Expanded uncertainty: U = k * u_c
  const expandedUncertainty = k * combinedStandardUncertainty;

  // Percentage contribution of each component to total variance
  const componentsWithContribution = processedComponents.map((c) => {
    const contributionPercent = sumOfSquares > 0 ? (c.variance / sumOfSquares) * 100 : 0;
    return {
      ...c,
      contributionPercent: parseFloat(contributionPercent.toFixed(2))
    };
  });

  // Relative uncertainties (percentage of nominal measured value)
  let relativeCombinedPercent = null;
  let relativeExpandedPercent = null;
  if (val !== 0) {
    relativeCombinedPercent = (combinedStandardUncertainty / Math.abs(val)) * 100;
    relativeExpandedPercent = (expandedUncertainty / Math.abs(val)) * 100;
  }

  // Step-by-step formula breakdown strings for transparency
  const stepFormula = `u_c = √[ ${processedComponents.map(c => `(${c.stdUncertainty.toPrecision(4)})²`).join(' + ')} ]`;
  const stepSumValue = `u_c = √[ ${sumOfSquares.toPrecision(6)} ] = ${combinedStandardUncertainty.toPrecision(5)} ${unit}`;
  const stepExpandedValue = `U = ${k} × ${combinedStandardUncertainty.toPrecision(5)} = ${expandedUncertainty.toPrecision(5)} ${unit}`;

  return {
    isValid: true,
    errors: [],
    measuredValue: val,
    unit,
    coverageFactor: k,
    sumOfSquares,
    combinedStandardUncertainty,
    expandedUncertainty,
    relativeCombinedPercent,
    relativeExpandedPercent,
    components: componentsWithContribution,
    steps: {
      formula: 'u_c = √(u₁² + u₂² + ... + uₙ²)',
      expandedFormula: 'U = k × u_c',
      stepFormula,
      stepSumValue,
      stepExpandedValue
    },
    assumptions: [
      'Input quantities are independent and mutually uncorrelated (covariance = 0).',
      'The functional relationship is linear or well-approximated by a first-order Taylor series.',
      'Output probability distribution is approximately normal by the Central Limit Theorem.',
      'Coverage factor k = 2 represents an approximate 95.45% level of confidence for large effective degrees of freedom.'
    ]
  };
};

/**
 * Type A Evaluation: Calculates sample standard deviation and standard deviation of the mean
 * @param {Array<number>} readings Repeated observation array
 * @returns {Object}
 */
export const calculateTypeAUncertainty = (readings = []) => {
  const valid = readings.filter(r => !isNaN(parseFloat(r))).map(r => parseFloat(r));
  const n = valid.length;
  if (n < 2) {
    return { isValid: false, error: 'At least 2 repeat readings are required for Type A statistical evaluation.' };
  }

  const mean = valid.reduce((acc, curr) => acc + curr, 0) / n;
  const variance = valid.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (n - 1);
  const sampleStdDev = Math.sqrt(variance);
  const stdUncertaintyOfMean = sampleStdDev / Math.sqrt(n);

  return {
    isValid: true,
    n,
    mean,
    sampleStdDev,
    stdUncertaintyOfMean,
    degreesOfFreedom: n - 1
  };
};
