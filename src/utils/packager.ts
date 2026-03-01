import type { ManifestGenerationVariables } from 'electron-windows-msix';

export const toMsixArch = (arch: string): ManifestGenerationVariables['targetArch']  => {
  switch (arch) {
    case 'x64':
      return 'x64'
    case 'ia32':
      return 'x86'
    case 'arm64':
      return 'arm64'
    default:
      throw new Error(`Unsupported architecture: ${arch}`)
  }
};