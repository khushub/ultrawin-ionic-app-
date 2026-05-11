/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    svgr(),
    obfuscatorPlugin({
      apply: 'build',
      include: [
        /\/(util|services?)\//
      ],
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.7,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 0.8
      }
    }),
    federation({
      name: 'host_app',
      remotes: {
        wallet_remote_app: 'https://walletmodulegetiduser.betacular365.in/assets/remoteEntry.js?v=1.0.1',
        chat_remote_app: 'https://chatmoduleforgetid.betacular365.in/assets/remoteEntry.js?v=1.0.3',
      },
      shared: {
        react: {
          requiredVersion: false,
        },
        'react-dom': {
          requiredVersion: false,
        },
        'react-redux': {
          requiredVersion: false,
        },
        '@reduxjs/toolkit': {
          requiredVersion: false
        },
      }
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
