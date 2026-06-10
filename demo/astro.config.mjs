import { defineConfig } from 'astro/config';
import stargazer from 'astro-stargazer';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.resolve(__dirname, '../src/components');
const designTokensRoot = process.env.DESIGN_TOKENS_ROOT?.trim() || '/abcnorio-design-tokens';
const fontsDir = path.join(designTokensRoot, 'fonts');

if (!existsSync(designTokensRoot)) {
    throw new Error(`[startup] Missing design-tokens directory: ${designTokensRoot}`);
}

// The demo setup behaves like a standard website, entirely separate from your root library config
export default defineConfig({
    integrations: [stargazer()],
    vite: {
        server: {
            fs: {
                allow: [designTokensRoot, componentsDir]
            },
            port: 3033,
            allowedHosts: ['components.itztlacoliuhqui.org']
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
                // Point the alias directly to your source folder outside the demo root
               '@components': componentsDir,
               '@abcnorio-design-tokens': designTokensRoot,
               '@fonts': fontsDir
            }
        }
    }
})