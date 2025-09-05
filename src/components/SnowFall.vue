<template>
  <div class="snow">
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
    <div class="snow-star">*</div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue';

let snowflakes = document.querySelectorAll('.snow-star');

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRndFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

setTimeout(() => {
  snowflakes = document.querySelectorAll('.snow-star');
  snowflakes.forEach((snowflake) => {
    snowflake.style.fontSize = getRndFloat(1.4, 2) + 'em';
    snowflake.style.animationDuration = getRndInteger(20, 30) + 's';
    snowflake.style.animationDelay =
      getRndInteger(-1, snowflakes.length / 2) + 's';
  });
}, 10);

onUnmounted(() => clearTimeout());
</script>
