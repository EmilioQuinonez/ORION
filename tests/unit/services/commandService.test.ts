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

const makeWeatherJson = (overrides: {
  temp?: string; feelsLike?: string; condition?: string;
  rainChances?: number[]; city?: string; country?: string;
  forecast?: Array<{ min: string; max: string; rainChances: number[]; condition: string }>;
} = {}) => {
  const hourly = (chances: number[], cond: string) =>
    chances.map(r => ({ chanceofrain: String(r), weatherDesc: [{ value: cond }] }));

  const forecastDays = overrides.forecast ?? [
    { min: '15', max: '25', rainChances: overrides.rainChances ?? [10, 20], condition: overrides.condition ?? 'Sunny' },
    { min: '14', max: '23', rainChances: [40, 60], condition: 'Rainy' },
    { min: '13', max: '21', rainChances: [5, 10],  condition: 'Cloudy' },
  ];

  return JSON.stringify({
    current_condition: [{
      temp_C: overrides.temp ?? '21',
      FeelsLikeC: overrides.feelsLike ?? '19',
      weatherDesc: [{ value: overrides.condition ?? 'Partly cloudy' }],
    }],
    weather: forecastDays.map(d => ({
      maxtempC: d.max,
      mintempC: d.min,
      hourly: hourly(d.rainChances, d.condition),
    })),
    nearest_area: [{
      areaName: [{ value: overrides.city ?? 'Querétaro' }],
      country: [{ value: overrides.country ?? 'Mexico' }],
    }],
  });
};

describe('commandService — clima', () => {
  beforeEach(() => {
    mockExecFile.mockReset();
    mockExecFile.mockResolvedValue({ stdout: '', stderr: '' });
  });

  describe('get_weather', () => {
    it('retorna clima actual con ubicación, condición, temperatura y lluvia', async () => {
      queueStdout(makeWeatherJson({ temp: '22', feelsLike: '20', condition: 'Sunny', rainChances: [5, 10, 5, 5, 5, 5, 5, 5] }));
      const result = await commandService.execute('get_weather', {});
      expect(result).toContain('Querétaro, Mexico');
      expect(result).toContain('Sunny');
      expect(result).toContain('22°C');
      expect(result).toContain('20°C');
      expect(result).toContain('Probabilidad de lluvia hoy: 10%');
    });

    it('calcula la probabilidad de lluvia máxima del día', async () => {
      queueStdout(makeWeatherJson({ rainChances: [10, 80, 30, 5, 5, 5, 5, 5] }));
      const result = await commandService.execute('get_weather', {});
      expect(result).toContain('Probabilidad de lluvia hoy: 80%');
    });

    it('acepta ciudad como parámetro', async () => {
      queueStdout(makeWeatherJson({ city: 'Monterrey' }));
      const result = await commandService.execute('get_weather', { city: 'Monterrey' });
      expect(result).toContain('Monterrey');
      const callArgs = mockExecFile.mock.calls[0] as unknown[][];
      expect((callArgs[1] as string[]).join(' ')).toContain('Monterrey');
    });

    it('retorna error si curl falla', async () => {
      mockExecFile.mockRejectedValueOnce(new Error('network error'));
      await expect(commandService.execute('get_weather', {})).rejects.toThrow();
    });
  });

  describe('get_forecast', () => {
    it('retorna pronóstico de mañana por defecto', async () => {
      queueStdout(makeWeatherJson());
      const result = await commandService.execute('get_forecast', {});
      expect(result).toContain('Mañana');
      expect(result).toContain('14°C mín');
      expect(result).toContain('23°C máx');
      expect(result).toContain('Probabilidad de lluvia: 60%');
    });

    it('retorna pronóstico de hoy con day=hoy', async () => {
      queueStdout(makeWeatherJson());
      const result = await commandService.execute('get_forecast', { day: 'hoy' });
      expect(result).toContain('Hoy');
      expect(result).toContain('15°C mín');
      expect(result).toContain('25°C máx');
    });

    it('retorna pronóstico de pasado mañana', async () => {
      queueStdout(makeWeatherJson());
      const result = await commandService.execute('get_forecast', { day: 'pasado mañana' });
      expect(result).toContain('Pasado mañana');
      expect(result).toContain('13°C mín');
      expect(result).toContain('21°C máx');
    });

    it('incluye la ciudad en la respuesta', async () => {
      queueStdout(makeWeatherJson({ city: 'Guadalajara' }));
      const result = await commandService.execute('get_forecast', { day: 'mañana', city: 'Guadalajara' });
      expect(result).toContain('Guadalajara');
    });

    it('incluye la condición del clima del día', async () => {
      queueStdout(makeWeatherJson());
      const result = await commandService.execute('get_forecast', { day: 'mañana' });
      expect(result).toContain('Rainy');
    });
  });
});
