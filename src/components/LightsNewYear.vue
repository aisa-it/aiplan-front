<template>
  <ul class="lightrope">
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
  </ul>
  <!--  <div style="margin-bottom: 20px"></div>-->
</template>

<style lang="scss" scoped>
$globe-width: 12px;
$globe-height: 28px;
$globe-spacing: 40px;
$globe-spread: 3px;
$light-off-opacity: 0.4;

body {
  background: #000;
}
.lightrope {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  position: fixed;
  z-index: 101;
  margin: 35px 0 0 0;
  padding: 0;
  pointer-events: none;
  height: 100px;
  width: 100%;
  li {
    position: relative;
    animation-fill-mode: both;
    animation-iteration-count: infinite;
    list-style: none;
    margin: 0;
    padding: 0;
    display: block;
    width: $globe-width;
    height: $globe-height;
    border-radius: 50%;
    margin: calc($globe-spacing/2);
    display: inline-block;
    background: #00f7a5;
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    #00f7a5;
    animation-name: flash-1;
    animation-duration: 4s;
    &:nth-child(2n + 1) {
      background: cyan;
      box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
        cyan;
      animation-name: flash-2;
      animation-duration: 2.4s;
    }
    &:nth-child(4n + 1) {
      background: #f70094;
      box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
        #f70094;
      animation-name: flash-3;
      animation-duration: 3.1s;
    }
    &:nth-child(odd) {
      animation-duration: 3.8s;
    }
    &:nth-child(3n + 1) {
      animation-duration: 3.4s;
    }
    &:before {
      content: '';
      position: absolute;
      background: #4e4e4e;
      width: ($globe-width - 2);
      height: calc($globe-height/3);
      border-radius: 3px;
      top: (0 - calc($globe-height/6));
      left: 1px;
    }
    &:after {
      content: '';
      top: (0 - calc($globe-height/2));
      left: $globe-width - 3;
      position: absolute;
      width: $globe-spacing + 12;
      height: (calc($globe-height/3) * 2);
      border-bottom: solid #4e4e4e 2px;
      border-radius: 50%;
    }
    &:last-child:after {
      content: none;
    }
    &:first-child {
      margin-left: -$globe-spacing;
    }
  }
}
@keyframes flash-1 {
  0%,
  100% {
    background: #00f7a5;
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    rgba(0, 247, 165, 0.2);
  }
  50% {
    background: rgba(0, 247, 165, $light-off-opacity);
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    rgba(0, 247, 165, 0.2);
  }
}
@keyframes flash-2 {
  0%,
  100% {
    background: cyan;
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    cyan;
  }
  50% {
    background: rgba(0, 255, 255, $light-off-opacity);
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    rgba(0, 255, 255, 0.2);
  }
}
@keyframes flash-3 {
  0%,
  100% {
    background: #f70094;
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    #f70094;
  }
  50% {
    background: rgba(247, 0, 148, $light-off-opacity);
    box-shadow: 0px calc($globe-height/6) $globe-width * 2 $globe-spread
    rgba(247, 0, 148, 0.2);
  }
}
</style>
