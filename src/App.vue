<template>
  <div
    id="app"
    tabindex="0"
    @paste="onPaste"
    @keyup.ctrl.c.exact="copySelection"
    @keyup.ctrl.x.exact="cutSelection"
    @keyup.ctrl.z.exact="undo"
    @keyup.ctrl.y.exact="redo"
    @keyup.exact="onKeyUp"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
  >
    <tool-bar
      :active-tool="tool"
      :active-color="lineColor"
      :line-thickness="lineWidth"
      @select-tool="onSelectTool"
      @select-color="onSelectColor"
      @select-line-thickness="onSelectLineThickness"
      @download="onDownload"
    />
    <img ref="offscreenImage" class="offscreen" />
    <div ref="canvasContainer" class="canvas-container" :style="canvasContainerStyle" />
    <status-bar v-if="showStatusBar" :value="statusMessage" />
  </div>
</template>

<script>
import {
  TOOL,
  DEFAULT_LINE_COLOR,
  DEFAULT_LINE_WIDTH,
  SELECT_COLOR,
  DEFAULT_CANVAS_SIZE
} from '@/constants'
import { drawArrow, createCanvas } from '@/utils/canvasUtils'
import ToolBar from '@/components/ToolBar.vue'
import StatusBar from '@/components/StatusBar.vue'
import { isUnsupportedDevice } from './utils/detect'

if (isUnsupportedDevice()) {
  alert(
    'There is a chance that you accessed this humble application from a device that is not supported. This application is designed to work with desktop devices.'
  )
}

export default {
  name: 'App',
  components: {
    ToolBar,
    StatusBar
  },
  data() {
    return {
      tool: TOOL.PATH.name,
      mousePressed: false,
      startX: 0,
      startY: 0,
      selection: undefined,
      lineColor: DEFAULT_LINE_COLOR,
      lineWidth: DEFAULT_LINE_WIDTH,
      statusMessage: '',
      canvasStack: [],
      redoCanvasStack: []
    }
  },
  computed: {
    showStatusBar() {
      return this.statusMessage !== ''
    },
    topLayerCtx() {
      if (this.canvasStack.length < 1) {
        return null
      }

      return this.canvasStack[this.canvasStack.length - 1].getContext('2d')
    },
    canvasWidth() {
      return this.topLayerCtx ? this.topLayerCtx.canvas.width : DEFAULT_CANVAS_SIZE.WIDTH
    },
    canvasHeight() {
      return this.topLayerCtx ? this.topLayerCtx.canvas.height : DEFAULT_CANVAS_SIZE.HEIGHT
    },
    canvasContainerStyle() {
      return { width: `${this.canvasWidth}px`, height: `${this.canvasHeight}px` }
    }
  },
  mounted() {
    window.addEventListener('keyup', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        this.onDownload()
      }
    })

    this.pushCanvas(this.canvasWidth, this.canvasHeight, true)
  },
  methods: {
    clearRedoStack() {
      this.redoCanvasStack.forEach((canvas) => {
        canvas.remove()
      })
      this.redoCanvasStack = []
    },
    pushCanvas(width, height, withBackground) {
      this.clearRedoStack()
      const classes = ['canvas']

      if (withBackground) {
        classes.push('background-layer-canvas')
      }

      const canvas = createCanvas({
        width,
        height,
        classes
      })
      this.canvasStack.push(canvas)
      this.$refs.canvasContainer.append(canvas)
    },
    popCanvas() {
      if (this.canvasStack.length < 2) {
        return
      }
      const canvas = this.canvasStack.pop()
      canvas.remove()
    },
    undo() {
      if (this.canvasStack.length < 2) {
        return
      }
      const canvas = this.canvasStack.pop()
      canvas.hidden = true
      this.redoCanvasStack.push(canvas)
    },
    redo() {
      const canvas = this.redoCanvasStack.pop()
      if (canvas) {
        canvas.hidden = false
        this.canvasStack.push(canvas)
      }
    },
    resetSelection() {
      if (this.selection) {
        this.selection = undefined
        this.popCanvas()
      }
    },
    resetLineStyle() {
      this.topLayerCtx.strokeStyle = this.lineColor
      this.topLayerCtx.lineWidth = this.lineWidth
      this.topLayerCtx.setLineDash([])
    },
    onMouseDown(event) {
      this.pushCanvas(this.canvasWidth, this.canvasHeight)
      this.resetSelection()
      this.mousePressed = true
      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY)
      this.startX = x
      this.startY = y

      this.resetLineStyle()

      if (this.tool === 'path') {
        this.topLayerCtx.beginPath()
        this.topLayerCtx.moveTo(x, y)
      }
    },
    onMouseMove(event) {
      if (!this.mousePressed) {
        return
      }
      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY)
      const topLayerCtx = this.topLayerCtx

      const { startX, startY } = this

      switch (this.tool) {
        case 'path':
          topLayerCtx.lineTo(x, y)
          topLayerCtx.stroke()
          break
        case 'line':
          topLayerCtx.clearRect(0, 0, topLayerCtx.canvas.width, topLayerCtx.canvas.height)
          topLayerCtx.beginPath()
          topLayerCtx.moveTo(startX, startY)
          topLayerCtx.lineTo(x, y)
          topLayerCtx.stroke()
          break
        case 'rect':
          topLayerCtx.clearRect(0, 0, topLayerCtx.canvas.width, topLayerCtx.canvas.height)
          topLayerCtx.strokeRect(startX, startY, x - startX, y - startY)
          break
        case 'select':
          topLayerCtx.setLineDash([15, 5])
          topLayerCtx.strokeStyle = SELECT_COLOR
          topLayerCtx.lineWidth = DEFAULT_LINE_WIDTH

          topLayerCtx.clearRect(0, 0, topLayerCtx.canvas.width, topLayerCtx.canvas.height)
          topLayerCtx.strokeRect(startX, startY, x - startX, y - startY)
          break
        case 'arrow':
          topLayerCtx.clearRect(0, 0, topLayerCtx.canvas.width, topLayerCtx.canvas.height)
          drawArrow(topLayerCtx, {
            x: startX,
            y: startY,
            dx: x,
            dy: y,
            color: this.lineColor,
            thickness: this.lineWidth
          })
          break
        default:
          break
      }
    },
    onMouseUp(event) {
      this.mousePressed = false

      const { x, y } = this.toCanvasCoords(event.clientX, event.clientY)
      if (this.tool === 'select') {
        const { startX, startY } = this
        this.selection = { x: startX, y: startY, width: x - startX, height: y - startY }
      }
    },
    copySelection() {
      const selection = this.selection
      if (!selection) {
        return
      }
      const utilityCanvas = createCanvas({
        width: selection.width,
        height: selection.height
      })
      this.canvasStack.forEach((layer, index) => {
        if (index === this.canvasStack.length - 1) {
          // do not draw selection rect
          return
        }
        utilityCanvas
          .getContext('2d')
          .drawImage(
            layer,
            selection.x,
            selection.y,
            selection.width,
            selection.height,
            0,
            0,
            selection.width,
            selection.height
          )
      })
      utilityCanvas.toBlob(
        (blob) => {
          const item = new ClipboardItem({ [blob.type]: blob })
          navigator.clipboard
            .write([item])
            .then(() => this.setStatusMessage('Copied to clipboard', 2))
        },
        'image/png',
        1
      )
    },
    cutSelection() {
      const selection = this.selection
      if (!selection) {
        return
      }

      this.copySelection()

      this.canvasStack.forEach((canvas) => {
        canvas
          .getContext('2d')
          .clearRect(selection.x, selection.y, selection.width, selection.height)
      })
      this.topLayerCtx.clearRect(
        0,
        0,
        this.topLayerCtx.canvas.width,
        this.topLayerCtx.canvas.height
      )
      this.resetSelection()
    },
    onKeyUp(event) {
      switch (event.code) {
        case 'Digit1':
          this.tool = TOOL.LINE.name
          break
        case 'Digit2':
          this.tool = TOOL.PATH.name
          break
        case 'Digit3':
          this.tool = TOOL.RECT.name
          break
        case 'Digit4':
          this.tool = TOOL.ARROW.name
          break
        case 'Digit5':
          this.tool = TOOL.SELECT.name
          break
      }
    },
    setStatusMessage(message, showSeconds) {
      this.statusMessage = message
      window.setTimeout(() => {
        this.statusMessage = ''
      }, showSeconds * 1000)
    },
    onPaste(event) {
      const { offscreenImage } = this.$refs

      const items = (event.clipboardData || event.originalEvent.clipboardData).items
      for (const item of items) {
        if (item.kind === 'file') {
          const blob = item.getAsFile()
          const url = URL.createObjectURL(blob)

          offscreenImage.onload = () => {
            this.pushCanvas(offscreenImage.width, offscreenImage.height)
            this.topLayerCtx.canvas.classList.add('background-layer-canvas')

            this.topLayerCtx.drawImage(offscreenImage, 0, 0)
            URL.revokeObjectURL(url)
          }

          offscreenImage.setAttribute('src', url)
          break
        }
      }
    },
    onDownload() {
      const canvas = createCanvas({
        width: this.topLayerCtx.canvas.width,
        height: this.topLayerCtx.canvas.height
      })
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      this.canvasStack.forEach((layer) => {
        ctx.drawImage(layer, 0, 0)
      })

      const link = document.createElement('a')
      link.download = 'image.png'
      link.href = canvas.toDataURL()
      link.click()
    },
    toCanvasCoords(globalX, globalY) {
      const { x, y } = this.$refs.canvasContainer.getBoundingClientRect()
      return { x: globalX - x, y: globalY - y }
    },
    onSelectTool(tool) {
      this.tool = tool
    },
    onSelectColor(color) {
      this.lineColor = color
    },
    onSelectLineThickness(value) {
      this.lineWidth = value
    }
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.offscreen {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-100%);
}

#app {
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: var(--color-background);
}

.canvas-container {
  position: relative;
  overflow: hidden;
}

.canvas {
  position: absolute;
  left: 0;
  top: 0;
  background-color: transparent;
}

.canvas.background-layer-canvas {
  background-color: var(--color-foreground);
}
</style>
