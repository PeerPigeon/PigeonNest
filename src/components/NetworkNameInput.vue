<template>
  <div class="network-name-input">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-group">
      <input
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="input-field"
        @input="handleInput"
        @blur="handleBlur"
      />
      <div v-if="showValidation" class="validation-indicator" :class="validationClass">
        {{ validationText }}
      </div>
    </div>
    <div v-if="showPresets" class="presets">
      <button
        v-for="preset in presets"
        :key="preset.value"
        @click="selectPreset(preset.value)"
        class="preset-btn"
        type="button"
      >
        {{ preset.label }}
      </button>
    </div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Preset {
  label: string
  value: string
}

interface NetworkNameInputProps {
  modelValue: string
  label?: string
  placeholder?: string
  maxLength?: number
  showValidation?: boolean
  showPresets?: boolean
  helpText?: string
  customPresets?: Preset[]
}

const props = withDefaults(defineProps<NetworkNameInputProps>(), {
  label: 'Network Name',
  placeholder: 'my-network',
  maxLength: 50,
  showValidation: true,
  showPresets: true,
  helpText: 'Network namespace for peer isolation'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

const defaultPresets: Preset[] = [
  { label: 'Global', value: 'global' },
  { label: 'Local', value: 'local' },
  { label: 'Dev', value: 'dev' },
  { label: 'Test', value: 'test' }
]

const presets = computed(() => {
  return props.customPresets || defaultPresets
})

const isValidName = computed(() => {
  if (!localValue.value) return null
  // Valid network names: alphanumeric, hyphens, underscores
  const nameRegex = /^[a-zA-Z0-9_-]+$/
  return nameRegex.test(localValue.value)
})

const validationClass = computed(() => {
  if (isValidName.value === null) return ''
  return isValidName.value ? 'valid' : 'invalid'
})

const validationText = computed(() => {
  if (isValidName.value === null) return ''
  return isValidName.value ? '✓' : '✗'
})

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

const handleBlur = () => {
  emit('update:modelValue', localValue.value)
}

const selectPreset = (value: string) => {
  localValue.value = value
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})
</script>

<style scoped>
.network-name-input {
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-field {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #1976d2;
}

.validation-indicator {
  min-width: 24px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

.validation-indicator.valid {
  color: #4caf50;
}

.validation-indicator.invalid {
  color: #f44336;
}

.presets {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #f5f5f5;
  border-color: #1976d2;
}

.help-text {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
</style>
