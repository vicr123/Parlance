import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import PolyfillGroupByPlugin from "./vite/groupby-polyfill/vite-plugin-polyfill-groupby";

interface ProcessEnv {
    [key: string]: string | undefined;
}

const env: ProcessEnv = process.env;

const baseFolder: string =
    (env.APPDATA !== undefined && env.APPDATA !== '')
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName: string = "reactapp1.client";
const certFilePath: string = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath: string = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}

const target: string = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7238';

// https://vitejs.dev/config/
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [plugin(), PolyfillGroupByPlugin()],
    resolve: {
        alias: {
            // @ts-ignore
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/api': {
                target,
                secure: false
            }
        },
        port: 5173,
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    },
});