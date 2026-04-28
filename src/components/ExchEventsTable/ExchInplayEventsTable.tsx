import { Accordion, AccordionDetails, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { fetchCompetitions, fetchEventsByCompetition, setCompetition, setEventType, setExchEvent } from "../../store/slices/homeMarketsSlice";
import { isMobile } from "react-device-detect";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import LiveSymbol from "../../assets/images/icons/LiveSymbol.svg?react";
import EventDateDisplay from "../../common/EventDateDisplay/EventDateDisplay";
import EventName from "../../common/EventName/EventName";
import MarketEnabled from "../../common/MarketEnabled/MarketEnabled";
import {
    BETFAIR_PROVIDER_ID,
    getSportLangKeyByName,
    SportIconMapInplay,
} from "../../util/stringUtil";
// import {
//     disconnectToWS,
//     subscribeWsForEventOdds,
// } from "../../webSocket/webSocket";
import ExchMobOddView from "../ExchOddButton/ExchMobOddView";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import "./ExchEventsTable.scss";
import moment from "moment";


type InplayEventsObj = {
    sportId: string;
    sportName: string;
    sportSlug: string;
    events: any[];
};

type StoreProps = {
    allowedConfig: number;
    inplayEvents: InplayEventsObj[];
    setEventType: (event: any) => void;
    setCompetition: (event: any) => void;
    setExchEvent: (event: any) => void;
    fetchCompetitions: (eventTypeId: string) => void;
    fetchEventsByCompetition: (
        eventTypeId: string,
        competitionId: string,
    ) => string;
    fetchingEvents: boolean;
    loggedIn: boolean;
    topicUrls: any;
    // betFairWSConnected: boolean;
    mobBanners: any;
    langData: any;
};

export const EmptyOddsBlock = React.memo(() => {
    return (
        <React.Fragment>
            <div className="odds-block">
                <ExchOddBtn mainValue={null} oddType="back-odd" />
                <ExchOddBtn mainValue={null} oddType="lay-odd" />
            </div>
        </React.Fragment>
    );
});
const InplayEventsTable: React.FC<StoreProps> = (props) => {
    const {
        allowedConfig,
        inplayEvents,
        setEventType,
        setCompetition,
        setExchEvent,
        fetchingEvents,
        loggedIn,
        topicUrls,
        // betFairWSConnected,
        mobBanners,
        langData,
    } = props;
    const history = useHistory();
    const teamTypes = ["home", "draw", "away"];
    // const [openBetslip, setOpenBetslip] = useState<boolean>(true);
    const [wsChannels, setWsChannels] = useState<string[]>([]);
    const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
    const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");

    const tableFields = [
        {
            key: "schedle",
            Label: ":eventType",
            className: "schedule-cell schedule-cell-header br-inplay-start",
            align: "left",
            colSpan: 9,
        },
        // { key: 'teams', Label: 'Teams', className: 'teams-cell', align: 'left' },
        {
            key: "homeTeamOdds",
            Label: "1",
            className: "odds-cell-head web-view br-inplay-middle",
            align: "center",
            colSpan: 1,
        },
        {
            key: "drawOdds",
            Label: "X",
            className: "odds-cell-head web-view br-inplay-middle",
            align: "center",
            colSpan: 1,
        },
        {
            key: "awayTeamOdds",
            Label: "2",
            className: "odds-cell-head web-view br-inplay-end",
            align: "center",
            colSpan: 1,
        },
        // {
        //   key: 'more',
        //   Label: '',
        //   className: 'all-markets-link-cell',
        //   align: 'center',
        // },
    ];

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

    const getOdds = (eventData: any, teamType: string) => {
        const runners = eventData?.marketBook?.runners ?? [];

        const runner = teamType === 'home'
        ? runners?.[0]
        : teamType === 'away' 
        ? runners?.[1]
        : runners?.[2]

        if (!runner) return null;

        return [
            {
                type: 'back-odd',
                price: runner.availableToBack?.price,
                size: runner.availableToBack?.size,
                outcomeId: runner.selectionId,
                outcomeName: runner.runnerName,
            },
            {
                type: 'lay-odd',
                price: runner.availableToLay?.price,
                size: runner.availableToLay?.size,
                outcomeId: runner.selectionId,
                outcomeName: runner.runnerName,
            },
        ];
    };

    const handleEventChange = (iEvent: InplayEventsObj, event: any) => {
        const competitionSlug = event.competitionName
            ? event.competitionName
                  .toLocaleLowerCase()
                  .replace(/[^a-z0-9]/g, " ")
                  .replace(/ +/g, " ")
                  .trim()
                  .split(" ")
                  .join("-")
            : "league";
        setEventType({
            id: iEvent.sportId,
            name: iEvent.sportName,
            slug: iEvent.sportSlug,
        });
        setCompetition({
            id: event.competitionId,
            name: event.competitionName,
            slug: competitionSlug,
        });
        setExchEvent({
            id: event.eventId,
            name: event.eventName,
            slug: event.eventSlug,
        });

        if (event?.providerName?.toLowerCase() === "sportradar" && !loggedIn) {
            history.push("/login");
        } else if (event?.catId === "SR VIRTUAL") {
            history.push(
                `/exchange_sports/virtuals/${iEvent.sportSlug}/${competitionSlug}/${
                    event.eventSlug
                }/${btoa(`${event.sportId}:${event.competitionId}:${event.eventId}`)}`,
            );
        } else {
            history.push(
                `/exchange_sports/${iEvent.sportSlug}/${competitionSlug}/${
                    event.eventSlug
                }/${btoa(`${event.providerName}:${event.sportId}:${event.competitionId}:${event.eventId}:${moment(event.openDate).unix()}`)}`,
                {
                    homeTeam: event?.homeTeam,
                    awayTeam: event?.awayTeam,
                    openDate: event?.openDate,
                },
            );
        }
    };

    // useEffect(() => {
    //     if (loggedIn && inplayEvents.length > 0 && topicUrls?.matchOddsTopic) {
    //         for (let iEvent of inplayEvents) {
    //             const subs = [...wsChannels];
    //             updateMatchOddsTopic(
    //                 topicUrls?.matchOddsTopic,
    //                 topicUrls?.matchOddsBaseUrl,
    //             );
    //             for (let sEvent of iEvent.events) {
    //                 if (!subs.includes(sEvent.eventId)) {
    //                     subs.push(sEvent.eventId);
    //                     subscribeWsForEventOdds(
    //                         topicUrls?.matchOddsTopic,
    //                         sEvent.sportId,
    //                         sEvent.competitionId,
    //                         sEvent.eventId,
    //                         sEvent.matchOdds?.marketId,
    //                     );
    //                 }
    //             }
    //             setWsChannels(subs);
    //         }
    //     }
    // }, [betFairWSConnected, inplayEvents, loggedIn]);

    const GetSportIcon = ({ sportId }) => {
        const IconComponent = SportIconMapInplay[sportId];

        if (!IconComponent) {
            return null; // or a default icon/component
        }

        return (
            <div>
                <IconComponent
                    width={24}
                    height={24}
                    className="ip-event-icon"
                />
            </div>
        );
    };

    return (
        <>
            <div className="events-table-ctn live-events-ctn">
                {inplayEvents.length > 0 ? (
                    inplayEvents.map((iEvent, idx) => (
                        <>
                            {allowedConfig !== 0 ? (
                                <>
                                    <Accordion
                                        className="eventType-accordion"
                                        defaultExpanded={true}
                                        key={idx}
                                    >
                                        <AccordionDetails className="inplay-events-tbl-container">
                                            <div className="events-table-content table-ctn">
                                                <TableContainer
                                                    component={Paper}
                                                >
                                                    <Table className="events-table inplay-table">
                                                        <TableHead>
                                                            <TableRow>
                                                                {tableFields.map(
                                                                    (
                                                                        tF,
                                                                        index,
                                                                    ) => (
                                                                        <TableCell
                                                                            key={
                                                                                tF.key +
                                                                                index
                                                                            }
                                                                            align={
                                                                                tF.align ===
                                                                                "left"
                                                                                    ? "left"
                                                                                    : "center"
                                                                            }
                                                                            colSpan={
                                                                                tF.colSpan
                                                                                    ? tF.colSpan
                                                                                    : 1
                                                                            }
                                                                            className={
                                                                                tF.className
                                                                            }
                                                                        >
                                                                            {tF.Label ===
                                                                            ":eventType" ? (
                                                                                <div className="icon-and-name">
                                                                                    <GetSportIcon
                                                                                        sportId={iEvent?.sportId}
                                                                                    />
                                                                                    <div className="ip-event-name">
                                                                                        {
                                                                                            langData?.[
                                                                                                getSportLangKeyByName( iEvent.sportName)
                                                                                            ]
                                                                                        }{" "}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                tF.Label
                                                                            )}
                                                                        </TableCell>
                                                                    ),
                                                                )}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {iEvent?.events.map(
                                                                (
                                                                    sEvent,
                                                                    idx,
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            sEvent?.eventId
                                                                        }
                                                                        onClick={() =>
                                                                            handleEventChange(
                                                                                iEvent,
                                                                                sEvent,
                                                                            )
                                                                        }
                                                                        className="bgc-white"
                                                                    >
                                                                        <TableCell
                                                                            className="schedule-cell ipe-time-display web-view"
                                                                            colSpan={1}
                                                                        >
                                                                            <EventDateDisplay
                                                                                openDate={sEvent?.openDate}
                                                                                forcedInplay={sEvent?.forcedInplay}
                                                                                status={sEvent?.status}
                                                                                sportId={sEvent?.sportId}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell
                                                                            className="teams-cell mob-et-b-c"
                                                                            colSpan={8}
                                                                        >
                                                                            <div
                                                                                className="all-markets-nav-link"
                                                                                key={
                                                                                    "all-markets-link"
                                                                                }
                                                                                // onClick={() =>
                                                                                //   handleEventChange(iEvent, sEvent)
                                                                                // }
                                                                            >
                                                                                {sEvent?.homeTeam !=="" &&
                                                                                sEvent?.awayTeam !=="" ? (
                                                                                    <>
                                                                                        <div className=" team-name-ctn">
                                                                                            <div className="temas-col">
                                                                                                <EventName
                                                                                                    eventName={sEvent?.eventName}
                                                                                                    homeTeam={sEvent?.homeTeam}
                                                                                                    awayTeam={sEvent?.awayTeam}
                                                                                                    openDate={sEvent?.openDate}
                                                                                                    forcedInplay={sEvent?.forcedInplay}
                                                                                                    status={sEvent?.status}
                                                                                                    sportId={sEvent?.sportId}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="enabled-markets">
                                                                                                {sEvent.status ==="IN_PLAY" ? (
                                                                                                    <div className="live-img">
                                                                                                        {/* TODO: make this come from langData */}
                                                                                                        <LiveSymbol />
                                                                                                    </div>
                                                                                                ) : null}
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={sEvent?.catId ==="SR VIRTUAL"}
                                                                                                    marketType={"V"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={
                                                                                                        sEvent?.enablePremium &&
                                                                                                        sEvent?.catId !=="SR VIRTUAL"
                                                                                                    }
                                                                                                    marketType={"P"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={sEvent?.marketType == 'MATCH_ODDS'}
                                                                                                    marketType={"MO"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={!!sEvent?.bm}
                                                                                                    marketType={"BM"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={!!sEvent?.fancy}
                                                                                                    marketType={"F"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={sEvent?.enableToss}
                                                                                                    marketType={"T"}
                                                                                                />
                                                                                                <MarketEnabled
                                                                                                    marketEnabled={sEvent?.marketTypeStatus != 0}
                                                                                                    marketType={"V2"}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="team-name">
                                                                                        <div className="temas-col">
                                                                                            <EventName
                                                                                                eventName={sEvent?.eventName}
                                                                                                openDate={sEvent?.openDate}
                                                                                                forcedInplay={sEvent?.forcedInplay}
                                                                                                status={sEvent?.status}
                                                                                                sportId={sEvent?.sportId}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="enabled-markets">
                                                                                            <MarketEnabled
                                                                                                marketEnabled={sEvent?.catId ==="SR VIRTUAL"}
                                                                                                marketType={"V"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={
                                                                                                    sEvent?.enablePremium &&
                                                                                                    sEvent?.catId !=="SR VIRTUAL"
                                                                                                }
                                                                                                marketType={"P"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={sEvent?.marketType == 'MATCH_ODDS'}
                                                                                                marketType={"MO"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={!!sEvent?.bm}
                                                                                                marketType={"BM"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={!!sEvent?.fancy}
                                                                                                marketType={"F"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={sEvent?.enableToss}
                                                                                                marketType={"T"}
                                                                                            />
                                                                                            <MarketEnabled
                                                                                                marketEnabled={sEvent?.marketTypeStatus != 0}
                                                                                                marketType={"V2"}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {isMobile && (
                                                                                    <div className="mob-odds-row new-odds-row">
                                                                                        <EventDateDisplay
                                                                                            openDate={sEvent?.openDate}
                                                                                            forcedInplay={sEvent?.forcedInplay}
                                                                                            status={sEvent?.status}
                                                                                            sportId={sEvent?.sportId}
                                                                                        />
                                                                                        {teamTypes.map((teamType, index) => (
                                                                                                <div
                                                                                                    className="mob-odds-block"
                                                                                                    key={ teamType + index }
                                                                                                >
                                                                                                    <div className="mob-exchange-btn-odd-row">
                                                                                                        {sEvent?.marketBook?.runners?.length ? (
                                                                                                            getOdds( sEvent, teamType) ? (
                                                                                                                <>
                                                                                                                    {getOdds( sEvent, teamType ).map((odd) => (
                                                                                                                            <ExchMobOddView
                                                                                                                                mainValue={odd?.price
                                                                                                                                }
                                                                                                                                subValue={odd?.size}
                                                                                                                                oddType={
                                                                                                                                    !sEvent.enableMatchOdds && sEvent.enablePremium
                                                                                                                                    ? odd.type === "back-odd"? "premium-odd" : "lay-odd"
                                                                                                                                    : odd.type === "back-odd"? "back-odd" : "lay-odd"
                                                                                                                                }
                                                                                                                                disable={
                                                                                                                                    sEvent?.marketBook?.status?.toLowerCase().includes('suspended') ||
                                                                                                                                    sEvent?.marketBook?.status?.toLowerCase().includes('closed')
                                                                                                                                }
                                                                                                                                valueType={
                                                                                                                                    !sEvent.enableMatchOdds &&
                                                                                                                                    sEvent.enablePremium
                                                                                                                                        ? "premiumOdds"
                                                                                                                                        : "matchOdds"
                                                                                                                                }
                                                                                                                                showSubValueinKformat={true}
                                                                                                                                // onClick={() => null}
                                                                                                                            />
                                                                                                                        ),
                                                                                                                    )}
                                                                                                                </>
                                                                                                            ) : (
                                                                                                                <>
                                                                                                                    <ExchMobOddView
                                                                                                                        mainValue={null}
                                                                                                                        oddType="back-odd"
                                                                                                                        disable={true}
                                                                                                                    />
                                                                                                                    <ExchMobOddView
                                                                                                                        mainValue={null}
                                                                                                                        oddType="lay-odd"
                                                                                                                        disable={true}
                                                                                                                    />
                                                                                                                </>
                                                                                                            )
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <ExchMobOddView
                                                                                                                    mainValue={null}
                                                                                                                    oddType="back-odd"
                                                                                                                    disable={true}
                                                                                                                />
                                                                                                                <ExchMobOddView
                                                                                                                    mainValue={null}
                                                                                                                    oddType="lay-odd"
                                                                                                                    disable={true}
                                                                                                                />
                                                                                                            </>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        {!isMobile &&
                                                                            teamTypes.map(
                                                                                ( teamType, index ) => (
                                                                                    <TableCell
                                                                                        className="odds-cell"
                                                                                        align="center"
                                                                                        colSpan={1}
                                                                                        key={ teamType + index }
                                                                                    >
                                                                                        {sEvent?.marketBook?.runners?.length ? (
                                                                                            getOdds( sEvent, teamType) ? (
                                                                                                <div className="odds-block">
                                                                                                    {getOdds(sEvent, teamType).map((odd) => (
                                                                                                            <ExchOddBtn
                                                                                                                mainValue={odd?.price}
                                                                                                                subValue={odd?.size}
                                                                                                                oddType={odd.type ==="back-odd"? "back-odd" : "lay-odd"}
                                                                                                                disable={
                                                                                                                    sEvent?.marketBook?.status?.toLowerCase().includes('suspended') ||
                                                                                                                    sEvent?.marketBook?.status?.toLowerCase().includes('closed')
                                                                                                                }
                                                                                                                valueType="matchOdds"
                                                                                                                showSubValueinKformat={true}
                                                                                                                onClick={() =>null}
                                                                                                            />
                                                                                                        ),
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <EmptyOddsBlock />
                                                                                            )
                                                                                        ) : (
                                                                                            <EmptyOddsBlock />
                                                                                        )}
                                                                                    </TableCell>
                                                                                ),
                                                                            )}
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </>
                            ) : null}
                        </>
                    ))
                ) : !fetchingEvents ? (
                    <div className="events-table-msg-text">
                        {langData?.["no_events_txt"]}
                    </div>
                ) : (
                    Array.from({ length: 10 }).map((_) => (
                        <Skeleton
                            height={"20vh"}
                            width="100%"
                            style={{ marginBottom: "-40px" }}
                        />
                    ))
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state: any) => {
    return {
        // bets: state.exchBetSlip.bets,
        allowedConfig: state.common.allowedConfig,
        loggedIn: state.auth.loggedIn,
        fetchingEvents: state.homeMarkets.fetchingEvents,
        topicUrls: state?.homeMarkets?.topicUrls,
        // betFairWSConnected: state.exchangeSports.betFairWSConnected,
        langData: state.common.langData,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        setEventType: (eType: any) => dispatch(setEventType(eType)),
        setCompetition: (competition: any) =>
            dispatch(setCompetition(competition)),
        setExchEvent: (event: any) => dispatch(setExchEvent(event)),
        fetchCompetitions: (eventTypeId: string) =>
            dispatch(fetchCompetitions(eventTypeId)),
        fetchEventsByCompetition: (etId: string, cId: string) =>
            dispatch(fetchEventsByCompetition({eventTypeId: etId, competitionId: cId, events: [], track: undefined})),
        // addExchangeBet: (data: BsData) => dispatch(addExchangeBet(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(InplayEventsTable);
