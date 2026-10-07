/**
 * scripts/sync_public.js - Sincroniza os arquivos compilados de dist/ para public/
 * Garante que a pasta public/ contenha todo o bundle compilado (index.html, assets, css, js)
 * para compatibilidade total com plataformas de deploy estático (como Vercel configurada para 'public').
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function sync() {
  console.log('[sync_public] Sincronizando arquivos de dist/ para public/...');
  if (!fs.existsSync(distDir)) {
    console.error('[sync_public] ERRO: Pasta dist/ não encontrada! Execute vite build primeiro.');
    process.exit(1);
  }

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copia recursivamente todos os arquivos e pastas de dist para public
  copyRecursive(distDir, publicDir);

  const publicIndex = path.join(publicDir, 'index.html');
  const publicAssets = path.join(publicDir, 'assets');

  if (fs.existsSync(publicIndex) && fs.existsSync(publicAssets)) {
    const assetFiles = fs.readdirSync(publicAssets);
    console.log(`[sync_public] SUCESSO! public/index.html presente.`);
    console.log(`[sync_public] Total de assets compilados em public/assets/: ${assetFiles.length}`);
    console.log('[sync_public] Pasta public/ agora contém 100% dos arquivos do jogo para deploy.');
  } else {
    console.error('[sync_public] AVISO: Alguns arquivos esperados não foram encontrados em public/.');
  }
}

sync();
