import React, { useEffect, useState } from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { SportIdByName } from "../../util/stringUtil";
import { connect, useDispatch, useSelector } from "react-redux";
import "./Exposure.scss";
import { useHistory } from "react-router";
import { postAPIAuth } from "../../services/apiInstance";
// import { setCompetition, setEventType, setExchEvent } from "../../store";
// import REPORTING_API from "../../reporting-api";

interface ExpDTO {
    eventId: string;
    sportId: string;
    competitionId: string;
    eventName: string;
    competitionName: string;
    exposure: number;
}

interface ExposureTableProps {
    exposure: number;
    setShowExpDetail: Function;
    langData: any;
}

const ExposureTable: React.FC<ExposureTableProps> = ({
    exposure,
    setShowExpDetail,
    langData,
}) => {
    const [expData, setExpData] = useState<ExpDTO[]>();
    const [totalExp, setTotalExp] = useState<number>(0);
    const history = useHistory();
    const dispatch = useDispatch();

    const handleEventChange = (event: ExpDTO) => {
        const competitionSlug = event.competitionName
            ? event.competitionName
                .toLocaleLowerCase()
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-")
            : "league";

        let eventSlug = event.eventName
            ? event.eventName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, " ")
                .replace(/ +/g, " ")
                .trim()
                .split(" ")
                .join("-")
            : "";

        // dispatch(
        //     setEventType({
        //         id: event.sportId,
        //         name: SportIdByName[event.sportId],
        //         slug: eventTypesNameMap[event.sportId],
        //     }),
        // );
        // dispatch(
        //     setCompetition({
        //         id: event.competitionId,
        //         name: event.competitionName,
        //         slug: competitionSlug,
        //     }),
        // );
        // dispatch(
        //     setExchEvent({
        //         id: event.eventId,
        //         name: event.eventName,
        //         slug: eventSlug,
        //     }),
        // );

        // history.push(
        //     `/exchange_sports/${eventTypesNameMap[event.sportId]}/${competitionSlug}/${
        //         eventSlug
        //     }/${btoa(`BetFair:${event.sportId}:${event.competitionId}:${event.eventId}`)}`,
        // );

        setShowExpDetail(false);
    };

    const fetchExposureData = async () => {
        try {
            // const response = await REPORTING_API.get(
            //     "/reports/v2/risk-management/event-risk",
            //     {
            //         headers: {
            //             Authorization: sessionStorage.getItem("jwt_token"),
            //         },
            //     },
            // );
            // console.log(response.data);
            // setExpData(response.data);

            // if (response.data?.length > 0) {
            //     let sum = 0;
            //     for (let i = 0; i < response?.data?.length; i++) {
            //         sum += response?.data[i]?.exposure;
            //     }
            //     setTotalExp(sum);
            // } 

            const response = await postAPIAuth("getBetsAPI", { deleted: false, result: 'ACTIVE' });
            console.log(response.data?.data);
            // setExpData(response.data?.data)

            const apiData = response.data?.data || [];

            const groupedObj = apiData.reduce((acc: any, item: any) => {

                const key = item.eventId;
                console.log("acc[key]:", acc[key]);

                if (!acc[key]) {
                    acc[key] = {
                        eventId: item.eventId,
                        eventName: item.eventName,
                        eventTypeId: item.eventTypeId,
                        eventTypeName: item.eventTypeName,
                        exposure: 0,
                    };
                }

                acc[key].exposure += Number(item.stake || 0);

                return acc;
            }, {});


            const finalData = Object.values(groupedObj);
            setExpData(finalData);


            const total = finalData.reduce(
                (sum: number, item: any) => sum + item.exposure,
                0
            );

            setTotalExp(total);

            console.log("Header Exposure:", exposure);
            console.log("Grouped Total:", total);

            if (Math.abs(Number(exposure)) !== Number(total)) {
                console.log("Mismatch ");
            } else {
                console.log("yes match");
            }

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchExposureData();
    }, []);

    return (
        <TableContainer>
            <Table className="exposure-table">
                <TableHead>
                    <TableRow>
                        <TableCell>{langData?.["event_type"]}</TableCell>
                        <TableCell>{langData?.["event_name"]}</TableCell>
                        <TableCell>{langData?.["expose"]}</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {expData?.map((row) => (
                        <TableRow key={row?.eventId}>
                            <TableCell>{row?.eventTypeName ?? SportIdByName[row.eventTypeId]}</TableCell>
                            <TableCell>
                                <button
                                    className="exp-btn"
                                    onClick={() => handleEventChange(row)}
                                >
                                    {row.eventName}
                                </button>
                            </TableCell>
                            <TableCell>{row.exposure}</TableCell>
                        </TableRow>
                    ))}
                    {Math.abs(Number(exposure)) !== Number(totalExp) ? (
                        <TableRow>
                            <TableCell>{langData?.["others"]}</TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                                {Math.abs(-(Number(exposure) + Number(totalExp))).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ) : null}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const mapStateToProps = (state: any) => {
    return {
        exposure: state.userDetails.exposure ?? 0,
    };
};

export default connect(mapStateToProps, null)(ExposureTable);
