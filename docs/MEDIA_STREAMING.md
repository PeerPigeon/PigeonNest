# Media Streaming Components

PigeonNest provides two powerful media streaming components that work across all major browsers (Chrome, Firefox, Safari, Edge, Brave).

## Components

### 1. MediaStreamPlayer

A simple, robust media player for complete media files received via P2P streaming.

**Features:**
- Supports video and audio playback
- Cross-browser compatible (uses standard Blob URLs)
- Built-in loading states and error handling
- Configurable controls and autoplay
- Works with any media format supported by the browser

**Usage:**

```vue
<template>
  <MediaStreamPlayer
    :blob="mediaBlob"
    :mimeType="'video/mp4'"
    :controls="true"
    :autoplay="true"
    @loadedmetadata="onMediaLoaded"
    @error="onMediaError"
  />
</template>

<script setup>
import { ref } from 'vue'
import { MediaStreamPlayer } from 'pigeonnest'

const mediaBlob = ref(null)

// Receive media from peer
const receiveMedia = async (streamEvent) => {
  const blob = await receiveStream(streamEvent)
  mediaBlob.value = blob
}
</script>
```

**Props:**
- `blob?: Blob` - Media blob to play
- `src?: string` - Direct media URL (alternative to blob)
- `mimeType?: string` - MIME type of the media
- `controls?: boolean` - Show player controls (default: true)
- `autoplay?: boolean` - Auto-play when loaded (default: false)
- `muted?: boolean` - Mute audio (default: false)
- `loop?: boolean` - Loop playback (default: false)
- `poster?: string` - Poster image URL for video

**Events:**
- `loadedmetadata` - Media metadata loaded
- `error` - Playback error occurred
- `play` - Playback started
- `pause` - Playback paused
- `ended` - Playback ended
- `timeupdate` - Current time updated (returns currentTime, duration)

**Methods (via ref):**
```vue
<script setup>
const player = ref()

player.value.play()
player.value.pause()
player.value.seek(timeInSeconds)
player.value.setVolume(0.5) // 0.0 to 1.0
</script>
```

### 2. ProgressiveMediaPlayer

An advanced player for progressive/chunked streaming, ideal for large media files.

**Features:**
- Supports chunked/progressive streaming
- Real-time buffering progress
- Automatic chunk assembly
- Memory efficient for large files
- Cross-browser compatible

**Usage:**

```vue
<template>
  <ProgressiveMediaPlayer
    ref="player"
    :mimeType="'video/mp4'"
    :expectedSize="fileSize"
    :controls="true"
    :autoplay="true"
    @buffering="onBuffering"
    @error="onError"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ProgressiveMediaPlayer } from 'pigeonnest'

const player = ref()
const fileSize = ref(0)

// Add chunks as they arrive
const handleChunk = (chunk) => {
  player.value.addChunk(chunk)
}

// When all chunks received
const finalize = () => {
  player.value.finalizeStream()
}
</script>
```

**Props:**
- `mimeType?: string` - MIME type of the media
- `controls?: boolean` - Show player controls (default: true)
- `autoplay?: boolean` - Auto-play when loaded (default: false)
- `muted?: boolean` - Mute audio (default: false)
- `loop?: boolean` - Loop playback (default: false)
- `poster?: string` - Poster image URL for video
- `expectedSize?: number` - Expected total size in bytes (for progress calculation)

**Events:**
- `loadedmetadata` - Media metadata loaded
- `error` - Playback error occurred
- `play` - Playback started
- `pause` - Playback paused
- `ended` - Playback ended
- `timeupdate` - Current time updated
- `buffering` - Buffering state changed (returns boolean)

**Methods (via ref):**
```vue
<script setup>
const player = ref()

// Add a chunk of data
player.value.addChunk(uint8Array)

// Finalize stream (call when all chunks received)
player.value.finalizeStream()

// Clear all data and reset
player.value.clear()

// Playback controls
player.value.play()
player.value.pause()
player.value.seek(timeInSeconds)
player.value.setVolume(0.5)
</script>
```

## Complete Example

```vue
<template>
  <div>
    <!-- Simple player for complete files -->
    <MediaStreamPlayer
      v-if="receivedBlob"
      :blob="receivedBlob"
      :mimeType="mimeType"
      :controls="true"
      @error="handleError"
    />

    <!-- Progressive player for streaming -->
    <ProgressiveMediaPlayer
      v-if="isStreaming"
      ref="progressivePlayer"
      :mimeType="streamMimeType"
      :expectedSize="streamSize"
      :controls="true"
      @buffering="isBuffering = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePeerPigeon, usePeerStreaming } from 'pigeonnest'
import { MediaStreamPlayer, ProgressiveMediaPlayer } from 'pigeonnest'

const { mesh, isConnected, init } = usePeerPigeon({
  networkName: 'my-media-network',
  autoConnect: true
})

const { receiveStream } = usePeerStreaming()

const receivedBlob = ref(null)
const mimeType = ref('')
const progressivePlayer = ref()
const isStreaming = ref(false)
const streamMimeType = ref('')
const streamSize = ref(0)

// Initialize connection
await init()

// Setup stream listener
if (mesh.value) {
  mesh.value.addEventListener('streamIncoming', async (event) => {
    // For small files, use simple player
    if (event.metadata.totalSize < 10 * 1024 * 1024) { // < 10MB
      const blob = await receiveStream(event)
      receivedBlob.value = blob
      mimeType.value = event.metadata.mimeType
    } 
    // For large files, use progressive player
    else {
      isStreaming.value = true
      streamMimeType.value = event.metadata.mimeType
      streamSize.value = event.metadata.totalSize
      
      const reader = event.stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        progressivePlayer.value.addChunk(value)
      }
      progressivePlayer.value.finalizeStream()
    }
  })
}
</script>
```

## Browser Compatibility

Both components use standard Web APIs and work in all modern browsers:

| Browser | MediaStreamPlayer | ProgressiveMediaPlayer |
|---------|-------------------|------------------------|
| Chrome  | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari  | ✅ | ✅ |
| Edge    | ✅ | ✅ |
| Brave   | ✅ | ✅ |

**Key Technologies:**
- `Blob` and `URL.createObjectURL()` for media handling
- Standard `<video>` and `<audio>` HTML5 elements
- No MediaSource API dependency (maximum compatibility)

## Supported Media Formats

The components support any format that the browser's native media player supports:

**Video:**
- MP4 (H.264/AAC)
- WebM (VP8/VP9)
- OGG Theora

**Audio:**
- MP3
- WAV
- OGG Vorbis
- WebM Audio
- AAC (in supported containers)

## Performance Tips

1. **Use MediaStreamPlayer** for:
   - Files under 10MB
   - One-time playback scenarios
   - Simple use cases

2. **Use ProgressiveMediaPlayer** for:
   - Files over 10MB
   - Real-time streaming scenarios
   - When you need buffer progress feedback

3. **Memory Management:**
   - Both players automatically clean up object URLs
   - Call `clear()` on ProgressiveMediaPlayer to free memory between uses
   - Limit the number of simultaneous players

## Examples

See the `examples/` directory for complete working examples:
- `media-streaming.html` - Standalone HTML demo
- `src/components/MediaStreamingDemo.vue` - Full Vue 3 demo component

## License

MIT
