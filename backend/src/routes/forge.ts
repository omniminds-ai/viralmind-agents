import express, { Request, Response, Router } from 'express';
import { Keypair } from '@solana/web3.js';
import { TrainingPoolModel, TrainingPool, TrainingPoolStatus } from '../models/TrainingPool.js';
import { WalletConnectionModel } from '../models/WalletConnection.js';
import DatabaseService from '../services/db/index.js';

const router: Router = express.Router();

interface ConnectBody {
  token: string;
  address: string;
}

interface CreatePoolBody {
  name: string;
  skills: string;
  token: {
    type: 'SOL' | 'VIRAL' | 'CUSTOM';
    symbol: string;
    address: string;
  };
  ownerAddress: string;
}

interface UpdatePoolBody {
  id: string;
  status?: TrainingPoolStatus.live | TrainingPoolStatus.paused;
  skills?: string;
}

interface ListPoolsBody {
  address: string;
}

// Store wallet address for token
router.post('/connect', async (req: Request<{}, {}, ConnectBody>, res: Response) => {
  try {
    const { token, address } = req.body;

    if (!token || !address) {
      res.status(400).json({ error: 'Token and address are required' });
      return;
    }

    // Store connection token with address
    await WalletConnectionModel.updateOne({ token }, { token, address }, { upsert: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Check connection status
router.get(
  '/check-connection',
  async (req: Request<{}, {}, {}, { token?: string }>, res: Response) => {
    try {
      const token = req.query.token;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const connection = await WalletConnectionModel.findOne({ token });

      res.json({
        connected: !!connection,
        address: connection?.address
      });
    } catch (error) {
      console.error('Error checking connection:', error);
      res.status(500).json({ error: 'Failed to check connection status' });
    }
  }
);

// List training pools
router.post('/list', async (req: Request<{}, {}, ListPoolsBody>, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const pools = await TrainingPoolModel.find({ ownerAddress: address }).select(
      '-depositPrivateKey'
    ); // Exclude private key from response

    // Update status to 'no-funds' if balance is 0
    const updatedPools = pools.map((pool) => {
      if (pool.funds === 0 && pool.status !== TrainingPoolStatus.noFunds) {
        pool.status = TrainingPoolStatus.noFunds;
        pool.save(); // Save the updated status
      }
      return pool;
    });

    res.json(updatedPools);
  } catch (error) {
    console.error('Error listing pools:', error);
    res.status(500).json({ error: 'Failed to list training pools' });
  }
});

// Create training pool
router.post('/create', async (req: Request<{}, {}, CreatePoolBody>, res: Response) => {
  try {
    const { name, skills, token, ownerAddress } = req.body;

    if (!name || !skills || !token || !ownerAddress) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate Solana keypair for deposit address
    const keypair = Keypair.generate();
    const depositAddress = keypair.publicKey.toString();
    const depositPrivateKey = Buffer.from(keypair.secretKey).toString('base64');

    const pool = new TrainingPoolModel({
      name,
      skills,
      token,
      ownerAddress,
      status: TrainingPoolStatus.noFunds,
      demonstrations: 0,
      funds: 0,
      depositAddress,
      depositPrivateKey
    });

    await pool.save();

    // Create response object without private key
    const { depositPrivateKey: _, ...response } = pool.toObject();

    res.json(response);
  } catch (error) {
    console.error('Error creating pool:', error);
    res.status(500).json({ error: 'Failed to create training pool' });
  }
});

// Update training pool
router.post('/update', async (req: Request<{}, {}, UpdatePoolBody>, res: Response) => {
  try {
    const { id, status, skills } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Pool ID is required' });
      return;
    }

    if (status && ![TrainingPoolStatus.live, TrainingPoolStatus.paused].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const pool = await TrainingPoolModel.findById(id);
    if (!pool) {
      res.status(404).json({ error: 'Training pool not found' });
      return;
    }

    // Only allow status update if funds > 0
    if (status && pool.funds === 0) {
      res.status(400).json({ error: 'Cannot update status: pool has no funds' });
      return;
    }

    const updates: Partial<TrainingPool> = {};
    if (status) updates.status = status;
    if (skills) updates.skills = skills;

    const updatedPool = await TrainingPoolModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-depositPrivateKey'); // Exclude private key from response

    res.json(updatedPool);
  } catch (error) {
    console.error('Error updating pool:', error);
    res.status(500).json({ error: 'Failed to update training pool' });
  }
});

export { router as forgeRoute };
