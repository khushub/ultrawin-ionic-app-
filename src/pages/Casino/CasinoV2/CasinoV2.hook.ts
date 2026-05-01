import { useEffect, useRef, useState } from 'react';
// import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { DcGameNew } from '../../../models/dc/DcGame';
import { postAPIAuth } from '../../../services/apiInstance';
import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../../store/slices/commonSlice"; // path adjust kar lena


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
  const dispatch = useDispatch();
  const [recentGames, setRecentGames] = useState<any[]>([]);

  const { availableEventTypes } = useSelector(
  (state: any) => state.userDetails
);

console.log('Available Event Types:', availableEventTypes);

  

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
    'JiLi',
    'MACAW',
    'MARBLES',
    'PINKY',
    'RANDORA',
    'RG',
    'RICH88',
    'SAP',
    'TURBO',
  ];


  // const categoryList: string[] =
  //   providerFromParams === 'Recent'
  //     ? []
  //     : providerFromParams === 'All'
  //       ? [...new Set(Object.values(categoryMap).flat())]
  //       : categoryMap[providerFromParams] ?? [];

  const categoryList =
    providerFromParams === 'Recent'
      ? []
      : ['All', ...(categoryMap[providerFromParams] ?? [])];

  const filteredGames: any[] =
  providerFromParams === 'Recent'
    ? recentGames
    : gameInfo?.[providerFromParams]?.[categoryFromParams] ?? [];


 const gameListDisplay = filteredGames.filter(
  (game, index, self) => {
    const gameName = (game?.gameName || game?.game_name || '').toLowerCase();
    const gameId = game?.gameId || game?.game_id;

    const matchSearch = gameName.includes(searchTerm.toLowerCase());

    const uniqueGame =
      index === self.findIndex(
        (item) =>
          (item?.gameId || item?.game_id) === gameId
      );

    return matchSearch && uniqueGame;
  }
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
      search: `?provider=${provider}`,
    });
  };

  const fetchCategories = async (provider: string) => {

    if (!loggedIn) {
      history.replace("/login");
      return;
    }
  if (categoryMap[provider]) {
  const validCategory = categoryMap[provider]?.includes(categoryFromParams);

  setCategoryParam(
    validCategory ? categoryFromParams : 'All',
    provider,
    true
  );
  return;
}

    try {
      setLoading(true);

      const response = await postAPIAuth('getGapCategoryAPI', {
        providerName: provider,
      });

      const categories: string[] = response?.data?.data ?? [];
      setCategoryMap((prev) => ({
        ...prev,
        [provider]: categories,
      }));

      // if (categories.length > 0) {
      //   setCategoryParam(categories[0], provider, true);
      // } else {
      //   setCategoryParam('', provider, true);
      // }
      // setCategoryParam('All', provider, true);

      const normalize = (str) => str?.toLowerCase().trim();

const matchedCategory = categories.find(
  (cat) => normalize(cat) === normalize(categoryFromParams)
);

setCategoryParam(
  matchedCategory || 'All',
  provider,
  true
);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 const fetchGames = async (provider: string, category: string) => {
  if (!loggedIn) {
    history.replace('/login');
    return;
  }

  if (gameInfo?.[provider]?.[category]) {
    setCategoryParam(category, provider);
    return;
  }

  try {
    setLoading(true);

    const payload =
      category === 'All' ? {
           providerName: provider,
            page: 1,
            limit: 2000,
          } : {
            providerName: provider,
            category,
            page: 1,
            limit: 2000,
          };

    const response = await postAPIAuth('getGapGamesAPI', payload);

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

  const handleCasinoSubProviderBlockClick = (subProviderName: string) => {

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

    fetchGames(providerFromParams, categoryName);
  };

  //  const loggedInUserStatus = user?.status ?? user?.userStatus ?? 1;

  // const loggedInUserStatus = user?.status ?? user?.userStatus ?? 1;

  // const getGameUrl = async (
  //   gameId: string,
  //   gameName: string,
  //   gameCode: string,
  //   provider: string,
  //   subProvider: string,
  //   superProvider: string
  // ) => {
  //   if (!loggedIn) {
  //     setDialogShow(true);
  //     return;
  //   }

  //   // if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
  //   //   history.push('/home');
  //   //   return;
  //   // }

  //   try {
  //     setLoading(true);

  //     // provider hi superProvider hoga
  //     const providerName = provider || superProvider || '';

  //     const response = await postAPIAuth('UserloginToGapApi', {
  //       gameId: gameId,
  //       providerName: providerName,
  //     });
  //     console.log('launchGapGameApi response: ', response);

  //     const launchUrl =
  //       response?.data?.data?.url ||
  //       response?.data?.data?.gameUrl ||
  //       response?.data?.url ||
  //       response?.data?.launchUrl;



  //     // fallback old route
  //     const slug = (gameName || 'game')
  //       .toLowerCase()
  //       .trim()
  //       .replace(/\s+/g, '-')
  //       .replace(/[^a-z0-9-_]/g, '');

  //     history.push({
  //       pathname: `/dc/gamev1.1/${slug}-${btoa(gameId)}-${btoa(
  //         gameCode || ''
  //       )}-${btoa(providerName)}-${btoa(subProvider || '')}-${btoa(
  //         superProvider || ''
  //       )}`,
  //       state: { gameName },
  //     });
  //   } catch (error) {
  //     console.error('launchGapGameApi error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // const getGameUrl = async (
  //   gameId,
  //   gameName,
  //   provider,
  //   gameCode,
  //     subProvider,
  //     superProvider,
  // ) => {
  //   if (!loggedIn) {
  //     history.replace('/login');
  //     return;
  //   }

  //   try {
  //     const providerName = provider

  //     const response = await postAPIAuth("UserloginToGapApi", {
  //       gameId,
  //       providerName,
  //     });

  //     const launchUrl = response?.data?.data?.url;

  //     const slug = gameName
  //       ?.toLowerCase()
  //       .replace(/\s+/g, "-");

  //     history.push({
  //       pathname: `/dc/gamev1.1/${slug}-${btoa(gameId)}`,
  //       state: {
  //         gameId,
  //         gameName,
  //          provider, 
  //         launchUrl,
  //          gameCode,
  //     subProvider,
  //     superProvider,
  //       },
  //     });

  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getGameUrl = async (
    gameId,
    gameName,
    provider,
    gameCode,
    subProvider,
    superProvider
  ) => {
    if (!loggedIn) {
      history.replace("/login");
      return;
    }

    try {
      const providerName = provider;

      const response = await postAPIAuth("UserloginToGapApi", {
        gameId,
        providerName,
      });

      console.log("API response:", response);

      const launchUrl = response?.data?.data?.url;

      const slug = gameName
        ?.toLowerCase()
        .replace(/\s+/g, "-");

      history.push({
        pathname: `/dc/gamev1.1/${slug}-${btoa(gameId)}-${btoa(
          gameCode || ""
        )}-${btoa(providerName || "")}-${btoa(
          subProvider || ""
        )}-${btoa(superProvider || "")}`,

        state: {
          gameName,
          launchUrl
        },
      });
    } catch (error) {
      console.log(error);
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
      provider,
      gameCode,
      subProvider,
      superProvider

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

    
      if (!availableEventTypes?.['m1']) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: "Game is locked. Please Contact Upper Level",
        })
      );
    }

    const clickedGame = {
      gameId: gameId || '',
      gameName: gameName || '',
      gameCode: gameCode || '',
      subProviderName: subProvider || '',
      providerName: provider || '',
      superProviderName: superProvider || '',
      urlThumb: url_thumb || '',
    };


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
    if (!loggedIn) {
      history.replace('/login');
      return;
    }

    const defaultProvider = providerFromParams || 'MAC88';
    fetchCategories(defaultProvider);
  }, [pathname, loggedIn]);


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