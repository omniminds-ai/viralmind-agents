import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { token } from "@coral-xyz/anchor/dist/cjs/utils/index.js";
import axios from 'axios';

class BlockchainService {
  connection: Connection;
  programId: string;
  constructor(solanaRpc: string, programId: string) {
    this.connection = new Connection(solanaRpc, "confirmed");
    this.programId = programId;
  }

  async getTokenBalance(tokenMint: string, walletAddress: string): Promise<number> {
    try {
      console.log('token mint:', tokenMint)
      console.log('treasury:', walletAddress)

      const filters = [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 32,
            bytes: walletAddress,
          },
        },
        {
          memcmp: {
            offset: 0,
            bytes: tokenMint,
          },
        },
      ];

      const accounts = await this.connection.getProgramAccounts(
        TOKEN_PROGRAM_ID,
        { filters }
      );

      if (accounts.length > 0) {
        const info = await this.connection.getTokenAccountBalance(
          accounts[0].pubkey
        );
        return info.value.uiAmount || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting token balance:", error);
      return 0;
    }
  }

  async getQuickNodePriorityFees(): Promise<number> {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      const data = {
        jsonrpc: "2.0",
        id: 1,
        method: "qn_estimatePriorityFees",
        params: { "last_n_blocks": 100, "api_version": 2 },
      };
  
      const response = await axios.post(
        process.env.RPC_URL!,
        data,
        config
      );
  
      console.log('QuickNode priority fees response:', response.data);
      
      // Use QuickNode's recommended fee or fallback to medium priority
      const result = response.data.result;
      // If recommended fee is available, use it, otherwise use medium priority
      return result.recommended || result.per_compute_unit.medium || 500000;
    } catch (error) {
      console.error('Failed to fetch QuickNode priority fees:', error);
      // Return a reasonable default if the API call fails
      return 1_000_000;
    }
  }
  
  async transferToken(
    tokenMint: string, 
    amount: number,
    fromWallet: Keypair,
    toAddress: string
  ): Promise<string | false> {
    try {
      console.log(`Sending ${amount} ${tokenMint} from ${fromWallet.publicKey.toString()} to ${toAddress}`);
      
      // Step 1: Get source token account
      console.log(`1 - Getting Source Token Account`);
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromWallet,
        new PublicKey(tokenMint),
        fromWallet.publicKey
      );
      console.log(`    Source Account: ${sourceAccount.address.toString()}`);
  
      // Step 2: Get destination token account
      console.log(`2 - Getting Destination Token Account`);
      const destinationAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromWallet,
        new PublicKey(tokenMint),
        new PublicKey(toAddress)
      );
      console.log(`    Destination Account: ${destinationAccount.address.toString()}`);
  
      // Step 3: Get token decimals
      console.log(`3 - Fetching Number of Decimals for Mint: ${tokenMint}`);
      const tokenInfo = await this.connection.getParsedAccountInfo(new PublicKey(tokenMint));
      const decimals = (tokenInfo.value?.data as any).parsed.info.decimals;
      console.log(`    Number of Decimals: ${decimals}`);
  
      // Step 4: Get QuickNode priority fees
      console.log(`4 - Fetching QuickNode priority fees`);
      const priorityFee = await this.getQuickNodePriorityFees();
      console.log(`    Using priority fee: ${priorityFee} microLamports`);
  
      // Step 5: Create and send transaction
      console.log(`5 - Creating and Sending Transaction`);
      const transaction = new Transaction();
  
      // Add transfer instruction
      const transferAmount = amount * Math.pow(10, decimals);
      transaction.add(
        createTransferInstruction(
          sourceAccount.address,
          destinationAccount.address,
          fromWallet.publicKey,
          transferAmount
        )
      );
  
      // Add compute budget instructions with QuickNode fee
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 })
      );
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })
      );
  
      // Get latest blockhash
      const latestBlockHash = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = latestBlockHash.blockhash;
      transaction.feePayer = fromWallet.publicKey;
  
      console.log('Transaction details:', {
        instructions: transaction.instructions.length,
        priorityFee,
        recentBlockhash: latestBlockHash.blockhash
      });
  
      // Send and confirm transaction
      console.log('Sending transaction...');
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromWallet],
        {
          commitment: 'confirmed',
          maxRetries: 5
        }
      );
  
      console.log(
        '\x1b[32m', // Green text
        `   Transaction Success!🎉`,
        `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet`
      );
  
      return signature;
  
    } catch (error: any) {
      console.error('\x1b[31m', 'Transfer failed:', { // Red text
        message: error.message,
        logs: error?.logs
      });
      return false;
    }
  }

  // Utility to calculate the discriminator
  calculateDiscriminator(instructionName: string) {
    const hash = createHash("sha256")
      .update(`global:${instructionName}`, "utf-8")
      .digest();
    return hash.slice(0, 8);
  }

  // Verify a transaction

  async verifyTransaction(
    signature: string,
    tournamentPDA: string,
    expectedAmount: number,
    senderWalletAddress: string
  ) {
    try {
      let verified = false;
      // Fetch transaction details
      const transactionDetails = await this.connection.getParsedTransaction(
        signature,
        {
          commitment: "confirmed",
        }
      );

      // Check if transaction exists
      if (!transactionDetails) {
        console.log(`Transaction not found. ${signature}`);
        return verified;
      }

      const { meta, transaction } = transactionDetails;

      // Ensure the transaction was successful
      if (meta?.err) {
        console.log(
          `Transaction ${signature} failed with error: ${JSON.stringify(
            meta.err
          )}`
        );
        return verified;
      }

      // Extract inner instructions
      const innerInstructions = meta?.innerInstructions || [];

      // Initialize variable to hold total transferred lamports
      let totalLamportsSent = 0;

      // Iterate through inner instructions to find system transfers
      for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
          // Check if the instruction is a system program transfer
          // Todo: figure out what is up with these things... are the instructiosn typed incorrectly
          if (
            //@ts-ignore
            instruction.program === "system" &&
            //@ts-ignore
            instruction.parsed &&
            //@ts-ignore
            instruction.parsed.type === "transfer"
          ) {
            //@ts-ignore
            const info = instruction.parsed.info;
            const sender = info.source;
            const recipient = info.destination;
            const lamports = info.lamports;
            if (recipient === tournamentPDA && sender === senderWalletAddress) {
              verified = true;
            }
            // Accumulate lamports
            totalLamportsSent += lamports;
          }
        }
      }

      // After processing all inner instructions, check if any matching transfer was found
      if (totalLamportsSent === 0) {
        console.log(
          `No matching transfers found from sender to recipient. ${signature}`
        );
        return false;
      }

      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const amountReceivedSOL = totalLamportsSent / LAMPORTS_PER_SOL;

      // Calculate tolerance
      const tolerance = expectedAmount * 0.03;
      const isWithinTolerance =
        Math.abs(amountReceivedSOL - expectedAmount) <= tolerance;

      // Verify amount with tolerance
      if (!isWithinTolerance) {
        console.log(
          `Amount mismatch. Expected: ~${expectedAmount} SOL, Received: ${amountReceivedSOL} SOL ${signature}`
        );
        return false;
      }

      // If all verifications pass
      console.log("Transaction verified successfully.");
      console.log(`Sender: ${senderWalletAddress}`);
      console.log(`Recipient: ${tournamentPDA}`);
      console.log(`Total Amount Received: ${amountReceivedSOL} SOL`);
      return verified;
    } catch (error) {
      console.error(
        `Verification failed: ${(error as Error).message} ${signature}`
      );
      return false;
    }
  }

  // Get tournament data
  async getTournamentData(tournamentPDA: string) {
    try {
      // Fetch the account info
      const accountInfo = await this.connection.getAccountInfo(
        new PublicKey(tournamentPDA)
      );
      if (!accountInfo) {
        return false;
      }

      const data = Buffer.from(accountInfo.data);
      // Read authority (first 32 bytes)
      const authority = new PublicKey(data.subarray(8, 40)); // Skip 8-byte discriminator

      // Read state (1 byte)
      const state = data.readUInt8(40);

      // Read entry fee (8 bytes)
      const entryFee = data.readBigUInt64LE(41);

      return {
        authority: authority.toString(),
        state,
        entryFee: Number(entryFee) / LAMPORTS_PER_SOL, // Convert BigInt to number if needed
      };
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      return false;
    }
  }

  //   Conclude Tournament
  async concludeTournament(tournamentPDA: string, winnerAccount: string) {
    try {
      // Load wallet keypair (payer/authority)
      const keypairFile = readFileSync("./secrets/solana-keypair.json");
      const wallet = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(keypairFile.toString()))
      );
      // Fetch tournament account
      const tournamentAccountInfo = await this.connection.getAccountInfo(
        new PublicKey(tournamentPDA)
      );
      if (!tournamentAccountInfo) {
        return false;
      }

      // Define the instruction data for ConcludeTournament
      const discriminator = this.calculateDiscriminator("conclude_tournament");

      // Instruction data is just the discriminator
      const data = Buffer.from(discriminator);

      // Define the accounts involved
      const keys = [
        {
          pubkey: new PublicKey(tournamentPDA),
          isSigner: false,
          isWritable: true,
        }, // Tournament PDA
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Payer/Authority
        {
          pubkey: new PublicKey(winnerAccount),
          isSigner: false,
          isWritable: true,
        }, // Winner account
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System program
      ];

      // Create the instruction
      const instruction = new TransactionInstruction({
        keys,
        programId: new PublicKey(this.programId),
        data,
      });

      // Create the transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Send the transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        [wallet],
        {
          preflightCommitment: "confirmed",
        }
      );

      // Confirm the transaction
      const confirmation = await this.connection.confirmTransaction(
        signature,
        "confirmed"
      );

      console.log("ConcludeTournament transaction signature:", signature);
      return signature;
    } catch (error) {
      console.error("Error concluding tournament:", error);
      return false;
    }
  }
}

export default BlockchainService;
