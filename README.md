# vite-plugin-webp

Convert images (e.g. `.png`, `.jpeg`, `.tiff`) to `.webp`.

WebP is a modern image format that provides superior lossless and lossy
compression for images on the web. Using WebP, webmasters and web developers can
create smaller, richer images that make the web faster. For details, see the
[webp documentation](https://developers.google.com/speed/webp).

> [!NOTE]  
> This plugin _does not_ converter images to `.webp` in watch mode.

## Usage

1.  Add `cwebp` to your build path. You can download the binary from
    [here](https://developers.google.com/speed/webp/docs/precompiled).

1.  Install the package, e.g.

    ```
    npm install -D arnavdugar/vite-plugin-webp
    ```

1.  Add the following to your `vite.config.ts` file:

    ```
    import { defineConfig } from 'vite'
    import webp from 'vite-plugin-webp'

    export default defineConfig({
      plugins: [
        webp({
          // Set options; see lib/index.d.ts.
        }),
        ...
      ],
      ...
    })
    ```

## Troubleshooting

### `cwebp` is not installed

If you enconter the error:

```
error during build:
Error: Could not load <image-file> (imported by <script-file>): spawnSync cwebp ENOENT
```

this means that either:

1.  `cwebp` is not installed, or
1.  you need to use the `cwebp` option to specify the path to the `cwebp`
    binary.
