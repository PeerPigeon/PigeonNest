import type { PeerPigeonMeshOptions, PeerStatus, PeerInfo } from '../types'

const browserBundleUrl = new URL('../../node_modules/peerpigeon/dist/peerpigeon-browser.js', import.meta.url)

await import(/* @vite-ignore */ browserBundleUrl.href)

export interface PeerPigeonMeshInstance {
  addEventListener(event: string, handler: (event: any) => void): void
  removeEventListener(event: string, handler: (event: any) => void): void
  init(): Promise<void>
  connect(signalingUrl: string): Promise<void>
  disconnect(): void
  sendMessage(message: any): Promise<void>
  sendDirectMessage(targetPeerId: string, content: any): Promise<void>
  sendEncryptedMessage(targetPeerId: string, content: any): Promise<void>
  sendEncryptedBroadcast(content: any, groupId?: string | null): Promise<void>
  sendFile(peerId: string, file: File): Promise<void>
  sendBlob(peerId: string, blob: Blob, options?: Record<string, unknown>): Promise<void>
  sendStream(peerId: string, stream: ReadableStream<Uint8Array>, options?: Record<string, unknown>): Promise<void>
  createStreamToPeer(peerId: string, options?: Record<string, unknown>): WritableStream<Uint8Array>
  getStatus(): PeerStatus
  getConnectedPeerIds(): string[]
  getDiscoveredPeers(): PeerInfo[]
  storage?: {
    set(key: string, value: any, ttl?: number): Promise<void>
    get(key: string): Promise<any>
    has(key: string): Promise<boolean>
    delete(key: string): Promise<void>
    clear(): Promise<void>
    list(): Promise<string[]>
    keys(): Promise<string[]>
  }
}

type PeerPigeonMeshConstructor = new (options?: PeerPigeonMeshOptions) => PeerPigeonMeshInstance

const peerPigeonGlobal = globalThis as typeof globalThis & {
  PeerPigeonMesh?: PeerPigeonMeshConstructor
}

if (!peerPigeonGlobal.PeerPigeonMesh) {
  throw new Error('PeerPigeon browser bundle failed to expose PeerPigeonMesh')
}

export const PeerPigeonMesh = peerPigeonGlobal.PeerPigeonMesh
