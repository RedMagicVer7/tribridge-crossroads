// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    success: true, 
    message: 'TriBridge API is running',
    timestamp: new Date().toISOString()
  });
}