<template>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      :viewBox="viewBox" 
      :width="width" 
      :height="height" 
      :fill="color">
      <path d="M64 224H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H64c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
    </svg>
  </template>
  
  <script>
  export default {
    name: 'IconMinus',
    props: {
      width: {
        type: [String, Number],
        default: 24
      },
      height: {
        type: [String, Number],
        default: 24
      },
      color: {
        type: String,
        default: '#A6A6A6'
      },
      viewBox: {
        type: String,
        default: '0 0 448 512'
      }
    }
  };
  </script>
  