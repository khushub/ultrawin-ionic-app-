import React, { useMemo } from 'react';
// import { EventDTO } from '../../models/common/EventDTO';
// import {
//   FavoriteEventDTO,
//   adaptFavoriteEventToEventDTO,
// } from '../../models/common/FavoriteEventDTO';

import MarketEnabled from '../../common/MarketEnabled/MarketEnabled';
import ExchOddBtn from '../../components/ExchOddButton/ExchOddButton';
import LiveEvent from '../../assets/images/liveEvent.gif';
import { useHistory } from 'react-router';
// import { eventTypesNameMap } from '../../store/exchangeSports/exchangeSportsSelectors';
import './TopMatches.scss';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import { sportIconsMap, sportNamesMap } from './HomePageUtils';
import CarouselComponent from '../../common/CarouselComponent/CarouselComponent';

type Props = {
  favouriteEvents: any[];
  displayHeader: string;
  langData: any;
  loggedIn: boolean;
  setCompetition: Function;
  setExchEvent: Function;
};

const TopMatches: React.FC<Props> = ({
  favouriteEvents,
  displayHeader,
  langData,
  loggedIn,
  setCompetition,
  setExchEvent,
}) => {
  const history = useHistory();
  const getTeamTypes = (event: any) => {
    const count = event?.marketBook?.runners?.length || 0;

    if (count === 2) return ['home', 'away'];
    if (count === 3) return ['home', 'draw', 'away'];

    return [];
  }
  console.log('favouriteEvents in TopMatches:', favouriteEvents);

  const getOdds = (eventData: any, teamType: string) => {

    console.log('Getting odds for teamType:', teamType, eventData.eventName);
    const runners = eventData?.marketBook?.runners || [];

    let runner = null;

    if (runners.length === 2) {
      runner = teamType === 'home' ? runners[0] : runners[1];
    }

    if (runners.length === 3) {
      if (teamType === 'home') runner = runners[0];
      if (teamType === 'draw') runner = runners[1];
      if (teamType === 'away') runner = runners[2];
    }

    if (!runner) return null;

    return [
      {
        type: 'back-odd',
        price: runner?.availableToBack?.price || '--',
        size: runner?.availableToBack?.size || '--',
        outcomeId: runner.selectionId,
        outcomeName: runner.runnerName,
      },
      {
        type: 'lay-odd',
        price: runner?.availableToLay?.price || '--',
        size: runner?.availableToLay?.size || '--',
        outcomeId: runner.selectionId,
        outcomeName: runner.runnerName,
      },
    ];
  };

  //   const handleEventChange = (event: any) => {
  //     const competitionSlug = event.competitionName
  //       ? event.competitionName
  //           .toLocaleLowerCase()
  //           .replace(/[^a-z0-9]/g, ' ')
  //           .replace(/ +/g, ' ')
  //           .trim()
  //           .split(' ')
  //           .join('-')
  //       : 'league';

  //     setCompetition({
  //       id: event.competitionId,
  //       name: event.competitionName,
  //       slug: competitionSlug,
  //     });

  //     setExchEvent({
  //       id: event.eventId,
  //       name: event.eventName,
  //       slug: event.eventSlug,
  //     });

  //     if (event?.providerName?.toLowerCase() === 'sportradar' && !loggedIn) {
  //       history.push('/login');
  //     } else if (event?.catId === 'SR VIRTUAL') {
  //       history.push(
  //         `/exchange_sports/virtuals/${eventTypesNameMap[event?.sportId]?.toLowerCase()}/${competitionSlug}/${
  //           event.eventSlug
  //         }/${btoa(`${event.sportId}:${event.competitionId}:${event.eventId}`)}`
  //       );
  //     } else {
  //       history.push(
  //         `/exchange_sports/${eventTypesNameMap[event?.sportId]?.toLowerCase()}/${competitionSlug}/${
  //           event.eventSlug
  //         }/${btoa(`${event.providerName}:${event.sportId}:${event.competitionId}:${event.eventId}`)}`,
  //         {
  //           homeTeam: event?.homeTeam,
  //           awayTeam: event?.awayTeam,
  //           openDate: event?.openDate,
  //         }
  //       );
  //     }
  //   };
  // Convert FavoriteEventDTO to EventDTO format for component compatibility
  const adaptedEvents = favouriteEvents;
  if (!favouriteEvents || favouriteEvents.length === 0) {
    return null;
  }

  return (
    <div className="top-matches-ctn">
      <div className="border-shadow-container">
        <span className="text">{displayHeader}</span>
      </div>

      <CarouselComponent
        className="top-matches-slider"
        enableAutoScroll={false}
        isInfinite={false}
      // dependencies={[adaptedEvents]}
      >
        {adaptedEvents.map((event) => (
          <div
            key={event.eventId}
            className="top-match-card"
          // onClick={() => handleEventChange(event)}
          >
            <div className="match-info">
              <div className="category-and-live">
                <div className="category-name-container">
                  <div className="sport-icon-container">
                    <img
                      src={sportIconsMap[event.eventTypeId]}
                      alt={event.eventTypeName}
                      className="sport-icon"
                      height={25}
                      loading="lazy"
                    />
                    <div className="sport-name-top-matches">
                      {sportNamesMap[event.eventTypeId]}
                    </div>
                  </div>

                  <div className="market-types">
                    <MarketEnabled
                      marketEnabled={
                        event?.enablePremium && event?.catId !== 'SR VIRTUAL'
                      }
                      marketType={'P'}
                    />
                    <MarketEnabled
                      marketEnabled={event?.marketType === "MATCH_ODDS"}
                      marketType={'MO'}
                    />
                    <MarketEnabled
                      marketEnabled={event?.bm}
                      marketType={'BM'}
                    />
                    <MarketEnabled
                      marketEnabled={event?.fancy}
                      marketType={'F'}
                    />
                    <MarketEnabled
                      marketEnabled={event?.enableToss}
                      marketType={'T'}
                    />
                  </div>
                </div>
              </div>

              <div className="competition-name-top-matches">
                {event.competitionName}
              </div>

              <div className="event-details">
                <div className="event-name-container">
                  <div className="team-names">
                    {
                      event.marketBook?.runners?.[0]?.runnerName &&
                        event.marketBook?.runners?.[1]?.runnerName
                        ? `${event.marketBook.runners[0].runnerName} V ${event.marketBook.runners[1].runnerName}`
                        : event.eventName
                    }
                  </div>
                  {event.marketBook?.inplay && (
                    <img
                      src={LiveEvent}
                      alt="Live Event"
                      className="live-img-top-matches"
                    />
                  )}
                </div>

                <div className="event-time-top-matches">
                  <div className="date-display-top-matches">
                    <div>
                      {moment(
                        moment(event?.openDate).format('DD MMM YYYY')
                      ).isSame(moment().format('DD MMM YYYY'))
                        ? 'Today'
                        : moment(event?.openDate).format('DD MMM')}
                    </div>
                    <div>{moment(event?.openDate).format('hh:mm A')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="odds-section">
              {(
                event?.marketBook?.runners?.length === 2
                  ? ['home', 'away']
                  : event?.marketBook?.runners?.length === 3
                    ? ['home', 'draw', 'away']
                    : []
              ).map((teamType, index) => (
                <div key={teamType + index} className="team-odds">
                  {event?.marketBook?.runners?.length ? (
                    getOdds(event, teamType) ? (
                      getOdds(event, teamType).map((odd) => (
                        <ExchOddBtn
                          mainValue={odd.price}
                          subValue={odd.size}
                          oddType={
                            odd.type === 'back-odd' ? 'back-odd' : 'lay-odd'
                          }
                          disable={event.marketBook?.status?.toLowerCase().includes('suspended') ||
                            event.marketBook?.status?.toLowerCase().includes('closed')}
                          valueType="matchOdds"
                          showSubValueinKformat={true}
                          onClick={() => null}
                        />
                      ))
                    ) : (
                      <>
                        <ExchOddBtn
                          mainValue={null}
                          oddType="back-odd"
                          disable={true}
                        />
                        <ExchOddBtn
                          mainValue={null}
                          oddType="lay-odd"
                          disable={true}
                        />
                      </>
                    )
                  ) : (
                    <>
                      <ExchOddBtn
                        mainValue={null}
                        oddType="back-odd"
                        disable={true}
                      />
                      <ExchOddBtn
                        mainValue={null}
                        oddType="lay-odd"
                        disable={true}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CarouselComponent>
    </div>
  );
};

export default TopMatches;
