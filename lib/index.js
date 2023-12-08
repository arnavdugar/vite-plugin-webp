import { spawnSync } from "node:child_process";
import { parse } from "node:path";
const defaultOptions = {
    cwebp: "cwebp",
    formats: { ".png": null, ".jpg": null, ".jpeg": null, ".tiff": null },
};
export default (options) => {
    const computedOptions = {
        ...defaultOptions,
        ...options,
    };
    return {
        name: "vite-plugin-webp",
        enforce: "pre",
        async load(id) {
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
