/**
 * uncertaintyCalculator.test.js
 * Unit test suite for Measurement Uncertainty Engine using Node.js native test runner
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUncertainty,
  computeStandardUncertainty,
  calculateTypeAUncertainty,
  PROBABILITY_DISTRIBUTIONS,
  UNCERTAINTY_PRESETS
} from '../lib/metrology/uncertaintyCalculator.js';

test('1. Basic Root-Sum-of-Squares (Pythagorean 3-4-5 theorem)', () => {
  const result = calculateUncertainty({
    measuredValue: 100,
    unit: 'kg',
    coverageFactor: 2,
    components: [
      { id: '1', name: 'Component A', value: 3, distribution: 'STANDARD' },
      { id: '2', name: 'Component B', value: 4, distribution: 'STANDARD' }
    ]
  });

  assert.equal(result.isValid, true);
  // sqrt(3^2 + 4^2) = sqrt(25) = 5
  assert.equal(result.combinedStandardUncertainty, 5);
  // U = 2 * 5 = 10
  assert.equal(result.expandedUncertainty, 10);
  assert.equal(result.coverageFactor, 2);
  // Relative expanded uncertainty: (10 / 100) * 100% = 10%
  assert.equal(result.relativeExpandedPercent, 10);
  // Percentage contribution: 9/25 = 36%, 16/25 = 64%
  assert.equal(result.components[0].contributionPercent, 36);
  assert.equal(result.components[1].contributionPercent, 64);
});

test('2. Probability Distribution Divisors', () => {
  // Rectangular distribution has divisor sqrt(3)
  const rectVal = Math.sqrt(3);
  const stdRect = computeStandardUncertainty(rectVal, 'RECTANGULAR');
  assert.ok(Math.abs(stdRect - 1.0) < 1e-10);

  // Triangular distribution has divisor sqrt(6)
  const triVal = Math.sqrt(6);
  const stdTri = computeStandardUncertainty(triVal, 'TRIANGULAR');
  assert.ok(Math.abs(stdTri - 1.0) < 1e-10);

  // Normal k=2 has divisor 2
  const normK2 = computeStandardUncertainty(4.0, 'NORMAL_K2');
  assert.equal(normK2, 2.0);

  // U-shaped distribution has divisor sqrt(2)
  const uShaped = computeStandardUncertainty(Math.sqrt(2), 'U_SHAPED');
  assert.ok(Math.abs(uShaped - 1.0) < 1e-10);
});

test('3. Verification of Platform Scale Preset', () => {
  const preset = UNCERTAINTY_PRESETS[0];
  const result = calculateUncertainty({
    measuredValue: preset.measuredValue,
    unit: preset.unit,
    coverageFactor: preset.coverageFactor,
    components: preset.components
  });

  assert.equal(result.isValid, true);
  assert.ok(result.combinedStandardUncertainty > 0);
  assert.ok(result.expandedUncertainty > result.combinedStandardUncertainty);
  assert.equal(result.components.length, 4);
  
  // Total contribution percentage should sum to approximately 100%
  const totalContribution = result.components.reduce((acc, c) => acc + c.contributionPercent, 0);
  assert.ok(Math.abs(totalContribution - 100) < 0.2);
});

test('4. Type A Statistical Evaluation from Repeat Readings', () => {
  const readings = [10.0, 10.2, 10.1, 10.3, 10.4];
  const typeA = calculateTypeAUncertainty(readings);

  assert.equal(typeA.isValid, true);
  assert.equal(typeA.n, 5);
  // Mean = 51.0 / 5 = 10.2
  assert.ok(Math.abs(typeA.mean - 10.2) < 1e-10);
  assert.ok(typeA.sampleStdDev > 0);
  assert.ok(typeA.stdUncertaintyOfMean < typeA.sampleStdDev);
});

test('5. Validation and Edge Cases', () => {
  // Empty components array
  const emptyRes = calculateUncertainty({
    measuredValue: 10,
    coverageFactor: 2,
    components: []
  });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.length > 0);

  // Non-numeric measured value
  const badValRes = calculateUncertainty({
    measuredValue: 'abc',
    coverageFactor: 2,
    components: [{ name: 'Comp', value: 1 }]
  });
  assert.equal(badValRes.isValid, false);

  // Negative uncertainty magnitude
  const negCompRes = calculateUncertainty({
    measuredValue: 50,
    coverageFactor: 2,
    components: [{ name: 'Bad Comp', value: -2.5 }]
  });
  assert.equal(negCompRes.isValid, false);
});
