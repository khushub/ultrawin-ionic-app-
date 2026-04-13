import React, { useState } from 'react';
import { Backdrop, Dialog, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import { useHistory } from 'react-router-dom';
import ChangePwdForm from '../../components/ChangePassword/ChangePassword';
import { connect } from 'react-redux';


const ResetPasswordPage: React.FC<{ langData: any }> = (props) => {
    const { langData } = props;
    const [changePwdModal, setChangePwdModal] = useState(true);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const history = useHistory();
    
    return (
        <>
            <Backdrop className="backdrop-ctn" open={changePwdModal}>
                <Dialog
                    fullScreen={fullScreen}
                    fullWidth={true}
                    open={changePwdModal}
                    aria-labelledby="responsive-dialog-title"
                    maxWidth="xs"
                >
                    <DialogTitle className="modal-title" id="responsive-dialog-title">
                        {langData?.['set_your_password_txt']}
                    </DialogTitle>
                    <DialogContent className="modal-content-ctn">
                        <ChangePwdForm
                            closeHandler={() => {
                                history.push('/');
                                setChangePwdModal(false);
                            }}
                            backHandler={() => {
                                setChangePwdModal(false);
                            }}
                            langData={langData}
                        />
                    </DialogContent>
                </Dialog>
            </Backdrop>
        </>
    );
};

const mapStateToProps = (state: any) => {
    return {
        langData: state.common.langData,
    };
};

export default connect(mapStateToProps, null)(ResetPasswordPage);
