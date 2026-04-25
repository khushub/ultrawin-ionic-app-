import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { DcGameNew } from '../../../models/dc/DcGame';
import { postAPIAuth } from '../../../services/apiInstance';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useCasinoHook = () => {
  const { user } = useSelector((state: any) => state.auth);
  const currencyType = user?.currencyType || 0;
  const history = useHistory();
  const loggedIn = useSelector((state: any) => state.auth.loggedIn);
  let loggedInUserStatus = 0;

  const { langData } = useSelector((state: any) => state.common);
  const [searchTerm, setSearchTerm] = useState('');
  const { pathname } = useLocation();
  const searchParams = useQuery();
  let providerRefs = useRef<Record<string, HTMLElement | null>>({});
  let categoryRefs = useRef({});

  const categoryFromParams = searchParams?.get('category');
  let providerFromParams = searchParams?.get('provider');

  const [dialogShow, setDialogShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  


  const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>({});

 
  const [gameInfo, setGameInfo] = useState<Record<string, Record<string, any[]>>>({});
  const [recentGames, setRecentGames] = useState<any[]>([]);

const subProviderList = [
  'All',
  'Recent',
  'MAC88',
  'KINGMIDAS',
  'CRASH88',
  'SPRIBE',
  'SUNO',
  'AVIATOR',
  'AWC',
  'BETCORE',
  'BETGAMES',
  'CREED',
  'DC',
  'DRGS',
  'EZUGI',
  'GAPLOBBY',
  'JACKTOP',
  'JILI',
  'MACAW',
  'MARBLES',
  'PINKY',
  'RANDORA',
  'RG',
  'RICH88',
  'SAP',
  'TURBO',
];


  const categoryList: string[] =
  providerFromParams === 'Recent'
    ? []
    : providerFromParams === 'All'
    ? ['All', ...new Set(Object.values(categoryMap).flat())]
    : categoryMap[providerFromParams] ?? [];

  
 const filteredGames: any[] =
  providerFromParams === 'Recent'
    ? recentGames
    : providerFromParams === 'All'
    ? Object.values(gameInfo)
        .flatMap((provider: any) => Object.values(provider).flat())
    : categoryFromParams === 'All'
    ? Object.values(gameInfo?.[providerFromParams] || {}).flat()
    : gameInfo?.[providerFromParams]?.[categoryFromParams] ?? [];


const gameListDisplay = filteredGames
  .filter((game) =>
    (game?.gameName || game?.game_name || '')
      .toLowerCase()
      .includes(searchTerm?.toLowerCase())
  )
  .filter(
    (game, index, self) =>
      index ===
      self.findIndex(
        (g) =>
          (g.gameId || g.game_id) ===
          (game.gameId || game.game_id)
      )
  );

  const setCategoryParam = (
    category: string,
    provider?: string,
    replace: boolean = false
  ) => {
    const prov = provider ?? providerFromParams;
    const navigationMethod = replace ? history.replace : history.push;
    navigationMethod({
      pathname: '/casino',
      search: `?provider=${prov}&category=${category}`,
    });
  };

  const setProviderParam = (provider: string, replace: boolean = false) => {
    const navigationMethod = replace ? history.replace : history.push;
    navigationMethod({
      pathname: '/casino',
      search: `?provider=${provider}&category=`,
    });
  };

  const fetchCategories = async (provider: string) => {
    if (provider === 'All') {
  setCategoryParam('All', 'All');
  return;
}
    if (categoryMap[provider]) {
      const firstCategory = categoryMap[provider][0];
      setCategoryParam(firstCategory, provider);
      return;
    }

    try {
      setLoading(true);

      console.log('Fetching categories for provider: ', provider);

    
      const response = await postAPIAuth('getGapCategoryAPI', {
        providerName: provider,
      });

      const categories: string[] = response?.data?.data ?? [];

      setCategoryMap((prev) => ({
        ...prev,
        [provider]: categories,
      }));

      if (categories.length > 0) {
        setCategoryParam(categories[0], provider);
      }
    } catch (err) {
      console.error('fetchCategories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async (provider: string, category: string) => {
    if (gameInfo?.[provider]?.[category]) {
      setCategoryParam(category, provider);
      return;
    }

    try {
      setLoading(true);
      const response = await postAPIAuth('getGapGamesAPI', {
        provider,
        category,
      });

      // response.data.data = [{ game_name, game_id, game_code, ... }]
      const games: any[] = response?.data?.data ?? [];

      setGameInfo((prev) => ({
        ...prev,
        [provider]: {
          ...(prev?.[provider] ?? {}),
          [category]: games,
        },
      }));

      setCategoryParam(category, provider);
    } catch (err) {
      console.error('fetchGames error:', err);
    } finally {
      setLoading(false);
    }
  };

 const handleCasinoSubProviderBlockClick = (
  subProviderName: string
) => {
  setProviderParam(subProviderName);

  if (subProviderName === 'All') {
    return;
  }

  if (subProviderName === 'Recent') {
  const savedRecent =
    JSON.parse(localStorage.getItem('recentCasinoGames') || '[]');

  setRecentGames(savedRecent);
  setProviderParam('Recent');
  return;
}

  fetchCategories(subProviderName);
};

  const handleCasinoCategoryClick = (categoryName: string) => {
  if (categoryName === 'All') {
    setCategoryParam('All', providerFromParams);
    return;
  }

  fetchGames(providerFromParams, categoryName);
};

//  const loggedInUserStatus = user?.status ?? user?.userStatus ?? 1;

// const loggedInUserStatus = user?.status ?? user?.userStatus ?? 1;

const getGameUrl = async (
  gameId: string,
  gameName: string,
  gameCode: string,
  provider: string,
  subProvider: string,
  superProvider: string
) => {
  if (!loggedIn) {
    setDialogShow(true);
    return;
  }

  // if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
  //   history.push('/home');
  //   return;
  // }

  try {
    setLoading(true);

    // provider hi superProvider hoga
    const providerName = provider || superProvider || '';

    const response = await postAPIAuth('UserloginToGapApi', {
      gameId: gameId,
      providerName: providerName,
    });
    console.log('launchGapGameApi response: ', response);

    const launchUrl =
      response?.data?.data?.url ||
      response?.data?.data?.gameUrl ||
      response?.data?.url ||
      response?.data?.launchUrl;

    if (launchUrl) {
      window.location.href = launchUrl;
      return;
    }

    // fallback old route
    const slug = (gameName || 'game')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    history.push({
      pathname: `/dc/gamev1.1/${slug}-${btoa(gameId)}-${btoa(
        gameCode || ''
      )}-${btoa(providerName)}-${btoa(subProvider || '')}-${btoa(
        superProvider || ''
      )}`,
      state: { gameName },
    });
  } catch (error) {
    console.error('launchGapGameApi error:', error);
  } finally {
    setLoading(false);
  }
};


  // Hook mein getGameUrl call fix karo
const handleGameClickNavigation = async (
  gameId: string,
  gameName: string,
  gameCode: string,
  subProvider: string,
  provider?: string,
  superProvider?: string
) => {
  getGameUrl(
    gameId,
    gameName,
    gameCode,
    provider || '',
    subProvider,
    superProvider || ''
  );
};

const handleGameClick = (
  gameId?: string,
  gameName?: string,
  gameCode?: string,
  subProvider?: string,
  provider?: string,
  superProvider?: string,
  url_thumb?: string
) => {

  const clickedGame = {
    gameId: gameId || '',
    gameName: gameName || '',
    gameCode: gameCode || '',
    subProviderName: subProvider || '',
    providerName: provider || '',
    superProviderName: superProvider || '',
    urlThumb: url_thumb || '',
  };

  // ✅ Recent games localStorage mein save karo
  const oldRecent = JSON.parse(localStorage.getItem('recentCasinoGames') || '[]');
  const updatedRecent = [
    clickedGame,
    ...oldRecent.filter((item: any) => item.gameId !== gameId),
  ].slice(0, 20);
  localStorage.setItem('recentCasinoGames', JSON.stringify(updatedRecent));
  setRecentGames(updatedRecent);

  handleGameClickNavigation(
    gameId || '',
    gameName || '',
    gameCode || '',
    subProvider || '',
    provider || '',
    superProvider || ''
  );
};
  const onClear = () => setSearchTerm('');

  useEffect(() => {
    const defaultProvider = providerFromParams || 'MAC88';
    fetchCategories(defaultProvider);
  }, [pathname]);
  useEffect(() => {
    if (
      providerFromParams &&
      categoryFromParams &&
      !gameInfo?.[providerFromParams]?.[categoryFromParams]
    ) {
      fetchGames(providerFromParams, categoryFromParams);
    }
  }, [categoryFromParams, providerFromParams]);

  // Scroll to selected provider
  useEffect(() => {
    setTimeout(() => {
      const el = providerRefs.current[providerFromParams];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }, [providerFromParams]);

  // Scroll to selected category
  useEffect(() => {
    setTimeout(() => {
      if (categoryFromParams && categoryRefs.current[categoryFromParams]) {
        categoryRefs.current[categoryFromParams].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 500);
  }, [categoryFromParams]);

  return {
    dialogShow,
    setDialogShow,
    handleGameClick,
    categoryFromParams,
    handleCasinoSubProviderBlockClick,
    gameInfo,
    subProviderList,
    categoryList,       
    gameListDisplay,    
    providerFromParams,
    handleCasinoCategoryClick,
    langData,
    searchTerm,
    setSearchTerm,
    onClear,
    providerRefs,
    categoryRefs,
    loading,
  };
};