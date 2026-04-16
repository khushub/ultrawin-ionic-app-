import React, { useEffect, useState } from 'react';
// import { any } from '../../models/dc/DcGame';
// import { RootState } from '../../models/RootState';
import { setTrendingGames } from '../../store/slices/commonSlice';
import { connect } from 'react-redux';
// import { getCurrencyTypeFromToken } from '../../store';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import { useHistory } from 'react-router';
import { AxiosResponse } from 'axios';
// import SVLS_API from '../../svls-api';

import { NavLink } from 'react-router-dom';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { Skeleton } from '@mui/material';

type TrendingProps = {
  trendingGames: any[];
  loggedIn: boolean;
  loggedInUserStatus: any;
  setTrendingGames: Function;
  langData: any;
};

const TrendingGames: React.FC<TrendingProps> = (props) => {
  const {
    trendingGames,
    loggedIn,
    loggedInUserStatus,
    setTrendingGames,
    langData,
  } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const history = useHistory();

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

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

  const getTrendingGames = async () => {
    // let response: AxiosResponse;
    // response = await SVLS_API.get(
    //   '/catalog/v2/categories/indian-casino/games/',
    //   {
    //     params: {
    //       providerId: 'MAC88,DC',
    //       trending: true,
    //       subProviderId: '',
    //     },
    //   }
    // );

    // let trendingGames = response?.data?.filter(
    //   (game) => game?.tag == 'new_launch'
    // );
  const rulesData = [
    {
      gameId: '1',
      gameName: 'Cricket Rules',
      gameCode: 'CRICKET',
      providerName: 'Rules',
      subProviderName: 'Rules',
      superProviderName: 'Rules',
      urlThumb:
        'https://via.placeholder.com/250x140.png?text=Cricket+Rules',
    },
    {
      gameId: '2',
      gameName: 'Football Rules',
      gameCode: 'FOOTBALL',
      providerName: 'Rules',
      subProviderName: 'Rules',
      superProviderName: 'Rules',
      urlThumb:
        'https://via.placeholder.com/250x140.png?text=Football+Rules',
    },
    {
      gameId: '3',
      gameName: 'Casino Rules',
      gameCode: 'CASINO',
      providerName: 'Rules',
      subProviderName: 'Rules',
      superProviderName: 'Rules',
      urlThumb:
        'https://via.placeholder.com/250x140.png?text=Casino+Rules',
    },
    {
      gameId: '4',
      gameName: 'Live Betting Rules',
      gameCode: 'LIVE',
      providerName: 'Rules',
      subProviderName: 'Rules',
      superProviderName: 'Rules',
      urlThumb:
        'https://via.placeholder.com/250x140.png?text=Live+Betting',
    },
  ];

    setTrendingGames(rulesData);
  };

  useEffect(() => {
    getTrendingGames();
  }, []);

  const handleGameClick = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProvider: string,
    provider?: string,
    superProvider?: string
  ) => {
    if (
    //   getCurrencyTypeFromToken() === 0 &&
      !(
        provider?.toLocaleLowerCase() === 'ezugi' ||
        subProvider === 'BetGames.TV' ||
        subProvider === 'Pragmatic Play' ||
        subProvider === 'Onetouch Live' ||
        subProvider === 'OneTouch' ||
        provider === 'RG'
      )
    ) {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    } else {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    }
  };

  return (
    <div className="trending-games-ctn">
      <div className="trending-game-heading">
        <div>{langData?.['trending_games']}</div>
        <NavLink className="see-more" to={`/casino`}>
          {langData?.['see_more']} <ChevronRightOutlinedIcon />{' '}
        </NavLink>
      </div>
      <div className="games-container">
        {trendingGames
          ? trendingGames?.map((game) => (
              <div className="trending-game-card">
                <img
                  loading="lazy"
                  src={
                    game?.trendingThumbnail
                      ? game?.trendingThumbnail
                      : game?.urlThumb
                  }
                  // alt={game?.gameName}
                  onClick={() =>
                    handleGameClick(
                      game?.gameId,
                      game?.gameName,
                      game?.gameCode,
                      game?.subProviderName,
                      game?.providerName,
                      game?.superProviderName
                    )
                  }
                />
              </div>
            ))
          : Array.from({ length: 16 }).map((_) => (
              <div className="trending-game-card">
                <Skeleton height={120} />
              </div>
            ))}
      </div>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">Notice</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            Access required for gameplay. Please log in to proceed.
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            className="cancel-btn dialog-action-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              history.push('/login');
              setDialogShow(false);
            }}
            className="login-btn dialog-action-btn"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  let status = 0;
  if (state.auth.loggedIn) {
    status = JSON.parse(
      window.atob(sessionStorage.getItem('jwt_token').split('.')[1])
    ).status;
  }
  return {
    loggedIn: state.auth.loggedIn,
    trendingGames: state.common.trendingGames,
    loggedInUserStatus: status,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTrendingGames: (value) => dispatch(setTrendingGames(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrendingGames);
