import {
  isValidUserId,
  isValidRole,
  isNonEmptyString,
  isPositiveInt,
} from '../../../src/util/validators.js';

describe('validators', () => {
  describe('isValidUserId', () => {
    it('debe aceptar UUID válido', () => {
      expect(isValidUserId('00000000-0000-0000-0000-000000000001')).toBe(true);
      expect(isValidUserId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('debe rechazar IDs inválidos', () => {
      expect(isValidUserId('not-a-uuid')).toBe(false);
      expect(isValidUserId('')).toBe(false);
      expect(isValidUserId(undefined)).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('debe aceptar roles válidos', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('user')).toBe(true);
      expect(isValidRole('child')).toBe(true);
    });

    it('debe rechazar roles inválidos', () => {
      expect(isValidRole('root')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('debe aceptar strings no vacíos', () => {
      expect(isNonEmptyString('hola')).toBe(true);
      expect(isNonEmptyString('  texto  ')).toBe(true);
    });

    it('debe rechazar strings vacíos y no strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(42)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
    });
  });

  describe('isPositiveInt', () => {
    it('debe aceptar enteros positivos', () => {
      expect(isPositiveInt(1)).toBe(true);
      expect(isPositiveInt(100)).toBe(true);
    });

    it('debe rechazar negativos, cero y no enteros', () => {
      expect(isPositiveInt(0)).toBe(false);
      expect(isPositiveInt(-1)).toBe(false);
      expect(isPositiveInt(1.5)).toBe(false);
      expect(isPositiveInt('1')).toBe(false);
    });
  });
});
