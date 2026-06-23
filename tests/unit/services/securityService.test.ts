import { securityService } from '../../../src/service/securityService.js';

describe('securityService', () => {
  describe('isCommandAllowed', () => {
    it('debe permitir acciones válidas', () => {
      expect(securityService.isCommandAllowed({ action: 'get_time', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'search_web', params: { query: 'test' } })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'volume_up', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'general_question', params: {} })).toBe(true);
    });

    it('debe permitir las nuevas acciones de música', () => {
      expect(securityService.isCommandAllowed({ action: 'stop_music', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'get_current_track', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'next_track', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'previous_track', params: {} })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'play_song', params: { song: 'Bohemian Rhapsody' } })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'play_artist', params: { artist: 'Queen' } })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'play_playlist', params: { playlist: 'Favoritas' } })).toBe(true);
    });

    it('debe rechazar acciones no reconocidas', () => {
      expect(securityService.isCommandAllowed({ action: 'rm_rf', params: {} })).toBe(false);
      expect(securityService.isCommandAllowed({ action: 'execute_shell', params: {} })).toBe(false);
    });

    it('debe rechazar open_app con aplicaciones no seguras', () => {
      expect(securityService.isCommandAllowed({ action: 'open_app', params: { app: 'bash' } })).toBe(false);
      expect(securityService.isCommandAllowed({ action: 'open_app', params: { app: 'rm' } })).toBe(false);
    });

    it('debe permitir open_app con aplicaciones seguras', () => {
      expect(securityService.isCommandAllowed({ action: 'open_app', params: { app: 'Safari' } })).toBe(true);
      expect(securityService.isCommandAllowed({ action: 'open_app', params: { app: 'Notes' } })).toBe(true);
    });
  });

  describe('containsDangerousPattern', () => {
    it('debe detectar patrones peligrosos', () => {
      expect(securityService.containsDangerousPattern('rm -rf /')).toBe(true);
      expect(securityService.containsDangerousPattern('sudo rm -rf')).toBe(true);
    });

    it('debe retornar false para texto normal', () => {
      expect(securityService.containsDangerousPattern('abre Apple Music')).toBe(false);
      expect(securityService.containsDangerousPattern('¿qué hora es?')).toBe(false);
    });
  });

  describe('sanitizeUserInput', () => {
    it('debe remover caracteres peligrosos', () => {
      expect(securityService.sanitizeUserInput('<script>alert(1)</script>')).not.toContain('<');
      expect(securityService.sanitizeUserInput('<script>alert(1)</script>')).not.toContain('>');
    });

    it('debe truncar texto muy largo', () => {
      const longText = 'a'.repeat(1000);
      expect(securityService.sanitizeUserInput(longText).length).toBeLessThanOrEqual(500);
    });

    it('debe conservar texto normal', () => {
      expect(securityService.sanitizeUserInput('abre Apple Music')).toBe('abre Apple Music');
    });
  });
});
