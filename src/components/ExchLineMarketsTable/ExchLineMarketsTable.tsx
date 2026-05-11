import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getAllMarketsByEvent, getLineMarketsByEvent } from "../../store/selectors/homeMarketsSelectors";
import { addBetHandler, clearExchcngeBets } from "../../store/slices/exchBetSlipSlice";

import "../ExchFancyMarketsTable/ExchFancyMarketsTable.scss";

import { TableContainer, Table, TableBody, TableRow, TableCell, Paper, Button } from "@mui/material";

import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import Modal from "../Modal";
import FancyBookView from "../ExchFancyMarketsTable/FancyBookView/FancyBookView";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { ThousandFormatter } from "../../util/stringUtil";
import ExchBetslip from "../ExchBetSlip/ExchBetSlip";
import { isMobile } from "react-device-detect";
import { oneClickBetPlaceHandler } from "../../store/slices/exchBetSlipSlice";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import { setAlertMsg } from "../../store/slices/commonSlice";
// import CATALOG_API from "../../catalog-api";



type StoreProps = {
    eventData: any;
    lmData: any[];
    openBets: any[];
    commissionEnabled: boolean;
    addExchangeBet: (data: any) => void;
    loggedIn: boolean;
    getFormattedMinLimit: (num: number) => string;
    getFormattedMaxLimit: (num: number) => string;
    bets: any[];
    exposureMap: any;
    fetchEvent: (
        sportId: string,
        competitionId: string,
        eventId: string,
        marketTime: string,
    ) => void;
    setBetStartTime: Function;
    setAddNewBet: Function;
    setAlertMsg: Function;
    langData: any;
    bettingInprogress: boolean;
};

const LMTable: React.FC<StoreProps> = (props) => {
    const {
        eventData,
        lmData,
        bets,
        openBets,
        commissionEnabled,
        addExchangeBet,
        loggedIn,
        exposureMap,
        setBetStartTime,
        setAddNewBet,
        setAlertMsg,
        langData,
        bettingInprogress,
    } = props;

    const {
        oneClickBettingEnabled,
        oneClickBettingStake,
        oneClickBettingLoading,
    } = useSelector((state: any) => state.exchBetslip);

    const disabledStatus = ["suspended", "suspended-manually", "ball_running"];
    const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
    const [lineBookOutcomeId, setLineBookOutcomeId] = useState<string>();
    const [lineBookOutcomeName, setLineBookOutcomeName] = useState<string>();
    const [selectedRow, setSelectedRow] = useState<string>("");
    const [marketLimits, setMarketLimits] = useState<any>({});
    const [hasScrolledToBetslip, setHasScrolledToBetslip] =
        useState<boolean>(false);
    const pendingLimitsRequests = useRef<Set<string>>(new Set());

    // Reset scroll state when bets change
    useEffect(() => {
        setHasScrolledToBetslip(false);
    }, [bets]);

    // Helper function to get market limits with fallback to fetched limits
    const getMarketLimits = (lMarket: any) => {
        return lMarket?.marketLimits || marketLimits[lMarket?.marketId] || null;
    };

    const fetchBetLimits = async (marketId: string) => {
        // JWT token is mandatory for the API
        const jwtToken = sessionStorage.getItem("jwt_token");
        if (!jwtToken) {
            // Remove from pending if no JWT token (don't retry without token)
            pendingLimitsRequests.current.delete(marketId);
            return;
        }

        try {
            const payload = {
                competitionId: eventData.competitionId,
                eventId: eventData.eventId,
                marketId: marketId,
                marketType: "FANCY",
                sessionId: marketId,
                sportId: eventData.sportId,
                mcategory: "LINE",
            };

            // const response = await CATALOG_API.post(
            //     "/catalog/v2/limits/market",
            //     payload,
            //     {
            //         headers: {
            //             Authorization: jwtToken,
            //         },
            //     },
            // );

            // if (response.status === 200 && response.data.success) {
            //     setMarketLimits((prevMarketLimits) => {
            //         return {
            //             ...prevMarketLimits,
            //             [marketId]: {
            //                 minStake: response.data.limits.minStake,
            //                 maxStake: response.data.limits.maxStake,
            //                 maxOdd: response.data.limits.maxOdd,
            //                 delay: response.data.limits.delay,
            //             },
            //         };
            //     });
            //     // Only remove from pending requests on success
            //     pendingLimitsRequests.current.delete(marketId);
            // } else {
            //     // Keep in pending set on failure to prevent retry
            //     console.log("Failed to fetch limits for market:", marketId);
            // }
        } catch (err) {
            console.log(err);
            // Keep in pending set on error to prevent retry
        }
    };

    useEffect(() => {
        for (const lm of lmData) {
            if (
                lm?.marketId &&
                !lm?.marketLimits &&
                !marketLimits[lm?.marketId] &&
                !pendingLimitsRequests.current.has(lm.marketId)
            ) {
                pendingLimitsRequests.current.add(lm.marketId);
                fetchBetLimits(lm.marketId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lmData, marketLimits]);

    const cFactor = CURRENCY_TYPE_FACTOR[1];

    // Define the specific order for line markets (stored in lowercase for comparison)
    const lineMarketOrder = [
        "1st innings 1 overs line",
        "1st innings 4 overs line",
        "1st innings 6 overs line",
        "1st innings 10 overs line",
        "1st innings 15 overs line",
        "1st innings 20 overs line",
        "1st innings 25 overs line",
        "1st innings 30 overs line",
        "1st innings 35 overs line",
        "1st innings 40 overs line",
        "1st innings 45 overs line",
        "1st innings 50 overs line",
        "2nd innings 1 overs line",
        "2nd innings 4 overs line",
        "2nd innings 6 overs line",
        "2nd innings 10 overs line",
        "2nd innings 15 overs line",
        "2nd innings 20 overs line",
        "2nd innings 25 overs line",
        "2nd innings 30 overs line",
        "2nd innings 35 overs line",
        "2nd innings 40 overs line",
        "2nd innings 45 overs line",
        "2nd innings 50 overs line",
    ];

    // Sort line markets: specific order first, then by market ID for others
    const sortedLineMarkets = [...lmData].sort((a, b) => {
        const aMarketName = (a.marketName || "").trim().toLowerCase();
        const bMarketName = (b.marketName || "").trim().toLowerCase();
        const aIndex = lineMarketOrder.indexOf(aMarketName);
        const bIndex = lineMarketOrder.indexOf(bMarketName);

        // Both markets are in the specific order list
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // Only 'a' is in the specific order list - 'a' comes first
        if (aIndex !== -1) {
            return -1;
        }

        // Only 'b' is in the specific order list - 'b' comes first
        if (bIndex !== -1) {
            return 1;
        }

        // Neither is in the specific order list - sort by market ID
        const aMarketId = a.marketId || "";
        const bMarketId = b.marketId || "";
        if (aMarketId > bMarketId) return 1;
        else if (aMarketId < bMarketId) return -1;
        return 0;
    });

    return (
        <>
            <div className="fm-table-ctn" style={{ marginTop: "10px" }}>
                <div
                    className="fm-table-content table-ctn"
                    style={{ position: "relative" }}
                >
                    {(bettingInprogress || oneClickBettingLoading) &&
                        bets?.[0]?.marketType === "FANCY" &&
                        bets?.[0]?.mcategory === "LINE" && (
                            <OneClickBettingCountdown
                                delay={bets?.[0]?.delay || 0}
                            />
                        )}
                    <TableContainer component={Paper}>
                        <Table className="fm-table">
                            <TableBody>
                                <LineHeaderRow
                                    groupName={langData?.["line"] || "Line"}
                                />
                                {sortedLineMarkets &&
                                sortedLineMarkets.length > 0 ? (
                                    <>
                                        {sortedLineMarkets.map(
                                            (lMarket, index) => {
                                                return (
                                                    <>
                                                        <LineMarketRow
                                                            eventData={
                                                                eventData
                                                            }
                                                            lMarket={lMarket}
                                                            index={index}
                                                            cFactor={cFactor}
                                                            loggedIn={loggedIn}
                                                            openBets={openBets}
                                                            disabledStatus={
                                                                disabledStatus
                                                            }
                                                            addExchangeBet={
                                                                addExchangeBet
                                                            }
                                                            setShowBooksModal={() => {
                                                                setLineBookOutcomeId(
                                                                    lMarket.marketId,
                                                                );
                                                                setLineBookOutcomeName(
                                                                    lMarket.marketName,
                                                                );
                                                                setShowBooksModal(
                                                                    true,
                                                                );
                                                            }}
                                                            outcomeOpenBets={openBets.filter(
                                                                (b) =>
                                                                    b.marketType ===
                                                                        2 &&
                                                                    b.outcomeId ===
                                                                        lMarket.marketId,
                                                            )}
                                                            exposureMap={
                                                                exposureMap
                                                            }
                                                            bets={bets}
                                                            selectedRow={
                                                                selectedRow
                                                            }
                                                            setSelectedRow={
                                                                setSelectedRow
                                                            }
                                                            minStake={
                                                                getMarketLimits(
                                                                    lMarket,
                                                                )?.minStake || 0
                                                            }
                                                            maxStake={
                                                                getMarketLimits(
                                                                    lMarket,
                                                                )?.maxStake || 0
                                                            }
                                                            oddLimit={
                                                                getMarketLimits(
                                                                    lMarket,
                                                                )?.maxOdd?.toString() ||
                                                                ""
                                                            }
                                                            commissionEnabled={
                                                                commissionEnabled
                                                            }
                                                            setBetStartTime={(
                                                                date,
                                                            ) =>
                                                                setBetStartTime(
                                                                    date,
                                                                )
                                                            }
                                                            setAddNewBet={(
                                                                val,
                                                            ) =>
                                                                setAddNewBet(
                                                                    val,
                                                                )
                                                            }
                                                            oneClickBettingEnabled={
                                                                oneClickBettingEnabled
                                                            }
                                                            setAlertMsg={
                                                                setAlertMsg
                                                            }
                                                            langData={langData}
                                                            oneClickBettingLoading={
                                                                oneClickBettingLoading ||
                                                                bettingInprogress
                                                            }
                                                            hasScrolledToBetslip={
                                                                hasScrolledToBetslip
                                                            }
                                                            setHasScrolledToBetslip={
                                                                setHasScrolledToBetslip
                                                            }
                                                            marketLimits={
                                                                marketLimits
                                                            }
                                                        />
                                                        {lMarket.notification ? (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={5}
                                                                    padding="none"
                                                                >
                                                                    <div
                                                                        className="marque-new"
                                                                        style={{
                                                                            animationDuration: `${Math.max(10, lMarket.notification.length / 5)}s`,
                                                                        }}
                                                                    >
                                                                        <div className="notifi-mssage">
                                                                            {
                                                                                lMarket.notification
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : null}
                                                    </>
                                                );
                                            },
                                        )}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="fm-table-msg-text">
                                                {langData?.[
                                                    "line_markets_not_found_txt"
                                                ] || "No line markets found"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Modal
                        open={showBooksModal}
                        closeHandler={() => {
                            setShowBooksModal(false);
                            setLineBookOutcomeId(null);
                        }}
                        customClass="fancy-book-dialog"
                        title="Book List"
                        size="sm"
                    >
                        <FancyBookView
                            fancyBookOutcomeId={lineBookOutcomeId}
                            exposureMap={
                                exposureMap &&
                                exposureMap[
                                    `${lineBookOutcomeId}:${lineBookOutcomeName}`
                                ]
                                    ? exposureMap[
                                          `${lineBookOutcomeId}:${lineBookOutcomeName}`
                                      ]
                                    : {}
                            }
                        />
                    </Modal>
                </div>
            </div>
        </>
    );
};

type LineHeaderRowProps = {
    groupName: string;
    className?: string;
    style?: React.CSSProperties;
};

const LineHeaderRow: React.FC<LineHeaderRowProps> = (props) => {
    const { groupName, className, style } = props;
    const tableFields = [
        {
            key: "groupName",
            Label: groupName,
            className: "market-name-cell-head",
            align: "left",
        },
        {
            key: "odds-no",
            Label: "",
            className: "odds-cell-head book-btn-cell",
            align: "center",
        },
        {
            key: "odds-no",
            Label: "No",
            className: "odds-cell-head odds-no-cell",
            align: "center",
        },
        {
            key: "odds-yes",
            Label: "Yes",
            className: "odds-cell-head odds-yes-cell",
            align: "center",
        },
        {
            key: "limits",
            Label: "",
            className: "odds-cell-head limits-cell",
            align: "center",
        },
    ];

    return (
        <TableRow className={"header-row " + className} style={style}>
            {tableFields.map((tF, index) => (
                <TableCell
                    key={tF.key + index}
                    align={tF.align === "left" ? "left" : "center"}
                    className={tF.className}
                >
                    {tF.key === "odds-no" ||
                    tF.key === "odds-yes" ||
                    tF.key === "groupName" ? (
                        <div className={tF.key.toLowerCase() + "-cell"}>
                            {tF.Label?.toLowerCase()}
                        </div>
                    ) : null}
                </TableCell>
            ))}
        </TableRow>
    );
};

type LineMarketRowProps = {
    eventData: any;
    lMarket: any;
    index: number;
    cFactor: number;
    loggedIn: boolean;
    disabledStatus: string[];
    addExchangeBet: (data: any) => void;
    setShowBooksModal: () => void;
    outcomeOpenBets: any[];
    bets: any[];
    selectedRow: string;
    setSelectedRow: (data) => void;
    openBets: any[];
    exposureMap: any;
    maxStake: number;
    minStake: number;
    oddLimit: string;
    commissionEnabled: boolean;
    setBetStartTime: Function;
    setAddNewBet: Function;
    oneClickBettingEnabled: boolean;
    setAlertMsg: Function;
    oneClickBettingLoading: boolean;
    langData: any;
    hasScrolledToBetslip: boolean;
    setHasScrolledToBetslip: (value: boolean) => void;
    marketLimits: any;
};

const LineMarketRow: React.FC<LineMarketRowProps> = (props) => {
    const {
        eventData,
        lMarket,
        index,
        cFactor,
        loggedIn,
        disabledStatus,
        addExchangeBet,
        setShowBooksModal,
        setBetStartTime,
        bets,
        setAddNewBet,
        setSelectedRow,
        openBets,
        exposureMap,
        minStake,
        maxStake,
        oddLimit,
        commissionEnabled,
        oneClickBettingEnabled,
        setAlertMsg,
        oneClickBettingLoading,
        langData,
        hasScrolledToBetslip,
        setHasScrolledToBetslip,
        marketLimits,
    } = props;
    const dispatch = useDispatch<any>();

    // Helper function to get market limits with fallback to fetched limits
    const getMarketLimits = (lMarket: any) => {
        return lMarket?.marketLimits || marketLimits[lMarket?.marketId] || null;
    };

    const isLineSuspended = (lMarketSuspended: boolean) => {
        if (eventData?.eventSuspended === true) return true;
        return lMarketSuspended;
    };

    const isLineDisabled = (lMarketDisabled: boolean) => {
        return lMarketDisabled;
    };

    return (
        <>
            <TableRow key={"row-" + index}>
                <TableCell
                    className="market-name-cell"
                    key={"row-" + index + "cell-1"}
                >
                    <div className="market">
                        {lMarket.customMarketName
                            ? lMarket.customMarketName
                            : lMarket.marketName}{" "}
                        {lMarket.commissionEnabled ? "*" : null}
                    </div>
                </TableCell>
                <TableCell
                    className="odds-cell book-btn-cell"
                    key={"row-" + index + "cell-4"}
                >
                    <Button
                        className="fancy-book-btn"
                        onClick={() => {
                            if (
                                exposureMap &&
                                exposureMap[
                                    `${lMarket.marketId}:${lMarket.marketName}`
                                ]
                            )
                                setShowBooksModal();
                        }}
                        disabled={
                            !(
                                exposureMap &&
                                exposureMap[
                                    `${lMarket.marketId}:${lMarket.marketName}`
                                ]
                            )
                        }
                    >
                        {langData?.["book"]}
                    </Button>
                </TableCell>
                <TableCell
                    className="odds-cell"
                    key={"row-" + index + "cell-2"}
                >
                    <div className="odds-block">
                        <ExchOddBtn
                            mainValue={lMarket.layPrice}
                            mainValueClass="runs"
                            subValue={lMarket.laySize}
                            subValueClass="odds"
                            oddType="odds-no-cell"
                            valueType="lineMarketOdds"
                            disable={
                                disabledStatus.includes(
                                    lMarket.status.toLowerCase(),
                                ) ||
                                isLineSuspended(lMarket.suspend) === true ||
                                isLineDisabled(lMarket.disable) === true
                            }
                            onClick={() => {
                                if (oneClickBettingLoading) {
                                    setAlertMsg({
                                        message: langData?.betIsInProgress,
                                        type: "error",
                                    });
                                    return;
                                }
                                if (
                                    !disabledStatus.includes(
                                        lMarket.status.toLowerCase(),
                                    ) &&
                                    isLineSuspended(lMarket.suspend) !== true &&
                                    isLineDisabled(lMarket.disable) !== true
                                ) {
                                    const betData: any = {
                                        providerId: eventData.lineProvider,
                                        sportId: eventData.sportId,
                                        seriesId: eventData.competitionId,
                                        seriesName: eventData.competitionName,
                                        eventId: eventData.eventId,
                                        eventName: eventData.eventName,
                                        eventDate: eventData.openDate,
                                        marketId: lMarket.marketId,
                                        marketName: lMarket.marketName,
                                        marketType: "FANCY" as const,
                                        outcomeId: lMarket.marketId,
                                        outcomeDesc: "@ " + lMarket.layPrice,
                                        betType: "LAY",
                                        amount: 0,
                                        oddValue: 100,
                                        sessionPrice: lMarket.layPrice,
                                        oddLimt: oddLimit,
                                        minStake: minStake,
                                        maxStake: maxStake,
                                        mcategory: lMarket.category,
                                        displayOddValue: lMarket.layPrice,
                                        delay:
                                            getMarketLimits(lMarket)?.delay ||
                                            0,
                                    };

                                    if (oneClickBettingEnabled) {
                                        addExchangeBet(betData);
                                        dispatch(
                                            oneClickBetPlaceHandler({
                                                bets: [betData],
                                                langData,
                                                eventData,
                                            })
                                        );
                                    } else {
                                        setSelectedRow(
                                            lMarket.marketName + "LM",
                                        );
                                        addExchangeBet(betData);
                                    }
                                }
                            }}
                        />
                    </div>
                </TableCell>

                <TableCell
                    className="odds-cell"
                    key={"row-" + index + "cell-3"}
                >
                    <div className="odds-block">
                        <ExchOddBtn
                            mainValue={lMarket.backPrice}
                            mainValueClass="runs"
                            subValue={lMarket.backSize}
                            subValueClass="odds"
                            oddType="odds-yes-cell"
                            valueType="lineMarketOdds"
                            disable={
                                disabledStatus.includes(
                                    lMarket.status.toLowerCase(),
                                ) ||
                                isLineSuspended(lMarket.suspend) === true ||
                                isLineDisabled(lMarket.disable) === true
                            }
                            onClick={() => {
                                if (oneClickBettingLoading) {
                                    setAlertMsg({
                                        message: langData?.betIsInProgress,
                                        type: "error",
                                    });
                                    return;
                                }
                                if (
                                    !disabledStatus.includes(
                                        lMarket.status.toLowerCase(),
                                    ) &&
                                    isLineSuspended(lMarket.suspend) !== true &&
                                    isLineDisabled(lMarket.disable) !== true
                                ) {
                                    const betData: any = {
                                        providerId: eventData.lineProvider,
                                        sportId: eventData.sportId,
                                        seriesId: eventData.competitionId,
                                        seriesName: eventData.competitionName,
                                        eventId: eventData.eventId,
                                        eventName: eventData.eventName,
                                        eventDate: eventData.openDate,
                                        marketId: lMarket.marketId,
                                        marketName: lMarket.marketName,
                                        marketType: "FANCY" as const,
                                        outcomeId: lMarket.marketId,
                                        outcomeDesc: "@ " + lMarket.backPrice,
                                        betType: "BACK",
                                        amount: 0,
                                        oddValue: 100,
                                        sessionPrice: lMarket.backPrice,
                                        oddLimt: oddLimit,
                                        minStake: minStake,
                                        maxStake: maxStake,
                                        mcategory: lMarket.category,
                                        displayOddValue: lMarket.backPrice,
                                        delay:
                                            getMarketLimits(lMarket)?.delay ||
                                            0,
                                    };

                                    if (oneClickBettingEnabled) {
                                        addExchangeBet(betData);
                                        dispatch(
                                            oneClickBetPlaceHandler({
                                                bets: [betData],
                                                langData,
                                                eventData,
                                            })
                                        );
                                    } else {
                                        setSelectedRow(
                                            lMarket.marketName + "LM",
                                        );
                                        addExchangeBet(betData);
                                    }
                                }
                            }}
                        />
                    </div>
                </TableCell>

                <TableCell className="limits-cell">
                    <div className="limits-data">
                        <div className="row web-view">
                            <div>
                                {langData?.["min"]}:{" "}
                                {minStake
                                    ? ThousandFormatter(
                                          minStake ? minStake / cFactor : 100,
                                      )
                                    : 0}
                            </div>
                            <div>
                                {langData?.["max"]}:{" "}
                                {maxStake
                                    ? maxStake % 1000 === 0
                                        ? ThousandFormatter(
                                              maxStake
                                                  ? maxStake / cFactor
                                                  : 100,
                                          )
                                        : maxStake
                                          ? maxStake / cFactor
                                          : 100
                                    : 0}
                            </div>
                        </div>
                        <div className="row mob-view">
                            <div>
                                {langData?.["min"]}:{" "}
                                {minStake
                                    ? ThousandFormatter(
                                          minStake ? minStake / cFactor : 100,
                                      )
                                    : 0}
                            </div>{" "}
                            <div>
                                {" "}
                                {langData?.["max"]}:{" "}
                                {maxStake
                                    ? maxStake % 1000 === 0
                                        ? ThousandFormatter(
                                              maxStake
                                                  ? maxStake / cFactor
                                                  : 100,
                                          )
                                        : maxStake
                                          ? maxStake / cFactor
                                          : 100
                                    : 0}
                            </div>
                        </div>
                    </div>
                </TableCell>
                {disabledStatus.includes(lMarket.status.toLowerCase()) ||
                isLineSuspended(lMarket.suspend) === true ||
                isLineDisabled(lMarket.disable) === true ? (
                    <div
                        className="disabled-odds-cell"
                        key={"row-" + index + "cell-5"}
                    >
                        {lMarket.status.toLowerCase().includes("suspended") ||
                        isLineSuspended(lMarket.suspend) === true ||
                        isLineDisabled(lMarket.disable) === true
                            ? "SUSPENDED"
                            : lMarket.status.replace("_", " ")}
                    </div>
                ) : null}
            </TableRow>
            {!oneClickBettingEnabled &&
            bets?.length > 0 &&
            bets?.[0]?.marketName === lMarket?.marketName &&
            bets?.[0]?.marketId === lMarket?.marketId &&
            isMobile ? (
                <TableRow
                    className="inline-betslip"
                    ref={(el) => {
                        if (el && !hasScrolledToBetslip) {
                            setHasScrolledToBetslip(true);
                            setTimeout(() => {
                                el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                    inline: "nearest",
                                });
                            }, 100);
                        }
                    }}
                >
                    <TableCell colSpan={12}>
                        <ExchBetslip
                            setBetStartTime={(date) => setBetStartTime(date)}
                            setAddNewBet={(val) => setAddNewBet(val)}
                        />
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
};

const mapStateToProps = (state: any) => {
    const eventType = state.exchangeSports.selectedEventType;
    const competition = state.exchangeSports.selectedCompetition;
    const event = state.exchangeSports.selectedEvent;
    return {
        eventData: getAllMarketsByEvent(
            state.exchangeSports.events,
            eventType.id,
            competition.id,
            event.id,
        ),
        lmData:
            getLineMarketsByEvent(
                state.exchangeSports.secondaryMarketsMap,
                event.id,
            ) || [],
        bets: state.exchBetslip.bets,
        openBets: state.exchBetslip.openBets,
        commissionEnabled: state.common.commissionEnabled,
        langData: state.common.langData,
        bettingInprogress: state.exchBetslip.bettingInprogress,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        addExchangeBet: (data: any) => {
            dispatch(clearExchcngeBets());
            dispatch(addBetHandler(data));
        },
        setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LMTable);
