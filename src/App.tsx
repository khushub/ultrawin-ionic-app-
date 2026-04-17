import { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Route, BrowserRouter, Switch } from 'react-router-dom';
import { Dialog, DialogContent } from '@mui/material';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { connect } from 'react-redux';
import { useIdleTimer } from 'react-idle-timer';
import Home from './pages/Home';
import HomePage from './pages/HomePage/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

import './App.scss';
/* Theme variables */
import './theme/variables.css';
import LoadingPage from './pages/LoadingPage';
import { setAlertMsg, setDomainConfig, setLangData, setLangSelected, setLanguages } from './store/slices/commonSlice';
import { logout } from './store/slices/authSlice';
import { getLang, getUpdatedSelectedLang, getSelectedLang, getLangCode, defaultLang } from './util/localizationUtil';
import { CONFIG } from './config/config';
import { postAPIAuth, postAPI, getAPI } from './services/apiInstance';
import SignUp from './pages/SignUp';
import Maintenance from './pages/Maintenance/Maintenance';
import Promotions from './pages/Promotions/Promotions';
import { Casino } from '@mui/icons-material';
import CasinoV2 from './pages/Casino/CasinoV2/CasinoV2';
import MyWallet from './pages/MyWallet/MyWallet';
import ExchangeSportsHome from './pages/ExchSportsBook/ExchangeSportsHome';
import UserRouter from './router/UserRouter';
import MyProfile from './components/MyProfile/MyProfile';
import ButtonVariables from './components/ButtonVariables/ButtonVariables';
const langModules = import.meta.glob<Record<string, any>>("./assets/lang_json/*.json");
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AcceptTerms = lazy(() => import('./pages/AcceptTerms'));
const ResetPassword = lazy(() => import('./pages/ResetPasswordPage'));
const ForgotPwdForm = lazy(() => import('./components/ForgotPassword/ForgotPassword'));
const MainPage = lazy(() => import('./router/UserRouter'));

declare global {
  interface Window {
    ipInfo?: any;
  }
}

const loadTheme = () => {
  const cssFolderName = window.location.hostname;
  const cssFilePath = `/assets/hosts/${cssFolderName}/variables.css`;

  // Check if an existing theme file is already loaded
  let existingLink = document.getElementById('site-theme');

  if (existingLink) {
    // Replace existing theme
    existingLink.setAttribute('href', cssFilePath);
  } else {
    // Create new theme link
    const link = document.createElement('link');
    link.id = 'site-theme';
    link.rel = 'stylesheet';
    link.href = cssFilePath;
    document.head.appendChild(link);
  }

  console.log(`Loaded theme: ${cssFolderName}`);
};

const updateFavicon = () => {
  let link:any = document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  const favIconFolderName = window.location.hostname;
  const favIconFilePath = `/assets/hosts/${favIconFolderName}/favicon.png`;
  link.setAttribute('href', favIconFilePath);
};

const updateTitle = () => {
  document.title = CONFIG.title;
};

const updateManifest = () => {
  try {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifest = {
        short_name: CONFIG.title,
        name: CONFIG.title,
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);
      manifestLink.setAttribute('href', manifestUrl);
    }

    const appleMobileWebAppTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleMobileWebAppTitle) {
      appleMobileWebAppTitle.setAttribute('content', CONFIG.title);
    }
  } catch (error) {
    console.error('Error updating manifest:', error);
  }
};




async function loadLanguage(lang:String) {
  const loader = langModules[`./assets/lang_json/${lang}.json`];
  return loader
    ? (await loader()).default
    : (await langModules["./assets/lang_jsonen.json"]()).default;
}


setupIonicReact();

const App: React.FC = (props:any) => {
  const consoleOpen = useConsoleOpen();
  const { logout, loggedIn, setLanguages, setLangSelected, setLangData, langData, setAlertMsg, setDomainConfig,} = props;

  const lang = getLang(sessionStorage?.getItem('lang'));


  const handleOnIdle = () => {
    console.log('user is idle');
    if (loggedIn) {
      logout();
    }
  };

  const handleClose = () => {
    console.log('user open dev tools');
  };

  useIdleTimer({
    timeout: 1000 * 60 * 60 * 2, // 2 hours
    onIdle: handleOnIdle,
    debounce: 500,
  });

  useEffect(() => {
    // TODO: this should only be called once.
    // getDomainConfig();
    // Load theme file
    loadTheme();
    // Load favicon
    updateFavicon();
    // Update title
    updateTitle();
    updateManifest();
  }, []);

  useEffect(() => {
    getDomainConfig();
  }, [loggedIn])

  useEffect(() => {
    const fetchAndStoreIPInfo = () => {
      getAPI('https://pro.ip-api.com/json/?key=CihzNa1Xn4Mz2oJ').then(res => {
        if (res.status == 200 && !!res.data) {
          window.ipInfo = res.data;
        }
      }).catch(err => {
        console.log('err: ', err);
      })
    }

    fetchAndStoreIPInfo();
  }, []);

  const getDomainConfig = async () => {
    try {
      const path = !loggedIn? '/getWpNumberAPI' : '/getUserWpNumberAPI';
      const apiInstance = !loggedIn? postAPI : postAPIAuth;
      const body = !loggedIn? { siteurl: CONFIG.siteurl } : {}

      const response = await apiInstance(path, body);
      let support_contacts = [];
      if(response.status === 200 && response?.data?.success) {
        const data = !loggedIn? response?.data?.response : response?.data?.data;
        support_contacts = [
          { contactType: 'CUSTOMER_SUPPORT_LINK', details: data?.wpnumber },
          { contactType: 'WHATSAPP_NUMBER', details: data?.wpnumber },
          { contactType: 'TELEGRAM_NUMBER', details: data?.telegram },
          { contactType: 'INSTAGRAM_LINK', details: data?.instagram },
          { contactType: 'SKYPE_LINK', details: `https://whatsapp.com/${data?.wpnumber}` },
          { contactType: 'FACEBOOK_LINK', details: data?.facebook },
          { contactType: 'EMAIL_LINK', details: data?.email },
          { contactType: 'REGISTRATION_WHATSAPP_LINK', details: `https://whatsapp.com/${data?.wpnumber}` },
        ]
      }
      
      const dConfig = {
        demoUser: CONFIG.demo_user_enabled,
        signup: CONFIG.signup_enabled,
        whatsapp: CONFIG.whatsapp_support,
        payments: CONFIG.payments_enabled,
        bonus: CONFIG.bonus_enabled,
        affiliate: CONFIG.affiliate_enabled,
        depositWagering: CONFIG.deposit_wagering_enabled,
        suppportContacts: support_contacts,
        apkUrl: CONFIG.apk_url,
        b2cEnabled: CONFIG.b2c_enabled,
        ruleScope: CONFIG.rule_scope,
      };
      setLanguages(CONFIG.languages);
      setDomainConfig(dConfig);
      
    } catch (err) {
      console.log(err);
    } finally {
      afterProcess(CONFIG.languages);
    }
  };

  const afterProcess = (languages: string[]) => {
    var sessionLang = sessionStorage.getItem('lang');
    var lang = sessionLang
      ? getUpdatedSelectedLang(languages, sessionLang)
      : getSelectedLang(languages);

    sessionStorage.setItem('lang', lang);
    setLangSelected(sessionStorage.getItem('lang'));
  };

  useEffect(() => {
    if (lang) {
      getLangData();
    }
  }, [lang]);

  const getLangData = async () => {
    try {
      // TODO: uncomment this, if we don't want to take the values from uploaded json.
      // if (lang === defaultLang) {
      //   setLangData(defaultLangData);
      //   return;
      // }

      var langCode = getLangCode(lang)?.toLowerCase();
      const response = await loadLanguage(langCode);
      if (response) {
        setLangData(response);
      }
    } catch (error) {
      console.error('Error getting language data:', error);
      // setDefaultLangData();
    }
  };

  // const setDefaultLangData = () => {
  //   sessionStorage.setItem('lang', defaultLang);
  //   setLangSelected(defaultLang);
  //   setLangData(defaultLangData);
  // };

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Suspense fallback={<LoadingPage />}>
            
              <Switch>
                <Route exact path="/home">
  <IonContent fullscreen scrollY={true}>
                    <HomePage />
                  </IonContent>
                </Route>
                <Route path="/terms-and-conditions"><AcceptTerms /></Route>
                <Route path="/reset-password"><ResetPassword /></Route>
                <Route path="/login"><LoginPage /></Route>
                <Route path="/register"><SignUp /></Route>
                <Route path="/forgot-password"><ForgotPwdForm /></Route>
                <Route path="/my-profile"><MyProfile /></Route>
                <Route path="/button-variables"><ButtonVariables /></Route>
                
                
                
                   <Route exact path="/" component={UserRouter}>

                </Route>    
              </Switch>
            
          </Suspense>
        </IonRouterOutlet>
      </IonReactRouter>

      <Dialog
        open={consoleOpen}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        fullWidth={true}
        className="dev-tools-msg-modal"
      >
        <DialogContent className="modal-content-ctn">
          <div className="dev-tools-warning-msg">
            {' ' + langData?.['app_security_txt']}
          </div>
        </DialogContent>
      </Dialog>
     </IonApp>
  )
};

// export default App;



export const useConsoleOpen = () => {
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    let checkStatus;

   var element = new Image();

Object.defineProperty(element, '__check__', {
  get: function () {
    checkStatus = true;
    throw new Error('Dev tools checker');
  },
});
    requestAnimationFrame(function check() {
      setTimeout(() => {
        checkStatus = false;
        // Don't delete this console statements
        // Uncomment fater fixing ios issues
        // if (process.env.REACT_APP_NODE_ENV !== 'development') {
        //   console.dir(element);
        //   console.clear();
        // }
        setConsoleOpen(checkStatus);
        requestAnimationFrame(check);
      }, 1000);
    });
  });

  return consoleOpen;
};

const mapStateToProps = (state:any) => {
  return {
    loggedIn: state.auth.loggedIn,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
    setLanguages: (languages: string[]) => dispatch(setLanguages(languages)),
    setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
    setLangData: (langData: any) => dispatch(setLangData(langData)),
    setAlertMsg: (alert:any) => dispatch(setAlertMsg(alert)),
    setDomainConfig: (config:any) => dispatch(setDomainConfig(config)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
