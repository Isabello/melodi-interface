import midi from '@/services/token'
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

import { nextTick } from 'vue';


export function initializeInscriptions(inscriptions) {
    const updatedInscriptions = []
  
    inscriptions.forEach((inscription, index) => {
       let newInscription = controlInscriptionAnimation(inscription, false, false);
       newInscription.svg = prepareAnimation(newInscription.svg);
       newInscription.svg = removeIncompatibilityIcons(newInscription.svg);     
       updatedInscriptions[index] = newInscription;
    });
  
    return updatedInscriptions;
  }

export function controlInscriptionAnimation(inscription, playing, inPlace){
    const parser = new DOMParser();
  
    if (!inscription.counter) {
      inscription.counter = 0;    
    } else {
      inscription.counter++;
    }
  
    console.log('counter:', inscription.counter);
  
    const svgElement = parser.parseFromString(inscription.svg, 'image/svg+xml').documentElement;
    const classPrefix = svgElement.querySelector('classPrefix').textContent;
    const uuid = svgElement.querySelector('uuid').textContent;
    console.log('uuid:', uuid)
  
    if (svgElement) {
      const styleTag = svgElement.querySelector('style');
      if (styleTag) {
        const pauseRule = ' [class^="'+classPrefix+'"][class$="_'+uuid+'"] { animation-play-state: paused !important; }';
        if (playing) {
          console.log(`removing pause`)
          styleTag.textContent = styleTag.textContent.split(pauseRule).join('');
        } else if (!styleTag.textContent.includes(pauseRule)) {
          console.log(`adding pause`)
          styleTag.textContent += pauseRule;
        }
      }
    }
  
    const serializer = new XMLSerializer();
    const updatedSVGString = serializer.serializeToString(svgElement);
  
    if (!inPlace) {
      let newInscription = JSON.parse(JSON.stringify(inscription));
      newInscription.svg = updatedSVGString;
      return newInscription;
    } else {
      inscription.svg = updatedSVGString;
      return inscription;
    }    
  }

  export async function playMidi(inscription) {
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(inscription.svg, 'image/svg+xml').documentElement;
    const metadata = svgElement.querySelector('metadata');
    const midiBase64 = metadata.querySelector('midi').querySelector('base64').textContent;
    console.log('midi base64', midiBase64)
    console.log('midi base64', midiBase64)
  
    let tmp = inscription.svg;
    inscription.svg = '';
    // re-render the component
    await nextTick();  
    await nextTick();  
  
    inscription.svg = tmp;  
    // isPlaying.value = true; 
  
    controlInscriptionAnimation(inscription, true, true);   
  
    try {
      await Tone.start();
      // print the bpm
      console.log(`BPM: ${Tone.Transport.bpm.value}`);
      // console.log(`Playing MIDI with hash ${midiHash}`);
  
      // const url = await midi.midiHashToMidiUrl(midiHash);
      const url = midiBase64;
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      const synth = new Tone.Synth().toDestination();
  
      let maxTime = 0;
      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          const time = Tone.now() + note.time + note.duration;
  
          synth.triggerAttackRelease(note.name, note.duration, note.time + Tone.now(), note.velocity);
  
          if (time > maxTime) maxTime = time;
        });
      });
  
      Tone.Transport.scheduleOnce(() => {
        synth.dispose();
        // isPlaying.value = false; // Stop the animation
  
        // console.log(`Synth disposed after playing MIDI. isPlaying is ${isPlaying.value}`);
      }, maxTime);
  
    } catch (error) {
    //   isPlaying.value = false; // Stop the animation
  
      console.error('Error playing MIDI:', error);
    }
  
    // isPlaying.value = false; // Stop the animation
    // // controlInscriptionAnimation(inscription, false, true)
    // console.log(`isPlaying is ${isPlaying.value}`)
  }  

  // export async function playMidi(inscription) {
  //   const parser = new DOMParser();
  //   const svgElement = parser.parseFromString(inscription.svg, 'image/svg+xml').documentElement;
  //   const metadata = svgElement.querySelector('metadata');
  //   const midiBase64 = metadata.querySelector('midi').querySelector('base64').textContent;
  
  //   // Decode MIDI data
  //   const url = midiBase64;
  //   const response = await fetch(url);
  //   const arrayBuffer = await response.arrayBuffer();
  //   const midi = new Midi(arrayBuffer);
  
  //   // Initialize MIDI playback
  //   await Tone.start();
  //   console.log(`BPM: ${Tone.Transport.bpm.value}`);
  
  //   let maxTime = 0;
  
  //   // Play each track with the specified instrument
  //   midi.tracks.forEach(track => {
  //     const instrumentNumber = track.instrument.number;
  //     const sampler = new Tone.Sampler({
  //       urls: {
  //         A1: "A1.mp3", // Replace with correct mappings for your sound library
  //       },
  //       baseUrl: `https://example.com/soundfonts/${instrumentNumber}/`, // Replace with your sound library URL
  //       release: 1,
  //       onload: () => {
  //         track.notes.forEach(note => {
  //           const time = Tone.now() + note.time + note.duration;
  //           sampler.triggerAttackRelease(note.name, note.duration, note.time + Tone.now(), note.velocity);
  
  //           if (time > maxTime) maxTime = time;
  //         });
  //       }
  //     }).toDestination();
  
  //     Tone.Transport.scheduleOnce(() => {
  //       sampler.dispose();
  //     }, maxTime);
  //   });
  
  //   Tone.Transport.start();
  // }
  
  function prepareAnimation(svg) {
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(svg, 'image/svg+xml').documentElement;
    const classPrefix = svgElement.querySelector('classPrefix').textContent;
    console.log(svgElement)
    const initialState = '[class^="'+classPrefix+'"] {animation-iteration-count: infinite !important;}';
    const changedState = '[class^="'+classPrefix+'"]{animation-iteration-count: 1;}';
    const styleTag = svgElement.querySelector('style');
    styleTag.textContent = styleTag.textContent.replace(initialState, changedState);
    const updatedSVGString = new XMLSerializer().serializeToString(svgElement);
    return updatedSVGString;
  }
  
  function removeIncompatibilityIcons(svg) {    
    const parser = new DOMParser();    
    const svgElement = parser.parseFromString(svg, 'image/svg+xml').documentElement;    
    const notSupportedClass = svgElement.querySelector('not-supported-class').textContent
    const incompatibilityIcons = svgElement.querySelectorAll('.' + notSupportedClass);
    incompatibilityIcons.forEach(icon => {
      icon.remove();
    });
    const updatedSVGString = new XMLSerializer().serializeToString(svgElement);
    return updatedSVGString;
  }