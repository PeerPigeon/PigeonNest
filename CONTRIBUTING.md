# Contributing to PigeonNest

Thank you for your interest in contributing to PigeonNest! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PeerPigeon/PigeonNest.git
   cd PigeonNest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Build the library**
   ```bash
   npm run build
   ```

## Project Structure

```
PigeonNest/
├── src/
│   ├── composables/       # Vue 3 composables
│   │   ├── usePeerPigeon.ts
│   │   ├── usePeerStreaming.ts
│   │   └── usePeerStorage.ts
│   ├── components/        # Vue 3 components
│   │   ├── PeerConnectionStatus.vue
│   │   ├── PeerList.vue
│   │   ├── FileUpload.vue
│   │   ├── StreamProgress.vue
│   │   ├── HubUrlInput.vue
│   │   ├── PeerIdInput.vue
│   │   ├── NetworkNameInput.vue
│   │   └── PeerSelector.vue
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts          # Main entry point
├── examples/             # Example applications
│   ├── demo.html
│   └── complete-demo.html
├── dist/                 # Build output (generated)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Adding a New Component

1. Create your component in `src/components/`
2. Export it from `src/index.ts`
3. Add documentation in the README
4. Create an example in `examples/`

Example component structure:

```vue
<template>
  <div class="my-component">
    <!-- Your template -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props interface
interface MyComponentProps {
  // Define props
}

// Define props with defaults
const props = withDefaults(defineProps<MyComponentProps>(), {
  // Default values
})

// Define emits
defineEmits<{
  myEvent: [value: string]
}>()

// Component logic
</script>

<style scoped>
/* Component styles */
</style>
```

## Adding a New Composable

1. Create your composable in `src/composables/`
2. Export it from `src/index.ts`
3. Add comprehensive JSDoc comments
4. Add usage examples in README

Example composable structure:

```typescript
import { ref, onUnmounted, Ref } from 'vue'
import type { PeerPigeonMesh } from 'peerpigeon'

export interface UseMyFeatureReturn {
  // Return type definition
}

export function useMyFeature(): UseMyFeatureReturn {
  // Composable logic
  
  onUnmounted(() => {
    // Cleanup
  })
  
  return {
    // Returned values
  }
}
```

## Code Style

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use scoped styles in components
- Prefer `const` over `let` when possible

## Testing Guidelines

- Test all new features and bug fixes
- Ensure existing tests pass
- Add integration tests for new composables
- Test components with various prop combinations

## Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following the guidelines above
3. **Update documentation** including README and inline comments
4. **Test thoroughly** to ensure nothing breaks
5. **Build successfully** with `npm run build`
6. **Submit a pull request** with a clear description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] Examples work correctly

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add new PeerMediaStream component`
- `fix: Resolve connection timeout issue`
- `docs: Update API documentation`
- `refactor: Improve usePeerStorage performance`
- `test: Add tests for FileUpload component`

## Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps to reproduce the bug
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - Browser, OS, versions, etc.
6. **Code Sample** - Minimal reproducible code

## Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly and in detail
3. **Explain the use case** - why is this needed?
4. **Provide examples** of how it would be used

## Questions and Support

- **GitHub Discussions** - For questions and community support
- **GitHub Issues** - For bug reports and feature requests
- **Documentation** - Check the README and examples first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Follow GitHub's Community Guidelines

Thank you for contributing to PigeonNest! 🐦
