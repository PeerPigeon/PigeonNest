<template>
  <div class="peer-connection-status" :class="statusClass">
    <div class="status-indicator">
      <span class="status-dot" :class="statusClass"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    
    <div v-if="status" class="status-details">
      <div class="status-item">
        <span class="label">Peer ID:</span>
        <span class="value">{{ truncatePeerId(status.peerId) }}</span>
      </div>
      <div class="status-item">
        <span class="label">Connected Peers:</span>
        <span class="value">{{ status.connectedCount }} / {{ status.maxPeers }}</span>
      </div>
      <div v-if="status.signalingUrl" class="status-item">
        <span class="label">Hub:</span>
        <span class="value">{{ status.signalingUrl }}</span>
      </div>
      <div v-if="status.uptime > 0" class="status-item">
        <span class="label">Uptime:</span>
        <span class="value">{{ formatUptime(status.uptime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PeerStatus } from '../types'

const props = defineProps<{
  status: PeerStatus | null
  isConnected: boolean
}>()

const statusText = computed(() => {
  if (!props.status) return 'Not initialized'
  if (!props.isConnected) return 'Disconnected'
  if (props.status.connectedCount === 0) return 'Connected (No peers)'
  return `Connected (${props.status.connectedCount} peer${props.status.connectedCount > 1 ? 's' : ''})`
})

const statusClass = computed(() => {
  if (!props.status) return 'status-inactive'
  if (!props.isConnected) return 'status-disconnected'
  if (props.status.connectedCount === 0) return 'status-warning'
  return 'status-connected'
})

const truncatePeerId = (peerId: string): string => {
  if (peerId.length <= 12) return peerId
  return `${peerId.substring(0, 6)}...${peerId.substring(peerId.length - 6)}`
}

const formatUptime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>

<style scoped>
.peer-connection-status {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.status-connected {
  background-color: #4caf50;
}

.status-dot.status-warning {
  background-color: #ff9800;
}

.status-dot.status-disconnected {
  background-color: #f44336;
}

.status-dot.status-inactive {
  background-color: #9e9e9e;
  animation: none;
}

.status-text {
  font-weight: 600;
  font-size: 16px;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.status-item .label {
  color: #666;
}

.status-item .value {
  font-weight: 500;
  color: #333;
  font-family: monospace;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
