<script lang="ts">
  import {
    Coins,
    Handshake,
    ArrowRight,
    PartyPopper,
    Gauge,
    Wallet,
    ChartPie,
    Lock,
    ExternalLink,
    Database,
    Check,
    Copy,
    HandHeart
  } from 'lucide-svelte';
  import ButtonCta from '$lib/components/ButtonCTA.svelte';
  import OmnisMetrics from '$lib/components/OmniMetrics.svelte';

  const lockContractAddress =
    'https://lock.jup.ag/token/G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump';
  const vestedTreasuryContractAddress =
    'https://lock.jup.ag/token/G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump';
  const rnDVestingContractAddress =
    'https://lock.jup.ag/token/G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump';
  const deployerWalletAddress = '62TsurAEV9LFf7HbsS8HS1JRbbnyEXiHvLwMfsmXE5VT';
  const rnDWalletAddress = '54kpNYwHFPcMZhvFjSkQkgdsNfgfvTfbdkYkYDfiWpFo';
  const marketingWalletAddress = '9hfChuqu3UkEqNi9QQ4R4xUjfSspuNChu5GoiPxACKBG';
  const trainingWalletAddress = '8U5qFfRvhZpoqJrWaCyJ94Mky8qDoNrFoCg7B6mXgCPr';
  const kolsnPartnersWalletAddress = '23fNGGhSHD9NUBHdztKSYPvdf6Wy2Y5qJ2mVq4wdfMNV';

  const TOKEN_DATA = {
    contractAddress: 'G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump'
  };

  let copied = false;
  function copyAddress() {
    navigator.clipboard.writeText(TOKEN_DATA.contractAddress);
    copied = true;
    setTimeout(() => (copied = false), 1000);
  }

  function handleInputClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    event.currentTarget.select();
  }
</script>

<svelte:head>
  <title>Omniminds.ai - $OMNIS</title>
  <meta property="og:title" content="Omniminds.ai - $OMNIS" />
  <meta name="twitter:title" content="Omniminds.ai - $OMNIS" />
  <meta
    name="description"
    content="Incentivizing high-quality AI training data at scale through instant, quality-based rewards." />
  <meta
    name="twitter:description"
    content="Incentivizing high-quality AI training data at scale through instant, quality-based rewards." />
  <meta
    property="og:description"
    content="Incentivizing high-quality AI training data at scale through instant, quality-based rewards." />
</svelte:head>

<main class="min-h-screen">
  <!-- Hero Section -->
  <div class="bg-white py-24">
    <div class="mx-auto max-w-7xl px-4 text-center sm:px-8 lg:px-16">
      <h1
        class="mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
        $OMNIS Token
      </h1>
      <p class="mb-8 text-xl text-gray-600">
        Incentivizing high-quality AI training data at scale through instant, quality-based rewards.
      </p>
      <div class="flex flex-col items-center justify-center gap-6 md:flex-row">
        <div
          class="flex w-full items-center justify-center gap-3 rounded-full border-2 bg-gray-50 px-6 py-2 md:w-1/2">
          <input
            type="text"
            readonly
            value={TOKEN_DATA.contractAddress}
            on:click={handleInputClick}
            class="w-full cursor-pointer truncate bg-transparent font-mono text-gray-900 outline-none hover:text-gray-500" />
          <button
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            on:click={copyAddress}>
            {#if copied}
              <Check class="h-4 w-4 text-green-500" />
            {:else}
              <Copy class="h-4 w-4" />
            {/if}
          </button>
        </div>
        <ButtonCta href={TOKEN_DATA.dexscreenerUrl} target="_blank">
          <Coins class="h-5 w-5" />
          Trade $OMNIS
        </ButtonCta>
      </div>
    </div>

    <!-- Get Started Section -->
    <section class="mt-16 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div class="grid gap-20 md:grid-cols-3">
          <!-- How to Earn -->
          <div>
            <h3 class="mb-6 text-xl font-bold text-gray-900">How do I earn $OMNIS?</h3>
            <p class="mb-6 text-gray-600">
              Use the Training Gym to earn tokens by providing AI training data. Rewards scale with
              data quality.
            </p>
          </div>

          <!-- How to Spend -->
          <div>
            <h3 class="mb-6 text-xl font-bold text-gray-900">How do I spend $OMNIS?</h3>
            <p class="mb-6 text-gray-600">
              Create your own training gyms and fund reward pools. Export gym data to train
              specialized agents.
            </p>
          </div>

          <!-- How to Trade -->
          <div>
            <h3 class="mb-6 text-xl font-bold text-gray-900">Where do I trade $OMNIS?</h3>
            <p class="mb-2 text-gray-600">
              Buy or sell $OMNIS with $USDC or $SOL through secure exchanges:
            </p>
            <a
              href={TOKEN_DATA.dexscreenerUrl}
              target="_blank"
              class="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600">
              View Markets
              <ExternalLink class="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="bg-white py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <OmnisMetrics />
      </div>
    </div>

    <!-- Tokenomics Section -->
    <section class="bg-gradient-to-b from-white to-purple-50/30 py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <h2
          class="mb-16 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-center text-4xl font-bold text-transparent">
          Tokenomics
        </h2>
        <div
          class="group mb-8 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:p-8">
          <div class="mb-6 flex items-center gap-3">
            <div
              class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
              <ChartPie class="h-7 w-7 text-purple-500" />
            </div>
            <h3 class="mb-8 text-2xl font-bold text-gray-900">Breakdown</h3>
          </div>
          <img src="/tokenomics-piechart.png" />
        </div>
        <div class="grid gap-4 sm:p-8 md:grid-cols-2">
          <!-- Locked supply 4.5% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:p-8">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Lock class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Locked Supply</h3>
            </div>
            <p class="mb-6 text-base text-gray-600 sm:text-lg">
              <strong class="text-purple-600">4.5%</strong>
              of the total supply is locked using Jupiter Lock
              <a
                href={lockContractAddress}
                target="_blank"
                class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                View Lock Contract
                <ExternalLink class="h-5 w-5" />
              </a>
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-base text-gray-700 sm:text-lg">Locked until May 2026</span>
              </li>
              <li class="flex min-w-0 items-center gap-3">
                <div class="flex-shrink-0 rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="min-w-0 flex-1 overflow-hidden text-base text-gray-700 sm:text-lg">
                  Redeemed on the pump.fun creator wallet:
                  <a
                    href="https://solscan.io/account/{deployerWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={deployerWalletAddress}>{deployerWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <!-- Treasury supply 4.875% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Wallet class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Vested Treasury</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">4.875%</strong>
              of the total supply is vested over a 6 month period using Jupiter Lock
              <a
                href={vestedTreasuryContractAddress}
                target="_blank"
                class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                View Vesting Contract
                <ExternalLink class="h-5 w-5" />
              </a>
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">Vested until November 2025</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Redeemed on the pump.fun creator wallet:
                  <a
                    href="https://solscan.io/account/{deployerWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={deployerWalletAddress}>{deployerWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <!-- Marketing supply 5.875% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <PartyPopper class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Marketing</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">5.875%</strong>
              of the total supply is budgeted for marketing
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Wallet Address:
                  <a
                    href="https://solscan.io/account/{marketingWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={marketingWalletAddress}>{marketingWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Supply is available for use to fund ongoing marketing activities
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Used to pay for marketing and listing activities
                </span>
              </li>
            </ul>
          </div>

          <!-- R&D supply 7.25% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Database class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Technology R&D</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">7.25%</strong>
              of the total supply is vested over a 6 months period using Jupiter Lock
              <span>
                <a
                  href={rnDVestingContractAddress}
                  target="_blank"
                  class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                  View Vesting Contract
                  <ExternalLink class="h-5 w-5" />
                </a>
              </span>
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Vested to R&D Wallet:
                  <a
                    href="https://solscan.io/account/{rnDWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={rnDWalletAddress}>{rnDWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">Vested until November 2025</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Supply to be used to pay different members working on developing our technology
                </span>
              </li>
            </ul>
          </div>

          <!-- Community & Training supply 4.5% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Gauge class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Community & Training</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">4.5%</strong>
              of the total supply is budgeted for community & training incentives
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Wallet Address:
                  <a
                    href="https://solscan.io/account/{trainingWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={trainingWalletAddress}>{trainingWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Supply is available for use to fund any community incentives and newly launched
                  trainings
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Used to pay for incentivizing community initiatives
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Used to escrow training funds till disbursed to trainers
                </span>
              </li>
            </ul>
          </div>

          <!-- KOLS & Partners 8% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Handshake class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">KOLs & Partners</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">8%</strong>
              of the total supply is budgeted for paying KOLs & facilitating different partnerships
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Wallet Address:
                  <a
                    href="https://solscan.io/account/{kolsnPartnersWalletAddress}"
                    target="_blank"
                    class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                    <pre
                      class="max-w-[250px] truncate"
                      title={kolsnPartnersWalletAddress}>{kolsnPartnersWalletAddress}</pre>
                    <ExternalLink class="h-5 w-5" />
                  </a>
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">Supply is available for use</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Paid initatives from this pool will be vested
                </span>
              </li>
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-purple-100/50 p-2">
                  <ArrowRight class="h-5 w-5 text-purple-500" />
                </div>
                <span class="text-lg text-gray-700">
                  Used to incentivize a vibrant partner ecosystem
                </span>
              </li>
            </ul>
          </div>

          <!-- $VIRAL Holders Airdrop 20% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <HandHeart class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">$VIRAL Holders Airdrop</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">20%</strong>
              were bundled on launch to airdrop to previous $VIRAL holders
              <a
                href="https://github.com/omniminds-ai/viralmind-airdrop"
                target="_blank"
                class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                View Details
                <ExternalLink class="h-5 w-5" />
              </a>
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="rounded-lg bg-green-100/80 p-2">
                  <Check class="h-5 w-5 text-green-500" />
                </div>
                <span class="text-lg text-gray-700">Airdrop completed right after launch</span>
              </li>
            </ul>
          </div>

          <!-- Open Market 55% -->
          <div
            class="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            <div class="mb-6 flex items-center gap-3">
              <div
                class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-blue-50">
                <Coins class="h-7 w-7 text-purple-500" />
              </div>
              <h3 class="mb-8 text-2xl font-bold text-gray-900">Open Market</h3>
            </div>
            <p class="mb-6 text-lg text-gray-600">
              <strong class="text-purple-600">65%</strong>
              are available on the open market post-airdrop (45% at launch + 20% after airdrop.
            </p>
            <p class="mb-6 text-lg text-gray-600">
              <a
                href={TOKEN_DATA.dexscreenerUrl}
                target="_blank"
                class="inline-flex items-center gap-2 font-medium text-purple-500 hover:text-purple-600">
                Trade $OMNIS
                <ExternalLink class="h-5 w-5" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</main>
