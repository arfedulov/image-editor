<template>
  <div class="status-bar">
    {{ value }}
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
    value: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 2.5vh;
  width: 100vw;
  font-size: 1.5vh;
  display: flex;
  align-items: center;
  padding-left: 0.5vh;

  background-color: var(--color-background-secondary);
}
</style>
