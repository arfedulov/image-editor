<template>
  <div class="status-bar">
    {{value}}
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
    value: {
      type: String,
      default: '',
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/theme.scss';

.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 2.5vh;
  width: 100vw;
  font-size: 1.5vh;
  display: flex;
  align-items: center;
  padding-left: .5vh;

  background-color: $color-background-secondary;
}
</style>
