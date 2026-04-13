import React, { useState } from 'react';
import {Backdrop, Dialog, DialogContent, DialogTitle, useMediaQuery, useTheme} from '@mui/material'
import { useHistory } from 'react-router-dom';

import AcceptTermsModal from '../../components/AcceptTermsModal/AcceptTermsModal';
import ChangePwdForm from '../../components/ChangePassword/ChangePassword';
import './index.scss';
import { connect } from 'react-redux';

const AcceptTerms: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const [openAcceptTerms, setOpenAcceptterms] = useState(false);
  const [changePwdModal, setChangePwdModal] = useState(true);
  const history = useHistory();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Note: This component is not visible on UI. Use localization when required to use this.
  return (
    <>
      <Backdrop
        className="backdrop-ctn"
        open={openAcceptTerms || changePwdModal}
      >
        <Dialog
          open={openAcceptTerms}
          aria-labelledby="responsive-dialog-title"
          maxWidth="xs"
        >
          <DialogTitle className="modal-title">
            {langData?.['user_details']}
          </DialogTitle>
          <DialogContent className="modal-content-ctn">
            <AcceptTermsModal
              closeHandler={() => {
                history.push('/');
                setOpenAcceptterms(false);
              }}
              successHandler={() => {
                setOpenAcceptterms(false);
                setChangePwdModal(true);
              }}
              langData={langData}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          fullScreen={fullScreen}
          open={changePwdModal}
          aria-labelledby="responsive-dialog-title"
          maxWidth="xs"
          fullWidth={true}
          className="at-ctn"
        >
          <DialogTitle
            className="modal-title accept-terms-title"
            id="responsive-dialog-title"
          >
            {langData?.['set_your_password_txt']}
          </DialogTitle>

          <DialogContent className="modal-content-ctn">
            <ChangePwdForm
              showTermsCondi={true}
              closeHandler={() => {
                history.push('/');
                setChangePwdModal(false);
              }}
              backHandler={() => {
                setChangePwdModal(false);
                setOpenAcceptterms(true);
              }}
              langData={langData}
            />
          </DialogContent>
        </Dialog>
      </Backdrop>
    </>
  );
};

const mapStateToProps = (state:any) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(AcceptTerms);
