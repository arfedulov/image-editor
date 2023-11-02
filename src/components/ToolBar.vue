<template>
  <div class="toolbar-wrap">
    <div class="tool-bar">
      <div class="toolbar-button-group">
        <div
          v-for="tool of tools"
          class="toolbar-button"
          :class="{ selected: activeTool === tool.name }"
          :key="tool.name"
          @click="selectTool(tool.name)"
        >
          {{ tool.numKey }} {{ tool.name }}
        </div>
      </div>
      <div class="toolbar-button-group">
        <div
          v-for="color of colors"
          :key="color"
          class="toolbar-button color-control"
          :class="{ selected: color === activeColor }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        />
      </div>
      <div class="toolbar-button-group">
        <div
          class="toolbar-button"
          :class="{ selected: lineThickness === 1 }"
          @click="selectLineThickness(1)"
        >
          1.0x
        </div>
        <div
          class="toolbar-button"
          :class="{ selected: lineThickness === 2.5 }"
          @click="selectLineThickness(2.5)"
        >
          2.5x
        </div>
        <div
          class="toolbar-button"
          :class="{ selected: lineThickness === 5 }"
          @click="selectLineThickness(5)"
        >
          5.0x
        </div>
      </div>
      <div class="toolbar-button-group">
        <button class="toolbar-button" @click="$emit('download')">Download</button>
      </div>
    </div>
    <div class="info">
      Use keyboard: Ctrl + C | Ctrl + X | Ctrl + V | Ctrl + Z | Ctrl + Y | Ctrl + Shift + S
    </div>
  </div>
</template>

<script>
import { TOOL, COLORS } from '@/constants'

export default {
  name: 'ToolBar',
  props: {
    activeTool: {
      type: String,
      required: true
    },
    activeColor: {
      type: String,
      required: true
    },
    lineThickness: {
      type: Number,
      required: true
    }
  },
  computed: {
    tools() {
      return Object.values(TOOL)
    },
    colors() {
      return [...COLORS]
    }
  },
  methods: {
    selectTool(toolName) {
      this.$emit('select-tool', toolName)
    },
    selectColor(color) {
      this.$emit('select-color', color)
    },
    selectLineThickness(value) {
      this.$emit('select-line-thickness', value)
    }
  }
}
</script>

<style scoped>
.toolbar-wrap {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: var(--color-background-secondary);
}
.tool-bar {
  height: 6vh;
  padding: 4px;
  display: flex;
  gap: 0.4em;
  align-items: center;
  justify-content: space-between;
  font-size: 2vh;
}
.info {
  height: 6vh;
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.6vh;
}

.toolbar-button-group {
  display: flex;
  height: 100%;
  gap: 0.4em;
}

.toolbar-button {
  box-sizing: border-box;
  padding: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.15em solid var(--color-base-dark);
  color: var(--color-base-dark);
  background-color: var(--color-foreground);
  border-radius: 0.3em;
  cursor: pointer;
  white-space: nowrap;
  font-size: inherit;
  font-family: Arial, sans-serif;
}
.toolbar-button.selected {
  border-color: var(--color-base-dark);
  background-color: var(--color-base-dark);
  color: var(--color-foreground);
}

.color-control {
  width: 3em;
  border: 0.3em solid transparent;
}
</style>
