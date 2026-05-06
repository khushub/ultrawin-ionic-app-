import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { EXCH_COMPETITIONS_MENU } from '../../constants/CommonContants';
import { fetchCompetitions, fetchEventsByCompetition, setCompetition } from '../../store/slices/homeMarketsSlice';
import { logout } from '../../store/slices/authSlice';
import { setLangSelected } from '../../store/slices/commonSlice';
import {
  JwtToken,
  demoUser,
  getFieldFromToken,
  notDemoUser,
} from '../../util/stringUtil';
import SocialMediaNew from '../SocialMediaNew/SocialMediaNew';
import './SideHeader.scss';
import { otherMenuTabs, securityAndLogout, securityAndLogoutForFairplay, sideHeaderTabs } from './SideHeaderUtil';
import { ChevronRight, KeyboardArrowDown, Close } from '@mui/icons-material';
import { getLangCode } from '../../util/localizationUtil';
import { CONFIG } from '../../config/config';
import MidnightAqua from '../../assets/images/home/tiles/midnight_aqua.svg';
import DarkFluralIcon from '../../assets/images/home/tiles/darkflural_icon.svg';
import RoyalSunshine from '../../assets/images/home/tiles/royal_sunshine.svg';
import { useTheme } from '../../context/ThemeContext';
import { storageManager } from '../../util/storageManager';


type Props = {
  loggedIn: boolean;
  logout: Function;
  fetchCompetitions: (eventTypeId: string) => void;
  fetchEventsByCompetition: (
    eventTypeId: string,
    competitionId: string,
    events: any[],
    track: string
  ) => void;
  setCompetition: (competition: any) => void;
  competitions: any[];
  domainConfig: any;
  closeHandler?: Function;
  langData: any;
  languages: string[];
  langSelected: string;
  setLangSelected: (lang: string) => void;
};

const themes = [
  { name: 'Midnight Aqua', image: MidnightAqua, themeName: 'darkgreen' },
  { name: 'Royal Sunshine', image: RoyalSunshine, themeName: 'purple' },
  {
    name: 'Dark Floral Fusion',
    image: DarkFluralIcon,
    themeName: 'darkvoilet',
  },
];

const SideHeader = (props: Props) => {
  const {
    loggedIn,
    logout,
    fetchCompetitions,
    fetchEventsByCompetition,
    competitions,
    domainConfig,
    setCompetition,
    closeHandler,
    langData,
    languages,
    langSelected,
    setLangSelected,
  } = props;

  const history = useHistory();
  const { setTheme } = useTheme();

  const getCompetitionsBySport = (id) => {
    console.log('getCompetitionsBySport: ', id);
    fetchCompetitions(id);
  };

  const getUserShortName = () => {
    const user = storageManager.getUser()
    const isDemo = user?.isDemo || false;

    const name: string = isDemo
      ? 'Demo User'
      : user?.fullname || user?.username;
    return name ? name[0].toUpperCase() : '';
  };

  const getUsername = () => {
    const user = storageManager.getUser();
    const isDemo = user?.isDemo || false;

    return isDemo
    ? langData?.["demo_user"]
    : user?.fullname || user?.username;
  };

  const handleImgClick = () => {
    closeHandler && closeHandler();
    history.push('/home');
  };

  const setThemeHandler = (data) => {
    setTheme(data);
  };


  return (
    <div className={`side-header`}>
      <div className="sh-title">
        <button className="sh-website-title" onClick={() => handleImgClick()}>
          <img
            src={CONFIG.logo}
            alt=""
            className="sh-website-title-img"
          />
        </button>
        <button className="sh-button-icon" onClick={() => closeHandler()}>
          <Close className="sh-close-icon" />
        </button>
      </div>
      <div className="sh-menu">
        {loggedIn && (
          <div className="sh-username-img">
            <div className="short-name">{getUserShortName()}</div>
            <div className="sh-username">
              {getUsername()}
            </div>
          </div>
        )}
        <div className="sh-sub-menu">
          <SHSportsTab
            tabs={sideHeaderTabs}
            loggedIn={loggedIn}
            getCompetitionsBySport={getCompetitionsBySport}
            competitions={competitions}
            fetchEventsByCompetition={fetchEventsByCompetition}
            setCompetition={setCompetition}
            closeHandler={closeHandler}
            langData={langData}
          />
        </div>
        <div className="sh-sub-menu">
          <div className="sh-sub-title">{langData?.['other_menu']}</div>
          <SHTab
            tabs={otherMenuTabs}
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            closeHandler={closeHandler}
            langData={langData}
            languages={languages}
            langSelected={langSelected}
            setLangSelected={setLangSelected}
            setThemeHandler={setThemeHandler}
          />
        </div>

        <div className="sh-sub-menu">
          <div className="sh-sub-title">
            {langData?.['security_and_logout']}
          </div>
          <SHTab
            tabs={
              window.location.hostname.includes('fairplay')
                ? securityAndLogoutForFairplay
                : securityAndLogout
            }
            loggedIn={loggedIn}
            logout={() => logout()}
            closeHandler={closeHandler}
            langData={langData}
            setThemeHandler={setThemeHandler}
          />
        </div>
      </div>
      <div className="social-media-side-bar">
        <SocialMediaNew />
      </div>
    </div>
  );
};

const SHTab = (props: {
  tabs;
  loggedIn;
  logout?;
  domainConfig?: any;
  closeHandler: Function;
  setThemeHandler: Function;
  langSelected?: string;
  setLangSelected?: (lang: string) => void;
  langData: any;
  languages?: string[];
}) => {
  const {
    loggedIn,
    tabs,
    logout,
    domainConfig,
    closeHandler,
    langData,
    languages,
    langSelected,
    setLangSelected,
    setThemeHandler,
  } = props;
  const history = useHistory();
  const location = useLocation();

  const [showlanguages, setShowLanguages] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  const handleLangChange = (langParam: string) => {
    sessionStorage.setItem('lang', langParam);
    setLangSelected(sessionStorage.getItem('lang'));
    window.location.reload();
  };

  const handleClick = (indv) => {
    if (indv.id === 22) {
      logout();
      return;
    }
    if (indv.id == 26) {
      setShowLanguages(!showlanguages);
      return;
    }
    if (indv.id === 27) {
      setShowThemeMenu(!showThemeMenu);
      return;
    }
    closeHandler && closeHandler();
    history.push(indv.route);
  };

  const shouldShow = (indv) => {
    if (indv.id === 9 || indv.id === 10) {
      return (
        loggedIn &&
        domainConfig?.payments &&
        notDemoUser() &&
        domainConfig?.b2cEnabled
      );
    }
    if (indv.id === 18 || indv.id === 16) {
      return loggedIn && domainConfig?.bonus && domainConfig?.b2cEnabled;
    }
    if (indv.id === 13) {
      return loggedIn && domainConfig?.affiliate && domainConfig?.b2cEnabled;
    }
    if (indv.id === 25) {
      return (
        loggedIn &&
        domainConfig?.depositWagering &&
        domainConfig.b2cEnabled &&
        domainConfig.bonus
      );
    }
    if (indv.id === 24 || indv.id === 19) {
      return domainConfig?.b2cEnabled && domainConfig?.bonus;
    }
    if (indv.id === 27) {
      return CONFIG?.showThemes || false;
    }
    return indv.showWithoutLogin || loggedIn;
  };

  const isRouteActive = (route: string, id: number) => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // Parse the route to get pathname and query params
    const [routePath, routeQuery] = route.split('?');

    // First check if pathname matches
    if (currentPath !== routePath) {
      return false;
    }

    // Special handling for profile routes
    if (routePath === '/profile') {
      const currentTab = searchParams.get('tab');

      // My Profile (id: 21) - active when no tab param or tab is not 2
      if (id === 21) {
        return !currentTab || currentTab !== '2';
      }

      // Two Factor Authentication (id: 28) - active only when tab is 2
      if (id === 28) {
        return currentTab === '2';
      }
    }

    // For other routes with query params, check if they match
    if (routeQuery) {
      const routeParams = new URLSearchParams(routeQuery);
      for (const [key, value] of routeParams.entries()) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    // For routes without query params, ensure current location also has no query params
    return !location.search;
  };

  return (
    <>
      {tabs.map((indv, index) =>
          shouldShow(indv) && (
            
            <React.Fragment key={indv.id}>
              <button
                className={`${
                  isRouteActive(indv.route, indv.id) ? 'active-sh-btn' : ''
                } sh-btn`}
                onClick={() => handleClick(indv)}
                style={{ animation: indv.blink ? 'blink 1s infinite' : 'none' }}
              >
                <indv.img
                  className={`sh-img ${['logout', 'languages'].includes(indv.text.toLowerCase()) ? 'logout-icon' : ''}`}
                  alt=""
                />
                <div className="content">
                  <div className="sh-tab-label">
                    {indv.id == 26
                      ? langData?.[indv.langKey] +
                        ' : ' +
                        getLangCode(langSelected)
                      : langData?.[indv.langKey]}
                  </div>
                  {indv.id == 26 && (
                    <div>
                      {!showlanguages ? (
                        <ChevronRight className="arrow-img"></ChevronRight>
                      ) : (
                        <KeyboardArrowDown className="arrow-img"></KeyboardArrowDown>
                      )}
                    </div>
                  )}
                </div>
              </button>
              {indv.id === 26 && languages?.length > 0 && showlanguages && (
                <div className="lang-select-menu">
                  <div className="lang-menu">
                    {languages.map((language) => {
                      return (
                        <div
                         key={language} 
                          className="sh-btn"
                          onClick={() => handleLangChange(language)}
                        >
                          {language.replace('(', ' (')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </React.Fragment>
            
          )
      )}

      {showThemeMenu &&
        CONFIG?.showThemes && 
        themes.map((theme, index) => (
          <React.Fragment key={theme.themeName}>
            <div
              className="sh-btn"
              onClick={() => {
                localStorage.setItem('userTheme', theme.themeName);
                setThemeHandler(theme.themeName);
              }}
            >
              <img src={theme.image} />
              <span>{theme.name}</span>
            </div>
          </React.Fragment>
        ))}
    </>
  );
};

const SHSportsTab = (props: {
  tabs;
  loggedIn;
  logout?;
  getCompetitionsBySport;
  competitions;
  fetchEventsByCompetition;
  setCompetition;
  closeHandler;
  langData;
}) => {
  const {
    loggedIn,
    tabs,
    logout,
    getCompetitionsBySport,
    competitions,
    fetchEventsByCompetition,
    setCompetition,
    closeHandler,
    langData,
  } = props;
  const history = useHistory();
  const [selcompetition, setSelCompetition] = useState<any>(null);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [selSport, setSelSport] = useState<any>(null);

  const handleClick = (indv) => {
    // selSport && indv.id === selSport
    //   ? setShowDropDown(false)
    //   : setShowDropDown(true);
    setShowDropDown(!showDropDown);
    setSelSport(indv.id);
    getCompetitionsBySport(indv.id);
    history.push(indv.route);
  };

  const handleCompetitionClick = (indv, compt) => {
    setSelCompetition(compt.id);
    setCompetition({ id: compt.id, name: compt.name, slug: compt.slug });
    fetchEventsByCompetition(
      indv.id,
      compt.id,
      undefined,
      EXCH_COMPETITIONS_MENU
    );
    closeHandler && closeHandler();
    history.push(`/exchange_sports/${indv.text}/${compt.slug}`);
  };

  return (
    <>
      {tabs.map(
        (indv, index) =>
          (indv.showWithoutLogin || loggedIn) &&
          indv.langKey !== 'cock_fight' && (
            <React.Fragment key={index}>
            <>
              <button
                className={`${
                  window.location.pathname.includes(indv.route)
                    ? 'active-sh-btn'
                    : ''
                } sh-btn`}
                onClick={() => handleClick(indv)}
              >
                <indv.img className="sh-img" alt="" />
                <div className="sh-tab-label">{langData?.[indv.langKey]}</div>
              </button>
              {window.location.pathname?.includes(indv.route) &&
                showDropDown &&
                competitions?.map(
                  (competition) =>
                    indv.id === competition.sportId && (
                      <button
                        className={`indv-competition ${
                          selcompetition === competition.id
                            ? 'indv-competition-active'
                            : ''
                        }`}
                        onClick={() =>
                          handleCompetitionClick(indv, competition)
                        }
                      >
                        {competition.name}
                      </button>
                    )
                )}
            </>
            </React.Fragment>
          )
      )}
    </>
  );
};

const getCompetitionsByEventType = (competitions: any[], eventTypeId: string) => {
  return competitions[eventTypeId] ? competitions[eventTypeId] : null;
};

const mapStateToProps = (state: any) => {
  return {
    loggedIn: state.auth.loggedIn,
    competitions: getCompetitionsByEventType(
      state.homeMarkets.competitions,
      state.homeMarkets.selectedEventType.id,
    ),
    domainConfig: state.common.domainConfig,
    langData: state.common.langData,
    languages: state.common.languages,
    langSelected: state.common.langSelected,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
    fetchCompetitions: (eventTypeId: string) => dispatch(fetchCompetitions(eventTypeId)),
    fetchEventsByCompetition: (
      eventTypeId: string,
      competitionId: string,
      events: any[],
      track: string
    ) => dispatch(fetchEventsByCompetition({ eventTypeId, competitionId, events, track })),
    setCompetition: (competition: any) => dispatch(setCompetition(competition)),
    setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SideHeader);
