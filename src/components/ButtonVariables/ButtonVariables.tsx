import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';

// import SVLS_API from '../../api-services/svls-api';
import  StakeSettingsIcon  from '../../assets/images/reportIcons/StakeSettings.svg';
import MinusIcon from '../../assets/images/StakeSettings/minus.svg';
import PlusIcon from '../../assets/images/StakeSettings/plus.svg';
import ReportsHeader from '../../common/ReportsHeader/ReportsHeader';
import Spinner from '../../components/Spinner/Spinner';
// import { ButtonVariable } from '../../models/ButtonVariables';
// import { RootState } from '../../models/RootState';
// import { fetchButtonVariables } from '../../store';
import './ButtonVariables.scss';
import { useHistory } from 'react-router-dom';
import ReportBackBtn from '../../common/ReportBackBtn/ReportBackBtn';
import { setAlertMsg } from '../../store/slices/commonSlice';
// import { AlertDTO } from '../../models/Alert';

type StoreProps = {
  buttonVariables: any[];
//   fetchButtonVariables: () => void;
  setAlertMsg: Function;
  langData: any;
};

const MyBets: React.FC<StoreProps> = (props) => {
  const { buttonVariables, setAlertMsg, langData } =
    props;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [updateVariables, setUpdateVariables] = useState<any[]>([]);

  const updateButtonVariables = async () => {
    setLoading(true);
    for (let uV of updateVariables) {
      if (!uV.label || !uV.stake) {
        dispatch(
          setAlertMsg({
            type: 'error',
            message: langData?.['invalid_label_or_amount_txt'],
          })
        );
        return 0;
      }
    }
    // const response = await SVLS_API.put(
    //   '/catalog/v2/settings/favourite-stakes/users',
    //   updateVariables,
    //   {
    //     headers: {
    //       Authorization: sessionStorage.getItem('jwt_token'),
    //     },
    //   }
    // );
    // if ((response.status = 200)) {
    //   setAlertMsg({
    //     type: 'success',
    //     message: langData?.['button_variables_save_success_txt'],
    //   });
    // } else {
    //   setAlertMsg({
    //     type: 'error',
    //     message: langData?.['general_err_txt'],
    //   });
    // }
    // fetchButtonVariables();
    setLoading(false);
  };

  useEffect(() => {
    // fetchButtonVariables();
  }, []);

//   useEffect(() => {
//     setUpdateVariables(buttonVariables);
//   }, [buttonVariables]);

useEffect(() => {
  const dummyButtons = [
    { label: "100", stake: 100 },
    { label: "500", stake: 500 },
    { label: "1000", stake: 1000 },
    { label: "2000", stake: 2000 },
    { label: "5000", stake: 5000 },
    { label: "10000", stake: 10000 },
  ];

  setUpdateVariables(dummyButtons);
}, []);

  const updateButtonLabel = (index: number, label: string) => {
    const updateBtnVars = [...updateVariables];
    updateBtnVars[index].label = label;
    setUpdateVariables(updateBtnVars);
  };

  const updateButtonAmount = (index: number, amt: number) => {
    const updateBtnVars = [...updateVariables];
    updateBtnVars[index].stake = amt;
    setUpdateVariables(updateBtnVars);
  };

  const addOrRemove = (index: number, stake: number, operation: string) => {
    if (stake === undefined || stake === null) {
      dispatch(
        setAlertMsg({
          type: 'error',
          message: langData?.['enter_min_value_txt'],
        })
      );
    }

    const updateBtnVars = [...updateVariables];
    if (operation === '+') {
      updateBtnVars[index].stake += updateBtnVars[index].stake;
    } else {
      updateBtnVars[index].stake -= Math.floor(updateBtnVars[index].stake / 2);
      if (updateBtnVars[index].stake <= 0) {
        updateBtnVars[index].stake = 0;
      }
    }
    setUpdateVariables(updateBtnVars);
  };

  let history = useHistory();
  const onRedirectToHome = () => {
    history.push('/home');
  };

  return (
    <div className="button-variables-ctn">
      <div className="stake-settings">
        <ReportBackBtn back={langData?.['back']} />
        {loading ? <Spinner /> : null}
        <ReportsHeader
          titleIcon={StakeSettingsIcon}
          reportName={langData?.['stake_settings']}
          reportFilters={[
            {
              element: (
                <div className="text">
                  {langData?.['change_input_label_settings_txt']}:
                </div>
              ),
            },
          ]}
          tabsOrBtns={[
            {
              label: langData?.['save'],
              onSelect: () => updateButtonVariables(),
              className: 'black-font',
            },
          ]}
        />
        <div className="stake-settings-ctn">
          {updateVariables?.map((bV, idx) => (
            <div className="indv-stake-btn " key={'stake-btn' + idx}>
              <div className="label-text">
                <div className="label-text-sub">
                  {langData?.['button_label']}
                </div>
                <input
                  type="text"
                  className="bt-input"
                  value={bV.label}
                  onChange={(e) => updateButtonLabel(idx, e.target.value)}
                />
              </div>

              <div className="label-number">
                <div className="label-text-sub">
                  {langData?.['input_value']}
                </div>

                <div className="support-add-stake-input">
                  <div className="add-stake-input">
                    <div
                      className="plus-div"
                      onClick={() => addOrRemove(idx, bV.stake, '+')}
                    >
                      <img className="plus-btn" src={PlusIcon} alt="" />
                    </div>

                    <input
                      type="number"
                      className="bt-input width"
                      value={bV.stake}
                      onChange={(e) =>
                        updateButtonAmount(idx, parseFloat(e.target.value))
                      }
                    />

                    <div
                      className="minus-div"
                      onClick={() => addOrRemove(idx, bV.stake, '-')}
                    >
                      <img className="minus-btn" src={MinusIcon} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    buttonVariables: state.exchBetslip.buttonVariables,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    // fetchButtonVariables: () => dispatch(fetchButtonVariables()),
    setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyBets);
