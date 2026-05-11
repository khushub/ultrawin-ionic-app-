import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import './inde.scss';
import { IonCol, IonRow } from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { getAPIAuth, postAPIAuth } from "../../services/apiInstance";
import { clearEventData, getCricketScore, getEventDataSuccess, getEventScore, getEventVideo, getMarketData, getPremiumData, setCompetitionName, setEventLoaded, setEventName, setEventOpenDate, setIsInplay } from "../../store/slices/eventSlice";
import { setBetDelay, setLimitStatus, setMinMaxAll } from "../../store/slices/betPlacingSlice";
import { formatBetDelayData, formatMinMaxAll } from "../../util/formatters";
import wsService from "../../services/wsService";
import { useDataProcessor } from "../../hooks/useWebWorker";
import { selectEventLoaded, selectEventName, selectEventScore, selectEventVideo, selectIsInplay } from "../../store/selectors/selectors";
import SEO from "../../components/SEO/Seo";
import { CONFIG } from "../../config/config";

import FingerPoint from "../../assets/images/Hand.gif";
import MatchInfo from "../../components/MatchInfo/MatchInfo";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Tab, Tabs } from "@mui/material";
import { setAlertMsg } from "../../store/slices/commonSlice";
import TabPanel from "../../components/TabPanel/TabPanel";
import { ExpandLessSharp, Language } from "@mui/icons-material";
import CricketScorecard from "../../components/ScoreCard/CricketScorecard";
import CricketLiveStream from "../../components/Livestream/CricketLiveStream";
import ExchOpenBets from "../../components/ExchOpenBets/ExchOpenBets";
import { NavLink } from "react-router-dom";
import SportEvent from "../../components/SportEvent";
import { addBetHandler, clearExchcngeBets, enableOneClickBetting, fetchOpenBets, oneClickBetPlaceHandler } from "../../store/slices/exchBetSlipSlice";
import ExchBetSlip from "../../components/ExchBetSlip/ExchBetSlip";
import noBetsIcon from "../../assets/images/icons/no-bets-icon.svg";
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";
import OneClickBetting from "../../components/OneClickBetting";
import { isIOS } from "react-device-detect";
const IS_NEW_SCORECARD_ENABLED = true;


const DEFAULT_GAME = {
    gameId: "150007",
    gameName: "Andar Bahar",
    gameCode: "MAC88-XAB101",
    subProviderName: "Mac88 Gaming",
    providerName: "MAC88",
    superProviderName: "MACHUB",
};


type RouteParams = {
    eventTypeId: string;
    eventId: string;
};

const EventPage = () => {
    const history = useHistory();
    const { eventTypeId, eventId } = useParams<RouteParams>();
    const dispatch = useDispatch<any>();
    const { token, user } = useSelector((state: any) => state.auth);
    const { processEventData, isReady } = useDataProcessor();
    const eventName = useSelector(selectEventName);
    const isLoaded = useSelector(selectEventLoaded);
    const isInplayEvent = useSelector(selectIsInplay);
    const videoSrc = useSelector(selectEventVideo);
    const scoreSrc = useSelector(selectEventScore);
    const openBets = useSelector((state: any) => state.exchBetSlip.openBets)
    const [recentGame, setRecentGame] = useState<any>();
    const [tabVal, setTabVal] = useState(0);
    const [betsTabVal, setBetsTabVal] = useState(0);
    const isMobile = window.innerWidth > 1120 ? false : true;
    const langData = useSelector((state: any) => state.common.langData);
    const oneClickBettingEnabled = useSelector((state: any) => state.exchBetSlip.oneClickBettingEnabled);
    const oneClickBettingLoading  = useSelector((state: any) => state.exchBetSlip.oneClickBettingLoading);
    const bets = useSelector((state: any)=> state.exchBetSlip.bets);
    const availableEventTypes = useSelector((state: any) => state.userDetails.availableEventTypes);

    
    useEffect(() => {
        if (!availableEventTypes?.[eventTypeId]) {
            dispatch(setAlertMsg({
                type: 'error',
                message: 'Game is locked. Please contact upline',
            }));
            history.replace("/home");
        }
    }, [availableEventTypes, eventTypeId]);


    // FETCH OPEN BETS
    useEffect(() => {
        if(eventId && eventTypeId && token) {
            dispatch(fetchOpenBets({ eventId, eventTypeId }));
        }
    }, [eventId, eventTypeId, token])
    
    // REFRESH BALANCE
    useEffect(() => {
        const refreshBalance = async() => {
            if(!user?._id) return;
            try {
                await getAPIAuth(`/refreshBalance/${user?._id}`);
            }catch(err) {
                console.log(err);
            }
        };
        refreshBalance();
        return () => {
            refreshBalance()
        };
    }, [user]);


    // FETCH MARKET BY ID
    useEffect(() => {
        const fetchMarketById = async(body: any) => {
            const response = await postAPIAuth('/getMarketByIdAPI', body);
            if(response?.data?.success){
                const matchOddsData = response?.data?.response?.find((item) => item?.marketType === "MATCH_ODDS");
                if (matchOddsData) {
                    dispatch(getMarketData(matchOddsData));
                    if(!!matchOddsData?.tv_status || matchOddsData?.competitionName!=='Others') {
                        dispatch(getEventVideo(matchOddsData?.url || matchOddsData?.tv));
                        dispatch(getEventScore(matchOddsData?.score));
                    }
                }

                if(response?.data?.userSetting) {
                    const limitStatus = response?.data?.userSetting?.[`status_${eventTypeId}`] || false;
                    dispatch(setLimitStatus(limitStatus));
                    dispatch(setBetDelay(formatBetDelayData(response?.data?.userSetting)));
                    dispatch(setMinMaxAll(formatMinMaxAll(response?.data?.userSetting)));
                }
            }
        }

        if(eventId && eventTypeId && token) {
            let data = (eventTypeId == '7' || eventTypeId == '4339')? { marketId: eventId } : { eventId };
            fetchMarketById(data);
        }
    }, [eventId, eventTypeId, token]);



    const handleEventPulse = useCallback((data) => {  
        if(data?.data?.value && data?.data?.value?.length>0) {
            const matchOddsData = data?.data?.value.find((item) => item[0]?.marketType === "MATCH_ODDS");

            if (matchOddsData && matchOddsData.length > 0) {
                dispatch(setEventLoaded(true));
                dispatch(setIsInplay(!!matchOddsData?.[0]?.marketBook?.inplay));
                dispatch(setEventOpenDate(matchOddsData?.[0]?.openDate));
                console.warn('eventName: ', matchOddsData?.[0]?.eventName)
                dispatch(setEventName(matchOddsData?.[0]?.eventName));
                dispatch(setCompetitionName(matchOddsData?.[0]?.competitionName));

                if (matchOddsData?.[0]?.scoreHomeVirtual?.[0]) {
                    dispatch(getCricketScore(matchOddsData?.[0]?.scoreHomeVirtual?.[0]))
                }
            }else {
                dispatch(setIsInplay(false));
            }

            if(isReady) {
                processEventData(data?.data?.value).then(result => {
                    dispatch(getEventDataSuccess(result));
                })
            }
        }
    }, [dispatch, isReady, processEventData]);
    
    const handlePremiumPulse = useCallback((data) => {
        if(data?.data?.premium && data?.data?.premium?.length>0) {
            dispatch(getPremiumData(data?.data?.premium));
        }
    }, [dispatch]);


    // ─── 1. Connect ONCE when token is available ──────────────────────────────────
    useLayoutEffect(() => {
        if (!token) return;
        wsService.connect(import.meta.env.VITE_SOCKET_URL, token);
        
        return () => {
            wsService.disconnect();
        };
    }, [token]);

 
    // ─── 2. Join/switch room whenever eventId changes ────────────────────────
    useEffect(() => {
        if (!eventId || !token) return;
        wsService.joinEvent(eventId);

        return () => {
            wsService.leaveEvent(eventId);
            dispatch(clearEventData());
            dispatch(setLimitStatus(false));
        };
    }, [eventId, token, dispatch]);


    // ─── 3. Attach/Detach Listeners ─────────────────────────────────────────
    useEffect(() => {
        if (!eventId || !token) return;

        const handleJoined = (msg) => console.log('✅ Joined:', msg.eventId);
        const handleSwitched = (msg) => console.log('🔄 Switched to:', msg.eventId);
        const handleDisconnected = () => console.log('Disconnected');
        const handleReconnecting = ({ attempt, delay }) => {
            console.log(`🔄 Reconnecting... attempt ${attempt}, retrying in ${delay}ms`);
        };

        // Attach listeners
        wsService.on('event-pulse', handleEventPulse);
        wsService.on('event-premium', handlePremiumPulse);
        wsService.on('joined', handleJoined);
        wsService.on('switched', handleSwitched);
        wsService.on('disconnected', handleDisconnected);
        wsService.on('reconnecting', handleReconnecting);

        return () => {
            // Remove listeners on cleanup or when handleEventPulse updates
            wsService.off('event-pulse', handleEventPulse);
            wsService.off('event-premium', handlePremiumPulse);
            wsService.off('joined', handleJoined);
            wsService.off('switched', handleSwitched);
            wsService.off('disconnected', handleDisconnected);
            wsService.off('reconnecting', handleReconnecting);
        };
    }, [eventId, token, handleEventPulse, handlePremiumPulse]);

    

    useEffect(() => {
        const games = JSON.parse(localStorage.getItem("recentCasinoGames")) || [];
        setRecentGame(games.length > 0 ? games[0] : DEFAULT_GAME);
    }, [localStorage.getItem("recentCasinoGames")]);

    
    const redirectToCasino = () => {
        console.log('First Check Condition, then open Game');


        // history.push({
        //     pathname: `/dc/gamev1.1/${recentGame?.gameName?.toLowerCase().replace(/\s+/g, "-")}-${btoa(
        //         recentGame?.gameId?.toString(),
        //     )}-${btoa(recentGame?.gameCode)}-${btoa(recentGame?.provider)}-${btoa(recentGame?.subProvider)}-${btoa(recentGame?.superProvider)}`,
        //     state: { gameName: recentGame?.gameName },
        // });
    };

    const isLiveStreamVisible = useMemo(() => {
        return !user?.isDemo && isInplayEvent && !!videoSrc;
    }, [user, videoSrc, isInplayEvent]);

    const streamToast = useCallback(() => {
        if(user?.isDemo) {
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: "Sorry for inconvenience Use real ID to watch streaming..",
                })
            );
        }
    }, [user]);


    const handleBtnClick = useCallback((data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => {
        const isFancy = (data?.marketType == 'SESSION' || data?.marketType == 'SESSION_ODDS');
        const isBtnNotActive = isFancy?
            data?.marketBook?.status!== 'OPEN' || data?.marketBook?.status === 'SUSPENDED'
            :
            data?.marketBook?.status !== 'OPEN' || item?.status === 'SUSPENDED';

        if (
            isBtnNotActive ||
            !item ||
            !(
                ((data?.fancyName === 'fancy1' || data?.fancyName === 'oddeven') && Number(mainValue) > 0) ||
                (isFancy && Number(mainValue) >= 1) ||
                Number(mainValue) > 1
            )
        ) {
            return;
        }


        if (oneClickBettingLoading) {
            dispatch(setAlertMsg({
                message: langData?.betIsInProgress,
                type: "error",
            }));
            return;
        }

        const betRequest: any = {
            providerId: data?.providerName,
            sportId: data?.eventTypeId,
            seriesId: data?.competitionId,
            seriesName: data?.competitionName,
            eventId: data?.eventId,
            eventName: data?.eventName,
            eventDate: data?.openDate,
            marketId: data?.marketId,
            marketName: data?.marketName,
            marketType: data?.marketType,
            outcomeId: item?.selectionId,
            outcomeDesc: item?.runnerName,
            betType: isBack? "BACK" : "LAY",
            amount: 0,
            oddValue: Number(mainValue),
            oddSize: Number(subValue),
            sessionPrice: -1,
            srEventId: data?.eventId,
            srSeriesId: data?.competitionId,
            srSportId: data?.sportId,
            minStake: data?.minlimit,
            maxStake: data?.maxlimit,
            oddLimt: data?.marketLimits?.maxOdd.toString(),
            mcategory: "ALL",
            fancyName: data?.fancyName ?? '',
        };


        if (oneClickBettingEnabled) {
            dispatch(clearExchcngeBets());
            dispatch(addBetHandler(betRequest));

            dispatch(
                oneClickBetPlaceHandler({
                    bets: [betRequest],
                    langData,
                    eventData: data,
                })
            )
        } else {
            // setSelectedRow(
            //     runner.runnerId +
            //         marketName +
            //         "MO",
            // );

            dispatch(clearExchcngeBets());
            dispatch(addBetHandler(betRequest));
        }

        // console.log('Data: ', data);
        // console.log('Item: ', item);
        // console.log('IsBack: ', isBack);
        // console.log('mainValue: ', mainValue);
        // console.log('subValue: ', subValue);
    }, [oneClickBettingLoading, dispatch, oneClickBettingEnabled]);


    return (
        <div>
            <SEO
                title={CONFIG.title}
                name={eventName}
                description={eventName}
                type={eventName}
                link={""}
            />

            {(eventName && isLoaded)? (
                <IonRow className="eam-ctn">
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
                            eventData={null}
                            routeParams={null}
                        />

                        {!!token && isMobile && (openBets?.length > 0 || eventId)? (
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
                                        disabled={["99990"].includes(eventTypeId)}
                                    />

                                    {isLiveStreamVisible && (
                                        <Tab
                                            label={langData?.["live_stream"]}
                                            value={1}
                                            disabled={(!(isInplayEvent) || ["99990"].includes(eventTypeId))}
                                            onClick={streamToast}
                                        />
                                    )}

                                    <Tab
                                        label={`${langData?.["open_bets"]} (${openBets?.length})`}
                                        value={2}
                                    />
                                </Tabs>

                                <TabPanel
                                    value={tabVal}
                                    index={0}
                                    className="event-stat-mobile-ctn"
                                >
                                    <div>
                                        {tabVal === 0 && eventTypeId !== "99990" ? (
                                            <>
                                                <Accordion
                                                    className="scorecard-accordion"
                                                    defaultExpanded={true}
                                                >
                                                    <AccordionSummary
                                                        expandIcon={<ExpandLessSharp className="expand-icon" />}
                                                        aria-controls="panel1a-content"
                                                        className="scorecard-header"
                                                    >
                                                        {langData?.["live_score"]}
                                                    </AccordionSummary>
                                                    <AccordionDetails className="scorecard-detail">
                                                        <div className="widgets">
                                                            <div>
                                                                {eventTypeId == "4" && false ? (
                                                                    <CricketScorecard />
                                                                ) : IS_NEW_SCORECARD_ENABLED && isInplayEvent && scoreSrc? (
                                                                    <iframe
                                                                        title="sr-scorecard"
                                                                        id="scorecard-frame"
                                                                        allowFullScreen={false}
                                                                        src={scoreSrc}
                                                                        sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                                                                    ></iframe>
                                                                ) : (
                                                                    <div className="sr-widget sr-widget-1"></div>
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
                                                <CricketLiveStream
                                                    eventID={eventId}
                                                    providerUrl={videoSrc}
                                                    channelId={'channelId'}
                                                    clientIp={'clientIp'}
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
                                    {openBets.length > 0? (
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
                        style={oneClickBettingEnabled && !isMobile? { marginBottom: "50px" } : {}}
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
                            eventData={null}
                            routeParams={null}
                        />

                        {!!token && isInplayEvent && !isMobile && !["7", "4339", "99990"].includes(eventTypeId) ? (
                            <Accordion
                                className="scorecard-accordion"
                                defaultExpanded={true}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandLessSharp className="expand-icon" />}
                                    aria-controls="panel1a-content"
                                    className="scorecard-header"
                                >
                                    {langData?.["live_score"]}
                                </AccordionSummary>
                                <AccordionDetails className="scorecard-detail">
                                    <div className="widgets">
                                        <div>
                                            {eventTypeId == "4" && false ? (
                                                <CricketScorecard />
                                            ) : IS_NEW_SCORECARD_ENABLED && scoreSrc? (
                                                <iframe
                                                    title="sr-scorecard"
                                                    id="scorecard-frame"
                                                    allowFullScreen={false}
                                                    src={scoreSrc}
                                                    sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                                                ></iframe>
                                            ) : (
                                                <div className="sr-widget sr-widget-1"></div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        ) : null}

                        <SportEvent 
                            openBets={openBets} 
                            langData={langData}
                            onBtnClick={handleBtnClick}
                        />
                    </IonCol>

                    {!isMobile ? (
                        <IonCol className="stream-section">
                            <div className="sticky-col">
                                {isLiveStreamVisible && !["99990"].includes(eventTypeId) ? (
                                    <div className="stream-accordion">
                                        <div
                                            className="stream-header"
                                            onClick={streamToast}
                                        >
                                            {langData?.["live_stream"]}
                                        </div>
                                        <div className="stream-body">
                                            <div className="live-stream-ctn">
                                                <CricketLiveStream
                                                    eventID={eventId}
                                                    providerUrl={videoSrc}
                                                    channelId={'channelId'}
                                                    clientIp={'clientIp'}
                                                />
                                            </div>
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
                                            onClick={() => dispatch(enableOneClickBetting(!oneClickBettingEnabled))}
                                            checked={oneClickBettingEnabled}
                                        />{" "}
                                        {langData?.["oneClickBettingEnabled"]}
                                    </div>
                                </div>

                                <div className="bet-slip-open-bets-ctn">
                                    <div className="betslip-container">
                                        <div className="betslip-bg">
                                            <div
                                                className={`betslip-text ${betsTabVal === 0? "selected" : ""}`}
                                                onClick={() => setBetsTabVal(0)}
                                            >
                                                {langData?.["bet_slip"]}
                                            </div>
                                            <div
                                                className={`betslip-text ${betsTabVal === 1? "selected" : ""}`}
                                                onClick={() => setBetsTabVal(1)}
                                            >
                                                ({langData?.["open_bets"]}) (
                                                {openBets?.length})
                                            </div>
                                        </div>
                                    </div>

                                    <TabPanel
                                        value={betsTabVal}
                                        index={0}
                                        className="event-stat-mobile-ctn"
                                    >
                                        {!oneClickBettingEnabled &&
                                        bets.length > 0 && !isMobile ? (
                                            <ExchBetSlip
                                                setBetStartTime={(date) => {}}
                                                setAddNewBet={(val) => {}}
                                            />
                                        ) : (
                                            <div className="no-bets-div">
                                                <div className="no-bets-icon-div">
                                                    <img src={noBetsIcon} />
                                                </div>

                                                <div className="no-bet-data">
                                                    {langData?.["no_bet_placed_txt"]}
                                                </div>
                                            </div>
                                        )}
                                    </TabPanel>
                                    <TabPanel
                                        value={betsTabVal}
                                        index={1}
                                        className="event-stat-mobile-ctn"
                                    >
                                        {openBets?.length > 0 && !!token ? (
                                            <ExchOpenBets />
                                        ) : (
                                            <>
                                                <div className="no-bets-div">
                                                    <div className="no-bets-icon-div">
                                                        <img src={noBetsIcon} />
                                                    </div>
                                                    <div className="no-bet-data">
                                                        {langData?.["no_bet_placed_txt"]}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabPanel>
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

            {bets.length > 0 ? (
                <div
                    className={isIOS
                        ? "betslip-section ios-betslip mob-betslip-section"
                        : "betslip-section mob-betslip-section"
                    }
                >
                </div>
            ) : null}
        </div>
    );
};

export default EventPage;
