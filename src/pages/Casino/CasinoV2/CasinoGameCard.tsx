import React from 'react';
import useLazyLoad from './useLaztLoad';

interface CasinoGameCardProps {
  index: number;
  game: {
    gameId?: string;
    gameName?: string;
    urlThumb?: string;
    gameCode?: string;
    subProviderName?: string;
    providerName?: string;
    superProviderName?: string;

    // API response keys
    game_id?: string;
    game_name?: string;
    url_thumb?: string;
    game_code?: string;
    sub_provider_name?: string;
    provider_name?: string;
    super_provider_name?: string;
  };
  handleGameClick: (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProviderName: string,
    providerName: string,
    superProviderName: string
  ) => void;
}

const CasinoGameCard: React.FC<CasinoGameCardProps> = ({
  game,
  handleGameClick,
  index,
}) => {
  // console.log('Rendering CasinoGameCard for game: ', game);

  // console.log('Rendering game card: ', game);
  const isLazy = index > 10;
  const { isVisible, elementRef } = useLazyLoad(isLazy);

  // camelCase + snake_case dono support
  const gameId = game.gameId || game.game_id || '';
  const gameName = game.gameName || game.game_name || '';
  const urlThumb = game.urlThumb || game.url_thumb || '';
  const gameCode = game.gameCode || game.game_code || '';
  const subProviderName =
    game.subProviderName || game.sub_provider_name || '';
  const providerName = game.providerName || game.provider_name || '';
  const superProviderName =
    game.superProviderName || game.super_provider_name || '';

  return (
    <div ref={elementRef} className="casino-game-card">
      {isVisible || !isLazy ? (
        <img
          loading="lazy"
          alt={gameName}
          className="casino-game-image"
          src={game.url_thumb || game.urlThumb}
          title={gameName}
      onClick={() =>
  handleGameClick(
    // ✅ camelCase pehle check karo (recent games), phir snake_case (API games)
    game.gameId || game.game_id || '',
    game.gameName || game.game_name || '',
    game.gameCode || game.game_code || '',
    game.subProviderName || game.sub_provider_name || '',
    game.providerName || game.provider_name || '',
    game.superProviderName || game.super_provider_name || '',
    game.urlThumb || game.url_thumb || ''
  )
}
        />
      ) : (
        <div className="casino-game-placeholder">Loading...</div>
      )}
    </div>
  );
};

export default CasinoGameCard;