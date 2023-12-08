import type { Plugin } from "vite";
import type { SourceDescription } from "rollup";
import { spawnSync } from "node:child_process";
import { parse } from "node:path";

interface Options {
  /**
   * Sets the `-alpha_q` flag.
   *
   * Specify the compression factor for alpha compression between `0` and `100`.
   * Lossless compression of alpha is achieved using a value of `100`, while the
   * lower values result in a lossy compression. The default is `100`.
   */
  alphaQuality?: string;

  /**
   * Sets the `-m` flag.
   *
   * Specify the compression method to use. This parameter controls the trade
   * off between encoding speed and the compressed file size and quality.
   * Possible values range from `0` to `6`. Default value is `4`. When higher
   * values are used, the encoder will spend more time inspecting additional
   * encoding possibilities and decide on the quality gain. Lower value can
   * result in faster processing time at the expense of larger file size and
   * lower compression quality.
   */
  compressionMethod?: "0" | "1" | "2" | "3" | "4" | "5" | "6";

  /** The `cwebp` command to invoke. */
  cwebp?: string;

  /**
   * Sets the `-f` flag.
   *
   * Specify the strength of the deblocking filter, between `0` (no filtering)
   * and `100` (maximum filtering). A value of `0` will turn off any filtering.
   * Higher value will increase the strength of the filtering process applied
   * after decoding the picture. The higher the value the smoother the picture
   * will appear. Typical values are usually in the range of `20` to `50`.
   */
  deblockingFilter?: string;

  /**
   * Sets the `-exact` flag.
   *
   * Preserve RGB values in transparent area. The default is `false`, to help
   * compressibility.
   */
  exact?: boolean;

  /** The file formats to transform. */
  formats?: Record<string, null>;

  /** Sets the `-lossless` flag.
   *
   * Encode the image without any loss. For images with fully transparent area,
   * the invisible pixel values (R/G/B or Y/U/V) will be preserved only if the
   * `exact` option is used.
   */
  lossless?: boolean;

  /**
   * Sets the `-z` flag.
   *
   * Switch on `lossless` compression mode with the specified level between `0`
   * and `9`, with level `0` being the fastest, `9` being the slowest. Fast mode
   * produces larger file size than slower ones. A good default is `-z 6`. This
   * option is actually a shortcut for some predefined settings for quality and
   * method. If options `quality` or `compressionMethod` are used, they will
   * invalidate the effect of this option.
   */
  losslessLevel?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  /**
   * Sets the `-preset` flag.
   *
   * Specify a set of pre-defined parameters to suit a particular type of source
   * material.
   */
  preset?: "default" | "photo" | "picture" | "drawing" | "icon" | "text";
  /**
   * Sets the `-q` flag.
   *
   * Specify the compression factor for RGB channels between `0` and `100`. The
   * default is `75`.
   *
   * In case of lossy compression (default), a small factor produces a smaller
   * file with lower quality. Best quality is achieved by using a value of
   * `100`.
   *
   * In case of lossless compression (specified by the `lossless` option), a
   * small factor enables faster compression speed, but produces a larger file.
   * Maximum compression is achieved by using a value of `100`.
   */
  quality?: string;

  /**
   * Sets the `-sharpness` flag.
   *
   * Specify the sharpness of the filtering (if used). Range is `0` (sharpest)
   * to `7` (least sharp). Default is `0`.
   */
  sharpness?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

  /**
   * Sets the `-strong` or `-nostrong` flag.
   *
   * Use strong filtering (if filtering is enabled). Strong filtering is on by
   * default.
   */
  strong?: boolean;
}

const defaultOptions = {
  cwebp: "cwebp",
  formats: { ".png": null, ".jpg": null, ".jpeg": null, ".tiff": null },
};

export default (options?: Options): Plugin => {
  const computedOptions = {
    ...defaultOptions,
    ...options,
  };
  return {
    name: "vite-plugin-webp",
    enforce: "pre",
    async load(id: string): Promise<SourceDescription | null> {
      if (this.meta.watchMode) {
        return null;
      }

      const path = parse(id);

      if (!(path.ext in computedOptions.formats)) {
        return null;
      }

      const process = spawnSync(computedOptions.cwebp, [
        "-quiet",
        ...(computedOptions.preset === undefined
          ? []
          : ["-preset", computedOptions.preset]),
        ...(computedOptions.lossless ? ["-lossless"] : []),
        ...(computedOptions.exact ? ["-exact"] : []),
        ...(computedOptions.losslessLevel === undefined
          ? []
          : ["-z", computedOptions.losslessLevel]),
        ...(computedOptions.compressionMethod === undefined
          ? []
          : ["-m", computedOptions.compressionMethod]),
        ...(computedOptions.quality === undefined
          ? []
          : ["-q", computedOptions.quality]),
        ...(computedOptions.alphaQuality === undefined
          ? []
          : ["-alpha_q", computedOptions.alphaQuality]),
        ...(computedOptions.deblockingFilter === undefined
          ? []
          : ["-f", computedOptions.deblockingFilter]),
        ...(computedOptions.sharpness === undefined
          ? []
          : ["-sharpness", computedOptions.sharpness]),
        ...(computedOptions.strong === undefined
          ? []
          : computedOptions.strong
            ? ["-strong"]
            : ["-nostrong"]),
        "-o",
        "-",
        "--",
        id,
      ]);

      if (process.error) {
        throw process.error;
      }
      if (process.status != 0) {
        throw new Error(process.stderr.toString());
      }

      const assetId = this.emitFile({
        name: `${path.name}.webp`,
        source: process.stdout,
        type: "asset",
      });

      return {
        code: `export default "__VITE_ASSET__${assetId}__";`,
      };
    },
  };
};
