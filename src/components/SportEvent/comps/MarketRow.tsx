import { TableCell, TableRow } from "@mui/material";
import React, { memo, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import JercyIcon from "../../../assets/images/sportsbook/icons/horse-jercy.png";
import ExchOddBtn from "../../ExchOddButton/ExchOddButton";
import ExchBetSlip from "../../ExchBetSlip/ExchBetSlip";
const ODDS_ORDER = [0, 1, 2];


type MarketRowProps = {
    item: any;
    itemIndex: number;
    data: any;
    isFancy: boolean;
    isPremium: boolean;
    exposure: any;
    minMax: any;
    langData: any;
    onBtnClick: (data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => void;
    bets: any[];
    oneClickBettingEnabled: boolean;
}

const MarketOddRow: React.FC<MarketRowProps> = (props) => {
    const { item, itemIndex, data, isFancy, isPremium, exposure, minMax, onBtnClick, langData, bets, oneClickBettingEnabled } = props;
    const [hasScrolledToBetslip, setHasScrolledToBetslip] = useState<boolean>(false);

    
    // Reset scroll state when bets change
    useEffect(() => {
        setHasScrolledToBetslip(false);
    }, [bets]);


    return (
        <>
            <TableRow>
                <TableCell className="team-name-cell">
                    {data?.eventTypeId === "7" ? (
                        <div className="horseracing-ctn">
                            <div className="item1">
                                <span className="list-item11">
                                    {item?.clothNumber}
                                </span>
                                <span className="list-item1">
                                    ({item?.stallDraw})
                                </span>
                            </div>
                            <div className="horseracing-img">
                                <img
                                    src={item?.runnerIcon}
                                    onError={({ currentTarget }) => {
                                        currentTarget.onerror = null; // prevents looping
                                        currentTarget.src = JercyIcon;
                                    }}
                                    className="runner-img"
                                />
                            </div>

                            <div className="runner-section">
                                <div className="runner-name">
                                    {item?.runnerName}
                                </div>

                                <div className="runner-desc">
                                    <ul className="runner-desc-list">
                                        <li className="list-item">
                                            <span className="label">J: </span>
                                            {item?.jockeyName? item?.jockeyName : "-"}
                                        </li>
                                        
                                        <li className="list-item">
                                            <span className="label">
                                                {langData?.["age"]}:{" "}
                                            </span>
                                            {item?.runnerAge? item?.runnerAge : "-"}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {(exposure?.current)? (
                                <div className="profit-loss-box">
                                    <span className={exposure?.current >= 0 ? "profit" : "loss"}>
                                        {exposure?.current > 0
                                            ? "+" + Number(exposure?.current).toFixed(2)
                                            : Number(exposure?.current).toFixed(2)}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="team">
                            {item?.runnerName}

                            {(exposure?.current)? (
                                <span className={exposure?.current >= 0 ? "profit" : "loss"}>
                                    {exposure?.current > 0
                                        ? "+" + Number(exposure?.current).toFixed(2)
                                        : Number(exposure?.current).toFixed(2)}
                                </span>
                            ) : null}
                        </div>
                    )}

                    {(exposure?.totalPl)? (
                        <div className="profit-loss-box">
                            <span className={exposure?.totalPl >= 0 ? "profit" : "loss"}>
                                {exposure?.totalPl > 0
                                    ? "+" + Number(exposure?.totalPl).toFixed(2)
                                    : Number(exposure?.totalPl).toFixed(2)}
                            </span>
                        </div>
                    ) : null}
                </TableCell>

                <TableCell className="odds-cell">
                    <div className="odds-block web-view back-odds-block">
                        {ODDS_ORDER.map((order) => {
                            const price = item?.availableToBack?.[`kprice${order === 0? '' : order}`] ??
                            item?.availableToBack?.[`price${order === 0? '' : order}`] ?? 0

                            return (
                                <ExchOddBtn 
                                    key={order}
                                    mainValue={price}
                                    subValue={item?.availableToBack?.[`size${order === 0? '' : order}`] ?? 0}
                                    showSubValueinKformat={true}
                                    oddType="back-odd"
                                    valueType={data?.marketType}
                                    oddsSet={[
                                        item?.availableToBack?.price ?? 0,
                                        ...(data?.marketType == 'MATCH_ODDS'? [
                                            item?.availableToBack?.price1 ?? 0,
                                            item?.availableToBack?.price2 ?? 0,
                                        ] : []),
                                    ]}
                                    disable={
                                        data?.marketBook?.status !== 'OPEN'||
                                        item?.status === 'SUSPENDED'
                                    }
                                    onClick={() => {
                                        const mainValue = item?.availableToBack?.[`price${order === 0? '' : order}`] ?? 0;
                                        const subValue = item?.availableToBack?.[`size${order === 0? '' : order}`] ?? 0;
                                        onBtnClick(data, item, mainValue, subValue, true);
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div className="odds-block mob-view">
                        <ExchOddBtn
                            mainValue={item?.availableToBack?.kprice ?? item?.availableToBack?.price ?? 0}
                            subValue={item?.availableToBack?.size ?? 0}
                            showSubValueinKformat={true}
                            oddType="back-odd"
                            valueType={data?.marketType}
                            disable={
                                data?.marketBook?.status !== 'OPEN'||
                                item?.status === 'SUSPENDED'
                            }
                            onClick={() => {
                                const mainValue = item?.availableToBack?.price ?? 0;
                                const subValue = item?.availableToBack?.size ?? 0;
                                onBtnClick(data, item, mainValue, subValue, true);
                            }}
                        />
                    </div>
                </TableCell>

                <TableCell className="odds-cell">
                    <div className="odds-block web-view">
                        {ODDS_ORDER.map((order) => {
                            const price = item?.availableToLay?.[`kprice${order === 0? '' : order}`] ??
                            item?.availableToLay?.[`price${order === 0? '' : order}`] ?? 0

                            return (
                                <ExchOddBtn 
                                    key={order}
                                    mainValue={price}
                                    subValue={item?.availableToLay?.[`size${order === 0? '' : order}`] ?? 0}
                                    showSubValueinKformat={true}
                                    oddType="lay-odd"
                                    valueType={data?.marketType}
                                    oddsSet={[
                                        item?.availableToLay?.price ?? 0,
                                        ...(data?.marketType == 'MATCH_ODDS'? [
                                            item?.availableToLay?.price1 ?? 0,
                                            item?.availableToLay?.price2 ?? 0,
                                        ] : [])
                                    ]}
                                    disable={
                                        data?.marketBook?.status !== 'OPEN'||
                                        item?.status === 'SUSPENDED'
                                    }
                                    onClick={() => {
                                        const mainValue = item?.availableToLay?.[`price${order === 0? '' : order}`] ?? 0;
                                        const subValue = item?.availableToLay?.[`size${order === 0? '' : order}`] ?? 0;
                                        onBtnClick(data, item, mainValue, subValue, false);
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div className="odds-block mob-view">
                        <ExchOddBtn
                            mainValue={item?.availableToLay?.kprice ?? item?.availableToLay?.price ?? 0}
                            subValue={item?.availableToLay?.size}
                            showSubValueinKformat={true}
                            oddType="lay-odd"
                            valueType={data?.marketType}
                            disable={
                                data?.marketBook?.status !== 'OPEN'||
                                item?.status === 'SUSPENDED'
                            }
                            onClick={() => {
                                const mainValue = item?.availableToLay?.price ?? 0;
                                const subValue = item?.availableToLay?.size ?? 0;
                                onBtnClick(data, item, mainValue, subValue, false);
                            }}
                        />
                    </div>
                </TableCell>
            </TableRow>

            {!oneClickBettingEnabled &&
            bets?.length > 0 &&
            bets?.[0]?.marketName === data?.marketName &&
            bets?.[0]?.marketId === data?.marketId &&
            bets?.[0]?.outcomeId === item?.selectionId &&
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
                    <TableCell colSpan={3}>
                        {" "}
                        <ExchBetSlip
                            setBetStartTime={(date) => {}}
                            setAddNewBet={(val) => {}}
                        />{" "}
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
};

export default memo(MarketOddRow);
