import { ref, onUnmounted, Ref } from 'vue'
import { PeerPigeonMesh } from 'peerpigeon'
import type { PeerPigeonMeshInstance } from 'peerpigeon'
import type { PeerPigeonMeshOptions, PeerStatus, PeerInfo, MeshMessageEvent } from '../types'

export interface UsePeerPigeonReturn {
  mesh: Ref<PeerPigeonMeshInstance | null>
  status: Ref<PeerStatus | null>
  isConnected: Ref<boolean>
  isInitialized: Ref<boolean>
  connectedPeerIds: Ref<string[]>
  discoveredPeers: Ref<PeerInfo[]>
  error: Ref<Error | null>
  lastMessage: Ref<MeshMessageEvent | null>
  messages: Ref<MeshMessageEvent[]>
  init: () => Promise<void>
  connect: (signalingUrl: string) => Promise<void>
  disconnect: () => void
  sendMessage: (peerId: string, message: any) => Promise<void>
  sendToMultiplePeers: (peerIds: string[], message: any) => Promise<void>
  sendToTarget: (target: string | string[] | null, message: any) => Promise<void>
  broadcast: (message: any) => Promise<void>
  onMessage: (handler: (event: MeshMessageEvent) => void) => () => void
  clearMessages: () => void
  refreshStatus: () => void
}

export function usePeerPigeon(options: PeerPigeonMeshOptions = {}): UsePeerPigeonReturn {
  const mesh = ref<PeerPigeonMeshInstance | null>(null)
  const status = ref<PeerStatus | null>(null)
  const isConnected = ref(false)
  const isInitialized = ref(false)
  const connectedPeerIds = ref<string[]>([])
  const discoveredPeers = ref<PeerInfo[]>([])
  const error = ref<Error | null>(null)
  const lastMessage = ref<MeshMessageEvent | null>(null)
  const messages = ref<MeshMessageEvent[]>([])
  const messageHandlers = new Set<(event: MeshMessageEvent) => void>()

  const handleMessageReceived = (event: MeshMessageEvent) => {
    lastMessage.value = event
    messages.value = [event, ...messages.value].slice(0, 100)
    messageHandlers.forEach((handler) => handler(event))
  }

  const refreshStatus = () => {
    if (mesh.value) {
      status.value = mesh.value.getStatus() as PeerStatus
      isConnected.value = status.value?.connected || false
      connectedPeerIds.value = mesh.value.getConnectedPeerIds()
      discoveredPeers.value = mesh.value.getDiscoveredPeers()
    }
  }

  const init = async () => {
    try {
      error.value = null
      if (mesh.value) {
        mesh.value.removeEventListener('messageReceived', handleMessageReceived)
      }

      const instance = new PeerPigeonMesh(options)
      mesh.value = instance

      // Set up event listeners
      instance.addEventListener('statusChanged', refreshStatus)
      instance.addEventListener('peerConnected', refreshStatus)
      instance.addEventListener('peerDisconnected', refreshStatus)
      instance.addEventListener('messageReceived', handleMessageReceived)
      instance.addEventListener('connected', () => {
        isConnected.value = true
        refreshStatus()
      })
      instance.addEventListener('disconnected', () => {
        isConnected.value = false
        refreshStatus()
      })

      await instance.init()
      isInitialized.value = true
      refreshStatus()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const connect = async (signalingUrl: string) => {
    try {
      error.value = null
      if (!mesh.value) {
        throw new Error('Mesh not initialized. Call init() first.')
      }
  const currentMesh = mesh.value
  await currentMesh.connect(signalingUrl)
      refreshStatus()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const disconnect = () => {
    if (mesh.value) {
  const currentMesh = mesh.value
  currentMesh.removeEventListener('messageReceived', handleMessageReceived)
  currentMesh.disconnect()
      mesh.value = null
      status.value = null
      connectedPeerIds.value = []
      discoveredPeers.value = []
      isInitialized.value = false
      isConnected.value = false
    }
  }

  const sendMessage = async (peerId: string, message: any) => {
    try {
      error.value = null
      const currentMesh = mesh.value
      if (!currentMesh) {
        throw new Error('Mesh not initialized')
      }
      if (!peerId || peerId.trim() === '') {
        throw new Error('peerId is required for sendMessage. Use broadcast() to send to all peers.')
      }
      // Use sendEncryptedMessage for encrypted direct messages
      await (currentMesh as any).sendEncryptedMessage(peerId, message)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const broadcast = async (message: any) => {
    try {
      error.value = null
      const currentMesh = mesh.value
      if (!currentMesh) {
        throw new Error('Mesh not initialized')
      }
      // Use sendEncryptedBroadcast for encrypted broadcasts
      await (currentMesh as any).sendEncryptedBroadcast(message)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const sendToMultiplePeers = async (peerIds: string[], message: any) => {
    try {
      error.value = null
      const currentMesh = mesh.value
      if (!currentMesh) {
        throw new Error('Mesh not initialized')
      }
      if (peerIds.length === 0) {
        throw new Error('No peer IDs provided')
      }
      // Send message to each peer in the list
      await Promise.all(
        peerIds.map(peerId => (currentMesh as any).sendEncryptedMessage(peerId, message))
      )
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const sendToTarget = async (target: string | string[] | null, message: any) => {
    if (!target) {
      // No target means broadcast
      await broadcast(message)
    } else if (Array.isArray(target)) {
      // Multiple peers
      await sendToMultiplePeers(target, message)
    } else {
      // Single peer
      await sendMessage(target, message)
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    mesh,
    status,
    isConnected,
    isInitialized,
    connectedPeerIds,
    discoveredPeers,
    error,
    lastMessage,
    messages,
    init,
    connect,
    disconnect,
    sendMessage,
    sendToMultiplePeers,
    sendToTarget,
    broadcast,
    onMessage: (handler: (event: MeshMessageEvent) => void) => {
      messageHandlers.add(handler)
      if (lastMessage.value) {
        handler(lastMessage.value)
      }
      return () => {
        messageHandlers.delete(handler)
      }
    },
    clearMessages: () => {
      messages.value = []
      lastMessage.value = null
    },
    refreshStatus
  }
}
