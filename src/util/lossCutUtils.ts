/**
 * Shared Loss Cut logic (zero risk when one runner +ve, one -ve).
 * Used by ExchMatchOddsTable and ExchBookmakerMarketTable.
 */

export type LossCutResponse = {
    runnerId: string;
    runnerName: string;
    betType: "BACK" | "LAY";
    oddValue: number;
    stake: number;
    riskAfter: { [runnerId: string]: number };
};

export type LossCutRunner = {
    runnerId: string;
    runnerName: string;
};

export type LossCutInput = {
    runnerA: LossCutRunner;
    runnerB: LossCutRunner;
    PA: number;
    PB: number;
    getBestBack: (runner: LossCutRunner) => number | null;
    getBestLay: (runner: LossCutRunner) => number | null;
    minStake: number;
    maxStake: number;
};

const EPSILON = 0.01;

function simulateRiskAfter(
    runnerA: LossCutRunner,
    runnerB: LossCutRunner,
    pA: number,
    pB: number,
    betType: "BACK" | "LAY",
    onRunner: LossCutRunner,
    s: number,
    o: number,
): { [runnerId: string]: number } {
    let a = pA;
    let b = pB;
    const onA = onRunner.runnerId === runnerA.runnerId;

    if (betType === "BACK") {
        const win = (o - 1) * s;
        const lose = -s;
        if (onA) {
            a += win;
            b += lose;
        } else {
            b += win;
            a += lose;
        }
    } else {
        const win = -(o - 1) * s;
        const lose = s;
        if (onA) {
            a += win;
            b += lose;
        } else {
            b += win;
            a += lose;
        }
    }
    return {
        [runnerA.runnerId]: +a.toFixed(2),
        [runnerB.runnerId]: +b.toFixed(2),
    };
}

function checkNonNegative(riskAfter: { [key: string]: number }): boolean {
    return Object.values(riskAfter).every((v) => v >= -EPSILON);
}

/**
 * Computes the loss cut solution when one runner has positive risk and the other negative.
 * Returns the bet (runner, back/lay, odds, stake) that makes post-trade risk non-negative, or null.
 */
export function calLossCut(input: LossCutInput): LossCutResponse | null {
    const {
        runnerA: A,
        runnerB: B,
        PA,
        PB,
        getBestBack,
        getBestLay,
        minStake,
        maxStake,
    } = input;

    const onePosOneNeg =
        (PA > EPSILON && PB < -EPSILON) || (PA < -EPSILON && PB > EPSILON);
    if (!onePosOneNeg) return null;

    let result: LossCutResponse | null = null;

    if (PA > EPSILON && PB < -EPSILON) {
        const pPos = PA;
        const pNegAbs = Math.abs(PB);
        const oA_lay = getBestLay(A);
        const oB_back = getBestBack(B);

        if (Number.isFinite(oA_lay) && oA_lay <= 1 + pPos / pNegAbs) {
            let s = -PB;
            s = Math.max(minStake, Math.min(maxStake, s));
            if (s >= minStake && Number.isFinite(s)) {
                const riskAfter = simulateRiskAfter(
                    A,
                    B,
                    PA,
                    PB,
                    "LAY",
                    A,
                    s,
                    oA_lay,
                );
                if (checkNonNegative(riskAfter)) {
                    result = {
                        runnerId: A.runnerId,
                        runnerName: A.runnerName,
                        betType: "LAY",
                        oddValue: +oA_lay.toFixed(2),
                        stake: +s.toFixed(2),
                        riskAfter,
                    };
                }
            }
        }
        if (
            !result &&
            Number.isFinite(oB_back) &&
            oB_back >= 1 + pNegAbs / pPos
        ) {
            let s = -PB / (oB_back - 1);
            s = Math.max(minStake, Math.min(maxStake, s));
            if (s >= minStake && Number.isFinite(s)) {
                const riskAfter = simulateRiskAfter(
                    A,
                    B,
                    PA,
                    PB,
                    "BACK",
                    B,
                    s,
                    oB_back,
                );
                if (checkNonNegative(riskAfter)) {
                    result = {
                        runnerId: B.runnerId,
                        runnerName: B.runnerName,
                        betType: "BACK",
                        oddValue: +oB_back.toFixed(2),
                        stake: +s.toFixed(2),
                        riskAfter,
                    };
                }
            }
        }
    } else if (PA < -EPSILON && PB > EPSILON) {
        const pNegAbs = Math.abs(PA);
        const pPos = PB;
        const oB_lay = getBestLay(B);
        const oA_back = getBestBack(A);

        if (Number.isFinite(oB_lay) && oB_lay <= 1 + pPos / pNegAbs) {
            let s = -PA;
            s = Math.max(minStake, Math.min(maxStake, s));
            if (s >= minStake && Number.isFinite(s)) {
                const riskAfter = simulateRiskAfter(
                    A,
                    B,
                    PA,
                    PB,
                    "LAY",
                    B,
                    s,
                    oB_lay,
                );
                if (checkNonNegative(riskAfter)) {
                    result = {
                        runnerId: B.runnerId,
                        runnerName: B.runnerName,
                        betType: "LAY",
                        oddValue: +oB_lay.toFixed(2),
                        stake: +s.toFixed(2),
                        riskAfter,
                    };
                }
            }
        }
        if (
            !result &&
            Number.isFinite(oA_back) &&
            oA_back >= 1 + pNegAbs / pPos
        ) {
            let s = -PA / (oA_back - 1);
            s = Math.max(minStake, Math.min(maxStake, s));
            if (s >= minStake && Number.isFinite(s)) {
                const riskAfter = simulateRiskAfter(
                    A,
                    B,
                    PA,
                    PB,
                    "BACK",
                    A,
                    s,
                    oA_back,
                );
                if (checkNonNegative(riskAfter)) {
                    result = {
                        runnerId: A.runnerId,
                        runnerName: A.runnerName,
                        betType: "BACK",
                        oddValue: +oA_back.toFixed(2),
                        stake: +s.toFixed(2),
                        riskAfter,
                    };
                }
            }
        }
    }

    return result;
}

/**
 * Returns the max risk (profit) on the +ve runner after the loss cut bet (for button label).
 */
export function getLossCutProfit(
    response: LossCutResponse | null,
): number | null {
    if (!response?.riskAfter) return null;
    const values = Object.values(response.riskAfter);
    if (values.length === 0) return null;
    const maxRisk = Math.max(...values);
    return Number.isFinite(maxRisk) ? maxRisk : null;
}
