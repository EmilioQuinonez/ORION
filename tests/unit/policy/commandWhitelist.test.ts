import { isAllowedAction, isSafeApp, ALLOWED_ACTIONS } from '../../../src/policy/commandWhitelist.js';

describe('commandWhitelist', () => {
  describe('isAllowedAction', () => {
    it('debe permitir acciones válidas', () => {
      expect(isAllowedAction('get_time')).toBe(true);
      expect(isAllowedAction('open_app')).toBe(true);
      expect(isAllowedAction('search_web')).toBe(true);
      expect(isAllowedAction('general_question')).toBe(true);
    });

    it('debe rechazar acciones no reconocidas', () => {
      expect(isAllowedAction('delete_all')).toBe(false);
      expect(isAllowedAction('rm_rf')).toBe(false);
      expect(isAllowedAction('')).toBe(false);
      expect(isAllowedAction('sudo_exec')).toBe(false);
    });

    it('debe tener al menos 27 acciones permitidas', () => {
      expect(ALLOWED_ACTIONS.size).toBeGreaterThanOrEqual(27);
    });
  });

  describe('acciones de música', () => {
    it('debe permitir todas las acciones de control de música', () => {
      expect(isAllowedAction('play_music')).toBe(true);
      expect(isAllowedAction('stop_music')).toBe(true);
      expect(isAllowedAction('get_current_track')).toBe(true);
      expect(isAllowedAction('next_track')).toBe(true);
      expect(isAllowedAction('previous_track')).toBe(true);
      expect(isAllowedAction('play_song')).toBe(true);
      expect(isAllowedAction('play_artist')).toBe(true);
      expect(isAllowedAction('play_playlist')).toBe(true);
    });
  });

  describe('isSafeApp', () => {
    it('debe permitir aplicaciones conocidas', () => {
      expect(isSafeApp('Apple Music')).toBe(true);
      expect(isSafeApp('Safari')).toBe(true);
      expect(isSafeApp('Terminal')).toBe(true);
      expect(isSafeApp('Notes')).toBe(true);
    });

    it('debe rechazar aplicaciones no reconocidas', () => {
      expect(isSafeApp('rm')).toBe(false);
      expect(isSafeApp('bash')).toBe(false);
      expect(isSafeApp('')).toBe(false);
    });
  });
});
