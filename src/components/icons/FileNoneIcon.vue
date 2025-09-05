<template>
<svg :width="width" :height="height" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 19.1538C5 13.3893 5 10.5071 6.41613 8.45548C6.96675 7.65776 7.65776 6.96675 8.45548 6.41613C10.5071 5 13.3893 5 19.1538 5C32.124 5 38.609 5 43.2252 8.18629C45.02 9.4252 46.5748 10.98 47.8137 12.7748C51 17.391 51 23.876 51 36.8462C51 42.6106 51 45.4929 49.5839 47.5445C49.0332 48.3422 48.3422 49.0332 47.5445 49.5839C45.4929 51 42.6107 51 36.8462 51H21C13.4575 51 9.68629 51 7.34315 48.6569C5 46.3137 5 42.5425 5 35V19.1538Z" fill="#BAC4D5"/>
<path d="M30 5H31C32.8573 5 33.7859 5 34.5688 5.0685C43.2708 5.82983 50.1702 12.7292 50.9315 21.4312C51 22.2141 51 23.1427 51 25H46C38.4575 25 34.6863 25 32.3431 22.6569C30 20.3137 30 16.5425 30 9V5Z" fill="#474A52"/>
</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
name: 'FileNoneIcon',
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
