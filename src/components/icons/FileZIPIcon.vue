<template>
<svg :width="width" :height="height" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 21C5 13.4575 5 9.68629 7.34315 7.34315C9.68629 5 13.4575 5 21 5H35C42.5425 5 46.3137 5 48.6569 7.34315C51 9.68629 51 13.4575 51 21V35C51 42.5425 51 46.3137 48.6569 48.6569C46.3137 51 42.5425 51 35 51H21C13.4575 51 9.68629 51 7.34315 48.6569C5 46.3137 5 42.5425 5 35V21Z" fill="#BAC4D5"/>
<path d="M23 6.5C23 5.67157 23.6716 5 24.5 5H26.5C27.3284 5 28 5.67157 28 6.5V10H24.6C23.7163 10 23 9.28366 23 8.4V6.5Z" fill="#474A52"/>
<path d="M28 10H31.5C32.3284 10 33 10.6716 33 11.5V13.5C33 14.3284 32.3284 15 31.5 15H28V10Z" fill="#474A52"/>
<path d="M23 16.5C23 15.6716 23.6716 15 24.5 15H28V20H24.5C23.6716 20 23 19.3284 23 18.5V16.5Z" fill="#474A52"/>
<path d="M28 20H31.5C32.3284 20 33 20.6716 33 21.5V23.5C33 24.3284 32.3284 25 31.5 25H28V20Z" fill="#474A52"/>
<path d="M23 26.5C23 25.6716 23.6716 25 24.5 25H28V30H24.5C23.6716 30 23 29.3284 23 28.5V26.5Z" fill="#474A52"/>
<path d="M28 30H31.5C32.3284 30 33 30.6716 33 31.5V33.5C33 34.3284 32.3284 35 31.5 35H29.5C28.6716 35 28 34.3284 28 33.5V30Z" fill="#474A52"/>
</svg>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
name: 'FileZipIcon',
props: {
    width: {
    type: Number,
    required: false,
    default: () => 24,
    },
    height: {
    type: Number,
    required: false,
    default: () => 24,
    },
},
});
</script>
