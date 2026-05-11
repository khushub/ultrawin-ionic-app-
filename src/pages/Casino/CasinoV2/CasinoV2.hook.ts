import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { postAPIAuth } from "../../../services/apiInstance";
import { useSelector, useDispatch } from "react-redux";
import { setAlertMsg } from "../../../store/slices/commonSlice";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// ─── Service type ────────────────────────────────────────────────────────────
type ServiceType = "gap" | "qtech";

// ─── Normalized game shape ───────────────────────────────────────────────────
export interface NormalizedGame {
    game_id: string;
    game_name: string;
    url_thumb: string;
    game_code: string;
    category: string;
    provider_name: string;
    sub_provider_name: string;
    super_provider_name: string;
    serviceType: ServiceType;
    status: string;
}

// ─── QTech static provider list ─────────────────────────────────────────────
export interface QtechProvider {
    id: string;
    name: string;
    type: string;
}

const QTECH_PROVIDERS: QtechProvider[] = [
    { id: "EVO", name: "Evolution Gaming",  type: "LIVECASINO" },
    { id: "EZU", name: "Ezugi",             type: "LIVECASINO" },
    { id: "BTV", name: "Betgames",          type: "LIVECASINO" },
    { id: "VGL", name: "Vivo Gaming",       type: "LIVECASINO" },
    { id: "L88", name: "Live88",            type: "LIVECASINO" },
    { id: "SAG", name: "SA Gaming",         type: "LIVECASINO" },
    { id: "HOG", name: "Ho Gaming",         type: "LIVECASINO" },


    { id: "NE",  name: "NetEnt",            type: "SLOT" },
    { id: "END", name: "Endorphina",        type: "SLOT" },
    { id: "IDS", name: "Iron Dog Studio",   type: "SLOT" },
    { id: "RED", name: "Red Tiger Gaming",  type: "SLOT" },
    { id: "GA",  name: "GameArt",           type: "SLOT" },
    { id: "JIL", name: "JILI",              type: "SLOT" },
    { id: "YGG", name: "Yggdrasil",         type: "SLOT" },
    { id: "WAZ", name: "VoltEnt",           type: "SLOT" },
    { id: "TK",  name: "Thunderkick",       type: "SLOT" },
    { id: "HAB", name: "Habanero",          type: "SLOT" },
    { id: "PNG", name: "Play'n GO",         type: "SLOT" },
    { id: "BNG", name: "BNG",               type: "SLOT" },
    { id: "HAK", name: "Hacksaw Gaming",    type: "SLOT" },
    { id: "RG",  name: "Revolver Gaming",   type: "SLOT" },
    { id: "PRG", name: "Prospect Gaming",   type: "SLOT" },
    { id: "GZX", name: "Gamzix",            type: "SLOT" },
    { id: "CQC", name: "CQ9 Casino",        type: "SLOT" },
    { id: "DS",  name: "Dragoon Soft",      type: "SLOT" },
    { id: "BPG", name: "Blueprint Gaming",  type: "SLOT" },
    { id: "WOO", name: "Woohoo Games",      type: "SLOT" },
    { id: "GMC", name: "Gaming Corps",      type: "SLOT" },
    { id: "TPG", name: "Triple PG",         type: "SLOT" },
    { id: "NGE", name: "NetGame",           type: "SLOT" },
    { id: "SWC", name: "Skywind Casino",    type: "SLOT" },
    { id: "AUX", name: "AvatarUX",          type: "SLOT" },
    { id: "MNP", name: "Manna Play",        type: "SLOT" },
    { id: "KGL", name: "Kalamba Games",     type: "SLOT" },
    { id: "FUG", name: "Fugaso",            type: "SLOT" },
    { id: "EVP", name: "Evoplay",           type: "SLOT" },
    { id: "MOB", name: "Mobilots",          type: "SLOT" },
    { id: "QS",  name: "Quickspin",         type: "SLOT" },
    { id: "NAG", name: "Naga Games",        type: "SLOT" },
    { id: "FNG", name: "Fantasma Games",    type: "SLOT" },
    { id: "OPY", name: "Onlyplay",          type: "SLOT" },
    { id: "RTG", name: "RTG Slots",         type: "SLOT" },
    { id: "RLX", name: "Relax Gaming",      type: "SLOT" },
    { id: "OT",  name: "OneTouch",          type: "SLOT" },
    { id: "NLC", name: "Nolimit City",      type: "SLOT" },
    { id: "BTG", name: "Big Time Gaming",   type: "SLOT" },
    { id: "1x2", name: "1x2 Gaming",        type: "SLOT" },
    { id: "SLO", name: "Slotopia",          type: "SLOT" },
    { id: "SHS", name: "Spearhead Studios", type: "SLOT" },
    { id: "PRS", name: "Print Studios",     type: "SLOT" },
    { id: "SM",  name: "Slotmill",          type: "SLOT" },
    { id: "OMI", name: "OMI Gaming",        type: "SLOT" },
    { id: "TRB", name: "Turbo Games",       type: "SLOT" },
];

// ─── GAP static provider list (strings, same as before) ─────────────────────
const GAP_PROVIDER_LIST: string[] = [
    "All",
    "Recent",
    "MAC88",
    "KINGMIDAS",
    "CRASH88",
    "SPRIBE",
    "SUNO",
    "AVIATOR",
    "AWC",
    "BETCORE",
    "BETGAMES",
    "CREED",
    "DC",
    "DRGS",
    "EZUGI",
    "GAPLOBBY",
    "JACKTOP",
    "JiLi",
    "MACAW",
    "MARBLES",
    "PINKY",
    "RANDORA",
    "RG",
    "RICH88",
    "SAP",
    "TURBO",
];

// ─── Normalizers ─────────────────────────────────────────────────────────────

/** Pick best thumbnail from QTech images array (index 2 → 1 → 0 → '') */
function pickQtechThumb(images: { type: string; url: string }[] = []): string {
    return images[2]?.url ?? images[1]?.url ?? images[0]?.url ?? "";
}

/** Extract last segment: "CASINO/SLOT/5REEL" → "5REEL" */
function extractQtechCategory(category: string): string {
    if (!category) return "";
    const parts = category.split("/");
    return parts[parts.length - 1];
}

function normalizeGapGame(game: any): NormalizedGame {
    return {
        game_id: game.game_id ?? "",
        game_name: game.game_name ?? "",
        url_thumb: game.url_thumb ?? "",
        game_code: game.game_code ?? "",
        category: game.category ?? "",
        provider_name: game.provider_name ?? "",
        sub_provider_name: game.sub_provider_name ?? "",
        super_provider_name: game.super_provider_name ?? "",
        serviceType: "gap",
        status: game.status ?? "",
    };
}

function normalizeQtechGame(game: any): NormalizedGame {
    return {
        game_id: game.id ?? "",
        game_name: game.name ?? "",
        url_thumb: pickQtechThumb(game.images),
        game_code: "",
        category: extractQtechCategory(game.category),
        provider_name: game.provider?.name ?? "",
        sub_provider_name: game.provider?.name ?? "",
        super_provider_name: "",
        serviceType: "qtech",
        status: "",
    };
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useCasinoHook = () => {
    const { user } = useSelector((state: any) => state.auth);
    const loggedIn = useSelector((state: any) => state.auth.loggedIn);
    const { langData } = useSelector((state: any) => state.common);
    const { availableEventTypes } = useSelector(
        (state: any) => state.userDetails,
    );
    const dispatch = useDispatch();
    const history = useHistory();
    const { pathname } = useLocation();
    const searchParams = useQuery();

    // ── Determine active service once ─────────────────────────────────────────
    const activeService: ServiceType | null = !!availableEventTypes?.["m1"]
        ? "gap"
        : !!availableEventTypes?.["c9"]
          ? "qtech"
          : null;

    // ── Provider lists differ by service ──────────────────────────────────────
    // For GAP  → string[]         (existing behaviour)
    // For QTech → QtechProvider[] displayed by .name, API called with .id
    const gapSubProviderList = GAP_PROVIDER_LIST;
    const qtechSubProviderList = QTECH_PROVIDERS;

    // Unified display list (what the UI iterates over)
    const subProviderList: string[] =
        activeService === "gap"
            ? gapSubProviderList
            : ['Recent', ...qtechSubProviderList.map((p) => p.name)]; // show name in UI

    // ── URL params ─────────────────────────────────────────────────────────────
    const categoryFromParams = searchParams?.get("category");
    const providerFromParams = searchParams?.get("provider"); // always the display name

    // For QTech we need the provider id when calling the API
    const currentQtechProvider = qtechSubProviderList.find(
        (p) => p.name === providerFromParams,
    );

    // ── State ──────────────────────────────────────────────────────────────────
    const [dialogShow, setDialogShow] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [recentGames, setRecentGames] = useState<NormalizedGame[]>([]);

    // categoryMap  : { [providerDisplayName]: string[] }
    const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>(
        {},
    );

    // gameInfo     : { [providerDisplayName]: { [category]: NormalizedGame[] } }
    const [gameInfo, setGameInfo] = useState<
        Record<string, Record<string, NormalizedGame[]>>
    >({});

    const providerRefs = useRef<Record<string, HTMLElement | null>>({});
    const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

    // ── Derived lists ──────────────────────────────────────────────────────────
    const categoryList: string[] =
        providerFromParams === "Recent"
            ? []
            : ["All", ...(categoryMap[providerFromParams] ?? [])];

    const filteredGames: NormalizedGame[] =
        providerFromParams === "Recent"
            ? recentGames
            : (gameInfo?.[providerFromParams]?.[categoryFromParams] ?? []);

    const gameListDisplay = filteredGames.filter((game, index, self) => {
        const gameName = game.game_name.toLowerCase();
        const gameId = game.game_id;
        const matchSearch = gameName.includes(searchTerm.toLowerCase());
        const uniqueGame =
            index === self.findIndex((item) => item.game_id === gameId);
        return matchSearch && uniqueGame;
    });

    // ── Navigation helpers ─────────────────────────────────────────────────────
    const setCategoryParam = (
        category: string,
        provider?: string,
        replace: boolean = false,
    ) => {
        const prov = provider ?? providerFromParams;
        const nav = replace ? history.replace : history.push;
        nav({
            pathname: "/casino",
            search: `?provider=${prov}&category=${category}`,
        });
    };

    const setProviderParam = (provider: string, replace: boolean = false) => {
        const nav = replace ? history.replace : history.push;
        nav({ pathname: "/casino", search: `?provider=${provider}` });
    };

    // ── GAP: fetch categories ──────────────────────────────────────────────────
    const fetchGapCategories = async (providerName: string) => {
        if (categoryMap[providerName]) {
            const validCategory =
                categoryMap[providerName].includes(categoryFromParams);
            setCategoryParam(
                validCategory ? categoryFromParams : "All",
                providerName,
                true,
            );
            return;
        }

        try {
            setLoading(true);
            const response = await postAPIAuth("getGapCategoryAPI", {
                providerName,
            });
            const categories: string[] = response?.data?.data ?? [];

            setCategoryMap((prev) => ({ ...prev, [providerName]: categories }));

            const normalize = (str: string) => str?.toLowerCase().trim();
            const matched = categories.find(
                (c) => normalize(c) === normalize(categoryFromParams),
            );
            setCategoryParam(matched || "All", providerName, true);
        } catch (err) {
            console.error("fetchGapCategories error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── GAP: fetch games ───────────────────────────────────────────────────────
    const fetchGapGames = async (providerName: string, category: string) => {
        if (gameInfo?.[providerName]?.[category]) {
            setCategoryParam(category, providerName);
            return;
        }

        try {
            setLoading(true);
            const payload =
                category === "All"
                    ? { providerName, page: 1, limit: 2000 }
                    : { providerName, category, page: 1, limit: 2000 };

            const response = await postAPIAuth("getGapGamesAPI", payload);
            const raw: any[] = response?.data?.data ?? [];
            const games = raw.map(normalizeGapGame);

            setGameInfo((prev) => ({
                ...prev,
                [providerName]: {
                    ...(prev?.[providerName] ?? {}),
                    [category]: games,
                },
            }));

            setCategoryParam(category, providerName);
        } catch (err) {
            console.error("fetchGapGames error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── QTech: fetch games + extract categories in one shot ───────────────────
    const fetchQtechGames = async (providerDisplayName: string) => {
        // Find the provider object by display name
        const provider = qtechSubProviderList.find(
            (p) => p.name === providerDisplayName,
        );
        if (!provider) return;

        // Already cached → just navigate
        if (gameInfo?.[providerDisplayName]?.["All"]) {
            const validCategory =
                categoryMap[providerDisplayName]?.includes(categoryFromParams);
            setCategoryParam(
                validCategory ? categoryFromParams : "All",
                providerDisplayName,
                true,
            );
            return;
        }

        try {
            setLoading(true);
            const response = await postAPIAuth("getCasinoGamesAPI", {
                provider: provider.id,
            });
            const raw: any[] = response?.data?.data ?? [];
            const games = raw.map(normalizeQtechGame);

            // Extract unique categories from the response
            const uniqueCategories = [
                ...new Set(games.map((g) => g.category).filter(Boolean)),
            ];

            setCategoryMap((prev) => ({
                ...prev,
                [providerDisplayName]: uniqueCategories,
            }));

            // Store all games under 'All' + also bucket them by category
            const buckets: Record<string, NormalizedGame[]> = { All: games };
            for (const cat of uniqueCategories) {
                buckets[cat] = games.filter((g) => g.category === cat);
            }

            setGameInfo((prev) => ({
                ...prev,
                [providerDisplayName]: buckets,
            }));

            const normalize = (str: string) => str?.toLowerCase().trim();
            const matched = uniqueCategories.find(
                (c) => normalize(c) === normalize(categoryFromParams),
            );
            setCategoryParam(matched || "All", providerDisplayName, true);
        } catch (err) {
            console.error("fetchQtechGames error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── Unified: fetch categories (routes to correct service) ─────────────────
    const fetchCategories = async (providerDisplayName: string) => {
        if (!loggedIn) {
            history.replace("/login");
            return;
        }

        if (activeService === "gap") {
            await fetchGapCategories(providerDisplayName);
        } else if (activeService === "qtech") {
            // QTech has no separate category API — games + categories come together
            await fetchQtechGames(providerDisplayName);
        }
    };

    // ── Unified: fetch games (routes to correct service) ──────────────────────
    const fetchGames = async (
        providerDisplayName: string,
        category: string,
    ) => {
        if (!loggedIn) {
            history.replace("/login");
            return;
        }

        if (activeService === "gap") {
            await fetchGapGames(providerDisplayName, category);
        } else if (activeService === "qtech") {
            // For QTech all games are already fetched in fetchQtechGames.
            // Just navigate — the gameInfo bucket already exists.
            if (gameInfo?.[providerDisplayName]?.[category]) {
                setCategoryParam(category, providerDisplayName);
            } else {
                // Edge case: wasn't cached yet, re-fetch the provider
                await fetchQtechGames(providerDisplayName);
                setCategoryParam(category, providerDisplayName);
            }
        }
    };

    // ── Click handlers ─────────────────────────────────────────────────────────
    const handleCasinoSubProviderBlockClick = (subProviderName: string) => {
        if (subProviderName === "Recent") {
            const saved: NormalizedGame[] = JSON.parse(
                localStorage.getItem("recentCasinoGames") || "[]",
            );
            setRecentGames(saved);
            setProviderParam("Recent");
            return;
        }
        fetchCategories(subProviderName);
    };

    const handleCasinoCategoryClick = (categoryName: string) => {
        fetchGames(providerFromParams, categoryName);
    };

    const getGameUrl = (game: NormalizedGame) => {
        if (!loggedIn) {
            history.replace('/login');
            return;
        }

        // Check if the game's service eventTypeId is available
        const eventTypeId = game.serviceType === 'gap' ? 'm1' : 'c9';
        if (!availableEventTypes?.[eventTypeId]) {
            dispatch(setAlertMsg({
                type: 'error',
                message: 'Game is locked. Please contact upline',
            }));
            return;
        }

        const slug = game.game_name?.toLowerCase().replace(/\s+/g, '-');

        history.push({
            pathname: `/dc/gamev1.1/${slug}-${btoa(game.game_id)}-${btoa(
                game.game_code || ''
            )}-${btoa(game.provider_name || '')}-${btoa(
                game.sub_provider_name || ''
            )}-${btoa(game.super_provider_name || '')}`,
            state: {
                gameName:      game.game_name,
                activeService: game.serviceType,  // 'gap' | 'qtech'
            },
        });
    };

    const handleGameClick = (
        gameId?: string,
        gameName?: string,
        gameCode?: string,
        subProvider?: string,
        provider?: string,
        superProvider?: string,
        url_thumb?: string,
    ) => {
        if (!availableEventTypes?.["m1"] && !availableEventTypes?.["c9"]) {
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: "Game is locked. Please Contact Upper Level",
                }),
            );
            return;
        }

        // Build a NormalizedGame from the click args so getGameUrl has a clean object
        const clickedGame: NormalizedGame = {
            game_id: gameId || "",
            game_name: gameName || "",
            game_code: gameCode || "",
            sub_provider_name: subProvider || "",
            provider_name: provider || "",
            super_provider_name: superProvider || "",
            url_thumb: url_thumb || "",
            category: "",
            status: "",
            serviceType: activeService ?? "gap",
        };

        // Save to recents
        const oldRecent: NormalizedGame[] = JSON.parse(
            localStorage.getItem("recentCasinoGames") || "[]",
        );
        const updatedRecent = [
            clickedGame,
            ...oldRecent.filter((item) => item.game_id !== gameId),
        ].slice(0, 20);
        localStorage.setItem(
            "recentCasinoGames",
            JSON.stringify(updatedRecent),
        );
        setRecentGames(updatedRecent);

        getGameUrl(clickedGame);
    };

    const onClear = () => setSearchTerm("");

    // ── Effects ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!loggedIn) {
            history.replace("/login");
            return;
        }

        // If neither service is available, go home
        if (activeService === null) {
            history.replace("/home");
            return;
        }

        const defaultProvider =
            providerFromParams ||
            (activeService === "gap" ? "MAC88" : qtechSubProviderList[0]?.name);

        fetchCategories(defaultProvider);
    }, [pathname, loggedIn, activeService]);

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
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
    }, [providerFromParams]);

    // Scroll to selected category
    useEffect(() => {
        setTimeout(() => {
            if (
                categoryFromParams &&
                categoryRefs.current[categoryFromParams]
            ) {
                categoryRefs.current[categoryFromParams].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
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
        activeService, // expose so CasinoV2 can conditionally render if needed
    };
};
