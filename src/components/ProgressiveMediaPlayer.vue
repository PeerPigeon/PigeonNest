<template>
  <div class="progressive-media-player">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="isBuffering" class="buffering-overlay">
      <div class="buffering-spinner"></div>
      <div class="buffering-text">
        Buffering... {{ Math.round(bufferProgress) }}%
        <div class="buffer-bar">
          <div class="buffer-fill" :style="{ width: bufferProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <video
      v-if="isVideo"
      ref="videoElement"
      :controls="controls"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :poster="poster"
      @loadedmetadata="onLoadedMetadata"
      @error="onMediaError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @waiting="onWaiting"
      @playing="onPlaying"
      @canplay="onCanPlay"
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
      @loadedmetadata="onLoadedMetadata"
      @error="onMediaError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @waiting="onWaiting"
      @playing="onPlaying"
      @canplay="onCanPlay"
    >
      Your browser does not support audio playback.
    </audio>

    <div v-else-if="!isBuffering && chunks.length === 0" class="no-media">
      No media loaded
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

interface Props {
  mimeType?: string
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  poster?: string
  expectedSize?: number
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
  buffering: [isBuffering: boolean]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)
const chunks = ref<Uint8Array[]>([])
const objectURL = ref<string | null>(null)
const error = ref<string | null>(null)
const isBuffering = ref(false)
const bufferProgress = ref(0)
const totalBytesReceived = ref(0)
const mediaSourceReady = ref(false)

// Detect media type
const isVideo = computed(() => {
  const mime = props.mimeType || ''
  return mime.startsWith('video/')
})

const isAudio = computed(() => {
  const mime = props.mimeType || ''
  return mime.startsWith('audio/')
})

const mediaElement = computed(() => {
  return isVideo.value ? videoElement.value : audioElement.value
})

// Add chunk to buffer
const addChunk = (chunk: Uint8Array) => {
  chunks.value.push(chunk)
  totalBytesReceived.value += chunk.byteLength
  
  if (props.expectedSize && props.expectedSize > 0) {
    bufferProgress.value = Math.min((totalBytesReceived.value / props.expectedSize) * 100, 100)
  }
  
  // Update media source if ready
  updateMediaSource()
}

// Create blob from chunks and update media
const updateMediaSource = () => {
  if (!mediaElement.value || chunks.value.length === 0) return
  
  try {
    // Create blob from all chunks - Uint8Array is a valid BlobPart
    const blob = new Blob(chunks.value as BlobPart[], { type: props.mimeType })
    
    // Clean up previous URL
    if (objectURL.value) {
      URL.revokeObjectURL(objectURL.value)
    }
    
    // Create new object URL
    const url = URL.createObjectURL(blob)
    objectURL.value = url
    mediaElement.value.src = url
    
    error.value = null
  } catch (err) {
    console.error('Error updating media source:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update media'
    emit('error', error.value)
  }
}

// Finalize stream when all data received
const finalizeStream = () => {
  isBuffering.value = false
  bufferProgress.value = 100
  mediaSourceReady.value = true
  updateMediaSource()
}

// Clear media
const clear = () => {
  chunks.value = []
  totalBytesReceived.value = 0
  bufferProgress.value = 0
  isBuffering.value = false
  mediaSourceReady.value = false
  
  if (objectURL.value) {
    URL.revokeObjectURL(objectURL.value)
    objectURL.value = null
  }
  
  if (mediaElement.value) {
    mediaElement.value.src = ''
  }
}

// Event handlers
const onLoadedMetadata = (event: Event) => {
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

const onWaiting = () => {
  isBuffering.value = true
  emit('buffering', true)
}

const onPlaying = () => {
  isBuffering.value = false
  emit('buffering', false)
}

const onCanPlay = () => {
  isBuffering.value = false
  emit('buffering', false)
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
  addChunk,
  finalizeStream,
  clear,
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
.progressive-media-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

video,
audio {
  width: 100%;
  display: block;
  background: #000;
}

video {
  max-height: 70vh;
}

.buffering-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 10;
  padding: 24px;
  border-radius: 8px;
  min-width: 200px;
}

.buffering-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.buffering-text {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}

.buffer-bar {
  width: 180px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.buffer-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.error-message {
  padding: 16px;
  background: #ff4444;
  color: white;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 8px;
}

.no-media {
  padding: 32px;
  text-align: center;
  color: #999;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
