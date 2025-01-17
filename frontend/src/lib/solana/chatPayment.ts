import { get } from 'svelte/store';
import { walletStore } from "../walletStore";
import {
    SystemProgram,
    PublicKey,
    Transaction,
    Connection,
    TransactionInstruction
} from "@solana/web3.js";
import { hashString } from "../utils";

interface PaymentOptions {
    messagePrice: number;
    tournamentPDA: string;
    programId: string;
    challengeName: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export async function processPayment(message: string, options: PaymentOptions) {
    const { messagePrice, tournamentPDA, programId, challengeName, onSuccess, onError } = options;
    const wallet = get(walletStore);

    if (!wallet.connected || !wallet.publicKey) {
        onError("Please connect your wallet first");
        return;
    }

    try {
        const connection = new Connection(
            'https://snowy-delicate-sponge.solana-mainnet.quiknode.pro/99269d0ad3e8500a9423bbeea089c8caf45a98aa',
            "confirmed"
        );

        // Verify tournament account exists
        const tournamentAccountInfo = await connection.getAccountInfo(
            new PublicKey(tournamentPDA)
        );

        if (!tournamentAccountInfo) {
            throw new Error("Tournament account not found");
        }

        // Create solution hash
        const solutionHash = await hashString(message);
        
        // Calculate discriminator for submit_solution
        const discriminatorText = new TextEncoder().encode("global:submit_solution");
        const discriminatorHash = await crypto.subtle.digest('SHA-256', discriminatorText);
        const discriminator = new Uint8Array(discriminatorHash.slice(0, 8));
        
        // Combine discriminator and solution hash
        const data = new Uint8Array(discriminator.length + solutionHash.length);
        data.set(discriminator);
        data.set(solutionHash, discriminator.length);

        // Setup transaction instruction
        const keys = [
            {
                pubkey: new PublicKey(tournamentPDA),
                isSigner: false,
                isWritable: true,
            },
            { 
                pubkey: wallet.publicKey, 
                isSigner: true, 
                isWritable: true 
            },
            { 
                pubkey: SystemProgram.programId, 
                isSigner: false, 
                isWritable: false 
            },
        ];

        const instruction = new TransactionInstruction({
            keys,
            programId: new PublicKey(programId),
            data,
        });

        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();

        // Create legacy transaction
        const transaction = new Transaction()
            .add(instruction);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // Send transaction
        const signature = await wallet.sendTransaction(
            transaction,
            connection,
            { maxRetries: 5 }
        );

        // Confirm transaction
        await connection.confirmTransaction(signature, "confirmed");

        // Submit to backend after payment confirmation
        const response = await fetch(`/api/conversation/submit/${challengeName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: message,
                walletAddress: wallet.publicKey.toString(),
                signature: signature.toString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit message to backend');
        }

        onSuccess();
    } catch (err) {
        console.error("Payment processing error:", err);
        onError(err instanceof Error ? err.message : "Payment failed");
    }
}
