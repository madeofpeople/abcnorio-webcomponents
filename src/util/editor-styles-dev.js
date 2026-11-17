import path from 'node:path';
import { editorStyleEntries } from '../styles/editor-style-entries.js';

export function editorStylesDevPlugin(packageRoot) {
  const routes = new Map();
  for (const [id, entry] of Object.entries(editorStyleEntries)) {
    routes.set(`/__abcnorio/styles/${id}.css`, path.resolve(packageRoot, entry.source));
    if (entry.editor) {
      routes.set(`/__abcnorio/styles/${id}-editor.css`, path.resolve(packageRoot, entry.editor));
    }
  }
  return {
    name: 'abcnorio-editor-styles',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = (request.url || '').split('?')[0];
        const source = routes.get(pathname);
        if (!source) {
          if (pathname.startsWith('/__abcnorio/styles/')) {
            response.statusCode = 404;
            response.end('Unknown abcnorio editor stylesheet.');
            return;
          }
          next();
          return;
        }
        request.url = `/@fs/${source}?direct`;
        next();
      });
    },
  };
}
