# Quick Start Guide

Get started with PigeonNest in 5 minutes!

## Prerequisites

- Node.js 18+ or a modern browser
- Basic understanding of Vue 3
- A PeerPigeon signaling server (or use the default)

## Installation

```bash
npm install pigeonnest vue peerpigeon
```

## 1. Basic Connection

Create a simple peer-to-peer connection:

```vue
<template>
  <div>
    <button @click="initialize">Initialize</button>
    <button @click="connect" :disabled="!isInitialized">Connect</button>
    <p>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
    <p>Peers: {{ connectedPeerIds.length }}</p>
  </div>
</template>

<script setup>
import { usePeerPigeon } from 'pigeonnest'

const {
  isConnected,
  isInitialized,
  connectedPeerIds,
  init,
  connect
} = usePeerPigeon({
  networkName: 'my-app'
})

const initialize = async () => {
  await init()
}

const connectHub = async () => {
  await connect('ws://localhost:3000')
}
</script>
```

## 2. File Sharing

Add file upload and download capabilities:

```vue
<template>
  <div>
    <FileUpload 
      :target-peer-id="selectedPeer"
      @upload="handleUpload"
    />
    
    <StreamProgress 
      v-for="stream in activeStreams" 
      :key="stream.streamId"
      :stream="stream"
    />
  </div>
</template>

<script setup>
import { usePeerPigeon, usePeerStreaming, FileUpload, StreamProgress } from 'pigeonnest'
import { computed } from 'vue'

const { mesh } = usePeerPigeon()
const { activeStreams, sendFile, receiveStream } = usePeerStreaming()

const selectedPeer = ref('peer-id-here')

const handleUpload = async (files) => {
  for (const file of files) {
    await sendFile(mesh.value, selectedPeer.value, file)
  }
}

const activeStreamsArray = computed(() => 
  Array.from(activeStreams.value.values())
)

// Auto-download received files
if (mesh.value) {
  mesh.value.addEventListener('streamReceived', async (event) => {
    const blob = await receiveStream(event)
    
    // Download the file
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = event.metadata.filename
    a.click()
    URL.revokeObjectURL(url)
  })
}
</script>
```

## 3. Distributed Storage

Store and retrieve data across the peer network:

```vue
<template>
  <div>
    <input v-model="key" placeholder="Key">
    <input v-model="value" placeholder="Value">
    <button @click="save">Save</button>
    <button @click="load">Load</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePeerPigeon, usePeerStorage } from 'pigeonnest'

const { mesh } = usePeerPigeon()
const { set, get } = usePeerStorage()

const key = ref('')
const value = ref('')

const save = async () => {
  await set(mesh.value, key.value, value.value)
}

const load = async () => {
  const data = await get(mesh.value, key.value)
  value.value = data
}
</script>
```

## 4. Complete Application

Put it all together with the full component suite:

```vue
<template>
  <div class="app">
    <h1>My P2P App</h1>
    
    <!-- Configuration -->
    <HubUrlInput v-model="hubUrl" />
    <NetworkNameInput v-model="networkName" />
    
    <button @click="initialize">Initialize</button>
    <button @click="connectToHub">Connect</button>
    
    <!-- Status Display -->
    <PeerConnectionStatus 
      :status="status" 
      :is-connected="isConnected"
    />
    
    <!-- Peer Management -->
    <PeerList 
      :peers="connectedPeerIds"
      @select="selectedPeer = $event"
    />
    
    <PeerSelector
      v-model="selectedPeer"
      :peers="connectedPeerIds"
    />
    
    <!-- File Transfer -->
    <FileUpload 
      :target-peer-id="selectedPeer"
      @upload="handleUpload"
    />
    
    <!-- Active Transfers -->
    <StreamProgress 
      v-for="stream in activeStreamsArray" 
      :key="stream.streamId"
      :stream="stream"
      @cancel="cancelStream"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  usePeerPigeon, 
  usePeerStreaming,
  PeerConnectionStatus,
  PeerList,
  PeerSelector,
  FileUpload,
  StreamProgress,
  HubUrlInput,
  NetworkNameInput
} from 'pigeonnest'

const hubUrl = ref('ws://localhost:3000')
const networkName = ref('my-app')
const selectedPeer = ref(null)

const {
  mesh,
  status,
  isConnected,
  connectedPeerIds,
  init,
  connect
} = usePeerPigeon()

const {
  activeStreams,
  sendFile,
  receiveStream,
  cancelStream
} = usePeerStreaming()

const initialize = async () => {
  await init()
  
  // Handle incoming files
  if (mesh.value) {
    mesh.value.addEventListener('streamReceived', async (event) => {
      const blob = await receiveStream(event)
      
      // Auto-download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = event.metadata.filename
      a.click()
      URL.revokeObjectURL(url)
    })
  }
}

const connectToHub = async () => {
  await connect(hubUrl.value)
}

const handleUpload = async (files) => {
  for (const file of files) {
    await sendFile(mesh.value, selectedPeer.value, file)
  }
}

const activeStreamsArray = computed(() => 
  Array.from(activeStreams.value.values())
)
</script>
```

## Running the Examples

1. **Start a signaling server:**
   ```bash
   npx peerpigeon hub
   ```

2. **Open the examples:**
   ```bash
   npm run dev
   ```

3. **Navigate to:**
   - http://localhost:5173/examples/demo.html
   - http://localhost:5173/examples/complete-demo.html

4. **Open in multiple browser tabs** to test peer connections

## Common Patterns

### Send Messages

```javascript
await mesh.value.sendMessage(peerId, 'Hello!')
await mesh.value.broadcast('Hello everyone!')
```

### Listen for Events

```javascript
mesh.value.addEventListener('peerConnected', (event) => {
  console.log('Peer connected:', event.peerId)
})

mesh.value.addEventListener('message', (event) => {
  console.log('Message:', event.data)
})
```

### Stream Large Files

```javascript
// Send
await sendFile(mesh.value, peerId, file)

// Receive
mesh.value.addEventListener('streamReceived', async (event) => {
  const blob = await receiveStream(event)
  // Process blob...
})
```

### Store Data

```javascript
// Save
await set(mesh.value, 'myKey', { data: 'value' })

// Load
const data = await get(mesh.value, 'myKey')

// List all keys
const keys = await list(mesh.value)
```

## Next Steps

- Explore the [complete API documentation](README.md)
- Try the [interactive examples](examples/)
- Read about [PeerPigeon concepts](https://github.com/PeerPigeon/PeerPigeon)
- Build your own peer-to-peer application!

## Troubleshooting

**Can't connect to peers?**
- Ensure signaling server is running
- Check firewall settings
- Try a different network name

**Files not transferring?**
- Verify peer is selected
- Check both peers are connected
- Look for errors in console

**Storage not working?**
- Ensure mesh is initialized
- Check if storage is enabled
- Verify network connectivity

For more help, see [GitHub Issues](https://github.com/PeerPigeon/PigeonNest/issues).
