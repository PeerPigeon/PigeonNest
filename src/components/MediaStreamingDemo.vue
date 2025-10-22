<template>
  <div class="media-streaming-demo">
    <h1>Media Streaming Demo</h1>

    <!-- Connection Section -->
    <section class="demo-section">
      <h2>Connection</h2>
      <div class="connection-controls">
        <input 
          v-model="peerId" 
          placeholder="Your Peer ID (optional)"
          :disabled="isConnected"
        />
        <input 
          v-model="networkName" 
          placeholder="Network Name"
          :disabled="isConnected"
        />
        <button @click="connect" :disabled="isConnected">
          Connect
        </button>
        <button @click="disconnect" :disabled="!isConnected">
          Disconnect
        </button>
      </div>
      
      <div v-if="mesh && isConnected" class="connection-status">
        <div>Connected</div>
        <div>Connected Peers: <strong>{{ connectedPeers.length }}</strong></div>
        <div v-if="connectedPeers.length > 0">
          Peers: {{ connectedPeers.join(', ') }}
        </div>
      </div>
    </section>

    <!-- Send Media Section -->
    <section class="demo-section">
      <h2>Send Media</h2>
      <div class="send-controls">
        <input 
          type="file" 
          ref="fileInput"
          accept="video/*,audio/*"
          @change="onFileSelected"
          :disabled="!isConnected"
        />
        <input 
          v-model="targetPeerId" 
          placeholder="Target Peer ID"
          :disabled="!isConnected"
        />
        <button 
          @click="sendMedia" 
          :disabled="!canSend"
        >
          Send Media
        </button>
      </div>

      <div v-if="selectedFile" class="file-info">
        Selected: {{ selectedFile.name }} ({{ formatSize(selectedFile.size) }})
      </div>
    </section>

    <!-- Stream Progress -->
    <section v-if="activeStreams.size > 0" class="demo-section">
      <h2>Active Transfers</h2>
      <stream-container 
        :streams="Array.from(activeStreams.values())"
        @cancel="cancelStream"
        @dismiss="dismissStream"
        @download="downloadStream"
      />
    </section>

    <!-- Media Player - Simple (for complete files) -->
    <section v-if="receivedMediaBlob" class="demo-section">
      <h2>Received Media (Simple Player)</h2>
      <media-stream-player
        ref="simplePlayer"
        :blob="receivedMediaBlob"
        :mimeType="receivedMimeType"
        :controls="true"
        :autoplay="true"
        @loadedmetadata="onMediaLoaded"
        @error="onMediaError"
        @play="onMediaPlay"
        @pause="onMediaPause"
      />
      
      <div class="player-controls">
        <button @click="simplePlayer?.play()">Play</button>
        <button @click="simplePlayer?.pause()">Pause</button>
        <button @click="simplePlayer?.seek(0)">Restart</button>
        <button @click="downloadReceivedMedia">Download</button>
      </div>
    </section>

    <!-- Media Player - Progressive (for streaming) -->
    <section v-if="useProgressivePlayer" class="demo-section">
      <h2>Streaming Media (Progressive Player)</h2>
      <progressive-media-player
        ref="progressivePlayer"
        :mimeType="streamingMimeType"
        :controls="true"
        :autoplay="true"
        :expectedSize="streamingExpectedSize"
        @loadedmetadata="onProgressiveMediaLoaded"
        @error="onProgressiveMediaError"
        @buffering="onBuffering"
      />
      
      <div v-if="isBuffering" class="buffering-info">
        Buffering...
      </div>
    </section>

    <!-- Instructions -->
    <section class="demo-section instructions">
      <h2>Instructions</h2>
      <ol>
        <li>Open this demo in two browser windows/tabs</li>
        <li>Connect both with the same network name but different peer IDs</li>
        <li>Wait for peers to connect (you'll see connected count increase)</li>
        <li>Select a video/audio file in one window</li>
        <li>Enter the other peer's ID and click "Send Media"</li>
        <li>Watch the media stream and play automatically in the receiving window</li>
      </ol>
      
      <div class="compatibility">
        <strong>✅ Works in:</strong> Chrome, Firefox, Safari, Edge, Brave
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { usePeerPigeon } from '../composables/usePeerPigeon'
import { usePeerStreaming } from '../composables/usePeerStreaming'
import MediaStreamPlayer from './MediaStreamPlayer.vue'
import ProgressiveMediaPlayer from './ProgressiveMediaPlayer.vue'
import StreamContainer from './StreamContainer.vue'
import type { StreamEvent } from '../types'

// Connection state
const peerId = ref('')
const networkName = ref('media-demo')
const targetPeerId = ref('')
const connectedPeers = ref<string[]>([])

// Media state
const selectedFile = ref<File | null>(null)
const receivedMediaBlob = ref<Blob | null>(null)
const receivedMimeType = ref('')
const useProgressivePlayer = ref(false)
const streamingMimeType = ref('')
const streamingExpectedSize = ref(0)
const isBuffering = ref(false)

// Refs
const fileInput = ref<HTMLInputElement>()
const simplePlayer = ref()
const progressivePlayer = ref()

// Composables - Initialize with options from inputs
const peerOptions = computed(() => ({
  peerId: peerId.value || undefined,
  networkName: networkName.value,
  autoConnect: true,
  autoDiscovery: true
}))

const { mesh, isConnected, init: initMesh, disconnect: disconnectMesh } = usePeerPigeon(peerOptions.value)
const { activeStreams, sendFile, receiveStream, cancelStream: cancelStreamFn } = usePeerStreaming()

// Computed
const canSend = computed(() => 
  isConnected.value && selectedFile.value && targetPeerId.value.trim()
)

// Methods
const connect = async () => {
  try {
    await initMesh()
  } catch (error) {
    console.error('Connection error:', error)
    alert('Failed to connect: ' + (error as Error).message)
  }
}

const disconnect = async () => {
  await disconnectMesh()
  connectedPeers.value = []
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const sendMedia = async () => {
  if (!mesh.value || !selectedFile.value || !targetPeerId.value) return

  try {
    await sendFile(mesh.value, targetPeerId.value, selectedFile.value)
    alert('Media sent successfully!')
  } catch (error) {
    console.error('Send error:', error)
    alert('Failed to send: ' + (error as Error).message)
  }
}

const cancelStream = (streamId: string) => {
  cancelStreamFn(streamId)
}

const dismissStream = (streamId: string) => {
  activeStreams.value.delete(streamId)
}

const downloadStream = (stream: any) => {
  if (stream.receivedBlob) {
    downloadBlob(stream.receivedBlob, stream.filename)
  }
}

const downloadReceivedMedia = () => {
  if (receivedMediaBlob.value) {
    const filename = 'received-media' + getFileExtension(receivedMimeType.value)
    downloadBlob(receivedMediaBlob.value, filename)
  }
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.oga',
    'audio/webm': '.weba'
  }
  return extensions[mimeType] || ''
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// Event handlers
const onMediaLoaded = (event: Event) => {
  console.log('Media loaded:', event)
}

const onMediaError = (error: string) => {
  console.error('Media error:', error)
  alert('Media playback error: ' + error)
}

const onMediaPlay = () => {
  console.log('Media playing')
}

const onMediaPause = () => {
  console.log('Media paused')
}

const onProgressiveMediaLoaded = (event: Event) => {
  console.log('Progressive media loaded:', event)
}

const onProgressiveMediaError = (error: string) => {
  console.error('Progressive media error:', error)
}

const onBuffering = (buffering: boolean) => {
  isBuffering.value = buffering
}

// Setup mesh event listeners
const setupMeshListeners = () => {
  if (!mesh.value) return

  mesh.value.addEventListener('peerConnected', (event: any) => {
    if (!connectedPeers.value.includes(event.peerId)) {
      connectedPeers.value.push(event.peerId)
    }
  })

  mesh.value.addEventListener('peerDisconnected', (event: any) => {
    connectedPeers.value = connectedPeers.value.filter(id => id !== event.peerId)
  })

  mesh.value.addEventListener('streamIncoming', async (event: StreamEvent) => {
    console.log('Incoming stream:', event)
    
    try {
      // Use simple player for complete file reception
      const blob = await receiveStream(event)
      receivedMediaBlob.value = blob
      receivedMimeType.value = event.metadata.mimeType
      
      // Clear progressive player if it was in use
      useProgressivePlayer.value = false
    } catch (error) {
      console.error('Error receiving stream:', error)
      alert('Failed to receive media: ' + (error as Error).message)
    }
  })
}

onMounted(() => {
  // Setup mesh listeners when mesh is available
  if (mesh.value) {
    setupMeshListeners()
  }
})

onBeforeUnmount(() => {
  disconnect()
})
</script>

<style scoped>
.media-streaming-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #444;
  font-size: 1.3rem;
}

.connection-controls,
.send-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.connection-controls input,
.send-controls input {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-status {
  margin-top: 16px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 4px;
  font-size: 14px;
}

.connection-status div {
  margin: 4px 0;
}

.file-info {
  margin-top: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.player-controls {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.player-controls button {
  flex: 1;
}

.buffering-info {
  margin-top: 12px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
  text-align: center;
  color: #856404;
}

.instructions {
  background: #f8f9ff;
}

.instructions ol {
  margin: 16px 0;
  padding-left: 24px;
  line-height: 1.8;
}

.instructions li {
  margin: 8px 0;
}

.compatibility {
  margin-top: 16px;
  padding: 12px;
  background: #d4edda;
  border-radius: 4px;
  color: #155724;
}
</style>
