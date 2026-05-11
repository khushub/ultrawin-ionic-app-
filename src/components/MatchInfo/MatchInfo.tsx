import React from "react";
import { IonRow } from "@ionic/react";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectEventName, selectEventOpenDate } from "../../store/selectors/selectors";

type RouteParams = {
    eventType: string;
    competition: string;
    eventId: string;
    eventInfo: string;
} | null;

interface MatchInfoProps {
    eventData?: any | null;
    routeParams: RouteParams;
}

const MatchInfo: React.FC<MatchInfoProps> = ({ eventData, routeParams }) => {
    const eventName = useSelector(selectEventName);
    const openDate = useSelector(selectEventOpenDate);

    // Determine if we should show eventData date or routeParams date
    // Check both eventData and eventData?.openDate
    // const hasEventDataDate = !!eventData && !!eventData?.openDate;
    const hasEventDataDate = !!openDate;

    // Get epoch time from routeParams for fallback
    const getEpochTimeFromRoute = () => {
        try {
            // const decodedInfo = atob(routeParams.eventInfo || "");
            // return Number(decodedInfo.split(":")[4]);
            return null;
        } catch {
            return null;
        }
    };

    return (
        <IonRow className="eam-info-header eam-info-header-name">
            <div className="eam-teams-name">
                <div className="eam-date-ctn">
                    {eventName ? (
                        <div className="eam-team-1">
                            {eventName}
                        </div>
                    ) : eventData?.homeTeam && eventData?.awayTeam ? (
                        <>
                            <div className="eam-team-1">
                                {eventData?.homeTeam}
                            </div>
                            {eventData?.awayTeam &&
                                eventData?.awayTeam !== "" && (
                                    <>
                                        <span>
                                            {"  "} V {"  "}
                                        </span>
                                        <div className="eam-team-2">
                                            {eventData?.awayTeam}
                                        </div>
                                    </>
                                )}
                        </>
                    ) : (
                        <>
                            <div className="eam-team-1">
                                {/* {routeParams.eventId?.toLowerCase() === "binary"
                                    ? "Binary"
                                    : routeParams.eventId?.split("-").join(" ")} */}
                            </div>
                        </>
                    )}
                </div>
                <div className="eam-teams-name-ctn">
                    <div className="eam-date">
                        {hasEventDataDate ? (
                            <>
                                <div
                                    className="eam-dates"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <div className="eam-date-time">
                                        <span>
                                            {moment(openDate).format("hh")}
                                        </span>
                                        :
                                        <span>
                                            {moment(openDate,).format("mm A")}
                                        </span>
                                    </div>
                                    <div className="eam-date-text">
                                        {!openDate
                                            ? moment().format("DD MMM YYYY")
                                            : moment(openDate,).format("DD MMM YYYY")}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="eam-dates">
                                <div className="eam-date-time">
                                    <span>
                                        {moment
                                            .unix(getEpochTimeFromRoute() || 0)
                                            .format("hh")}
                                    </span>
                                    :
                                    <span>
                                        {moment
                                            .unix(getEpochTimeFromRoute() || 0)
                                            .format("mm A")}
                                    </span>
                                </div>
                                <div className="eam-date-text">
                                    {moment
                                        .unix(getEpochTimeFromRoute() || 0)
                                        .format("DD MMM YYYY")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </IonRow>
    );
};

export default MatchInfo;
