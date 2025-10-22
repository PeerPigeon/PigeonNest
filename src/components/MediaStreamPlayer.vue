<template>
  <div class="media-stream-player">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading media... {{ loadingProgress }}%</div>
    </div>

    <video
      v-if="isVideo"
      ref="videoElement"
      :controls="controls"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :poster="poster"
      :class="{ 'hidden': isLoading }"
      @loadedmetadata="onLoadedMetadata"
      @error="onMediaError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
    >
      Your browser does not support video playback.
    </video>

    <audio
      v-else-if="isAudio"
      ref="audioElement"
      :controls="controls"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :class="{ 'hidden': isLoading }"
      @loadedmetadata="onLoadedMetadata"
      @error="onMediaError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
    >
      Your browser does not support audio playback.
    </audio>

    <div v-else-if="!isLoading" class="unsupported-media">
      <p>Media type not supported for streaming</p>
      <p style="font-size: 12px; margin-top: 8px;">
        MIME type: {{ props.mimeType || props.blob?.type || 'none' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'

interface Props {
  blob?: Blob | null
  src?: string
  mimeType?: string
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  poster?: string
}

const props = withDefaults(defineProps<Props>(), {
  controls: true,
  autoplay: false,
  muted: false,
  loop: false
})

const emit = defineEmits<{
  loadedmetadata: [event: Event]
  error: [error: string]
  play: []
  pause: []
  ended: []
  timeupdate: [currentTime: number, duration: number]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)
const objectURL = ref<string | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)
const loadingProgress = ref(0)

// Detect media type
const isVideo = computed(() => {
  const mime = props.mimeType || props.blob?.type || ''
  console.log('MediaStreamPlayer - Detecting media type:', mime, 'isVideo:', mime.startsWith('video/'))
  return mime.startsWith('video/')
})

const isAudio = computed(() => {
  const mime = props.mimeType || props.blob?.type || ''
  console.log('MediaStreamPlayer - Detecting media type:', mime, 'isAudio:', mime.startsWith('audio/'))
  return mime.startsWith('audio/')
})

const mediaElement = computed(() => {
  return isVideo.value ? videoElement.value : audioElement.value
})

// Create object URL from blob
const createMediaSource = async (blob: Blob) => {
  try {
    // Clean up previous object URL
    if (objectURL.value) {
      URL.revokeObjectURL(objectURL.value)
      objectURL.value = null
    }

    error.value = null
    isLoading.value = true
    loadingProgress.value = 0

    // Ensure blob has correct MIME type
    let finalBlob = blob
    if (props.mimeType && (!blob.type || blob.type === 'application/octet-stream')) {
      console.log('MediaStreamPlayer - Fixing blob MIME type from', blob.type, 'to', props.mimeType)
      finalBlob = new Blob([blob], { type: props.mimeType })
    }

    // Create object URL - works in all browsers
    const url = URL.createObjectURL(finalBlob)
    objectURL.value = url
    console.log('MediaStreamPlayer - Created object URL:', url, 'for blob type:', finalBlob.type)

    // Wait for DOM to update with the video/audio element
    await nextTick()
    
    console.log('MediaStreamPlayer - After nextTick, mediaElement:', mediaElement.value ? 'exists' : 'null')
    console.log('MediaStreamPlayer - isVideo:', isVideo.value, 'isAudio:', isAudio.value)
    console.log('MediaStreamPlayer - videoElement:', videoElement.value ? 'exists' : 'null')
    console.log('MediaStreamPlayer - audioElement:', audioElement.value ? 'exists' : 'null')

    // Set the source
    if (mediaElement.value) {
      console.log('MediaStreamPlayer - Setting src on media element')
      mediaElement.value.src = url
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        loadingProgress.value = Math.min(loadingProgress.value + 10, 90)
      }, 100)

      const handleCanPlay = () => {
        console.log('MediaStreamPlayer - canplay event fired')
        loadingProgress.value = 100
        isLoading.value = false
        clearInterval(progressInterval)
        mediaElement.value?.removeEventListener('canplay', handleCanPlay)
      }

      const handleLoadedData = () => {
        console.log('MediaStreamPlayer - loadeddata event fired')
        loadingProgress.value = 100
        isLoading.value = false
        clearInterval(progressInterval)
        mediaElement.value?.removeEventListener('loadeddata', handleLoadedData)
      }

      mediaElement.value.addEventListener('canplay', handleCanPlay)
      mediaElement.value.addEventListener('loadeddata', handleLoadedData)
      
      // Force load
      mediaElement.value.load()
      console.log('MediaStreamPlayer - Called load() on media element')

      // Clear loading state after timeout
      setTimeout(() => {
        clearInterval(progressInterval)
        if (isLoading.value) {
          console.log('MediaStreamPlayer - Timeout reached, clearing loading state')
          loadingProgress.value = 100
          isLoading.value = false
        }
      }, 2000)
    }
  } catch (err) {
    console.error('Error creating media source:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load media'
    isLoading.value = false
    emit('error', error.value)
  }
}

// Watch for blob changes
watch(() => props.blob, (newBlob) => {
  console.log('MediaStreamPlayer - Blob changed:', newBlob ? `${newBlob.size} bytes, type: ${newBlob.type}` : 'null')
  if (newBlob) {
    createMediaSource(newBlob)
  }
}, { immediate: true })

// Watch for src changes
watch(() => props.src, (newSrc) => {
  if (newSrc && mediaElement.value) {
    // Clean up object URL if exists
    if (objectURL.value) {
      URL.revokeObjectURL(objectURL.value)
      objectURL.value = null
    }
    
    error.value = null
    isLoading.value = true
    mediaElement.value.src = newSrc
  }
}, { immediate: true })

// Event handlers
const onLoadedMetadata = (event: Event) => {
  isLoading.value = false
  emit('loadedmetadata', event)
}

const onMediaError = (event: Event) => {
  const target = event.target as HTMLMediaElement
  let errorMessage = 'Unknown media error'
  
  if (target.error) {
    switch (target.error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        errorMessage = 'Media playback aborted'
        break
      case MediaError.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error while loading media'
        break
      case MediaError.MEDIA_ERR_DECODE:
        errorMessage = 'Media decoding error'
        break
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Media format not supported'
        break
    }
  }
  
  error.value = errorMessage
  isLoading.value = false
  emit('error', errorMessage)
}

const onPlay = () => {
  emit('play')
}

const onPause = () => {
  emit('pause')
}

const onEnded = () => {
  emit('ended')
}

const onTimeUpdate = (event: Event) => {
  const target = event.target as HTMLMediaElement
  emit('timeupdate', target.currentTime, target.duration)
}

// Public methods
const play = async () => {
  if (mediaElement.value) {
    try {
      await mediaElement.value.play()
    } catch (err) {
      console.error('Play error:', err)
      error.value = 'Failed to play media'
    }
  }
}

const pause = () => {
  if (mediaElement.value) {
    mediaElement.value.pause()
  }
}

const seek = (time: number) => {
  if (mediaElement.value) {
    mediaElement.value.currentTime = time
  }
}

const setVolume = (volume: number) => {
  if (mediaElement.value) {
    mediaElement.value.volume = Math.max(0, Math.min(1, volume))
  }
}

defineExpose({
  play,
  pause,
  seek,
  setVolume,
  mediaElement
})

// Cleanup
onBeforeUnmount(() => {
  if (objectURL.value) {
    URL.revokeObjectURL(objectURL.value)
    objectURL.value = null
  }
})
</script>

<style scoped>
.media-stream-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}

video,
audio {
  width: 100%;
  display: block;
  background: #000;
}

video {
  max-height: 70vh;
  min-height: 200px;
}

.hidden {
  display: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 10;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
}

.error-message {
  padding: 16px;
  background: #ff4444;
  color: white;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 8px;
}

.unsupported-media {
  padding: 32px;
  text-align: center;
  color: #999;
}
</style>
