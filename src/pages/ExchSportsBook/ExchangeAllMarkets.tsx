import { IonCol, IonRow } from "@ionic/react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Tab,
    Tabs,
} from "@mui/material";
import { ExpandLessSharp } from "@mui/icons-material";

import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { isIOS } from "react-device-detect";
import { connect, useDispatch } from "react-redux";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import ExchBetslip from "../../components/ExchBetSlip/ExchBetSlip";
import BmMTable from "../../components/ExchBookmakerMarketTable/ExchBookmakerMarketTable";
import FMTable from "../../components/ExchFancyMarketsTable/ExchFancyMarketsTable";
import LMTable from "../../components/ExchLineMarketsTable/ExchLineMarketsTable";
import MatchOddsTable from "../../components/ExchMatchOddsTable/ExchMatchOddsTable";
import ExchOpenBets from "../../components/ExchOpenBets/ExchOpenBets";
import CricketLiveStream from "../../components/Livestream/CricketLiveStream";

import TabPanel from "../../components/TabPanel/TabPanel";
import MatchInfo from "../../components/MatchInfo/MatchInfo";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import FingerPoint from "../../assets/images/Hand.gif";

import { addBetHandler, clearExchcngeBets, enableOneClickBetting } from "../../store/slices/exchBetSlipSlice";
import { fetchUserDetails } from "../../store/slices/userDetailsSlice";
import { fetchEvent, fetchPremiummarketsByEventId, setExchEvent, updateBookMakerMarkets, updateEventScorecard } from "../../store/slices/homeMarketsSlice";
import { fetchOpenBets } from "../../store/slices/exchBetSlipSlice";
import { getAllMarketsByEvent, getBookmakerMarketsByEvent, getLineMarketsByEvent, getPremiumMarkets, getSecondaryMarketsByEvent, getSecondaryMatchOddsByEvent, getFancyMarketsByEvent  } from "../../store/selectors/homeMarketsSelectors";

// import {
//     // checkStompClientSubscriptions,
//     // connectToBFWS,
//     // connectToDreamWS,
//     // connectToSRWS,
//     // disconnectToWS,
//     // subscribeSportRadarEventOdds,
//     // subscribeWsForEventOdds,
//     // subscribeWsForFancyMarkets,
//     // subscribeWsForScorecardUrl,
//     // subscribeWsForSecondaryMarkets,
//     // subscribeWsForSecondaryMatchOdds,
//     // subscribeWsForLineMarkets,
//     // unsubscribeAllWsforEvents,
// } from "../../webSocket/webSocket";

import "../../theme/scorecardtheme.css";

import { Button, Checkbox } from "@mui/material";
// import Script from "next/script";
// import API_SPORT_FEED from "../../api-services/sportsfeed-api";
import noBetsIcon from "../../assets/images/icons/no-bets-icon.svg";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";
import SEO from "../../components/SEO/Seo";

import { BET_TIMEOUT } from "../../constants/CommonContants";
import { setAlertMsg } from "../../store/slices/commonSlice";
import { clearBetStatusResponse, setBettingInprogress, setCashoutInProgress, setOneClickBettingLoading } from "../../store/slices/exchBetSlipSlice";
import {
    BFToSRIdMap,
    demoUser,
    isBackOnlyMarket,
} from "../../util/stringUtil";
// import {
//     subscribeWsForNotifications,
//     subscribeWsForNotificationsPerAdminAllMarkets,
//     removeHandlersForEventId,
// } from "../../webSocket/pnWebsocket";
import "./ExchangeAllMarkets.scss";
import CricketScorecard from "../../components/ScoreCard/CricketScorecard";
import WinnerMarket from "./WinnerMarket";
// import SVLS_API from "../../svls-api";
import { usePageVisibility } from "../../hooks/visibility.hook";
import axios from "axios";
import OneClickBetting from "../../components/OneClickBetting";
// import EventName from "../../common/EventName/EventName";
// import CATALOG_API from "../../catalog-api";
import { CONFIG } from "../../config/config";
const IS_NEW_SCORECARD_ENABLED = true;

// 1 Oct 2025 00:00:00 UTC - hide Live Stream if user created after this and balance <= 100
const LIVE_STREAM_CTIME_CUTOFF_EPOCH = 1759276800;
// WORLD_CUP_T20 and IPL_CUP: balance/cutoff apply; other competitions use relaxed section check only
const LIVE_STREAM_STRICT_COMPETITION_IDS = ["12674623", "101480"];


const getUserCreationTime = () => {    // Just a placeholder func, will remove it completely
    return Date.now() / 1000;
}


type StoreProps = {
    selectedEvent: any;
    eventData: any;
    bmMData: any[];
    secondaryMatchOdds: any[];
    lineMarkets: any[];
    secondaryMarkets: any;
    bets: any[];
    openBets: any[];
    totalOrders: number;
    loggedIn: boolean;
    balanceSummary: { balance: number | null; balanceId?: number };
    selectedEventType: { id: ""; name: ""; slug: "" };
    clearExchcngeBets: () => void;
    fetchOpenBets: (eventId: string, sportId: string) => void;

    fetchEvent: (
        sportId: string,
        competitionId: string,
        eventId: string,
        marketTime: string,
    ) => void;
    fetchPremiummarketsByEventId: (
        providerId: string,
        sportid: string,
        competitionId: string,
        eventId: string,
        marketTime: string,
    ) => void;
    setExchEvent: (event: any) => void;
    updateEventScorecard: (scorecard: any) => void;
    seEventData: any;
    // topicUrls: any;
    // houseId: string;
    // parentId: string;
    accountId: string;
    // triggerFetchMarkets: number;
    // triggerFetchOrders: number;
    // lastOrderUpdatedMarketType: string | null;
    // triggerBetStatus: number;
    betStatusResponse: any;
    clearExchangeBets: () => void;
    setBettingInprogress: (val: boolean) => void;
    clearBetStatusResponse: () => void;
    // betFairWSConnected: boolean;
    // dreamWSConnected: boolean;
    // sportsRadarWSConnected: boolean;
    // pushNotifWSConnection: boolean;
    eventInfoProp?: any;
    setAlertMsg: Function;
    premiumMarkets: any;
    langData: any;
    addExchangeBet: Function;
    fmData: any[];
    oneClickBettingEnabled: boolean;
    enableOneClickBetting: Function;
    setOneClickBettingLoading: Function;
    setCashoutInProgress: Function;
    cashoutInProgress: any;
};

type RouteParams = {
    eventType: string;
    competition: string;
    eventId: string;
    eventInfo: string;
};

const ExchAllMarkets: React.FC<StoreProps> = (props) => {
    const {
        selectedEvent,
        eventData,
        secondaryMatchOdds,
        secondaryMarkets,
        bets,
        openBets,
        totalOrders,
        loggedIn,
        balanceSummary,
        clearExchcngeBets,
        fetchOpenBets,
        selectedEventType,
        fetchEvent,
        fetchPremiummarketsByEventId,
        setExchEvent,
        updateEventScorecard,
        seEventData,
        bmMData,
        // topicUrls,
        // houseId,
        // parentId,
        accountId,
        // triggerFetchMarkets,
        // triggerFetchOrders,
        // lastOrderUpdatedMarketType,
        // triggerBetStatus,
        betStatusResponse,
        clearExchangeBets,
        setBettingInprogress,
        setOneClickBettingLoading,
        clearBetStatusResponse,
        // betFairWSConnected,
        // pushNotifWSConnection,
        eventInfoProp,
        setAlertMsg,
        premiumMarkets,
        langData,
        addExchangeBet,
        // dreamWSConnected,
        // sportsRadarWSConnected,
        fmData,
        lineMarkets,
        oneClickBettingEnabled,
        enableOneClickBetting,
        setCashoutInProgress,
        cashoutInProgress,
    } = props;
    const dispatch = useDispatch<any>();
    console.log('eventData: ', eventData);

    const location = useLocation();
    const isVisible = usePageVisibility();
    const routeParams = useParams<RouteParams>();
    const [tabVal, setTabVal] = useState(0);
    const [betsTabVal, setBetsTabVal] = useState(0);
    const [openBetslip, setOpenBetslip] = useState<boolean>(true);
    const [fancyTabVal, setFancyTabVal] = useState(0);
    const [scorecardID, setScorecardID] = useState<string>("");
    const [virtualScorecard, setVirtualScorecard] = useState();
    const [cFactor, setCFactor] = useState<number>(CURRENCY_TYPE_FACTOR[0]);
    const [exposureMap, setExposureMap] = useState(new Map());
    const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
    const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
    const [bookMakerBaseUrl, setBookMakerBaseUrl] = useState<string>("");
    const [bookMakerTopic, setBookMakerTopic] = useState<string>("");
    const [fancyBaseUrl, setFancyBaseUrl] = useState<string>("");
    const [fancyTopic, setFancyTopic] = useState<string>("");
    const [lineBaseUrl, setLineBaseUrl] = useState<string>("");
    const [lineTopic, setLineTopic] = useState<string>("");
    const [premiumBaseUrl, setPremiumBaseUrl] = useState<string>("");
    const [premiumTopic, setPremiumTopic] = useState<string>("");
    const [enableFetchOrders, setEnableFetchOrders] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<Date>();
    const [fetchOpenOrders, setFetchOpenOrders] = useState<number>(null);
    const [addNewBet, setAddNewBet] = useState<boolean>(true);
    const intervalRef = useRef(null);
    const isFirstRender = useRef(true);
    const isFirstRenderStartTime = useRef(true);
    const isFirstRenderVisibility = useRef(true);
    const isFirstRenderFetchMarkets = useRef(true);
    const [winnerMarket, setWinnerMarket] = useState<any>();
    const [premiumIframeUrl, setPremiumIframeUrl] = useState<string>("");
    const [premiumIframeLoading, setPremiumIframeLoading] =
        useState<boolean>(false);
    const [premiumIframeFetched, setPremiumIframeFetched] =
        useState<boolean>(false);
    const [macPremiumEnabled, setMacPremiumEnabled] = useState<boolean | null>(
        null,
    );
    const [liveStreamChannelId, setLiveStreamChannelId] = useState<string>("");
    const [backupStreamUrl, setBackupStreamUrl] = useState<string>(null);
    const [provider, sportId, competitionId, eventId, providerId] = atob(
        routeParams.eventInfo ? routeParams.eventInfo : "",
    ).split(":");

    const isMobile = window.innerWidth > 1120 ? false : true;

    const balance = balanceSummary?.balance ?? null;
    const ctime = getUserCreationTime();
    const ctimeNum = ctime != null ? Number(ctime) : NaN;
    const createdAfterCutoff =
        !Number.isNaN(ctimeNum) && ctimeNum > LIVE_STREAM_CTIME_CUTOFF_EPOCH;
    const isStrictCompetition =
        eventData?.competitionId &&
        LIVE_STREAM_STRICT_COMPETITION_IDS.includes(eventData.competitionId);
    const isLiveStreamSectionVisible = isStrictCompetition
        ? !(
              !loggedIn ||
              demoUser() ||
              (balance != null && balance <= 100) ||
              createdAfterCutoff
          )
        : !(!loggedIn || demoUser());
    const isLiveStreamEventEligible = useMemo(
        () =>
            eventData?.status === "IN_PLAY" ||
            provider?.toLowerCase() === "sportradar",
        [eventData?.status, provider],
    );
    const isLiveStreamVisible =
        isLiveStreamEventEligible &&
        (isLiveStreamSectionVisible ||
            (eventData?.virtualEvent === true && loggedIn));

    const [recentGame, setRecentGame] = useState<any>();
    const history = useHistory();

    // score card listener to change the height of iframe to its content
    useEffect(() => {
        window.addEventListener("message", (event) => {
            const element: HTMLIFrameElement = document.getElementById(
                "frame",
            ) as HTMLIFrameElement;

            if (element !== null && element !== undefined) {
                if (event && event.data && event.data.scoreWidgetHeight) {
                    element.height = event.data.scoreWidgetHeight + 12;
                }
            }
        });
    }, []);

    // to get who will win the match from matchoddsdata
    useEffect(() => {
        if (secondaryMatchOdds?.length > 0) {
            let winner = secondaryMatchOdds?.filter((market) =>
                market.marketName
                    ?.toLowerCase()
                    ?.includes("who will win the match"),
            );

            if (winner?.length > 0) {
                setWinnerMarket(winner?.[0]);
            }
        }
    }, [secondaryMatchOdds]);

    // useEffect(() => {
    //     unsubscribeAllWsforEvents();
    // }, [selectedEvent]);

    // useEffect(() => {
    //     if (!loggedIn) {
    //         unsubscribeAllWsforEvents();
    //     }
    // }, [loggedIn]);

    // useEffect(() => {
    //     if (loggedIn && eventData) {
    //         setCFactor(CURRENCY_TYPE_FACTOR[0]);
    //         if (topicUrls?.matchOddsTopic) {
    //             updateMatchOddsTopic(
    //                 topicUrls?.matchOddsTopic,
    //                 topicUrls?.matchOddsBaseUrl,
    //             );
    //             // subscribeWsForEventOdds(
    //             //     topicUrls?.matchOddsTopic,
    //             //     eventData.sportId,
    //             //     eventData.competitionId,
    //             //     eventData.eventId,
    //             //     eventData.matchOdds.marketId,
    //             //     eventData.providerName,
    //             //     false,
    //             // );
    //             // subscribeWsForScorecardUrl(
    //             //     "/topic/rx_score/",
    //             //     eventData?.eventId,
    //             // );
    //         }

    //         if (
    //             eventData.sportId === "4" ||
    //             eventData.sportId === "2" ||
    //             eventData.sportId === "1" ||
    //             eventData.sportId === "99990" ||
    //             eventData.sportId === "99994" ||
    //             eventData.sportId === "2378961"
    //         ) {
    //             if (
    //                 secondaryMarkets?.bookmakers?.length &&
    //                 topicUrls?.bookMakerTopic
    //             ) {
    //                 updateBookMakerTopic(
    //                     topicUrls?.bookMakerTopic,
    //                     topicUrls?.bookMakerBaseUrl,
    //                 );
    //                 // for (let itm of secondaryMarkets?.bookmakers) {
    //                 //     subscribeWsForSecondaryMarkets(
    //                 //         topicUrls?.bookMakerTopic,
    //                 //         eventData?.eventId,
    //                 //         itm.marketId,
    //                 //     );
    //                 // }
    //             }
    //             if (
    //                 secondaryMarkets?.fancyMarkets?.length &&
    //                 topicUrls?.fancyTopic
    //             ) {
    //                 updateFancyTopic(
    //                     topicUrls?.fancyTopic,
    //                     topicUrls?.fancyBaseUrl,
    //                 );
    //                 // subscribeWsForFancyMarkets(
    //                 //     topicUrls?.fancyTopic,
    //                 //     eventData?.eventId,
    //                 // );
    //             }
    //             if (
    //                 secondaryMarkets?.lineMarkets?.length &&
    //                 topicUrls?.lineTopic
    //             ) {
    //                 updateLineTopic(
    //                     topicUrls?.lineTopic,
    //                     topicUrls?.lineBaseUrl,
    //                 );
    //                 // subscribeWsForLineMarkets(
    //                 //     topicUrls?.lineTopic,
    //                 //     eventData?.eventId,
    //                 // );
    //             }
    //         }

    //         if (topicUrls?.matchOddsTopic) {
    //             updateMatchOddsTopic(
    //                 topicUrls?.matchOddsTopic,
    //                 topicUrls?.matchOddsBaseUrl,
    //             );
    //             // for (let mo of secondaryMatchOdds) {
    //             //     subscribeWsForSecondaryMatchOdds(
    //             //         topicUrls?.matchOddsTopic,
    //             //         eventData.eventId,
    //             //         mo.marketId,
    //             //         eventData.providerName,
    //             //     );
    //             // }
    //         }
    //     }
    // }, [
    //     betFairWSConnected,
    //     selectedEvent,
    //     loggedIn,
    //     secondaryMatchOdds,
    //     secondaryMarkets,
    // ]);

    useEffect(() => {
        if (
            eventData?.eventId &&
            ["IN_PLAY", "UPCOMING", "SUSPENDED"].includes(eventData?.status) &&
            eventData?.providerName !== "SportRadar" &&
            scorecardID === ""
        ) {
            loggedIn && getSPEventIdByBetfairId();
        }
    }, [eventData?.eventId]);

    const updateMatchOddsTopic = (
        currentTopic: string,
        currentBaseUrl: string,
    ) => {
        if (
            matchOddsTopic !== currentTopic ||
            matchOddsBaseUrl !== currentBaseUrl
        ) {
            // disconnectToWS();
            setMatchOddsTopic(currentTopic);
            setMatchOddsBaseUrl(currentBaseUrl);
        }
    };

    const updateBookMakerTopic = (
        currentTopic: string,
        currentBaseUrl: string,
    ) => {
        if (
            bookMakerTopic !== currentTopic ||
            bookMakerBaseUrl !== currentBaseUrl
        ) {
            // disconnectToWS();
            setBookMakerTopic(currentTopic);
            setBookMakerBaseUrl(currentBaseUrl);
        }
    };

    const updateFancyTopic = (currentTopic: string, currentBaseUrl: string) => {
        if (fancyTopic !== currentTopic || fancyBaseUrl !== currentBaseUrl) {
            // disconnectToWS();
            setFancyTopic(currentTopic);
            setFancyBaseUrl(currentBaseUrl);
        }
    };

    const updateLineTopic = (currentTopic: string, currentBaseUrl: string) => {
        if (lineTopic !== currentTopic || lineBaseUrl !== currentBaseUrl) {
            // disconnectToWS();
            setLineTopic(currentTopic);
            setLineBaseUrl(currentBaseUrl);
        }
    };


    const getSPEventIdByBetfairId = async () => {
        try {
            // await API_SPORT_FEED.post(`/feed/get-sr-event`, {
            //     eventId: eventData?.eventId.split("_").join(":"),
            // }).then((result) => {
            //     if (result?.data?.status === "RS_OK")
            //         setScorecardID(
            //             result?.data?.srEventDetails?.srEventId?.split(":")[2],
            //         );
            //     else setScorecardID(null);
            // });
        } catch (err) {
            setScorecardID(null);
        }
    };

    useEffect(() => {
        if (["1", "2"].includes(eventData?.sportId)) setFancyTabVal(1);
        if (eventData?.eventId !== eventId) {
            return;
        }
        if (eventData?.enableFancy) {
            setFancyTabVal(0);
        } else {
            setFancyTabVal(1);
        }
    }, [eventData?.enableFancy, eventData?.eventId]);

    useEffect(() => {
        updateEventScorecard(null);
        if (
            eventData?.eventId &&
            eventData?.sportId == "4" &&
            eventData?.providerName != "SportRadar"
        ) {
            // subscribeWsForScorecardUrl("/topic/rx_score/", eventData?.eventId);
        }
    }, [eventData?.eventId]);

    useEffect(() => {
        clearExchcngeBets();
        return () => {
            setExchEvent({ id: "", name: "", slug: "" });
        };
    }, []);

    // Get new Premium fancy markets
    useEffect(() => {
        try {
            let paramSId = null;
            let paramCId = null;
            let paramEId = null;
            let paramPName = null;
            if (loggedIn) {
                const [
                    providerName,
                    sportId,
                    competitionId,
                    eventId,
                    marketTime,
                ] = atob(
                    routeParams.eventInfo ? routeParams.eventInfo : "",
                ).split(":");

                if (eventInfoProp) {
                    paramSId = eventInfoProp.sportId;
                    paramCId = eventInfoProp.competitionId;
                    paramEId = eventInfoProp.eventId;
                    paramPName = "BetFair";
                } else {
                    paramSId = selectedEventType.id;
                    paramCId = competitionId?.includes("_")
                        ? competitionId.split("_").join(":")
                        : competitionId;
                    paramEId = selectedEvent?.id.includes("_")
                        ? selectedEvent?.id.split("_").join(":")
                        : selectedEvent?.id;
                    paramPName = selectedEvent?.id.includes("_")
                        ? "SportRadar"
                        : "BetFair";
                }
            }
        } catch (err) {}
    }, [loggedIn, selectedEvent?.id]);

    useEffect(() => {
        if (loggedIn && selectedEvent?.id) {
            if (
                selectedEvent?.id.includes("sr:") ||
                selectedEvent?.id.includes("sr_")
            ) {
                return;
            }

            const sid = selectedEvent?.id.includes("_")
                ? BFToSRIdMap[selectedEventType?.id]
                : selectedEventType?.id;
            fetchOpenBets(selectedEvent?.id, sid);
            fetchOpenBetsRisk(selectedEvent?.id);
        }
    }, [loggedIn, selectedEvent?.id]);


    // ORDER_UPDATED notification - only fetch balance and risk, skip fetchOpenBets (bets removed via notification)
    // useEffect(() => {
    //     if (triggerFetchOrders) {
    //         setTimeout(() => {
    //             // Skip fetchOpenBetsRisk if marketType is FANCY
    //             if (lastOrderUpdatedMarketType !== "FANCY") {
    //                 fetchOpenBetsRisk(selectedEvent?.id);
    //             }
    //         }, 1000);
    //     }
    // }, [triggerFetchOrders]); // Only depend on triggerFetchOrders to prevent duplicate calls

    useEffect(() => {
        try {
            let paramSId = null;
            let paramCId = null;
            let paramEId = null;
            const [providerName, sportId, competitionId, eventId, marketTime] =
                atob(routeParams.eventInfo ? routeParams.eventInfo : "").split(
                    ":",
                );
            if (eventInfoProp) {
                paramSId = eventInfoProp.sportId;
                paramCId = eventInfoProp.competitionId;
                paramEId = eventInfoProp.eventId;
            } else {
                paramSId = sportId;
                paramCId = competitionId;
                paramEId = eventId;
            }
            if (providerName === "SportRadar") {
                getEventDetails(
                    providerName,
                    BFToSRIdMap[paramSId],
                    paramCId.includes("_")
                        ? paramCId.split("_").join(":")
                        : paramCId,
                    paramEId.includes("_")
                        ? paramEId.split("_").join(":")
                        : paramEId,
                );
            }
        } catch (err) {}
    }, [loggedIn, routeParams?.eventId]);

    // Fetch market prices from URL encoded param

    useEffect(() => {
        try {
            let paramSId = null;
            let paramCId = null;
            let paramEId = null;
            let paramPName = null;
            const [providerName, sportId, competitionId, eventId, marketTime] =
                atob(routeParams.eventInfo ? routeParams.eventInfo : "").split(
                    ":",
                );

            if (eventInfoProp) {
                paramSId = eventInfoProp.sportId;
                paramCId = eventInfoProp.competitionId;
                paramEId = eventInfoProp.eventId;
            } else {
                paramSId = sportId;
                paramCId = competitionId;
                paramEId = eventId;
            }
            if (!eventId.toLowerCase().includes("sr")) {
                fetchEvent(paramSId, paramCId, paramEId, marketTime);
            }
            setBettingInprogress(false);
            setCashoutInProgress(null);
            setOneClickBettingLoading(false);
            if (bets[0]?.amount) {
                clearExchangeBets();
            }
            clearBetStatusResponse();
        } catch (err) {}
    }, [routeParams?.eventId]);

    // useEffect(() => {
    //     if (isFirstRenderFetchMarkets.current) {
    //         isFirstRenderFetchMarkets.current = false;
    //         return;
    //     }
    //     if (eventData !== null) {
    //         fetchEvent(
    //             eventData?.sportId,
    //             eventData?.competitionId,
    //             eventData?.eventId,
    //             "",
    //         );
    //     }
    // }, [triggerFetchMarkets]);

    useEffect(() => {
        setTabVal(0);
    }, [totalOrders]);

    useEffect(() => {
        if (!openBetslip && bets.length > 0) {
            setOpenBetslip(true);
        }
    }, [bets]);

    useEffect(() => {
        if (openBets?.length > 0 && !isMobile) setBetsTabVal(1);
    }, [openBets?.length]);

    useEffect(() => {
        if (bets?.length > 0) setBetsTabVal(0);
    }, [bets]);

    // useEffect(() => {
    //     if (pushNotifWSConnection && eventData?.eventId) {
    //         const currentEventId = eventData.eventId;
    //         const houseId = 'kuch bhi';
    //         const topicPathNotifications = `/topic/notifications/${houseId}`;
    //         const topicPathAdmin = `/topic/notifications/${houseId}/${parentId}`;

    //         // Clean up old handlers for this eventId before adding new ones (in case eventId changed)
    //         // This prevents accumulation of handlers when navigating between events
    //         removeHandlersForEventId(topicPathNotifications, currentEventId);
    //         removeHandlersForEventId(topicPathAdmin, currentEventId);

    //         // Subscribe - handler registry will add handlers to existing subscription if it exists
    //         subscribeWsForNotifications(
    //             false,
    //             houseId,
    //             eventData?.sportId,
    //             eventData?.competitionId,
    //             currentEventId,
    //         );
    //         subscribeWsForNotificationsPerAdminAllMarkets(
    //             false,
    //             houseId,
    //             parentId,
    //             accountId,
    //             currentEventId,
    //         );

    //         // Cleanup: Remove handlers for this eventId when component unmounts or eventId changes
    //         return () => {
    //             removeHandlersForEventId(
    //                 topicPathNotifications,
    //                 currentEventId,
    //             );
    //             removeHandlersForEventId(topicPathAdmin, currentEventId);
    //         };
    //     }
    // }, [pushNotifWSConnection, eventData?.eventId]);

    // useEffect(() => {
    //     if (loggedIn) {
    //         if (topicUrls?.matchOddsBaseUrl) {
    //             const baseUrlsPayload = {
    //                 matchOddsBaseUrl: topicUrls?.matchOddsBaseUrl,
    //                 bookMakerAndFancyBaseUrl: topicUrls?.bookMakerBaseUrl,
    //                 premiumBaseUrl: topicUrls?.premiumBaseUrl,
    //             };
    //             checkStompClientSubscriptions(baseUrlsPayload);
    //         }
    //     }
    // }, []);

    const getEventDetails = async (
        providerId: string,
        sportId: string,
        competitionId: string,
        eventId: string,
    ) => {
        try {
            // const response = await CATALOG_API.get(
            //     `/catalog/v2/sports-feed/sports/${sportId}/competitions/${competitionId}/events/${eventId}/:details`,
            //     {
            //         headers: sessionStorage.getItem("jwt_token")
            //             ? {
            //                   Authorization:
            //                       sessionStorage.getItem("jwt_token"),
            //               }
            //             : null,
            //         params: {
            //             providerId: providerId,
            //         },
            //     },
            // );

            // if (response.status === 200 && response.data) {
            //     if (response.data?.stream_link) {
            //         setBackupStreamUrl(response.data?.stream_link);
            //     }
            //     setLiveStreamChannelId(response.data?.live_stream_channel_id);
            //     setMacPremiumEnabled(!!response.data?.macPremiumEnabled);
            // }
        } catch (err) {}
    };

    useEffect(() => {
        const macPremiumFlag = (eventData as any)?.macPremiumEnabled;
        setMacPremiumEnabled(!!macPremiumFlag);
    }, [eventData]);

    const getFormattedMaxLimit = (max: number) => {
        const num = Number(max / cFactor);
        const fMax = Number(Math.floor(num / 50) * 50);
        return fMax > 999
            ? Number(fMax / 1000).toFixed() + "K"
            : fMax.toFixed();
    };

    const getFormattedMinLimit = (min: number) => {
        const num = Number(min / cFactor);
        const fMin = Number(Math.ceil(num / 10) * 10);
        return fMin > 999
            ? Number(fMin / 1000).toFixed() + "K"
            : fMin.toFixed();
    };

    const fetchOpenBetsRisk = async (eventId: string) => {
        try {
            if (!eventId || !loggedIn) {
                return;
            }

            // const response = await SVLS_API.get(
            //     "/reports/v2/risk-management/user-risk",
            //     {
            //         headers: {
            //             Authorization: sessionStorage.getItem("jwt_token"),
            //         },
            //         params: {
            //             eventId: eventId,
            //         },
            //     },
            // );
            // setExposureMap(response.data.marketExposureMap);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        updateBookMakerMarkets(bmMData);
    }, [bmMData]);

    useEffect(() => {
        if (betStatusResponse === null) {
            return;
        }
        switch (betStatusResponse.status) {
            case "IN_PROGRESS": {
                setAlertMsg({
                    type: "success",
                    message: betStatusResponse.message,
                });
                break;
            }
            case "SUCCESS": {
                setAlertMsg({
                    type: "success",
                    message: betStatusResponse.message,
                });

                if (addNewBet) {
                    setFetchOpenOrders(moment.now());
                }
                // fetchBalance();
                dispatch(fetchUserDetails());

                // Extract risk data from bet status response and update exposure map
                // Note: marketRiskList is only included in the response if marketIds match (handled in action)
                const responseMarketId = betStatusResponse.marketId;
                const responseMarketRiskList = betStatusResponse.marketRiskList;

                if (
                    responseMarketId &&
                    responseMarketRiskList &&
                    Array.isArray(responseMarketRiskList) &&
                    responseMarketRiskList.length > 0
                ) {
                    // MarketIds matched in action - update exposure map from response
                    const marketName =
                        responseMarketRiskList[0]?.marketName || "";
                    const riskRows = responseMarketRiskList.map(
                        (risk: any) => ({
                            runnerId: risk.runnerId,
                            runnerName: risk.runnerName,
                            userRisk: risk.userRisk,
                        }),
                    );

                    const exposureKey = `${responseMarketId}:${marketName}`;
                    setExposureMap((prev) => {
                        // Convert Map to object if needed, or use existing object
                        const prevObj =
                            prev instanceof Map
                                ? Object.fromEntries(prev)
                                : prev;
                        return {
                            ...prevObj,
                            [exposureKey]: riskRows,
                        };
                    });
                } else {
                    // MarketIds didn't match or marketRiskList is missing - call full risk API
                    if (selectedEvent?.id) {
                        setTimeout(() => {
                            fetchOpenBetsRisk(selectedEvent?.id);
                        }, 1000);
                    }
                }

                // Clear cashoutInProgress immediately after SUCCESS to prevent stale data
                setCashoutInProgress(null);

                break;
            }
            case "FAIL": {
                setAlertMsg({
                    type: "error",
                    message: betStatusResponse.message,
                });
                break;
            }
        }

        setBettingInprogress(false);
        setCashoutInProgress(null);
        setOneClickBettingLoading(false);
        if (bets[0]?.amount) {
            clearExchangeBets();
        }
        clearBetStatusResponse();
    }, [betStatusResponse]);

    // useEffect(() => {
    //     if (isFirstRender.current) {
    //         isFirstRender.current = false;
    //         return;
    //     }
    //     clearInterval(intervalRef.current);
    //     // betStatus();
    // }, [triggerBetStatus]);

    useEffect(() => {
        if (isFirstRenderStartTime.current) {
            isFirstRenderStartTime.current = false;
            return;
        }

        intervalRef.current = setInterval(() => {
            // betStatus();
            clearInterval(intervalRef.current);
        }, BET_TIMEOUT);

        return () => clearInterval(intervalRef.current);
    }, [startTime]);

    // Connect to websocket immediately once the user comes back to page after page has been inactive
    // useEffect(() => {
    //     if (isFirstRenderVisibility.current) {
    //         isFirstRenderVisibility.current = false;
    //         return;
    //     }

    //     if (isVisible) {
    //         if (
    //             ((eventData?.matchOdds?.runners?.length > 0 ||
    //                 secondaryMatchOdds?.length > 0) &&
    //                 !betFairWSConnected) ||
    //             ((bmMData?.length > 0 ||
    //                 fmData?.length > 0 ||
    //                 lineMarkets?.length > 0) &&
    //                 !dreamWSConnected)
    //         ) {
    //             let paramSId = null;
    //             let paramCId = null;
    //             let paramEId = null;
    //             let paramPName = null;

    //             const [
    //                 providerId,
    //                 sportId,
    //                 competitionId,
    //                 eventId,
    //                 marketTime,
    //             ] = atob(
    //                 routeParams.eventInfo ? routeParams.eventInfo : "",
    //             ).split(":");

    //             paramSId = sportId;
    //             paramCId = competitionId;
    //             paramEId = eventId;
    //             paramPName = providerId;

    //             if (!eventId?.toLowerCase()?.includes("sr")) {
    //                 fetchEvent(paramSId, paramCId, paramEId, marketTime);

    //                 if (
    //                     !betFairWSConnected &&
    //                     (eventData?.matchOdds?.runners?.length > 0 ||
    //                         secondaryMatchOdds?.length > 0)
    //                 ) {
    //                     connectToBFWS(topicUrls?.matchOddsBaseUrl);
    //                 }
    //                 if (
    //                     !dreamWSConnected &&
    //                     (bmMData?.length > 0 || fmData?.length > 0)
    //                 ) {
    //                     connectToDreamWS(topicUrls?.bookMakerBaseUrl);
    //                 }
    //             }
    //         }
    //         console.log(
    //             "Welcome back! Page is visible.",
    //             new Date(moment.now()),
    //         );
    //     } else {
    //         console.log(
    //             "User switched away. Page is hidden.",
    //             new Date(moment.now()),
    //         );
    //     }
    // }, [isVisible]);

    const streamToast = () => {
        if (demoUser()) {
            errorToast(
                "Sorry for inconvenience Use real ID to watch streaming..",
            );
        }
    };

    const errorToast = (mess: string) => {
        setAlertMsg({
            type: "error",
            message: mess ?? "",
        });
    };

    const getPremiumIframeUrl = async () => {
        try {
            if (!routeParams?.eventInfo) {
                return;
            }

            const [providerId, sportId, competitionId, eventId, marketTime] =
                atob(routeParams.eventInfo).split(":");

            setPremiumIframeLoading(true);
            const claims = sessionStorage?.getItem("jwt_token")?.split(".")[1];
            const userStatus = claims
                ? JSON.parse(window.atob(claims))?.status
                : 0;

            const sEventId = eventId.includes("_")
                ? eventId.split("_").join(":")
                : eventId;
            const sCompetitionId = competitionId?.includes("_")
                ? competitionId.split("_").join(":")
                : competitionId;

            if (userStatus === 0 || userStatus === 3) {
                return history.push(`/home`);
            }

            // Map sportId if eventId includes sr:, sr_, or vci:
            let mappedSportId = sportId;
            if (
                eventId?.includes("sr:") ||
                eventId?.includes("sr_") ||
                eventId?.includes("vci:") ||
                eventId?.includes("vti_")
            ) {
                mappedSportId = BFToSRIdMap[sportId] ?? sportId;
            }

            let payload: any = {
                competitionId: sCompetitionId,
                sportId: mappedSportId,
                eventId: sEventId,
                platform: "desktop",
            };

            if (macPremiumEnabled === true) {
                payload.macPremium = true;
            }

            // const response = await SVLS_API.post(
            //     `/catalog/v2/sports-book/lobby-urls/virtual-event`,
            //     payload,
            //     {
            //         headers: {
            //             Authorization: sessionStorage.getItem("jwt_token"),
            //         },
            //     },
            // );

            // if (response && response.data?.url) {
            //     const callBackUrl = `&callBackUrl=https://dev.hypexexch.com/exchange_sports/inplay`;
            //     const urlWithCallback = response.data.url + callBackUrl;
            //     setPremiumIframeUrl(urlWithCallback);
            //     setPremiumIframeFetched(true);
            // }
            setPremiumIframeLoading(false);
        } catch (e) {
            console.log("Error fetching premium iframe URL:", e);
            setPremiumIframeLoading(false);
        }
    };

    const defaultGame = {
        gameId: "150007",
        gameName: "Andar Bahar",
        gameCode: "MAC88-XAB101",
        provider: "MAC88",
        subProvider: "Mac88 Gaming",
        superProvider: "MACHUB",
    };

    useEffect(() => {
        const games = JSON.parse(localStorage.getItem("recent_games")) || [];
        setRecentGame(games.length > 0 ? games[0] : defaultGame);
    }, [localStorage.getItem("recent_games")]);

    const redirectToCasino = () => {
        history.push({
            pathname: `/dc/gamev1.1/${recentGame?.gameName?.toLowerCase().replace(/\s+/g, "-")}-${btoa(
                recentGame?.gameId?.toString(),
            )}-${btoa(recentGame?.gameCode)}-${btoa(recentGame?.provider)}-${btoa(recentGame?.subProvider)}-${btoa(recentGame?.superProvider)}`,
            state: { gameName: recentGame?.gameName },
        });
    };

    useEffect(() => {
        return () => {
            setScorecardID(null);
            if (typeof window !== "undefined" && window?.["SIR"]) {
                try {
                    window?.["SIR"]("removeWidget", ".sr-widget-1");
                    const widgetContainer =
                        document.querySelector(".sr-widget-1");
                    if (widgetContainer) {
                        widgetContainer.innerHTML = "";
                    }
                } catch (error) {
                    console.warn("Sportradar widget cleanup failed:", error);
                }
            }
        };
    }, []);

    const [clientIp, setClientIp] = useState("");

    const getclientIp = async () => {
        try {
            let response = await axios.get("https://api.ipify.org?format=json");
            setClientIp(response.data.ip);
        } catch (error) {
            console.log("Error in fetching IP address");
        }
    };

    useEffect(() => {
        getclientIp();
    }, []);

    // Fetch premium iframe URL when premium tab is clicked
    useEffect(() => {
        const [providerName, sportId, competitionId, eventId, openDate] = atob(
            routeParams.eventInfo,
        ).split(":");
        if (
            fancyTabVal === 1 &&
            loggedIn &&
            eventId &&
            !premiumIframeFetched &&
            routeParams?.eventInfo
        ) {
            getPremiumIframeUrl();
        }
    }, [
        fancyTabVal,
        loggedIn,
        eventData?.eventId,
        premiumIframeFetched,
        routeParams?.eventInfo,
    ]);

    useEffect(() => {
        if (IS_NEW_SCORECARD_ENABLED) {
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === "SCORECARD_HEIGHT") {
                    const iframe = document.getElementById("scorecard-frame");
                    if (iframe) iframe.style.height = `${event.data.height}px`;
                }
            };

            window.addEventListener("message", handleMessage);
            return () => window.removeEventListener("message", handleMessage);
        }
    }, []);

    // const generateScript = (scorecardID: string, sportId: string) => {
    //     if (sportId === "4" || sportId === "sr:sport:21") {
    //         return `(function(a,b,c,d,e,f,g,h,i){a[e]||(i=a[e]=function(){(a[e].q=a[e].q||[]).push(arguments)},i.l=1*new Date,i.o=f,
    //       g=b.createElement(c),h=b.getElementsByTagName(c)[0],g.async=1,g.src=d,g.setAttribute("n",e),h.parentNode.insertBefore(g,h)
    //       )})(window,document,"script", "https://widgets.sir.sportradar.com/8ee45b574e2781d581b0b0a133803906/widgetloader", "SIR", {
    //           theme: false, // using custom theme
    //           language: "en"
    //       });
    //       SIR("addWidget", ".sr-widget-1", "match.lmtLight", {layout: "double", scoreboard: "extended", momentum: "extended", collapseTo: "momentum", matchId:${scorecardID}});
    //           `;
    //     } else {
    //         return `(function(a,b,c,d,e,f,g,h,i){a[e]||(i=a[e]=function(){(a[e].q=a[e].q||[]).push(arguments)},i.l=1*new Date,i.o=f,
    //       g=b.createElement(c),h=b.getElementsByTagName(c)[0],g.async=1,g.src=d,g.setAttribute("n",e),h.parentNode.insertBefore(g,h)
    //       )})(window,document,"script", "https://widgets.sir.sportradar.com/8ee45b574e2781d581b0b0a133803906/widgetloader", "SIR", {
    //           theme: false, // using custom theme
    //           language: "en"
    //       });
    //       SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {layout: "double", scoreboard: "extended", momentum: "extended", collapseTo: "momentum", matchId:${scorecardID}});
    //           `;
    //     }
    // };
    return (
        <div>
            <SEO
                title={CONFIG.title}
                name={eventData?.eventName}
                description={eventData?.eventName}
                type={eventData?.eventName}
                link={""}
            />
            {eventData || atob(routeParams.eventInfo).split(":")[0] === "SportRadar" ? (
                <IonRow className="eam-ctn">
                    {/* {!virtualScorecard && scorecardID ? (
                        <Script
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{
                                __html: generateScript(
                                    scorecardID,
                                    eventData?.sportId,
                                ),
                            }}
                        />
                    ) : null} */}

                    {/* Mobile stream & Openbets & scorecard */}
                    <IonCol className="mob-stream-section">
                        {recentGame?.gameName && (
                            <div
                                className="recent-game"
                                onClick={redirectToCasino}
                            >
                                <img
                                    src={FingerPoint}
                                    className="finger-point"
                                />
                                <span className="recent-game-name">
                                    {recentGame?.gameName}
                                </span>
                            </div>
                        )}

                        <MatchInfo
                            eventData={eventData}
                            routeParams={routeParams}
                        />

                        {loggedIn &&
                        isMobile &&
                        (openBets?.length > 0 || eventId) ? (
                            <>
                                <Tabs
                                    value={tabVal}
                                    className="eam-all-markets-header-tabs"
                                    onChange={(_, newValue) => {
                                        setTabVal(newValue);
                                    }}
                                >
                                    <Tab
                                        label={langData?.["scorecard"]}
                                        value={0}
                                        disabled={["99990"].includes(
                                            eventData?.sportId,
                                        )}
                                    />
                                    {isLiveStreamVisible && (
                                        <Tab
                                            label={langData?.["live_stream"]}
                                            value={1}
                                            disabled={
                                                (!(
                                                    eventData &&
                                                    eventData.status ===
                                                        "IN_PLAY"
                                                ) ||
                                                    ["99990"].includes(
                                                        eventData?.sportId,
                                                    )) &&
                                                provider !== "SportRadar"
                                            }
                                            onClick={streamToast}
                                        />
                                    )}

                                    <Tab
                                        label={`${langData?.["open_bets"]} (${totalOrders})`}
                                        value={2}
                                    />
                                </Tabs>
                                <TabPanel
                                    value={tabVal}
                                    index={0}
                                    className="event-stat-mobile-ctn"
                                >
                                    <div>
                                        {tabVal === 0 &&
                                        eventData &&
                                        eventData?.sportId !== "99990" &&
                                        eventData?.matchOdds ? (
                                            <>
                                                <Accordion
                                                    className="scorecard-accordion"
                                                    defaultExpanded={true}
                                                >
                                                    <AccordionSummary
                                                        expandIcon={
                                                            <ExpandLessSharp className="expand-icon" />
                                                        }
                                                        aria-controls="panel1a-content"
                                                        className="scorecard-header"
                                                    >
                                                        {
                                                            langData?.[
                                                                "live_score"
                                                            ]
                                                        }
                                                    </AccordionSummary>
                                                    <AccordionDetails className="scorecard-detail">
                                                        <div className="widgets">
                                                            <div>
                                                                {eventData &&
                                                                eventData?.sportId ==
                                                                    "4" &&
                                                                eventData?.providerName !==
                                                                    "SportRadar" &&
                                                                !eventData?.srScorecardEnabled ? (
                                                                    <CricketScorecard />
                                                                ) : IS_NEW_SCORECARD_ENABLED &&
                                                                  provider !==
                                                                      "SportRadar" ? (
                                                                    <iframe
                                                                        title="sr-scorecard"
                                                                        id="scorecard-frame"
                                                                        allowFullScreen={
                                                                            false
                                                                        }
                                                                        src={`https://play.winadda.co.in/?sportId=${eventData?.sportId}&eventId=${eventData?.eventId}`}
                                                                        sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                                                                    ></iframe>
                                                                ) : (
                                                                    provider !==
                                                                        "SportRadar" && (
                                                                        <div className="sr-widget sr-widget-1"></div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </>
                                        ) : null}
                                    </div>
                                </TabPanel>
                                <TabPanel
                                    value={tabVal}
                                    index={1}
                                    className="eam-header-tab-panel"
                                >
                                    {tabVal === 1 && isLiveStreamVisible ? (
                                        <>
                                            <div className="live-stream-ctn">
                                                {/* {eventData.sportId === '4' ? ( */}
                                                <CricketLiveStream
                                                    eventID={
                                                        eventData?.sportId ===
                                                        "99994"
                                                            ? secondaryMarkets
                                                                  ?.bookmakers
                                                                  ?.length > 0
                                                                ? eventData?.eventId
                                                                : "sr:match:" +
                                                                  scorecardID
                                                            : eventData
                                                                    ?.matchOdds
                                                                    ?.runners
                                                                    ?.length ===
                                                                    0 &&
                                                                secondaryMarkets
                                                                    ?.bookmakers
                                                                    ?.length >
                                                                    0 &&
                                                                premiumMarkets
                                                                    ?.markets
                                                                    ?.matchOdds
                                                                    .length > 0
                                                              ? "sr:match:" +
                                                                scorecardID
                                                              : eventData?.eventId
                                                    }
                                                    providerUrl={
                                                        eventData?.streamLink ||
                                                        backupStreamUrl
                                                    }
                                                    channelId={
                                                        eventData?.liveStreamChannelId
                                                            ? eventData?.liveStreamChannelId
                                                            : liveStreamChannelId
                                                    }
                                                    clientIp={clientIp}
                                                />
                                            </div>
                                        </>
                                    ) : null}
                                </TabPanel>
                                <TabPanel
                                    value={tabVal}
                                    index={2}
                                    className="event-stat-mobile-ctn"
                                >
                                    {openBets.length > 0 && loggedIn ? (
                                        <ExchOpenBets />
                                    ) : (
                                        <>
                                            <div className="no-bet-data mob-open-bets-ctn">
                                                {langData?.["no_open_bets_txt"]}
                                            </div>
                                        </>
                                    )}
                                    <div className="btn-background">
                                        <div className="btn-mybets">
                                            <NavLink to="/my_bets">
                                                <Button>
                                                    {langData?.["view_all"]}
                                                </Button>
                                            </NavLink>
                                        </div>
                                    </div>
                                </TabPanel>
                            </>
                        ) : null}
                    </IonCol>

                    <IonCol
                        className="eam-events-table-section"
                        style={
                            oneClickBettingEnabled && !isMobile
                                ? { marginBottom: "50px" }
                                : {}
                        }
                    >
                        {!isMobile && recentGame?.gameName && (
                            <div
                                className="recent-game"
                                onClick={redirectToCasino}
                            >
                                <img
                                    src={FingerPoint}
                                    className="finger-point"
                                />
                                <span className="recent-game-name">
                                    {recentGame?.gameName}
                                </span>
                            </div>
                        )}

                        <MatchInfo
                            eventData={eventData}
                            routeParams={routeParams}
                        />

                        {loggedIn &&
                        !isMobile &&
                        !["7", "4339", "99990"].includes(eventData?.sportId) ? (
                            <Accordion
                                className="scorecard-accordion"
                                defaultExpanded={true}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <ExpandLessSharp className="expand-icon" />
                                    }
                                    aria-controls="panel1a-content"
                                    className="scorecard-header"
                                >
                                    {langData?.["live_score"]}
                                </AccordionSummary>
                                <AccordionDetails className="scorecard-detail">
                                    <div className="widgets">
                                        <div>
                                            {eventData &&
                                            eventData?.sportId == "4" &&
                                            eventData?.providerName !==
                                                "SportRadar" &&
                                            !eventData?.srScorecardEnabled ? (
                                                <CricketScorecard />
                                            ) : IS_NEW_SCORECARD_ENABLED &&
                                              provider !== "SportRadar" ? (
                                                <iframe
                                                    title="sr-scorecard"
                                                    id="scorecard-frame"
                                                    allowFullScreen={false}
                                                    src={`https://play.winadda.co.in/?sportId=${eventData?.sportId}&eventId=${eventData?.eventId}`}
                                                    sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                                                ></iframe>
                                            ) : (
                                                provider !== "SportRadar" && (
                                                    <div className="sr-widget sr-widget-1"></div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        ) : null}

                        {/* temporary condition - because of showing odds for premium in events page match odds are being shown */}
                        {eventData &&
                        eventData?.providerName?.toLowerCase() !==
                            "sportradar" ? (
                            <IonRow className="eam-table-section">
                                <MatchOddsTable
                                    exposureMap={
                                        exposureMap ? exposureMap : null
                                    }
                                    loggedIn={loggedIn}
                                    getFormattedMinLimit={getFormattedMinLimit}
                                    getFormattedMaxLimit={getFormattedMaxLimit}
                                    eventData={eventData}
                                    fetchEvent={fetchEvent}
                                    secondaryMatchOdds={[]}
                                    setBetStartTime={(date) =>
                                        setStartTime(date)
                                    }
                                    setAddNewBet={(val) => setAddNewBet(val)}
                                    showMatchOdds={true}
                                    showSecondaryMatchOdds={false}
                                />
                            </IonRow>
                        ) : null}

                        {eventData &&
                        secondaryMarkets?.bookmakers?.length > 0 &&
                        secondaryMarkets?.bookmakers[0]?.runners?.length > 0 ? (
                            <>
                                <IonRow className="eam-table-section">
                                    <BmMTable
                                        loggedIn={loggedIn}
                                        getFormattedMinLimit={
                                            getFormattedMinLimit
                                        }
                                        getFormattedMaxLimit={
                                            getFormattedMaxLimit
                                        }
                                        bmMData={bmMData.filter(
                                            (mkt) =>
                                                !isBackOnlyMarket(
                                                    mkt?.oddType,
                                                    mkt?.marketName,
                                                ),
                                        )}
                                        eventData={eventData}
                                        exposureMap={
                                            exposureMap ? exposureMap : null
                                        }
                                        fetchEvent={fetchEvent}
                                        setBetStartTime={(date) =>
                                            setStartTime(date)
                                        }
                                        setAddNewBet={(val) =>
                                            setAddNewBet(val)
                                        }
                                    />
                                </IonRow>
                            </>
                        ) : null}

                        {eventData &&
                        eventData?.providerName?.toLowerCase() !==
                            "sportradar" ? (
                            <IonRow className="eam-table-section">
                                <MatchOddsTable
                                    exposureMap={
                                        exposureMap ? exposureMap : null
                                    }
                                    loggedIn={loggedIn}
                                    getFormattedMinLimit={getFormattedMinLimit}
                                    getFormattedMaxLimit={getFormattedMaxLimit}
                                    eventData={eventData}
                                    fetchEvent={fetchEvent}
                                    secondaryMatchOdds={secondaryMatchOdds?.filter(
                                        (i) => i.marketName !== "Tied Match",
                                    )}
                                    setBetStartTime={(date) =>
                                        setStartTime(date)
                                    }
                                    setAddNewBet={(val) => setAddNewBet(val)}
                                    showMatchOdds={false}
                                    showSecondaryMatchOdds={true}
                                />
                            </IonRow>
                        ) : null}

                        {eventData && winnerMarket?.marketName ? (
                            <WinnerMarket
                                winnerMarket={winnerMarket}
                                addExchangeBet={addExchangeBet}
                                eventData={eventData}
                                bets={bets}
                                exposureMap={exposureMap}
                                setStartTime={(date) => setStartTime(date)}
                                setAddNewBet={(val) => setAddNewBet(val)}
                            />
                        ) : null}

                        {eventData &&
                        secondaryMarkets?.lineMarkets?.length > 0 ? (
                            <IonRow className="eam-table-section">
                                <LMTable
                                    loggedIn={loggedIn}
                                    getFormattedMinLimit={getFormattedMinLimit}
                                    getFormattedMaxLimit={getFormattedMaxLimit}
                                    exposureMap={
                                        exposureMap ? exposureMap : null
                                    }
                                    fetchEvent={fetchEvent}
                                    setBetStartTime={(date) =>
                                        setStartTime(date)
                                    }
                                    setAddNewBet={(val) => setAddNewBet(val)}
                                />
                            </IonRow>
                        ) : null}

                        <IonRow className="eam-table-section fancy-tab-section">
                            <>
                                <Tabs
                                    value={fancyTabVal}
                                    className="fancy-market-tabs"
                                    onChange={(_, newValue) => {
                                        setFancyTabVal(newValue);
                                    }}
                                >
                                    {secondaryMarkets?.fancyMarkets?.length >
                                    0 ? (
                                        <Tab
                                            label={langData?.["fancy"]}
                                            className="fancy-tab"
                                            value={0}
                                        />
                                    ) : null}
                                    {!["99990", "2378961"].includes(
                                        eventData?.sportId,
                                    ) ? (
                                        <Tab
                                            label={langData?.["premium"]}
                                            className="fancy-tab premium-markets"
                                            value={1}
                                        />
                                    ) : null}
                                </Tabs>
                                <div className="fancy-tab-border"></div>
                                <IonRow>
                                    <TabPanel
                                        value={fancyTabVal}
                                        index={0}
                                        className="fancy-tab-ctn"
                                    >
                                        {eventData &&
                                        secondaryMarkets?.fancyMarkets?.length >
                                            0 ? (
                                            <>
                                                <FMTable
                                                    loggedIn={loggedIn}
                                                    getFormattedMinLimit={
                                                        getFormattedMinLimit
                                                    }
                                                    getFormattedMaxLimit={
                                                        getFormattedMaxLimit
                                                    }
                                                    exposureMap={
                                                        exposureMap
                                                            ? exposureMap
                                                            : null
                                                    }
                                                    fetchEvent={fetchEvent}
                                                    setBetStartTime={(date) =>
                                                        setStartTime(date)
                                                    }
                                                    setAddNewBet={(val) =>
                                                        setAddNewBet(val)
                                                    }
                                                />
                                            </>
                                        ) : null}
                                    </TabPanel>

                                    <IonRow className="row-100">
                                        {" "}
                                        <TabPanel
                                            value={fancyTabVal}
                                            index={1}
                                            className="fancy-tab-ctn premium-iframe-container"
                                        >
                                            {!["99990", "2378961"].includes(
                                                eventData?.sportId,
                                            ) ? (
                                                <>
                                                    {premiumIframeLoading ? (
                                                        <div className="no-fancy-msg">
                                                            {langData?.[
                                                                "loading"
                                                            ] || "Loading..."}
                                                        </div>
                                                    ) : premiumIframeUrl ? (
                                                        <iframe
                                                            src={
                                                                premiumIframeUrl
                                                            }
                                                            className="premium-iframe"
                                                            title="Premium Markets"
                                                            sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups allow-downloads"
                                                        />
                                                    ) : (
                                                        <div className="no-fancy-msg">
                                                            {
                                                                langData?.[
                                                                    "premium_markets_not_found_txt"
                                                                ]
                                                            }
                                                        </div>
                                                    )}
                                                </>
                                            ) : null}
                                        </TabPanel>
                                    </IonRow>
                                </IonRow>
                            </>
                        </IonRow>

                        {eventData &&
                        secondaryMarkets?.bookmakers?.length > 0 &&
                        secondaryMarkets?.bookmakers[0]?.runners?.length > 0 ? (
                            <>
                                <IonRow className="eam-table-section">
                                    <BmMTable
                                        loggedIn={loggedIn}
                                        getFormattedMinLimit={
                                            getFormattedMinLimit
                                        }
                                        getFormattedMaxLimit={
                                            getFormattedMaxLimit
                                        }
                                        bmMData={bmMData.filter((mkt) =>
                                            isBackOnlyMarket(
                                                mkt?.oddType,
                                                mkt?.marketName,
                                            ),
                                        )}
                                        eventData={eventData}
                                        exposureMap={
                                            exposureMap ? exposureMap : null
                                        }
                                        fetchEvent={fetchEvent}
                                        setBetStartTime={(date) =>
                                            setStartTime(date)
                                        }
                                        setAddNewBet={(val) =>
                                            setAddNewBet(val)
                                        }
                                    />
                                </IonRow>
                            </>
                        ) : null}

                        {eventData &&
                        eventData?.providerName?.toLowerCase() !==
                            "sportradar" ? (
                            <IonRow className="eam-table-section mb-40">
                                <MatchOddsTable
                                    exposureMap={
                                        exposureMap ? exposureMap : null
                                    }
                                    loggedIn={loggedIn}
                                    getFormattedMinLimit={getFormattedMinLimit}
                                    getFormattedMaxLimit={getFormattedMaxLimit}
                                    eventData={eventData}
                                    fetchEvent={fetchEvent}
                                    secondaryMatchOdds={secondaryMatchOdds?.filter(
                                        (i) => i.marketName === "Tied Match",
                                    )}
                                    setBetStartTime={(date) =>
                                        setStartTime(date)
                                    }
                                    setAddNewBet={(val) => setAddNewBet(val)}
                                    showMatchOdds={false}
                                    showSecondaryMatchOdds={true}
                                />
                            </IonRow>
                        ) : null}

                        {secondaryMatchOdds?.length === 0 &&
                            secondaryMarkets?.bookmakers?.length === 0 &&
                            secondaryMarkets?.fancyMarkets?.length === 0 && (
                                <NoDataComponent
                                    title={langData?.["markets_not_found_txt"]}
                                    bodyContent={""}
                                    noDataImg={undefined}
                                />
                            )}

                        {isMobile && !oneClickBettingEnabled && (
                            <div className="one-click-betting-container">
                                <div className="one-click-betting-text">
                                    <Checkbox
                                        color="primary"
                                        onClick={() =>
                                            enableOneClickBetting(
                                                !oneClickBettingEnabled,
                                            )
                                        }
                                        checked={oneClickBettingEnabled}
                                    />{" "}
                                    {langData?.["oneClickBettingEnabled"]}
                                </div>
                            </div>
                        )}
                    </IonCol>

                    {!isMobile ? (
                        <IonCol className="stream-section">
                            <div className="sticky-col">
                                {isLiveStreamVisible &&
                                !["99990"].includes(sportId) ? (
                                    <div className="stream-accordion">
                                        <div
                                            className="stream-header"
                                            onClick={streamToast}
                                        >
                                            {langData?.["live_stream"]}
                                        </div>
                                        <div className="stream-body">
                                            {/* {streamAccordion ? (
                        <> */}
                                            <div className="live-stream-ctn">
                                                <CricketLiveStream
                                                    eventID={
                                                        eventData?.sportId ===
                                                        "99994"
                                                            ? secondaryMarkets
                                                                  ?.bookmakers
                                                                  ?.length > 0
                                                                ? eventData?.eventId
                                                                : "sr:match:" +
                                                                  scorecardID
                                                            : eventData
                                                                    ?.matchOdds
                                                                    ?.runners
                                                                    ?.length ===
                                                                    0 &&
                                                                secondaryMarkets
                                                                    ?.bookmakers
                                                                    ?.length >
                                                                    0 &&
                                                                premiumMarkets
                                                                    ?.markets
                                                                    ?.matchOdds
                                                                    .length > 0
                                                              ? "sr:match:" +
                                                                scorecardID
                                                              : eventData?.eventId
                                                    }
                                                    providerUrl={
                                                        eventData?.streamLink ||
                                                        backupStreamUrl
                                                    }
                                                    channelId={
                                                        eventData?.liveStreamChannelId
                                                            ? eventData?.liveStreamChannelId
                                                            : liveStreamChannelId
                                                    }
                                                    clientIp={clientIp}
                                                />
                                            </div>
                                            {/* </>
                      ) : null} */}
                                        </div>
                                    </div>
                                ) : null}

                                <div
                                    className="one-click-betting-container"
                                    style={{ marginBottom: "10px" }}
                                >
                                    <div className="one-click-betting-text">
                                        <Checkbox
                                            color="primary"
                                            onClick={() =>
                                                enableOneClickBetting(
                                                    !oneClickBettingEnabled,
                                                )
                                            }
                                            checked={oneClickBettingEnabled}
                                        />{" "}
                                        {langData?.["oneClickBettingEnabled"]}
                                    </div>
                                </div>

                                <div className="bet-slip-open-bets-ctn">
                                    <div className="betslip-container">
                                        <div className="betslip-bg">
                                            <div
                                                className={`betslip-text ${
                                                    betsTabVal === 0
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() => setBetsTabVal(0)}
                                            >
                                                {langData?.["bet_slip"]}
                                            </div>
                                            <div
                                                className={`betslip-text ${
                                                    betsTabVal === 1
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() => setBetsTabVal(1)}
                                            >
                                                ({langData?.["open_bets"]}) (
                                                {totalOrders})
                                            </div>
                                        </div>
                                    </div>

                                    <TabPanel
                                        value={betsTabVal}
                                        index={0}
                                        className="event-stat-mobile-ctn"
                                    >
                                        {!oneClickBettingEnabled &&
                                        bets.length > 0 &&
                                        !isMobile ? (
                                            <ExchBetslip
                                                setBetStartTime={(date) =>
                                                    setStartTime(date)
                                                }
                                                setAddNewBet={(val) =>
                                                    setAddNewBet(val)
                                                }
                                            />
                                        ) : (
                                            <div className="no-bets-div">
                                                <div className="no-bets-icon-div">
                                                    <img src={noBetsIcon} />
                                                </div>

                                                <div className="no-bet-data">
                                                    {
                                                        langData?.[
                                                            "no_bet_placed_txt"
                                                        ]
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </TabPanel>
                                    <TabPanel
                                        value={betsTabVal}
                                        index={1}
                                        className="event-stat-mobile-ctn"
                                    >
                                        {/* <div className="btn-background">
                      <div className="btn-mybets">
                        <NavLink to="/my_bets">
                          <Button>View All</Button>
                        </NavLink>
                      </div>
                    </div> */}
                                        {openBets?.length > 0 && loggedIn ? (
                                            <ExchOpenBets />
                                        ) : (
                                            <>
                                                <div className="no-bets-div">
                                                    <div className="no-bets-icon-div">
                                                        <img src={noBetsIcon} />
                                                    </div>
                                                    <div className="no-bet-data">
                                                        {
                                                            langData?.[
                                                                "no_bet_placed_txt"
                                                            ]
                                                        }
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabPanel>

                                    {/* <div className="all-markets-promotions web-view">
                  <PromotionSidebar />
                </div> */}
                                </div>
                                {!isMobile && (
                                    <div className="mt-10">
                                        <TrendingGames langData={langData} />
                                    </div>
                                )}
                            </div>
                        </IonCol>
                    ) : null}
                </IonRow>
            ) : null}

            {oneClickBettingEnabled && !isMobile ? (
                <div
                    style={{
                        position: "fixed",
                        bottom: "36px",
                        zIndex: 1000,
                        width: "calc(100% - 525px)",
                    }}
                >
                    <OneClickBetting />
                </div>
            ) : null}

            {/* WEB - Right sdie section(Stream & Betslip ) */}
            {bets.length > 0 ? (
                <div
                    className={
                        isIOS
                            ? "betslip-section ios-betslip mob-betslip-section"
                            : "betslip-section mob-betslip-section"
                    }
                >
                </div>
            ) : null}
        </div>
    );
};


const mapStateToProps = (state: any, ownProps) => {
    const selectedEvent = state.homeMarkets.selectedEvent;
    const event = state.homeMarkets.selectedEvent;

    return {
        eventData: getAllMarketsByEvent(
            state.homeMarkets.events,
            state.homeMarkets.selectedEventType.id,
            state.homeMarkets.selectedCompetition.id,
            selectedEvent.id,
        ),
        secondaryMarkets: getSecondaryMarketsByEvent(
            // state.exchangeSports.secondaryMarketsMap,
            {},
            selectedEvent.id,
        ),
        secondaryMatchOdds: getSecondaryMatchOddsByEvent(
            // state.exchangeSports.secondaryMatchOddsMap,
            {},
            selectedEvent.id,
        ),
        bmMData: getBookmakerMarketsByEvent(
            // state.exchangeSports.secondaryMarketsMap,
            {},
            selectedEvent.id,
        ),

        seEventData: getPremiumMarkets(
            // state.exchangeSports.premiumMarketsMap,
            {},
            selectedEvent.id,
        ),
        lineMarkets:
            getLineMarketsByEvent(
                // state.exchangeSports.secondaryMarketsMap,
                {},
                selectedEvent.id,
            ) || [],
        premiumMarkets: getPremiumMarkets(
            // state.exchangeSports.premiumMarketsMap,
            {},
            event.id,
        ),

        selectedEventType: state.homeMarkets.selectedEventType,
        selectedEvent: selectedEvent,
        bets: state.exchBetSlip.bets,
        openBets: state.exchBetSlip.openBets,
        totalOrders: state.exchBetSlip.totalOrders,
        loggedIn: state.auth.loggedIn,
        balanceSummary: state.auth.balanceSummary,
        streamUrl: state.common.streamUrl,
        // topicUrls: state?.exchangeSports?.topicUrls,
        // houseId: getHouseIdFromToken(),
        // parentId: getParentIdFromToken(),
        accountId: sessionStorage.getItem("aid"),

        // triggerFetchMarkets: state.exchangeSports.triggerFetchMarkets,
        // triggerFetchOrders: state.exchangeSports.triggerFetchOrders,
        // lastOrderUpdatedMarketType:
        //     state.exchangeSports.lastOrderUpdatedMarketType,
        // triggerBetStatus: state.exchangeSports.triggerBetStatus,
        betStatusResponse: state.exchBetSlip.betStatusResponse,
        // betFairWSConnected: state.exchangeSports.betFairWSConnected,
        // dreamWSConnected: state.exchangeSports.dreamWSConnected,
        // sportsRadarWSConnected: state.exchangeSports.sportsRadarWSConnected,
        // pushNotifWSConnection: state.exchangeSports.pushNotifWSConnection,
        alert: state.common.alert,
        langData: state.common.langData,
        fmData: getFancyMarketsByEvent(
            // state.exchangeSports.secondaryMarketsMap,
            {},
            selectedEvent.id,
        ),
        oneClickBettingEnabled: state.exchBetSlip.oneClickBettingEnabled,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        clearExchcngeBets: () => dispatch(clearExchcngeBets()),
        updateBookMakerMarkets: (data: any) => dispatch(updateBookMakerMarkets(data)),
        fetchOpenBets: (eventId: string, sportId: string) => dispatch(fetchOpenBets({ eventId, eventTypeId: sportId })),

        fetchEvent: (
            sportId: string,
            competitionId: string,
            eventId: string,
            marketTime: string,
        ) => dispatch(fetchEvent({eventTypeId: sportId, competitionId, eventId, marketTime})),
        fetchPremiummarketsByEventId: (
            providerId: string,
            competitionId: string,
            sportId: string,
            eventId: string,
            marketTime: string,
        ) =>
            dispatch(
                fetchPremiummarketsByEventId({
                    providerId,
                    competitionId,
                    eventTypeId: sportId,
                    eventId,
                    marketTime,
                }),
            ),
        setExchEvent: (event: any) => dispatch(setExchEvent(event)),
        updateEventScorecard: (scorecard: any) =>
            dispatch(updateEventScorecard(scorecard)),
        clearExchangeBets: () => dispatch(clearExchcngeBets()),
        setBettingInprogress: (val: boolean) =>
            dispatch(setBettingInprogress(val)),
        setOneClickBettingLoading: (val: boolean) =>
            dispatch(setOneClickBettingLoading(val)),
        clearBetStatusResponse: () => dispatch(clearBetStatusResponse()),
        setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
        addExchangeBet: (data: any) => {
            dispatch(clearExchcngeBets());
            dispatch(addBetHandler(data));
        },
        enableOneClickBetting: (val: boolean) =>
            dispatch(enableOneClickBetting(val)),
        setCashoutInProgress: (val: any) => dispatch(setCashoutInProgress(val)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchAllMarkets);
