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
    margin: $globe-spacing/2;
    display: inline-block;
    background: rgb(136, 255, 132, 1);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(136, 255, 132, 0.5);
    animation-name: flash-1;
    animation-duration: 4s;
    &:nth-child(2n + 1) {
      background: rgb(84, 115, 255);
      box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
        rgba(84, 115, 255, 0.5);
      animation-name: flash-2;
      animation-duration: 2.4s;
    }
    &:nth-child(4n + 1) {
      background: rgb(255, 96, 96);
      box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
        rgba(255, 96, 96, 1);
      animation-name: flash-3;
      animation-duration: 3.1s;
    }
    &:nth-child(4n + 2) {
      background: rgb(252, 249, 102);
      box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
        rgba(252, 249, 102, 1);
      animation-name: flash-4;
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
      height: $globe-height/3;
      border-radius: 3px;
      top: (0 - ($globe-height/6));
      left: 1px;
    }
    &:after {
      content: '';
      top: (0 - $globe-height/2);
      left: $globe-width - 3;
      position: absolute;
      width: $globe-spacing + 12;
      height: ($globe-height/3 * 2);
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
    background: rgb(136, 255, 132);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(136, 255, 132, 1);
  }
  50% {
    background: rgba(102, 255, 97, $light-off-opacity);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(94, 255, 88, 0.2);
  }
}
@keyframes flash-2 {
  0%,
  100% {
    background: rgba(84, 115, 255, 1);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(84, 115, 255, 1);
  }
  50% {
    background: rgba(84, 115, 255, $light-off-opacity);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(84, 115, 255, 0.2);
  }
}
@keyframes flash-3 {
  0%,
  100% {
    background: rgba(255, 96, 96, 1);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(255, 96, 96, 1);
  }
  50% {
    background: rgba(255, 96, 96, $light-off-opacity);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(255, 96, 96, 0.2);
  }
}

@keyframes flash-4 {
  0%,
  100% {
    background: rgba(252, 249, 102, 1);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(252, 249, 102, 1);
  }
  50% {
    background: rgba(252, 249, 102, $light-off-opacity);
    box-shadow: 0px $globe-height/6 $globe-width * 2 $globe-spread
      rgba(252, 249, 102, 0.2);
  }
}
</style>
