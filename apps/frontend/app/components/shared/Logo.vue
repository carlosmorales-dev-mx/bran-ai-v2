<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    white?: boolean;
    size?: number;
  }>(),
  {
    white: false,
    size: 1,
  }
);
</script>

<template>
  <div class="logo" :style="{ gap: `${9 * props.size}px` }">
    <div
      class="logo-mark"
      :style="{
        width: `${32 * props.size}px`,
        height: `${32 * props.size}px`,
        borderRadius: `${9 * props.size}px`,
      }"
    >
      <svg
        :width="15 * props.size"
        :height="15 * props.size"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M7 1L12 4V10L7 13L2 10V4L7 1Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M7 5L9.5 6.5V9.5L7 11L4.5 9.5V6.5L7 5Z"
          fill="#b91c3a"
        />
      </svg>
    </div>

    <span
      class="logo-text"
      :class="{ white: props.white }"
      :style="{ fontSize: `${17 * props.size}px` }"
    >
      bran<span>.ai</span>
    </span>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
}

.logo-mark {
  background: var(--crimson);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px var(--crimson-glow);
  flex-shrink: 0;
}

.logo-text {
  font-weight: 700;
  color: var(--tx);
  letter-spacing: -0.02em;
}

.logo-text.white {
  color: white;
}

.logo-text span {
  color: var(--crimson);
}

.logo-text.white span {
  color: rgba(255, 255, 255, 0.72);
}
</style>
