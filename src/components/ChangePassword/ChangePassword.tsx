import { IonSpinner } from '@ionic/react';
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, OutlinedInput, TextField, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { logout } from '../../store/slices/authSlice';
// import SVLS_API from '../../svls-api';
import './ChangePassword.scss';
import CustomButton from '../../common/CustomButton/CustomButton';
import { storageManager } from '../../util/storageManager';
import { postAPIAuth } from '../../services/apiInstance';


type ChangePwdProps = {
    logout: Function;
    showTermsCondi?: boolean;
    closeHandler: () => void;
    backHandler: () => void;
    langData: any;
};

type ChangePasswordRequest = {
    oldPassword: any;
    newPassword: string;
};

const ChangePwdForm: React.FC<ChangePwdProps> = (props) => {
    const { logout, closeHandler, showTermsCondi, langData } = props;
    const [progress, setProgress] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>(null);
    const [successMsg, setSuccessMsg] = useState<string>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            oldPwd: '',
            newPwd: '',
            confNewPwd: '',
            acceptTerms: false,
        },
        validationSchema: Yup.object({
            oldPwd: Yup.string().required(langData?.['required']),
            newPwd: Yup.string()
                .required(langData?.['required'])
                .matches(
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?"()[\]-]{8,}$/,
                    langData?.['choose_strong_password_txt']
                ),
            confNewPwd: Yup.string().required(langData?.['required']),
            acceptTerms: showTermsCondi
            ? Yup.bool().test(
                'pointsType',
                langData?.['please_accept_tc_txt'],
                () => {
                return formik.values.acceptTerms;
                }
            )
            : Yup.string().optional(),
        }),
        onSubmit: (values) => {
            setErrorMsg(null);
            setSuccessMsg(null);
            const data: ChangePasswordRequest = {
                oldPassword: values.oldPwd.trim(),
                newPassword: values.newPwd.trim(),
            };
            if (values.newPwd === values.confNewPwd) {
                if (values.newPwd === values.oldPwd) {
                setErrorMsg(langData?.['new_password_err_txt']);
                } else {
                updateNewPassword(data);
                }
            } else {
                setErrorMsg(langData?.['password_mismatch_txt']);
            }
        },
    });

const updateNewPassword = async (data) => {
  try {
    setProgress(true);

    const payload = {
      password: data.newPassword, 
    };

    console.log("Sending Change Password:", payload);

    const response = await postAPIAuth('/changePasswordAPI', payload);

    console.log("Change Password Response:", response);

    if (response?.data?.success) {
      setSuccessMsg("Password changed successfully");
      logout();
    } else {
      setErrorMsg(response?.data?.message);
    }

  } catch (err) {
    console.log("Error:", err);
    setErrorMsg(err?.response?.data?.message || "Something went wrong");
  } finally {
    setProgress(false);
  }
};

    const removeAllFields = () => {
        formik.setFieldValue('newPwd', '');
        formik.setFieldValue('oldPwd', '');
        formik.setFieldValue('confNewPwd', '');
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="cp-ctn cp-ctn-custom-padding"
            autoComplete="off"
        >
            {/* <div className="change-password-title"><img src={ChangePwdIcon} className="change-pwd-icon" />Change Password</div> */}
            <span className="cp-input-template">
                <div className="cp-label">
                    {langData?.['enter_old_password_txt'] || 'Enter Old Password'}
                </div>
                <TextField
                    className="cp-input"
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPwd"
                    variant="outlined"
                    placeholder={langData?.['enter_old_password_txt'] || 'Enter Old Password'}
                    error={!!(formik.touched.oldPwd && formik.errors.oldPwd)}
                    helperText={
                        formik.touched.oldPwd && formik.errors.oldPwd
                        ? formik.errors.oldPwd
                        : null
                    }
                    {...formik.getFieldProps('oldPwd')}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowOldPassword((prev) => !prev)}
                                        edge="start"
                                    >
                                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </span>

            <div className="cp-input-template">
                <div className="cp-label">
                    {langData?.['enter_new_password_txt'] || 'Enter New Password'}
                    {/* <Tooltip
                        className="input-tooltip"
                        title="Password must contains at least 8 characters and at most 20 characters (It contains at least One Uppercase, One Lowercase and One Number)"
                    >
                        <HelpOutlineIcon />
                    </Tooltip> */}
                </div>
                <FormControl
                    className="cp-input"
                    variant="outlined"
                    error={formik.touched.newPwd && formik.errors.newPwd ? true : false}
                >
                    <OutlinedInput
                        id="standard-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        name="newPwd"
                        placeholder={langData?.['enter_new_password_txt'] || 'Enter New Password'}
                        {...formik.getFieldProps('newPwd')}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    edge="start"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    {formik.touched.newPwd && formik.errors.newPwd ? (
                        <FormHelperText error id="my-helper-text">
                            {formik.errors.newPwd}
                        </FormHelperText>
                    ) : null}
                </FormControl>
            </div>

            <div className="cp-input-template">
                <div className="cp-label">
                    {langData?.['confirm_new_password_txt'] || 'Confirm New Password'}
                </div>
                <FormControl
                    className="cp-input"
                    variant="outlined"
                    error={formik.touched.confNewPwd && formik.errors.confNewPwd ? true : false}
                >
                    <OutlinedInput
                        id="standard-adornment-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confNewPwd"
                        placeholder={langData?.['confirm_new_password_txt'] || 'Confirm New Password'}
                        {...formik.getFieldProps('confNewPwd')}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    edge="start"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    {formik.touched.confNewPwd && formik.errors.confNewPwd ? (
                        <FormHelperText error id="my-helper-text">
                        {formik.errors.confNewPwd}
                        </FormHelperText>
                    ) : null}
                </FormControl>
            </div>

            {showTermsCondi ? (
                <div className="accept-terms-input">
                    <FormControlLabel
                        className="accept-terms-field"
                        control={
                            <Checkbox
                                checked={formik.values.acceptTerms}
                                onChange={(e) => {formik.handleChange(e);}}
                                className="accept-terms-checkbox"
                                name="acceptTerms"
                                color="default"
                            />
                        }
                        label={langData?.['accept_tc_txt'] || 'Accept Terms & Conditions'}
                        labelPlacement="end"
                    />
                    {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
                        <FormHelperText id="my-helper-text" className="my-helper-text">
                        {formik.errors.acceptTerms}
                        </FormHelperText>
                    ) : null}
                </div>
            ) : null}

            {errorMsg !== '' ? <span className="error-msg">{errorMsg}</span> : null}
            {successMsg !== '' ? (
                <span className="success-msg">{successMsg}</span>
            ) : null}
            <div className="cp-btn-div">
                <CustomButton
                    text={langData?.['reset'] || 'Reset'}
                    onClick={removeAllFields}
                    variant={2}
                />
                <CustomButton
                    text={langData?.['save'] || 'Save'}
                    type="submit"
                    variant={1}
                />
            </div>
        </form>
    );
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        logout: () => dispatch(logout()),
    };
};

export default connect(null, mapDispatchToProps)(ChangePwdForm);
