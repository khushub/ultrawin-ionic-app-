import { isBmSpecialMarket } from "./stringUtil";
export interface MarketWithNames {
    marketName?: string | null;
    customMarketName?: string | null;
    oddType?: string; // GINNIE_ODDS, BACK_ONLY_ODDS
}
export function isBackOnlyMarket(
    market: MarketWithNames | null | undefined,
): boolean {
    if (!market) return false;
    return isBmSpecialMarket(market.marketName, market.oddType);
}
