// multiMarketSlice.js
import { createSlice } from "@reduxjs/toolkit";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getMatchOddsSet = (prices) => {
    const pricesSet = [];
    if (prices?.length > 0) {
        for (let i = 0; i < 3; i++) {
            pricesSet.push(prices[i] ?? { price: null, size: null });
        }
    }
    return pricesSet;
};

const getSuspendValue = (
    suspendMarketsMap,
    providerId,
    sportId,
    competitionId,
    dtoEventId,
    dtoMarketType,
    dtoMarketId,
    dtoSuspend,
) => {
    const key = `${dtoEventId}:${dtoMarketId}`;
    if (dtoSuspend !== undefined) {
        suspendMarketsMap[key] = {
            providerId,
            sportId,
            competitionId,
            eventId: dtoEventId,
            marketType: dtoMarketType,
            marketId: dtoMarketId,
            suspend: dtoSuspend,
        };
        return dtoSuspend;
    }
    return suspendMarketsMap[key]?.suspend ?? false;
};

const getDisableValue = (
    disableMarketsMap,
    providerId,
    sportId,
    competitionId,
    dtoEventId,
    dtoMarketType,
    dtoMarketId,
    dtoDisable,
) => {
    const key = `${dtoEventId}:${dtoMarketId}`;
    if (dtoDisable !== undefined) {
        disableMarketsMap[key] = {
            providerId,
            sportId,
            competitionId,
            eventId: dtoEventId,
            marketType: dtoMarketType,
            marketId: dtoMarketId,
            disable: dtoDisable,
        };
        return dtoDisable;
    }
    return disableMarketsMap[key]?.disable ?? false;
};

const sortByMarketName = (a, b) =>
    a.marketName > b.marketName ? 1 : a.marketName < b.marketName ? -1 : 0;

const sortBySort = (a, b) => (a.sort > b.sort ? 1 : a.sort < b.sort ? -1 : 0);

const buildBookmakerRunner = (b) => ({
    runnerId: b.runnerId ?? "",
    runnerName: b.runnerName ?? "",
    backPrice: b.backPrices[0]?.price,
    backSize: b.backPrices[0]?.size,
    layPrice: b.layPrices[0]?.price,
    laySize: b.layPrices[0]?.size,
    status: b.status ?? "",
    sort: b.sort,
});

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
    multiMarketData: {},
    secondaryMultiMatchOddsMap: {},
    secondaryMultiMarketsMap: {},
    suspendedMarketsMap: {},
    disabledMarketsMap: {},
    triggerFetchMarkets: null,
    triggerFetchOrders: null,
    triggerBetStatus: null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const multiMarketSlice = createSlice({
    name: "multiMarket",
    initialState,
    reducers: {
        setMultiMarketEventData(state, action) {
            const events = action.payload.events || [action.payload];
            const suspendMarketsMap = state.suspendedMarketsMap;

            for (const eventPayload of events) {
                const { sportId, competitionId, eventId } = eventPayload;
                if (!eventPayload.eventData) continue;

                const mapKey = `${sportId}-${competitionId}-${eventId}`;
                const existing = state.multiMarketData[mapKey];
                let eData = existing
                    ? { ...existing }
                    : { ...eventPayload.eventData };

                const limitMap = new Map();
                if (existing) {
                    limitMap.set(
                        existing.matchOdds?.marketId,
                        existing.matchOdds?.marketLimits,
                    );
                }

                if (!eData.eventId || eData.eventId === "undefined") continue;

                // Resolve team names
                let homeTeam = eData.homeTeam || "";
                let awayTeam = eData.awayTeam || "";
                if (!homeTeam && !awayTeam && eData.eventName) {
                    const name = eData.eventName;
                    const sep = name.toLowerCase().includes(" v ")
                        ? " v "
                        : name.includes(" VS ")
                          ? " VS "
                          : name.includes(" Vs ")
                            ? " Vs "
                            : " vs ";
                    const parts = name.split(sep);
                    homeTeam = parts[0]?.trim() ?? "";
                    awayTeam = parts[1]?.trim().split(" - ")[0] ?? "";
                }

                // Build runners
                const matchOddsData = eventPayload.matchOddsData;
                const runners = [];

                if (matchOddsData) {
                    const suspend = getSuspendValue(
                        suspendMarketsMap,
                        eData.providerId,
                        eData.sportId,
                        eData.competitionId,
                        eData.eventId,
                        eData.marketType,
                        eData.marketId,
                        matchOddsData.suspended,
                    );

                    let i = 0;
                    for (const e of matchOddsData.runners ?? []) {
                        if (!e) continue;
                        let runnerName = e.runnerName ?? e.RunnerName ?? "";

                        if (
                            !runnerName.toLowerCase().includes("draw") &&
                            i === 0
                        ) {
                            if (!runnerName) runnerName = homeTeam;
                            else if (runnerName !== awayTeam)
                                homeTeam = runnerName;
                        }
                        if (
                            !runnerName.toLowerCase().includes("draw") &&
                            i !== 0
                        ) {
                            if (!runnerName) runnerName = awayTeam;
                            else if (runnerName !== homeTeam)
                                awayTeam = runnerName;
                        }
                        i++;

                        runners.push({
                            runnerId: e.runnerId,
                            runnerName,
                            backPrices: getMatchOddsSet(e.backPrices),
                            layPrices: getMatchOddsSet(e.layPrices),
                            status: e.status,
                            clothNumber: e.clothNumber,
                            jockeyName: e.jockeyName,
                            runnerAge: e.runnerAge,
                            runnerIcon: e.runnerIcon,
                            stallDraw: e.stallDraw,
                            trainerName: e.trainerName,
                        });
                    }

                    const bLimits = eData.matchOdds?.limits;
                    eData.matchOdds = {
                        marketId: matchOddsData.marketId ?? "",
                        marketName: matchOddsData.marketName ?? "",
                        status: matchOddsData.status ?? "",
                        runners,
                        limits: matchOddsData.limits ?? bLimits,
                        marketLimits:
                            matchOddsData.marketLimits ??
                            limitMap.get(matchOddsData.marketId),
                        suspend,
                    };
                } else {
                    const matchOdds = eData.matchOdds;
                    eData.matchOdds = matchOdds
                        ? {
                              ...matchOdds,
                              status: "SUSPENDED",
                              suspend: true,
                              marketLimits:
                                  matchOdds.marketLimits ??
                                  limitMap.get(matchOdds.marketId),
                          }
                        : {
                              marketId: "",
                              marketName: "",
                              status: "SUSPENDED",
                              runners: [],
                              limits: null,
                              suspend: true,
                          };
                }

                eData.homeTeam = homeTeam;
                eData.awayTeam = awayTeam;
                eData.eventSlug =
                    eData.eventSlug ||
                    (eData.eventName
                        ? eData.eventName
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, " ")
                              .replace(/ +/g, " ")
                              .trim()
                              .split(" ")
                              .join("-")
                        : "");

                state.multiMarketData[mapKey] = eData;
            }
        },

        updateMultiSecondaryMatchOdds(state, action) {
            const { sportId, competitionId, eventId, marketId, matchOddsData } =
                action.payload;
            const mapKey = `${sportId}-${competitionId}-${eventId}-${marketId}`;
            const suspendMarketsMap = state.suspendedMarketsMap;
            const disabledMarketsMap = state.disabledMarketsMap;
            const existing = state.secondaryMultiMatchOddsMap[mapKey];

            if (matchOddsData) {
                const suspend = getSuspendValue(
                    suspendMarketsMap,
                    "-",
                    sportId,
                    competitionId,
                    eventId,
                    matchOddsData.marketType,
                    matchOddsData.marketId,
                    matchOddsData.suspended,
                );
                const disable = getDisableValue(
                    disabledMarketsMap,
                    "-",
                    sportId,
                    competitionId,
                    eventId,
                    matchOddsData.marketType,
                    matchOddsData.marketId,
                    matchOddsData.disabled,
                );

                const existingRunners = existing?.runners ?? [];
                const runners = (matchOddsData.runners ?? [])
                    .filter(Boolean)
                    .map((e) => {
                        const prev = existingRunners.find(
                            (r) => r.runnerId === e.runnerId,
                        );
                        return {
                            runnerId: e.runnerId,
                            runnerName: e.runnerName,
                            backPrices: getMatchOddsSet(e.backPrices),
                            layPrices: getMatchOddsSet(e.layPrices),
                            status: e.status,
                            clothNumber:
                                e.clothNumber ?? prev?.clothNumber ?? "",
                            jockeyName: e.jockeyName ?? prev?.jockeyName ?? "",
                            runnerAge: e.runnerAge ?? prev?.runnerAge ?? "",
                            runnerIcon: e.runnerIcon ?? prev?.runnerIcon ?? "",
                            stallDraw: e.stallDraw ?? prev?.stallDraw ?? "",
                            trainerName:
                                e.trainerName ?? prev?.trainerName ?? "",
                        };
                    });

                state.secondaryMultiMatchOddsMap[mapKey] = {
                    marketId: matchOddsData.marketId,
                    marketName: matchOddsData.marketName,
                    marketTime: matchOddsData.marketTime,
                    status: matchOddsData.status,
                    runners,
                    limits: matchOddsData.limits ?? existing?.limits,
                    marketLimits:
                        matchOddsData.marketLimits ?? existing?.marketLimits,
                    suspend,
                    disable,
                };
            } else if (existing) {
                state.secondaryMultiMatchOddsMap[mapKey] = {
                    ...existing,
                    status: "SUSPENDED",
                    suspend: true,
                    disable: true,
                };
            } else {
                state.secondaryMultiMatchOddsMap[mapKey] = {
                    marketId: "",
                    marketName: "",
                    status: "SUSPENDED",
                    runners: [],
                    limits: null,
                    suspend: true,
                };
            }
        },

        updateMultiSecondaryMarkets(state, action) {
            const {
                sportId,
                competitionId,
                eventId,
                bookmakerOddsData,
                enableBookmaker,
            } = action.payload;
            if (!eventId) return;

            const mapKey = `${sportId}-${competitionId}-${eventId}`;
            const suspendMarketsMap = state.suspendedMarketsMap;
            const disabledMarketsMap = state.disabledMarketsMap;

            if (!state.secondaryMultiMarketsMap[mapKey]) {
                state.secondaryMultiMarketsMap[mapKey] = {
                    bookmakers: [],
                    enableBookmaker: false,
                    fancyMarkets: [],
                    enableFancy: false,
                };
            }

            let bookMakerOdds = [];
            if (bookmakerOddsData?.length > 0) {
                for (const br of bookmakerOddsData) {
                    const suspend = getSuspendValue(
                        suspendMarketsMap,
                        "-",
                        sportId,
                        competitionId,
                        eventId,
                        br.marketType,
                        br.marketId,
                        br.suspended,
                    );
                    const disable = getDisableValue(
                        disabledMarketsMap,
                        "-",
                        sportId,
                        competitionId,
                        eventId,
                        br.marketType,
                        br.marketId,
                        br.disabled,
                    );
                    const bmRunners = br.runners
                        .map(buildBookmakerRunner)
                        .sort(sortBySort);

                    bookMakerOdds.push({
                        suspend,
                        disable,
                        marketId: br.marketId ?? "-1",
                        marketName: br.marketName ?? "Bookmaker",
                        customMarketName: br.customMarketName ?? "Bookmaker",
                        runners: bmRunners,
                        status: br.status ?? "OPEN",
                        commissionEnabled: br.commissionEnabled ?? false,
                        marketLimits: br.marketLimits,
                    });
                }
            } else {
                bookMakerOdds = (
                    state.secondaryMultiMarketsMap[mapKey]?.bookmakers ?? []
                ).map((bm) => ({
                    ...bm,
                    suspend: true,
                    disable: true,
                    runners: bm.runners.map((r) => ({
                        ...r,
                        backPrice: "0",
                        layPrice: "0",
                    })),
                }));
            }

            state.secondaryMultiMarketsMap[mapKey].bookmakers =
                bookMakerOdds.sort(sortByMarketName);
            state.secondaryMultiMarketsMap[mapKey].enableBookmaker =
                enableBookmaker;
        },

        updateMultiBookMakerMarkets(state, action) {
            const {
                sportId,
                competitionId,
                eventId,
                bookmakerOddsData,
                enableBookmaker,
            } = action.payload;
            if (!eventId) return;

            const mapKey = `${sportId}-${competitionId}-${eventId}`;
            const suspendMarketsMap = state.suspendedMarketsMap;
            const disabledMarketsMap = state.disabledMarketsMap;

            if (!state.secondaryMultiMarketsMap[mapKey]) {
                state.secondaryMultiMarketsMap[mapKey] = {
                    bookmakers: [],
                    enableBookmaker: false,
                };
            }

            const oddsArray = Array.isArray(bookmakerOddsData)
                ? bookmakerOddsData
                : [bookmakerOddsData];
            let bookMakerOdds = [
                ...(state.secondaryMultiMarketsMap[mapKey].bookmakers ?? []),
            ];

            for (const br of oddsArray) {
                const suspend = getSuspendValue(
                    suspendMarketsMap,
                    "-",
                    sportId,
                    competitionId,
                    eventId,
                    br.marketType,
                    br.marketId,
                    br.suspended,
                );
                const disable = getDisableValue(
                    disabledMarketsMap,
                    "-",
                    sportId,
                    competitionId,
                    eventId,
                    br.marketType,
                    br.marketId,
                    br.disabled,
                );
                const bmRunners = br.runners
                    .map(buildBookmakerRunner)
                    .sort(sortBySort);

                const index = bookMakerOdds.findIndex(
                    (itm) => itm.marketId === br.marketId,
                );
                const updated = {
                    suspend,
                    disable,
                    marketId: br.marketId ?? "-1",
                    marketName: br.marketName ?? "Bookmaker",
                    customMarketName: br.customMarketName ?? "Bookmaker",
                    runners: bmRunners,
                    status: br.status ?? "OPEN",
                    commissionEnabled:
                        br.commissionEnabled ??
                        (index > -1
                            ? bookMakerOdds[index].commissionEnabled
                            : false),
                    marketLimits:
                        br.marketLimits ??
                        (index > -1
                            ? bookMakerOdds[index].marketLimits
                            : undefined),
                };

                if (index > -1) bookMakerOdds[index] = updated;
                else bookMakerOdds.push(updated);
            }

            state.secondaryMultiMarketsMap[mapKey].bookmakers =
                bookMakerOdds.sort(sortByMarketName);
            state.secondaryMultiMarketsMap[mapKey].enableBookmaker =
                enableBookmaker;
        },

        updateMultiSuspendedMarkets(state, action) {
            const suspendedMarket = action.payload;
            const { sportId, competitionId, eventId, marketType, marketId } =
                suspendedMarket;
            const key = `${eventId}:${marketId}`;
            state.suspendedMarketsMap[key] = suspendedMarket;

            if (marketType === "MATCH_ODDS") {
                const event =
                    state.multiMarketData[
                        `${sportId}-${competitionId}-${eventId}`
                    ];
                if (event?.matchOdds?.marketId === marketId) {
                    event.matchOdds.suspend = suspendedMarket.suspend;
                }
                const secMarket =
                    state.secondaryMultiMatchOddsMap[
                        `${sportId}-${competitionId}-${eventId}-${marketId}`
                    ];
                if (secMarket) secMarket.suspend = suspendedMarket.suspend;
            } else if (marketType === "BOOKMAKER") {
                const bookmakers =
                    state.secondaryMultiMarketsMap[
                        `${sportId}-${competitionId}-${eventId}`
                    ]?.bookmakers;
                const bm = bookmakers?.find((b) => b.marketId === marketId);
                if (bm) bm.suspend = suspendedMarket.suspend;
            }
        },

        updateMultiCommissionMarkets(state, action) {
            const {
                sportId,
                competitionId,
                eventId,
                marketType,
                marketId,
                commission,
            } = action.payload;
            if (marketType !== "BOOKMAKER") return;

            const bookmakers =
                state.secondaryMultiMarketsMap[
                    `${sportId}-${competitionId}-${eventId}`
                ]?.bookmakers;
            const bm = bookmakers?.find((b) => b.marketId === marketId);
            if (bm) bm.commissionEnabled = commission;
        },

        triggerMultiFetchMarkets(state, action) {
            const {
                accountPath,
                data: { limitKey },
            } = action.payload;
            let trigger = false;

            if (accountPath) {
                trigger = accountPath.includes(limitKey);
            } else {
                const searchKey = limitKey + "/";
                for (const key of Object.keys(state.multiMarketData)) {
                    const ids = key.split("-");
                    const checkKey = searchKey.includes("/EI/")
                        ? `/EI/${ids[2]}/`
                        : searchKey.includes("/CI/")
                          ? `/CI/${ids[1]}/`
                          : searchKey.includes("/SI/")
                            ? `/SI/${ids[0]}/`
                            : searchKey.includes("/SPORTS/")
                              ? "/SPORTS/"
                              : null;
                    if (checkKey && searchKey.includes(checkKey)) {
                        trigger = true;
                        break;
                    }
                }
            }

            if (trigger) state.triggerFetchMarkets = Date.now();
        },

        triggerMultiFetchOrders(state, action) {
            const eventId = action.payload;
            const triggered = Object.keys(state.multiMarketData).some(
                (key) => key.split("-")[2] == eventId,
            );
            if (triggered) state.triggerFetchOrders = Date.now();
        },

        triggerMultiBetStatus(state, action) {
            const eventId = action.payload;
            const triggered = Object.keys(state.multiMarketData).some(
                (key) => key.split("-")[2] == eventId,
            );
            if (triggered) state.triggerBetStatus = Date.now();
        },
    },
});

export const {
    setMultiMarketEventData,
    updateMultiSecondaryMatchOdds,
    updateMultiSecondaryMarkets,
    updateMultiBookMakerMarkets,
    updateMultiSuspendedMarkets,
    updateMultiCommissionMarkets,
    triggerMultiFetchMarkets,
    triggerMultiFetchOrders,
    triggerMultiBetStatus,
} = multiMarketSlice.actions;

export default multiMarketSlice.reducer;
