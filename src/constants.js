export const DEFAULT_LINE_WIDTH = 1;

export const SELECT_COLOR = '#EB6F09';

export const TOOLS = {
  LINE: 'line',
  PATH: 'path',
  RECT: 'rect',
  ARROW: 'arrow',
  SELECT: 'select',
};

export const TOOL_TO_KEYBOARD_NUMBER_MAP = Object.keys(TOOLS).reduce((acc, key, index) => {
  acc[key] = index + 1;
  return acc;
}, {});

export const KEYBOARD_NUMBER_TO_TOOL_MAP = Object.keys(TOOLS).reduce((acc, key, index) => {
  acc[index + 1] = key;
  return acc;
}, {});

export const COLORS = [
  '#E3310E',
  '#D2DB1F',
  '#9808D1',
];

export const DEFAULT_LINE_COLOR = COLORS[0];

export const DEFAULT_CANVAS_SIZE = {
  WIDTH: 900,
  HEIGHT: 600,
};
