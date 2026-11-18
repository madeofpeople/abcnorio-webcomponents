import { defineConfig } from 'astro/config';

const designTokensRoot = './src/design-tokens';

export default defineConfig({
    build: {
        // Keeps file structures clean (e.g., /user-card/index.html)
        format: 'file' 
    },
    server: {
        fs: {
            allow: [designTokensRoot]
        },
        port: 3033
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: [designTokensRoot]
                }
            }
        },
        resolve: {
            alias: {
                '@tokens': `${process.cwd()}/src/design-tokens`,
                '@util': `${process.cwd()}/src/util`
            }
        },
        build: {
            rollupOptions: {
                output: {
                    // Native Astro builds pipe scripts into entryName.js
                    entryFileNames: '[name].js',
                    // Native Astro builds pipe scoped component CSS into styles/
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                            return 'styles/[name][extname]';
                        }
                        return 'assets/[name][extname]';
                    }
                }
            }
        }
    }
});