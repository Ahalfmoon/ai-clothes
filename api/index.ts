/**
 * Vercel Serverless Function Entry Point
 * This file exports a handler for Vercel to serve the NestJS application
 */

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../server/app.module';
import type { Request, Response } from 'express';

let cachedApp: any = null;

async function bootstrap() {
  if (!cachedApp) {
    const express = require('express');
    const app = express();

    // Basic middleware
    app.use(require('cors')());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(app)
    );

    await nestApp.init();

    cachedApp = app;
  }

  return cachedApp;
}

/**
 * Vercel serverless function handler
 */
export default async function handler(
  req: any,
  res: any
) {
  try {
    const app = await bootstrap();

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
