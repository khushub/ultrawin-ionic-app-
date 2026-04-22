import { Fab, Menu, Tooltip, Dialog, DialogTitle, useMediaQuery, Button, Drawer, Tabs } from "@mui/material";
import { CancelOutlined, InfoOutlined, WhatsApp } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import WhatsupImg from "../../assets/images/footer/whatsup-flot.png";
import sidebarMobIcon from "../../assets/images/icons/mobSidebarIcon.svg";
import CustomButton from "../../common/CustomButton/CustomButton";
import SideHeader from "../SideHeader/SideHeader";
// import { BRAND_DOMAIN, domain } from "../../constants/Branding";
import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermissions";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { SPORTS_MAP } from "../../constants/ExchangeEventTypes";
// import {
//     // setEventType,
//     // setWhatsappDetails,
// } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { setLangSelected } from "../../store/slices/commonSlice";
// import SVLS_API from "../../svls-api";
import { capitalizeWord, demoUser, showThemes } from "../../util/stringUtil";
import "./SubHeader.scss";
import ExposureTable from "../../components/Exposure/Exposure";
import SkinIcon from "../../assets/images/common/skin-icon.svg";
import CustomerSupportIcon from "../../assets/images/common/customer-support.svg?react";
import { CONFIG } from "../../config/config";
import { storageManager } from "../../util/storageManager";

type StoreProps = {
    allowedConfig: number;
    loggedIn: boolean;
    logout: Function;
    contentConfig: any;
    domainConfig: any;
    bonusEnabled: boolean;
    skins: String[];
    balance: number;
    bonusRedeemed: number;
    nonCashableAmount: number;
    cashableAmount: number;
    exposure: number;
    bonus: number;
    whatsappDetails: string;
    // setWhatsappDetails: (details: string) => void;
    languages: string[];
    langSelected: string;
    setLangSelected: (lang: string) => void;
    langData: any;
};

const websiteUrls: any[] = CONFIG?.skins || []

const SubHeader: React.FC<StoreProps> = (props) => {
    const {
        allowedConfig,
        loggedIn,
        logout,
        contentConfig,
        domainConfig,
        bonusEnabled,
        skins,
        balance,
        bonusRedeemed,
        nonCashableAmount,
        cashableAmount,
        exposure,
        bonus,
        whatsappDetails,
        // setWhatsappDetails,
        languages,
        langSelected,
        setLangSelected,
        langData,
    } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);
    const [showWhatsapp, setShowWhatsapp] = useState<boolean>(true);
    const [showExpDetail, setShowExpDetail] = useState<boolean>(false);
    const history = useHistory();
    const location = useLocation();
    const isSmallScreen = useMediaQuery("(max-width:400px)");
    const cFactor = CURRENCY_TYPE_FACTOR[0];
    const [subHeaders, setSubHeaders] = useState<any>([
        {
            name: "Exchange",
            alias: "home",
            langKey: "home",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "active-link",
            buttonClassName: "nav-link-btn",
            icon: null,
            superScript: null,
            redirectionUrl: "/home",
            config: CONFIG_PERMISSIONS.sports,
            disable: false,
            priority: 0,
            onClick: false,
            loginRequired: true,
        },
        {
            name: "Exchange",
            alias: "Inplay",
            langKey: "inplay",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "active-link",
            buttonClassName: "nav-link-btn",
            icon: null,
            superScript: null,
            redirectionUrl: "/exchange_sports/inplay",
            config: CONFIG_PERMISSIONS.sports,
            disable: false,
            priority: 0,
            onClick: false,
            loginRequired: true,
        },

        // {
        //   name: 'Change Site',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link mob-view',
        //   activeClassName: null,
        //   buttonClassName: 'newlacunch-menu',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/mo/theme',
        //   config: null,
        //   disable: false,
        //   priority: 1,
        //   onClick: false,
        // },
        // {
        //   name: 'Promotions',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: (
        //     <IonIcon className="title-image gift_icon" color="primary" src={gift} />
        //   ),
        //   superScript: null,
        //   redirectionUrl: '/promotion',
        //   config: null,
        //   disable: false,
        //   priority: 2,
        //   onClick: false,
        // },
        {
            name: "Sportsbook",
            langKey: "sports_book",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "active-link",
            buttonClassName: "nav-link-btn",
            icon: null,
            superScript: null,
            redirectionUrl: "/premium_sports",
            config: CONFIG_PERMISSIONS.sports,
            disable: false,
            priority: 3,
            onClick: false,
            loginRequired: true,
        },
        {
            name: "Live Casino",
            langKey: "casino",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "active-link",
            buttonClassName: "nav-link-btn",
            icon: null,
            superScript: null,
            redirectionUrl: "/casino",
            config: CONFIG_PERMISSIONS.live_casino,
            disable: false,
            priority: 4,
            onClick: false,
            loginRequired: true,
        },
        {
            name: "Multi Markets",
            langKey: "multimarkets",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "active-link",
            buttonClassName: "nav-link-btn",
            icon: null,
            superScript: null,
            redirectionUrl: "/exchange_sports/multi-markets",
            config: CONFIG_PERMISSIONS.sports,
            disable: false,
            priority: 7,
            onClick: false,
            loginRequired: true,
        },
        // {
        //   name: 'Casino',
        //   langKey: 'casino',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/premium-casino',
        //   config: CONFIG_PERMISSIONS.live_casino,
        //   disable: false,
        //   priority: 8,
        //   onClick: false,
        // },

        {
            name: "Check Bonuses",
            langKey: "checkbonuses",
            key: false,
            exact: false,
            className: "nav-link",
            activeClassName: "check-bonus-active",
            buttonClassName: "check-bonus-btn check-bt-blink-animation",
            icon: null,
            superScript: null,
            redirectionUrl: "/profile/bonus",
            disable: false,
            priority: 20,
            onClick: false,
            loginRequired: true,
        },

        // {
        //   name: 'Virtual Sports',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/virtual_sports',
        //   config: CONFIG_PERMISSIONS.casino,
        //   disable: false,
        //   priority: 6,
        //   onClick: false,
        // },

        // {
        //   name: 'Fun Games',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn fun-games-link',
        //   icon: null,
        //   superScript: <span className="badge">New</span>,
        //   redirectionUrl: '/fun_games',
        //   config: CONFIG_PERMISSIONS.live_casino,
        //   disable: false,
        //   priority: 8,
        //   onClick: false,
        // },
        // {
        //   name: "Men's T20 WORLD Cup",
        //   key: false,
        //   exact: false,
        //   className: 'nav-link cup-color-change',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn ',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: `/exchange_sports/cricket/indian-premier-league/indian-premier-league/${btoa(
        //     WORLD_CUP_T20.routeHash
        //   )}`,
        //   config: CONFIG_PERMISSIONS.cricket,
        //   disable: false,
        //   priority: 9,
        //   onClick: false,
        // },
        // {
        //   name: 'Cricket',
        //   key: true,
        //   exact: true,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/exchange_sports/cricket',
        //   config: CONFIG_PERMISSIONS.cricket,
        //   disable: false,
        //   priority: 10,
        //   onClick: true,
        // },
        // {
        //   name: 'Football',
        //   key: true,
        //   exact: true,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/exchange_sports/football',
        //   config: CONFIG_PERMISSIONS.football,
        //   disable: false,
        //   priority: 11,
        //   onClick: true,
        // },
        // {
        //   name: 'Tennis',
        //   key: true,
        //   exact: true,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/exchange_sports/tennis',
        //   config: CONFIG_PERMISSIONS.tennis,
        //   disable: false,
        //   priority: 12,
        //   onClick: true,
        // },
        // {
        //   name: 'Horse Racing',
        //   key: true,
        //   exact: true,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/exchange_sports/horseracing',
        //   config: CONFIG_PERMISSIONS.sports,
        //   disable: false,
        //   priority: 13,
        //   onClick: true,
        // },
        // {
        //   name: 'TV Games',
        //   key: false,
        //   exact: false,
        //   className: 'nav-link',
        //   activeClassName: 'active-link',
        //   buttonClassName: 'nav-link-btn',
        //   icon: null,
        //   superScript: null,
        //   redirectionUrl: '/tv_games',
        //   config: CONFIG_PERMISSIONS.casino,
        //   disable: false,
        //   priority: 17,
        //   onClick: false,
        // },
    ]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        var subHeadersArray = subHeaders;
        if (!bonusEnabled) {
            subHeadersArray = subHeadersArray.filter(
                (item) => item.name !== "Promotions",
            );
        } else {
            if (
                subHeadersArray.filter((item) => item.name === "Promotions")
                    .length === 0
            ) {
                subHeadersArray
                    .push
                    //   {
                    //   name: 'Promotions',
                    //   key: false,
                    //   exact: false,
                    //   className: 'nav-link',
                    //   activeClassName: 'active-link',
                    //   buttonClassName: 'nav-link-btn',
                    //   redirectionUrl: '/promotions',
                    //   config: CONFIG_PERMISSIONS.sports,
                    //   visibleForWhitelabel: true,
                    //   disable: false,
                    //   priority: 1,
                    //   onClick: false,
                    // }
                    ();
            }
        }
        contentConfig?.sub_headers.forEach((subHeader) => {
            var defaultSubHeader = subHeadersArray.filter(
                (item) =>
                    item.name.toLowerCase() === subHeader.name.toLowerCase(),
            )[0];
            if (defaultSubHeader) {
                defaultSubHeader.disable = subHeader.disabled;
                defaultSubHeader.priority = subHeader.priority;
            }
        });
        subHeadersArray.sort((a, b) => a.priority - b.priority);
        setSubHeaders([...subHeadersArray.filter((elem) => !elem.disable)]);
    }, [contentConfig, bonusEnabled]);

    const isAllowed = (config) => {
        return config ? (allowedConfig & config) !== 0 : true;
    };

    const isVisible = (subHeaderName: string) => {
        return (
            subHeaderName.toLowerCase() !== "promotions" || domainConfig.bonus
        );
    };

    const isChangeSite = (subHeaderName: string) => {
        return (
            subHeaderName.toLowerCase() !== "change site" || showThemes(skins)
        );
    };

    const isBonusVisible = (subHeaderName: string) => {
        return (
            subHeaderName.toLowerCase() !== "check bonuses" ||
            (loggedIn && domainConfig.b2cEnabled && domainConfig.bonus)
        );
    };

    const defaultSubHeaders = subHeaders.map((value, index) => {
        if (
            isAllowed(value.config) &&
            isVisible(value.name) &&
            isChangeSite(value.name) &&
            isBonusVisible(value.name) &&
            value.loginRequired
        ) {
            return (
                <NavLink
                    key={
                        value?.key
                            ? SPORTS_MAP.get(value.name).slug + index
                            : value.name + index
                    }
                    exact={value?.exact ? value.exact : null}
                    className={value.className}
                    activeClassName={
                        value?.activeClassName ? value.activeClassName : null
                    }
                    to={
                        value.name !== "Sportsbook"
                            ? value.redirectionUrl
                            : loggedIn
                              ? value.redirectionUrl
                              : "/login"
                    }
                    // onClick={
                    //     value.onClick
                    //         ? () => setEventType(SPORTS_MAP.get(value.name))
                    //         : null
                    // }
                >
                    <Button className={value.buttonClassName}>
                        {value?.icon ? value.icon : null}
                        {value?.icon ? "\u00a0" : null}
                        {langData?.[value.langKey]}
                        {value?.superScript ? value.superScript : null}
                    </Button>
                </NavLink>
            );
        }
        return null;
    });

    const loginHandler = () => {
        history.push("/login");
    };

    const handleSideBarIconClick = () => {
        setOpenDrawer(true);
    };

    const signupHandler = () => {
        history.push("/register");
    };

    const handleLangChange = (langParam: string) => {
        sessionStorage.setItem("lang", langParam);
        setLangSelected(sessionStorage.getItem("lang"));
        window.location.reload();
    };

    const getAdminWhatsAppNumber = async () => {
        try {
            let response;
            // if (loggedIn) {
            //     response = await SVLS_API.get(
            //         `/account/v2/books/${BRAND_DOMAIN}/sdm-contact`,
            //         {
            //             headers: {
            //                 Authorization: sessionStorage.getItem("jwt_token"),
            //             },
            //         },
            //     );
            // } else {
            //     response = await SVLS_API.get(
            //         `/account/v2/books/${BRAND_DOMAIN}/sdm-contact`,
            //     );
            // }
            // if (response?.data?.contactType === "WHATSAPP_WEB_LINK") {
            //     setWhatsappDetails(response?.data?.details);
            // } else {
            //     setWhatsappDetails(
            //         `http://api.whatsapp.com/send?phone=${response?.data?.details}`,
            //     );
            // }
        } catch (err) {}
    };

    const getUsername = () => {
        const user = storageManager.getUser();
        const isDemo = user?.isDemo || false;

        return isDemo
        ? langData?.["demo_user"]
        : user?.fullname || user?.username;
    };

    const redirectToHome = () => {
        history.push("/home");
    };

    useEffect(() => {
        getAdminWhatsAppNumber();
    }, [loggedIn]);

    const redirectToContact = () => {
        window.open(whatsappDetails, "_blank");
    };

    const handleSkinChange = (domain) => {
        let jwtToken = storageManager.getToken();
        logout();
        window.open(`http://${domain}/login?authToken=${jwtToken}`, "_self");
    };

    return (
        <>
            <div className="app-sub-header">
                <Tabs
                    value={1}
                    variant="scrollable"
                    scrollButtons={false}
                    className="actions-list web-view"
                >
                    {defaultSubHeaders}
                </Tabs>
                <div className="logo-wrapper">
                    <div className="side-bar-icon-div mob-view">
                        <img
                            onClick={handleSideBarIconClick}
                            src={sidebarMobIcon}
                            alt="sidebar-icon"
                            className="sb-menu-bar-icon"
                        />
                    </div>
                    {isMobile ? (
                        <button
                            className="sh-website-title"
                            onClick={() => redirectToHome()}
                        >
                            <img
                                src={CONFIG.logo}
                                alt=""
                                className="sh-website-title-img"
                            />
                        </button>
                    ) : null}
                </div>

                <div className="whatsapp-login-signup">
                    {domainConfig.whatsapp && domainConfig.b2cEnabled && (
                        <button
                            className="new-whatsapp web-view"
                            onClick={redirectToContact}
                        >
                            <img
                                src={WhatsupImg}
                                height={28}
                                width={28}
                                alt="whatsapp"
                            />
                        </button>
                    )}
                    {/* <CustomButton
            className="sh-new-btn"
            text={'Theme'}
            onClick={(e) => {
              const selectedTheme = localStorage.getItem('userTheme');
              if (selectedTheme === 'purple') setThemeHandler('darkgreen');
              else setThemeHandler('purple');
            }}
            variant={1}
          /> */}

                    {loggedIn ? (
                        <>
                            {isMobile && domainConfig.b2cEnabled && (
                                <NavLink
                                    to={"/transaction/deposit"}
                                    className="deposit-btn-wrapper"
                                >
                                    <div className="deposit-btn">
                                        &nbsp;&nbsp;
                                        {isMobile ? "D" : langData?.["deposit"]}
                                        &nbsp;&nbsp;
                                    </div>
                                </NavLink>
                            )}
                            {domainConfig.b2cEnabled && (
                                <div className="bal-exp-btns input-tooltip">
                                    <Tooltip
                                        enterTouchDelay={0}
                                        className=" header-tooltip"
                                        color="white"
                                        title={`${langData?.["cashable"]} : ${
                                            balance
                                                ? Math.floor(
                                                      Number(
                                                          cashableAmount /
                                                              cFactor,
                                                      ),
                                                  ).toFixed(2)
                                                : 0.0
                                        } ${langData?.["non_cashable"]} :${Math.floor(Math.max(exposure, nonCashableAmount + bonusRedeemed) / cFactor)?.toFixed(2)}`}
                                    >
                                        <InfoOutlined />
                                    </Tooltip>
                                </div>
                            )}
                            <div className="bal-exp-btns">
                                <div className="bal-exp-btn balance-sb">
                                    {langData?.["header_balance_txt"]}:
                                    {balance
                                        ? Math.floor(
                                              Number(balance / cFactor),
                                          ).toFixed(2)
                                        : "0.00"}
                                </div>
                                <div
                                    className="bal-exp-btn exp-underline cursor-pointer"
                                    onClick={() => setShowExpDetail(true)}
                                >
                                    {langData?.["header_exp_txt"]}:
                                    {exposure
                                        ? Number(exposure / cFactor).toFixed(2)
                                        : "0.00"}
                                </div>
                            </div>
                            <div className="bal-exp-btns">
                                <div className="bal-exp-btn username-sb">
                                    {getUsername()}
                                </div>
                                {bonusEnabled && domainConfig.b2cEnabled && (
                                    <div className="bal-exp-btn">
                                        {langData?.["header_bonus_txt"]}:{" "}
                                        {bonus
                                            ? Number(bonus / cFactor).toFixed(2)
                                            : "0.00"}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <CustomButton
                                className="sh-new-btn"
                                text={langData?.["login"]}
                                onClick={loginHandler}
                                variant={1}
                            />

                            {domainConfig.signup && domainConfig.b2cEnabled && (
                                <CustomButton
                                    className="sh-new-btn"
                                    text={langData?.["signup"]}
                                    onClick={signupHandler}
                                    variant={2}
                                />
                            )}
                        </>
                    )}
       

                    {websiteUrls.length > 0 && loggedIn ? (
                        <>
                            <Button
                                className="wallet-btn"
                                // text={'wallet'}
                                onClick={(e) => handleClick(e)}
                            >
                                <img src={SkinIcon} />
                            </Button>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                className="wallet-menu"
                            >
                                {websiteUrls?.map(
                                    ({ label, domain, disabled }) => (
                                        <div
                                            key={label}
                                            className={
                                                disabled
                                                    ? ` wallet-menu-item active-item `
                                                    : ` wallet-menu-item `
                                            }
                                            onClick={() =>
                                                disabled
                                                    ? null
                                                    : handleSkinChange(domain)
                                            }
                                        >
                                            {capitalizeWord(label)}
                                        </div>
                                    ),
                                )}
                            </Menu>
                        </>
                    ) : null}
                </div>
            </div>

            {domainConfig.whatsapp &&
                domainConfig.b2cEnabled &&
                isMobile &&
                showWhatsapp &&
                (location.pathname.includes("/home") ||
                    location.pathname.includes("/inplay")) && (
                    // <Fab
                    // className="floating-whatsapp-btn new-whatsapp"
                    // onClick={redirectToContact}
                    // >
                    <div
                        className="floating-whatsapp-btn new-whatsapp"
                        onClick={redirectToContact}
                    >
                        <CustomerSupportIcon className="whatsapp-icon" />
                        {/* <WhatsApp className="whatsapp-icon" />
            <div className="whatsapp-btn-text">
              {langData?.['customer_support_txt']}
            </div> */}
                        {/* <img src={WhatsupImg} height={33} width={33} alt="whatsapp" /> */}
                        <CancelOutlined
                            className="close-floating-btn"
                            onClick={(e) => {
                                setShowWhatsapp(false);
                                e.stopPropagation();
                            }}
                        />
                    </div>
                    // </Fab>
                )}

            <Drawer
                anchor={"left"}
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
            >
                <SideHeader closeHandler={() => setOpenDrawer(false)} />
            </Drawer>

            <Dialog
                open={showExpDetail}
                onClose={() => setShowExpDetail(false)}
                aria-labelledby="form-dialog-title"
                maxWidth="lg"
                fullWidth
                className="login-alert"
            >
                <DialogTitle id="form-dialog-title">
                    {langData?.["exposure"]}
                </DialogTitle>
                <ExposureTable
                    setShowExpDetail={setShowExpDetail}
                    langData={langData}
                />
            </Dialog>
        </>
    );
};

const mapStateToProps = (state: any) => {
    return {
        allowedConfig: state.common.allowedConfig,
        loggedIn: state.auth.loggedIn,
        domainConfig: state.common.domainConfig,
        contentConfig: state.common.contentConfig,
        bonusEnabled: state.common.domainConfig.bonus,
        balance: state.userDetails.balance,
        bonusRedeemed: state.userDetails.bonusRedeemed,
        nonCashableAmount: state.userDetails.nonCashableAmount,
        cashableAmount: state.userDetails.cashableAmount,
        exposure: state.userDetails.exposure,
        bonus: state.userDetails.bonus,
        whatsappDetails:
            demoUser() || !state.auth.loggedIn
                ? state.common.demoUserWhatsappDetails
                : state.common.whatsappDetails,
        langSelected: state.common.langSelected,
        languages: state.common.languages,
        langData: state.common.langData,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        logout: () => dispatch(logout()),
        // setEventType: (et: any) => dispatch(setEventType(et)),
        // setWhatsappDetails: (details: string) =>
        //     dispatch(setWhatsappDetails(details)),
        setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SubHeader);
