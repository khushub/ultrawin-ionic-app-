import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { setEventType } from "../../store/slices/homeMarketsSlice";
import { clearExchcngeBets } from "../../store/slices/exchBetSlipSlice";
import ExchSportsHome from "./ExchangeSportsHome";
import { SPORTS_MAP } from "../../constants/ExchangeEventTypes";

type SportViewProps = {
    eventTypes: any[];
    selectedEventType: any;
    setEventType: (eventType: any) => void;
    clearExchcngeBets: () => void;
    browseAll?: boolean;
    contentConfig: any;
};

const ExchSportsView: React.FC<SportViewProps> = (props) => {
    const {
        eventTypes,
        selectedEventType,
        setEventType,
        clearExchcngeBets,
        browseAll,
        contentConfig,
    } = props;
    const pathParams = useParams();
    const eventType = pathParams["eventType"];
    const history = useHistory();
    const pathName = history.location.pathname;

    console.log('eventType', eventType, selectedEventType);


    useEffect(() => {
        if (browseAll && contentConfig) {
            var sports = contentConfig.sports.filter(
                (sport) => !sport.disabled,
            );
            sports.sort((a, b) => a.priority - b.priority);
            return history.push(
                `/exchange_sports/${SPORTS_MAP.get(sports[0].name).slug}`,
            );
        }

        if (pathName !== "/exchange_sports/multi-markets") {
            if (eventType && eventType !== selectedEventType.slug) {
                if (eventTypes && eventTypes.length > 0) {
                    if (eventTypes.find((s) => s.slug === eventType)) {
                        for (let e of eventTypes) {
                            if (e.slug === eventType) {
                                setEventType({
                                    id: e.id,
                                    name: e.name,
                                    slug: e.slug,
                                });
                                return history.push(
                                    `/exchange_sports/${e.slug}`,
                                );
                            }
                        }
                    } else {
                        setEventType({
                            id: selectedEventType.id,
                            name: selectedEventType.name,
                            slug: selectedEventType.slug,
                        });
                        return history.push(
                            `/exchange_sports/${selectedEventType.slug}`,
                        );
                    }
                }
            }

            if (!eventType) {
                if (
                    eventTypes &&
                    eventTypes.length > 0 &&
                    !eventTypes.find((s) => s.id === selectedEventType.id)
                ) {
                    setEventType({
                        id: eventTypes[0].id,
                        name: eventTypes[0].name,
                        slug: eventTypes[0].slug,
                    });
                    return history.push(
                        `/exchange_sports/${eventTypes[0].slug}`,
                    );
                } else {
                    return history.push(
                        `/exchange_sports/${selectedEventType.slug}`,
                    );
                }
            }
        } else {
            return history.push(`/exchange_sports/multi-markets`);
        }
    }, [eventTypes, history, selectedEventType, eventType, setEventType]);

    useEffect(() => {
        clearExchcngeBets();
    }, []);

    return <ExchSportsHome />;
};

const mapStateToProps = (exchState: any) => {

    return {
        eventTypes: exchState.homeMarkets.eventTypes,
        selectedEventType: exchState.homeMarkets.selectedEventType,
        contentConfig: exchState.common.contentConfig,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        setEventType: (eventType: any) => dispatch(setEventType(eventType)),
        clearExchcngeBets: () => dispatch(clearExchcngeBets()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchSportsView);
