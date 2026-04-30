import { Skeleton, Card } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import Lottie from 'lottie-react';
// import LANG_API from '../../api-services/language-api';
import { makeStyles } from '@mui/styles';
import { isMobile } from 'react-device-detect';
import marbleRun from '../../assets/lottie_json/marble_run.json';
import aviator from '../../assets/lottie_json/aviator.json';
import mines from '../../assets/lottie_json//minws.json';
import chickenGames from '../../assets/lottie_json/chicken_game.json';
import colorPrediction from '../../assets/lottie_json/color_prediction.json';
import livePrediction from '../../assets/lottie_json/live_prediction.json';


const useStyles = makeStyles((theme) => ({
  sitesInfo: {
    color: '#ffffff',
    marginTop: '4px',
  },
  cardContent: {
    background: 'linear-gradient(284.37deg, #094145 -213.61%, #212E44 99.84%)',
    color: '#fff',
    padding: '16px 18px',
    marginTop: '-10px',
    position: 'relative',
    borderRadius: '0 0 16px 16px',
  },
}));

function SitesInfo({
  loggedIn,
  loggedInUserStatus,
  setCasinoGame,
  setDialogShow,
  langData,
}) {
  const [gifs, setGifs] = useState<any>();
  const classes = useStyles();
  const history = useHistory();

  const sections = [
    {
      title: 'Aviator X',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '151027',
        providerName: 'AVIATOR',
        // providerName: 'MAC88',
        subProviderName: 'Monk88',
        superProviderName: 'MACHUB',
        platformId: 'desktop',
        gameCode: 'MAC88-CAV101-VR',
        gameName: 'Aviator X',
      },
      bannerInfo: {
        loop: true,
        path: '/casino',
        category: 'All',
        autoplay: true,
        animationData: gifs?.aviator,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },
    {
      title: 'Bombay Live',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '151187',
        providerName: 'MAC88',
        subProviderName: 'Mac88 Gaming Virtual',
        superProviderName: 'MACHUB',
        platformId: 'desktop',
        gameCode: 'MAC88-CMR101',
        gameName: 'Marble Run',
      },
      bannerInfo: {
        loop: true,
        path: '/login',
        autoplay: true,
        category: 'Marble Run',
        animationData: gifs?.marble_run,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },
    // {
    //   title: '100% Bonus',
    //   content: 'Lorem ipsum dolor sit amet...',

    //   gameInfo: {
    //     gameId: '230275',
    //     providerName: 'DC',
    //     subProviderName: 'Turbogames',
    //     superProviderName: 'GAP',
    //     platformId: 'desktop',
    //     gameCode: 'tbg_vortex',
    //     gameName: 'VORTEX',
    //   },
    //   bannerInfo: {
    //     loop: true,
    //     path: '/login',
    //     autoplay: true,
    //     animationData: gifs?.vortex,
    //     rendererSettings: {
    //       preserveAspectRatio: 'xMidYMid slice',
    //     },
    //   },
    // },
    {
      title: 'Color game',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '825521',
        providerName: 'INPLM',
        subProviderName: 'Evolution',
        superProviderName: 'MACHUB',
        platformId: 'desktop',
        gameCode: 'evo_marble_race',
        gameName: 'color game',
      },
      bannerInfo: {
        loop: true,
        path: '/casino',
        category: 'color game',
        autoplay: true,
        animationData: gifs?.chicken_games,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },
    {
      title: 'Color game',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '151054',
        providerName: 'MAC88',
        subProviderName: 'Monk88',
        superProviderName: 'MACHUB',
        platformId: 'desktop',
        gameCode: 'MAC88-CWI101',
        gameName: 'color game',
      },
      bannerInfo: {
        loop: true,
        path: '/casino',
        category: 'color game',
        autoplay: true,
        animationData: gifs?.color_prediction,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },
    {
      title: 'Vortex',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '151099',
        providerName: 'MAC88',
        subProviderName: 'Fun Games',
        superProviderName: 'MACHUB',
        platformId: 'desktop',
        gameCode: 'tbg_vortex',
        gameName: 'live_prediction',
      },
      bannerInfo: {
        loop: true,
        path: '/login',
        category: 'live_prediction',
        autoplay: true,
        animationData: gifs?.live_prediction,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },

    {
      title: 'Mines',
      content: 'Lorem ipsum dolor sit amet...',

      gameInfo: {
        gameId: '230250',
        providerName: 'TURBO',
        subProviderName: 'Turbogames',
        superProviderName: 'GAP',
        platformId: 'desktop',
        gameCode: 'tbg_mines',
        gameName: 'mines',
      },
      bannerInfo: {
        loop: true,
        path: '/casino',
        category: 'Slot Games',
        autoplay: true,
        animationData: gifs?.mines,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      },
    },
  ];

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    provider: string,
    subProvider: string,
    superProvider: string
  ) => {
    if (loggedIn) {
      // status check
      if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
        history.push(`/home`);
      }
      if (provider === 'Indian Casino') {
        setCasinoGame({ id: gameCode, name: gameName });
        history.push(`/casino/indian/${gameCode}`);
      } else {
        history.push({
          pathname: `/dc/gamev1.1/${gameName?.toLowerCase().replace(/\s+/g, '-')}-${btoa(
            gameId?.toString()
          )}-${btoa(gameCode)}-${btoa(provider)}-${btoa(subProvider)}-${btoa(superProvider)}`,
          state: { gameName },
        });
      }
    } else {
      setDialogShow(true);
    }
  };

const fetchJson = async () => {
  setGifs({
    marble_run: marbleRun,
    mines: mines,
    chicken_games: chickenGames,
    aviator: aviator,
    color_prediction: colorPrediction,
    live_prediction: livePrediction,
  });
};

  useEffect(() => {
    fetchJson();
  }, []);

  return (
    <div className={classes.sitesInfo}>
      <div className="border-shadow-container trending-border-games">
        <span className="text">{langData?.['trending_games']}</span>
      </div>
      <div className="site-info-grid">
        {sections?.slice(0, 3).map((section) => (
          <div key={section.title} className="site-info-card">
            <Card
              onClick={() => {
                if (
                  ['Aviator X', 'Mines'].includes(section.gameInfo.gameName)
                ) {
                  getGameUrl(
                    section?.gameInfo?.gameId,
                    section?.gameInfo?.gameName,
                    section?.gameInfo?.gameCode,
                    section?.gameInfo?.providerName,
                    section?.gameInfo?.subProviderName,
                    section?.gameInfo?.superProviderName
                  );
                } else if (section.bannerInfo.category === 'live_prediction') {
                  history.push(
                    '/casino?provider=MAC88%20&category=Casual%20Games'
                  );
                } else if (section.gameInfo.gameName === 'color game') {
                 history.push({
  pathname: '/casino',
  search: `?provider=TURBO&category=${encodeURIComponent('Casual Games')}`,
});
                } else if (section.bannerInfo.category === 'mac_excite') {
                  history.push('/casino?provider=MAC%20EXCITE&category=ALL');
                } else {
                  getGameUrl(
                    section?.gameInfo?.gameId,
                    section?.gameInfo?.gameName,
                    section?.gameInfo?.gameCode,
                    section?.gameInfo?.providerName,
                    section?.gameInfo?.subProviderName,
                    section?.gameInfo?.superProviderName
                  );
                }
              }}
            >
              <div className="site-card-img">
                {section.bannerInfo?.animationData ? (
               <Lottie
  animationData={section.bannerInfo.animationData}
  loop={true}
 
/>
                ) : (
                  <div>
                    <Skeleton
                      height={isMobile ? 100 : 140}
                      style={{
                        backgroundColor: 'var(--ion-color-primary)',
                        opacity: 0.1,
                      }}
                    />
                    <Skeleton
                      height={20}
                      animation="wave"
                      style={{
                        backgroundColor: 'var(--ion-color-primary)',
                        opacity: 0.1,
                        marginTop: '5px',
                      }}
                    />
                  </div>
                )}
              </div>
              {/* <CardContent className={classes.cardContent}>
                                <div className='site-card-title'>
                                    {section.title}
                                </div>
                                <div className="site-card-content">
                                    {section.content}
                                </div>
                            </CardContent> */}
            </Card>
          </div>
        ))}
      </div>
      <div className="site-info-grid mt-6 ">
        {sections?.slice(3, 6).map((section) => (
          <div key={section.title} className="site-info-card">
            <Card
              onClick={() => {
                if (
                  ['Aviator X', 'mines'].includes(section.gameInfo.gameName)
                ) {
                  history.push({
                    pathname: section.bannerInfo.path,
                    search: `?provider=${section.gameInfo.providerName}&category=${encodeURIComponent(section.bannerInfo.category)?.toLowerCase()}`,
                  });
                } else if (section.bannerInfo.category === 'live_prediction') {
                 history.push({
  pathname: '/casino',
  search: `?provider=${encodeURIComponent('MAC88')}&category=${encodeURIComponent('Casual Games')}`,
});
                } else if (section.gameInfo.gameName === 'color game') {
                 history.push({
  pathname: '/casino',
  search: `?provider=MAC88&category=${encodeURIComponent('Color Game')}`,
});
                } else if (section.bannerInfo.category === 'mac_excite') {
                  history.push('/casino?provider=MAC%20EXCITE&category=ALL');
                } else {
                  getGameUrl(
                    section?.gameInfo?.gameId,
                    section?.gameInfo?.gameName,
                    section?.gameInfo?.gameCode,
                    section?.gameInfo?.providerName,
                    section?.gameInfo?.subProviderName,
                    section?.gameInfo?.superProviderName
                  );
                }
              }}
            >
              <div className="site-card-img">
                {section.bannerInfo?.animationData ? (
                <Lottie
  animationData={section.bannerInfo.animationData}
  loop={true}
/>
                ) : null}
              </div>
              {/* <CardContent className={classes.cardContent}>
                                <div className='site-card-title'>
                                    {section.title}
                                </div>
                                <div className="site-card-content">
                                    {section.content}
                                </div>
                            </CardContent> */}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SitesInfo;
