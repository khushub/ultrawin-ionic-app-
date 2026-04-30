import React from 'react';
import { makeStyles } from '@mui/styles';
// import { DcGameNew } from '../../models/dc/DcGame';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useHistory } from 'react-router';
// import { CasinoGameDTO } from '../../models/IndianCasinoState';
import { isMobile } from 'react-device-detect';
import CarouselComponent from '../../common/CarouselComponent/CarouselComponent';
import Slider from 'react-slick';

// const useStyles = makeStyles((theme) => ({
//   buttonContainer: {
//     position: 'relative',
//     width: '40px',
//     height: '40px',
//     borderRadius: '9px',
//     background: 'var(--carousel-arrow-btn)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     [theme.breakpoints.down('sm')]: {
//       width: '32px',
//       height: '32px',
//     },
//   },
//   prevButton: {
//     position: 'absolute',
//     top: '-58px',
//     right: '45px',
//     [theme.breakpoints.down('sm')]: {
//       top: '-48px',
//       right: '36px',
//     },
//   },
//   nextButton: {
//     position: 'absolute',
//     top: '-58px',
//     right: '0',
//     [theme.breakpoints.down('sm')]: {
//       top: '-48px',
//     },
//   },
//   icon: {
//     color: '#ffffff',
//     zIndex: 1, // Ensure the icon is above the gradient border
//   },
//   iconHeight: {
//     height: '12px',
//   },
// }));

export const SamplePrevArrow = ({ onClick }: any) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: { xs: '-48px', sm: '-58px' },
        right: { xs: '36px', sm: '45px' },
        width: { xs: '32px', sm: '40px' },
        height: { xs: '32px', sm: '40px' },
        borderRadius: '9px',
        background: 'var(--carousel-arrow-btn)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconButton sx={{ color: '#fff' }}>
        <ArrowBackIosNew sx={{ height: '12px' }} />
      </IconButton>
    </Box>
  );
};

export const SampleNextArrow = ({ onClick }: any) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: { xs: '-48px', sm: '-58px' },
        right: 0,
        width: { xs: '32px', sm: '40px' },
        height: { xs: '32px', sm: '40px' },
        borderRadius: '9px',
        background: 'var(--carousel-arrow-btn)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconButton sx={{ color: '#fff' }}>
        <ArrowForwardIos sx={{ height: '12px' }} />
      </IconButton>
    </Box>
  );
};

type StoreProps = {
  heading: string;
  displayHeader: string;
  trendingGames: any[];
  loggedIn: boolean;
  loggedInUserStatus: any;
  setCasinoGame: (cGame: any) => void;
  setDialogShow: Function;
};
const GamesCarousel: React.FC<StoreProps> = ({
  trendingGames,
  heading,
  displayHeader,
  loggedIn,
  loggedInUserStatus,
  setCasinoGame,
  setDialogShow,
}) => {

  // console.log('trendingGames: ', trendingGames);

  const settings = {
  responsive: [
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
  ],
  dots: false,
  autoplay: heading !== 'Live Casino Games',
  infinite: true,
  speed: 200,
  slidesToShow: isMobile ? 3 : 7,
  slidesToScroll: isMobile ? 3 : 1,
  arrows: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,

  // ❌ remove to="next"
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
};

  const history = useHistory();

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    provider: string,
    subProvider: string,
    superProvider: string
  ) => {
    console.log('Game clicked:', { gameId, gameName, gameCode, provider, subProvider, superProvider });
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

  return (
    <div
      className={`game-carousel-ctn ${heading === 'Recommended Games' ? 'mt-20' : ''}`}
    >
      {/* <div className="home-page-title">
        {heading}
      </div> */}
      <div className="border-shadow-container">
        <span className="text">{displayHeader}</span>
      </div>

      {heading === 'Popular Games' ? (
        <Slider {...settings}>
          {trendingGames?.map((game) => (
            <div
              key={game.gameId}
              onClick={() => {
                getGameUrl(
                  game?.gameId,
                  game?.gameName,
                  game?.gameCode,
                  game?.providerName,
                  game?.subProviderName,
                  game?.superProviderName
                );
              }}
            >
              <img
                className={'home-casino-img-slider'}
                src={
                  game?.trendingThumbnail
                    ? game?.trendingThumbnail
                    : game.urlThumb
                }
                loading="lazy"
                alt={game.gameName}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <CarouselComponent
          className="trending-games-slider"
          enableAutoScroll={heading === 'Popular Games'}
          scrollMode="smooth"
          pixelsPerSecond={50}
          isInfinite={true}
          // duplicateCount={4}
          // dependencies={[trendingGames]}
        >
          {trendingGames?.length > 0 &&
            trendingGames.map((game, idx) => (
              <img
                className="home-casino-img"
                src={
                  game?.trendingThumbnail
                    ? game?.trendingThumbnail
                    : game.urlThumb
                }
                loading="lazy"
                key={game.gameId + '-' + idx}
                alt={game.gameName}
                onClick={() => {
                  getGameUrl(
                    game?.gameId,
                    game?.gameName,
                    game?.gameCode,
                    game?.providerName,
                    game?.subProviderName,
                    game?.superProviderName
                  );
                }}
              />
            ))}
        </CarouselComponent>
      )}
    </div>
  );
};

export default GamesCarousel;
