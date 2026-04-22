import React, { useEffect, useState } from 'react';
import { setTrendingGames } from '../../store/slices/commonSlice';
import { connect } from 'react-redux';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import { useHistory } from 'react-router';
import { NavLink } from 'react-router-dom';
import { ChevronRightOutlined } from '@mui/icons-material';
import { Skeleton } from '@mui/material';


type TrendingProps = {
  trendingGames: any[];
  loggedIn: boolean;
  setTrendingGames: Function;
  langData: any;
};

const TrendingGames: React.FC<TrendingProps> = (props) => {
  const {
    trendingGames,
    loggedIn,
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
    const jsonModule = await import('../../assets/api_json/trending-games.json');
    const rawGamesData = jsonModule.default;
    const trendingGames = rawGamesData?.filter((game) => game?.tag == 'new_launch');
    setTrendingGames(trendingGames);
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
          {langData?.['see_more']} <ChevronRightOutlined />{' '}
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
  return {
    loggedIn: state.auth.loggedIn,
    trendingGames: state.common.trendingGames,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTrendingGames: (value) => dispatch(setTrendingGames(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrendingGames);
