import { IonRow, IonCol } from "@ionic/react";
import React, { useCallback, useEffect, useState } from "react";
import InplayEventsTable from "../../components/ExchEventsTable/ExchInplayEventsTable";
import "./ExchInplayEventsView.scss";
import { clearAllEvents, fetchInplayEvents, fetchEventsInDateRange } from "../../store/slices/homeMarketsSlice";
import { clearExchcngeBets } from "../../store/slices/exchBetSlipSlice";
import { getInplayEvents, eventTypesNameMap, getCupWinnerEvents, getExchangeEvents, getUpcomingEvents } from "../../store/selectors/homeMarketsSelectors";
import { connect } from "react-redux";
import SEO from "../../components/SEO/Seo";
import { BRAND_DOMAIN, BRAND_NAME } from "../../constants/Branding";
import { useHistory, useLocation } from "react-router";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

// import Dialog from "@material-ui/core/Dialog";
// import DialogContent from "@material-ui/core/DialogContent";
// import DialogTitle from "@material-ui/core/DialogTitle";
// import IconButton from "@material-ui/core/IconButton";
import moment from "moment";
// import SVLS_API from "../../svls-api";
import "../../assets/global_styles/marquee.scss";
import AdminNotification from "../../components/AdminNotification/AdminNotification";
import { Close, CancelRounded } from "@mui/icons-material";
import ScrollIcons from "../../assets/images/Notifications/notifi-scroll-icon.svg";
// import { Carousel } from 'react-responsive-carousel';
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";

// import ExchangeAllMarkets from '../ExchSportsBook/ExchangeAllMarkets';
import SocialMediaNew from "../../components/SocialMediaNew/SocialMediaNew";
import { useWindowSize } from "../../hooks/useWindowSize";

// import axios from "axios";
import { Tabs } from "@mui/material";
import { sideHeaderTabs } from "../../components/SideHeader/SideHeaderUtil";
import { BFToSRIdMap, SPToBFIdMap } from "../../util/stringUtil";
import NotificationsIcon from "../../assets/images/icons/notification_icon.svg?react";
import { setCompetition, setExchEvent } from "../../store/slices/homeMarketsSlice";
// import {
//     fetchFavEvents,
//     setEventType,
// } from "../../store/exchangeSports/exchangeSportsActions";

type InplayEventsObj = {
    sportId: string;
    sportName: string;
    sportSlug: string;
    events: any[];
};

type StoreProps = {
    clearAllEvents: () => void;
    clearExchcngeBets: () => void;
    inplayEvents: InplayEventsObj[];
    upcomingEvents: InplayEventsObj[];
    cupWinnerEvents: InplayEventsObj[];
    fetchInplayEvents: () => void;
    fetchEventsInDateRange: (startDate, endDate) => void;
    loggedIn: boolean;
    notificationUpdated: number;
    langData: any;
    setCompetition: Function;
    setExchEvent: Function;
};

enum Status {
    LIVE_MATCH = "LIVE_MATCH",
    UPCOMING = "UPCOMING",
    CUP_WINNER = "CUP_WINNER",
    SPORT = "SPORT",
}

const ExchInplayEventsView: React.FC<StoreProps> = (props) => {
    const {
        clearAllEvents,
        clearExchcngeBets,
        inplayEvents,
        upcomingEvents,
        cupWinnerEvents,
        fetchInplayEvents,
        fetchEventsInDateRange,
        loggedIn,
        notificationUpdated,
        langData,
        setCompetition,
        setExchEvent,
    } = props;
    const pathLocation = useLocation();
    const [statusNew, setStatusNew] = useState<Status>(Status.LIVE_MATCH);
    const [showNotificationModal, setShowNotificationModal] =
        useState<boolean>(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [apiWebBanners, setApiWebBanners] = useState([]);
    const [selectedSport, setSelectedSport] = useState<string>();
    const [carouselBanners, setCarouselBanners] = useState([]);
    const [apiMobBanners, setApiMobBanners] = useState([]);
    const [favouriteEvents, setFavouriteEvents] = useState<any[]>([]);
    const history = useHistory();
    const windowSize = useWindowSize();

    const updateEvents = useCallback((statusnew) => {
        switch (statusnew) {
            case Status.LIVE_MATCH:
                fetchInplayEvents();
                break;
            case Status.UPCOMING:
                fetchUpcomingEvents();
                break;
            case Status.CUP_WINNER:
                // fetchInplayEvents();
                break;
        }
    }, []);

    const isMobile = window.innerWidth > 1120 ? false : true;

    const fetchNotifications = async () => {
        // const response = await SVLS_API.get("/catalog/v2/notifications/", {
        //     headers: {
        //         Authorization: sessionStorage.getItem("jwt_token"),
        //     },
        //     params: {
        //         type: "ACTIVE",
        //     },
        // });
        // setNotifications(response.data);
    };

    const fetchUpcomingEvents = () => {
        const startDate = moment().toISOString();
        const endDate = moment().add(3, "d").toISOString();
        fetchEventsInDateRange(startDate, endDate);
    };

    useEffect(() => {
        clearAllEvents();
        clearExchcngeBets();
    }, []);

    useEffect(() => {
        updateEvents(statusNew);
    }, [statusNew]);

    // useEffect(() => {
    //     fetchFavEvents().then((favEvents) => {
    //         setFavouriteEvents(favEvents);
    //     });
    // }, [loggedIn]);

    useEffect(() => {
        loggedIn && fetchNotifications();
    }, [loggedIn, notificationUpdated]);

    useEffect(() => {
        let refreshInterval = setInterval(() => {
            updateEvents(statusNew);
        }, 30000);
        return () => {
            clearInterval(refreshInterval);
        };
    }, [statusNew]);

    const handleStatusChange = (newValue) => {
        setStatusNew(newValue);
    };

    const getEvents = () => {
        switch (statusNew) {
            case Status.LIVE_MATCH:
                return inplayEvents
                    .map((sport) => ({
                        ...sport,
                        events: sport.events.filter((event) =>
                            event?.eventName
                                ?.toLowerCase()
                                .includes(searchTerm?.toLowerCase()),
                        ),
                    }))
                    .filter((sport) => sport.events.length > 0);
            case Status.UPCOMING:
                return upcomingEvents
                    .map((sport) => ({
                        ...sport,
                        events: sport.events.filter((event) =>
                            event?.eventName
                                ?.toLowerCase()
                                .includes(searchTerm?.toLowerCase()),
                        ),
                    }))
                    .filter((sport) => sport.events.length > 0);
            case Status.SPORT:
                return inplayEvents
                    .filter(
                        (sport) =>
                            sport.sportId === selectedSport ||
                            sport.sportId === BFToSRIdMap[sport.sportId] ||
                            sport.sportId.split("_").join(":") ===
                                selectedSport,
                    )
                    .map((sport) => {
                        const matchingEvents = sport.events.filter((event) =>
                            event?.eventName
                                ?.toLowerCase()
                                .includes(searchTerm?.toLowerCase()),
                        );
                        return { ...sport, events: matchingEvents };
                    })
                    .filter((sport) => sport.events.length > 0);

            // case Status.CUP_WINNER:
            // return cupWinnerEvents;
        }
    };

    useEffect(() => {
        console.log(getEvents());
    }, [statusNew]);

    const getNotificationMessages = (notificationsList: any[]) => {
        return (
            <div className="marquee-new">
                {notificationsList.map((notifi) => {
                    return (
                        <div className="notifi-item">
                            <img
                                src={ScrollIcons}
                                alt=""
                                className="notifi-scroll-icon"
                                loading="lazy"
                                style={{
                                    animationDuration: `${Math.max(
                                        10,
                                        notifi.message.length / 5,
                                    )}s`,
                                }}
                            />
                            <span
                                className="notifi-mssage"
                                style={{
                                    animationDuration: `${Math.max(
                                        10,
                                        notifi.message.length / 5,
                                    )}s`,
                                }}
                            >
                                {notifi.message}
                            </span>
                            <img
                                src={ScrollIcons}
                                alt=""
                                className="notifi-scroll-icon"
                                loading="lazy"
                                style={{
                                    transform: "scaleX(-1)",
                                    animationDuration: `${Math.max(
                                        10,
                                        notifi.message.length / 5,
                                    )}s`,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    const closeStlDialog = () => {
        setShowNotificationModal(false);
    };

    const fetchBannerData = async () => {
        let webdata = [];
        let carouselWebData = [];
        let mobiledata = [];
        let defaultdata = [];
        let defaultMobData = [];
        // try {
        //     const response: any = await SVLS_API.get(
        //         `/account/v2/books/${BRAND_DOMAIN}/banners`,
        //         {
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //             params: {
        //                 status: "active",
        //                 type: "*",
        //                 category: "inplaybanner",
        //             },
        //         },
        //     );
        //     let data = response?.data?.banners;
        //     if (data?.length > 0) {
        //         data.map((item, idx) => {
        //             // axios.get("https://stage-cdn.faircric.com/faircric/6c3a5cc0-3b07-45d2-bd85-de6bbe4f4e9c").then((response) => {
        //             //   carouselWebData.push(response.data);
        //             // })
        //             if (item.deviceType === "desktop") {
        //                 if (webdata?.length < 4) {
        //                     webdata.push(item);
        //                 }
        //             }
        //             if (item.deviceType === "mobile") {
        //                 mobiledata.push(item);
        //             }
        //         });
        //         axios
        //             .get(
        //                 "https://stage-cdn.faircric.com/faircric/6c3a5cc0-3b07-45d2-bd85-de6bbe4f4e9c",
        //                 {
        //                     headers: {
        //                         "Content-Type": "application/text",
        //                     },
        //                 },
        //             )
        //             .then((response) => {
        //                 console.log("res - ", response.data);
        //             });
        //         setCarouselBanners(carouselWebData);
        //         setApiWebBanners(webdata);
        //         setApiMobBanners(mobiledata);
        //     }
        // } catch (err) {
        //     console.log(err);
        // }
    };

    useEffect(() => {
        fetchBannerData();
    }, []);

    const navigateToLink = (data) => {
        if (
            data?.redirectionUrl == "/exchange_sports/inplay" ||
            data?.redirectionUrl == "/casino" ||
            data?.redirectionUrl == "/exchange_sports/cricket" ||
            data?.redirectionUrl == "/exchange_sports/tennis" ||
            data?.redirectionUrl == "/exchange_sports/football"
        ) {
            history.push(data?.redirectionUrl);
        } else if (data?.redirectionUrl == "nourl") {
        } else if (data.url) {
            history.push(data.url);
        } else {
            let url = data?.redirectionUrl;
            window.open(url, "_blank");
        }
    };

    const handleEventChange = (event: any) => {
        const competitionSlug = event.competitionName
            ? event.competitionName
                  .toLocaleLowerCase()
                  .replace(/[^a-z0-9]/g, " ")
                  .replace(/ +/g, " ")
                  .trim()
                  .split(" ")
                  .join("-")
            : "league";
        setCompetition({
            id: event.competitionId,
            name: event.competitionName,
            slug: competitionSlug,
        });
        setExchEvent({
            id: event.eventId,
            name: event.eventName,
            slug: event.eventSlug,
        });

        if (event?.providerName?.toLowerCase() === "sportradar" && !loggedIn) {
            history.push("/login");
        } else if (event?.catId === "SR VIRTUAL") {
            history.push(
                `/exchange_sports/virtuals/${eventTypesNameMap[event?.sportId]?.toLowerCase()}/${competitionSlug}/${
                    event.eventSlug
                }/${btoa(`${event.sportId}:${event.competitionId}:${event.eventId}`)}`,
            );
        } else {
            history.push(
                `/exchange_sports/${eventTypesNameMap[event?.sportId]?.toLowerCase()}/${competitionSlug}/${
                    event.eventSlug
                }/${btoa(`${event.providerName}:${event.sportId}:${event.competitionId}:${event.eventId}`)}`,
                {
                    homeTeam: event?.homeTeam,
                    awayTeam: event?.awayTeam,
                    openDate: event?.openDate,
                },
            );
        }
    };

    const [searchTerm, setSearchTerm] = useState<string>("");

    const clearAll = () => {
        setSearchTerm("");
    };

    return (
        <div>
            <SEO
                title={BRAND_NAME}
                name={"Inplay events page"}
                description={"Inplay events page"}
                type={"Inplay events page"}
                link={pathLocation?.pathname}
            />
            <IonRow className="exch-inplay-events-view">
                <IonCol
                    sizeLg={statusNew === Status.CUP_WINNER ? "11.8" : "9"}
                    sizeMd={statusNew === Status.CUP_WINNER ? "10.8" : "8"}
                    sizeXs="12"
                    className="exch-inplay-events-table-section"
                >
                    {notifications?.length > 0 ? (
                        <div className="noti-header">
                            <div
                                className="animation-notifi"
                                onClick={() => setShowNotificationModal(true)}
                            >
                                <NotificationsIcon
                                    className="notification-icon"
                                    style={{
                                        position: "absolute",
                                        left: "5px",
                                        zIndex: 11111,
                                        height: "30px",
                                        width: "30px",
                                        background: "var(--notification-bg)",
                                        borderRadius: "20px",
                                    }}
                                />
                                {getNotificationMessages(notifications)}
                            </div>
                            <div className="search-tab">
                                {/* {isMobile && searchTerm !== undefined ? ( */}
                                <div className="search-games-ctn">
                                    <input
                                        className="search-games-input gradient-border"
                                        placeholder={
                                            langData?.["search_events"]
                                        }
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <CancelRounded onClick={() => clearAll()} />
                                </div>
                            </div>
                            {/* ) : null} */}
                        </div>
                    ) : null}

                    {favouriteEvents?.length > 0 && (
                        <Tabs variant="scrollable" className="favourite-events">
                            {favouriteEvents.map((event) => (
                                <button
                                    className="favourite-event-item"
                                    onClick={() => handleEventChange(event)}
                                >
                                    <span className="event-name">
                                        {event?.customEventName
                                            ? event.customEventName
                                            : event.eventName}
                                    </span>
                                </button>
                            ))}
                        </Tabs>
                    )}
                    <div className="notifi-live-upcoming-tabs">
                        <div className="inplay-status-tabs">
                            <div className="time-tabs">
                                <Tabs variant="scrollable" scrollButtons={false}>
                                    <button
                                        className={`inplay-tab ${
                                            Status.LIVE_MATCH === statusNew
                                                ? "selected-inplay-tab"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleStatusChange(
                                                Status.LIVE_MATCH,
                                            );
                                        }}
                                    >
                                        {langData?.["all"]}
                                    </button>
                                    {sideHeaderTabs?.map(
                                        (sport) =>
                                            sport.text !== "Multi markets" && (
                                                <button
                                                    className={`inplay-tab ${
                                                        selectedSport ===
                                                            sport.id &&
                                                        Status.LIVE_MATCH !==
                                                            statusNew
                                                            ? "selected-inplay-tab"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        if (
                                                            sport.route &&
                                                            String(
                                                                sport.route,
                                                            ).startsWith("/dc/")
                                                        ) {
                                                            history.push(
                                                                sport.route,
                                                            );
                                                            return;
                                                        }
                                                        setStatusNew(
                                                            Status.SPORT,
                                                        );
                                                        setSelectedSport(
                                                            sport.id,
                                                        );
                                                    }}
                                                >
                                                    <sport.img className="sub-header-icons" />
                                                    {sport.langKey ===
                                                    "cock_fight"
                                                        ? langData?.[
                                                              "cock_fight"
                                                          ] || "Cock Fight"
                                                        : langData?.[
                                                              sport.langKey
                                                          ]}
                                                </button>
                                            ),
                                    )}
                                    {/* <button
                  className={`inplay-tab ${Status.UPCOMING === statusNew ? 'selected-inplay-tab' : ''
                    }`}
                  onClick={() => {
                    handleStatusChange(Status.UPCOMING);
                  }}
                >
                  {langData?.['upcoming']}
                </button> */}
                                </Tabs>
                                {/* <button
                  className={`inplay-tab ${
                    Status.CUP_WINNER === statusNew ? 'selected-inplay-tab' : ''
                  }`}
                  onClick={() => {
                    handleStatusChange(Status.CUP_WINNER);
                  }}
                >
                  CUP WINNER
                </button> */}
                            </div>
                        </div>
                    </div>

                    <InplayEventsTable
                        inplayEvents={getEvents()}
                        mobBanners={apiWebBanners}
                    />
                    {/* )} */}
                </IonCol>
                {Status.CUP_WINNER !== statusNew && (
                    <IonCol
                        sizeLg="2.8"
                        sizeMd="4"
                        sizeXs="12"
                        className="exch-providers pos-sticky-10"
                    >
                        <TrendingGames langData={langData} />
                    </IonCol>
                )}
            </IonRow>
            {windowSize.width < 720 && (
                <div className="inplay-social-media">
                    <SocialMediaNew />
                </div>
            )}
            <Dialog
                open={showNotificationModal}
                onClose={closeStlDialog}
                aria-labelledby="Settlements Dialog"
                fullScreen={false}
                fullWidth={true}
                maxWidth="md"
                className="stl-dialog"
            >
                <DialogTitle className="stl-dialog-title">
                    <div className="title-close-icon">
                        <div className="modal-title notification-title">
                            {langData?.["notifications"]}
                        </div>
                        <IconButton
                            className="close-btn"
                            onClick={() => setShowNotificationModal(false)}
                        >
                            <Close className="close-icon" />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent className="stl-dialog-content">
                    <AdminNotification />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const mapStateToProps = (state: any) => {
    const eventType = state.exchangeSports.selectedEventType;
    const competition = state.exchangeSports.selectedCompetition;
    return {
        inplayEvents: getInplayEvents(
            state.exchangeSports.events,
            state.common.contentConfig,
        ),
        upcomingEvents: getUpcomingEvents(
            state.exchangeSports.events,
            state.common.contentConfig,
        ),
        cupWinnerEvents: getCupWinnerEvents(
            state.exchangeSports.events,
            state.common.contentConfig,
        ),
        events: getExchangeEvents(
            state.exchangeSports.events,
            SPToBFIdMap[eventType.id]
                ? SPToBFIdMap[eventType.id]
                : eventType.id,
            competition.id,
        ),
        notificationUpdated: state.common.notificationUpdated,
        langData: state.common.langData,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        clearAllEvents: () => dispatch(clearAllEvents()),
        clearExchcngeBets: () => dispatch(clearExchcngeBets()),
        fetchInplayEvents: (inplayEvents: any[]) =>
            dispatch(fetchInplayEvents()),
        fetchEventsInDateRange: (startDate, endDate) =>
            dispatch(fetchEventsInDateRange(startDate, endDate)),
        setExchEvent: (event: any) => dispatch(setExchEvent(event)),
        setCompetition: (competition: any) =>
            dispatch(setCompetition(competition)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ExchInplayEventsView);
