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

  async transferToken(
    tokenMint: string, 
    amount: number,
    fromWallet: Keypair,
    toAddress: string
  ): Promise<string | false> {
    try {
      console.log(`Initiating transfer of ${amount} tokens from ${fromWallet.publicKey.toString()} to ${toAddress}`);
      console.log('Token mint:', tokenMint);

      const fromPublicKey = fromWallet.publicKey;
      const toPublicKey = new PublicKey(toAddress);
      const mintPubkey = new PublicKey(tokenMint);

      // Get ATAs
      const fromAta = await getAssociatedTokenAddressSync(
        mintPubkey,
        fromPublicKey
      );
      console.log('Source ATA:', fromAta.toString());

      // Debug source token account
      console.log('Debugging source token account...');
      const accountInfo = await this.connection.getAccountInfo(fromAta);
      console.log('Raw account info:', {
        exists: !!accountInfo,
        size: accountInfo?.data.length,
        owner: accountInfo?.owner.toString()
      });

      // Get token balance direct check
      try {
        const tokenBalance = await this.connection.getTokenAccountBalance(fromAta);
        console.log('Token balance direct check:', {
          amount: tokenBalance?.value?.amount,
          decimals: tokenBalance?.value?.decimals,
          uiAmount: tokenBalance?.value?.uiAmount
        });
      } catch (e) {
        console.log('Failed to get token balance:', e);
      }

      // Get all token accounts for this owner/mint
      console.log('Checking all token accounts for owner...');
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        fromPublicKey,
        { mint: mintPubkey }
      );
      console.log('All token accounts for this owner/mint:', 
        tokenAccounts.value.map(acc => ({
          pubkey: acc.pubkey.toString(),
          data: acc.account.data
        }))
      );

      // Check if source ATA exists and has sufficient balance
      if (!accountInfo) {
        console.error('Source token account does not exist');
        return false;
      }

      const toAta = await getAssociatedTokenAddressSync(
        mintPubkey,
        toPublicKey
      );
      console.log('Destination ATA:', toAta.toString());

      // Check destination ATA
      const destinationAccount = await this.connection.getAccountInfo(toAta);
      console.log('Destination account exists:', !!destinationAccount);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Create destination ATA if needed
      if (!destinationAccount) {
        console.log('Creating destination ATA...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPublicKey,
            toAta,
            toPublicKey,
            mintPubkey
          )
        );
      }

      // Add transfer instruction
      // Get token decimals from the balance info
      const tokenInfo = await this.connection.getTokenAccountBalance(fromAta);
      const decimals = tokenInfo.value.decimals;
      const amountInSmallestUnit = amount * (10 ** decimals);
      console.log('Transfer amount in smallest unit:', amountInSmallestUnit);
      
      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          fromPublicKey,
          amountInSmallestUnit
        )
      );

      // Add compute budget instructions for higher priority
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 300000
        })
      );
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 50000 // Higher priority fee
        })
      );

      // Get latest blockhash
      const latestBlockhash = await this.connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = fromPublicKey;

      console.log('Transaction details:', {
        numInstructions: transaction.instructions.length,
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: transaction.feePayer.toString()
      });

      console.log('Sending transaction...');
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromWallet]
      );
      
      console.log('Transaction successful:', signature);

      // Log final balances
      try {
        const [sourceBalance, destBalance] = await Promise.all([
          this.connection.getTokenAccountBalance(fromAta),
          this.connection.getTokenAccountBalance(toAta)
        ]);
        
        console.log('Final balances:', {
          source: sourceBalance?.value?.uiAmount ?? 'unknown',
          destination: destBalance?.value?.uiAmount ?? 'unknown'
        });
      } catch (e) {
        console.warn('Failed to fetch final balances:', e);
      }

      return signature;

    } catch (error: any) {
      console.error('Transfer failed:', {
        message: error.message,
        logs: error?.logs,
        details: error
      });

      // Additional error context
      if (error.name === 'TokenAccountNotFoundError') {
        console.error('Detailed error: Token account not found');
      }
      
      // Try to get transaction logs if available
      if (error.signature) {
        try {
          const logs = await this.connection.getTransaction(error.signature);
          console.log('Transaction logs:', logs);
        } catch (e) {
          console.warn('Could not fetch transaction logs:', e);
        }
      }

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
