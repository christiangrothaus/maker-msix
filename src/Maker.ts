import { getNameFromAuthor } from '@electron-forge/core-utils'
import { MakerBase, type MakerOptions } from '@electron-forge/maker-base'
import type { ForgePlatform } from '@electron-forge/shared-types'
import {
  packageMSIX,
  type PackagingOptions
} from 'electron-windows-msix'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { toMsixArch } from './utils/packager'

type MakerConfig = Omit<PackagingOptions, 'outputDir' | 'appDir'>

export default class Maker extends MakerBase<MakerConfig> {
  defaultPlatforms: ForgePlatform[] = ['win32']
  name = 'electron-forge-maker-msix'

  isSupportedOnCurrentPlatform() {
    return process.platform === 'win32'
  }

  async make({
    dir,
    makeDir,
    targetArch,
    packageJSON,
    appName,
  }: MakerOptions): Promise<string[]> {
    const { manifestVariables, ...packageOptions } = this.config

    const tmpFolder = await fs.mkdtemp(path.resolve(os.tmpdir(), 'msix-'))

    try {
      const result = await packageMSIX({
        ...packageOptions,
        manifestVariables: {
          packageDescription: packageJSON.description,
          appExecutable: `${appName}.exe`,
          packageVersion: packageJSON.version,
          publisher: getNameFromAuthor(packageJSON.author),
          packageIdentity: appName,
          targetArch: toMsixArch(targetArch),
          ...manifestVariables,
        },
        appDir: dir,
        outputDir: tmpFolder,
      })

      const outputPath = path.resolve(
        makeDir,
        'msix',
        targetArch,
        `${appName}.msix`
      )
      await fs.mkdirp(path.dirname(outputPath))
      await fs.move(result.msixPackage, outputPath)
      return [outputPath]
    } finally {
      fs.remove(tmpFolder)
    }
  }
}
