import { GetBrowserDetail, marketProfitCalculate } from "./helpers";





//-------------------------------------------//
//------------CURRENCY FORMATTER-------------//
//-------------------------------------------//
export const getCurrencyFormat = (value) => {
    const result = new Intl.NumberFormat("en-IN", { currency: "INR" }).format(
        value
    );
    const resultForZero = new Intl.NumberFormat("en-IN", {
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(value);

    if (value === 0) {
        return resultForZero;
    } else return result;
};

export const getCurrencyFormatWithZeroAfterDot = (value) => {
    const result = new Intl.NumberFormat("en-IN", {
        currency: "INR",
        trailingZeroDisplay: "auto",
        minimumFractionDigits: 2,
    }).format(value);
    return result;
};

export const getCurrencyFormatWithoutZeroAfterDot = (value) => {
    const result = new Intl.NumberFormat("en-IN", {
        currency: "INR",
        trailingZeroDisplay: "auto",
        minimumFractionDigits: 0,
    }).format(value);
    return result;
};

export const getCurrencyFormatRoundedOff = (value) => {
    const result = new Intl.NumberFormat("en-IN", {
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
    return result;
};

export const getShortCurrencyFormat = (value) => {
    if (!value) return "0"; 

    const val = Number(value);

    const formatter = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
    });

    if (val >= 10000000) {
        return formatter.format(val / 10000000) + "Cr";
    }
    if (val >= 100000) {
        return formatter.format(val / 100000) + "L";
    }
    if (val >= 1000) {
        return formatter.format(val / 1000) + "K";
    }
    return formatter.format(val);
};



//-------------------------------------------//
//------------Date Time FORMATTER------------//
//-------------------------------------------//
export const get24HourClOCKTime = (ISODate) => {
    const date = new Date(ISODate)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(date.getTime() + istOffset);
    const hours = String(istTime.getUTCHours()).padStart(2, '0');
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export const get12HourClockTime = (ISODate) => {
    const date = new Date(ISODate);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(date.getTime() + istOffset);
    const hours24 = istTime.getUTCHours();
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    const amPm = hours24 < 12 ? 'AM' : 'PM';
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
    return `${String(hours12).padStart(2, '0')}:${minutes} ${amPm}`;
}

export const formatDateWith_MMMMDD = (ISODate) => {
    const inputDate = new Date(ISODate);
    const now = new Date();

    // Get date parts (ignoring time)
    const input = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate difference in days
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = Math.round((input - today) / msPerDay);

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Tomorrow";
    if (dayDiff === -1) return "Yesterday";

    // Format as Month Date (e.g., August 30)
    return inputDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

export const formatTimer = (seconds) => {
    const s = Math.max(0, Math.floor(seconds)); // Ensure non-negative integer
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${secs.toString().padStart(2, '0')}`;
    }
};





//-------------------------------------------//
//---------------Data FORMATTER--------------//
//-------------------------------------------//
export const formatCasinoGamesToGroupedCategory = (gamesArray) => {
    // Group games by category
    const categoryGroups = gamesArray.reduce((acc, game) => {
        const category = game.category;
        
        if (!acc[category]) {
            acc[category] = [];
        }
        
        acc[category].push(game);
        return acc;
    }, {});

    // Convert to desired format
    const groupedData = Object.entries(categoryGroups).map(([category, games]) => {
        // Extract the last part of category and replace underscores with spaces
        const categoryName = category.split('/').pop().replace(/_/g, ' ');
        
        return {
            category: category,
            name: categoryName,
            data: games
        };
    });

    return groupedData;
};

export const formatBetPlacePayload = async(token, betPlacing, ip) => {
    const browserdetail = await GetBrowserDetail();

    const payload = {
        token: token,
        bet: {
            // runnerId: betPlacing.runnerId,
            runnerId: betPlacing?.outcomeId,
            // selectionName: betPlacing.runnerName,
            selectionName: betPlacing?.outcomeDesc,
            // rate: parseFloat(betPlacing.price),
            rate: parseFloat(betPlacing?.oddValue),
            // stake: parseFloat(betPlacing.stake),
            stake: parseFloat(betPlacing?.amount),
            marketId: betPlacing?.marketId,
            marketName: betPlacing?.marketName,
            marketType: betPlacing?.marketType,
            // eventTypeId: betPlacing?.eventTypeId,
            eventTypeId: betPlacing?.sportId,
            eventId: betPlacing?.eventId,
            eventName: betPlacing?.eventName,
            // type: betPlacing.isBack? 'Back' : 'Lay',
            type: betPlacing.betType == 'BACK'? 'Back' : 'Lay',
            browserdetail: browserdetail,
            ipaddress: ip || '',
        }
    }

    if(betPlacing.marketType == 'SESSION') {
        // let rate = betPlacing.size === 0? 1 : betPlacing.size / 100;
        let rate = betPlacing?.oddSize === 0? 1 : betPlacing?.oddSize / 100;
        payload.bet.runnerId = 1;
        // payload.bet.selectionName = betPlacing.price;
        payload.bet.selectionName = betPlacing?.oddValue;
        payload.bet.rate = parseFloat(rate);
    }

    return payload;
}

export const formatCashoutData = (market, openBets) => {
    if(!Array.isArray(openBets) || openBets?.length==0 || !market) return null;

    const requiredBets = openBets.filter(item => item?.marketId == market?.marketId && item?.marketName == market?.marketName);
    if (requiredBets.length === 0) return null;
    const runnerProfits = market?.marketBook?.runners?.map(runner => ({
        runner: runner,
        selectionId: runner.selectionId,
        profit: marketProfitCalculate(requiredBets, runner.selectionId, market.marketId),
        availableToLayPrice: runner.availableToLay?.price
    })) || [];

    if (runnerProfits.length === 0) return null;

    const maxProfitRunner = runnerProfits.reduce((max, current) => 
        current.profit > max.profit ? current : max
    );

    const minProfitRunner = runnerProfits.reduce((min, current) => 
        current.profit < min.profit ? current : min
    );
   
    const biggerProfit = maxProfitRunner.profit;
    const smallerProfit = minProfitRunner.profit;
    const layRunner = maxProfitRunner.runner;
    const currentLayGreenOdds = maxProfitRunner.availableToLayPrice;
    
    let layStake = (biggerProfit - smallerProfit) / currentLayGreenOdds;
    layStake = Math.abs(Math.round(layStake));

    if (!currentLayGreenOdds || layStake === 0) {
        return null;
    }

    return {
        stake: layStake,
        marketId: market?.marketBook?.marketId || market?.marketId,
        marketType: market?.marketType,
        marketName: market?.marketName,
        completeMarket: market,
        runnerId: layRunner.selectionId,
        runnerName: layRunner.runnerName,
        isBack: false,
        eventTypeId: market?.eventTypeId,
        eventId: market?.eventId,
        eventName: market?.eventName,
        price: currentLayGreenOdds,
        prevPrice: currentLayGreenOdds,
        size: layRunner.availableToLay?.size,
        isCashOut: true,
    };
}

export const formatBetDelayData = (data) => {
    return {
        matchoddsBetDelay: data?.oddsBetDelay || 5,
        soccerBetDelay: data?.soccerBetDelay || 5,
        tennisBetDelay: data?.tennisBetDelay || 5,
        bookmakerBetDelay: data?.bookmakerBetDelay || 5,
        fancyBetDelay: data?.fancyBetDelay || 5,
        ballbyballBetDelay: data?.ballbyballBetDelay || 5,
        virtualBetDelay: data?.virtualBetDelay || 5,
    }
}

export const formatMinMaxAll = (data) => {
    return {
        fancyMinLimit: data?.fancyMinLimit || "1",
        fancyMaxLimit: data?.fancyMaxLimit || "100000",
        oddsMinLimit: data?.oddsMinLimit || "1",
        oddsMaxLimit: data?.oddsMaxLimit || "100000",
        bookmakerMinLimit: data?.bookmakerMinLimit || "100",
        bookmakerMaxLimit: data?.bookmakerMaxLimit || "2000000",
        sfancyMinLimit: data?.sfancyMinLimit || "100",
        sfancyMaxLimit: data?.sfancyMaxLimit || "50000",
        soddsMinLimit: data?.soddsMinLimit || "100",
        soddsMaxLimit: data?.soddsMaxLimit || "50000",
        sbookmakerMinLimit: data?.sbookmakerMinLimit || "100",
        sbookmakerMaxLimit: data?.sbookmakerMaxLimit || "50000",
        tfancyMinLimit: data?.tfancyMinLimit || "100",
        tfancyMaxLimit: data?.tfancyMaxLimit || "50000",
        toddsMinLimit: data?.toddsMinLimit || "100",
        toddsMaxLimit: data?.toddsMaxLimit || "50000",
        tbookmakerMinLimit: data?.tbookmakerMinLimit || "100",
        tbookmakerMaxLimit: data?.tbookmakerMaxLimit || "50000",
        tossMaxLimit: data?.tossMaxLimit || "100",
        tossMinLimit: data?.tossMinLimit || "25000",
    }
}

export const buildMarketBetsMap = (openBets) => {
    const map = new Map();
    openBets.forEach(bet => {
        const marketId = (bet?.marketType !== 'SESSION' && bet?.marketType !== 'SESSION_ODDS')? bet?.marketId : bet?.marketType;
        if (!map.has(marketId)) {
            map.set(marketId, []);
        }
        map.get(marketId).push(bet);
    });
    return map;
};

export const buildMarketByIdSet = (markets = []) => {
  return new Set(markets.map(m => m?.marketId));
};

export const minmaxGetter = (minMaxAll, eventTypeId, marketType) => {
    // console.log('minMaxAll: ', minMaxAll);
    // console.log('eventTypeId: ', eventTypeId);
    // console.log('marketType: ', marketType);
    const config = {
        4: {
            SESSION: ["fancyMinLimit", "fancyMaxLimit", 1, 100000],
            Special: ["bookmakerMinLimit", "bookmakerMaxLimit", 100, 2000000],
            Toss: ["tossMinLimit", "tossMaxLimit", 1, 100000],
            default: ["oddsMinLimit", "oddsMaxLimit", 1, 100000],
        },
        2: {
            SESSION: ["tfancyMinLimit", "tfancyMaxLimit", 100, 50000],
            Special: ["tbookmakerMinLimit", "tbookmakerMaxLimit", 100, 50000],
            default: ["toddsMinLimit", "toddsMaxLimit", 100, 50000],
        },
        1: {
            SESSION: ["sfancyMinLimit", "sfancyMaxLimit", 100, 50000],
            Special: ["sbookmakerMinLimit", "sbookmakerMaxLimit", 100, 50000],
            default: ["soddsMinLimit", "soddsMaxLimit", 100, 50000],
        },
        default: {
            default: ["soddsMinLimit", "soddsMaxLimit", 100, 50000],
        },
    };

    const eventConfig = config[Number(eventTypeId)] || config.default;
    const [minKey, maxKey, minFallback, maxFallback] = eventConfig[marketType] || eventConfig.default;

    return {
        min: minMaxAll?.[minKey] ?? minFallback,
        max: minMaxAll?.[maxKey] ?? maxFallback,
    };
};

export const betDelayGetter = (betDelay, eventTypeId, marketType) => {
    const defaultDelay = 5;
    const delays = betDelay || {};
    
    const delayMap = {
        Special: delays.bookmakerBetDelay,
        SESSION: delays.fancyBetDelay,
        v9: delays.virtualBetDelay,
        b9: delays.ballbyballBetDelay,
        '1': delays.soccerBetDelay,
        '2': delays.tennisBetDelay,
    };

    const key = marketType === 'Special' || marketType === 'SESSION'
        ? marketType
        : eventTypeId;

    return parseInt(delayMap[key] ?? delays.matchoddsBetDelay ?? defaultDelay, 10);
}




//-------------------------------------------//
//------------Bank Info Formatter------------//
//-------------------------------------------//
export const formatAccountNumber = (accNumber, groupSize = 4, separator = ' ') => {
    if (!accNumber) return '';

    // Convert to string and remove any existing spaces/separators
    const cleanNumber = accNumber.toString().replace(/\s+/g, '');

    // Split into groups and join with separator
    return cleanNumber.replace(new RegExp(`(.{${groupSize}})`, 'g'), `$1${separator}`).trim();
};