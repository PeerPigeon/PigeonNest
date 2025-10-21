<template>
  <div class="message-input">
    <div class="message-header">
      <label class="input-label">{{ label }}</label>
      <div v-if="targetPeer" class="target-info">
        <span class="target-label">To:</span>
        <span class="target-peer">{{ truncatePeerId(targetPeer) }}</span>
        <button @click="clearTarget" class="clear-btn" type="button" title="Clear target">✕</button>
      </div>
      <div v-else class="broadcast-info">
        📢 Broadcast to all peers
      </div>
    </div>
    
    <div class="input-group">
      <textarea
        v-model="localMessage"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="maxLength"
        class="message-field"
        @keydown.enter.meta="handleSend"
        @keydown.enter.ctrl="handleSend"
        @input="handleInput"
      />
    </div>
    
    <div class="message-footer">
      <div v-if="showCharacterCount" class="character-count">
        {{ localMessage.length }} / {{ maxLength }}
      </div>
      <div class="button-group">
        <button
          v-if="showClearButton"
          @click="handleClear"
          type="button"
          class="secondary-btn"
          :disabled="!localMessage"
        >
          Clear
        </button>
        <button
          @click="handleSend"
          type="button"
          class="primary-btn"
          :disabled="!localMessage || disabled"
        >
          {{ targetPeer ? '📤 Send' : '📢 Broadcast' }}
        </button>
      </div>
    </div>
    
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface MessageInputProps {
  modelValue?: string
  targetPeer?: string | null
  label?: string
  placeholder?: string
  rows?: number
  maxLength?: number
  showCharacterCount?: boolean
  showClearButton?: boolean
  disabled?: boolean
  helpText?: string
}

const props = withDefaults(defineProps<MessageInputProps>(), {
  modelValue: '',
  targetPeer: null,
  label: 'Message',
  placeholder: 'Type your message... (Cmd/Ctrl + Enter to send)',
  rows: 3,
  maxLength: 1000,
  showCharacterCount: true,
  showClearButton: true,
  disabled: false,
  helpText: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': [message: string, targetPeer: string | null]
  'clear': []
  'clearTarget': []
}>()

const localMessage = ref(props.modelValue)

const truncatePeerId = (peerId: string): string => {
  if (peerId.length <= 16) return peerId
  return `${peerId.substring(0, 8)}...${peerId.substring(peerId.length - 8)}`
}

const handleInput = () => {
  emit('update:modelValue', localMessage.value)
}

const handleSend = (event?: KeyboardEvent) => {
  if (event) {
    event.preventDefault()
  }
  if (localMessage.value && !props.disabled) {
    emit('send', localMessage.value, props.targetPeer)
    localMessage.value = ''
    emit('update:modelValue', '')
  }
}

const handleClear = () => {
  localMessage.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

const clearTarget = () => {
  emit('clearTarget')
}

watch(() => props.modelValue, (newValue) => {
  localMessage.value = newValue
})
</script>

<style scoped>
.message-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.input-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.target-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 13px;
}

.target-label {
  color: #666;
  font-weight: 500;
}

.target-peer {
  color: #1976d2;
  font-weight: 600;
  font-family: monospace;
}

.clear-btn {
  padding: 2px 6px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.broadcast-info {
  padding: 4px 10px;
  background: #fff3e0;
  border-radius: 4px;
  font-size: 13px;
  color: #f57c00;
  font-weight: 500;
}

.input-group {
  width: 100%;
}

.message-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.message-field:focus {
  outline: none;
  border-color: #1976d2;
}

.message-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.character-count {
  font-size: 12px;
  color: #999;
}

.button-group {
  display: flex;
  gap: 8px;
}

.primary-btn,
.secondary-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: #1976d2;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.secondary-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.secondary-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>
