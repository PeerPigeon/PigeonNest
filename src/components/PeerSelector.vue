<template>
  <div class="peer-selector">
    <label v-if="label" class="input-label">{{ label }}</label>
    
    <div v-if="multiple" class="multi-select">
      <div class="select-all-option">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="selectAll"
            @change="handleSelectAllChange"
            :disabled="disabled || peers.length === 0"
          />
          <span>📢 Send to all peers</span>
        </label>
      </div>
      
      <div class="peer-checkboxes" v-if="!selectAll">
        <label 
          v-for="peer in peerOptions" 
          :key="peer.id"
          class="checkbox-label peer-option"
        >
          <input 
            type="checkbox" 
            :value="peer.id"
            v-model="selectedValues"
            @change="handleMultiChange"
            :disabled="disabled"
          />
          <span>{{ formatPeerOption(peer) }}</span>
        </label>
      </div>
    </div>
    
    <select
      v-else
      v-model="selectedValue"
      class="select-field"
      :disabled="disabled || peers.length === 0"
      @change="handleChange"
    >
      <option value="" disabled>{{ allowBroadcast ? 'Choose target...' : placeholder }}</option>
      <option v-if="allowBroadcast" value="__all__">📢 Broadcast to all peers</option>
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
  modelValue: string | string[] | null
  peers: (string | PeerOption)[]
  label?: string
  placeholder?: string
  emptyMessage?: string
  helpText?: string
  disabled?: boolean
  showFullId?: boolean
  multiple?: boolean
  allowBroadcast?: boolean
}

const props = withDefaults(defineProps<PeerSelectorProps>(), {
  label: 'Select Peer',
  placeholder: 'Choose a peer...',
  emptyMessage: 'No peers available',
  helpText: '',
  disabled: false,
  showFullId: false,
  multiple: false,
  allowBroadcast: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | null]
  'change': [value: string | string[] | null]
}>()

const selectedValue = ref<string | string[] | null>(props.modelValue)
const selectedValues = ref<string[]>(
  Array.isArray(props.modelValue) ? props.modelValue : []
)
const selectAll = ref(false)

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
  // Convert __all__ special value to null for broadcast
  const value = selectedValue.value === '__all__' ? null : selectedValue.value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleMultiChange = () => {
  emit('update:modelValue', selectedValues.value)
  emit('change', selectedValues.value)
}

const handleSelectAllChange = () => {
  if (selectAll.value) {
    const allPeerIds = peerOptions.value.map(p => p.id)
    selectedValues.value = allPeerIds
    emit('update:modelValue', allPeerIds)
    emit('change', allPeerIds)
  } else {
    selectedValues.value = []
    emit('update:modelValue', [])
    emit('change', [])
  }
}

watch(() => props.modelValue, (newValue) => {
  if (props.multiple) {
    selectedValues.value = Array.isArray(newValue) ? newValue : []
    selectAll.value = selectedValues.value.length === peerOptions.value.length && peerOptions.value.length > 0
  } else {
    // Convert null (broadcast) to __all__ special value for the select element
    selectedValue.value = newValue === null ? '__all__' : (newValue as string | null)
  }
})

// Update selectAll state when individual checkboxes change
watch(() => selectedValues.value.length, (newLength) => {
  selectAll.value = newLength === peerOptions.value.length && peerOptions.value.length > 0
})

// Auto-select first peer if nothing is selected and peers become available (single mode only)
// Don't auto-select if allowBroadcast is true (let user choose broadcast or specific peer)
watch(() => props.peers.length, (newLength, oldLength) => {
  if (!props.multiple && !props.allowBroadcast && newLength > 0 && oldLength === 0 && !selectedValue.value) {
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

.multi-select {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  background: white;
}

.select-all-option {
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 10px;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.checkbox-label span {
  font-size: 14px;
  color: #333;
  font-family: monospace;
}

.peer-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.peer-option {
  padding: 8px;
}

.select-all-option .checkbox-label span {
  font-weight: 600;
  font-family: inherit;
}
</style>
