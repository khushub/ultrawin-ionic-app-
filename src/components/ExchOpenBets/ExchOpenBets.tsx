import { Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import React from "react";
import { connect } from "react-redux";
import "./ExchOpenBets.scss";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { isBackOnlyMarket, isBmSpecialMarket } from "../../util/stringUtil";

type StoreProps = {
    openBets: any[];
};

const getDisplayName = (runnerName: string) => {
    let name =
        runnerName.split(":").length > 1
            ? runnerName.split(":")[1]
            : runnerName.split(":")[0];
    if (name.toLowerCase().includes("crudeoil")) return "CRUDE OIL";
    else if (name.toLowerCase().includes("gold")) return "GOLD";
    else if (name.toLowerCase().includes("silver")) return "SILVER";
    else if (name.toLowerCase().includes("banknifty")) return "BANK NIFTY";
    return name;
};

const ExchOpenBets: React.FC<StoreProps> = (props) => {
    const { openBets } = props;
    const cFactor = CURRENCY_TYPE_FACTOR[0];

    // Group bets by betType
    const backBets = openBets.filter((bet) => bet?.type === "Back");
    const layBets = openBets.filter((bet) => bet?.type === "Lay");

    const getBetDisplayName = (bet: any) => {
        switch (bet.marketType) {
            // TODO: remove binary
            case "FANCY":
            case "BINARY":
                const isOddEvenFancyDisplay =
                    bet.marketType === "FANCY" &&
                    (bet?.fancyName === "oddeven" ||
                        bet.marketName?.includes("Odd Even Run Bhav"));
                return (
                    <div>
                        <div style={{ fontWeight: "bolder" }}>
                            {bet.marketType === "BINARY"
                                ? getDisplayName(bet?.selectionName) +
                                  " @ " +
                                  Number(bet.oddValue * 100 - 100).toFixed(0)
                                : isOddEvenFancyDisplay
                                  ? `${bet.marketName} - ${bet?.selectionName}`
                                  : bet.marketName +
                                    " @ " +
                                    Number(bet.oddValue * 100 - 100).toFixed(0)}
                        </div>
                        <div>Fancy</div>
                    </div>
                );
            case "Special":
                const isGenieCombo =
                    bet.marketName === "Genie Combo Special Bet";
                return (
                    <div>
                        <div style={{ fontWeight: "bolder" }}>
                            {isGenieCombo ? (
                                <div>
                                    {bet?.selectionName
                                        .split(";")
                                        .map((part, idx) => (
                                            <div key={idx}>{part}</div>
                                        ))}
                                </div>
                            ) : (
                                bet?.selectionName
                            )}
                        </div>
                        <div>
                            {bet.marketName.toLowerCase().includes("toss") ||
                            isBackOnlyMarket(bet.oddType, bet.marketName)
                                ? bet.oddType === "BACK_ONLY_ODDS"
                                    ? bet.marketName
                                    : "Toss"
                                : bet?.marketName || "Bookmaker"}
                        </div>
                    </div>
                );
            case "MATCH_ODDS": {
                if (bet.marketName === "Completed Match") {
                    return (
                        <div>
                            <div style={{ fontWeight: "bolder" }}>
                                {bet?.selectionName}
                            </div>
                            <div>Completed Match</div>
                        </div>
                    );
                } else if (bet.marketName === "Tied Match") {
                    return (
                        <div>
                            <div style={{ fontWeight: "bolder" }}>
                                {bet?.selectionName}
                            </div>
                            <div>Tied Match</div>
                        </div>
                    );
                } else if (
                    bet?.marketName?.toLowerCase()?.includes("who will win")
                ) {
                    return (
                        <div>
                            <div style={{ fontWeight: "bolder" }}>
                                {bet?.selectionName}
                            </div>
                            <div>Who will win the match?</div>
                        </div>
                    );
                } else {
                    return (
                        <div>
                            <div style={{ fontWeight: "bolder" }}>
                                {bet?.selectionName}
                            </div>
                            <div>Match Odds</div>
                        </div>
                    );
                }
            }
            default:
                return bet?.marketName + " - " + bet?.selectionName;
        }
    };

    const getBetType = (bet: any) => {
        const isOddEvenFancy = (bet?.marketType === "SESSION_ODDS" || bet?.marketType === "SESSION") && bet?.fancyName === "oddeven";
        return bet.type === "Back" ? (
            <span
                style={{
                    borderRadius: "10px",
                    padding: "3px 7px",
                    border: "1px solid rgb(69 69 69)",
                    fontWeight: "bolder",
                    marginRight: "5px",
                    background: "#7bbaf6",
                }}
            >
                {(bet?.marketType === "SESSION_ODDS" || bet?.marketType === "SESSION")
                    ? isOddEvenFancy
                        ? "BACK"
                        : "YES"
                    : "BACK"}
            </span>
        ) : (
            <span
                style={{
                    borderRadius: "10px",
                    padding: "3px 7px",
                    border: "1px solid rgb(69 69 69)",
                    fontWeight: "bolder",
                    marginRight: "5px",
                    background: "#f99ac2",
                }}
            >
                {bet?.marketType === "SESSION_ODDS" || bet?.marketType === "SESSION" ? "NO" : "LAY"}
            </span>
        );
    };

    const getBetOddValue = (bet: any) => {
        return bet?.marketType == 'SESSION' || bet.marketType === "BINARY"
            ? Number(bet?.rate * 100).toFixed(0) 
            : Number(bet?.rate).toFixed(2)
            
            // bet.marketType === "BOOKMAKER"
            //     ? isBmSpecialMarket(bet?.marketName, bet?.oddType)
            //         ? Number(bet?.rate).toFixed(2)
            //         : Number(bet?.rate * 100 - 100).toFixed(2)
            //   : Number(bet?.rate);
    };

    const getProfitLoss = (bet: any) => {
        return bet?.marketType === "MATCH_ODDS"
            ? bet?.type === "Back"
                ? (bet?.stakeAmount * (bet?.oddValue - 1)).toFixed(2)
                : bet?.stakeAmount.toFixed(2)
            : bet?.marketType === "BOOKMAKER"
              ? bet?.type === "Back"
                  ? ((bet?.oddValue - 1) * bet?.stakeAmount).toFixed(2)
                  : bet?.stakeAmount.toFixed(2)
              : bet?.marketType === "PREMIUM_ODDS"
                ? (bet?.stakeAmount * (bet?.oddValue - 1)).toFixed(2)
                : bet?.type === "Back"
                  ? ((bet?.oddValue - 1) * 100).toFixed(2)
                  : bet?.stakeAmount.toFixed(2);
    };

    const getBetStakeAmount = (bet: any) =>
        Number(bet?.stake / cFactor).toFixed(2);

    const renderBetRows = (bets: any[], betType: string) => {
        return bets.map((bet, idx) => {
            const isGenieCombo = bet.marketName === "Genie Combo Special Bet";
            return (
                <TableRow
                    key={`${betType}-row-${idx}`}
                    className={`${betType.toLowerCase()}-bet open-bets-table-row ${
                        isGenieCombo ? "genie-combo-bet-row" : ""
                    }`}
                >
                    <TableCell
                        key={`${betType}-market-cell-row-${idx}`}
                        className={`${betType.toLowerCase()}-bet open-bets-table-row ${
                            isGenieCombo ? "genie-combo-bet-row" : ""
                        }`}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {getBetType(bet)}
                            {getBetDisplayName(bet)}
                        </div>
                    </TableCell>
                    <TableCell
                        key={`${betType}-odds-cell-row-${idx}`}
                        align="right"
                        className={`${betType.toLowerCase()}-bet open-bets-table-row ${
                            isGenieCombo ? "genie-combo-bet-row" : ""
                        }`}
                    >
                        {getBetOddValue(bet)}
                    </TableCell>
                    <TableCell
                        key={`${betType}-stake-cell-row-${idx}`}
                        align="right"
                        className={`${betType.toLowerCase()}-bet open-bets-table-row ${
                            isGenieCombo ? "genie-combo-bet-row" : ""
                        }`}
                    >
                        {getBetStakeAmount(bet)}
                    </TableCell>
                    {/* <TableCell
            key={`${betType}-stake-cell-row-${idx}`}
            align="right"
            className={`${betType.toLowerCase()}-bet open-bets-table-row`}
          >
            {getProfitLoss(bet)}
          </TableCell> */}
                </TableRow>
            );
        });
    };

    return (
        <div className="open-bets-ctn open-bts-dup">
            {/* BACK Bets Table */}
            {backBets.length > 0 && (
                <div className="bet-section">
                    <Table className="exch-open-bets-table">
                        <TableHead className="open-bets-table-head">
                            <TableRow className="open-bets-table-row">
                                <TableCell className="market-cell">
                                    Back (Bet for)
                                </TableCell>
                                <TableCell className="odds-cell" align="right">
                                    Odds
                                </TableCell>
                                <TableCell className="stake-cell" align="right">
                                    Stake
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="open-bets-table-body">
                            {renderBetRows(backBets, "BACK")}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* LAY Bets Table */}
            {layBets.length > 0 && (
                <div className="bet-section">
                    <Table className="exch-open-bets-table">
                        <TableHead className="open-bets-table-head">
                            <TableRow className="open-bets-table-row">
                                <TableCell className="market-cell">
                                    Lay (Bet against)
                                </TableCell>
                                <TableCell className="odds-cell" align="right">
                                    Odds
                                </TableCell>
                                <TableCell className="stake-cell" align="right">
                                    Stake
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="open-bets-table-body">
                            {renderBetRows(layBets, "LAY")}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* No bets message */}
            {openBets.length === 0 && (
                <div className="no-bets-message">No open bets</div>
            )}
        </div>
    );
};


const mapStateToProps = (state: any) => {
    return {
        openBets: state.exchBetSlip.openBets,
    };
};

export default connect(mapStateToProps)(ExchOpenBets);
