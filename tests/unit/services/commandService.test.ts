import { jest } from '@jest/globals';
import { CommandError } from '../../../src/util/errors.js';

const mockExecFile = jest.fn<() => Promise<{ stdout: string; stderr: string }>>();

jest.unstable_mockModule('child_process', () => ({
  execFile: Object.assign(jest.fn(), {
    [Symbol.for('nodejs.util.promisify.custom')]: mockExecFile,
  }),
}));

let commandService: Awaited<typeof import('../../../src/service/commandService.js')>['commandService'];

beforeAll(async () => {
  const mod = await import('../../../src/service/commandService.js');
  commandService = mod.commandService;
});

function queueStdout(...values: (string | Error)[]) {
  for (const v of values) {
    if (v instanceof Error) {
      mockExecFile.mockRejectedValueOnce(v);
    } else {
      mockExecFile.mockResolvedValueOnce({ stdout: v, stderr: '' });
    }
  }
}

describe('commandService — acciones de música', () => {
  beforeEach(() => {
    mockExecFile.mockReset();
    mockExecFile.mockResolvedValue({ stdout: '', stderr: '' });
  });

  describe('stop_music', () => {
    it('pausa la música y retorna mensaje', async () => {
      const result = await commandService.execute('stop_music', {});
      expect(result).toBe('Música pausada');
      expect(mockExecFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('play_music', () => {
    it('retorna el nombre de la canción activa', async () => {
      queueStdout('', 'Bohemian Rhapsody de Queen');
      const result = await commandService.execute('play_music', {});
      expect(result).toBe('Reproduciendo "Bohemian Rhapsody de Queen"');
    });

    it('retorna mensaje genérico si no hay canción activa', async () => {
      queueStdout('', new Error('not playing'));
      const result = await commandService.execute('play_music', {});
      expect(result).toBe('Reproduciendo música en Apple Music');
    });
  });

  describe('get_current_track', () => {
    it('retorna la canción que se está reproduciendo', async () => {
      queueStdout('Shape of You de Ed Sheeran');
      const result = await commandService.execute('get_current_track', {});
      expect(result).toBe('Shape of You de Ed Sheeran');
    });

    it('retorna mensaje cuando no hay música', async () => {
      queueStdout('No hay música reproduciéndose');
      const result = await commandService.execute('get_current_track', {});
      expect(result).toBe('No hay música reproduciéndose');
    });
  });

  describe('next_track', () => {
    it('avanza a la siguiente canción y retorna el título', async () => {
      queueStdout('', 'Stairway to Heaven de Led Zeppelin');
      const result = await commandService.execute('next_track', {});
      expect(result).toBe('Siguiente canción: "Stairway to Heaven de Led Zeppelin"');
    });

    it('retorna mensaje genérico si getCurrentTrack falla', async () => {
      queueStdout('', new Error('no music'));
      const result = await commandService.execute('next_track', {});
      expect(result).toBe('Siguiente canción');
    });
  });

  describe('previous_track', () => {
    it('vuelve a la canción anterior y retorna el título', async () => {
      queueStdout('', 'Hotel California de Eagles');
      const result = await commandService.execute('previous_track', {});
      expect(result).toBe('Canción anterior: "Hotel California de Eagles"');
    });

    it('retorna mensaje genérico si getCurrentTrack falla', async () => {
      queueStdout('', new Error('no music'));
      const result = await commandService.execute('previous_track', {});
      expect(result).toBe('Canción anterior');
    });
  });

  describe('play_song', () => {
    it('lanza CommandError si no se proporciona canción', async () => {
      await expect(commandService.execute('play_song', {})).rejects.toThrow(CommandError);
    });

    it('lanza CommandError si la canción es cadena vacía', async () => {
      await expect(
        commandService.execute('play_song', { song: '' }),
      ).rejects.toThrow('Nombre de canción requerido');
    });

    it('busca y reproduce la canción, retorna el título activo', async () => {
      queueStdout('', 'Bohemian Rhapsody de Queen');
      const result = await commandService.execute('play_song', { song: 'Bohemian Rhapsody' });
      expect(result).toBe('Reproduciendo "Bohemian Rhapsody de Queen"');
    });

    it('retorna el nombre buscado si getCurrentTrack falla', async () => {
      queueStdout('', new Error('not playing'));
      const result = await commandService.execute('play_song', { song: 'Bohemian Rhapsody' });
      expect(result).toBe('Reproduciendo "Bohemian Rhapsody"');
    });
  });

  describe('play_artist', () => {
    it('lanza CommandError si no se proporciona artista', async () => {
      await expect(commandService.execute('play_artist', {})).rejects.toThrow(CommandError);
    });

    it('lanza CommandError si el artista es cadena vacía', async () => {
      await expect(
        commandService.execute('play_artist', { artist: '' }),
      ).rejects.toThrow('Nombre de artista requerido');
    });

    it('reproduce el artista en shuffle y retorna el título activo', async () => {
      queueStdout('', 'Despacito de Luis Fonsi');
      const result = await commandService.execute('play_artist', { artist: 'Luis Fonsi' });
      expect(result).toContain('"Luis Fonsi"');
      expect(result).toContain('shuffle');
      expect(result).toContain('Despacito de Luis Fonsi');
    });

    it('retorna mensaje de shuffle sin título si getCurrentTrack falla', async () => {
      queueStdout('', new Error('no track'));
      const result = await commandService.execute('play_artist', { artist: 'Bad Bunny' });
      expect(result).toBe('Reproduciendo canciones de "Bad Bunny" en shuffle');
    });
  });

  describe('play_playlist', () => {
    it('lanza CommandError si no se proporciona playlist', async () => {
      await expect(commandService.execute('play_playlist', {})).rejects.toThrow(CommandError);
    });

    it('lanza CommandError si la playlist es cadena vacía', async () => {
      await expect(
        commandService.execute('play_playlist', { playlist: '' }),
      ).rejects.toThrow('Nombre de playlist requerido');
    });

    it('reproduce la playlist y retorna la canción actual', async () => {
      queueStdout('', 'Levitating de Dua Lipa');
      const result = await commandService.execute('play_playlist', { playlist: 'Favoritas' });
      expect(result).toBe('Reproduciendo "Levitating de Dua Lipa" de la playlist "Favoritas"');
    });

    it('retorna nombre de playlist si getCurrentTrack falla', async () => {
      queueStdout('', new Error('no track'));
      const result = await commandService.execute('play_playlist', { playlist: 'Favoritas' });
      expect(result).toBe('Reproduciendo playlist "Favoritas"');
    });
  });
});
