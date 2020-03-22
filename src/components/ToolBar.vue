<template>
  <div class="tool-bar">
    <div class="tools">
      <div
        v-for="tool of tools"
        class="tool-button"
        :class="{selected: activeTool === tool.name}"
        :key="tool.name"
        :name="tool.name"
        @click="selectTool(tool.name)"
      >
        {{tool.keyboardKey}} {{tool.name}}
      </div>
    </div>
    <div class="color-controls">
      <div
        v-for="color of colors"
        :key="color"
        class="color-control"
        :class="{selected: color === activeColor}"
        :style="{backgroundColor: color}"
        @click="selectColor(color)"
      />
    </div>
    <div class="thickness-controls">
      <div class="thicknes-button" :class="{selected: lineThickness === 1}" @click="selectLineThickness(1)">1.0x</div>
      <div class="thicknes-button" :class="{selected: lineThickness === 2.5}" @click="selectLineThickness(2.5)">2.5x</div>
      <div class="thicknes-button" :class="{selected: lineThickness === 5}" @click="selectLineThickness(5)">5.0x</div>
    </div>
    <div class="info">
      Use keyboard: Ctrl + C | Ctrl + X | Ctrl + V
    </div>
  </div>
</template>

<script>
import { TOOLS, TOOL_TO_KEYBOARD_NUMBER_MAP, COLORS } from '@/constants';

export default {
  name: 'ToolBar',
  props: {
    activeTool: {
      type: String,
      required: true,
    },
    activeColor: {
      type: String,
      required: true,
    },
    lineThickness: {
      type: Number,
      required: true,
    },
  },
  computed: {
    tools() {
      const tools = [];
      Object.keys(TOOLS).forEach((toolKey) => {
        tools.push({ name: TOOLS[toolKey], keyboardKey: TOOL_TO_KEYBOARD_NUMBER_MAP[toolKey] });
      });
      tools.sort((a, b) => a.keyboardKey - b.keyboardKey);
      return tools;
    },
    colors() {
      return [...COLORS];
    },
  },
  methods: {
    selectTool(toolName) {
      this.$emit('select-tool', toolName);
    },
    selectColor(color) {
      this.$emit('select-color', color);
    },
    selectLineThickness(value) {
      this.$emit('select-line-thickness', value);
    }
  },
}
</script>

<style lang="scss" scoped>
@import '../assets/theme.scss';

.tool-bar {
  position: fixed;
  width: 100vw;
  height: 6vh;
  top: 0;
  left: 0;
  z-index: 10;

  display: flex;

  font-size: 2vh;

  background-color: $color-background-secondary;
}

.tools {
  display: flex;
  width: fit-content;
  height: 100%;
}

.tool-button {
  width: 5em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: .15em solid $color-base-dark;
  color: $color-base-dark;
  background-color: $color-foreground;
  border-radius: .3em;
  cursor: pointer;

  font-family: Arial, sans-serif;

  margin: 0.3em;

  &.selected {
    border-color: $color-base-dark;
    background-color: $color-base-dark;
    color: $color-foreground;
  }
}

.color-controls {
  display: flex;
}

.color-control {
  width: 3em;
  border-radius: .3em;
  border: .15em solid transparent;
  cursor: pointer;

  margin: 0.3em;

  &.selected {
    border-color: $color-base-dark;
  }
}

.thickness-controls {
  display: flex;
}

.thicknes-button {
  width: 3em;
  border: .15em solid $color-base-dark;
  border-radius: .3em;
  cursor: pointer;
  margin: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  &.selected {
    border-color: $color-base-dark;
    background-color: $color-base-dark;
    color: $color-foreground;
  }
}

.info {
  font-size: .8em;
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 2em 0 auto;
}
</style>
