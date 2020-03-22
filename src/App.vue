<template>
  <div id="app" @paste="onPaste" tabindex="0" @keyup="onKeyUp" @mouseup="onMouseUp" @mousedown="onMouseDown" @mousemove="onMouseMove">
    <tool-bar
      :active-tool="tool"
      :active-color="lineColor"
      :line-thickness="lineWidth"
      @select-tool="onSelectTool"
      @select-color="onSelectColor"
      @select-line-thickness="onSelectLineThickness"
    />
    <img ref="offscreenImage" class="offscreen" />
    <div class="canvas-container">
      <canvas ref="hiddenLayerCanvas" class="hidden-layer-canvas" :width="canvasWidth" :height="canvasHeight" />
      <canvas ref="mainCanvas" class="main-canvas" :width="canvasWidth" :height="canvasHeight" />
    </div>
    <status-bar v-if="status !== ''" :value="status" />
  </div>
</template>

<script>
import { TOOLS, DEFAULT_LINE_COLOR, DEFAULT_LINE_WIDTH, SELECT_COLOR, KEYBOARD_NUMBER_TO_TOOL_MAP } from '@/constants';
import { drawArrow, createCanvas } from '@/utils/canvasUtils';
import ToolBar from '@/components/ToolBar.vue';
import StatusBar from '@/components/StatusBar.vue';

export default {
  name: 'App',
  components: {
    ToolBar,
    StatusBar,
  },
  data() {
    return {
      canvasWidth: 900,
      canvasHeight: 600,

      mainCtx: null,
      hiddenLayerCtx: null,

      tool: TOOLS.PATH,

      mousePressed: false,
      startX: 0,
      startY: 0,
      selection: undefined,

      lineColor: DEFAULT_LINE_COLOR,
      lineWidth: DEFAULT_LINE_WIDTH,

      status: '',
    };
  },
  mounted() {
    this.mainCtx = this.$refs.mainCanvas.getContext('2d');
    this.hiddenLayerCtx = this.$refs.hiddenLayerCanvas.getContext('2d');
  },
  methods: {
    resetSelection() {
      this.selection = undefined;
    },
    resetLineStyle() {
      this.hiddenLayerCtx.strokeStyle = this.lineColor;
      this.hiddenLayerCtx.lineWidth = this.lineWidth;
      this.hiddenLayerCtx.setLineDash([]);
    },
    onMouseDown(event) {
      this.resetSelection();
      this.mousePressed = true;
      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY);
      this.startX = x;
      this.startY = y;

      this.resetLineStyle();

      if (this.tool === 'path') {
        this.hiddenLayerCtx.beginPath();
        this.hiddenLayerCtx.moveTo(x, y);
      }
    },
    onMouseMove(event) {
      if (!this.mousePressed) {
        return;
      }
      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY);
      const hiddenLayerCtx = this.hiddenLayerCtx;

      const { startX, startY } = this;

      switch (this.tool) {
        case 'path':
          hiddenLayerCtx.lineTo(x, y);
          hiddenLayerCtx.stroke();
          break;
        case 'line':
          hiddenLayerCtx.clearRect(0, 0, hiddenLayerCtx.canvas.width, hiddenLayerCtx.canvas.height);
          hiddenLayerCtx.beginPath();
          hiddenLayerCtx.moveTo(startX, startY);
          hiddenLayerCtx.lineTo(x, y);
          hiddenLayerCtx.stroke();
          break;
        case 'rect':
          hiddenLayerCtx.clearRect(0, 0, hiddenLayerCtx.canvas.width, hiddenLayerCtx.canvas.height);
          hiddenLayerCtx.strokeRect(startX, startY, x - startX, y - startY);
          break;
        case 'select':
          hiddenLayerCtx.setLineDash([15, 5]);
          hiddenLayerCtx.strokeStyle = SELECT_COLOR;
          hiddenLayerCtx.lineWidth = DEFAULT_LINE_WIDTH;

          hiddenLayerCtx.clearRect(0, 0, hiddenLayerCtx.canvas.width, hiddenLayerCtx.canvas.height);
          hiddenLayerCtx.strokeRect(startX, startY, x - startX, y - startY);
          break;
        case 'arrow':
          hiddenLayerCtx.clearRect(0, 0, hiddenLayerCtx.canvas.width, hiddenLayerCtx.canvas.height);
          drawArrow(hiddenLayerCtx, {
            x: startX, y: startY,
            dx: x, dy: y,
            color: this.lineColor,
            thickness: this.lineWidth,
          });
          break;
        default:
          break;
      }
    },
    onMouseUp(event) {
      this.mousePressed = false;

      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY);
      if (this.tool === 'select') {
        const { startX, startY } = this;
        this.selection = { x: startX, y: startY, width: x - startX, height: y - startY };
        return;
      }

      const {
        mainCtx,
        hiddenLayerCtx,
      } = this;

      mainCtx.drawImage(hiddenLayerCtx.canvas, 0, 0);
      hiddenLayerCtx.clearRect(0, 0, hiddenLayerCtx.canvas.width, hiddenLayerCtx.canvas.height);
    },
    onKeyUp(event) {
      if ((event.code === 'KeyX' || event.code === 'KeyC') && event.ctrlKey) {
        const selection = this.selection;
        if (!selection) {
          return;
        }
        const canvas = createCanvas({
          width: selection.width,
          height: selection.height,
        });
        canvas.getContext('2d').drawImage(
          this.$refs.mainCanvas,
          selection.x, selection.y, selection.width, selection.height,
          0, 0, selection.width, selection.height,
        );
        canvas.toBlob((blob) => {
          // eslint-disable-next-line no-undef
          const item = new ClipboardItem({ [blob.type]: blob });
          navigator.clipboard.write([item])
            .then(() => this.onCopy());
        }, 'image/png', 1);

        if (event.code === 'KeyX') {
          this.mainCtx.clearRect(selection.x, selection.y, selection.width, selection.height);
          this.hiddenLayerCtx.clearRect(0, 0, this.hiddenLayerCtx.canvas.width, this.hiddenLayerCtx.canvas.height);
          this.resetSelection();
        }
      }

      switch (event.code) {
        case 'Digit1':
          this.tool = TOOLS[KEYBOARD_NUMBER_TO_TOOL_MAP[1]];
          break;
        case 'Digit2':
          this.tool = TOOLS[KEYBOARD_NUMBER_TO_TOOL_MAP[2]];
          break;
        case 'Digit3':
          this.tool = TOOLS[KEYBOARD_NUMBER_TO_TOOL_MAP[3]];
          break;
        case 'Digit4':
          this.tool = TOOLS[KEYBOARD_NUMBER_TO_TOOL_MAP[4]];
          break;
        case 'Digit5':
          this.tool = TOOLS[KEYBOARD_NUMBER_TO_TOOL_MAP[5]];
          break;
      }
    },
    onCopy() {
      this.setStatus('Copied to clipboard', 2);
    },
    setStatus(message, showSeconds) {
      this.status = message;
      window.setTimeout(() => this.status = '', showSeconds * 1000);
    },
    onPaste(event) {
      const {
        offscreenImage,
        hiddenLayerCanvas,
        mainCanvas,
      } = this.$refs;
      const mainCtx = this.mainCtx;

      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          const url = URL.createObjectURL(blob);

          offscreenImage.onload = () => {
            mainCanvas.width = offscreenImage.width;
            mainCanvas.height = offscreenImage.height;
            hiddenLayerCanvas.width = offscreenImage.width;
            hiddenLayerCanvas.height = offscreenImage.height;

            mainCtx.drawImage(offscreenImage, 0, 0);
            URL.revokeObjectURL(url);
          };

          offscreenImage.setAttribute('src', url);
          break;
        }
      }
    },
    toCanvasCoords(globalX, globalY) {
      const { x, y } = this.$refs.mainCanvas.getBoundingClientRect();
      return { x: globalX - x, y: globalY - y };
    },
    onSelectTool(tool) {
      this.tool = tool;
    },
    onSelectColor(color) {
      this.lineColor = color;
    },
    onSelectLineThickness(value) {
      this.lineWidth = value;
    },
  },
}
</script>

<style lang="scss">
@import './assets/theme.scss';

html, body {
  margin: 0;
  padding: 0;
}

.offscreen {
  position: absolute;
  top: 0;
  left:0;
  transform: translateY(-100%);
}

#app {
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: $color-background;
}

.canvas-container {
  position: relative;
}

.main-canvas {
  background-color: $color-foreground;
}

.hidden-layer-canvas {
  position: absolute;
  left: 0;
  top: 0;
  background-color: transparent;
}
</style>
