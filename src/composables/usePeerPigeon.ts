import { ref, onUnmounted, Ref } from 'vue'
import { PeerPigeonMesh } from 'peerpigeon'
import type { PeerPigeonMeshOptions, PeerStatus, PeerInfo } from '../types'

export interface UsePeerPigeonReturn {
  mesh: Ref<PeerPigeonMesh | null>
  status: Ref<PeerStatus | null>
  isConnected: Ref<boolean>
  isInitialized: Ref<boolean>
  connectedPeerIds: Ref<string[]>
  discoveredPeers: Ref<PeerInfo[]>
  error: Ref<Error | null>
  init: () => Promise<void>
  connect: (signalingUrl: string) => Promise<void>
  disconnect: () => void
  sendMessage: (peerId: string, message: any) => Promise<void>
  broadcast: (message: any) => Promise<void>
  refreshStatus: () => void
}

export function usePeerPigeon(options: PeerPigeonMeshOptions = {}): UsePeerPigeonReturn {
  const mesh = ref<PeerPigeonMesh | null>(null)
  const status = ref<PeerStatus | null>(null)
  const isConnected = ref(false)
  const isInitialized = ref(false)
  const connectedPeerIds = ref<string[]>([])
  const discoveredPeers = ref<PeerInfo[]>([])
  const error = ref<Error | null>(null)

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
      mesh.value = new PeerPigeonMesh(options)
      
      // Set up event listeners
      mesh.value.addEventListener('statusChanged', refreshStatus)
      mesh.value.addEventListener('peerConnected', refreshStatus)
      mesh.value.addEventListener('peerDisconnected', refreshStatus)
      mesh.value.addEventListener('connected', () => {
        isConnected.value = true
        refreshStatus()
      })
      mesh.value.addEventListener('disconnected', () => {
        isConnected.value = false
        refreshStatus()
      })

      await mesh.value.init()
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
      await mesh.value.connect(signalingUrl)
      refreshStatus()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const disconnect = () => {
    if (mesh.value) {
      mesh.value.disconnect()
      isConnected.value = false
      refreshStatus()
    }
  }

  const sendMessage = async (peerId: string, message: any) => {
    try {
      error.value = null
      if (!mesh.value) {
        throw new Error('Mesh not initialized')
      }
      await mesh.value.sendMessage(peerId, message)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  const broadcast = async (message: any) => {
    try {
      error.value = null
      if (!mesh.value) {
        throw new Error('Mesh not initialized')
      }
      await mesh.value.broadcast(message)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
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
    init,
    connect,
    disconnect,
    sendMessage,
    broadcast,
    refreshStatus
  }
}
