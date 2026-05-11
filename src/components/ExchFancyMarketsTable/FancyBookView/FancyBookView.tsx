import React, { useEffect, useState } from "react";
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";

import "./FancyBookView.scss";
import { connect } from "react-redux";
import { CURRENCY_TYPE_FACTOR } from "../../../constants/CurrencyTypeFactor";
import { postAPIAuth } from "../../../services/apiInstance";
import { generateFancyLadder } from "../../../util/helpers";

type PropsType = {
    loggedIn: boolean;
    marketId: string;
};

const FancyBookView: React.FC<PropsType> = (props) => {
    const { loggedIn, marketId } = props;
    const [loading, setLoading] = useState<boolean>(true);
    const [tableData, setTableData] = useState<any[]>();


    
    useEffect(() => {
        if(loggedIn && marketId) {
            const FetchRunnerProfit = async() => {
                try {
                    setLoading(true);
                    const res = await postAPIAuth('/getRunnerProfitAPI', { marketId });
                    if(res?.data?.success) {
                        setTableData(generateFancyLadder(res?.data?.runnerProfit || {}) || []);
                    } else {
                        setTableData([]);
                    }
                }catch(err) {
                    console.error('err fetching runner-profit: ', err);
                    setTableData([]);
                } finally {
                    setLoading(false);
                }
            }

            FetchRunnerProfit();
        }
    }, [loggedIn, marketId])



    return (
        <div className="fancy-book-table-ctn">
            {loading ? null : (
                <>
                    {tableData?.length>0 ? (
                        <TableContainer component={Paper}>
                            <Table className="fancy-book-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Runner Name</TableCell>
                                        <TableCell>Profit/Loss</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell key={"row-" + idx + "cell-1"}>
                                                {item?.score}
                                            </TableCell>
                                            <TableCell 
                                                key={"row-" + idx + "cell-2"}
                                                className={item?.amount>0? "profit" : item?.amount<0? "loss" : null}
                                            >
                                                {item?.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <div className="no-data">No data to display</div>
                    )}
                </>
            )}
        </div>
    );
};

const mapStateToProps = (state: any) => {
    return {
        loggedIn: state.auth.loggedIn,
    };
};

export default connect(mapStateToProps)(FancyBookView);
