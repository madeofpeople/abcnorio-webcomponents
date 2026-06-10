import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configuredDesignTokensRoot = process.env.DESIGN_TOKENS_ROOT?.trim();
const designTokensCandidates = [
    configuredDesignTokensRoot,
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'node_modules', 'abcnorio-design-tokens'),
    '/abcnorio-design-tokens',
    path.join(repoRoot, 'abcnorio-astro', 'design-tokens')
].filter(Boolean);

const designTokensRoot = designTokensCandidates.find((candidate) => existsSync(candidate));

if (!designTokensRoot) {
    // Fail loudly.
    throw new Error(`[startup] Missing design-tokens directory. Checked: ${designTokensCandidates.join(', ')}`);
}

const fontsDir = path.join(designTokensRoot, 'fonts');

export default defineConfig({
    build: {
        // Keeps file structures clean (e.g., /user-card/index.html)
        format: 'file' 
    },
    vite: {
        server: {
            fs: {
                allow: [designTokensRoot]
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: [designTokensRoot]
                }
            }
        },
        resolve: {
            alias: {
                '@abcnorio-design-tokens': designTokensRoot,
                '@fonts': fontsDir
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