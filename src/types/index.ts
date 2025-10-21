// PeerPigeon type definitions
export interface PeerPigeonMeshOptions {
  peerId?: string
  networkName?: string
  allowGlobalFallback?: boolean
  enableWebDHT?: boolean
  enableCrypto?: boolean
  maxPeers?: number
  minPeers?: number
  autoConnect?: boolean
  autoDiscovery?: boolean
  evictionStrategy?: boolean
  xorRouting?: boolean
}

export interface PeerStatus {
  peerId: string
  connected: boolean
  connectedCount: number
  discoveredCount: number
  maxPeers: number
  minPeers: number
  autoDiscovery: boolean
  evictionStrategy: boolean
  xorRouting: boolean
  signalingUrl: string | null
  uptime: number
}

export interface PeerInfo {
  peerId: string
  discoveredAt: number
}

export interface MeshMessageEvent {
  from: string
  to?: string
  content: any
  timestamp?: number
  [key: string]: unknown
}

export interface StreamMetadata {
  filename: string
  mimeType: string
  totalSize: number
  type: string
  timestamp: number
}

export interface StreamEvent {
  peerId: string
  streamId: string
  stream?: ReadableStream<Uint8Array>
  metadata: StreamMetadata
}

export interface StreamProgressEvent {
  peerId: string
  streamId: string
  chunkIndex: number
  totalChunks: number
  bytesTransferred: number
  totalSize: number
  progress: number
}

export interface StorageEntry {
  key: string
  value: any
  timestamp: number
  ttl?: number
}

export interface PeerConnection {
  peerId: string
  connectionState: string
  dataChannel?: RTCDataChannel
}
