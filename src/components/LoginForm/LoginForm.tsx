import React, { useEffect, useState } from 'react';
import { IonLabel, IonSpinner } from '@ionic/react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { Button, FormControl, FormHelperText, IconButton, InputAdornment, OutlinedInput, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Android } from '@mui/icons-material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { connect, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ResetTwoFactor from '../ResetTwoFactor/ResetTwoFactor';
// import {
//   fetchBalance,
//   loginFailed,
//   loginSuccess,
//   requestEnd,
//   requestStart,
// } from '../../store';
// import SVLS_API from '../../svls-api';
import SocialMediaNew from '../SocialMediaNew/SocialMediaNew';
import './LoginForm.scss';
// import AUTH_API from '../../api-services/auth-api';
// import { getSapToken } from '../../store/auth/authActions';
// import { Android } from '@material-ui/icons';
import downloadIcon from '../../assets/images/icons/download-icon.svg';
import { loginFailed, loginSuccess, requestStart, requestEnd } from '../../store/slices/authSlice';
import { postAPI } from '../../services/apiInstance';
import { CONFIG } from '../../config/config';



const LoginForm = (props:any) => {
  const {
    errorMsg,
    loading,
    loggedIn,
    loginSuccess,
    loginFailed,
    requestStart,
    requestEnd,
    // fetchBalance,
    modalCloseHandler,
    redirectUrl,
    domainConfig,
    langData,
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const [useAuthenticator, setUseAuthenticator] = useState<boolean>(false);
  const [showForgotPwdModal, setShowForgotPwdModal] = useState(false);
  const [loadLogin, setLoadLogin] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // 2FA state
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Reset 2FA state
  const [showReset2FA, setShowReset2FA] = useState(false);

  const dispatch = useDispatch();
  let history = useHistory();
  const { search } = useLocation();
  const authToken = new URLSearchParams(search).get('authToken');
  useEffect(() => {
    if (authToken) {
      // getSapToken(authToken);
      const username = authToken?.split('.')?.[1];
      let uname = JSON.parse(window?.atob(username)).sub;
      let uid = JSON.parse(window?.atob(username)).uid;
      sessionStorage.setItem('username', uname);
      sessionStorage.setItem('aid', uid);
      sessionStorage.setItem('jwt_token', authToken);
      let claim = authToken.split('.')[1];
      sessionStorage.setItem('aid', JSON.parse(window.atob(claim)).aid);
      // loginSuccess(authToken);
      history.push('/home');
      // fetchBalance();
    }
  }, [authToken]);

  const formik = useFormik({
    initialValues: { username: '', password: '', code: '' },
    validationSchema: Yup.object({
      username: Yup.string().required(langData?.['required']),
      password: Yup.string().required(langData?.['required']),
      code: Yup.string().when("show2FAInput", ([show2FAInput], schema) => {
        return show2FAInput
          ? schema
              .required(langData?.['required'])
              .length(6, "Code must be 6 digits")
          : schema;
      }),
    }),
    onSubmit: async (values) => {
      requestStart();

      try {
        // // First check if 2FA is enabled for this user
        // const twoFAStatus = await SVLS_API.post(
        //   '/account/two-factor-auth/is-2fa-enabled',
        //   {
        //     username: values.username.toLowerCase(),
        //     password: values.password.trim(),
        //   }
        // );

        // // If 2FA is required (status = 2) but no OTP provided, show 2FA input
        // if (twoFAStatus.data === 2 && !values.code) {
        //   setPendingLoginData({
        //     username: values.username.toLowerCase(),
        //     password: values.password.trim(),
        //   });
        //   setShow2FAInput(true);
        //   requestEnd();
        //   return;
        // }

        // // Determine login request type based on 2FA status
        // let loginRequestType = 'PHONE_SIGN_IN'; // Default
        // if (twoFAStatus.data === 1) {
        //   loginRequestType = 'EMAIL_SIGN_IN';
        // } else if (twoFAStatus.data === 2) {
        //   loginRequestType = 'TWO_FACTOR_SIGN_IN';
        // }

        const loginRequest = {
          user: {
            username: values.username,
            password: values.password.trim(),
            // otp: values.code || '',
            // loginRequestType,
            siteurl: CONFIG.siteurl,
            manager: "",
            activity_details: window.ipInfo || ''
          }
        };
        
        const response = await postAPI('/loginUser', loginRequest);
        requestEnd();

        // console.log('response: ', response);
        if(response?.data?.success) {
          const user = response?.data?.output;
          loginSuccess({
            user: user?.details,
            token: user?.verifytoken
          });

          if (user?.details?.transctionpasswordstatus == 0) {
            history.replace('/terms-and-conditions');
          } 
          // else if (status === 4) {
          //   history.replace('/reset-password');
          // }

          if (redirectUrl) {
            // console.log(redirectUrl);
            history.push(redirectUrl);
          }
        }


        // getSapToken(response.data);

        // sessionStorage.setItem('username', values.username.toLowerCase());
        // sessionStorage.setItem('jwt_token', response.data);
        // let claim = response.data.split('.')[1];
        // let status = JSON.parse(window.atob(claim)).sts;

        // sessionStorage.setItem('aid', JSON.parse(window.atob(claim)).aid);

        // localStorage.removeItem(
        //   `multiMarket_${values?.username?.toLowerCase()}`
        // );

        // loginSuccess(response.data);

        // if (status === 2) {
        //   history.replace('/terms-and-conditions');
        // } else if (status === 4) {
        //   history.replace('/reset-password');
        // }

        // if (redirectUrl) {
        //   console.log(redirectUrl);
        //   history.push(redirectUrl);
        // }
      } catch (err) {
        loginFailed(err.response.data.message);
      } finally {
        requestEnd();
      }
    },
  });

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLoginData || !twoFactorCode.trim()) return;

    try {
      // setIs2FALoading(true);

      // const loginRequest = {
      //   username: pendingLoginData.username,
      //   password: pendingLoginData.password,
      //   otp: twoFactorCode,
      //   loginRequestType: 'TWO_FACTOR_SIGN_IN',
      // };

      // const response = await AUTH_API.post('/account/v2/login', loginRequest);

      // // Reset state on success
      // setShow2FAInput(false);
      // setPendingLoginData(null);
      // setTwoFactorCode('');
      // setIs2FALoading(false);

      // getSapToken(response.data);
      // sessionStorage.setItem('username', pendingLoginData.username);
      // sessionStorage.setItem('jwt_token', response.data);
      // let claim = response.data.split('.')[1];
      // let status = JSON.parse(window.atob(claim)).sts;

      // sessionStorage.setItem('aid', JSON.parse(window.atob(claim)).aid);

      // localStorage.removeItem(`multiMarket_${pendingLoginData.username}`);

      // loginSuccess(response.data);

      // if (status === 2) {
      //   history.replace('/terms-and-conditions');
      // } else if (status === 4) {
      //   history.replace('/reset-password');
      // }

      // if (redirectUrl) {
      //   history.push(redirectUrl);
      // }
    } catch (err) {
      setIs2FALoading(false);
      loginFailed(err.response.data.message);
    }
  };

  const handle2FABack = () => {
    setShow2FAInput(false);
    setPendingLoginData(null);
    setTwoFactorCode('');
    setIs2FALoading(false);
  };

  const formatOTPInput = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    return numericValue;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatOTPInput(e.target.value);
    setTwoFactorCode(formattedValue);
  };

  // Reset 2FA handlers
  const handleReset2FABack = () => {
    setShowReset2FA(false);
  };

  const handleReset2FASuccess = () => {
    setShowReset2FA(false);
    setShow2FAInput(false);
    setPendingLoginData(null);
    setTwoFactorCode('');
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setLoadLogin(false);
    requestStart();
    try {
      const response = await postAPI('/LoginWithDemo', {});

      setDemoLoading(false);
      if (response.status == 200 && response.data?.success) {
        requestEnd();

        // let claim = response.data.split('.')[1];
        // const username = JSON.parse(window.atob(claim)).sub;
        
        // sessionStorage.setItem('username', username.toLowerCase());
        // sessionStorage.setItem('jwt_token', response.data);
        // sessionStorage.setItem('aid', JSON.parse(window.atob(claim)).aid);
        // localStorage.removeItem(`multiMarket_${username.toLowerCase()}`);
        const user = response.data?.user;

        loginSuccess({
          token: user?.verifytoken,
          user: user?.details
        });
        if (redirectUrl) {
          history.push(redirectUrl);
        }
      }
    } catch (err) {
      setDemoLoading(false);
      console.log(err);
    }
  };


  useEffect(() => {
    if (loggedIn) {
      history.push('/home');
      modalCloseHandler();
    }
  }, [loggedIn, modalCloseHandler]);

  const showPasswordClickHandler = () => {
    setShowPassword(!showPassword);
  };

  const onRedirectToHome = () => {
    history.push('/home');
  };

  const onRedirectToSignUp = () => {
    history.push('/register');
  };

  const isApkAvailable = domainConfig.apkUrl;

  const downloadApp = () => {
    const url = domainConfig.apkUrl;
    const link = document.createElement('a');
    link.href = 'https://' + url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="login-form-page">
        {showReset2FA ? (
          <ResetTwoFactor
            langData={langData}
            onBack={handleReset2FABack}
            onSuccess={handleReset2FASuccess}
          />
        ) : show2FAInput ? (
          <form
            onSubmit={handle2FASubmit}
            className="login-form-ctn"
            autoComplete="off"
          >
            <div className="back-icon" onClick={handle2FABack}>
              <div className="back">
                <ArrowBackIcon className="arrow-clr" />
                <span className="back-text">{langData?.['back']}</span>
              </div>
            </div>

            <div className="card-title">
              {langData?.['two_factor_auth'] || 'Two-Factor Authentication'}
            </div>
            <span className="card-login-here">
              {langData?.['2fa_login_description'] ||
                'Enter the 6-digit code from your authenticator app'}
            </span>

            <div className="code-input">
              <IonLabel className="input-labell">
                {langData?.['2fa_otp_label'] || 'Authentication Code'}{' '}
                <span className="red-text">*</span>
              </IonLabel>
              <TextField
                className="login-input-field user-name"
                type="text"
                value={twoFactorCode}
                onChange={handleOTPChange}
                placeholder="123456"
                variant="outlined"
                inputProps={{ maxLength: 6 }}
                style={{
                  textAlign: 'center',
                  fontSize: '18px',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {errorMsg !== '' ? (
              <span className="login-err-msg">{errorMsg}</span>
            ) : null}

            <div className="login-demologin-btns" style={{ marginTop: '16px' }}>
              <Button
                className="login-form-btn-without-demologin"
                color="primary"
                endIcon={is2FALoading ? <IonSpinner name="lines-small" /> : ''}
                type="submit"
                variant="contained"
                disabled={is2FALoading || twoFactorCode.length !== 6}
              >
                {langData?.['verify_and_login'] || 'Verify & Login'}
              </Button>
            </div>

            <div className="reset-2fa-link-section">
              <button
                type="button"
                className="reset-2fa-link"
                onClick={() => setShowReset2FA(true)}
              >
                {langData?.['reset_two_factor_auth'] ||
                  'Reset Two-Factor Authentication'}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={formik.handleSubmit}
            className="login-form-ctn"
            autoComplete="off"
          >
            <div className="back-icon" onClick={onRedirectToHome}>
              <div className="back">
                <ArrowBackIcon className="  arrow-clr" />
                <span className="back-text">{langData?.['back']}</span>
              </div>
              <div className="demo">
                {domainConfig.demoUser ? (
                  <Button
                    className="login-form-btn-demo"
                    color="primary"
                    endIcon={
                      demoLoading ? <IonSpinner name="lines-small" /> : ''
                    }
                    onClick={handleDemoLogin}
                    variant="contained"
                  >
                    {langData?.['demo_login']}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="card-title">{langData?.['sign_in']}</div>

            <span className="card-login-here">
              {langData?.['enter_login_details_txt']}
            </span>

            <span className="usr-input">
              <IonLabel className="input-labell">
                {langData?.['username']} <span className="red-text">*</span>
              </IonLabel>
              <TextField
                className="login-input-field user-name"
                type="text"
                name="username"
                placeholder={langData?.['username']}
                variant="outlined"
                error={ formik.touched.username && formik.errors.username? true : false }
                helperText={formik.touched.username && formik.errors.username? formik.errors.username : null}
                {...formik.getFieldProps('username')}
              />
            </span>

            <div className="pwd-input">
              <IonLabel className="input-labell">
                {langData?.['password']} <span className="red-text">*</span>
              </IonLabel>
              <FormControl
                className="login-input-field pwd-field"
                variant="outlined"
                style={{ overflow: 'hidden' }}
                error={ formik.touched.password && formik.errors.password? true : false }
              >
                <OutlinedInput
                  id="standard-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  {...formik.getFieldProps('password')}
                  placeholder={langData?.['password']}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={showPasswordClickHandler}
                        onMouseDown={showPasswordClickHandler}
                      >
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {formik.touched.password && formik.errors.password ? (
                  <FormHelperText error id="my-helper-text">
                    {formik.errors.password}
                  </FormHelperText>
                ) : null}
              </FormControl>
            </div>

            {domainConfig.b2cEnabled && domainConfig.signup ? (
              <div className="forgot-pwd">
                <NavLink to="/forgot-password">
                  {langData?.['forgot_username_password_txt']}
                </NavLink>
              </div>
            ) : (
              <div style={{ height: '20px', background: 'transparent' }}></div>
            )}

            {useAuthenticator ? (
              <span className="code-input">
                <IonLabel className="input-labell">
                  {langData?.['code']}
                </IonLabel>
                <TextField
                  className="login-input-field user-name"
                  type="text"
                  name="username"
                  variant="outlined"
                  {...formik.getFieldProps('code')}
                />
              </span>
            ) : null}

            {errorMsg !== '' ? (
              <span className="login-err-msg">{errorMsg}</span>
            ) : null}

            <div className="login-demologin-btns">
              <Button
                className={
                  domainConfig.demoUser
                    ? 'login-form-btn'
                    : 'login-form-btn-without-demologin'
                }
                color="primary"
                endIcon={loading ? <IonSpinner name="lines-small" /> : ''}
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {langData?.['login']}
              </Button>
            </div>
          </form>
        )}
        <div className="account-SignUp" onClick={onRedirectToSignUp}>
          {domainConfig.b2cEnabled && domainConfig.signup && (
            <>
              <div className="account-dontHaveAccount">
                {' '}
                {langData?.['account_not_found_txt']}
              </div>
              <span className="back-to-SignUp">{langData?.['sign_up']}</span>
            </>
          )}
        </div>

        {isApkAvailable && (
          <div className="download-apk" onClick={downloadApp}>
            <Android className="android-icon" />
            <span className="donwload-txt">Download .apk</span>
            <img src={downloadIcon} alt="Android" className="donwload-icon" />
          </div>
        )}

        <div className="socialMedia-login">
          <SocialMediaNew />
        </div>
        <div className="disclaimer-ctn-text">
          <div className="disclaimer-width">
            {langData?.['login_disclaimer_txt']}
          </div>
        </div>
        {window.location.hostname?.includes('fairplay') && (
          <div className="disclaimer-privacy">
            <NavLink to={`/fairplay-terms-conditions`}>
              {langData?.['terms_conditions']}
            </NavLink>
            <NavLink to={`/fairplay_policy`}>
              {langData?.['privacy_policy']}
            </NavLink>
          </div>
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state:any) => {
  return {
    loading: state.auth.loading,
    loggedIn: state.auth.loggedIn,
    errorMsg: state.auth.loginError,
    domainConfig: state.common.domainConfig,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    // fetchBalance: () => dispatch(fetchBalance()),
    loginSuccess: (payload) => dispatch(loginSuccess(payload)),
    loginFailed: (err: string) => dispatch(loginFailed(err)),
    requestStart: () => dispatch(requestStart()),
    requestEnd: () => dispatch(requestEnd()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
