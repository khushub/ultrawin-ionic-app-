import React, { memo, useEffect, useMemo, useState } from "react";
import './FancyMarketsTable.scss';
import { useSelector } from "react-redux";
import { OneClickBettingCountdown } from "../../OneClickBetting/OneClickCountdown";
import { Accordion, AccordionSummary, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { ExpandLessSharp } from "@mui/icons-material";
import FancyMarketRow from "./FancyMarketRow";
import { minmaxGetter } from "../../../util/formatters";
import Modal from "../../Modal";
import FancyBookView from "../../ExchFancyMarketsTable/FancyBookView/FancyBookView";

const MARKET_NAME_MAP = {
    'Normal': 'NORMAL',
    'fancy1': 'FANCY',
    'oddeven': 'ODD / EVEN',
    'Ball By Ball': "BALL BY BALL",
    'meter': 'METER',
    'khado': 'kHADO'
};

const fancyCategoriesOrder = [
    { fancyCategory: "All", langKey: "all_capital", label: 'ALL' },
    { fancyCategory: "Normal", langKey: "normal", label: 'NORMAL' },
    { fancyCategory: "fancy1", langKey: "fancy", label: 'FANCY' },
    { fancyCategory: "oddeven", langKey: "odd_even", label: 'ODD / EVEN' },
    { fancyCategory: "Ball By Ball", langKey: "ball_by_ball", label: "BALL BY BALL" },
    { fancyCategory: "meter", langKey: "meter", label: 'METER' },
    { fancyCategory: "khado", langKey: "khado", label: 'kHADO' },
]

type FancyMarketsTableProps = {
    group: any;
    marketBetsMap: Map<string, any[]>;
    limitStatus: boolean;
    minMaxAll: any;
    fancyBetsMarketByIdSet: Set<string>;
    onBtnClick: (data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => void;
}

const FancyMarketsTable: React.FC<FancyMarketsTableProps> = ({ group, marketBetsMap=new Map(), limitStatus, minMaxAll, fancyBetsMarketByIdSet, onBtnClick }) => {
    const langData = useSelector((state: any) => state.common.langData);
    const bets = useSelector((state: any) => state.exchBetSlip.bets);
    const bettingInprogress = useSelector((state: any) => state.exchBetSlip.bettingInprogress);
    const oneClickBettingLoading = useSelector((state: any) => state.exchBetSlip.oneClickBettingLoading);
    const oneClickBettingEnabled = useSelector((state: any) => state.exchBetSlip.oneClickBettingEnabled);
    const [tabVal, setTabVal] = useState('All');
    const [hasScrolledToBetslip, setHasScrolledToBetslip] = useState<boolean>(false);
    const [bookModal, setBookModal] = useState({
        show: false,
        marketId: '',
    });

    useEffect(() => {
        setHasScrolledToBetslip(false);
    }, [bets]);

    const filteredMarket = useMemo(() => {
        if (!group?.length) return [];

        if (tabVal === 'All') return group;
    
        return group.filter(item => item?.name?.toLowerCase() === tabVal?.toLowerCase() ) ?? [];
    }, [group, tabVal]);
    

    return (
        <div className="fm-table-ctn">
            <div
                className="fm-table-content table-ctn"
                style={{ position: "relative" }}
            >
                {(bettingInprogress || oneClickBettingLoading) &&
                bets?.[0]?.marketType === "FANCY" &&
                bets?.[0]?.mcategory !== "LINE" && (
                    <OneClickBettingCountdown delay={bets?.[0]?.delay || 0} />
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
                                        {fancyCategoriesOrder.map((fc, index) => {
                                            return (
                                                <span
                                                    className={tabVal === fc.fancyCategory? "sel-tab" : "ind-tab"
                                                    }
                                                    onClick={() => {
                                                        setTabVal(fc.fancyCategory);
                                                    }}
                                                >
                                                    <div>
                                                        {langData?.[fc.langKey] || fc.label || fc.fancyCategory}
                                                    </div>
                                                </span>
                                            )
                                        })}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredMarket?.length>0? (
                                filteredMarket.map((market)=>(
                                    <Accordion
                                        key={market?.name}
                                        defaultExpanded={true}
                                        className="markets-accordian"
                                        style={{ position: "relative" }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandLessSharp className="expand-icon" />}
                                            aria-controls="panel1a-content"
                                        >
                                            <FancyHeaderRow
                                                groupName={MARKET_NAME_MAP[market?.name] ?? market?.name}
                                                fancyCategory={market?.name}
                                            />
                                        </AccordionSummary>
                                        <FancyHeaderRow
                                            groupName={MARKET_NAME_MAP[market?.name] ?? market?.name}
                                            fancyCategory={market?.name}
                                            className="row-hidden"
                                        />
                                        {market?.items?.map((item, index)=>{
                                            const minMax = minmaxGetter(minMaxAll, item?.eventTypeId, item?.marketType);
                                            if(!limitStatus) {
                                                minMax.min = item?.minlimit || 0;
                                                minMax.max = item?.maxlimit || 0;
                                            }

                                            return (
                                                <FancyMarketRow 
                                                    key={"row-" + index}
                                                    item={item}
                                                    bets={bets}
                                                    oneClickBettingEnabled={oneClickBettingEnabled}
                                                    langData={langData}
                                                    minMax={minMax}
                                                    setShowBooksModal={()=>{
                                                        const data = {
                                                            show: true,
                                                            marketId: item?.marketId,
                                                        };
                                                        setBookModal(data);
                                                    }}
                                                    hasOpenBet={fancyBetsMarketByIdSet.has(item?.marketId)}
                                                    onBtnClick={onBtnClick}
                                                    hasScrolledToBetslip={hasScrolledToBetslip}
                                                    setHasScrolledToBetslip={setHasScrolledToBetslip}
                                                />
                                            );
                                        }
                                        )}
                                    </Accordion>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <div className="fm-table-msg-text">
                                            {langData?.["fancy_markets_not_found_txt"]}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        
                    </Table>
                </TableContainer>


                <Modal
                    open={bookModal.show}
                    closeHandler={() => { setBookModal(prev => ({ ...prev, show: false })); }}
                    customClass="fancy-book-dialog"
                    title="Book List"
                    size="sm"
                >
                    <FancyBookView marketId={bookModal.marketId} />
                </Modal>
            </div>
        </div>
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

export default memo(FancyMarketsTable);
