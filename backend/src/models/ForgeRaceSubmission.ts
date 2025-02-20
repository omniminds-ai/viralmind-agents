import mongoose from "mongoose";
import { promises as fs } from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Keypair } from '@solana/web3.js';
import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { TrainingPoolModel } from "./TrainingPool.ts";

const FORGE_WEBHOOK = process.env.GYM_FORGE_WEBHOOK;

interface WebhookPayload {
  embeds: Array<{
    title: string;
    description?: string;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    color: number;
  }>;
}

async function notifyForgeWebhook(
  type: 'processing' | 'success' | 'transfer-error' | 'error',
  data: {
    title?: string;
    app?: string;
    duration?: number;
    score?: number;
    reward?: number;
    maxReward?: number;
    clampedScore?: number;
    summary?: string;
    feedback?: string;
    error?: string;
    treasuryTransfer?: TreasuryTransfer;
    address?: string;
    pool?: {
      name: string;
      token: {
        symbol: string;
        address: string;
      };
      treasuryBalance?: number;
    };
  }
) {
  if (!FORGE_WEBHOOK) return;
  
  try {
    const payload: WebhookPayload = {
      embeds: [{
        title: type === 'processing' ? '🎯 Processing New Submission' :
               type === 'success' ? '✨ Submission Graded Successfully' :
               type === 'transfer-error' ? '⚠️ Treasury Transfer Failed' :
               '❌ Submission Processing Failed',
        fields: [],
        color: type === 'processing' ? 3447003 :  // Blue
                type === 'success' ? 5793266 :     // Green
                type === 'transfer-error' ? 16098851 : // Yellow
                15158332                              // Red
      }]
    };

    // Add fields based on type and available data
    if (data.title) {
      payload.embeds[0].fields.push({
        name: '📝 Task',
        value: data.title,
        inline: true
      });
    }

    if (data.app) {
      payload.embeds[0].fields.push({
        name: '🖥️ App',
        value: data.app,
        inline: true
      });
    }

    if (data.duration) {
      payload.embeds[0].fields.push({
        name: '⏱️ Duration',
        value: `${data.duration}s`,
        inline: true
      });
    }

    if (data.address) {
      payload.embeds[0].fields.push({
        name: '👤 Submitter',
        value: `[${data.address.slice(0, 4)}...${data.address.slice(-4)}](https://solscan.io/account/${data.address})`,
        inline: true
      });
    }

    if (data.score !== undefined) {
      payload.embeds[0].fields.push({
        name: '📊 Score',
        value: `${data.score}/100 ${data.score >= 80 ? '🏆' : '📝'}`,
        inline: true
      });
    }

    if (data.reward !== undefined && data.maxReward) {
      payload.embeds[0].fields.push({
        name: '💎 Reward',
        value: `${data.reward.toFixed(2)} ${data.pool?.token.symbol || '$VIRAL'} (${data.clampedScore}% of ${data.maxReward.toFixed(2)})`,
        inline: true
      });
    }

    if (data.pool) {
      payload.embeds[0].fields.push({
        name: '🏦 Pool',
        value: `${data.pool.name}\n${data.pool.token.symbol} ([${data.pool.token.address.slice(0, 4)}...${data.pool.token.address.slice(-4)}](https://solscan.io/token/${data.pool.token.address}))`,
        inline: true
      });

      if (data.pool.treasuryBalance !== undefined) {
        payload.embeds[0].fields.push({
          name: '💰 Treasury Balance',
          value: `${data.pool.treasuryBalance.toLocaleString()} ${data.pool.token.symbol}`,
          inline: true
        });
      }
    }

    if (data.treasuryTransfer?.txHash) {
      payload.embeds[0].fields.push({
        name: '🔗 Transaction',
        value: `[View on Solscan](https://solscan.io/tx/${data.treasuryTransfer.txHash})`,
        inline: true
      });
    }

    if (data.summary) {
      payload.embeds[0].fields.push({
        name: '📋 Summary',
        value: data.summary,
        inline: false
      });
    }

    if (data.feedback) {
      payload.embeds[0].fields.push({
        name: '💭 Feedback',
        value: data.feedback,
        inline: false
      });
    }

    if (data.error) {
      payload.embeds[0].fields.push({
        name: '❌ Error',
        value: `\`\`\`${data.error}\`\`\``,
        inline: false
      });
    }

    await axios.post(FORGE_WEBHOOK, payload);
  } catch (error) {
    console.error('Error sending forge webhook:', error);
  }
}

export enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface MetaData {
  id: string;
  timestamp: string;
  duration_seconds: number;
  status: string;
  reason: string;
  title: string;
  description: string;
  platform: string;
  arch: string;
  version: string;
  locale: string;
  primary_monitor: {
    width: number;
    height: number;
  };
  quest: {
    title: string;
    app: string;
    icon_url: string;
    objectives: string[];
    content: string;
  };
}

export interface GradeResult {
  summary: string;
  score: number;
  reasoning: string;
}

// Interface for treasury transfer details
export interface TreasuryTransfer {
  tokenAddress: string;
  treasuryWallet: string;
  amount: number;
  timestamp: number;
  txHash?: string;
}

export const forgeRaceSubmissionSchema = new mongoose.Schema(
  {
    _id: { type: String },
    address: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { 
      type: String, 
      enum: Object.values(ProcessingStatus),
      default: ProcessingStatus.PENDING 
    },
    files: [{
      file: String,
      s3Key: String
    }],
    grade_result: {
      type: {
        summary: String,
        score: Number,
        reasoning: String
      },
      required: false
    },
    error: { type: String, required: false },
    reward: { type: Number, required: false },
    maxReward: { type: Number, required: false },
    clampedScore: { type: Number, required: false },
    treasuryTransfer: {
      type: {
        tokenAddress: String,
        treasuryWallet: String,
        amount: Number,
        timestamp: Number,
        txHash: String
      },
      required: false
    }
  },
  { 
    collection: "forge_race_submissions",
    timestamps: true 
  }
);

// Index to help with querying pending submissions
forgeRaceSubmissionSchema.index({ status: 1, createdAt: 1 });

export const ForgeRaceSubmission = mongoose.model("ForgeRaceSubmission", forgeRaceSubmissionSchema);

// Global processing queue
let isProcessing = false;
const processingQueue: string[] = [];

export async function addToProcessingQueue(submissionId: string) {
  processingQueue.push(submissionId);
  processNextInQueue().catch(console.error);
}

export async function processNextInQueue() {
  if (isProcessing || processingQueue.length === 0) return;

  isProcessing = true;
  const submissionId = processingQueue[0];
  let submission = null;

  try {
    submission = await ForgeRaceSubmission.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Update status to processing
    submission.status = ProcessingStatus.PROCESSING;
    await submission.save();

    await notifyForgeWebhook('processing', {
      title: submission.meta.quest.title,
      app: submission.meta.quest.app,
      duration: submission.meta.duration_seconds,
      address: submission.address
    });

    // Run grading pipeline
    const extractDir = path.join('uploads', `extract_${submissionId}`);
    console.log('Running pipeline for directory:', extractDir);
    try {
      // Check if directory exists
      await fs.access(extractDir);
      console.log('Extract directory exists');

      // List directory contents
      const files = await fs.readdir(extractDir);
      console.log('Directory contents:', files);

      await new Promise<void>((resolve, reject) => {
        const process = spawn('/usr/src/app/backend/pipeline-linux-x64', ['-f', 'desktop', '-i', extractDir, '--grade']);

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
          stdout += data;
          console.log('Pipeline stdout:', data.toString());
        });

        process.stderr.on('data', (data) => {
          stderr += data;
          console.error('Pipeline stderr:', data.toString());
        });

        process.on('close', (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            console.error('Pipeline stdout:', stdout);
            console.error('Pipeline stderr:', stderr);
            reject(new Error(`Pipeline failed:\nstdout: ${stdout}\nstderr: ${stderr}`));
          }
        });

        process.on('error', (err) => {
          console.error('Pipeline spawn error:', err);
          reject(err);
        });
      });

      // Check if scores.json exists
      const scoresPath = path.join(extractDir, 'scores.json');
      try {
        await fs.access(scoresPath);
        console.log('scores.json exists');
      } catch (error) {
        console.error('scores.json not found:', error);
        throw new Error('scores.json not found after pipeline run');
      }

      // Read and parse scores.json
      console.log('Reading scores.json');
      const scoresContent = await fs.readFile(scoresPath, 'utf8');
      console.log('scores.json content:', scoresContent);
      const gradeResult: GradeResult = JSON.parse(scoresContent);
      console.log('Parsed grade result:', gradeResult);
      
      // Get pool details and calculate reward
      let reward = undefined;
      let maxReward = undefined;
      let clampedScore = undefined;
      let treasuryTransfer: TreasuryTransfer | undefined = undefined;
      let retries = 3;

      // Get pool details if poolId exists
      console.log('Checking for poolId:', submission.meta.quest.pool_id);
      let pool = null;
      if (submission.meta.quest.pool_id) {
        console.log('Looking up pool:', submission.meta.quest.pool_id);
        pool = await TrainingPoolModel.findById(submission.meta.quest.pool_id);
        console.log('Found pool:', pool ? pool.name : 'null');
      }

      if (submission.meta.quest.pool_id && !pool) {
        throw new Error(`Pool not found: ${submission.meta.quest.pool_id}`);
      }

      if (pool) {
        console.log('Processing pool reward:', pool.name);
        while (retries > 0) {
          try {
            // Verify time is within last 5 minutes
            const now = Date.now();
            const generatedTime = submission.meta.quest.reward.time;
            // if (now - generatedTime > 5 * 60 * 1000) {
            //   throw new Error("Generated time expired");
            // }

            // Recalculate reward
            const hash = createHash('sha256')
              .update(`${submission.meta.quest.pool_id}${submission.address}${generatedTime}${process.env.IPC_SECRET}`)
              .digest('hex');
            
            const rng = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
            maxReward = Math.min(128, Math.ceil(1 / rng));
            
            // Calculate final reward based on grade_result score (clamped 0-100)
            clampedScore = Math.max(0, Math.min(100, gradeResult.score));
            reward = Math.ceil(maxReward * clampedScore / 100);

            // Create treasury transfer record if reward exists
            if (reward && reward > 0) {
              treasuryTransfer = {
                tokenAddress: pool.token.address,
                treasuryWallet: pool.depositAddress,
                amount: reward,
                timestamp: Date.now()
              };
              console.log('Creating treasury transfer for reward:', treasuryTransfer);
              console.log('Creating treasury transfer to address:', submission.address);

              try {
                console.log('Attempting blockchain transfer');
                // Create keypair from private key
                const fromWallet = Keypair.fromSecretKey(
                  Buffer.from(pool.depositPrivateKey, 'base64')
                );

                // Get initial treasury balance
                const blockchainService = new (await import('../services/blockchain/index.js')).default(
                  process.env.RPC_URL || '',
                  ''  // Program ID not needed for token transfers
                );

                const treasuryBalance = await blockchainService.getTokenBalance(
                  pool.token.address,
                  pool.depositAddress
                );
                console.log('Initial treasury balance:', treasuryBalance);

                // Attempt blockchain transfer
                const result = await blockchainService.transferToken(
                  pool.token.address,
                  reward,
                  fromWallet,
                  submission.address
                );

                if (result && treasuryTransfer) {
                  treasuryTransfer.txHash = result.signature;
                }

                // Get final treasury balance
                const finalBalance = await blockchainService.getTokenBalance(
                  pool.token.address,
                  pool.depositAddress
                );
                console.log('Final treasury balance:', finalBalance);

                // Include pool info in webhook
                const poolInfo = {
                  name: pool.name,
                  token: pool.token,
                  treasuryBalance: finalBalance
                };

                await notifyForgeWebhook('success', {
                  title: submission.meta.quest.title,
                  app: submission.meta.quest.app,
                  duration: submission.meta.duration_seconds,
                  score: gradeResult.score,
                  reward,
                  maxReward,
                  clampedScore,
                  summary: gradeResult.summary,
                  feedback: gradeResult.reasoning,
                  treasuryTransfer,
                  address: submission.address,
                  pool: poolInfo
                });
              } catch (error) {
                console.error('Treasury transfer failed:', error);
                // Continue processing but log the error
                await notifyForgeWebhook('transfer-error', {
                  title: submission.meta.quest.title,
                  reward,
                  error: (error as Error).message,
                  address: submission.address,
                  pool: {
                    name: pool.name,
                    token: pool.token
                  }
                });
              }
            }

            break; // Exit retry loop if successful
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.error('Failed to calculate reward:', error);
            } else {
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }

      submission.grade_result = gradeResult;
      submission.reward = reward;
      submission.maxReward = maxReward;
      submission.clampedScore = clampedScore;
      submission.treasuryTransfer = treasuryTransfer;
      submission.status = ProcessingStatus.COMPLETED;
      await submission.save();

    } catch (error) {
      throw new Error(`Failed to process submission: ${(error as Error).message}`);
    }

  } catch (error) {
    const errorMessage = (error as Error).message;
    // Update submission with error
    await ForgeRaceSubmission.findByIdAndUpdate(submissionId, {
      status: ProcessingStatus.FAILED,
      error: errorMessage
    });

    await notifyForgeWebhook('error', {
      error: errorMessage,
      address: submission?.address
    });
  } finally {
    // Remove from queue and reset processing flag
    processingQueue.shift();
    isProcessing = false;

    // Process next item if available
    if (processingQueue.length > 0) {
      processNextInQueue().catch(console.error);
    }
  }
}
