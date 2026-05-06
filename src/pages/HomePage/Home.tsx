import React, { lazy, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import BannerCarousel from './BannerCarousel';
import Providers from './ProvidersInfo';
import './HomePage.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { connect } from 'react-redux';
// import { RootState } from '../../models/RootState';
// import { DcGameNew } from '../../models/dc/DcGame';
import SitesInfo from './SiteInfo';
import GamesCarousel from './GamesCarousel';
import axios, { AxiosResponse } from 'axios';
// import SVLS_API from '../../svls-api';
import { setTrendingGames } from '../../store/slices/commonSlice';
// import { CasinoGameDTO } from '../../models/IndianCasinoState';
import trendingGamesData from '../../assets/api_json/indian-casino-games.json';
import TopMatchesData from '../../assets/top_matches/TopMatches.json';

import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
import CheckBonusTab from './CheckBonusTab';
import BottomTab from './BottomTab';
// import { DomainConfig } from '../../models/DomainConfig';
// import {
//   fetchFavEvents,
//   setCompetition,
//   setExchEvent,
// } from '../../store/exchangeSports/exchangeSportsActions';
import CricketBattle from '../../assets/images/banners/cricket_battle.webp';
import { postAPI } from '../../services/apiInstance';
// import { EventDTO } from '../../models/common/EventDTO';
// import { FavoriteEventDTO } from '../../models/common/FavoriteEventDTO';
// const SportsCarousel = lazy(() => import('./SportsCarousel'));
const TopMatches = lazy(() => import('./TopMatches'));
// const TrendingSports = lazy(() => import('./TrendingSports'));

type StoreProps = {
  allowedConfig: number;
  trendingGames: any[];
  setTrendingGames: Function;
  loggedIn: boolean;
  loggedInUserStatus: any;
  setCasinoGame: (cGame: any) => void;
  langData: any;
  domainConfig: any;
  setCompetition: Function;
  setExchEvent: Function;
  avaalableEventTypes: any;
};

const HomePage: React.FC<StoreProps> = (props) => {
  const {
    allowedConfig,
    trendingGames,
    setTrendingGames,
    loggedIn,
    loggedInUserStatus,
    setCasinoGame,
    langData,
    domainConfig,
    setCompetition,
    setExchEvent,
    availableEventTypes
    
  } = props;
console.log('Available Event Types in HomePage:', availableEventTypes); 
  // console.log('Trending Games from Redux:', trendingGames);

  const cricketBattlePath =
    'dc/gamev1.1/cricket-battle-MTUxMTg1-TUFDODgtWENSQjEwMQ==-TUFDODg=-TWFjODggR2FtaW5nIFZpcnR1YWw=-TUFDSFVC';
  const [macGames, setMacGames] = useState<any[]>();
  const [evolutionGames, setEvolutionGames] = useState<any[]>();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [favouriteEvents, setFavouriteEvents] = useState<any[]>(
    []
  );
  const [slotGames, setSlotGames] = useState<any[]>();
  const history = useHistory();
  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

const getGames = async () => {
  try {
    const res = await import('../../assets/api_json/indian-casino-games.json');


    const response = res.default;
   

    const macGamesData = response.filter(
      (game) => game.tag === 'recommended_games'
    );

    const trendingGamesList = response.filter(
      (game) => game.tag === 'new_launch'
    );

    const evolutionGamesData = response.filter(
      (game) =>
        game.tag === 'live_games' ||
        game.tag === 'live_casino_games'
    );

    const slotGamesData = response.filter(
      (game) => game.tag === 'slot'
    );

    setMacGames(macGamesData);
    setTrendingGames(trendingGamesList);
    setEvolutionGames(evolutionGamesData);
    setSlotGames(slotGamesData);
  } catch (error) {
    console.log(error);
  }
};



  

        const fetchFavoruiteEvents = async () => {
  try {
    const inplay = await postAPI('/getFreeInplyEventsAPI', {});
    

    setFavouriteEvents(inplay?.data?. result ?? []);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    getGames();
    fetchFavoruiteEvents();
  }, []);

  return (
    <div className="home-page-ctn">
      <div className="home-container">
        <BannerCarousel />
        {/* {isMobile && <SportsCarousel></SportsCarousel>} */}

        <CheckBonusTab
          loggedIn={loggedIn}
          langData={langData}
          bonusEnabled={domainConfig.b2cEnabled && domainConfig.bonus}
        />
        {/* <TrendingSports
          displayHeader={langData?.['sports'] || 'sports'}
          langData={langData}
        /> */}

        {favouriteEvents?.length > 0 && (
          <TopMatches
            favouriteEvents={favouriteEvents}
            displayHeader={langData?.['top_matches'] || 'Top Matches'}
            langData={langData}
            loggedIn={loggedIn}
            setCompetition={setCompetition}
            setExchEvent={setExchEvent}
          />
        )}

        <div className="border-shadow-container">
          <span className="text">Cricket Battle</span>
        </div>
        <img
          src={CricketBattle}
          alt="logo"
          style={{ width: '100%', borderRadius: '10px', cursor: 'pointer' }}
          onClick={() => {
            history.push(cricketBattlePath);
          }}
        />

        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={trendingGames}
          displayHeader={langData?.['new_launch'] ?? 'New Launch'}
          heading="Popular Games"
        />

        <SitesInfo
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          langData={langData}
        />
        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={macGames}
          displayHeader={langData?.['recommended_games']}
          heading="Recommended Games"
        />

        {/* <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={rgGames}
          heading={langData?.['top_rated_games']}
        />

        {/* <DepositBonus /> */}
        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={evolutionGames}
          displayHeader={langData?.['live_casino_games']}
          heading="Live Casino Games"
        />

        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={slotGames}
          displayHeader={langData?.['slots'] ?? 'Slots'}
          heading="Slots"
        />
        <Providers langData={langData} />

        <BottomTab
          langData={langData}
          supportContacts={domainConfig.suppportContacts}
        />

        <div className="banner-container pb-0"></div>
      </div>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">{langData?.['notice']}</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            {langData?.['games_access_login_txt']}
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            className="cancel-btn dialog-action-btn"
          >
            {langData?.['cancel']}
          </Button>
          <Button
            onClick={() => {
              history.push('/login');
              setDialogShow(false);
            }}
            className="login-btn dialog-action-btn"
          >
            {langData?.['login']}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  let status = 0;
  if (state.auth.loggedIn) {
    const jwtToken = sessionStorage.getItem('jwt_token');
    if (jwtToken) {
      status = JSON.parse(window.atob(jwtToken.split('.')[1])).status;
    }
  }
  return {
    loggedIn: state.auth.loggedIn,
    allowedConfig: state.common.allowedConfig,
    trendingGames: state.common.trendingGames,
    loggedInUserStatus: status,
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
    availableEventTypes: state.userDetails.availableEventTypes
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTrendingGames: (value) => dispatch(setTrendingGames(value)),
    // setCompetition: (competition: any) => dispatch(setCompetition(competition)),
    // setExchEvent: (event: any) => dispatch(setExchEvent(event)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
