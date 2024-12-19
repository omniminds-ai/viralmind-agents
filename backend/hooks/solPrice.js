import DatabaseService from "../services/db/index.js";

const staticSolPrice = 230;

async function getSolPriceInUSDT() {
  let defaultSolPrice = staticSolPrice;

  try {
    const tokenPage = await DatabaseService.getPages({ name: "jail-token" });
    if (tokenPage?.[0]?.content?.sol_price) {
      defaultSolPrice = tokenPage[0].content.sol_price;
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      if (data?.solana?.usd) {
        return data.solana.usd;
      }
      return defaultSolPrice;
    } catch (err) {
      console.error("Error fetching Sol price from CoinGecko:", err);
      return defaultSolPrice;
    }
  } catch (err) {
    console.error("Error fetching token page:", err);
    return staticSolPrice;
  }
}

export default getSolPriceInUSDT;