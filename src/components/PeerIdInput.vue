<template>
  <div class="peer-id-input">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-group">
      <input
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="input-field"
        :class="{ 'has-error': showError }"
        @input="handleInput"
        @blur="handleBlur"
      />
      <button
        v-if="showGenerateButton"
        @click="generatePeerId"
        type="button"
        class="generate-btn"
        title="Generate random Peer ID"
      >
        🎲
      </button>
    </div>
    <div v-if="showCharacterCount" class="character-count">
      {{ localValue.length }} / {{ maxLength }}
    </div>
    <div v-if="showError && errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface PeerIdInputProps {
  modelValue: string
  label?: string
  placeholder?: string
  maxLength?: number
  showGenerateButton?: boolean
  showCharacterCount?: boolean
  validateFormat?: boolean
  helpText?: string
}

const props = withDefaults(defineProps<PeerIdInputProps>(), {
  label: 'Peer ID',
  placeholder: 'Enter peer ID or generate one',
  maxLength: 40,
  showGenerateButton: true,
  showCharacterCount: true,
  validateFormat: true,
  helpText: '40-character hexadecimal string'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

const isValidFormat = computed(() => {
  if (!props.validateFormat || !localValue.value) return true
  // Check if it's a valid hex string of the right length
  const hexRegex = /^[0-9a-fA-F]+$/
  return hexRegex.test(localValue.value)
})

const showError = computed(() => {
  return props.validateFormat && localValue.value.length > 0 && !isValidFormat.value
})

const errorMessage = computed(() => {
  if (!showError.value) return ''
  return 'Peer ID must be a hexadecimal string (0-9, a-f)'
})

const generatePeerId = () => {
  // Generate a random 40-character hex string (like SHA-1)
  const array = new Uint8Array(20)
  crypto.getRandomValues(array)
  const hexString = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  localValue.value = hexString
  emit('update:modelValue', hexString)
}

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

const handleBlur = () => {
  emit('update:modelValue', localValue.value)
}

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})
</script>

<style scoped>
.peer-id-input {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-field {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #1976d2;
}

.input-field.has-error {
  border-color: #f44336;
}

.generate-btn {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}

.character-count {
  margin-top: 4px;
  font-size: 11px;
  color: #999;
  text-align: right;
  font-family: monospace;
}

.error-message {
  margin-top: 6px;
  padding: 8px 12px;
  background: #ffebee;
  border-left: 3px solid #f44336;
  border-radius: 4px;
  font-size: 12px;
  color: #c62828;
}

.help-text {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
</style>
