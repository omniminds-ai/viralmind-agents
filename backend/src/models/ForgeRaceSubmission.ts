import mongoose from "mongoose";
import { promises as fs } from 'fs';
import * as path from 'path';
import axios from 'axios';

const FORGE_WEBHOOK = process.env.GYM_FORGE_WEBHOOK;

async function notifyForgeWebhook(message: string, details?: { 
  title?: string;
  app?: string;
  duration?: number;
}) {
  if (!FORGE_WEBHOOK) return;
  
  try {
    let content = message;
    
    // Add details if provided
    if (details) {
      content += `\n\n**Task Details**\n`;
      if (details.title) content += `• Title: \`${details.title}\`\n`;
      if (details.app) content += `• App: \`${details.app}\`\n`;
      if (details.duration) content += `• Duration: \`${details.duration}s\`\n`;
    }

    await axios.post(FORGE_WEBHOOK, { content });
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
    error: { type: String, required: false }
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

  try {
    const submission = await ForgeRaceSubmission.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Update status to processing
    submission.status = ProcessingStatus.PROCESSING;
    await submission.save();

    await notifyForgeWebhook(`🎯 **Processing New Submission**`, {
      title: submission.meta.quest.title,
      app: submission.meta.quest.app,
      duration: submission.meta.duration_seconds
    });

    // Read scores.json from extract directory
    const scoresPath = path.join('uploads', `extract_${submissionId}`, 'scores.json');
    try {
      const scoresContent = await fs.readFile(scoresPath, 'utf8');
      const gradeResult: GradeResult = JSON.parse(scoresContent);
      
      submission.grade_result = gradeResult;
      submission.status = ProcessingStatus.COMPLETED;
      await submission.save();

      // Format score message
      let scoreMessage = `✨ **Submission Graded Successfully!**\n\n`;
      scoreMessage += `**Score:** ${gradeResult.score}/100 ${gradeResult.score >= 80 ? '🏆' : '📝'}\n\n`;
      scoreMessage += `**Summary**\n${gradeResult.summary.split('\n').map(line => `• ${line}`).join('\n')}\n\n`;
      scoreMessage += `**Feedback**\n${gradeResult.reasoning}`;

      await notifyForgeWebhook(scoreMessage, {
        title: submission.meta.quest.title,
        app: submission.meta.quest.app,
        duration: submission.meta.duration_seconds
      });
    } catch (error) {
      throw new Error(`Failed to read or parse scores.json: ${(error as Error).message}`);
    }

  } catch (error) {
    const errorMessage = (error as Error).message;
    // Update submission with error
    await ForgeRaceSubmission.findByIdAndUpdate(submissionId, {
      status: ProcessingStatus.FAILED,
      error: errorMessage
    });

    await notifyForgeWebhook(`❌ **Submission Processing Failed**\n\n**Error:** ${errorMessage}`);
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
