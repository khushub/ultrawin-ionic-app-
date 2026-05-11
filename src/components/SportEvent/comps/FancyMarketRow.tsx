import { Button, TableCell, TableRow } from '@mui/material';
import React, { memo, useEffect, useState } from 'react'
import { isMobile } from "react-device-detect";
import ExchOddBtn from "../../ExchOddButton/ExchOddButton";
import { getCurrencyFormat, getShortCurrencyFormat } from '../../../util/formatters';
import ExchBetSlip from '../../ExchBetSlip/ExchBetSlip';


type FancyMarketRowProps = {
    item: any;
    bets: any[];
    minMax: any;
    oneClickBettingEnabled: boolean;
    langData: any;
    hasOpenBet: boolean;
    setShowBooksModal: () => void;
    onBtnClick: (data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => void;
    hasScrolledToBetslip: boolean;
    setHasScrolledToBetslip: (value: boolean) => void;
};

const FancyMarketRow: React.FC<FancyMarketRowProps> = ({ 
    item, 
    bets, 
    langData, 
    minMax, 
    hasOpenBet,
    oneClickBettingEnabled, 
    setShowBooksModal, 
    onBtnClick,
    hasScrolledToBetslip,
    setHasScrolledToBetslip
}) => {
    const isKhadoFancyMarket = item?.fancyName == 'khado';
    // const fancyBookExposure = false;
    const isOddEvenMarket = item?.fancyName === "oddeven";

    return (
        <>
            <TableRow className={isKhadoFancyMarket ? "khado-back-only" : ""}>

                <TableCell
                    className="market-name-cell"
                    key={"row-cell-1"}
                >
                    <div className="market">
                        {item?.marketName}
                    </div>
                </TableCell>
                <TableCell
                    className="odds-cell book-btn-cell"
                    key={"row-cell-4"}
                >
                    <Button
                        className="fancy-book-btn"
                        onClick={() => { if (hasOpenBet) setShowBooksModal() }}
                        disabled={!hasOpenBet}
                    >
                        {langData?.["book"]}
                    </Button>
                </TableCell>

                {isOddEvenMarket? (
                    item?.marketBook?.runners?.map((runner, rnrIndex) => (
                        <TableCell
                            className="odds-cell"
                            key={`${runner?.selectionId}-${rnrIndex}`}
                        >
                            <div className="odds-block">
                                <ExchOddBtn
                                    mainValue={runner?.availableToBack?.price ?? 0}
                                    mainValueClass="runs"
                                    subValue={runner?.availableToBack?.size ?? 0}
                                    subValueClass="odds"
                                    oddType="odds-yes-cell"
                                    valueType="fancyMarketOdds"
                                    disable={item?.marketBook?.status !== 'OPEN'}
                                    onClick={() => {
                                        const mainValue = runner?.availableToBack?.price ?? 0;
                                        const subValue = runner?.availableToBack?.size ?? 0;
                                        onBtnClick(item, runner, mainValue, subValue, true);
                                    }}
                                />
                            </div>
                        </TableCell>
                    ))
                ) : (
                    <>
                        {!isKhadoFancyMarket && (
                            <TableCell
                                className="odds-cell"
                                key={"row-cell-2"}
                            >
                                <div className="odds-block">
                                    <ExchOddBtn
                                        mainValue={item?.marketBook?.availableToLay?.price ?? 0}
                                        mainValueClass="runs"
                                        subValue={item?.marketBook?.availableToLay?.size ?? 0}
                                        subValueClass="odds"
                                        oddType="odds-no-cell"
                                        valueType="fancyMarketOdds"
                                        disable={item?.marketBook?.status !== 'OPEN'}
                                        onClick={() => {
                                            const mainValue = item?.marketBook?.availableToLay?.price ?? 0;
                                            const subValue = item?.marketBook?.availableToLay?.size ?? 0;
                                            onBtnClick(item, item, mainValue, subValue, false);
                                        }}
                                    />
                                </div>
                            </TableCell>
                        )}

                        <TableCell
                            className="odds-cell"
                            key={"row-cell-3"}
                        >
                            <div className="odds-block">
                                <ExchOddBtn
                                    mainValue={item?.marketBook?.availableToBack?.price ?? 0}
                                    mainValueClass="runs"
                                    subValue={item?.marketBook?.availableToBack?.size ?? 0}
                                    subValueClass="odds"
                                    oddType="odds-yes-cell"
                                    valueType="fancyMarketOdds"
                                    disable={item?.marketBook?.status !== 'OPEN'}
                                    onClick={() => {
                                        const mainValue = item?.marketBook?.availableToBack?.price ?? 0;
                                        const subValue = item?.marketBook?.availableToBack?.size ?? 0;
                                        onBtnClick(item, item, mainValue, subValue, true);
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
                                {getShortCurrencyFormat(minMax?.min)}
                            </div>
                            <div>
                                {langData?.["max"]}:{" "}
                                {getShortCurrencyFormat(minMax?.max)}
                            </div>
                        </div>
                        <div className="row mob-view">
                            <div>
                                {langData?.["min"]}:{" "}
                                {getShortCurrencyFormat(minMax?.min)}
                            </div>{" "}
                            <div>
                                {" "}
                                {langData?.["max"]}:{" "}
                                {getShortCurrencyFormat(minMax?.max)}
                            </div>
                        </div>
                    </div>
                </TableCell>

                {item?.marketBook?.status !== 'OPEN' ? (
                    <div
                        className={`disabled-odds-cell ${isKhadoFancyMarket ? "khado-back-only-overlay" : ""}`}
                        key={"row-cell-5"}
                    >
                        {item?.marketBook?.status ?? 'SUSPENDED'}
                    </div>
                ) : null}
            </TableRow>


            {!oneClickBettingEnabled &&
            bets?.length > 0 &&
            bets?.[0]?.marketName === item?.marketName &&
            bets?.[0]?.marketId === item?.marketId &&
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
                        <ExchBetSlip
                            setBetStartTime={(date) => {}}
                            setAddNewBet={(val) => {}}
                        />{" "}
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    )
}

// export default memo(FancyMarketRow);
export default memo(FancyMarketRow, (prevProps, nextProps) =>(
    JSON.stringify(prevProps.item?.marketBook) == JSON.stringify(nextProps.item?.marketBook) &&
    prevProps.oneClickBettingEnabled === nextProps.oneClickBettingEnabled &&
    JSON.stringify(prevProps.bets)== JSON.stringify(nextProps.bets) &&
    prevProps.hasOpenBet === nextProps.hasOpenBet
));