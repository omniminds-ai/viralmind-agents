import axios from 'axios';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import BlockchainService from '../blockchain/index.ts';

interface WebhookPayload {
  embeds: Array<{
    title: string;
    description: string;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    color: number; // Discord color integer
  }>;
}

export class TreasuryService {
  private blockchainService: BlockchainService;
  private webhookUrl: string;
  private treasuryKeypair: Keypair;
  private viralToken: string;

  constructor(
    solanaRpc: string,
    webhookUrl: string,
    treasuryWalletPath: string,
    viralToken: string
  ) {
    this.blockchainService = new BlockchainService(solanaRpc, '');
    this.webhookUrl = webhookUrl;
    this.viralToken = viralToken;
    
    // Load treasury wallet
    const treasuryKeyfile = readFileSync(treasuryWalletPath, 'utf-8');
    this.treasuryKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(treasuryKeyfile))
    );
  }

  async transferFromTreasury(
    recipientAddress: string,
    amount: number
  ): Promise<string | false> {
    try {
      const initialBalance = await this.blockchainService.getTokenBalance(
        this.viralToken,
        this.treasuryKeypair.publicKey.toString()
      );

      const result = await this.blockchainService.transferToken(
        this.viralToken,
        amount,
        this.treasuryKeypair,
        recipientAddress
      );

      if (!result) {
        throw new Error('Transfer failed');
      }

      const { signature, usedFeePercentage } = result;

      const finalBalance = await this.blockchainService.getTokenBalance(
        this.viralToken,
        this.treasuryKeypair.publicKey.toString()
      );

      const webhookPayload: WebhookPayload = {
        embeds: [{
          title: '🎉 Treasury Transfer Complete',
          description: 'A new transfer has been processed from the treasury',
          fields: [
            {
              name: '💎 Amount',
              value: `${amount.toLocaleString()} $VIRAL`,
              inline: true
            },
            {
              name: '📤 From',
              value: `[Treasury](https://solscan.io/account/${this.treasuryKeypair.publicKey.toString()})`,
              inline: true
            },
            {
              name: '📥 To',
              value: `[Recipient](https://solscan.io/account/${recipientAddress})`,
              inline: true
            },
            {
              name: '💨 Priority Fee Used',
              value: `${usedFeePercentage}% of base fee`,
              inline: true
            },
            {
              name: '🔗 Transaction',
              value: `[View on Solscan](https://solscan.io/tx/${signature})`,
              inline: false
            },
            {
              name: '💰 Treasury Balance',
              value: `Before: ${initialBalance.toLocaleString()} $VIRAL\nAfter: ${finalBalance.toLocaleString()} $VIRAL`,
              inline: false
            }
          ],
          color: 5793266
        }]
      };

      await axios.post(this.webhookUrl, webhookPayload);

      return signature;
    } catch (error) {
      console.error('Treasury transfer failed:', error);
      
      const errorPayload: WebhookPayload = {
        embeds: [{
          title: '❌ Treasury Transfer Failed',
          description: `Error: ${(error as Error).message}`,
          fields: [
            {
              name: '💎 Attempted Amount',
              value: `${amount.toLocaleString()} $VIRAL`,
              inline: true
            },
            {
              name: '📥 Intended Recipient',
              value: recipientAddress,
              inline: true
            }
          ],
          color: 15158332
        }]
      };

      try {
        await axios.post(this.webhookUrl, errorPayload);
      } catch (webhookError) {
        console.error('Failed to send error webhook:', webhookError);
      }

      return false;
    }
  }
}