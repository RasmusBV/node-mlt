import typescript from "@rollup/plugin-typescript";
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
    {
        input: "./src/index.ts",
        output: [
            {
                file: "./lib/esm/index.mjs",
                format: "es",
                sourcemap: false,
                exports: "named"
            }
        ],
        plugins: [
            typescript({
                tsconfig: "./configs/tsconfig.esm.json",
                sourceMap: false
            }),
            nodeResolve()
        ]
    }
]