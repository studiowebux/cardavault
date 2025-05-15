import { cpSync } from "node:fs";
import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

const define = {
  'process.env.X_API_KEY': Deno.env.get("X_API_KEY")!,
  'process.env.X_API_KEY_MAINNET': Deno.env.get("X_API_KEY_MAINNET")!,
  'process.env.X_API_KEY_TESTNET': Deno.env.get("X_API_KEY_TESTNET")!,
  'process.env.SKEY': Deno.env.get("SKEY")!,
  'process.env.PKEY': Deno.env.get("PKEY")!,
  'process.env.MAINNET_BASE_ADDRESS': Deno.env.get("MAINNET_BASE_ADDRESS")!,
  'process.env.TESTNET_BASE_ADDRESS': Deno.env.get("TESTNET_BASE_ADDRESS")!,
  'process.env.MAINNET_REWARD_ADDRESS': Deno.env.get(
    "MAINNET_REWARD_ADDRESS",
  )!,
  'process.env.TESTNET_REWARD_ADDRESS': Deno.env.get(
    "TESTNET_REWARD_ADDRESS",
  )!,
  'process.env.DOLOS_URL': JSON.stringify(Deno.env.get("DOLOS_URL")!),
};

await esbuild.build({
  plugins: [
    ...denoPlugins(),
    {
      name: "copy-static-files",

      setup(build) {
        build.onEnd(async () => {
          await Deno.copyFile("./manifest.json", "dist/manifest.json", {
            overwrite: true,
          });
          console.log("Copied manifest.json to dist/");

          cpSync("./images/", "dist/", {
            force: true,
            recursive: true,
          });
          console.log("Copied images/ to dist/");

          cpSync("./src/UI/", "dist/", {
            force: true,
            recursive: true,
          });
          console.log("Copied UI/ to dist/");
        });
      },
    },
  ],
  entryPoints: [
    "./src/app.ts",
    "./src/background.ts",
    "./src/injected.ts",
    "./src/content.ts",
  ],
  bundle: true,
  treeShaking: true,
  minify: true,
  target: ["es2020"],
  outdir: "./dist",
  define,
});

esbuild.stop();
