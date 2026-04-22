import React, { lazy, useEffect } from "react";
import { connect } from "react-redux";
import { Route, useRouteMatch } from "react-router-dom";
import { Switch } from "react-router";
import { fetchButtonVariables } from "../../store/slices/exchBetSlipSlice";
// import { connectToWS, disconnectToWS } from "../../webSocket/webSocket";
import "./ExchangeSportsHomeView.scss";
import '../SportsProvider/index.scss';
import ExchSportsView from "./ExchangeSportsView";
const ExchInplayEventsView = lazy(() => import('../ExchInplayEvents/ExchInplayEventsView'))
// const ExchangeAllMarkets = lazy(() => import("./ExchangeAllMarkets"));
// const MultimarketView = lazy(() => import("./MultimarketView"));
// const ExchangeVirtualMarkets = lazy(() => import("./ExchangeVirtualMarkets"));
const InplayPage = lazy(() => import("../ExchInplayEvents/ExchInplayEventsView"),);


type StoreProps = {
    loggedIn: boolean;
    fetchButtonVariables: () => void;
    topicUrls: any;
    // betFairWSConnected: boolean;
};

const ExchangeSportsBook: React.FC<StoreProps> = (props) => {
    const { 
        loggedIn, 
        fetchButtonVariables, 
        topicUrls, 
        // betFairWSConnected 
    } = props;
    const { path } = useRouteMatch();

    useEffect(() => {
        if (loggedIn) {
            fetchButtonVariables();
        }
    }, [loggedIn]);

    // Websocket handler
    // useEffect(() => {
    //     if (
    //         loggedIn &&
    //         (topicUrls?.matchOddsBaseUrl ||
    //             topicUrls?.bookMakerBaseUrl ||
    //             topicUrls?.premiumBaseUrl)
    //     ) {
    //         if (betFairWSConnected) {
    //             disconnectToWS();
    //         }
    //         const baseUrlsPayload = {
    //             matchOddsBaseUrl: topicUrls?.matchOddsBaseUrl,
    //             bookMakerAndFancyBaseUrl: topicUrls?.bookMakerBaseUrl,
    //             premiumBaseUrl: topicUrls?.premiumBaseUrl,
    //         };
    //         connectToWS(baseUrlsPayload);

    //         return () => {
    //             if (betFairWSConnected) {
    //                 disconnectToWS();
    //             }
    //         };
    //     }
    // }, [loggedIn, topicUrls]);

    return (
        <>
            <div className="ds-view-ctn">
                <div className="punter-view" id="main-content">
                    <div
                        className={
                            path?.length > 36
                                ? "sports-view-ctn sports-margin"
                                : "sports-view-ctn"
                        }
                    >
                        <Switch>
                            <Route exact path={path}>
                                <ExchInplayEventsView loggedIn={loggedIn} />
                            </Route>
                            <Route
                                exact
                                path={`${path}/inplay`}
                                render={() => (
                                    <InplayPage loggedIn={loggedIn} />
                                )}
                            ></Route>
                            {/* <Route
                                exact
                                path={`${path}/multi-markets`}
                                render={() => <MultimarketView />}
                            /> */}
                            <Route
                                exact
                                path={`${path}/:eventType`}
                                render={() => <ExchSportsView />}
                            />
                            <Route
                                exact
                                path={`${path}/:eventType/:competition`}
                                render={() => <ExchSportsView />}
                            />

                            {/* <Route
                                exact
                                path={`${path}/:eventType/:competition/:eventId/:eventInfo`}
                                render={() => (
                                    <ExchangeAllMarkets loggedIn={loggedIn} />
                                )}
                            /> */}

                            {/* <Route
                                exact
                                path={`${path}/virtuals/:eventType/:competition/:eventId/:eventInfo`}
                                render={() => (
                                    <ExchangeVirtualMarkets
                                        loggedIn={loggedIn}
                                    />
                                )}
                            /> */}
                        </Switch>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state: any) => {
    return {
        loggedIn: state.auth.loggedIn,
        topicUrls: state?.exchangeSports?.topicUrls,
        // betFairWSConnected: state.exchangeSports.betFairWSConnected,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        fetchButtonVariables: () => dispatch(fetchButtonVariables()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeSportsBook);
