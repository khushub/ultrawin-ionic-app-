export const GetBrowserDetail = async () => {
    const userAgent =
        typeof window !== "undefined" && window.navigator
            ? window.navigator.userAgent
            : "Browser Details N/A";
    return userAgent;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const generateAmountButtons = (minAmount, maxAmount, range = 5) => {
    const defaultButtons = [100, 500, 2000, 10000, 50000];

    // ✅ Convert strings to numbers first!
    const min = Number(minAmount);
    const max = Number(maxAmount);

    // Case 1: No min/max amounts or invalid numbers - use default
    if (!min || !max || isNaN(min) || isNaN(max)) {
        return defaultButtons;
    }

    // Case 2: Min and max are same - all buttons same amount
    if (min === max) {
        return Array(range).fill(min);
    }

    // Case 3: Generate Range no. of buttons between min and max
    const count = range;
    const step = (max - min) / (count - 1); // Now this works correctly
    const buttons = [];

    for (let i = 0; i < count; i++) {
        let value = min + i * step; // Numeric addition, not string concatenation
        // Round to nearest multiple of 100
        let roundedValue = Math.round(value / 100) * 100;
        buttons.push(roundedValue);
    }

    // Remove duplicates caused by rounding
    const uniqueButtons = [...new Set(buttons)];

    // If less than range no. of unique buttons after rounding, fill up
    while (uniqueButtons.length < range) {
        if (!uniqueButtons.includes(min)) {
            uniqueButtons.unshift(min);
        } else if (!uniqueButtons.includes(max)) {
            uniqueButtons.push(max);
        } else {
            uniqueButtons.push(min); // fallback
        }
    }

    return uniqueButtons.slice(0, range);
};

export const sessionExposure = (bets) => {
    var runnerProfit = {};
    var totalArr = [];
    var min = 0,
        max = 0;
    for (var j = 0; j < bets.length; j++) {
        if (j == 0) {
            min = parseInt(bets[j].selectionName);
            max = parseInt(bets[j].selectionName);
        } else {
            if (parseInt(bets[j].selectionName) > max)
                max = parseInt(bets[j].selectionName);
            if (parseInt(bets[j].selectionName) < min)
                min = parseInt(bets[j].selectionName);
        }
    }

    for (var i = min - 1; i < max + 1; i++) {
        var result = i;
        var maxLoss = 0;
        for (var bi1 = 0; bi1 < bets.length; bi1++) {
            var b1 = bets[bi1];
            if (b1.type == "Back") {
                if (result >= parseInt(bets[bi1].selectionName)) {
                    maxLoss += Math.round(bets[bi1].rate * bets[bi1].stake);
                } else {
                    maxLoss -= bets[bi1].stake;
                }
            } else {
                if (result < parseInt(bets[bi1].selectionName)) {
                    maxLoss += bets[bi1].stake;
                } else {
                    maxLoss -= Math.round(bets[bi1].rate * bets[bi1].stake);
                }
            }
        }
        runnerProfit[i] = maxLoss;
    }

    var w = null;
    if (w != null) {
        if (runnerProfit[w] == null) {
            runnerProfit[w] = 0;
        }
    }
    for (const t in runnerProfit) {
        totalArr.push(runnerProfit[t]);
    }

    return Math.min.apply(Math, totalArr);
};

export const session_oddExposure = (betsData, marketId) => {
    const sessionBets = betsData.filter((item) => 
        item.marketType === "SESSION_ODDS" && item.marketId === marketId
    );
    
    if (sessionBets.length === 0) return 0;

    const selections = sessionBets.reduce((acc, bet) => {
        const key = bet.runnerId;
        if (!acc[key]) {
            acc[key] = { 
                backStake: 0, backProfit: 0, 
                layStake: 0, layLiability: 0,
                totalStake: 0, totalExposure: 0 
            };
        }
        
        const selection = acc[key];
        selection.totalStake += bet.stake;
        selection.totalExposure += bet.stake * (bet.rate - 1);
        
        if (bet.type === "Back") {
            selection.backStake += bet.stake;
            selection.backProfit += bet.stake * (bet.rate - 1);
        } else {
            selection.layStake += bet.stake;
            selection.layLiability += bet.stake * (bet.rate - 1);
        }
        
        return acc;
    }, {});

    const selectionKeys = Object.keys(selections);
    
    if (selectionKeys.length === 1) {
        const sel = selections[selectionKeys[0]];
        const ifBackWins = sel.backProfit - sel.layLiability;
        const ifLayWins = sel.layStake - sel.backStake;
        return Math.min(ifBackWins, ifLayWins);
    }
    
    let maxValue = 0;
    const selectionValues = Object.values(selections);
    
    for (let i = 0; i < selectionValues.length; i++) {
        for (let j = i + 1; j < selectionValues.length; j++) {
            const s1 = selectionValues[i], s2 = selectionValues[j];
            const diff1 = Math.abs(s1.totalStake - s2.totalExposure);
            const diff2 = Math.abs(s2.totalStake - s1.totalExposure);
            maxValue = Math.max(maxValue, diff1, diff2);
        }
    }
    
    return -maxValue;
};

export const marketProfitCalculate = (betsData, selectionId, marketId) => {

    let laystaketotal = betsData.filter((item) => {
        return item.runnerId != selectionId && item.marketId === marketId;
    });

    let betsValue = betsData.filter((item) => {
        return item.runnerId == selectionId && item.marketId === marketId;
    });

    let backData = betsValue.filter((item) => {
        return item.type == "Back";
    });

    let layData = betsValue.filter((item) => {
        return item.type == "Lay";
    });

    let oppBack = laystaketotal.filter((item) => {
        return item.type == "Back";
    });

    let totalOppBack = 0;
    oppBack.map((b) => {
        totalOppBack = totalOppBack + b.stake;
    });

    let oppLay = laystaketotal.filter((item) => {
        return item.type == "Lay";
    });

    let totalOppLay = 0;
    oppLay.map((b) => {
        totalOppLay = totalOppLay + b.stake;
    });

    let backvalue = 0;
    backData.map((b) => {
        let back = b.stake * (b.rate - 1);
        backvalue = backvalue + back;
    });

    let layvalue = 0;
    layData.map((b) => {
        let lay = b.stake * (b.rate - 1);
        layvalue = layvalue + lay;
    });

    let backtotal = backvalue - totalOppBack;
    let laytotal = totalOppLay - layvalue;

    let markettotal = backtotal + laytotal;
    return markettotal;
};

export const betProfitLossCalculate = (item) => {
    const isBack = item?.type === 'Back';
    const isLost = item?.result === 'LOST';
    
    if (isBack) {
        if (isLost) {
            // Back bet lost - show stake loss
            const loss = item?.eventId === '3046' 
                ? Number(item?.ratestake) * Number(item?.stake)
                : Number(item?.stake);
            
            return loss; // ✅ Returns number
        } else {
            // Back bet won - calculate profit
            let profit = 0;
            
            if (item?.eventTypeId === 'd1') {
                if (item?.eventId === '3046') {
                    profit = (Number(item?.rate) - 1) * Number(item?.ratestake) * Number(item?.stake);
                } else if (
                    (item?.eventId === '3030' && item?.marketType === 'SESSION' && item?.rate !== 2) ||
                    item?.eventId === '3033' || 
                    item?.eventId === '3044'
                ) {
                    profit = Number(item?.rate) * Number(item?.stake);
                } else {
                    profit = (Number(item?.rate) - 1) * Number(item?.stake);
                }
            } else {
                const multiplier = item?.marketType === 'SESSION' 
                    ? Number(item?.rate)
                    : (Number(item?.rate) - 1);
                profit = multiplier * Number(item?.stake);
            }
            
            return profit; // ✅ Returns number (removed toFixed)
        }
    } else {
        // Lay bet
        if (isLost) {
            // Lay bet lost - calculate loss
            const loss = (item?.eventTypeId !== 'd1' && item?.marketType === 'SESSION')
                ? Number(item?.ratestake)
                : Math.abs(Number(item?.ratestake) - Number(item?.stake));
            
            return loss; // ✅ Returns number
        } else {
            // Lay bet won - show stake
            return Number(item?.stake); // ✅ Returns number
        }
    }
};

export const generateFancyLadder = (sessionrunnerProfit) => {
    const keys = Object.keys(sessionrunnerProfit).map(k => +k).sort((a, b) => a - b);
    const min = keys[0];
    const max = keys[keys.length - 1];

    const start = Math.max(min - 3, 0); // Prevent negative scores
    const end = max + 3;

    const fullRange = [];

    for (let score = start; score <= end; score++) {
        let amount = 0;

        // Find the closest key less than or equal to score
        let closestKey = null;

        for (let i = keys.length - 1; i >= 0; i--) {
            if (keys[i] <= score) {
                closestKey = keys[i];
                break;
            }
        }

        // If no key less than score, try next greater key (for leading values)
        if (closestKey === null) {
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] >= score) {
                    closestKey = keys[i];
                    break;
                }
            }
        }

        if (closestKey !== null) {
            amount = sessionrunnerProfit[closestKey];
        }

        fullRange.push({ score, amount });
    }

    return fullRange;
}



export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


export const addToMultiMarket = (
    competitionId,
    eventId,
    marketId,
    providerId,
    sportId,
) => {
    const username = sessionStorage.getItem("username") ?? "";
    if (marketId && username) {
        let data = [];
        const localData = localStorage.getItem(`multiMarket_${username}`) ?? "";
        if (localData) data = JSON.parse(atob(localData));
        const marketInclue = data?.filter((itm) => itm.marketId === marketId);
        if (marketInclue?.length === 0) {
            data.push({
                competitionId,
                eventId,
                marketId,
                providerId,
                sportId,
            });
            localStorage.setItem(
                `multiMarket_${username}`,
                btoa(JSON.stringify(data)),
            );
        }
    }
};

export const removeToMultiMarket = (eventId, marketId) => {
    const username = sessionStorage.getItem("username") ?? "";
    if (username && marketId) {
        let data = [];
        const localData = localStorage.getItem(`multiMarket_${username}`) ?? "";
        if (localData) data = JSON.parse(atob(localData));
        const index = data?.findIndex(
            (itm) => itm.eventId === eventId && itm.marketId === marketId,
        );
        index > -1 && data.splice(index, 1);
        index > -1 &&
            localStorage.setItem(
                `multiMarket_${username}`,
                btoa(JSON.stringify(data)),
            );
    }
};

export const checkIncludeMultiMarket = (marketData, marketId, eventId) => {
    let marketInclue = marketData.filter((itm) => itm.marketId === marketId);
    return marketInclue.length ? true : false;
};