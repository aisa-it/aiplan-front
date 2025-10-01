import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { paletteLight, paletteDark } from '../palette';

export function usePalette() {
  const $q = useQuasar();

  const palette = computed(() =>
    $q.dark.isActive ? paletteDark : paletteLight,
  );
  const oppositePalette = computed(() =>
    $q.dark.isActive ? paletteLight : paletteDark,
  );

  const oppositePaletteScheme = computed(() => {
    const scheme: Record<string, string> = {};

    oppositePalette.value.forEach((row, i) => {
      row.forEach((el, j) => {
        scheme[el.toUpperCase()] = palette.value[i][j].toUpperCase();
      });
    });

    return scheme;
  });

  const getRandomColorFromPalette = () => {
    return palette.value.flat()[
      Math.floor(Math.random() * palette.value.flat().length)
    ];
  };

  const getCorrectColor = (color: string) => {
    if (!color) return '';

    const rowIndex = palette.value.findIndex((row) => row.includes(color));
    if (rowIndex !== -1) {
      return color;
    }
    return oppositePaletteScheme.value[color.toUpperCase()] ?? color;
  };

  return {
    palette,
    getRandomColorFromPalette,
    getCorrectColor,
  };
}
