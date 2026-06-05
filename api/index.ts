/**
 * Vercel Serverless Function Entry Point
 * This file exports a handler for Vercel to serve the NestJS application
 */

import { createApp } from '../dist/server/main';
import type { Request, Response } from 'express';

let cachedExpressApp: any = null;

async function getExpressApp() {
  if (!cachedExpressApp) {
    const nestApp = await createApp();

    // Get the underlying Express app
    const httpAdapter = nestApp.getHttpAdapter();
    cachedExpressApp = httpAdapter.getInstance();
  }

  return cachedExpressApp;
}

/**
 * Vercel serverless function handler
 */
export default async function handler(
  req: any,
  res: any
) {
  try {
    const app = await getExpressApp();

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    app(req as Request, res as Response);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
