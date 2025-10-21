<template>
  <div class="peer-selector">
    <label v-if="label" class="input-label">{{ label }}</label>
    <select
      v-model="selectedValue"
      class="select-field"
      :disabled="disabled || peers.length === 0"
      @change="handleChange"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="peer in peerOptions" :key="peer.id" :value="peer.id">
        {{ formatPeerOption(peer) }}
      </option>
    </select>
    <div v-if="peers.length === 0" class="empty-message">
      {{ emptyMessage }}
    </div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface PeerOption {
  id: string
  label?: string
  discoveredAt?: number
}

interface PeerSelectorProps {
  modelValue: string | null
  peers: (string | PeerOption)[]
  label?: string
  placeholder?: string
  emptyMessage?: string
  helpText?: string
  disabled?: boolean
  showFullId?: boolean
}

const props = withDefaults(defineProps<PeerSelectorProps>(), {
  label: 'Select Peer',
  placeholder: 'Choose a peer...',
  emptyMessage: 'No peers available',
  helpText: '',
  disabled: false,
  showFullId: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'change': [value: string | null]
}>()

const selectedValue = ref(props.modelValue)

const peerOptions = computed(() => {
  return props.peers.map(peer => {
    if (typeof peer === 'string') {
      return { id: peer }
    }
    return peer
  })
})

const formatPeerOption = (peer: PeerOption): string => {
  if (peer.label) {
    return peer.label
  }
  
  if (props.showFullId) {
    return peer.id
  }
  
  // Truncate long peer IDs
  if (peer.id.length > 20) {
    return `${peer.id.substring(0, 8)}...${peer.id.substring(peer.id.length - 8)}`
  }
  
  return peer.id
}

const handleChange = () => {
  emit('update:modelValue', selectedValue.value)
  emit('change', selectedValue.value)
}

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

// Auto-select first peer if nothing is selected and peers become available
watch(() => props.peers.length, (newLength, oldLength) => {
  if (newLength > 0 && oldLength === 0 && !selectedValue.value) {
    const firstPeer = peerOptions.value[0]
    if (firstPeer) {
      selectedValue.value = firstPeer.id
      emit('update:modelValue', firstPeer.id)
      emit('change', firstPeer.id)
    }
  }
})
</script>

<style scoped>
.peer-selector {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.select-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-field:focus {
  outline: none;
  border-color: #1976d2;
}

.select-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.empty-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff3e0;
  border-left: 3px solid #ff9800;
  border-radius: 4px;
  font-size: 13px;
  color: #e65100;
}

.help-text {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
</style>
