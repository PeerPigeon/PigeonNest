# 🐦 PigeonNest

A comprehensive Vue 3 component library and framework for building peer-to-peer applications with PeerPigeon.

[![npm version](https://img.shields.io/npm/v/pigeonnest.svg)](https://www.npmjs.com/package/pigeonnest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

PigeonNest provides Vue 3 composables and components that make it easy to build WebRTC-based peer-to-peer applications using the PeerPigeon protocol. It offers:

- 🎯 **Ready-to-use Vue Components** - Drop-in UI components for peer connections, file transfers, and status displays
- 🔧 **Powerful Composables** - Vue 3 composables for mesh networking, streaming (PigeonFS), and distributed storage
- 📦 **TypeScript Support** - Full TypeScript definitions for type safety
- 🎨 **Customizable** - Easy to style and extend
- 📡 **Real-time** - Built on WebRTC for true peer-to-peer communication

## Features

### Core Composables

- **usePeerPigeon** - Main mesh network management
- **usePeerStreaming** - File and data streaming (PigeonFS with readable/writable streams)
- **usePeerStorage** - Distributed storage across the mesh

### UI Components

- **PeerConnectionStatus** - Display connection status and network information
- **PeerList** - List and manage connected peers
- **FileUpload** - Drag-and-drop file upload with multi-file support
- **StreamProgress** - Real-time progress tracking for file transfers

## Installation

```bash
npm install pigeonnest vue peerpigeon
```

## Quick Start

### Basic Setup

```vue
<template>
  <div>
    <PeerConnectionStatus :status="status" :is-connected="isConnected" />
    <button @click="initialize">Initialize</button>
    <button @click="connect">Connect</button>
    <PeerList :peers="connectedPeerIds" @select="handlePeerSelect" />
  </div>
</template>

<script setup>
import { usePeerPigeon, PeerConnectionStatus, PeerList } from 'pigeonnest'

const {
  status,
  isConnected,
  connectedPeerIds,
  init,
  connect
} = usePeerPigeon({
  networkName: 'my-app',
  maxPeers: 5
})

const initialize = async () => {
  await init()
}

const connectToHub = async () => {
  await connect('ws://localhost:3000')
}

const handlePeerSelect = (peerId) => {
  console.log('Selected peer:', peerId)
}
</script>
```

### File Streaming (PigeonFS)

```vue
<template>
  <div>
    <FileUpload @upload="handleUpload" :target-peer-id="selectedPeer" />
    
    <StreamProgress 
      v-for="stream in activeStreamsArray" 
      :key="stream.streamId"
      :stream="stream"
      @cancel="cancelStream"
    />
  </div>
</template>

<script setup>
import { usePeerPigeon, usePeerStreaming, FileUpload, StreamProgress } from 'pigeonnest'
import { computed } from 'vue'

const { mesh } = usePeerPigeon()
const { 
  activeStreams, 
  sendFile, 
  receiveStream,
  cancelStream 
} = usePeerStreaming()

const selectedPeer = ref(null)

const handleUpload = async (files) => {
  for (const file of files) {
    await sendFile(mesh.value, selectedPeer.value, file)
  }
}

const activeStreamsArray = computed(() => Array.from(activeStreams.value.values()))

// Listen for incoming streams
if (mesh.value) {
  mesh.value.addEventListener('streamReceived', async (event) => {
    const blob = await receiveStream(event)
    // Download the file
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = event.metadata.filename
    a.click()
  })
}
</script>
```

### Distributed Storage

```vue
<template>
  <div>
    <input v-model="key" placeholder="Key" />
    <input v-model="value" placeholder="Value" />
    <button @click="saveData">Save</button>
    <button @click="loadData">Load</button>
    
    <div v-for="[k, entry] in entries" :key="k">
      {{ k }}: {{ entry.value }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePeerPigeon, usePeerStorage } from 'pigeonnest'

const { mesh } = usePeerPigeon()
const { entries, set, get, list } = usePeerStorage()

const key = ref('')
const value = ref('')

const saveData = async () => {
  await set(mesh.value, key.value, value.value)
}

const loadData = async () => {
  const data = await get(mesh.value, key.value)
  value.value = data
}
</script>
```

## API Reference

### usePeerPigeon(options)

Main composable for managing the PeerPigeon mesh network.

**Options:**
- `peerId` (string) - Custom peer ID
- `networkName` (string) - Network namespace for isolation
- `maxPeers` (number) - Maximum number of peer connections
- `minPeers` (number) - Minimum number of peer connections
- `autoConnect` (boolean) - Auto-connect when joining network
- `autoDiscovery` (boolean) - Automatic peer discovery

**Returns:**
- `mesh` - PeerPigeonMesh instance
- `status` - Current network status
- `isConnected` - Connection state
- `isInitialized` - Initialization state
- `connectedPeerIds` - Array of connected peer IDs
- `discoveredPeers` - Array of discovered peers
- `error` - Last error
- `init()` - Initialize the mesh
- `connect(url)` - Connect to signaling server
- `disconnect()` - Disconnect from network
- `sendMessage(peerId, message)` - Send message to peer
- `broadcast(message)` - Broadcast to all peers
- `refreshStatus()` - Refresh status information

### usePeerStreaming()

Composable for handling file and data streaming (PigeonFS).

**Returns:**
- `activeStreams` - Map of active stream transfers
- `incomingStream` - Current incoming stream
- `sendFile(mesh, peerId, file)` - Send a File object
- `sendBlob(mesh, peerId, blob, options)` - Send a Blob
- `receiveStream(event)` - Receive and process a stream
- `cancelStream(streamId)` - Cancel an active stream

### usePeerStorage()

Composable for distributed storage management.

**Returns:**
- `entries` - Map of storage entries
- `loading` - Loading state
- `error` - Last error
- `set(mesh, key, value, ttl)` - Store a value
- `get(mesh, key)` - Retrieve a value
- `has(mesh, key)` - Check if key exists
- `delete(mesh, key)` - Delete a value
- `clear(mesh)` - Clear all storage
- `list(mesh)` - List all keys
- `refreshEntries(mesh)` - Refresh all entries

## Components

### PeerConnectionStatus

Displays current connection status and network information.

**Props:**
- `status` (PeerStatus | null) - Current peer status
- `isConnected` (boolean) - Connection state

### PeerList

List and manage connected peers.

**Props:**
- `peers` (Array) - Array of peers or peer IDs
- `title` (string) - List title
- `emptyMessage` (string) - Message when no peers
- `showTimestamp` (boolean) - Show connection time
- `showActions` (boolean) - Show action buttons
- `selectedPeerId` (string) - Currently selected peer

**Events:**
- `@select` - Peer selected
- `@message` - Send message clicked
- `@file` - Send file clicked

### FileUpload

Drag-and-drop file upload component.

**Props:**
- `multiple` (boolean) - Allow multiple files
- `accept` (string) - Accepted file types
- `targetPeerId` (string) - Target peer for upload
- `primaryText` (string) - Primary instruction text
- `secondaryText` (string) - Secondary instruction text

**Events:**
- `@upload` - Files ready to upload
- `@change` - File selection changed

### StreamProgress

Display progress of file transfers.

**Props:**
- `stream` (StreamProgress) - Stream progress object
- `onCancel` (boolean) - Show cancel button
- `onRetry` (boolean) - Show retry button
- `onDismiss` (boolean) - Show dismiss button

**Events:**
- `@cancel` - Cancel transfer
- `@retry` - Retry transfer
- `@dismiss` - Dismiss completed transfer

## Examples

See the `examples/` directory for complete examples:

- **demo.html** - Complete demo application showing all features

To run the demo:

```bash
# Start a PeerPigeon signaling server
npx peerpigeon hub

# In another terminal, serve the examples
npm run dev

# Open http://localhost:5173/examples/demo.html in multiple browser tabs
```

## PeerPigeon Integration

PigeonNest is built on top of PeerPigeon 1.0.5. Key concepts:

- **PigeonHub** - Signaling server for peer discovery (WebSocket-based)
- **PigeonFS** - File system operations using readable/writable streams
- **Mesh Network** - WebRTC-based peer-to-peer connections
- **Distributed Storage** - Shared storage across peers with CRDTs

## Browser Support

Requires browsers with:
- WebRTC support
- Web Streams API
- ES2020+

Tested on:
- Chrome 89+
- Firefox 102+
- Safari 14.1+
- Edge 89+

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build library
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © PeerPigeon Contributors

## Links

- [PeerPigeon Repository](https://github.com/PeerPigeon/PeerPigeon)
- [PeerPigeon API Documentation](https://github.com/PeerPigeon/PeerPigeon/blob/main/docs/API_DOCUMENTATION.md)
- [PeerPigeon Streaming API](https://github.com/PeerPigeon/PeerPigeon/blob/main/docs/STREAMING_API.md)

## Support

For issues and questions:
- [GitHub Issues](https://github.com/PeerPigeon/PigeonNest/issues)
- [PeerPigeon Discussions](https://github.com/PeerPigeon/PeerPigeon/discussions)
