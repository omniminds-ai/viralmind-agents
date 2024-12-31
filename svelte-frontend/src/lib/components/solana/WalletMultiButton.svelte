<script lang="ts">
    import { type Adapter } from "@solana/wallet-adapter-base";
    import { walletStore, type Wallet } from "../../walletStore";
    import { fade, fly } from 'svelte/transition';
    import { Connection, PublicKey } from "@solana/web3.js";
    import { Clock, Copy, LogOut, Coins, ExternalLink, ChevronRight } from 'lucide-svelte';

    let tokenBalance: number | null = null;
    const VIRAL_TOKEN = new PublicKey("HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump");
    const connection = new Connection("https://snowy-delicate-sponge.solana-mainnet.quiknode.pro/99269d0ad3e8500a9423bbeea089c8caf45a98aa", "confirmed");

    async function getTokenBalanceWeb3(connection: Connection, tokenAccount: PublicKey) {
        const info = await connection.getTokenAccountBalance(tokenAccount);
        if (info.value.uiAmount == null) throw new Error('No balance found');
        console.log('Balance (using Solana-Web3.js): ', info.value.uiAmount);
        return info.value.uiAmount;
    }

    async function getTokenBalance() {
        if (!$walletStore.publicKey) return;
        try {
            // Get token account address
            const filters = [
                {
                    dataSize: 165
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: $walletStore.publicKey.toBase58()
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
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // Token Program ID
                { filters }
            );
            
            if (accounts.length > 0) {
                tokenBalance = await getTokenBalanceWeb3(connection, accounts[0].pubkey);
            } else {
                tokenBalance = 0;
            }
        } catch (error) {
            console.error("Error fetching token balance:", error);
            tokenBalance = 0;
        }
    }

    $: if ($walletStore.connected) {
        getTokenBalance();
    }

    const byInstalledStatus = (a: Wallet, b: Wallet) => {
        if (a.readyState === "Installed" && b.readyState !== "Installed") {
            return -1;
        }
        if (a.readyState !== "Installed" && b.readyState === "Installed") {
            return 1;
        }
        return 0;
    };
    $: installedWalletAdaptersWithReadyState = $walletStore.wallets
        .filter((walletAdapterAndReadyState) => {
            return walletAdapterAndReadyState.readyState === "Installed";
        })
        .sort((walletAdapterAndReadyStateA, walletAdapterAndReadyStateB) => {
            return byInstalledStatus(
                walletAdapterAndReadyStateA,
                walletAdapterAndReadyStateB,
            );
        });

    async function handleConnect(wallet: Adapter) {
        $walletStore.select(wallet.name);
        await $walletStore.connect();
    }

    async function copyToClipboard() {
        await navigator.clipboard.writeText($walletStore.publicKey!.toBase58());
    }

    async function handleDisconnect() {
        await $walletStore.disconnect();
    }

    function abbrAddress(address: string) {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
</script>

{#if $walletStore.connected}
    <div class="relative inline-block">
        <button 
            id="connected-wallet-btn" 
            popovertarget="connected-wallet-menu"
            class="flex items-center py-1 pl-4 pr-5 bg-black text-white rounded-full shadow-lg border-2 border-transparent hover:border-purple-500/50 hover:border-blue-500/50 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-200"
    >
        <img
            alt="icon of {$walletStore!.adapter!.name}"
            src={$walletStore!.adapter!.icon}
            class="w-5 h-5 mr-2"
        />
        <span class="font-medium">{abbrAddress($walletStore.publicKey!.toBase58())}</span>
    </button>
    <ul 
        id="connected-wallet-menu" 
        popover="manual" 
        class="min-w-[280px] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-3 fixed right-4 top-[4.5rem] font-[-apple-system,system-ui] animate-in fade-in slide-in-from-top-2 duration-200 z-[99999]"
    >
        <li>
            <div class="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Coins class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                    <div class="font-medium text-white">$VIRAL Balance</div>
                    <div class="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                        {#if tokenBalance === null}
                            <div class="flex items-center gap-2">
                                <Clock class="w-4 h-4 text-gray-400" />
                                <span class="text-gray-400 text-sm">Loading...</span>
                            </div>
                        {:else}
                            {tokenBalance.toLocaleString()}
                        {/if}
                    </div>
                </div>
            </div>
        </li>
        <li>
            <button 
                onclick={copyToClipboard}
                class="w-full text-left px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all duration-200 flex items-center gap-3"
            >
                <Copy class="w-5 h-5 text-gray-500" />
                <div>
                    <div class="font-medium text-white">Copy Address</div>
                    <div class="text-sm text-gray-400">Copy your wallet address to clipboard</div>
                </div>
            </button>
        </li>
        <li>
            <button 
                onclick={handleDisconnect}
                class="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-3"
            >
                <LogOut class="w-5 h-5" />
                <div>
                    <div class="font-medium">Disconnect Wallet</div>
                    <div class="text-sm text-red-400">Sign out of your wallet</div>
                </div>
            </button>
        </li>
    </ul>
    </div>
{:else}
    <div class="relative inline-block">
        <button 
        id="select-wallet-btn" 
        popovertarget="select-wallet-modal"
        class="py-1 pl-4 pr-5 bg-black text-white rounded-full shadow-lg border-2 border-transparent hover:border-purple-500/50 hover:border-blue-500/50 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-200 font-medium tracking-tight"
    >
        Connect Solana Wallet
    </button>
    <div 
        id="select-wallet-modal" 
        popover="manual"
        class="min-w-[320px] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-3 fixed right-4 top-[4.5rem] font-[-apple-system,system-ui] animate-in fade-in slide-in-from-top-2 duration-200 z-[99999]"
    >
        {#if installedWalletAdaptersWithReadyState.length === 0}
            <div class="p-6 text-center" transition:fade>
                <div class="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mx-auto mb-5 flex items-center justify-center">
                    <Coins class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-semibold text-white mb-2 tracking-tight">No Wallet Found</h3>
                <p class="text-gray-400 mb-5 leading-relaxed">Install Phantom or another Solana wallet to continue</p>
                <a 
                    href="https://phantom.app/download" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-all duration-200 font-medium tracking-tight shadow-sm hover:shadow-md"
                >
                    Get Phantom Wallet
                    <ExternalLink class="w-4 h-4 ml-2" />
                </a>
            </div>
        {:else}
            <div class="space-y-0.5" transition:fade>
                {#each installedWalletAdaptersWithReadyState as wallet}
                    <li>
                        {#if !wallet.adapter.connected}
                            <button
                                onclick={async () => {
                                    await handleConnect(wallet.adapter);
                                }}
                                type="button"
                                class="w-full flex items-center px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 group relative"
                            >
                                <img
                                    alt="icon of {wallet.adapter.name}"
                                    src={wallet.adapter.icon}
                                class="w-8 h-8 mr-4 group-hover:scale-105 transition-transform duration-200"
                                />
                                <div>
                                    <div class="text-white font-medium tracking-tight">{wallet.adapter.name}</div>
                                    <div class="text-sm text-gray-400">Click to connect your wallet</div>
                                </div>
                                <ChevronRight class="w-5 h-5 text-gray-400 absolute right-4" />
                            </button>
                        {/if}
                    </li>
                {/each}
            </div>
            {/if}
        </div>
    </div>
{/if}
