import { IonSpinner } from "@ionic/react";
import { FormControl, FormHelperText, IconButton, InputAdornment, OutlinedInput, TextField, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// import FormControl from "@material-ui/core/FormControl";
// import FormHelperText from "@material-ui/core/FormHelperText";
// import IconButton from "@material-ui/core/IconButton";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import OutlinedInput from "@material-ui/core/OutlinedInput";
// import TextField from "@material-ui/core/TextField";

// import Button from "@material-ui/core/Button";
// import ArrowBackIcon from "@material-ui/icons/ArrowBack";
// import Visibility from "@material-ui/icons/Visibility";
// import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useFormik } from "formik";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useHistory } from "react-router";

import { connect, useDispatch } from "react-redux";
import * as Yup from "yup";
import { setAlertMsg } from "../../store/slices/commonSlice";
// import { setAlertMsg } from "../../store/common/commonActions";
// import SVLS_API from "../../svls-api";
import "./ForgotPassword.scss";
import SocialMediaNew from "../SocialMediaNew/SocialMediaNew";
// import CopyIcon from "../../assets/images/MyProfileIcons/copy_icon.svg";
import { StyledAlertBox } from "../Alert/AlertBox";
import { CONFIG } from "../../config/config";

type ForgotPwdForm = {
    closeHandler: () => void;
    langData: any;
};

const ForgotPwdForm: React.FC<ForgotPwdForm> = (props) => {
    const { langData } = props;
    let history = useHistory();

    return (
        <div className="fgt-pwd">
            <div className="title-row">
                <img
                    src={CONFIG.logo}
                    alt="title"
                    className="logo"
                />
            </div>
            <div className="form-ctn">
                <UsernameVerfication langData={langData} />
            </div>

            <div className="social-media-fp">
                <SocialMediaNew />
            </div>

            <div className="disclaimer-ctn-fg">
                <div className="disclaimer-ctn-text-fg">
                    {langData?.["login_disclaimer_txt"]}
                </div>
            </div>
        </div>
    );
};

function UsernameVerfication({ langData }) {
    const [option, setOption] = useState("Username");
    const [progress, setProgress] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState();
    const [disable, setDisable] = useState(true);
    const [otpTimer, setOtpTimer] = useState<number>();
    const [userName, setUserName] = useState<string>();
    const history = useHistory();
    const dispatch = useDispatch();
    const requiredMessage = langData?.["required"];

    const sendOtpFormik = useFormik({
        initialValues: { username: "", phonenumber: "" },
        validationSchema: () => Yup.object(
            option === "Username"? {
                username: Yup.string()
                .required(requiredMessage)
                .min(4)
                .max(20)
                .trim()
                .matches(
                    /^[a-zA-Z0-9 ]+$/,
                    langData?.["special_characters_restriction_txt"]
                ),
            } : {
                phonenumber: Yup.string().required(requiredMessage),
            }
        ),
        onSubmit: (values) => {
            setErrorMsg(null);
            if (!otpTimer) {
                sendOtp();
            }
        },
    });

    const resetPasswordFormik = useFormik({
        initialValues: { otp: "", newPassword: "", confirmPassword: "" },
        validationSchema: Yup.object({
            otp: Yup.string()
                .required(requiredMessage)
                .trim()
                .length(6)
                .matches(/^[0-9]+$/, langData?.["numbers_restriction_txt"]),
            newPassword: Yup.string().required(requiredMessage).trim(),
            confirmPassword: Yup.string()
                .required(requiredMessage)
                .test(
                    "Confirm password check",
                    langData?.["password_mismatch_txt"],
                    function confirmPasswordCheck(confirmPassword) {
                        return confirmPassword === this.parent.newPassword;
                    },
                ),
        }),
        onSubmit: (values) => {
            setErrMsg(null);

            const resetPwdReq = {
                resetPassword: values.newPassword,
            };
            resetPassword(
                sendOtpFormik.values.username,
                values.otp,
                resetPwdReq,
            );
        },
    });

    const resetPassword = async (
        username: string,
        otp: string,
        request: ResetPasswordRequest,
    ) => {
        try {
            const username = sendOtpFormik.values.username;
            const phoneNumber = sendOtpFormik.values.phonenumber;
            setLoading(true);
            // const response = await SVLS_API.put(
            //     `/account/v2/users/${
            //         option === "Username" ? username : phoneNumber
            //     }/password:resetOnline${
            //         option === "Username"
            //             ? ""
            //             : "?userIdentifierType=PHONE_NUMBER"
            //     }`,
            //     request,
            //     {
            //         params: {
            //             otp: otp,
            //         },
            //     },
            // );
            // dispatch(
            //     setAlertMsg({
            //         type: "success",
            //         message: langData?.["password_update_success_txt"],
            //     }),
            // );
            // setUserName(response.data);
        } catch (err) {
            console.log(err);

            setErrMsg(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {
        try {
            const username = sendOtpFormik.values.username;
            const phoneNumber = sendOtpFormik.values.phonenumber;
            setProgress(true);
            // let response = await SVLS_API.post(
            //     `/account/v2/users/${
            //         option === "Username" ? username : phoneNumber
            //     }/:sendResetPasswordOtp${
            //         option !== "Username"
            //             ? "?userIdentifierType=PHONE_NUMBER"
            //             : ""
            //     }`,
            // );
            // if (response.status === 204) {
            //     handleOtpTimer(60);
            //     setDisable(false);
            // }
        } catch (err) {
            setErrorMsg(err.response?.data?.message);
        } finally {
            setProgress(false);
        }
    };

    const redirectToSignUp = () => {
        history.push("/register");
    };

    const redirectToLogin = () => {
        history.push("/login");
    };

    const handleOtpTimer = (time) => {
        if (time >= 0) {
            setOtpTimer(time);
            setTimeout(() => {
                handleOtpTimer(time - 1);
            }, 1000);
        } else {
            setTimeout(() => {
                setOtpTimer(undefined);
            }, 1000);
        }
    };

    const copyText = (text, toastMessage = langData?.["text_copied_txt"]) => {
        navigator.clipboard.writeText(text);
        dispatch(
            setAlertMsg({
                type: "success",
                message: toastMessage,
            }),
        );
    };

    return (
        <>
            {/* TODO: FIX */}
            <StyledAlertBox />
            <div className="back-icon-fg" onClick={redirectToLogin}>
                <ArrowBackIcon className="  arrow-clr" />
                <span className="back-text">{langData?.["back"]}</span>
            </div>
            <h1>{langData?.["forgot_username_password_txt"]}</h1>
            {userName ? (
                <>
                    <h3>{langData?.["your_username_is_txt"]}:</h3>
                    <div className="display-username">
                        {userName}
                        <button
                            className="r-copy-btn-div"
                            onClick={() =>
                                copyText(
                                    userName,
                                    langData?.["username_copied_txt"],
                                )
                            }
                        >
                            {/* <img
                                src={CopyIcon}
                                className="r-copy-btn"
                                height={28}
                            /> */}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <span className="otp-text">
                        {langData?.["forgot_password_send_otp_txt"]}
                    </span>
                    <form
                        onSubmit={sendOtpFormik.handleSubmit}
                        className="forgot-pwd-form-ctn"
                        autoComplete="off"
                    >
                        <div className="select-input .pwd-field">
                            <select
                                className="option-selection"
                                onChange={(e) => {
                                    setOption(e.target.value);
                                    sendOtpFormik.setFieldValue("username", "");
                                }}
                            >
                                <option value="Username">
                                    {langData?.["user_id"]}
                                </option>
                                <option value="Phone number">
                                    {langData?.["mobile"]}
                                </option>
                            </select>
                            <div className="w-78">
                                {option === "Username" ? (
                                    <TextField
                                        className="login-input-field text-field  userName-otp"
                                        type="text"
                                        name="username"
                                        placeholder={
                                            langData?.["enter_username_txt"]
                                        }
                                        variant="outlined"
                                        autoFocus
                                        error={
                                            sendOtpFormik.touched.username &&
                                            sendOtpFormik.errors.username
                                                ? true
                                                : false
                                        }
                                        helperText={
                                            sendOtpFormik.touched.username &&
                                            sendOtpFormik.errors.username
                                                ? sendOtpFormik.errors.username
                                                : null
                                        }
                                        {...sendOtpFormik.getFieldProps(
                                            "username",
                                        )}
                                    />
                                ) : (
                                    <div className="text-field">
                                        <PhoneInput
                                            inputClass="fp-phone-input"
                                            containerClass="fp-phone-ctn"
                                            country={"in"}
                                            placeholder={
                                                langData?.[
                                                    "enter_phone_number_txt"
                                                ]
                                            }
                                            value={
                                                sendOtpFormik.values.phonenumber
                                            }
                                            onChange={(
                                                value,
                                                country,
                                                e,
                                                formattedValue,
                                            ) => {
                                                sendOtpFormik.setFieldValue(
                                                    "phonenumber",
                                                    value,
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="error-msg">{errorMsg}</div>

                        <Button
                            className="confirm-btn send-btn send-otp"
                            color="primary"
                            type="submit"
                            endIcon={
                                progress ? (
                                    <IonSpinner name="lines-small" />
                                ) : (
                                    ""
                                )
                            }
                            variant="contained"
                            disabled={!sendOtpFormik.isValid}
                        >
                            {otpTimer !== undefined &&
                            otpTimer !== null &&
                            otpTimer >= 0
                                ? `${langData?.["resend_in_txt"]} ${otpTimer} ${langData?.["seconds"]}`
                                : `${langData?.["send_otp"]}`}
                        </Button>
                    </form>
                    <form
                        className="forgot-pwd-form-ctn"
                        onSubmit={resetPasswordFormik.handleSubmit}
                        autoComplete="off"
                    >
                        <div className="usr-input">
                            <TextField
                                className="login-input-field user-name"
                                placeholder={langData?.["enter_otp_txt"]}
                                type="text"
                                name="otp"
                                variant="outlined"
                                autoFocus
                                disabled={disable}
                                error={
                                    resetPasswordFormik.touched.otp &&
                                    resetPasswordFormik.errors.otp
                                        ? true
                                        : false
                                }
                                helperText={
                                    resetPasswordFormik.touched.otp &&
                                    resetPasswordFormik.errors.otp
                                        ? resetPasswordFormik.errors.otp
                                        : null
                                }
                                {...resetPasswordFormik.getFieldProps("otp")}
                            />
                        </div>

                        <div className="usr-input">
                            <FormControl
                                className="login-input-field pwd-field"
                                variant="outlined"
                                error={
                                    resetPasswordFormik.touched.newPassword &&
                                    resetPasswordFormik.errors.newPassword
                                        ? true
                                        : false
                                }
                            >
                                <OutlinedInput
                                    id="standard-adornment-password"
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    disabled={disable}
                                    placeholder={
                                        langData?.["enter_new_password_txt"]
                                    }
                                    {...resetPasswordFormik.getFieldProps(
                                        "newPassword",
                                    )}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword,
                                                    )
                                                }
                                                onMouseDown={(event) =>
                                                    event.preventDefault()
                                                }
                                            >
                                                {showNewPassword ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                {resetPasswordFormik.touched.newPassword &&
                                resetPasswordFormik.errors.newPassword ? (
                                    <FormHelperText error id="my-helper-text">
                                        {resetPasswordFormik.errors.newPassword}
                                    </FormHelperText>
                                ) : null}
                            </FormControl>
                        </div>

                        <div className="usr-input">
                            <FormControl
                                className="login-input-field pwd-field"
                                variant="outlined"
                                error={
                                    resetPasswordFormik.touched
                                        .confirmPassword &&
                                    resetPasswordFormik.errors.confirmPassword
                                        ? true
                                        : false
                                }
                            >
                                <OutlinedInput
                                    id="standard-adornment-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    disabled={disable}
                                    placeholder={
                                        langData?.["enter_confirm_password_txt"]
                                    }
                                    {...resetPasswordFormik.getFieldProps(
                                        "confirmPassword",
                                    )}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                onMouseDown={(event) =>
                                                    event.preventDefault()
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <Visibility className="no-margin" />
                                                ) : (
                                                    <VisibilityOff className="no-margin" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                {resetPasswordFormik.touched.confirmPassword &&
                                resetPasswordFormik.errors.confirmPassword ? (
                                    <FormHelperText error id="my-helper-text">
                                        {
                                            resetPasswordFormik.errors
                                                .confirmPassword
                                        }
                                    </FormHelperText>
                                ) : null}
                            </FormControl>
                        </div>

                        <span className="error-msg">{errMsg}</span>

                        <Button
                            className="confirm-btn reset-btn width"
                            color="primary"
                            endIcon={
                                loading ? <IonSpinner name="lines-small" /> : ""
                            }
                            type="submit"
                            variant="contained"
                            disabled={
                                disable ||
                                !resetPasswordFormik.isValid ||
                                (userName ? true : false)
                            }
                        >
                            {langData?.["reset_password_txt"]}
                        </Button>
                    </form>
                </>
            )}
            <div className="dont-have-accnt" onClick={redirectToSignUp}>
                <div className="account-dontHaveAccount">
                    {langData?.["account_not_found_txt"]}
                </div>
                <span className="back-to-SignUp">{langData?.["sign_up"]}</span>
            </div>
        </>
    );
}

type ResetPasswordRequest = {
    resetPassword: string;
};

type ResetPasswordProps = {
    username: string;
    setActiveStep: Function;
};

const mapStateToProps = (state: any) => {
    return {
        langData: state.common.langData,
    };
};

export default connect(mapStateToProps, null)(ForgotPwdForm);
