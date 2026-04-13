import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { IonSpinner, IonLabel } from '@ionic/react';
import { TextField, FormControlLabel, Checkbox, Button, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// import API from '../../api/index';
// import { AuthResponse } from '../../models/api/AuthResponse';
import './AcceptTermsModal.scss';

type AcceptTermsProps = {
  closeHandler: () => void;
  successHandler: () => void;
  langData: any;
};

type UserPersonalDetails = {
  firstName: string;
  lastName: string;
  dob: Dayjs;
};

const AcceptTermsModal: React.FC<AcceptTermsProps> = (props) => {
  const { successHandler, langData } = props;
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [progress, setProgress] = useState<boolean>(false);
  const [dob, setDOB] = useState<Dayjs>(dayjs().subtract(18, 'year'));
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      dob: dayjs().subtract(18, 'year'),
      acceptTerms: false,
    },
    validationSchema: Yup.object({
      lastName: Yup.string().required(langData?.['required']),
      acceptTerms: Yup.bool().test(
        'pointsType',
        langData?.['please_accept_tc_txt'],
        () => {
          return formik.values.acceptTerms;
        }
      ),
    }),
    onSubmit: (values) => {
      let data: UserPersonalDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
      };
      setUserDetailsRequest(data);
    },
  });

  const setUserDetailsRequest = async (data) => {
    setProgress(true);
    try {
      // const response: AuthResponse = await API.put('/user/dob', data, {
      //   headers: {
      //     Authorization: sessionStorage.getItem('jwt_token'),
      //     'Content-Type': 'application/json',
      //   },
      // });
      // if (response.status === 200) {
      //   setProgress(false);
      //   successHandler();
      // }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
    }
  };

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="accept-terms-form-ctn"
        autoComplete="off"
      >
        <div className="first-name-input">
          <IonLabel className="input-label">
            {langData?.['first_name']}
          </IonLabel>
          <TextField
            className="login-input-field first-name-field"
            type="text"
            name="firstName"
            variant="outlined"
            {...formik.getFieldProps('firstName')}
          />
        </div>

        <div className="last-name-input">
          <IonLabel className="input-label">{langData?.['last_name']}</IonLabel>
          <TextField
            className="login-input-field last-name-field"
            type="text"
            name="lastName"
            variant="outlined"
            error={
              formik.touched.lastName && formik.errors.lastName ? true : false
            }
            helperText={
              formik.touched.lastName && formik.errors.lastName
                ? formik.errors.lastName
                : null
            }
            {...formik.getFieldProps('lastName')}
          />
        </div>

        <div className="dob-input">
          <IonLabel className="input-label">{langData?.['dob']}</IonLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              className="dob-field date-control"
              format="DD/MM/YYYY"
              value={dob}
              onChange={(newValue) => {
                formik.setFieldValue('dob', newValue);
                setDOB(newValue);
              }}
              maxDate={dayjs().subtract(18, 'year')}
              slotProps={{
                textField: {
                  variant: 'standard',
                  InputProps: {
                    disableUnderline: true,
                  },
                  inputProps: {
                    'aria-label': langData?.['change_date'],
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>

        <div className="accept-terms-input">
          <FormControlLabel
            className="accept-terms-field"
            control={
              <Checkbox
                checked={formik.values.acceptTerms}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                className="accept-terms-checkbox"
                name="acceptTerms"
                color="default"
              />
            }
            label={langData?.['accept_tc_txt']}
            labelPlacement="end"
          />
          {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
            <FormHelperText id="my-helper-text" className="my-helper-text">
              {formik.errors.acceptTerms}
            </FormHelperText>
          ) : null}
        </div>

        {errorMsg !== '' ? <span className="error-msg">{errorMsg}</span> : null}

        <Button
          className="submit-form-btn-accept-terms"
          color="primary"
          endIcon={progress ? <IonSpinner name="lines-small" /> : ''}
          type="submit"
          variant="contained"
        >
          {langData?.['submit']}
        </Button>
      </form>
    </>
  );
};

export default AcceptTermsModal;
