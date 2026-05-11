import { Button, Drawer, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import './RegularMarketTable.scss';
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import multipin from "../../../assets/images/common/multipin.svg";
import { CURRENCY_TYPE_FACTOR } from "../../../constants/CurrencyTypeFactor";
import LossCutButton from "../../LossCutButton/LossCutButton";
import { formatBetPlacePayload, formatCashoutData, getCurrencyFormat, getShortCurrencyFormat, minmaxGetter } from "../../../util/formatters";
import { marketProfitCalculate } from "../../../util/helpers";
import MarketRow from "./MarketRow";
import { CloseOutlined } from "@mui/icons-material";
import MarketTermsCondi from "../../MarketTermsCondi/MarketTermsCondi";
import { setAlertMsg } from "../../../store/slices/commonSlice";
import { fetchOpenBets, setBettingInprogress, setCashoutInProgress } from "../../../store/slices/exchBetSlipSlice";
import { postAPIAuth } from "../../../services/apiInstance";
import { storageManager } from "../../../util/storageManager";
import { fetchUserDetails } from "../../../store/slices/userDetailsSlice";

const TABLE_FIELDS = [
    {
        key: "teamName",
        Label: "Market",
        labelKey: "market",
        className: "market-name-cell-head",
        align: "left",
    },
    {
        key: "Back",
        Label: "Back",
        labelKey: "back",
        className: "odds-cell-head",
        align: "right",
    },
    {
        key: "Lay",
        Label: "Lay",
        labelKey: "lay",
        className: "odds-cell-head",
        align: "left",
    },
];


type RegularMarketProps = {
    data: any;
    openBets: any[];
    limitStatus: boolean;
    minMaxAll: any;
    onBtnClick: (data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => void;
}

type OddsInfoMsg = {
    launch: boolean;
    oddsType: string;
    eventTypeID: string;
};

const RegularMarketTable: React.FC<RegularMarketProps> = (props) => {
    const { data, openBets, limitStatus, minMaxAll, onBtnClick } = props;
    const dispatch = useDispatch<any>();
    const langData = useSelector((state:any) => state.common.langData);
    const cFactor = CURRENCY_TYPE_FACTOR[0];
    const bets = useSelector((state: any) => state.exchBetSlip.bets);
    const oneClickBettingEnabled = useSelector((state: any) => state.exchBetSlip.oneClickBettingEnabled);
    const bettingInprogress = useSelector((state: any) => state.exchBetSlip.bettingInprogress);
    const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
        launch: false,
        oddsType: null,
        eventTypeID: null,
    });

    const exposureMap = useMemo(() => {
        const map = new Map();        
        const runners = data?.marketBook?.runners;

        runners?.forEach((item, itemIndex) => {
            const runnerId = (item?.selectionId)? item?.selectionId : (Array.isArray(data?.runners))? data?.runners[itemIndex]?.selectionId : '';
            const exposureMapKey = runnerId;
            let current = marketProfitCalculate(openBets, runnerId, data?.marketId);
            let totalPl = 0;

            if(bets?.length>0 && bets?.[0]?.marketId == data?.marketId) {
                if (bets?.[0]?.outcomeId == runnerId) {
                    if (bets?.[0]?.betType == 'BACK') {
                        const profit = ( bets?.[0]?.amount * bets?.[0]?.oddValue - bets?.[0]?.amount ).toFixed(2);
                        totalPl = Number(profit)==0? 0 : current + Number(profit);
                    } else {
                        const profit = ( bets?.[0]?.amount * bets?.[0]?.oddValue - bets?.[0]?.amount ).toFixed(2);
                        totalPl = Number(profit)==0? 0 : current + Number(profit) * -1;
                    }
                } else {
                    totalPl = Number(bets?.[0]?.amount)==0? 0 
                        : bets?.[0]?.betType == 'BACK'
                        ? current - Number(bets?.[0]?.amount)
                        : current - Number(bets?.[0]?.amount) * -1;
                }
            }
            map.set(exposureMapKey, { current, totalPl });
        });
        
        return map;
    }, [openBets, data?.marketType, data?.marketId, data?.marketBook?.runners, bets]);

    const minMax = useMemo(() => {
        const getMinMaxValues = () => {
            const minMax = minmaxGetter(minMaxAll, data?.eventTypeId, data?.marketType);
            const shouldUseGlobalLimits = () => limitStatus && data?.marketType !== 'Toss';
            const useGlobal = shouldUseGlobalLimits();
            
            return {
                min: useGlobal ? (minMax?.min || 0) : (data?.minlimit || 0),
                max: useGlobal ? (minMax?.max || 0) : (data?.maxlimit || 0)
            };
        };
    
        return getMinMaxValues();
    }, [data, limitStatus, minMaxAll]);


    const cashoutProfit = useMemo(() => {
        if(data?.marketBook?.runners?.length !== 2 || data?.marketType === "Toss") return 0;
        const cashoutData = formatCashoutData(data, openBets)
        if(!cashoutData) return 0;
        
        let pl = 0;
        data?.marketBook?.runners?.forEach((runner) => {
            const exposure = exposureMap.get(runner?.selectionId) ?? {};
            const currentPL = exposure?.current ?? 0;
            let calced = 0;

            if (cashoutData?.runnerId == runner?.selectionId) {
                const profit = ( cashoutData?.stake * cashoutData?.price - cashoutData?.stake ).toFixed(2);
                calced = currentPL + Number(profit) * -1;
            }else {
                calced = currentPL - Number(cashoutData?.stake) * -1;
            }
            if(pl > calced) {
                pl = calced;
            }
        });

        return pl;
    }, [exposureMap, openBets, data?.marketBook?.runners]);


    const autoCashout = useCallback(async (market: any) => {
        const token = storageManager.getToken();
        if (!market || !token) return;
        
        let cashoutData = formatCashoutData(market, openBets);
        if(!cashoutData) {
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: 'You are not eligible for cashout!'
                })
            );
            return;
        }
        cashoutData.outcomeId = cashoutData.runnerId;
        cashoutData.outcomeDesc = cashoutData.runnerName;
        cashoutData.oddValue = cashoutData.price;
        cashoutData.amount = cashoutData.stake;
        cashoutData.sportId = cashoutData.eventTypeId;
        cashoutData.betType = cashoutData.isBack? 'BACK' : 'LAY';
        cashoutData.oddSize = cashoutData.size;

        dispatch(
            setCashoutInProgress({
                loading: true,
                marketId: market.marketId,
                marketName: market.marketName,
            })
        );
        dispatch(setBettingInprogress(true));
        
        try {
            const payload = await formatBetPlacePayload(token, cashoutData, window.ipInfo?.query);
            const response = await postAPIAuth('/createBetAPI', payload);

            if (response.data?.success) {
                dispatch(
                    setCashoutInProgress({
                        loading: false,
                        marketId: market.marketId,
                        marketName: market.marketName,
                    })
                );
            }
        } catch (error) {
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: error?.response?.data?.message,
                })
            );
            dispatch(
                setCashoutInProgress({
                    loading: false,
                    marketId: market.marketId,
                    marketName: market.marketName,
                })
            );
        } finally {
            dispatch(
                setCashoutInProgress({
                    loading: false,
                    marketId: market.marketId,
                    marketName: market.marketName,
                })
            );
            dispatch(setBettingInprogress(false));
            dispatch(fetchUserDetails());
            dispatch(fetchOpenBets({ eventId: market?.eventId, eventTypeId: market?.eventTypeId }));
        }
    }, [openBets]);


    const isBackOnlyMarket = () => false;
    // const getCashoutProfit = () => 0;
    // const getLossCutProfit = () => 0;

    return (
        <>
            <div className="matchodds-table-ctn">
                <div className="matchodds-table-content table-ctn">

                    <TableContainer component={Paper}>
                        <Table className={`matchodds-table${isBackOnlyMarket() ? " matchodds-table--back-only" : ""}`}>

                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <div className="market-name-cell-head-ctn">
                                            <span className="market-name">
                                                
                                                {/* STATIC SHOWCASE MULTI MARKET PIN (NO ADD / REMOVE) */}
                                                <Tooltip
                                                    title={langData?.["add_to_multi_markets_txt"]}
                                                    placement="left-start"
                                                >
                                                    <img
                                                        className="multi-add-icon"
                                                        src={multipin}
                                                        alt="multimarket"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Click on Multi Market');
                                                        }}
                                                    />
                                                </Tooltip>
                                                {data?.marketName}&nbsp;&nbsp;
                                                {/* {langData?.["match_odds"]}{" "} */}
                                            </span>

                                            {(data?.marketBook?.runners?.length === 2 && data?.marketType !== "Toss" && !isMobile)&& (
                                                <div className="cashout-option">
                                                    <Button
                                                        size="small"
                                                        color="primary"
                                                        variant="contained"
                                                        className={`btn cashout-btn ${cashoutProfit > 0 ? "profit" : "loss"}`}
                                                        style={{ borderRadius: data?.eventTypeId === "1"? "20px" : undefined,}}
                                                        disabled={bettingInprogress || !cashoutProfit}
                                                        onClick={() => {
                                                            autoCashout(data);
                                                        }}
                                                    >
                                                        {langData?.["cashout"]}{" "}
                                                        {cashoutProfit !==Infinity
                                                            ? `: ₹${(cashoutProfit / cFactor).toFixed(2)}`
                                                            : ""}
                                                    </Button>
                                                        
                                                    {/* <LossCutButton
                                                        profit={getLossCutProfit()}
                                                        onClick={() => {
                                                            console.log('Loss Cut');
                                                        }}
                                                        disabled={true}
                                                        label={langData?.["loss_cut"] ?? "Loss Cut"}
                                                        sportId={data?.eventTypeId}
                                                    /> */}
                                                </div>
                                            )}

                                            <span className="bet-limits-section web-view">
                                                {langData?.["min"]}:{" "}
                                                {getShortCurrencyFormat(minMax.min)}{" "}
                                                {langData?.["max"]}:{" "}
                                                {getShortCurrencyFormat(minMax.max)}
                                            </span>
                                                                                    
                                            <span className="bet-limits-section mob-view">
                                                <div>
                                                    {langData?.["min"]}:{" "}
                                                    {getShortCurrencyFormat(minMax.min)}{" "}
                                                </div>
                                                <div>
                                                    {langData?.["max"]}:{" "}
                                                    {getShortCurrencyFormat(minMax.max)}                                            
                                                </div>
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            

                            <TableBody>
                                {data?.marketBook?.runners?.length === 2 && data?.marketType !== "Toss" && isMobile&& (
                                    <TableRow className="mob-action-buttons-row">
                                        <TableCell
                                            colSpan={3}
                                            padding="none"
                                            style={{ borderRadius: "0px" }}
                                        >
                                            <div className="mob-action-buttons">
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    variant="contained"
                                                    className={`btn cashout-btn ${cashoutProfit > 0 ? "profit" : "loss"}`}
                                                    style={{ borderRadius: data?.eventTypeId === "1"? "20px" : undefined }}
                                                    disabled={bettingInprogress || !cashoutProfit}
                                                    onClick={() => {
                                                        autoCashout(data);
                                                    }}
                                                >
                                                    {langData?.["cashout"]}{" "}
                                                    {cashoutProfit !== Infinity
                                                    ? `: ₹${(cashoutProfit / cFactor).toFixed(2)}`
                                                    : ""}
                                                </Button>

                                                {/* <LossCutButton
                                                    profit={getLossCutProfit()}
                                                    onClick={() => {
                                                        console.log('Loss Cut');
                                                    }}
                                                    disabled={ true}
                                                    label={langData?.["loss_cut"] ?? "Loss Cut"}
                                                    sportId={data?.eventTypeId}
                                                /> */}
                                                
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                <TableRow className="header-row">
                                    {TABLE_FIELDS.map((tF, index) => (
                                        <TableCell
                                            key={tF.key + index}
                                            align={tF.align === "left"? "left" : tF.align === "right"? "right" : "center"}
                                            colSpan={1}
                                            className={tF.className}
                                        >
                                            {tF.key === "lay" || "back" ? (
                                                <div className={tF.key.toLowerCase() + "-odd"}>
                                                    {langData?.[tF.labelKey]}
                                                </div>
                                                ) : (
                                                    <span>
                                                        {langData?.[tF.labelKey]}{" "}
                                                    </span>
                                                )
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>

                                {(data?.marketBook?.runners?.length>0 || data?.runners?.length>0)? (
                                    <>
                                        {/* SHOW OneClickBettingCountdown LOADING HERE WHEN BETTING IN PROGRESS */}
                                        {/* <OneClickBettingCountdown
                                            delay={matchOddsData?.marketLimits?.delay || 0}
                                        /> */}

                                        {data?.marketBook?.runners.map((item, itemIndex) => {
                                            const exposureMapKey = (item?.selectionId)? item?.selectionId : (Array.isArray(data?.runners))? data?.runners[itemIndex]?.selectionId : '';
                                            const exposure = exposureMap.get(exposureMapKey) ?? {};
                                            

                                            return (
                                                <MarketRow
                                                    key={`${item?.selectionId}-${itemIndex}`}
                                                    item={item}
                                                    itemIndex={itemIndex}
                                                    data={data}
                                                    isFancy={false}
                                                    isPremium={false}
                                                    exposure={exposure}
                                                    minMax={minMax}
                                                    langData={langData}
                                                    onBtnClick={onBtnClick}
                                                    bets={bets}
                                                    oneClickBettingEnabled={oneClickBettingEnabled}
                                                />
                                            )
                                        })}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <div className="fm-table-msg-text">
                                                {langData?.["match_odds_not_found_txt"]}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {data?.message ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            padding="none"
                                        >
                                            <div
                                                className="marque-new"
                                                style={{ animationDuration: `${Math.max(10, data?.message.length / 5)}s` }}
                                            >
                                                <div className="notifi-mssage">
                                                    {data?.message}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </TableContainer>


                    <Drawer
                        anchor={"right"}
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

                </div>
            </div>
        </>
    );
};

export default memo(RegularMarketTable, (prevProps, nextProps) =>(
    JSON.stringify(prevProps.data?.marketBook?.runners) == JSON.stringify(nextProps.data?.marketBook?.runners) &&
    prevProps.data?.marketBook?.status == nextProps.data?.marketBook?.status &&
    prevProps.limitStatus === nextProps.limitStatus &&
    JSON.stringify(prevProps.minMaxAll) === JSON.stringify(nextProps.minMaxAll) &&
    prevProps.openBets?.length == nextProps.openBets?.length
));
