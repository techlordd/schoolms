// tests/utils.test.js
const { computeGrade } = require('../src/utils/generators');

describe('computeGrade', () => {
  it('returns A+ for 90 and above', () => expect(computeGrade(95)).toBe('A+'));
  it('returns A for 80-89',         () => expect(computeGrade(85)).toBe('A'));
  it('returns B for 70-79',         () => expect(computeGrade(75)).toBe('B'));
  it('returns C for 60-69',         () => expect(computeGrade(65)).toBe('C'));
  it('returns D for 50-59',         () => expect(computeGrade(55)).toBe('D'));
  it('returns F for below 50',      () => expect(computeGrade(40)).toBe('F'));
  it('returns F for 0',             () => expect(computeGrade(0)).toBe('F'));
  it('returns A+ for exactly 90',   () => expect(computeGrade(90)).toBe('A+'));
  it('returns A for exactly 80',    () => expect(computeGrade(80)).toBe('A'));
});
