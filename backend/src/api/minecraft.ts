import express, { Request, Response } from 'express';
import nacl from 'tweetnacl';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
import BlockchainService from '../services/blockchain/index.ts';
import DatabaseService from '../services/db/index.ts';
import { ChallengeModel } from '../models/Models.ts';
import { Webhook } from '../services/webhook/index.ts';
import { errorHandlerAsync } from '../middleware/errorHandler.ts';
import { validateBody, validateQuery } from '../middleware/validator.ts';
import {
  whitelistQuerySchema,
  revealServerSchema,
  rewardPlayerSchema,
  chatMessageSchema
} from './schemas/minecraft.ts';
import { ApiError, successResponse } from '../middleware/types/errors.ts';

dotenv.config();

const router = express.Router();
const solanaRpc = process.env.RPC_URL!;
const ipcSecret = process.env.IPC_SECRET!;
const DISCORD_WEBHOOK_URL = process.env.MINECRAFT_CHAT_WEBHOOK;
const VIRAL_TOKEN = new PublicKey('HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump');

router.get(
  '/whitelist',
  validateQuery(whitelistQuerySchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { name } = req.query;

    const challenge = await ChallengeModel.findOne(
      { name: { $regex: name, $options: 'i' } },
      {
        whitelist: 1
      }
    ).lean();

    if (!challenge) {
      throw ApiError.notFound('Challenge not found');
    }

    return res.status(200).json(successResponse({ whitelist: challenge.whitelist || [] }));
  })
);

router.post(
  '/reveal',
  validateBody(revealServerSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { address, username, signature, challengeName } = req.body;

    // Get challenge and verify it exists
    const challenge = await ChallengeModel.findOne(
      { name: { $regex: challengeName, $options: 'i' } },
      {
        _id: 1,
        name: 1,
        game_ip: 1,
        whitelist: 1
      }
    ).lean();

    if (!challenge) {
      throw ApiError.notFound('Challenge not found');
    }

    // Verify signature
    try {
      const publicKey = new PublicKey(address);
      const message = new TextEncoder().encode(username);
      const signatureUint8 = Buffer.from(signature, 'base64');

      const verified = nacl.sign.detached.verify(message, signatureUint8, publicKey.toBytes());

      if (!verified) {
        throw ApiError.unauthorized('Invalid signature');
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      throw ApiError.unauthorized('Invalid signature');
    }

    // Get token balance
    const connection = new Connection(solanaRpc, 'confirmed');
    let tokenBalance = 0;

    try {
      const filters = [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 32,
            bytes: address
          }
        },
        {
          memcmp: {
            offset: 0,
            bytes: VIRAL_TOKEN.toBase58()
          }
        }
      ];

      const accounts = await connection.getProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        { filters }
      );

      if (accounts.length > 0) {
        const info = await connection.getTokenAccountBalance(accounts[0].pubkey);
        tokenBalance = info.value.uiAmount || 0;
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
    }

    // Update whitelist
    const whitelist = (challenge.whitelist || []).map((entry) => ({
      username: entry.username,
      address: entry.address,
      viral_balance: entry.viral_balance,
      signature: entry.signature
    }));
    const filteredWhitelist = whitelist.filter((entry) => entry.address !== address);

    // Add new whitelist entry as plain object
    filteredWhitelist.push({
      username,
      address,
      viral_balance: tokenBalance,
      signature
    });

    // Update challenge with new whitelist
    await DatabaseService.updateChallenge(challenge._id!, {
      whitelist: filteredWhitelist
    });

    // Send Discord webhook
    const webhook = new Webhook(DISCORD_WEBHOOK_URL);
    await webhook.sendEmbed({
      title: 'New Server IP Reveal',
      fields: [
        {
          name: 'Username',
          value: username,
          inline: true
        },
        {
          name: 'Wallet',
          value: address,
          inline: true
        },
        {
          name: '$VIRAL Balance',
          value: tokenBalance.toString(),
          inline: true
        },
        {
          name: 'Challenge',
          value: challengeName,
          inline: true
        }
      ],
      color: 0x9945ff // Purple color
    });

    return res.status(200).json(
      successResponse({
        game_ip: challenge.game_ip
      })
    );
  })
);

router.post(
  '/reward',
  validateBody(rewardPlayerSchema),
  errorHandlerAsync(async (req, res) => {
    const { username, secret } = req.body;

    if (secret !== ipcSecret) {
      throw ApiError.unauthorized('Invalid secret');
    }

    // Find active tournament
    const challenge = await ChallengeModel.findOne({
      status: 'active',
      game: { $exists: true }
    });

    if (!challenge) {
      throw ApiError.notFound('No active game tournament found');
    }

    // Find winner's address from whitelist
    const winnerEntry = challenge.whitelist?.find(
      (entry) => entry.username?.toLowerCase() === username.toLowerCase()
    );

    if (!winnerEntry || !winnerEntry.address) {
      throw ApiError.notFound('Winner not found in whitelist');
    }

    const programId = challenge.idl?.address;
    const tournamentPDA = challenge.tournamentPDA;

    if (!programId || !tournamentPDA) {
      throw ApiError.notFound('Tournament program info not found');
    }

    // Conclude tournament on-chain with winner's address
    const blockchainService = new BlockchainService(solanaRpc, programId);
    const concluded = await blockchainService.concludeTournament(
      tournamentPDA,
      winnerEntry.address // Using the address from whitelist instead of username
    );

    // Add victory message to chat
    const victoryMessage = {
      challenge: challenge.name!,
      model: 'gpt-4o-mini',
      role: 'assistant',
      content: `🏆 Tournament concluded! Winner: ${username}\nTransaction: ${concluded}`,
      tool_calls: {},
      address: winnerEntry.address!,
      date: new Date()
    };

    await DatabaseService.createChat(victoryMessage);

    // Update challenge status
    await DatabaseService.updateChallenge(challenge._id!, {
      status: 'concluded'
    });

    return res.status(200).json(successResponse({ transaction: concluded }));
  })
);

router.post(
  '/chat',
  validateBody(chatMessageSchema),
  errorHandlerAsync(async (req, res) => {
    const { username, content, secret } = req.body;

    console.log(username, content, secret);
    console.log(process.env);

    if (secret !== ipcSecret) {
      throw ApiError.unauthorized('Invalid secret');
    }

    // if (username !== "viral_steve") {
    //   res.status(403).json({ error: 'Unauthorized username' });
    //   return
    // }

    // Find active game challenge
    const challenge = await ChallengeModel.findOne({
      game: { $exists: true },
      status: 'active'
    });

    if (!challenge) {
      throw ApiError.notFound('No active game challenge found');
    }

    // Create chat message
    await DatabaseService.createChat({
      challenge: challenge.name!,
      role: username === 'viral_steve' ? 'assistant' : 'player',
      content: content,
      address: username,
      display_name: username,
      date: new Date()
    });

    return res.status(200).json(successResponse({ message: 'Chat message saved successfully' }));
  })
);

export { router as minecraftApi };
