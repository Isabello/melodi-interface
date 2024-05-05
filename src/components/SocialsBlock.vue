<template>
  <div class="socials">
    <a
        v-for="social in SOCIALS"
        :href="social.url"
        target="_blank"
        class="socials__social"
    >
      <UniversalImage :src="social.icon" class="socials__social-icon" />
    </a>
  </div>
</template>

<script setup>
import { SOCIALS } from '@/const/socials'
</script>

<style scoped lang="sass">
.socials
  display: flex
  flex-wrap: wrap
  align-items: center
  height: 50px

  gap: 14px  

  &__social
    padding: 4px
    border: 2px solid rgba(242, 1, 175, 1)  
    width: 42px
    height: 42px
    display: flex
    align-items: center
    justify-content: center
    color: black
    cursor: pointer !important
    background-color: $mainColor
    transition: all 350ms ease

    &:hover
      filter: brightness(1.1)
      border: 3px solid rgba(242, 1, 175, 1)

    &-icon
      height: 26px
      width: 26px

      

  @media screen and (max-width: $breakpointMobile)
    gap: 8px
    justify-content: flex-end

    &__social
      &-icon
        height: 22px
        width: 22px
</style>