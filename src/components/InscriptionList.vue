<template>
  <div class="inscription-list">
    <div     
    v-for="inscription in newInscriptions"         
    @click="onItemClick(inscription)">

      <div v-html="inscription.svg" class="inscription-list__item-icon"></div>

      <div class="inscription-list__item-info">
        <div class="inscription-list__item-title">
          {{ inscription.seed.isDynamic ? 'Dynamic Midi' : 'Stable Midi' }}<br>
          # <NumberText>{{ inscription.seed.seed }}</NumberText>
        </div>

        <a :href="`https://basescan.org/address/${inscription.seed.owner}`" 
          target="_blank"
          class="inscription-list__item-description" 
          @click.stop
        >{{ inscription.seed.owner }}</a>

        <BaseButton @click.stop="playMidi(inscription);" style="width:120px; padding:5px 0px 5px 0px ; margin: 4px auto">Play</BaseButton>
      </div>
    </div>

    <template v-if="isLoading">
      <div v-for="_ in 4" class="inscription-list__item --loading">
        <UniversalImage src="/images/midi/midilogo.svg" class="inscription-list__item-icon" />

        <div class="inscription-list__item-info">
          <div class="inscription-list__item-title">Midi</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useLayoutStore } from '@/stores'
import { initializeInscriptions, playMidi } from '@/utils/controlDynamic'
import BaseButton from './BaseButton.vue';
// For Audio play


const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },

  inscriptions: {
    type: Array,
    required: true,
  },
})

const layoutStore = useLayoutStore()

function onItemClick(item) {
  layoutStore.openModal('Info', { item })
}

// const isPlaying = ref(false);

const newInscriptions = ref([]);

watch(props.inscriptions, (newVal) => {
  console.dir(`Inscriptions updated: ${newVal}`, { depth: null })
  let _newInscriptions = initializeInscriptions(newVal);
  newInscriptions.value = _newInscriptions;
}, {
  deep: true,
  immediate: true
});

</script>

<style scoped lang="sass">
.inscription-list
  display: grid
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr
  grid-gap: 24px

  &__item
    position: relative
    display: flex
    flex-direction: column
    cursor: pointer
    width: 100%
    overflow: hidden
    background-color: $mainColor
    border: 1px solid $borderColor
    transition: transform 350ms ease
    animation: fadeIn 350ms ease

    &:hover
      transform: scale(1.02)

    &-icon
      height: auto
      width: 100%
      object-fit: cover
      position: relative

    &-info
      padding: 16px
      display: flex
      flex-direction: column
      gap: 8px      

    &-title
      font-weight: 500
      font-size: 17px
      color: #06e3b3


    &-description
      color: #4b9e8c
      word-break: break-all
      font-size: 13px

    &.--loading
      &:after
        content: ''
        position: absolute
        width: 100%
        height: 100%
        top: 0
        left: 0
        background-color: $mainColor

      &:hover
        transform: none

      .inscription-list__item-icon
        width: 100%
        height: 100%

  @media screen and (max-width: $breakpointTablet)
    grid-template-columns: 1fr 1fr 1fr

  @media screen and (max-width: $breakpointMobile)
    grid-template-columns: 1fr 1fr
    grid-gap: 16px

    &__item
      &-description
        font-size: 14px
</style>