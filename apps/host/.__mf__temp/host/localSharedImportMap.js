// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

const importMap = {
  pinia: async () => {
    const pkg = await import('__mf__virtual/host__prebuild__pinia__prebuild__.js')
    return pkg
  },
  vue: async () => {
    const pkg = await import('__mf__virtual/host__prebuild__vue__prebuild__.js')
    return pkg
  },
}
const usedShared = {
  pinia: {
    name: 'pinia',
    version: '3.0.4',
    scope: ['default'],
    loaded: false,
    from: 'host',
    async get() {
      if (false) {
        throw new Error(`Shared module '${'pinia'}' must be provided by host`)
      }
      usedShared.pinia.loaded = true
      const { pinia: pkgDynamicImport } = importMap
      const res = await pkgDynamicImport()
      const exportModule = { ...res }
      // All npm packages pre-built by vite will be converted to esm
      Object.defineProperty(exportModule, '__esModule', {
        value: true,
        enumerable: false,
      })
      return function () {
        return exportModule
      }
    },
    shareConfig: {
      singleton: true,
      requiredVersion: '^3.0.0',
    },
  },
  vue: {
    name: 'vue',
    version: '3.5.30',
    scope: ['default'],
    loaded: false,
    from: 'host',
    async get() {
      if (false) {
        throw new Error(`Shared module '${'vue'}' must be provided by host`)
      }
      usedShared.vue.loaded = true
      const { vue: pkgDynamicImport } = importMap
      const res = await pkgDynamicImport()
      const exportModule = { ...res }
      // All npm packages pre-built by vite will be converted to esm
      Object.defineProperty(exportModule, '__esModule', {
        value: true,
        enumerable: false,
      })
      return function () {
        return exportModule
      }
    },
    shareConfig: {
      singleton: true,
      requiredVersion: '^3.5.0',
    },
  },
}
const usedRemotes = []
export { usedRemotes, usedShared }
