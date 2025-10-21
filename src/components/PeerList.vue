<template>
  <div class="peer-list">
    <div class="peer-list-header">
      <h3>{{ title }}</h3>
      <span class="peer-count">{{ peers.length }}</span>
    </div>
    
    <div v-if="peers.length === 0" class="empty-state">
      <p>{{ emptyMessage }}</p>
    </div>
    
    <div v-else class="peer-items">
      <div 
        v-for="peer in peers" 
        :key="peer.peerId"
        class="peer-item"
        :class="{ 'peer-selected': selectedPeerId === peer.peerId }"
        @click="$emit('select', peer.peerId)"
      >
        <div class="peer-info">
          <div class="peer-id">{{ truncatePeerId(peer.peerId) }}</div>
          <div v-if="showTimestamp && peer.discoveredAt" class="peer-timestamp">
            Connected {{ formatTimestamp(peer.discoveredAt) }}
          </div>
        </div>
        
        <div v-if="showActions" class="peer-actions">
          <button 
            v-if="showMessageButton"
            @click.stop="$emit('message', peer.peerId)"
            class="action-btn"
            title="Send message"
          >
            💬
          </button>
          <button 
            v-if="showFileButton"
            @click.stop="$emit('file', peer.peerId)"
            class="action-btn"
            title="Send file"
          >
            📁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PeerInfo } from '../types'

interface PeerListProps {
  peers: (PeerInfo | string)[]
  title?: string
  emptyMessage?: string
  showTimestamp?: boolean
  showActions?: boolean
  selectedPeerId?: string | null
  /**
   * @deprecated Use showMessageAction instead. Kept for backward compatibility.
   */
  onMessage?: boolean | ((...args: unknown[]) => unknown)
  /**
   * @deprecated Use showFileAction instead. Kept for backward compatibility.
   */
  onFile?: boolean | ((...args: unknown[]) => unknown)
  showMessageAction?: boolean
  showFileAction?: boolean
}

const props = withDefaults(defineProps<PeerListProps>(), {
  title: 'Peers',
  emptyMessage: 'No peers connected',
  showTimestamp: true,
  showActions: true,
  showMessageAction: true,
  showFileAction: true
})

const showMessageButton = computed(() => {
  if (typeof props.onMessage === 'boolean') {
    return props.onMessage
  }
  return props.showMessageAction
})

const showFileButton = computed(() => {
  if (typeof props.onFile === 'boolean') {
    return props.onFile
  }
  return props.showFileAction
})

defineEmits<{
  select: [peerId: string]
  message: [peerId: string]
  file: [peerId: string]
}>()

const truncatePeerId = (peerId: string): string => {
  if (peerId.length <= 16) return peerId
  return `${peerId.substring(0, 8)}...${peerId.substring(peerId.length - 8)}`
}

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}
</script>

<style scoped>
.peer-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.peer-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.peer-list-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.peer-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #999;
}

.empty-state p {
  margin: 0;
}

.peer-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.peer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.peer-item:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}

.peer-item.peer-selected {
  background: #e3f2fd;
  border-color: #1976d2;
}

.peer-info {
  flex: 1;
}

.peer-id {
  font-family: monospace;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.peer-timestamp {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.peer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}
</style>
