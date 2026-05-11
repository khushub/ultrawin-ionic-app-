import { IonInput } from "@ionic/react";
import { Button, IconButton } from "@mui/material";
import { Add as AddIcon, Close as CloseIcon, Remove as RemoveIcon } from "@mui/icons-material";

import { AxiosResponse } from "axios";
import React, { useState } from "react";
import { NumericFormat } from "react-number-format";
import { connect, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

// import API from "../../api";
import { PROVIDER_ID } from "../../constants/Branding";
import { clearExchcngeBets, exchangeBetOddsChange, fetchOpenBets, removeExchangeBet, setBettingInprogress, setExchangeBetStake  } from "../../store/slices/exchBetSlipSlice";
// import {
//     getAllMarketsByEvent,
// } from "../../store";
import "./ExchBetslip.scss";
import { setAlertMsg } from "../../store/slices/commonSlice";
import { isMobile } from "react-device-detect";
import Modal from "../Modal";
import ButtonVariablesModal from "../ButtonVariables/ButtonVariablesModal";
import { isBmSpecialMarket } from "../../util/stringUtil";
import { storageManager } from "../../util/storageManager";
import { formatBetPlacePayload, getCurrencyFormat } from "../../util/formatters";
import { postAPIAuth } from "../../services/apiInstance";
import { fetchUserDetails } from "../../store/slices/userDetailsSlice";
type StoreProps = {
    balance: number;
    exposure: number;
    bets: any[];
    // oneClickAmount: number;
    // isOneClickEnable: boolean;
    selectedEventType: { id: ""; name: ""; slug: "" };
    exchangeBetOddsChange: (index: number, odds: number) => void;
    removeExchangeBet: (index: number) => void;
    setExchangeBetStake: (
        index: number,
        amount: number,
        type: "ADD" | "SET",
    ) => void;
    // eventData: any;
    selectedEvent: any;
    buttonVariables: any[];
    bettingInprogress: boolean;
    cancelBetSuccess?: (betId: string) => void;
    setBettingInprogress: (val: boolean) => void;
    mobileView?: boolean;
    setBetStartTime?: any;
    setAddNewBet?: any;
    setAlertMsg: Function;
    langData: any;
};

const ExchBetslip: React.FC<StoreProps> = (props) => {
    const {
        balance,
        exposure,
        bets,
        // eventData,
        cancelBetSuccess,
        selectedEventType,
        exchangeBetOddsChange,
        removeExchangeBet,
        setExchangeBetStake,
        selectedEvent,
        buttonVariables,
        bettingInprogress,
        setBettingInprogress,
        setAlertMsg,
        setBetStartTime,
        setAddNewBet,
        langData,
    } = props;
    const dispatch = useDispatch<any>();

    const [isEditStakeModalOpen, setIsEditStakeModalOpen] =
        useState<boolean>(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(true);
    const jwt = sessionStorage.getItem("jwt_token");
    const location = useLocation();
    const pathName = location.pathname;
    // const [progressCount, setProgressCount] = useState<number>(5);
    // const [
    //   progressCountRefreshInterval,
    //   setProgressCountRefreshInterval,
    // ] = useState<number>(1000);

    const calculateProfit = (
        marketType: string,
        marketName: string,
        betType: string,
        amount: number,
        oddValue: number,
        oddSize: number,
        oddType: string,
    ): string => {
        const isFancy = marketType == 'SESSION';

        if(isFancy) {
            return getCurrencyFormat((amount * oddSize) / 100)
        } if(betType !== "BACK") {
            return amount.toFixed(2);
        } else {
            return getCurrencyFormat(amount * oddValue - amount);
        }


        
        
        
        // if (marketType === "MATCH_ODDS") {
        //     return betType === "BACK"
        //     ? (amount * (oddValue - 1)).toFixed(2)
        //     : amount.toFixed(2);
        // }
        // if (marketType === "BM") {
        //     if (isBmSpecialMarket(marketName, oddType)) {
        //         return (amount * (oddValue - 1)).toFixed(2);
        //     }
        //     return betType === "BACK"
        //         ? (amount * ((oddValue + 100) / 100 - 1)).toFixed(2)
        //         : amount.toFixed(2);
        // }
        // if (marketType === "PREMIUM_ODDS") {
        //     return (amount * (oddValue - 1)).toFixed(2);
        // }
        // // FANCY ODD_EVEN: both sides are BACK bets
        // if ((marketType === 'SESSION_ODDS' || marketType === 'SESSION') && fancyName === "oddeven") {
        //     return (amount * ((oddValue + 100) / 100 - 1)).toFixed(2);
        // }
        // // Default case for other market types
        // return betType === "BACK"
        //     ? (amount * ((oddValue + 100) / 100 - 1)).toFixed(2)
        //     : amount.toFixed(2);
    };

    const betPlaceHandler = async () => {
        const token = storageManager.getToken();

        if (!token) {
            setAlertMsg({
                type: "error",
                message: langData?.["login_to_place_bet_txt"],
            });
            return false;
        }

        if (bets[0].amount < 1) {
            setAlertMsg({
                type: "error",
                message: langData?.["minimum_stake_required_txt"],
            });
            return false;
        }


        try {
            setBettingInprogress(true);
            const payload = await formatBetPlacePayload(token, bets[0], window.ipInfo?.query);
            const response = await postAPIAuth('/createBetAPI', payload);

            if(response.data?.success) {
                setAlertMsg({
                    type: "success",
                    message: response?.data?.message
                        ? response.data.message
                        : 'Bet Placed Successfully',
                });
            }else {
                setAlertMsg({
                    type: "error",
                    message: response?.data?.message
                        ? response.data.message
                        : langData?.["bet_placed_txt"],
                });
            }

            dispatch(fetchOpenBets({ eventId: payload?.bet?.eventId, eventTypeId: payload?.bet?.eventTypeId }));
        } catch(err) {
            setAlertMsg({
                type: "error",
                message: err?.message
                    ? err?.message
                    : langData?.["bet_placed_txt"],
            });
        } finally {
            setBettingInprogress(false);
            dispatch(fetchUserDetails());
            dispatch(clearExchcngeBets());
        }







        // // if (ValidateOdds(bets)) {
        // //     setAlertMsg({
        // //         type: "error",
        // //         message: langData?.["wrong_odds_txt"],
        // //     });
        // //     return false;
        // // }

        // if (+bets[0].oddLimt) {
        //     switch (bets[0].marketType) {
        //         case "MO":
        //             if (bets[0].oddValue > +bets[0].oddLimt) {
        //                 setAlertMsg({
        //                     type: "error",
        //                     message:
        //                         langData?.["bet_rate_not_accepted_txt"] +
        //                         " " +
        //                         bets[0].oddLimt,
        //                 });
        //                 return false;
        //             }
        //             break;

        //         case "BM":
        //             if ((bets[0].oddValue + 100) / 100 > +bets[0].oddLimt) {
        //                 setAlertMsg({
        //                     type: "error",
        //                     message:
        //                         langData?.["bet_rate_not_accepted_txt"] +
        //                         " " +
        //                         bets[0].oddLimt,
        //                 });
        //                 return false;
        //             }
        //             break;

        //         case "FANCY":
        //             if (bets[0].oddValue / 100 + 1 > +bets[0].oddLimt) {
        //                 setAlertMsg({
        //                     type: "error",
        //                     message:
        //                         langData?.["bet_rate_not_accepted_txt"] +
        //                         " " +
        //                         bets[0].oddLimt,
        //                 });
        //                 return false;
        //             }
        //             break;
        //     }
        // }

        // if (
        //     (bets[0]?.minStake !== 0 && bets[0]?.minStake > bets[0].amount) ||
        //     (bets[0]?.maxStake !== 0 && bets[0]?.maxStake < bets[0].amount)
        // ) {
        //     setAlertMsg({
        //         type: "error",
        //         message:
        //             langData?.["minimum_stake_txt"] +
        //             " " +
        //             bets[0]?.minStake +
        //             " " +
        //             langData?.["maximum_stake_txt"] +
        //             " " +
        //             bets[0]?.maxStake,
        //     });
        //     return false;
        // }

        // if (!bets[0].oddValue) {
        //     setAlertMsg({
        //         type: "error",
        //         message: langData?.["invalid_odds_txt"],
        //     });
        //     return false;
        // }

        // let binaryPayload: any = null;
        // let url = "";
        // try {
        //     for (const data of bets) {
        //         // Cancel Bet for edit unMatched bet
        //         if (data.betId) {
        //             setAddNewBet(false);

        //             const postBody = {
        //                 cancelBets: [{ betId: data.betId, cancelSize: 0 }],
        //                 marketId: data.marketId,
        //                 eventId: data.eventId,
        //                 sportId: data.sportId,
        //                 seriesId: data.seriesId,
        //                 // operatorId: OPERATORID,
        //                 providerId: PROVIDER_ID,
        //             };

        //             // try {
        //             //     const cancelResponse = await API.post(
        //             //         `/bs/cancel-sap-bet`,
        //             //         postBody,
        //             //         {
        //             //             headers: {
        //             //                 Authorization:
        //             //                     sessionStorage.getItem("jwt_token"),
        //             //             },
        //             //         },
        //             //     );

        //             //     setShowSpinner(true);
        //             //     if (cancelResponse?.data?.status !== "RS_OK") {
        //             //         setAlertMsg({
        //             //             type: "error",
        //             //             message:
        //             //                 langData?.["cancel_old_bet_failed_txt"],
        //             //         });
        //             //         return false;
        //             //     } else if (cancelResponse?.data?.status === "RS_OK") {
        //             //         cancelBetSuccess(data.betId);
        //             //     }
        //             // } catch (err) {
        //             //     setShowSpinner(false);
        //             //     setAlertMsg({
        //             //         type: "error",
        //             //         message: langData?.["cancel_bet_failed_txt"],
        //             //     });
        //             //     return false;
        //             // }
        //         }

        //         setBettingInprogress(true);
        //         switch (data.marketType) {
        //             case "MO": {
        //                 url = "/place-matchodds-bet";
        //                 break;
        //             }
        //             case "BM": {
        //                 url = "/place-bookmaker-bet";
        //                 break;
        //             }
        //             case "FANCY": {
        //                 url = "/place-fancy-bet";
        //                 break;
        //             }
        //             case "PREMIUM_ODDS": {
        //                 url = "/place-premium-bet";
        //                 break;
        //             }
        //         }
        //     }

        //     setAddNewBet(true);
        //     let response: AxiosResponse<any>;
        //     // try {
        //     //     response = await API.post("/bs" + url, bets[0], {
        //     //         headers: {
        //     //             Authorization: jwt,
        //     //         },
        //     //         timeout: 1000 * 20,
        //     //     });

        //     //     if (binaryPayload !== null) {
        //     //         response = await API.post(
        //     //             "/binary/single-bet",
        //     //             binaryPayload,
        //     //             {
        //     //                 headers: {
        //     //                     Authorization: jwt,
        //     //                 },
        //     //             },
        //     //         );
        //     //     }
        //     // } catch (e) {
        //     //     setShowSpinner(false);
        //     //     setBettingInprogress(false);
        //     //     setAlertMsg({
        //     //         type: "error",
        //     //         message: e.response?.data?.message
        //     //             ? e.response?.data?.message
        //     //             : langData?.["general_err_txt"],
        //     //     });
        //     //     return false;
        //     // }

        //     if (response && response?.status === 200) {
        //         setBetStartTime(new Date());
        //     } else {
        //         setAlertMsg({
        //             type: "error",
        //             message: response?.data?.message
        //                 ? response.data.message
        //                 : langData?.["bet_placed_txt"],
        //         });
        //     }
        // } catch (ex) {
        //     setBettingInprogress(false);
        //     setShowSpinner(false);
        //     if (ex.response) {
        //         setAlertMsg({
        //             type: "error",
        //             message: langData?.["previous_bet_in_progress_txt"],
        //         });
        //     } else {
        //         setAlertMsg({
        //             type: "error",
        //             message: langData?.["general_err_txt"],
        //         });
        //         return false;
        //     }
        // }
    };

    const onChangeOddHandler = (
        index: any,
        data: any,
        control: number,
        isKhadoFancy: boolean,
    ) => {
        // if (data.oddValue === 1) {
        //     return false;
        // }

        // let value;
        // if (control === 1) {
        //     let inc;
        //     if (isKhadoFancy) {
        //         inc = 1;
        //     } else {
        //         if (data.oddValue < 2) inc = 0.01;
        //         else if (data.oddValue >= 2 && data.oddValue < 3) inc = 0.02;
        //         else if (data.oddValue >= 3 && data.oddValue < 4) inc = 0.05;
        //         else if (data.oddValue >= 4 && data.oddValue < 6) inc = 0.1;
        //         else if (data.oddValue >= 6 && data.oddValue < 10) inc = 0.2;
        //         else if (data.oddValue >= 10 && data.oddValue < 20) inc = 0.5;
        //         else if (data.oddValue >= 20 && data.oddValue < 30) inc = 1;
        //         else if (data.oddValue >= 30 && data.oddValue < 50) inc = 2;
        //         else if (data.oddValue >= 50 && data.oddValue < 100) inc = 5;
        //         else if (data.oddValue >= 100 && data.oddValue < 1000) inc = 10;
        //         else inc = 10;
        //     }
        //     // value =
        //     //   data.marketType !== 'FANCY'
        //     //     ? data.marketType === 'CASINO'
        //     //       ? data.casinoOdds
        //     //       : (data.oddValue + inc).toFixed(2)
        //     //     : data.oddsSize;
        //     value = !(data?.marketType === 'SESSION_ODDS' || data?.marketType === 'SESSION') || isKhadoFancy
        //         ? (data.oddValue + inc).toFixed(2)
        //         : data.oddValue.toFixed(2);
        // } else {
        //     let inc;
        //     if (isKhadoFancy) {
        //         inc = 1;
        //     } else {
        //         if (data.oddValue <= 2) inc = 0.01;
        //         else if (data.oddValue > 2 && data.oddValue <= 3) inc = 0.02;
        //         else if (data.oddValue > 3 && data.oddValue <= 4) inc = 0.05;
        //         else if (data.oddValue > 4 && data.oddValue <= 6) inc = 0.1;
        //         else if (data.oddValue > 6 && data.oddValue <= 10) inc = 0.2;
        //         else if (data.oddValue > 10 && data.oddValue <= 20) inc = 0.5;
        //         else if (data.oddValue > 20 && data.oddValue <= 30) inc = 1;
        //         else if (data.oddValue > 30 && data.oddValue <= 50) inc = 2;
        //         else if (data.oddValue > 50 && data.oddValue <= 100) inc = 5;
        //         else if (data.oddValue > 100 && data.oddValue <= 1000) inc = 10;
        //         else inc = 10;
        //     }
        //     // value =
        //     //   data.marketType !== 'FANCY'
        //     //     ? data.marketType === 'CASINO'
        //     //       ? data.casinoOdds
        //     //       : (data.oddValue - inc).toFixed(2)
        //     //     : data.oddsSize;
        //     value = !(data?.marketType === 'SESSION_ODDS' || data?.marketType === 'SESSION') || isKhadoFancy
        //         ? (data.oddValue - inc).toFixed(2)
        //         : data.oddValue.toFixed(2);
        // }

        // exchangeBetOddsChange(index, parseFloat(value.toString()));
    };

    // const ValidateOdds = (bets: any[]) => {
    //     const matchOdds = eventData?.matchOdds?.runners;

    //     // Match Odds odd check
    //     if (matchOdds) {
    //         for (let bet of bets) {
    //             if (bet.marketType === "BM") {
    //                 if (bet.oddValue < 0) return true;
    //             } else {
    //                 if (bet.oddValue <= 1) return true;
    //             }
    //             if (
    //                 bet?.marketType === "MO" &&
    //                 bet?.marketId === eventData.matchOdds.marketId
    //             ) {
    //                 for (let mo of matchOdds) {
    //                     if (mo.runnerId === bet.outcomeId) {
    //                         if (bet.betType === "BACK") {
    //                             if (mo?.backPrices) {
    //                                 if (
    //                                     bet.oddValue <= mo.backPrices[0]?.price
    //                                 ) {
    //                                     return false;
    //                                 } else {
    //                                     return true;
    //                                 }
    //                             }
    //                         } else {
    //                             if (mo?.layPrices) {
    //                                 console.log(
    //                                     mo.layPrices[0].price,
    //                                     "<=",
    //                                     bet.oddValue,
    //                                 );
    //                                 if (
    //                                     mo.layPrices[0]?.price <= bet.oddValue
    //                                 ) {
    //                                     return false;
    //                                 } else {
    //                                     return true;
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // };

    return (
        <div className="exch-betslip-ctn">
            {(bettingInprogress && !isMobile) ||
            (bettingInprogress && bets?.[0]?.marketType === "PREMIUM_ODDS") ? (
                <div className="betslip-progress">
                    {showSpinner ? (
                        <div className="centered">
                            <div className="spinner loading"></div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {bets && bets.length > 0
                ? bets.map((data, index) => {
                    const isFancy = data?.marketType === 'SESSION_ODDS' || data?.marketType === 'SESSION';
                    const displayAsBack = data.betType === "BACK" || (isFancy && data?.fancyName === "oddeven");
                    const isKhadoFancy = isFancy && (data?.fancyName === "khado" || (data.mcategory && data.mcategory.toLowerCase() === "khado"));
                    const isOddsEditable = !bettingInprogress && (data?.marketType === "MATCH_ODDS" || isKhadoFancy);
                      
                    return (
                        <div
                            key={index}
                            className={
                                displayAsBack
                                ? data.marketType === "CASINO"
                                    ? "body-ctn bs-back-bet bet-body-back casino-bet"
                                    : "body-ctn bs-back-bet bet-body-back  back-line"
                                : "body-ctn bet-body-lay bs-lay-bet  lay-line"
                            }
                        >
                            <div
                                className={
                                    displayAsBack
                                    ? data.marketType === "CASINO"
                                        ? "bet-body bet-body-back casino-bet"
                                        : "bet-body bet-body-back"
                                    : "bet-body bet-body-lay"
                                }
                            >
                                <div
                                    className={`header-row ${
                                        isBmSpecialMarket(
                                            data.marketName,
                                            data.oddType,
                                        )
                                        ? "genie-combo-header"
                                        : ""
                                    }`}
                                >
                                    <div className="header-event-market-div">
                                        <div className="event">
                                            {data?.eventName}
                                        </div>
                                        <div className="market">
                                            {data?.marketType === "PREMIUM_ODDS" ? (
                                                <>
                                                    {data.marketName} @{" "}
                                                    <span className="odd-value">
                                                        {data.outcomeDesc}
                                                    </span>
                                                </>
                                            ) : isFancy ? (
                                                <>
                                                    {data?.fancyName === "oddeven" || data?.marketName?.includes("Odd Even Run Bhav")
                                                    ? `${data?.marketName} - ${data?.outcomeDesc}`
                                                    : `${data?.marketName} ${data?.outcomeDesc}`}
                                                </>
                                            ) : (
                                                <>
                                                    {isBmSpecialMarket(
                                                        data.marketName,
                                                        data.oddType,
                                                    ) ? (
                                                        <div>
                                                            {data.outcomeDesc.split(";").map((part,idx,) => (
                                                                <div key={idx}>
                                                                    {part}
                                                                </div>
                                                            ))}
                                                          </div>
                                                    ) : (
                                                        data.outcomeDesc
                                                    )}{" "}
                                                    @{" "}
                                                    <span className="odd-value">
                                                        {data.displayOddValue? data.displayOddValue : data.oddValue}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <IconButton
                                        aria-label="close"
                                        className="bet-del-btn"
                                        disabled={bettingInprogress}
                                        onClick={() =>
                                            removeExchangeBet(index)
                                        }
                                    >
                                        <CloseIcon className="close-icon" />
                                    </IconButton>
                                  </div>
                                <div
                                    className={
                                        displayAsBack
                                        ? data.marketType === "CASINO"
                                            ? "bet-card bet-card-back"
                                            : "bet-card bet-card-back"
                                        : "bet-card"
                                    }
                                >
                                    <div className="input-row">
                                        <div className="input-row-ctn odds-ctn">
                                            <div className="row-header">
                                                {langData?.["odd_value"]}
                                            </div>
                                            <div className="row-input">
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    className="odds-btns"
                                                    startIcon={<RemoveIcon />}
                                                    onClick={() =>
                                                        onChangeOddHandler( index, data, 0, isKhadoFancy )
                                                    }
                                                    disabled={!isOddsEditable}
                                                ></Button>
                                                <IonInput
                                                    type="number"
                                                    value={
                                                        isKhadoFancy
                                                        ? data.oddValue
                                                            : data.displayOddValue
                                                            ? data.displayOddValue
                                                        : data.oddValue
                                                    }
                                                    min="1"
                                                    mode="md"
                                                    step="1"
                                                    disabled={!isOddsEditable}
                                                    readonly
                                                    onIonChange={(e) => {
                                                        // if (isFancy && !isKhadoFancy) {
                                                        //     return;
                                                        // }
                                                          
                                                        // const raw = e.detail.value;
                                                        // if (
                                                        //     raw === null ||
                                                        //     raw === undefined
                                                        // ) return;
                                                        // const trimmed = raw.toString().trim();
                                                        // if (trimmed === "") return;
                                                        // const next = Number(trimmed);
                                                        // if (Number.isNaN(next)) return;
                                                        // exchangeBetOddsChange(
                                                        //     index,
                                                        //     next,
                                                        // );
                                                    }}
                                                ></IonInput>

                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    className="odds-btns"
                                                    startIcon={<AddIcon />}
                                                    onClick={() =>
                                                        onChangeOddHandler( index, data, 1, isKhadoFancy )
                                                    }
                                                    disabled={!isOddsEditable}
                                                ></Button>
                                            </div>
                                        </div>
                                        <div className="input-row-ctn stake-ctn">
                                            <div className="row-header">
                                                {langData?.["amount"]}
                                            </div>
                                            <NumericFormat
                                                value={data.amount? data.amount : null}
                                                thousandSeparator={true}
                                                thousandsGroupStyle="lakh"
                                                className="row-input"
                                                allowNegative={false}
                                                disabled={bettingInprogress}
                                                onValueChange={(val) => {
                                                    setExchangeBetStake( index, val.floatValue, "SET");
                                                }}
                                                style={{
                                                    height: "39px",
                                                    border: 0,
                                                    padding: "10px",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="quick-bet">
                                        {buttonVariables
                                        ?.slice(0, 8)
                                        ?.map((bV, idx) => (
                                            <Button
                                                key={"qb-btn" + idx}
                                                className="qb-btn"
                                                disabled={ bettingInprogress }
                                                onClick={() => setExchangeBetStake( index, bV.stake, "ADD" )}
                                            >
                                                +{bV.label}
                                            </Button>
                                        ))}

                                        <Button
                                            key={"qb-btn-" + data?.marketName + "-" + 1}
                                            className="qb-btn-allin min-btn"
                                            disabled={bettingInprogress}
                                            onClick={() => setExchangeBetStake( index, data?.minStake, "SET" )}
                                        >
                                            {langData?.["min_stake"] ?? "Min Stake"}
                                        </Button>
                                        
                                        <Button
                                            key={"qb-btn-" + data?.marketName + "-" + 2}
                                            className="qb-btn-allin max-btn"
                                            disabled={bettingInprogress}
                                            onClick={() => setExchangeBetStake( index, data?.maxStake, "SET" )}
                                        >
                                            {langData?.["max_stake"] ?? "Max Stake"}
                                        </Button>
                                        <Button
                                            key={"qb-btn-" + data?.marketName + "-" + 3}
                                            className="qb-btn-allin edit-btn"
                                            disabled={bettingInprogress}
                                            onClick={() => setIsEditStakeModalOpen(true)}
                                        >
                                            {langData?.["edit_stake"] ?? "Edit Stake"}
                                        </Button>
                                        <Button
                                            key={"qb-btn-" + data?.marketName + "-" + 4}
                                            className="qb-btn-allin clear-btn"
                                            disabled={bettingInprogress}
                                            onClick={() => setExchangeBetStake( index, 0, "SET")}
                                        >
                                            {langData?.["clear"]}
                                        </Button>
                                    </div>
                                    <div className="d-flex-row">
                                        <div className="width-mob-100">
                                            <div className="profit-loss">
                                                <div className="info">
                                                    {langData?.["pl_bet_info_txt"]}
                                                </div>
                                                <div className="returns">
                                                    <div className="amt">
                                                        {calculateProfit(
                                                            data.marketType,
                                                            data.marketName,
                                                            data.betType,
                                                            data.amount,
                                                            isKhadoFancy? (data.profitOddValue ?? data.oddValue) : data.oddValue,
                                                            data.oddSize,
                                                            data.oddType,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="profit-loss-pts">
                                                <div className="info">
                                                    <div className="profit-loss">
                                                        <div className="info">
                                                            {langData?.["total_amount_in_pts_txt"]}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="returns">
                                                    <div className="amt">
                                                        {bets.reduce((a, v) => a + v.amount, 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="place-section mob-view">
                                            <Button
                                                className="place-btn"
                                                disabled={bettingInprogress}
                                                onClick={betPlaceHandler}
                                            >
                                                <div className="btn-content">
                                                    <div className="label">
                                                        {langData?.["place_bet_txt"]}
                                                    </div>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) 
            : null}

            <div className="bet-footer web-view">
                <div className="place-section">
                    <Button
                        className="place-btn"
                        disabled={bettingInprogress}
                        onClick={betPlaceHandler}
                    >
                        <div className="btn-content">
                            <div className="label">
                                {langData?.["place_bet_txt"]}
                            </div>
                        </div>
                    </Button>
                </div>
            </div>
            <Modal
                size="sm"
                title="Edit Stake"
                open={isEditStakeModalOpen}
                closeHandler={() => setIsEditStakeModalOpen(false)}
                aria-labelledby="edit-stake-modal-title"
                aria-describedby="edit-stake-modal-description"
                customClass="edit-stake-modal"
            >
                <div className="modal-content">
                    <ButtonVariablesModal
                        onSave={() => setIsEditStakeModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state: any) => {
    return {
        bets: state.exchBetSlip.bets,
        selectedEvent: state?.exchangeSports?.selectedEvent,
        selectedEventType: state?.exchangeSports?.selectedEventType,
        buttonVariables: state.exchBetSlip.buttonVariables,
        bettingInprogress: state.exchBetSlip.bettingInprogress,
        oneClickAmount: state.exchBetSlip.oneClickAmount,
        isOneClickEnable: state.exchBetSlip.isOneClickEnable,
        balance: state.userDetails.balance,
        exposure: state.userDetails.exposure,
        // eventData: getAllMarketsByEvent(
        //     state?.exchangeSports?.events,
        //     state?.exchangeSports?.selectedEventType.id,
        //     state?.exchangeSports?.selectedCompetition.id,
        //     state?.exchBetslip?.bets?.[0]?.eventId,
        // ),
        langData: state.common.langData,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        // cancelBetSuccess: (betId: string) => dispatch(cancelBetSuccess(betId)),
        exchangeBetOddsChange: (index: number, odds: number) => dispatch(exchangeBetOddsChange({index, odds})),
        removeExchangeBet: (index: number) => dispatch(removeExchangeBet(index)),
        setExchangeBetStake: (
            index: number,
            amount: number,
            type: "ADD" | "SET",
        ) => dispatch(setExchangeBetStake({index, amount, type})),
        setBettingInprogress: (val: boolean) => dispatch(setBettingInprogress(val)),
        setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchBetslip);
