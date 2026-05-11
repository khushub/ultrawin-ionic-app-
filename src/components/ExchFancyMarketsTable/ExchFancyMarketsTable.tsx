import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
    getAllMarketsByEvent,
    getFancyMarketsByEvent,
} from "../../store/selectors/homeMarketsSelectors";
import {
    addBetHandler,
    clearExchcngeBets,
} from "../../store/slices/exchBetSlipSlice";

import "./ExchFancyMarketsTable.scss";

import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Drawer, Button, Accordion, AccordionSummary } from "@mui/material";

import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import Modal from "../Modal";

import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";
import FancyBookView from "./FancyBookView/FancyBookView";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { ThousandFormatter } from "../../util/stringUtil";
import { CloseOutlined, ExpandLessSharp } from "@mui/icons-material";
import ExchBetslip from "../ExchBetSlip/ExchBetSlip";
import { isMobile } from "react-device-detect";
import { isFancyMarketDisabled } from "../../store/selectors/homeMarketsSelectors";
// import CATALOG_API from "../../catalog-api";
import { oneClickBetPlaceHandler } from "../../store/slices/exchBetSlipSlice";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import { setAlertMsg } from "../../store/slices/commonSlice";


type StoreProps = {
    eventData: any;
    fmData: any[];
    openBets: any[];
    commissionEnabled: boolean;
    addExchangeBet: (data: any) => void;
    loggedIn: boolean;
    getFormattedMinLimit: (num: number) => string;
    getFormattedMaxLimit: (num: number) => string;
    bets: any[];
    exposureMap: any;
    fancySuspended: boolean;
    fancyDisabled: boolean;
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

type OddsInfoMsg = {
    launch: boolean;
    oddsType: string;
    eventTypeID: string;
};

const FMTable: React.FC<StoreProps> = (props) => {
    const {
        eventData,
        fmData,
        bets,
        openBets,
        commissionEnabled,
        addExchangeBet,
        loggedIn,
        exposureMap,
        fancySuspended,
        fancyDisabled,
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
    const [fancyBookOutcomeId, setFancyBookOutcomeId] = useState<string>();
    const [fancyBookOutcomeName, setFancyBookOutcomeName] = useState<string>();
    const [fancyBookIsKhado, setFancyBookIsKhado] = useState<boolean>(false);
    const [fancyCategories, setFancyCategories] = useState<Set<string>>(
        new Set(),
    );

    const fancyCategoriesOrder = [
        { fancyCategory: "All", langKey: "all_capital" },
        { fancyCategory: "sessions", langKey: "sessions" },
        { fancyCategory: "wpmarket", langKey: "wp_market" },
        { fancyCategory: "extramarket", langKey: "extra_market" },
        // { fancyCategory: "BALL_BY_BALL_SESSION", label: "BALL BY BALL" },
        { fancyCategory: "oddeven", langKey: "odd_even" },
        { fancyCategory: "meter", langKey: "meter" },
        { fancyCategory: "khado", langKey: "khado" },
        // { fancyCategory: "THREE_SELECTIONS", label: "XTRA MARKET" },
    ];
    const [tabVal, setTabVal] = useState(0);
    const [selectedRow, setSelectedRow] = useState<string>("");
    const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
        launch: false,
        oddsType: null,
        eventTypeID: null,
    });
    const [marketLimits, setMarketLimits] = useState<any>({});
    const [filteredFancyMarketsData, setFilteredFancyMarketsData] = useState<
        any[]
    >([]);
    const [hasScrolledToBetslip, setHasScrolledToBetslip] =
        useState<boolean>(false);

    // Reset scroll state when bets change
    useEffect(() => {
        setHasScrolledToBetslip(false);
    }, [bets]);

    const isFancyDisabled = (fMarketDisabled: boolean) => {
        return fancyDisabled ? true : fMarketDisabled;
    };

    const fetchBetLimits = async (marketId: string, localMCategory: string) => {
        try {
            const payload = {
                competitionId: eventData.competitionId,
                eventId: eventData.eventId,
                marketId: marketId,
                marketType: "FANCY",
                outcomeDesc: "fancy",
                sessionId: marketId,
                sportId: eventData.sportId,
                mcategory: localMCategory,
            };

            // let response;
            // if (sessionStorage.getItem("jwt_token")) {
            //     response = await CATALOG_API.post(
            //         "/catalog/v2/limits/market",
            //         payload,
            //         {
            //             headers: {
            //                 Authorization: sessionStorage.getItem("jwt_token"),
            //             },
            //         },
            //     );
            // } else {
            //     response = await CATALOG_API.post(
            //         "/catalog/v2/limits/market",
            //         payload,
            //     );
            // }
            // if (response.status === 200 && response.data.success) {
            //     let limits = marketLimits;

            //     limits[marketId ? marketId : eventData.marketId] = {
            //         minStake: response.data.limits.minStake,
            //         maxStake: response.data.limits.maxStake,
            //         maxOdd: response.data.limits.maxOdd,
            //     };

            //     setMarketLimits((marketLimits) => {
            //         return {
            //             ...marketLimits,
            //             ...limits,
            //         };
            //     });
            // }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        let localFancyCategories = new Set<string>();
        for (const fm of fmData) {
            if (
                fm?.marketId &&
                !fm?.marketLimits &&
                !marketLimits[fm?.marketId]
            ) {
                //setting a default value and the calling the fetch bet limits
                //so that fetch market limits is not multiple times for a single market
                // marketLimits[fm?.marketId] = {
                //   minStake: 100,
                //   maxStake: 100,
                //   maxOdd: 4,
                // };
                // fetchBetLimits(fm?.marketId, fm?.category);
            }
            localFancyCategories.add(fm.category);
        }
        fmData.map((fm) => localFancyCategories.add(fm.category));
        setFancyCategories(localFancyCategories);
    }, [fmData]);

    const handletabs = useCallback(async (localFancyCategory: string) => {
        setFilteredFancyMarketsData(
            localFancyCategory === "All"
                ? fmData
                : fmData.filter((fm) => {
                      return fm.category === localFancyCategory;
                  }),
        );
    }, []);

    useEffect(() => {
        handletabs("All");
    }, []);

    const cFactor = CURRENCY_TYPE_FACTOR[0];

    const getFancyMarketsByGroup = (category: string) => {
        return fmData
            .filter((fm) => fm.category === category)
            .sort((a, b) => {
                if (a?.sort - b?.sort != 0) {
                    return a?.sort - b?.sort;
                }
                const aDesc = a.marketName;
                const bDesc = b.marketName;
                if (aDesc > bDesc) return 1;
                else if (aDesc < bDesc) return -1;
                return 0;
            });
    };

    return (
        <>
            <div className="fm-table-ctn">
                <div
                    className="fm-table-content table-ctn"
                    style={{ position: "relative" }}
                >
                    {(bettingInprogress || oneClickBettingLoading) &&
                        bets?.[0]?.marketType === "FANCY" &&
                        bets?.[0]?.mcategory !== "LINE" && (
                            <OneClickBettingCountdown
                                delay={bets?.[0]?.delay || 0}
                            />
                        )}
                    <TableContainer component={Paper}>
                        <Table className="fm-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        className="tabs-table-cell"
                                        colSpan={12}
                                    >
                                        <div className="tabs-fancy">
                                            {fancyCategories.size > 0 ? (
                                                <span
                                                    className={
                                                        tabVal === 0
                                                            ? "sel-tab"
                                                            : "ind-tab"
                                                    }
                                                    onClick={() => {
                                                        handletabs("All");
                                                        setTabVal(0);
                                                    }}
                                                >
                                                    <div>
                                                        {langData?.["all"]}
                                                    </div>
                                                </span>
                                            ) : null}
                                            {fancyCategoriesOrder.map(
                                                (fc, index) => {
                                                    return fancyCategories.has(
                                                        fc.fancyCategory,
                                                    ) ? (
                                                        <span
                                                            className={
                                                                tabVal ===
                                                                index + 1
                                                                    ? "sel-tab"
                                                                    : "ind-tab"
                                                            }
                                                            onClick={() => {
                                                                setTabVal(
                                                                    index + 1,
                                                                );
                                                                handletabs(
                                                                    fc.fancyCategory,
                                                                );
                                                            }}
                                                        >
                                                            <div>
                                                                {langData?.[
                                                                    fc.langKey
                                                                ] ||
                                                                    fc.fancyCategory}
                                                            </div>
                                                        </span>
                                                    ) : null;
                                                },
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFancyMarketsData &&
                                filteredFancyMarketsData.length > 0 ? (
                                    <>
                                        {fancyCategoriesOrder.map((group) => (
                                            <>
                                                {filteredFancyMarketsData.filter(
                                                    (fm) =>
                                                        fm.category ===
                                                            group.fancyCategory &&
                                                        fancyCategories.has(
                                                            group.fancyCategory,
                                                        ),
                                                ).length > 0 ? (
                                                    <>
                                                        <Accordion
                                                            defaultExpanded={
                                                                true
                                                            }
                                                            className="markets-accordian"
                                                            style={{
                                                                position:
                                                                    "relative",
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={
                                                                    <ExpandLessSharp className="expand-icon" />
                                                                }
                                                                aria-controls="panel1a-content"
                                                            >
                                                                <FancyHeaderRow
                                                                    groupName={
                                                                        langData?.[
                                                                            group
                                                                                .langKey
                                                                        ] ||
                                                                        group.fancyCategory
                                                                    }
                                                                    fancyCategory={
                                                                        group.fancyCategory
                                                                    }
                                                                />
                                                            </AccordionSummary>
                                                            <FancyHeaderRow
                                                                groupName={
                                                                    langData?.[
                                                                        group
                                                                            .langKey
                                                                    ] ||
                                                                    group.fancyCategory
                                                                }
                                                                fancyCategory={
                                                                    group.fancyCategory
                                                                }
                                                                className="row-hidden"
                                                            />
                                                            {getFancyMarketsByGroup(
                                                                group.fancyCategory,
                                                            ).map(
                                                                (
                                                                    fMarket,
                                                                    index,
                                                                ) => {
                                                                    const baseMinStake =
                                                                        fMarket.isMarketLimitSet
                                                                            ? fMarket
                                                                                  ?.marketLimits
                                                                                  ?.minStake
                                                                                ? fMarket
                                                                                      ?.marketLimits
                                                                                      ?.minStake
                                                                                : marketLimits[
                                                                                      fMarket
                                                                                          ?.marketId
                                                                                  ]
                                                                                      ?.minStake
                                                                            : fMarket
                                                                                  .limits
                                                                                  .minBetValue;

                                                                    const baseMaxStake =
                                                                        fMarket.isMarketLimitSet
                                                                            ? fMarket
                                                                                  ?.marketLimits
                                                                                  ?.maxStake
                                                                                ? fMarket
                                                                                      ?.marketLimits
                                                                                      ?.maxStake
                                                                                : marketLimits[
                                                                                      fMarket
                                                                                          ?.marketId
                                                                                  ]
                                                                                      ?.maxStake
                                                                            : fMarket
                                                                                  .limits
                                                                                  .maxBetValue;

                                                                    const minStake =
                                                                        baseMinStake !=
                                                                            null &&
                                                                        cFactor
                                                                            ? baseMinStake /
                                                                              cFactor
                                                                            : baseMinStake;

                                                                    const maxStake =
                                                                        baseMaxStake !=
                                                                            null &&
                                                                        cFactor
                                                                            ? baseMaxStake /
                                                                              cFactor
                                                                            : baseMaxStake;

                                                                    return !isFancyDisabled(
                                                                        fMarket.disable,
                                                                    ) ? (
                                                                        <>
                                                                            <FancyMarketRow
                                                                                eventData={
                                                                                    eventData
                                                                                }
                                                                                fMarket={
                                                                                    fMarket
                                                                                }
                                                                                index={
                                                                                    index
                                                                                }
                                                                                cFactor={
                                                                                    cFactor
                                                                                }
                                                                                loggedIn={
                                                                                    loggedIn
                                                                                }
                                                                                openBets={
                                                                                    openBets
                                                                                }
                                                                                disabledStatus={
                                                                                    disabledStatus
                                                                                }
                                                                                addExchangeBet={
                                                                                    addExchangeBet
                                                                                }
                                                                                setShowBooksModal={() => {
                                                                                    const isKhadoFancy =
                                                                                        (
                                                                                            fMarket as any
                                                                                        )
                                                                                            ?.oddType ===
                                                                                            "KHADO" ||
                                                                                        fMarket.category?.toLowerCase() ===
                                                                                            "khado";
                                                                                    setFancyBookOutcomeId(
                                                                                        fMarket.marketId,
                                                                                    );
                                                                                    setFancyBookOutcomeName(
                                                                                        fMarket.marketName,
                                                                                    );
                                                                                    setFancyBookIsKhado(
                                                                                        isKhadoFancy,
                                                                                    );
                                                                                    setShowBooksModal(
                                                                                        true,
                                                                                    );
                                                                                }}
                                                                                outcomeOpenBets={openBets.filter(
                                                                                    (
                                                                                        b,
                                                                                    ) =>
                                                                                        b.marketType ===
                                                                                            2 &&
                                                                                        b.outcomeId ===
                                                                                            fMarket.marketId,
                                                                                )}
                                                                                exposureMap={
                                                                                    exposureMap
                                                                                }
                                                                                bets={
                                                                                    bets
                                                                                }
                                                                                selectedRow={
                                                                                    selectedRow
                                                                                }
                                                                                setSelectedRow={
                                                                                    setSelectedRow
                                                                                }
                                                                                // fetchBetLimits={(mId, mcategory) => fetchBetLimits(mId, mcategory)}
                                                                                minStake={
                                                                                    minStake
                                                                                }
                                                                                maxStake={
                                                                                    maxStake
                                                                                }
                                                                                oddLimit={
                                                                                    fMarket?.marketLimits?.maxOdd?.toString()
                                                                                        ? fMarket?.marketLimits?.maxOdd?.toString()
                                                                                        : marketLimits[
                                                                                              fMarket
                                                                                                  ?.marketId
                                                                                          ]
                                                                                              ?.maxOdd
                                                                                }
                                                                                commissionEnabled={
                                                                                    commissionEnabled
                                                                                }
                                                                                fancySuspended={
                                                                                    fancySuspended
                                                                                }
                                                                                fancyDisabled={
                                                                                    fancyDisabled
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
                                                                                langData={
                                                                                    langData
                                                                                }
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
                                                                            />
                                                                            {fMarket.notification ? (
                                                                                <TableRow>
                                                                                    <TableCell
                                                                                        colSpan={
                                                                                            5
                                                                                        }
                                                                                        padding="none"
                                                                                    >
                                                                                        <div
                                                                                            className="marque-new"
                                                                                            style={{
                                                                                                animationDuration: `${Math.max(10, fMarket.notification.length / 5)}s`,
                                                                                            }}
                                                                                        >
                                                                                            <div className="notifi-mssage">
                                                                                                {
                                                                                                    fMarket.notification
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ) : null}
                                                                        </>
                                                                    ) : null;
                                                                },
                                                            )}
                                                        </Accordion>
                                                    </>
                                                ) : null}
                                            </>
                                        ))}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <div className="fm-table-msg-text">
                                                {
                                                    langData?.[
                                                        "fancy_markets_not_found_txt"
                                                    ]
                                                }
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Drawer
                        anchor={"bottom"}
                        open={infoDilalog.launch}
                        onClose={() =>
                            setInfoDialog({
                                launch: false,
                                oddsType: null,
                                eventTypeID: null,
                            })
                        }
                        className="light-bg-title game-rules-drawer web-view"
                        title="Rules"
                        // size="md"
                    >
                        <div className="game-rules-header">
                            <div className="game-rules-title">
                                {langData?.["game_rules"]}
                            </div>
                            <div
                                className="game-rules-close cursor"
                                onClick={() =>
                                    setInfoDialog({
                                        launch: false,
                                        oddsType: null,
                                        eventTypeID: null,
                                    })
                                }
                            >
                                <CloseOutlined />
                            </div>
                        </div>
                        <MarketTermsCondi />
                    </Drawer>

                    <Drawer
                        anchor={"bottom"}
                        open={infoDilalog.launch}
                        onClose={() =>
                            setInfoDialog({
                                launch: false,
                                oddsType: null,
                                eventTypeID: null,
                            })
                        }
                        className="light-bg-title game-rules-drawer mob-view"
                        // TODO: check if this also needs to be changed ??
                        title="Rules"
                        // size="md"
                    >
                        <div className="game-rules-header">
                            <div className="game-rules-title">
                                {langData?.["game_rules"]}
                            </div>
                            <div
                                className="game-rules-close cursor"
                                onClick={() =>
                                    setInfoDialog({
                                        launch: false,
                                        oddsType: null,
                                        eventTypeID: null,
                                    })
                                }
                            >
                                <CloseOutlined />
                            </div>
                        </div>
                        <MarketTermsCondi />
                    </Drawer>

                    <Modal
                        open={showBooksModal}
                        closeHandler={() => {
                            setShowBooksModal(false);
                            setFancyBookOutcomeId(null);
                            setFancyBookIsKhado(false);
                        }}
                        customClass="fancy-book-dialog"
                        title="Book List"
                        size="sm"
                    >
                        <FancyBookView
                            fancyBookOutcomeId={fancyBookOutcomeId}
                            exposureMap={
                                exposureMap &&
                                (fancyBookIsKhado
                                    ? exposureMap[fancyBookOutcomeId] ||
                                      (() => {
                                          const key = Object.keys(
                                              exposureMap,
                                          ).find((k) =>
                                              k.startsWith(
                                                  `${fancyBookOutcomeId}:`,
                                              ),
                                          );
                                          return key
                                              ? exposureMap[key]
                                              : undefined;
                                      })()
                                    : exposureMap[
                                          `${fancyBookOutcomeId}:${fancyBookOutcomeName}`
                                      ])
                                    ? fancyBookIsKhado
                                        ? exposureMap[fancyBookOutcomeId] ||
                                          (() => {
                                              const key = Object.keys(
                                                  exposureMap,
                                              ).find((k) =>
                                                  k.startsWith(
                                                      `${fancyBookOutcomeId}:`,
                                                  ),
                                              );
                                              return key
                                                  ? exposureMap[key]
                                                  : undefined;
                                          })()
                                        : exposureMap[
                                              `${fancyBookOutcomeId}:${fancyBookOutcomeName}`
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

type FancyHeaderRowProps = {
    groupName: string;
    className?: string;
    fancyCategory?: string;
};

const FancyHeaderRow: React.FC<FancyHeaderRowProps> = (props) => {
    const { groupName, className, fancyCategory } = props;
    const isKhadoCategory = fancyCategory?.toLowerCase() === "khado";
    const tableFields = [
        {
            key: "groupName",
            Label: groupName,
            className: "market-name-cell-head",
            align: "left",
        },
        {
            key: "book-btn",
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
        <TableRow
            className={`header-row ${className || ""} ${isKhadoCategory ? "khado-back-only" : ""}`}
        >
            {tableFields
                .filter((tF) => !(isKhadoCategory && tF.key === "odds-no"))
                .map((tF, index) => (
                    <TableCell
                        key={tF.key + index}
                        align={tF.align === "left" ? "left" : "center"}
                        className={tF.className}
                    >
                        {tF.key === "odds-no" ||
                        tF.key === "odds-yes" ||
                        tF.key === "groupName" ? (
                            <div className={tF.key.toLowerCase() + "-cell"}>
                                {fancyCategory === "oddeven" &&
                                (tF.Label === "No" || tF.Label === "Yes")
                                    ? ""
                                    : isKhadoCategory && tF.key === "odds-yes"
                                      ? ""
                                      : tF.Label?.toLowerCase()}
                            </div>
                        ) : null}
                    </TableCell>
                ))}
        </TableRow>
    );
};

type FancyMarketRowProps = {
    eventData: any;
    fMarket: any;
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
    // fetchBetLimits: (mId, mcategory) => void;
    maxStake: number;
    minStake: number;
    oddLimit: string;
    commissionEnabled: boolean;
    fancySuspended: boolean;
    fancyDisabled: boolean;
    setBetStartTime: Function;
    setAddNewBet: Function;
    oneClickBettingEnabled: boolean;
    setAlertMsg: Function;
    oneClickBettingLoading: boolean;
    langData: any;
    hasScrolledToBetslip: boolean;
    setHasScrolledToBetslip: (value: boolean) => void;
};

const FancyMarketRow: React.FC<FancyMarketRowProps> = (props) => {
    const {
        eventData,
        fMarket,
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
        // fetchBetLimits,
        minStake,
        maxStake,
        oddLimit,
        commissionEnabled,
        fancySuspended,
        langData,
        fancyDisabled,
        oneClickBettingEnabled,
        setAlertMsg,
        oneClickBettingLoading,
        hasScrolledToBetslip,
        setHasScrolledToBetslip,
    } = props;
    const dispatch = useDispatch<any>()


    const isFancySuspended = (fMarketSuspended: boolean) => {
        if (eventData?.eventSuspended === true) return true;
        return fancySuspended === true ? true : fMarketSuspended;
    };

    const isFancyDisabled = (fMarketDisabled: boolean) => {
        return fancyDisabled ? true : fMarketDisabled;
    };

    const isOddEvenMarket = fMarket.oddType === "ODD_EVEN";
    const isKhadoFancyMarket =
        (fMarket as any)?.oddType === "KHADO" ||
        fMarket.category?.toLowerCase() === "khado";
    const khadoExposureKey =
        exposureMap &&
        Object.keys(exposureMap).find((key) =>
            key.startsWith(`${fMarket.marketId}:`),
        );
    const fancyBookExposure =
        exposureMap &&
        (isKhadoFancyMarket
            ? exposureMap[fMarket.marketId] ||
              (khadoExposureKey ? exposureMap[khadoExposureKey] : undefined)
            : exposureMap[`${fMarket.marketId}:${fMarket.marketName}`]);
    const ODD_EVEN_DISPLAY_VALUE = 25000;
    const oddDisplayOdds =
        fMarket.laySize != null ? (fMarket.laySize + 100) / 100 : null;
    const evenDisplayOdds =
        fMarket.backSize != null ? (fMarket.backSize + 100) / 100 : null;

    const isDisabled =
        disabledStatus.includes(fMarket.status.toLowerCase()) ||
        isFancySuspended(fMarket.suspend) === true ||
        isFancyDisabled(fMarket.disable) === true;

    const buildFancyBetData = (
        betType: "BACK" | "LAY",
        sessionPrice: number,
        oddValue: number,
        outcomeDesc: string,
        displayOddValue: number,
        oddTypeValue?: string,
    ): any => ({
        providerId: eventData.fancyProvider,
        sportId: eventData.sportId,
        seriesId: eventData.competitionId,
        seriesName: eventData.competitionName,
        eventId: eventData.eventId,
        eventName: eventData.eventName,
        eventDate: eventData.openDate,
        marketId: fMarket.marketId,
        marketName: fMarket.marketName,
        marketType: "FANCY" as const,
        outcomeId: fMarket.marketId,
        outcomeDesc,
        betType,
        amount: 0,
        oddValue,
        sessionPrice,
        oddLimt: oddLimit,
        minStake: minStake,
        maxStake: maxStake,
        mcategory: fMarket.category,
        displayOddValue,
        delay:
            fMarket?.marketLimits?.delay ??
            eventData?.effectiveLimits?.delay ??
            0,
        ...(oddTypeValue ? { oddType: oddTypeValue } : {}),
    });

    const handleFancyBetClick = (betData: any) => {
        if (oneClickBettingLoading) {
            setAlertMsg({
                message: langData?.betIsInProgress,
                type: "error",
            });
            return;
        }
        if (isDisabled) return;
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
            setSelectedRow(fMarket.marketName + "FM");
            addExchangeBet(betData);
        }
    };

    return (
        <>
            <TableRow
                key={"row-" + index}
                className={isKhadoFancyMarket ? "khado-back-only" : ""}
            >
                <TableCell
                    className="market-name-cell"
                    key={"row-" + index + "cell-1"}
                >
                    <div className="market">
                        {fMarket.customMarketName
                            ? fMarket.customMarketName
                            : fMarket.marketName}{" "}
                        {fMarket.commissionEnabled
                            ? // && commissionEnabled
                              "*"
                            : null}
                    </div>
                </TableCell>
                <TableCell
                    className="odds-cell book-btn-cell"
                    key={"row-" + index + "cell-4"}
                >
                    <Button
                        className="fancy-book-btn"
                        onClick={() => {
                            if (fancyBookExposure) setShowBooksModal();
                        }}
                        disabled={!fancyBookExposure}
                    >
                        {langData?.["book"]}
                    </Button>
                </TableCell>
                {isOddEvenMarket ? (
                    <>
                        <TableCell
                            className="odds-cell"
                            key={"row-" + index + "cell-odd"}
                        >
                            <div className="odds-block">
                                <ExchOddBtn
                                    mainValue={oddDisplayOdds}
                                    mainValueClass="runs"
                                    subValue={ODD_EVEN_DISPLAY_VALUE}
                                    subValueClass="odds"
                                    oddType="odds-yes-cell"
                                    valueType="fancyMarketOdds"
                                    disable={isDisabled}
                                    onClick={() => {
                                        const betData = buildFancyBetData(
                                            "BACK",
                                            Number(fMarket.layPrice),
                                            Number(fMarket.laySize),
                                            "Odd @ " + Number(fMarket.laySize),
                                            oddDisplayOdds,
                                            "ODD_EVEN",
                                        );
                                        handleFancyBetClick(betData);
                                    }}
                                />
                            </div>
                        </TableCell>
                        <TableCell
                            className="odds-cell"
                            key={"row-" + index + "cell-even"}
                        >
                            <div className="odds-block">
                                <ExchOddBtn
                                    mainValue={evenDisplayOdds}
                                    mainValueClass="runs"
                                    subValue={ODD_EVEN_DISPLAY_VALUE}
                                    subValueClass="odds"
                                    oddType="odds-yes-cell"
                                    valueType="fancyMarketOdds"
                                    disable={isDisabled}
                                    onClick={() => {
                                        const betData = buildFancyBetData(
                                            "BACK",
                                            Number(fMarket.backPrice),
                                            Number(fMarket.backSize),
                                            "Even @ " +
                                                Number(fMarket.backSize),
                                            evenDisplayOdds,
                                            "ODD_EVEN",
                                        );
                                        handleFancyBetClick(betData);
                                    }}
                                />
                            </div>
                        </TableCell>
                    </>
                ) : (
                    <>
                        {!isKhadoFancyMarket && (
                            <TableCell
                                className="odds-cell"
                                key={"row-" + index + "cell-2"}
                            >
                                <div className="odds-block">
                                    <ExchOddBtn
                                        mainValue={fMarket.layPrice}
                                        mainValueClass="runs"
                                        subValue={fMarket.laySize}
                                        subValueClass="odds"
                                        oddType="odds-no-cell"
                                        valueType="fancyMarketOdds"
                                        disable={isDisabled}
                                        onClick={() => {
                                            const betData = buildFancyBetData(
                                                "LAY",
                                                fMarket.layPrice,
                                                (fMarket as any)?.oddType ===
                                                    "KHADO"
                                                    ? fMarket.layPrice
                                                    : fMarket.laySize,
                                                "@ " + fMarket.layPrice,
                                                fMarket.layPrice,
                                                (fMarket as any)?.oddType,
                                            );
                                            if (
                                                (fMarket as any)?.oddType ===
                                                "KHADO"
                                            ) {
                                                betData.profitOddValue =
                                                    fMarket.laySize;
                                            }
                                            handleFancyBetClick(betData);
                                        }}
                                    />
                                </div>
                            </TableCell>
                        )}
                        <TableCell
                            className="odds-cell"
                            key={"row-" + index + "cell-3"}
                        >
                            <div className="odds-block">
                                <ExchOddBtn
                                    mainValue={fMarket.backPrice}
                                    mainValueClass="runs"
                                    subValue={fMarket.backSize}
                                    subValueClass="odds"
                                    oddType="odds-yes-cell"
                                    valueType="fancyMarketOdds"
                                    disable={isDisabled}
                                    onClick={() => {
                                        const betData = buildFancyBetData(
                                            "BACK",
                                            fMarket.backPrice,
                                            (fMarket as any)?.oddType ===
                                                "KHADO"
                                                ? fMarket.backPrice
                                                : fMarket.backSize,
                                            "@ " + fMarket.backPrice,
                                            fMarket.backPrice,
                                            (fMarket as any)?.oddType,
                                        );
                                        if (
                                            (fMarket as any)?.oddType ===
                                            "KHADO"
                                        ) {
                                            betData.profitOddValue =
                                                fMarket.backSize;
                                        }
                                        handleFancyBetClick(betData);
                                    }}
                                />
                            </div>
                        </TableCell>
                    </>
                )}

                <TableCell className="limits-cell">
                    <div className="limits-data">
                        <div className="row web-view">
                            <div>
                                {langData?.["min"]}:{" "}
                                {minStake
                                    ? ThousandFormatter(
                                          minStake ? minStake : 100,
                                      )
                                    : 0}
                            </div>
                            <div>
                                {langData?.["max"]}:{" "}
                                {maxStake
                                    ? maxStake % 1000 === 0
                                        ? ThousandFormatter(
                                              maxStake ? maxStake : 100,
                                          )
                                        : maxStake
                                          ? maxStake
                                          : 100
                                    : 0}
                            </div>
                        </div>
                        <div className="row mob-view">
                            <div>
                                {langData?.["min"]}:{" "}
                                {minStake
                                    ? ThousandFormatter(
                                          minStake ? minStake : 100,
                                      )
                                    : 0}
                            </div>{" "}
                            <div>
                                {" "}
                                {langData?.["max"]}:{" "}
                                {maxStake
                                    ? maxStake % 1000 === 0
                                        ? ThousandFormatter(
                                              maxStake ? maxStake : 100,
                                          )
                                        : maxStake
                                          ? maxStake
                                          : 100
                                    : 0}
                            </div>
                        </div>
                        {/* <div className="row"></div> */}
                    </div>
                </TableCell>
                {disabledStatus.includes(fMarket.status.toLowerCase()) ||
                isFancySuspended(fMarket.suspend) === true ||
                isFancyDisabled(fMarket.disable) === true ? (
                    <div
                        className={`disabled-odds-cell ${isKhadoFancyMarket ? "khado-back-only-overlay" : ""}`}
                        key={"row-" + index + "cell-5"}
                    >
                        {fMarket.status.toLowerCase().includes("suspended") ||
                        isFancySuspended(fMarket.suspend) === true ||
                        isFancyDisabled(fMarket.disable) === true
                            ? "SUSPENDED"
                            : fMarket.status.replace("_", " ")}
                    </div>
                ) : null}
            </TableRow>
            {!oneClickBettingEnabled &&
            bets?.length > 0 &&
            bets?.[0]?.marketName === fMarket?.marketName &&
            bets?.[0]?.marketId === fMarket?.marketId &&
            isMobile ? (
                <TableRow
                    className="inline-betslip"
                    ref={(el) => {
                        if (el && !hasScrolledToBetslip) {
                            // Scroll to the betslip with smooth behavior only once
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
                        {" "}
                        <ExchBetslip
                            setBetStartTime={(date) => setBetStartTime(date)}
                            setAddNewBet={(val) => setAddNewBet(val)}
                        />{" "}
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
};

export const isFancyMarketSuspended = (
    secondaryMarketsMap: any,
    eventId: string,
) => {
    if (secondaryMarketsMap[eventId]) {
        return secondaryMarketsMap[eventId].fancySuspended;
    }
    return false;
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
        fmData: getFancyMarketsByEvent(
            state.exchangeSports.secondaryMarketsMap,
            event.id,
        ),
        fancySuspended: isFancyMarketSuspended(
            state.exchangeSports.secondaryMarketsMap,
            event.id,
        ),
        fancyDisabled: isFancyMarketDisabled(
            state.exchangeSports.secondaryMarketsMap,
            event.id,
        ),
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

export default connect(mapStateToProps, mapDispatchToProps)(FMTable);
