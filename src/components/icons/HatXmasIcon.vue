<template>
    <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :width="width"
        :height="height"
        x="0px"
        y="0px"
        viewBox="0 0 512 512"
        style="enable-background:new 0 0 512 512; transform: scale(-1, 1) rotate(-30deg); transform-origin: center;"
        xml:space="preserve"
    >
        <circle style="fill: none;" cx="256" cy="256" r="256"></circle>
        <path style="fill: none;" d="M257.938,511.976c109.156-0.81,202.05-69.925,238.063-166.731L324.48,172.834l-28.584,19.523 L194.603,91.064l-23.074,29.898l5.094,5.094l-16.762,3.681l102.386,102.386l-8.661,10.237l82.172,81.717l-217.367,49.088 L257.938,511.976z"></path>
        <path style="fill: #C92F00;" d="M378.982,319.174C377.668,122.877,189.78,111.052,189.78,111.052h-11.824 c0,0,54.132,127.712-52.031,208.122H378.982L378.982,319.174z"></path>
        <path style="fill: #C92F00;" d="M255.426,127.555v191.619h123.556C378.19,200.975,309.758,149.676,255.426,127.555z"></path>
        <path style="fill: #FFFFFF;" d="M380.295,378.694H131.705c-10.376,0-18.789-8.413-18.789-18.789v-40.469 c0-10.376,8.413-18.789,18.789-18.789h248.591c10.376,0,18.789,8.413,18.789,18.789v40.469 C399.084,370.283,390.672,378.694,380.295,378.694z"></path>
        <path style="fill: #FFFFFF;" d="M380.295,300.647H255.426v78.046h124.869c10.376,0,18.789-8.413,18.789-18.789v-40.469 C399.084,309.06,390.672,300.647,380.295,300.647z"></path>
        <circle style="fill: #FFFFFF;" cx="177.959" cy="111.054" r="26.014"></circle>
    </svg>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
name: 'HatXmasIcon',
props: {
    width: {
    type: Number,
    default: 10,
    },
    height: {
    type: Number,
    default: 10,
    },
},
});
</script>