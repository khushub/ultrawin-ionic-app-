import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom';
import { fetchEventsByCompetition, fetchEventsBySport, setCompetition, setExchEvent } from '../../store/slices/homeMarketsSlice';
import { getExchangeEvents } from '../../store/selectors/homeMarketsSelectors';
import AddIcon from '@mui/icons-material/Add';

import moment from 'moment';
import NoEventsIcon from '../../assets/images/No_events_icon.svg';
import EventDateDisplay from '../../common/EventDateDisplay/EventDateDisplay';
import EventName from '../../common/EventName/EventName';
import MarketEnabled from '../../common/MarketEnabled/MarketEnabled';
import NoDataComponent from '../../common/NoDataComponent/NoDataComponent';
import { BRAND_NAME, PROVIDER_ID } from '../../constants/Branding';
// import {
//   disconnectToWS,
//   subscribeWsForEventOdds,
//   unsubscribeAllWsforEvents,
// } from '../../webSocket/webSocket';
import ExchMobOddView from '../ExchOddButton/ExchMobOddView';
import ExchOddBtn from '../ExchOddButton/ExchOddButton';
import SEO from '../SEO/Seo';
import './ExchEventsTable.scss';
import { isMobile } from 'react-device-detect';
import {
  BETFAIR_PROVIDER_ID,
  getSportLangKeyByName,
  SportIconMapInplay,
  SPToBFIdMap,
} from '../../util/stringUtil';
// import CATALOG_API from '../../catalog-api';
// import { fetchFavEvents } from '../../store/exchangeSports/exchangeSportsActions';
import { Button, Tabs } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Check } from '@mui/icons-material';
import { CONFIG } from '../../config/config';
import { postAPI } from '../../services/apiInstance';

type StoreProps = {
  events: any[];
  selectedEventType: any;
  selectedCompetition: any;
  fetchEventsByCompetition: (
    sportId: string,
    competitionId: string,
    events: any[]
  ) => void;
  setExchEvent: (event: any) => void;
  setCompetition: (competition: any) => void;
  fetchEventsBySport: (sportId: string) => void;
  fetchingEvents: boolean;
  allowedConfig: number;
  loggedIn: boolean;
  // betFairWSConnected: boolean;
  // topicUrls: any;
  loading: boolean;
  langData: any;
};

enum Status {
  LIVE = 'LIVE',
  UPCOMING = 'UPCOMING',
  VIRTUAL = 'VIRTUAL',
}
const EventsTable: React.FC<StoreProps> = (props) => {
  const {
    allowedConfig,
    events,
    selectedEventType,
    selectedCompetition,
    fetchEventsByCompetition,
    setExchEvent,
    setCompetition,
    fetchEventsBySport,
    fetchingEvents,
    loggedIn,
    // topicUrls,
    // betFairWSConnected,
    loading,
    langData,
  } = props;
  const history = useHistory();
  const pathParams = useParams();
  const pathLocation = useLocation();
  const teamTypes = ['home', 'draw', 'away'];
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [eventsData, setEventsData] = useState([]);
  const [eventName, setEventName] = useState<string>('');
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>('');
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<Status>();
  const [favouriteEvents, setFavouriteEvents] = useState<any[]>([]);

  
  const getOdds = (eventData: any, teamType: string) => {
    const runners = eventData?.marketBook?.runners ?? [];

    const runner = teamType === 'home'
    ? runners?.[0]
    : teamType === 'away' 
    ? runners?.[1]
    : runners?.[2]

    if (!runner) return null;

    return [
      {
        type: 'back-odd',
        price: runner.availableToBack?.price,
        size: runner.availableToBack?.size,
        outcomeId: runner.selectionId,
        outcomeName: runner.runnerName,
      },
      {
        type: 'lay-odd',
        price: runner.availableToLay?.price,
        size: runner.availableToLay?.size,
        outcomeId: runner.selectionId,
        outcomeName: runner.runnerName,
      },
    ];
  };

  useEffect(() => {
    if (!pathParams['competition']) {
      setCompetition({ id: '', name: '', slug: '' });
    }
  }, [pathParams]);

  useEffect(() => {
    setEventFilter(null);
  }, [pathLocation?.pathname]);


  const searchEvent = async (val) => {
    // console.log(val);
    // const response = await CATALOG_API.get(
    //   '/catalog/v2/sports-feed/sports/live-events:search',
    //   {
    //     headers: {
    //       Authorization: sessionStorage.getItem('jwt_token'),
    //     },
    //     params: {
    //       providerId: PROVIDER_ID,
    //       query: val,
    //     },
    //   }
    // );
    // if (response.status == 200) {
    //   setEventsData(response?.data);
    // }
  };

  useEffect(() => {
    if (eventName) searchEvent(eventName);
  }, [eventName]);

  const updateEvents = () => {
    if (!pathParams['competition']) {
      fetchEventsBySport(
        SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
          : selectedEventType.id
      );
    } else {
      fetchEventsByCompetition(
        SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
          : selectedEventType.id,
        selectedCompetition.id,
        events
      );
    }
  };

  useEffect(() => {
    if (!pathParams['competition']) {
      fetchEventsBySport(
        SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
          : selectedEventType.id
      );
    }
  }, [selectedEventType]);

  useEffect(() => {
    if (pathParams['competition'] && !events) {
      fetchEventsByCompetition(
        SPToBFIdMap[selectedEventType.id]
          ? SPToBFIdMap[selectedEventType.id]
          : selectedEventType.id,
        selectedCompetition.id,
        events
      );
    }
  }, [selectedCompetition]);

  // useEffect(() => {
  //   updateEvents();
  // }, [loggedIn]);

  useEffect(() => {
    let refreshInterval = setInterval(() => {
      updateEvents();
    }, 60 * 1000);
    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedEventType]);


  const getCompetitionSlug = (competitionName: string) => {
    return competitionName
      ?.toLocaleLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/ +/g, ' ')
      .trim()
      .split(' ')
      .join('-');
  };

  const disableFutureEvents = (date: any) => {
    let dt = date;
    dt = moment.utc(date).toString();

    let retDate = moment(dt);
    retDate = retDate.local();

    return moment(retDate).diff(moment(), 'minutes') > 60 * 24 * 2
      ? true
      : false;
  };

  const handleEventChange = (event: any) => {
    setCompetition({
      id: event.competitionId,
      name: event.competitionName,
      slug: getCompetitionSlug(event.competitionName),
    });
    setExchEvent({
      id: event.eventId,
      name: event.eventName,
      slug: event.eventSlug,
    });
    history.push(
      event?.providerName?.toLowerCase() === 'sportradar' &&
        event?.catId === 'SR VIRTUAL'
        ? loggedIn
          ? `/exchange_sports/virtuals/${
              selectedEventType.slug
            }/${getCompetitionSlug(
              event.competitionName
            )}/${event.eventSlug}/${btoa(
              `${event.sportId}:${event.competitionId}:${event.eventId}`
            )}`
          : '/login'
        : `/exchange_sports/${
            selectedEventType.slug
          }/${getCompetitionSlug(event.competitionName)}/${
            event.eventSlug
          }/${btoa(
            `${event.providerName}:${event.sportId}:${event.competitionId}:${event.eventId}:${moment(event.openDate).unix()}`
          )}`
    );
  };

  const getEvents = (status: Status) => {
    switch (status) {
      case Status.LIVE:
        return events.filter(
          (event) =>
            ((event?.sportId != '2' &&
              moment(event?.openDate).diff(moment(), 'seconds') <= 0) ||
              event?.status == 'IN_PLAY' ||
              (event?.sportId === '2' &&
                moment(event?.openDate).diff(moment(), 'minutes') <= 5)) &&
            event.marketTypeStatus == 0
        );
        break;
      case Status.UPCOMING:
        return events.filter(
          (event) => moment(event?.openDate).isAfter(moment()) && event.marketTypeStatus == 0
        );
        break;
      case Status.VIRTUAL:
        return events?.filter(
          (event) => event.catId === 'SR VIRTUAL' || event.marketTypeStatus != 0
        );
        break;
      default:
        return events;
        break;
    }
  };

  useEffect(() => {
    const fetchFavoruiteEvents = async () => {
      try {
        const inplay = await postAPI('/getFreeInplyEventsAPI', {});
        setFavouriteEvents(inplay.data.result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFavoruiteEvents();
  }, [loggedIn]);

  const GetSportIcon = ({ sportId }) => {
    const IconComponent = SportIconMapInplay[sportId];

    if (!IconComponent) {
      return null; // or a default icon/component
    }

    return (
      <div style={{ height: 'fit-content', width: 'fit-content' }}>
        <IconComponent width={24} height={24} className="ip-event-icon" />
      </div>
    );
  };

  return (
    <div className="events-table-ctn">
      <SEO
        title={CONFIG.title}
        description={'Sports list'}
        name={`Sports list`}
        type={'Sports List'}
        link={pathLocation?.pathname}
      />

      {events?.length > 0 ? (
        <div className="events-table-content table-ctn">
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
          <TableContainer component={Paper}>
            <Table className="events-table">
              <TableHead className="et-head">
                <TableRow className="status-btns">
                  <TableCell colSpan={12} className="status-btns-cell">
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 8px',
                      }}
                    >
                      <div className="icon-and-name">
                        <GetSportIcon sportId={selectedEventType?.id} />
                        <div className="ip-event-name">
                          {
                            langData?.[
                              getSportLangKeyByName(selectedEventType?.name)
                            ]
                          }{' '}
                        </div>
                      </div>
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          gap: '4px',
                        }}
                      >
                        <Button
  className={
    eventFilter === Status.LIVE
      ? 'active status-btn'
      : 'status-btn'
  }
  onClick={() =>
    setEventFilter(
      eventFilter === Status.LIVE ? null : Status.LIVE
    )
  }
  disableRipple={false}
>
  <span className="MuiButton-label">
    {eventFilter === Status.LIVE ? (
      <Check style={{ height: '13px',  position: 'relative',
        top: '2px' }} />
    ) : (
      <AddIcon style={{ height: '13px',  position: 'relative',
        top: '2px' }} />
    )}
    Live
  </span>
</Button>
                        <Button
                          className={
                            eventFilter === Status.VIRTUAL
                              ? 'active status-btn'
                              : 'status-btn'
                          }
                          onClick={() =>
                            setEventFilter(
                              eventFilter === Status.VIRTUAL
                                ? null
                                : Status.VIRTUAL
                            )
                          }
                        >
                         <span className="MuiButton-label">
    {eventFilter === Status.VIRTUAL ? (
      <Check style={{ height: '13px',  position: 'relative',
        top: '2px' }} />
    ) : (
      <AddIcon style={{ height: '13px',  position: 'relative',
        top: '2px' }} />
    )}
                          Virtual
                      </span>  </Button>
                        <Button
                          className={
                            eventFilter === Status.UPCOMING
                              ? 'active status-btn'
                              : 'status-btn'
                          }
                          onClick={() =>
                            setEventFilter(
                              eventFilter === Status.UPCOMING
                                ? null
                                : Status.UPCOMING
                            )
                          }
                        >
                           <span className="MuiButton-label">
    {eventFilter === Status.UPCOMING ? (
      <Check
      style={{
        height: '14px',
        width: '14px',
        marginRight: '4px',
        position: 'relative',
        top: '2px'
      }}
    />
  ) : (
    <AddIcon
      style={{
        fontSize: '10px',
        height: '14px',
        width: '14px',
        marginRight: '4px',
        position: 'relative',
        top: '2px'
      }}
    />
    )}
                          Upcoming
                        </span>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {getEvents(eventFilter).map((sEvent, idx) => (
                  <TableRow
                    key={sEvent?.eventId}
                    className="bgc-white markets-team-cell-pointer"
                    onClick={() => handleEventChange(sEvent)}
                  >
                    <TableCell className="teams-cell mob-et-b-c ">
                      <div
                        className="all-markets-nav-link"
                        key={'all-markets-link'}
                      >
                        {sEvent.homeTeam !== '' && sEvent.awayTeam !== '' ? (
                          <>
                            {!isMobile && (
                              <div className="web-view team-name-ctn">
                                <div className="temas-col">
                                  <EventDateDisplay
                                    openDate={ sEvent?.openDate}
                                    forcedInplay={sEvent?.forcedInplay}
                                    status={sEvent?.status}
                                    sportId={sEvent?.sportId}
                                  />
                                  <EventName
                                    eventName={sEvent?.eventName}
                                    homeTeam={sEvent.homeTeam}
                                    awayTeam={sEvent?.awayTeam}
                                    openDate={sEvent?.openDate}
                                    forcedInplay={sEvent?.forcedInplay}
                                    status={sEvent?.status}
                                    sportId={sEvent?.sportId}
                                  />
                                </div>
                                <div className="enabled-markets">
                                  <MarketEnabled
                                    marketEnabled={ sEvent?.catId === 'SR VIRTUAL' }
                                    marketType={'V'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={
                                      sEvent?.enablePremium &&
                                      sEvent?.catId !== 'SR VIRTUAL'
                                    }
                                    marketType={'P'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.marketType == 'MATCH_ODDS'}
                                    marketType={'MO'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={!!sEvent?.bm}
                                    marketType={'BM'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={!!sEvent?.fancy}
                                    marketType={'F'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={sEvent?.enableToss}
                                    marketType={'T'}
                                  />
                                  <MarketEnabled
                                    marketEnabled={ sEvent?.marketTypeStatus != 0 }
                                    marketType={'V2'}
                                  />
                                </div>
                              </div>
                            )}
                            {isMobile && (
                              <div className="mob-view">
                                <div className="event-details-ctn">
                                  <div className="event-name mob-event-name">
                                    <div className="event-name-and-link">
                                      <EventName
                                        eventName={ sEvent?.eventName }
                                        openDate={ sEvent?.openDate }
                                        forcedInplay={sEvent?.forcedInplay}
                                        status={sEvent?.status}
                                        sportId={sEvent?.sportId}
                                      />
                                    </div>
                                  </div>

                                  <div className="enabled-markets">
                                    <MarketEnabled
                                      marketEnabled={ sEvent?.catId === 'SR VIRTUAL' }
                                      marketType={'V'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={
                                        sEvent?.enablePremium &&
                                        sEvent?.catId !== 'SR VIRTUAL'
                                      }
                                      marketType={'P'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.marketType == 'MATCH_ODDS'}
                                      marketType={'MO'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={!!sEvent?.bm}
                                      marketType={'BM'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={!!sEvent?.fancy}
                                      marketType={'F'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={sEvent?.enableToss}
                                      marketType={'T'}
                                    />
                                    <MarketEnabled
                                      marketEnabled={ sEvent?.marketTypeStatus != 0 }
                                      marketType={'V2'}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="team-name">
                            <div className="temas-col">
                              <EventDateDisplay
                                openDate={ sEvent?.openDate }
                                forcedInplay={sEvent.forcedInplay}
                                status={sEvent?.status}
                                sportId={sEvent?.sportId}
                              />
                              <div className="team-names">
                                {sEvent.eventName}
                              </div>
                            </div>
                            <div className="enabled-markets">
                              <MarketEnabled
                                marketEnabled={sEvent?.catId === 'SR VIRTUAL'}
                                marketType={'V'}
                              />
                              <MarketEnabled
                                marketEnabled={
                                  sEvent?.enablePremium &&
                                  sEvent?.catId !== 'SR VIRTUAL'
                                }
                                marketType={'P'}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.marketType == 'MATCH_ODDS'}
                                marketType={'MO'}
                              />
                              <MarketEnabled
                                marketEnabled={!!sEvent?.bm}
                                marketType={'BM'}
                              />
                              <MarketEnabled
                                marketEnabled={!!sEvent?.fancy}
                                marketType={'F'}
                              />
                              <MarketEnabled
                                marketEnabled={sEvent?.enableToss}
                                marketType={'T'}
                              />
                              <MarketEnabled
                                marketEnabled={ sEvent?.marketTypeStatus != 0 }
                                marketType={'V2'}
                              />
                            </div>
                          </div>
                        )}
                        {isMobile && (
                          <div className="mob-odds-row new-odds-row">
                            <EventDateDisplay
                              openDate={ sEvent?.openDate }
                              forcedInplay={sEvent?.forcedInplay}
                              status={sEvent?.status}
                              sportId={sEvent?.sportId}
                            />

                            {teamTypes.map((teamType, index) => (
                              <div
                                className="mob-odds-block"
                                key={teamType + index}
                              >
                                <div className="mob-exchange-btn-odd-row">
                                  {sEvent?.marketBook?.runners?.length ? (
                                    getOdds(sEvent, teamType) ? (
                                      <>
                                        {getOdds(sEvent, teamType).map(
                                          (odd) => (
                                            <ExchMobOddView
                                              mainValue={odd.price}
                                              oddType={odd.type === 'back-odd'? 'back-odd' : 'lay-odd'}
                                              disable={
                                                sEvent?.marketBook?.status?.toLowerCase().includes('suspended') ||
                                                sEvent?.marketBook?.status?.toLowerCase().includes('closed') ||
                                                disableFutureEvents(sEvent?.openDate)
                                              }
                                            />
                                          )
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <ExchMobOddView
                                          mainValue={null}
                                          oddType="back-odd"
                                          disable={true}
                                        />
                                        <ExchMobOddView
                                          mainValue={null}
                                          oddType="lay-odd"
                                          disable={true}
                                        />
                                      </>
                                    )
                                  ) : (
                                    <>
                                      <ExchMobOddView
                                        mainValue={null}
                                        oddType="back-odd"
                                        disable={true}
                                      />
                                      <ExchMobOddView
                                        mainValue={null}
                                        oddType="lay-odd"
                                        disable={true}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {teamTypes.map((teamType, index) => (
                      <TableCell
                        className="odds-cell"
                        align="center"
                        colSpan={2}
                        key={teamType + index}
                      >
                        {sEvent?.marketBook?.runners?.length ? (
                          getOdds(sEvent, teamType) ? (
                            <div className="odds-block">
                              {getOdds(sEvent, teamType).map((odd, idx) => (
                                <ExchOddBtn
                                  key={idx}
                                  mainValue={odd.price}
                                  subValue={odd.size}
                                  oddType={odd.type === 'back-odd'? 'back-odd' : 'lay-odd'}
                                  valueType="matchOdds"
                                  showSubValueinKformat={true}
                                  disable={
                                    sEvent?.marketBook?.status?.toLowerCase().includes('suspended') ||
                                    sEvent?.marketBook?.status?.toLowerCase().includes('closed') ||
                                    disableFutureEvents(sEvent?.openDate)
                                  }
                                  onClick={() => null}
                                />
                              ))}
                            </div>
                          ) : (
                            <EmptyOddsBlock />
                          )
                        ) : (
                          <EmptyOddsBlock />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {getEvents(eventFilter).length === 0 && !fetchingEvents && (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="no-data-cell"
                      style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        padding: '16px 0 16px 0',
                        fontWeight: 'bold',
                      }}
                    >
                      {langData?.['no_data_to_display']?.toLowerCase()} for{' '}
                      {langData?.[eventFilter?.toLowerCase()]?.toLowerCase()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : !fetchingEvents ? (
        <NoDataComponent
          title={langData?.['no_events_display_txt']}
          bodyContent={langData?.['no_events_placed']}
          noDataImg={NoEventsIcon}
        />
      ) : null}
    </div>
  );
};

function EmptyOddsBlock() {
  return (
    <React.Fragment>
      <div className="odds-block">
        <ExchOddBtn mainValue={null} oddType="back-odd" />
        <ExchOddBtn mainValue={null} oddType="lay-odd" />
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state: any) => {
  const eventType = state.homeMarkets.selectedEventType;
  const competition = state.homeMarkets.selectedCompetition;

  return {
    events: getExchangeEvents(
      state.homeMarkets.events,
      SPToBFIdMap[eventType.id] ? SPToBFIdMap[eventType.id] : eventType.id,
      competition.id
    ),
    selectedEventType: eventType,
    selectedCompetition: competition,
    fetchingEvents: state.homeMarkets.fetchingEvents,
    allowedConfig: state.common.allowedConfig,
    // topicUrls: state?.exchangeSports?.topicUrls,
    // betFairWSConnected: state.exchangeSports.betFairWSConnected,
    loading: state.auth.loading,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchEventsByCompetition: (
      sportId: string,
      competitionId: string,
      events: any[]
    ) => dispatch(fetchEventsByCompetition({eventTypeId: sportId, competitionId, events, track: undefined})),
    setExchEvent: (event: any) => dispatch(setExchEvent(event)),
    setCompetition: (competition: any) => dispatch(setCompetition(competition)),
    // addExchangeBet: (data: BsData) => dispatch(addExchangeBet(data)),
    fetchEventsBySport: (sportId: string) => dispatch(fetchEventsBySport({eventTypeId: sportId})),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsTable);
