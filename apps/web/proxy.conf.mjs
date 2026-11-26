/**
 * O front chama /api e o servidor de desenvolvimento repassa para a API.
 *
 * A porta vem de API_PORT, a mesma variável que o compose.yaml usa para
 * publicar o container — assim um valor só serve para os dois lados:
 *
 *   $env:API_PORT = "3001"; docker compose up -d
 *   $env:API_PORT = "3001"; npm run dev:web
 */
const porta = process.env.API_PORT ?? '3000';

export default {
    '/api': {
        target: `http://localhost:${porta}`,
        secure: false,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
    },
};
