/// <reference types="chrome" />

declare namespace NodeJS {
  interface ProcessEnv {
    ANALYSIS_API_URL?: string
  }
}

declare module '*.css'