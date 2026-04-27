import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
// import { RootState } from '../../../models/RootState';
import './CasinoIframeNew.scss';
import { isMobile, isIOS } from 'react-device-detect';
import LoadingPage from '../../LoadingPage/index';
// import SVLS_API from '../../../svls-api';

type StoreProps = {
  gameUrl: string;
  loggedIn: boolean;
  token: string;
};

type RouteParams = {
    gamePath: string;
};

const CasinoIframeNew: React.FC<StoreProps> = (props) => {
    const [gameSrc, setGameSrc] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

   const { loggedIn, token } = props;

    const { gamePath } = useParams<RouteParams>();

    console.log('Received gamePath:', gamePath);
    const history = useHistory();

    const locationState: any = useLocation().state;



    useEffect(() => {
        document.getElementsByClassName('router-ctn')[0].scrollIntoView();
    }, []);

    const getGameUrl = async (
        // gameId: string,
        // gameCode: string,
        // provider: string,
        // subProvider: string,
        // superProvider: string
        gameId: string,
        gameName: string,
        provider: string
    ) => {
        if (loggedIn) {
            setLoading(true);
            // const claims = sessionStorage.getItem('jwt_token').split('.')[1];
            // const userStatus = JSON.parse(window.atob(claims)).status;
            if (!token) {
  history.replace('/login');
  return;
}

const claims = token.split('.')[1];
const userStatus = JSON.parse(window.atob(claims)).status;

            if (userStatus === 0 || userStatus === 3) {
                return history.push(`/home`);
            }

            // if (provider.toLocaleLowerCase() === 'ezugi') {
            //   let response;
            try {
                // const reqBody = {
                //   gameId: gameId,
                //   gameCode: gameCode,
                //   providerName: provider,
                //   subProviderName: subProvider,
                //   platformId: isMobile ? 'mobile' : 'desktop',
                //   superProviderName: superProvider,
                //   redirectUrl: window.location.origin,
                // };
                // response = await SVLS_API.post(
                //   '/catalog/v2/live-casino/game-url',
                //   reqBody,
                //   {
                //     headers: {
                //       Authorization: sessionStorage.getItem('jwt_token'),
                //     },
                //   }
                // );

                const launchUrl = locationState?.launchUrl;
                if (isMobile && isIOS) {
                    window.location.href = launchUrl;
                } else {
                    setGameSrc(launchUrl);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }

        } else {
            history.push(`/`);
        }
    };

    useEffect(() => {
        // const gameId = atob(gamePath.split('-')[gamePath.split('-').length - 5]);
        // const gameCode = atob(gamePath.split('-')[gamePath.split('-').length - 4]);
        // const provider = atob(gamePath.split('-')[gamePath.split('-').length - 3]);
        // const subProvider = atob(
        //   gamePath.split('-')[gamePath.split('-').length - 2]
        // );
        // const superProvider = atob(
        //   gamePath.split('-')[gamePath.split('-').length - 1]
        // );

        // const gameName = locationState?.gameName;
        // saveLastPlayedGameDetails({
        //   gameId,
        //   gameName,
        //   gameCode,
        //   provider,
        //   subProvider,
        //   superProvider,
        // });
        // getGameUrl(gameId, gameCode, provider, subProvider, superProvider);

        if (!gamePath) return;

        const pathParts = gamePath.split('-');
        const encodedGameId = pathParts[pathParts.length - 1];

        const gameId = atob(encodedGameId);
        const gameName = locationState?.gameName || '';
        const provider = locationState?.provider || '';

        saveLastPlayedGameDetails({
            gameId,
            gameName,
            provider
        });

        getGameUrl(gameId, gameName, provider);

    }, []);

    const saveLastPlayedGameDetails = (newGame) => {
        const existingGames =
            JSON.parse(localStorage.getItem('recent_games')) || [];
        if (
            existingGames.length > 0 &&
            existingGames[0].gameId === newGame.gameId
        ) {
            return;
        }
        existingGames.unshift(newGame);
        const updatedGames = existingGames.slice(0, 3);
        localStorage.setItem('recent_games', JSON.stringify(updatedGames));
    };



    return (
        <div className="dc-iframe-ctn">
            <div id="loader" className="center"></div>
            {loading ? (
                <LoadingPage />
            ) : (
                <iframe
                    src={gameSrc}
                    title="DC game"
                    allowFullScreen
                    sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                ></iframe>
            )}
        </div>
    );
};

const mapStateToProps = (state: any) => {
   return {
  gameUrl: state.common.dcGameUrl,
  loggedIn: state.auth.loggedIn,
  token: state.auth.token,
};
};

export default connect(mapStateToProps)(CasinoIframeNew);
