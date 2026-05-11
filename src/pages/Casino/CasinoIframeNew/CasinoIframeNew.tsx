import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { useParams } from "react-router-dom";
import "./CasinoIframeNew.scss";
import { isMobile, isIOS } from "react-device-detect";
import LoadingPage from "../../LoadingPage/index";
import { postAPIAuth } from "../../../services/apiInstance";
import { useSelector, useDispatch } from "react-redux";
import { setAlertMsg } from "../../../store/slices/commonSlice";

type StoreProps = {
    gameUrl: string;
    loggedIn: boolean;
    token: string;
};

type RouteParams = {
    gamePath: string;
};

const CasinoIframeNew: React.FC<StoreProps> = (props) => {
    const [gameSrc, setGameSrc] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const { loggedIn, token } = props;
    const { gamePath } = useParams<RouteParams>();
    const history = useHistory();
    const dispatch = useDispatch();
    const locationState: any = useLocation().state;

    const { availableEventTypes } = useSelector((state: any) => state.userDetails,);

    // activeService comes from route state set in getGameUrl
    const activeService: "gap" | "qtech" =
        locationState?.activeService ?? "gap";

    useEffect(() => {
        document.getElementsByClassName("router-ctn")[0].scrollIntoView();
    }, []);

    const launchGame = (launchUrl: string) => {
        // if (isMobile && isIOS) {
        //     window.location.href = launchUrl;
        // } else {
        // }
        setGameSrc(launchUrl);
    };

    useEffect(() => {
        const loadGame = async () => {
            if (!gamePath) return;

            if (!loggedIn) {
                history.replace("/login");
                return;
            }

            // Safety net — check eventTypeId for the active service
            const eventTypeId = activeService === "gap" ? "m1" : "c9";
            if (!availableEventTypes?.[eventTypeId]) {
                dispatch(
                    setAlertMsg({
                        type: "error",
                        message: "Game is locked. Please Contact Upper Level",
                    }),
                );
                history.replace("/home");
                return;
            }

            if (!token) {
                history.replace("/login");
                return;
            }

            // Status check from JWT
            const claims = token.split(".")[1];
            const userStatus = JSON.parse(window.atob(claims)).status;
            if (userStatus === 0 || userStatus === 3) {
                history.push("/home");
                return;
            }

            // Decode path params — keep all of them as-is
            const pathParts = gamePath.split("-");
            const superProvider = atob(pathParts.pop() || "");
            const subProvider = atob(pathParts.pop() || "");
            const provider = atob(pathParts.pop() || "");
            const gameCode = atob(pathParts.pop() || "");
            const gameId = atob(pathParts.pop() || "");
            const gameName = locationState?.gameName || pathParts.join("-");

            try {
                setLoading(true);

                let launchUrl = "";

                if (activeService === "gap") {
                    const response = await postAPIAuth("/UserloginToGapApi", {
                        gameId,
                        providerName: provider,
                    });
                    // console.log('resop: ', response)
                    launchUrl = response?.data?.data?.url || "";
                } else {
                    // QTech
                    const response = await postAPIAuth("/singleGameAPI", {
                        gameId,
                    });
                    // console.log('resop: ', response)
                    launchUrl = response?.data?.data?.url || "";
                }

                if (!launchUrl) {
                    dispatch(
                        setAlertMsg({
                            type: "error",
                            message: "Unable to launch game. Please try again.",
                        }),
                    );
                    history.replace("/home");
                    return;
                }

                saveLastPlayedGameDetails({
                    gameId,
                    gameName,
                    provider,
                    gameCode,
                    subProvider,
                    superProvider,
                    launchUrl,
                });

                launchGame(launchUrl);
            } catch (e) {
                console.error("loadGame error:", e);
                dispatch(
                    setAlertMsg({
                        type: "error",
                        message: "Something went wrong. Please try again.",
                    }),
                );
            } finally {
                setLoading(false);
            }
        };

        loadGame();
    }, []);

    const saveLastPlayedGameDetails = (newGame: any) => {
        const existingGames = JSON.parse(
            localStorage.getItem("recent_games") || "[]",
        );
        if (
            existingGames.length > 0 &&
            existingGames[0].gameId === newGame.gameId
        ) {
            return;
        }
        existingGames.unshift(newGame);
        localStorage.setItem(
            "recent_games",
            JSON.stringify(existingGames.slice(0, 3)),
        );
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
                />
            )}
        </div>
    );
};

const mapStateToProps = (state: any) => ({
    gameUrl: state.common.dcGameUrl,
    loggedIn: state.auth.loggedIn,
    token: state.auth.token,
});

export default connect(mapStateToProps)(CasinoIframeNew);
