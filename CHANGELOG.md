# Changelog

All notable changes to PigeonNest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-20

### Added

#### Core Composables
- `usePeerPigeon` - Main mesh network management composable
  - Initialize and manage PeerPigeon mesh networks
  - Connection state management
  - Peer discovery and tracking
  - Message sending and broadcasting
  - Event handling

- `usePeerStreaming` - File and data streaming (PigeonFS)
  - Send files with `sendFile()`
  - Send blobs with `sendBlob()`
  - Receive streams with `receiveStream()`
  - Progress tracking for all transfers
  - Stream cancellation support
  - Automatic cleanup on unmount

- `usePeerStorage` - Distributed storage management
  - Store data across the peer network
  - Retrieve data from distributed storage
  - List and manage storage entries
  - Automatic synchronization

#### UI Components
- `PeerConnectionStatus` - Connection status display
  - Real-time status updates
  - Peer count display
  - Uptime tracking
  - Visual connection indicators

- `PeerList` - Connected peers list
  - Display all connected peers
  - Selection support
  - Quick actions (message, file transfer)
  - Timestamp display

- `FileUpload` - File upload with drag-and-drop
  - Multi-file support
  - Drag-and-drop interface
  - File size display
  - Preview before upload

- `StreamProgress` - Transfer progress indicator
  - Real-time progress tracking
  - Transfer speed calculation
  - Cancel/retry support
  - Error handling

#### Form Components
- `HubUrlInput` - Signaling hub URL input
  - URL validation
  - Preset hub URLs
  - WebSocket protocol verification

- `PeerIdInput` - Peer ID input field
  - Random ID generation
  - Format validation
  - Character count display

- `NetworkNameInput` - Network namespace input
  - Namespace validation
  - Preset networks (global, local, dev, test)
  - Custom preset support

- `PeerSelector` - Dropdown peer selector
  - Auto-select first peer
  - Truncated ID display
  - Empty state handling

#### Documentation
- Comprehensive README with full API documentation
- Quick Start Guide for rapid development
- Contributing guidelines
- Two complete example applications
- TypeScript type definitions

#### Build System
- Vite-based build system
- ES and UMD module outputs
- TypeScript support
- Vue 3 plugin integration
- Production optimizations

### Features
- Full TypeScript support with type definitions
- Vue 3 Composition API
- Reactive state management
- Automatic cleanup and resource management
- Event-driven architecture
- Progress tracking for long operations
- Error handling and recovery
- Responsive UI components

### Dependencies
- vue ^3.5.22
- peerpigeon github:PeerPigeon/PeerPigeon (1.0.5)

### Dev Dependencies
- vite ^5.4.21
- @vitejs/plugin-vue ^5.2.4
- typescript ^5.9.3
- vitest ^1.6.1
- @types/node ^20.19.22

### Browser Support
- Chrome 89+
- Firefox 102+
- Safari 14.1+
- Edge 89+

### Notes
- Initial release of PigeonNest framework
- Based on PeerPigeon 1.0.5 protocol
- Supports WebRTC peer-to-peer connections
- Implements Web Streams API for efficient file transfers
- Full integration with PeerPigeon hub system

[1.0.0]: https://github.com/PeerPigeon/PigeonNest/releases/tag/v1.0.0
