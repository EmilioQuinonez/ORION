import { extractJsonFromText, truncateText, sanitizeParam, formatResponse, formatError } from '../../../src/util/helpers.js';

describe('helpers', () => {
  describe('extractJsonFromText', () => {
    it('debe extraer JSON válido de texto', () => {
      const result = extractJsonFromText('{"action":"get_time","params":{}}');
      expect(result).toEqual({ action: 'get_time', params: {} });
    });

    it('debe extraer JSON de texto con contenido extra', () => {
      const result = extractJsonFromText('Aquí está el resultado: {"action":"open_app","params":{"app":"Safari"}} fin.');
      expect(result).toEqual({ action: 'open_app', params: { app: 'Safari' } });
    });

    it('debe retornar null para texto sin JSON', () => {
      expect(extractJsonFromText('sin json aquí')).toBeNull();
      expect(extractJsonFromText('')).toBeNull();
    });

    it('debe retornar null para JSON inválido', () => {
      expect(extractJsonFromText('{invalid json}')).toBeNull();
    });
  });

  describe('truncateText', () => {
    it('debe truncar texto largo', () => {
      const result = truncateText('texto muy largo', 8);
      expect(result).toBe('texto...');
      expect(result.length).toBe(8);
    });

    it('debe conservar texto corto', () => {
      expect(truncateText('hola', 10)).toBe('hola');
    });

    it('debe conservar texto exacto', () => {
      expect(truncateText('exacto', 6)).toBe('exacto');
    });
  });

  describe('sanitizeParam', () => {
    it('debe remover caracteres shell peligrosos', () => {
      expect(sanitizeParam('app; rm -rf /')).not.toContain(';');
      expect(sanitizeParam('app & evil')).not.toContain('&');
      expect(sanitizeParam('app | pipe')).not.toContain('|');
    });

    it('debe conservar nombres normales', () => {
      expect(sanitizeParam('Apple Music')).toBe('Apple Music');
      expect(sanitizeParam('Google Chrome')).toBe('Google Chrome');
    });
  });

  describe('formatResponse', () => {
    it('debe retornar estructura de éxito', () => {
      const result = formatResponse({ id: 1 }, 'OK');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(result.message).toBe('OK');
    });
  });

  describe('formatError', () => {
    it('debe retornar estructura de error', () => {
      const result = formatError('Error', 'ERR_CODE');
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Error');
      expect(result.error.code).toBe('ERR_CODE');
    });
  });
});
