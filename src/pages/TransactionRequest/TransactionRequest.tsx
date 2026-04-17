import { IonButton, IonCol, IonRow } from '@ionic/react';
import {
  Backdrop,
  Drawer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
// import AGPAY_API from '../../api-services/feature-api';
import  MyTransaction from '../../assets/images/reportIcons/MyTransaction.svg';
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from '../../common/CustomTableMob/CustomTableMob';
import DateTemplate from '../../common/DateAndTimeTemplate/DateAndTimeTemplate';
import ReportBackBtn from '../../common/ReportBackBtn/ReportBackBtn';
import ReportsHeader from '../../common/ReportsHeader/ReportsHeader';
import SelectTemplate from '../../common/SelectTemplate/SelectTemplate';
import Spinner from '../../components/Spinner/Spinner';
import { CURRENCY_TYPE_FACTOR } from '../../constants/CurrencyTypeFactor';
// import { RootState } from '../../models/RootState';
// import { TransactionsResponse } from '../../models/TransactionsResponse';
// import { AuthResponse } from '../../models/api/AuthResponse';
// import {
//   fetchBalance,
//   fetchBettingCurrency,
//   getCurrencyTypeFromToken,
//   setOpenDepositModal,
//   setOpenWithdrawModal,
// } from '../../store';
import { demoUser, notDemoUser } from '../../util/stringUtil';
import Deposit from '../Payment/Deposit';
import Withdrawal from '../Payment/Withdrawal';
import './TransactionRequest.scss';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { setAlertMsg } from '../../store/slices/commonSlice';
// import REPORTING_API from '../../reporting-api';

type TransactionProps = {
  openDepositModal: boolean;
  openWithdrawModal: boolean;
//   setOpenDepositModal: Function;
//   setOpenWithdrawModal: Function;
  whatsappDetails: string;
  langData: any;
//   fetchBalance: Function;
};

// TODO: use this.
const TransactionMap = {
  IN_PROGRESS: 'In Progress',
  INITIATED: 'Initiated',
  APPROVAL_PENDING: 'Approval Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const TransactionRequest: React.FC<TransactionProps> = (props) => {
  const {
    openDepositModal,
    openWithdrawModal,
    // setOpenDepositModal,
    // setOpenWithdrawModal,
    whatsappDetails,
    langData,
    // fetchBalance,
  } = props;
  const domainConfig = useSelector(
    (state: any) => state.common.domainConfig
  );
  const history = useHistory();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState<Boolean>(false);
  const [transactionRequest, setTransactionRequest] = useState<
    any[]
  >([]);
  const [fromDate, setfromDate] = useState<Moment>(moment().subtract(3, 'd'));
  const [toDate, setToDate] = useState<Moment>(moment());
  const [transactionStatus, setTransactionStatus] = useState<string>('ALL');
  const [transactionType, setTransactionType] = useState<string>('ALL');
  const [currpage, setcurrpage] = useState<number>(1);
//   const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const cFactor = CURRENCY_TYPE_FACTOR["INR"];
  const pageSize = 25;
  const [pageToken, setPageToken] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const [sectionTabVal, setSectionTabVal] = useState(0);
  const [showDeposit, setShowDeposit] = useState<boolean>(true);
  const [showWithdrawal, setShowWithdrawal] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const dispatch = useDispatch();

  const headerParams: HeaderParamsType[] = [
    {
      label: 'Transaction Type',
      langKey: 'transaction_type',
      param: '',
      widthInPercent: 40,
    },
    { label: 'Status', langKey: 'status', param: '', widthInPercent: 20 },
    { label: 'Amount', langKey: 'amount', param: '', widthInPercent: 20 },
    { label: 'Txn ID', langKey: 'txn_id', param: '', widthInPercent: 20 },
  ];

  const upperRow: RowType[] = [
    {
      param: '',
      widthInPercent: 40,
      cellRender: transactionCellHandler,
    },
    {
      param: 'txStatus',
      widthInPercent: 20,
      cellRender: txStatusCellHandler,
    },
    {
      param: 'amount',
      widthInPercent: 20,
    },
    {
      param: 'transactionId',
      widthInPercent: 20,
    },
  ];
  const lowerRow: RowType[] = [
    { param: '', widthInPercent: 40, cellRender: lowerRowCellRender1 },
    { param: '', widthInPercent: 60, cellRender: lowerRowCellRender2 },
  ];

  function transactionCellHandler(headerParam, row) {
    return (
      <div className="mb-event-name-date">
        <div className="b-700">{row.transactionType}</div>
        <div className="mb-bet-date">
          {moment(row?.startTime).format('DD-MM-YY, h:mm:ss A')}
        </div>
      </div>
    );
  }

  function txStatusCellHandler(headerParam, row) {
    return (
      <div className="p-5">
        <div className="b-700">{TransactionMap[row.txStatus]}</div>
      </div>
    );
  }

  function lowerRowCellRender1(headerParam, row) {
    return (
      <div className="display-flex">
        <div className="b-500">Payment Method:</div>{' '}
        <div className="b-400">
          {row?.paymentMethod == 'UNRECOGNIZED' ? '-' : row?.paymentMethod}
        </div>
      </div>
    );
  }

  function lowerRowCellRender2(headerParam, row) {
    return (
      <div className="display-flex space-between p-5">
        <>
          {row.txStatus === 'INITIATED' && (
            <span
              className="cancel-btn"
              onClick={() =>
                cancelTx(row.transactionId, row.paymentGatewayProvider)
              }
            >
              Cancel
            </span>
          )}
        </>
        <>
          <div className="b-700">Notes:</div>
          <div className="b-400">{row.notes}</div>
        </>
      </div>
    );
  }

  const fetchTransactionRequest = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
    //   const response: AuthResponse = await REPORTING_API.get(
    //     '/reports/payment-transactions/:search',
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //       },
    //       params: {
    //         startDate: fromDate.startOf('day').toISOString(),
    //         endDate: toDate.endOf('day').toISOString(),
    //         pageSize: pageSize,
    //         pageToken: pageToken[pageToken.length - 1],
    //         status: transactionStatus === 'ALL' ? '' : transactionStatus,
    //         type: transactionType === 'ALL' ? '' : transactionType,
    //         isAscending: false,
    //       },
    //     }
    //   );
    //   const items = response.data.transactions;
    //   setNextPageToken(response.data.nextPageToken);
    //   for (const item of items) {
    //     item.amount = item.amount / cFactor;
    //   }
    //   setTransactionRequest(items);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
      setNextPageToken(null);
    }
    setLoading(false);
  }, [pageToken]);

  const nextPage = () => {
    if (nextPageToken) {
      setPageToken([...pageToken, nextPageToken]);
    }
  };

  const prevPage = () => {
    if (pageToken.length > 0) {
      let pagetokens = pageToken;
      pagetokens.pop();
      setPageToken([...pagetokens]);
    }
  };

  const fetchTransactionRequestRef = useRef(fetchTransactionRequest);
  fetchTransactionRequestRef.current = fetchTransactionRequest;

  const skipModalCloseFetchOnMount = useRef(true);
  useEffect(() => {
    if (skipModalCloseFetchOnMount.current) {
      skipModalCloseFetchOnMount.current = false;
      return;
    }
    if (!openDepositModal && !openWithdrawModal) {
      fetchTransactionRequestRef.current();
    }
    // Intentionally only modal flags — ref holds latest fetch (avoids duplicate fetch when pageToken changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDepositModal, openWithdrawModal]);

  useEffect(() => {
    fetchTransactionRequest();
  }, [fetchTransactionRequest]);

  const fromDateChangeHandler = (d: Moment) => {
    setfromDate(d);
    defaultPagination();
  };

  const toDateChangeHandler = (d: Moment) => {
    setToDate(d);
    defaultPagination();
  };

//   useEffect(() => {
//     fetchBalance();
//   }, []);

  const getPaymentProviders = async () => {
    const accountId = sessionStorage.getItem('aid');
    try {
    //   const response = await AGPAY_API.get(
    //     `/agpay/v2/payment-settings/accounts/${accountId}`,
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );
    //   if (response.status === 200) {
    //     if (
    //       response?.data?.withdraw_provider_list &&
    //       response?.data?.withdraw_provider_list?.length > 0
    //     ) {
    //       setShowWithdrawal(true);
    //     } else {
    //       setShowWithdrawal(false);
    //     }

    //     if (
    //       response?.data?.deposit_provider_list &&
    //       response?.data?.deposit_provider_list?.length > 0
    //     ) {
    //       setShowDeposit(true);
    //     } else {
    //       setShowDeposit(false);
    //     }
    //   }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPaymentProviders();
  }, []);

  const defaultPagination = () => {
    setPageToken([]);
    setNextPageToken(null);
  };

  const cancelTx = async (txnId: number, provider: string) => {
    if (!provider) {
      return;
    }
    setLoading(true);

    try {
    //   const response = await AGPAY_API.delete(
    //     `/agpay/v2/${provider.toLowerCase()}/transactions/${txnId}`,
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );
    //   if (response.status === 204) {
    //     dispatch(
    //       setAlertMsg({
    //         type: 'success',
    //         message: 'Transaction is cancelled.',
    //       })
    //     );
    //     fetchTransactionRequest();
    //   }
    } catch (err) {
      setAlertMsg({
        type: 'error',
        message: 'Failed to cancel the transaction.',
      });
      console.log(err);
    }
    setLoading(false);
  };

  const TransactionFilters = [
    { value: 'ALL', name: langData?.['all'] },
    { value: 'DEPOSIT', name: langData?.['deposit'] },
    { value: 'WITHDRAW', name: langData?.['withdraw'] },
  ];

  const TransactionStatusFilters = [
    { value: 'ALL', name: langData?.['all'] },
    { value: 'APPROVAL_PENDING', name: langData?.['approval_pending'] },
    { value: 'IN_PROGRESS', name: langData?.['in_progress'] },
    { value: 'INITIATED', name: langData?.['initiated'] },
    { value: 'APPROVED', name: langData?.['approved'] },
    { value: 'REJECTED', name: langData?.['rejected'] },
    { value: 'SUCCEEDED', name: langData?.['succeeded'] },
    { value: 'FAILED', name: langData?.['failed'] },
  ];

  return (
    <div className="support-container tx-request-ctn tr-ctn">
      <ReportBackBtn back={langData?.['back']} />
      <IonRow className="as-ctn  ">
        <ReportsHeader
          titleIcon={MyTransaction}
          reportName={langData?.['my_txns']}
          tabsOrBtns={[
            {
              label: langData?.['payment_related_queries'],
              onSelect: () => window.open(whatsappDetails, '_blank'),
              className: 'whatsapp-tr-btn web-view',
              icon: <WhatsApp className="whatsapp-icon" />,
              cond: domainConfig.b2cEnabled,
            },
            {
              label: langData?.['withdraw'],
              onSelect: () => history.push('/transaction/withdraw'),
              className: 'withdraw-tr-btn web-view',
              cond:
                showDeposit && domainConfig.payments && domainConfig.b2cEnabled,
            },
            {
              label: langData?.['deposit'],
              onSelect: () => history.push('/transaction/deposit'),
              className: 'depoosit-tr-btn web-view',
              cond:
                showWithdrawal &&
                domainConfig.payments &&
                domainConfig.b2cEnabled,
            },
          ]}
          reportFilters={[
            {
              element: (
                <SelectTemplate
                  label={langData?.['transaction_type']}
                  list={TransactionFilters}
                  value={transactionType}
                  onChange={(e) => {
                    setTransactionType(e.target.value);
                    defaultPagination();
                  }}
                  placeholder={langData?.['select_one']}
                />
              ),
              fullWidthInMob: false,
            },

            {
              element: (
                <SelectTemplate
                  label={langData?.['transaction_status']}
                  list={TransactionStatusFilters}
                  value={transactionStatus}
                  onChange={(e) => {
                    setTransactionStatus(e.target.value);
                    defaultPagination();
                  }}
                  placeholder={langData?.['select_one']}
                />
              ),
              fullWidthInMob: false,
            },
            {
              element: (
                <DateTemplate
                  value={fromDate}
                  label={langData?.['from']}
                  onChange={(e) => fromDateChangeHandler(e)}
                  minDate={moment().subtract(1, 'months').calendar()}
                  maxDate={toDate}
                />
              ),
            },
            {
              element: (
                <DateTemplate
                  value={toDate}
                  label={langData?.['to']}
                  onChange={(e) => toDateChangeHandler(e)}
                  minDate={fromDate}
                />
              ),
            },
            {
              element: (
                <>
                  {showDeposit && domainConfig.payments && notDemoUser() && (
                    <button
                      className={'withdraw-tr-btn mob-view'}
                      onClick={() => history.push('/transaction/withdraw')}
                    >
                      {langData?.['withdraw']}
                    </button>
                  )}
                </>
              ),
              fullWidthInMob: false,
            },
            {
              element: (
                <>
                  {showWithdrawal && domainConfig.payments && notDemoUser() && (
                    <button
                      className={'depoosit-tr-btn mob-view'}
                      onClick={() => history.push('/transaction/deposit')}
                    >
                      {langData?.['deposit']}
                    </button>
                  )}
                </>
              ),
              fullWidthInMob: false,
            },
            {
              element: (
                <>
                  {domainConfig.b2cEnabled && (
                    <button
                      className={'whatsapp-tr-btn mob-view'}
                      onClick={() => window.open(whatsappDetails, '_blank')}
                    >
                      <WhatsApp className="whatsapp-icon" />
                      {langData?.['payment_related_queries']}
                    </button>
                  )}
                </>
              ),
              fullWidthInMob: false,
            },
          ]}
        />

        <IonCol className="tr-table-ctn">
          <div className="reports-ctn my-bets-ctn">
            <div className="content-ctn light-bg my-bets-content">
              <div className="myb-bets-div">
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="tbl-ctn my-bets-tbl no-hov-style web-view">
                      <TableContainer component={Paper}>
                        <Table className="myb-table" size="small">
                          <TableHead className="myb-table-header  trx-request-table">
                            <TableRow className="trx-webView-head">
                              <TableCell>
                                {langData?.['transaction_time']}
                              </TableCell>
                              <TableCell>
                                {langData?.['transaction_id']}
                              </TableCell>
                              <TableCell>
                                {langData?.['transaction_type']}
                              </TableCell>
                              <TableCell>{langData?.['amount']}</TableCell>
                              <TableCell>
                                {langData?.['approved_amount']}
                              </TableCell>
                              <TableCell>
                                {langData?.['transaction_status']}
                              </TableCell>
                              <TableCell>{langData?.['notes']}</TableCell>
                              <TableCell>
                                {langData?.['payment_method']}
                              </TableCell>
                              <TableCell>{langData?.['action']}</TableCell>
                            </TableRow>

                            <TableRow className="trx-mobView-head">
                              <TableCell>
                                {langData?.['transaction_type']}
                              </TableCell>
                              <TableCell className="trx-status">
                                {langData?.['status']}{' '}
                              </TableCell>
                              <TableCell>{langData?.['amount']}</TableCell>
                              <TableCell>{langData?.['txn_id']}</TableCell>
                            </TableRow>
                          </TableHead>

                          {transactionRequest &&
                          transactionRequest.length > 0 ? (
                            <>
                              <TableBody className="apl-table-body trx-webView-body">
                                {transactionRequest.map((row, index) => (
                                  <>
                                    <TableRow
                                      className="apl-table-row"
                                      key={index}
                                    >
                                      <TableCell align="left">
                                        {moment(row?.startTime).format(
                                          'DD-MM-YY, h:mm:ss A'
                                        )}
                                      </TableCell>
                                      <TableCell align="left">
                                        {row?.transactionId}
                                      </TableCell>

                                      <TableCell
                                        align="left"
                                        className="text-capitalize"
                                      >
                                        {row.transactionType?.toLowerCase()}
                                      </TableCell>
                                      <TableCell align="left">
                                        {row.amount.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        {row?.approvedAmount
                                          ? row.approvedAmount
                                          : '-'}
                                      </TableCell>
                                      <TableCell align="left">
                                        {TransactionMap[row.txStatus]
                                          ? TransactionMap[row.txStatus]
                                          : row.txStatus}
                                        {'  '}
                                        {TransactionMap[row.txStatus] ===
                                        'Rejected' ? (
                                          <Tooltip
                                            title={row?.remarks}
                                            open={showTooltip}
                                            onOpen={() => setShowTooltip(true)}
                                            onClose={() =>
                                              setShowTooltip(false)
                                            }
                                          >
                                            <InfoOutlined
                                              onClick={() =>
                                                setShowTooltip(!showTooltip)
                                              }
                                            />
                                          </Tooltip>
                                        ) : null}
                                      </TableCell>
                                      <TableCell align="left">
                                        {row?.notes}
                                      </TableCell>
                                      <TableCell align="left">
                                        {row?.paymentMethod == 'UNRECOGNIZED'
                                          ? '-'
                                          : row?.paymentMethod}
                                      </TableCell>
                                      <TableCell align="left">
                                        {row.txStatus === 'INITIATED' ? (
                                          <span
                                            className="cancel-btn"
                                            onClick={() =>
                                              cancelTx(
                                                row.transactionId,
                                                row.paymentGatewayProvider
                                              )
                                            }
                                          >
                                            {langData?.['cancel']}
                                          </span>
                                        ) : (
                                          '-'
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  </>
                                ))}
                              </TableBody>
                            </>
                          ) : (
                            <TableCell className="no-data-row" colSpan={9}>
                              <div className="no-bets-msg">
                                {langData?.['no_data_found']}
                              </div>
                            </TableCell>
                          )}
                        </Table>
                      </TableContainer>
                    </div>
                    <CustomTableMob
                      headerParams={headerParams}
                      bodyData={transactionRequest}
                      upperRow={upperRow}
                      lowerRow={lowerRow}
                      noDataMessage={langData?.['no_data_found']}
                      langData={langData}
                    />
                  </>
                )}

                <IonRow>
                  {pageToken.length > 0 && !loading && (
                    <IonButton
                      className="led-btn-prev"
                      onClick={(e) => prevPage()}
                    >
                      ({langData?.['prev']})({pageToken.length - 1})
                    </IonButton>
                  )}
                  {nextPageToken && !loading ? (
                    <IonButton
                      className="led-btn-next"
                      onClick={(e) => nextPage()}
                    >
                      ({langData?.['next']})({pageToken.length + 1})
                    </IonButton>
                  ) : null}
                </IonRow>
              </div>
            </div>

            <Backdrop className="backdrop-ctn" open={openDepositModal}>
              <Drawer
                anchor={'right'}
                open={openDepositModal}
                // onClose={() => setOpenDepositModal(false)}
                className="light-bg-title game-rules-drawer"
                title=""
              >
                <div className="game-rules-header">
                  <div className="game-rules-title">
                    {langData?.['deposit']}
                  </div>
                  <div
                    className="game-rules-close cursor"
                    // onClick={() => setOpenDepositModal(false)}
                  >
                    <CloseOutlined />
                  </div>
                </div>
                <Deposit />
              </Drawer>
            </Backdrop>
            <Backdrop className="backdrop-ctn" open={openWithdrawModal}>
              <Drawer
                anchor={'right'}
                open={openWithdrawModal}
                // onClose={() => setOpenWithdrawModal(false)}
                className="light-bg-title game-rules-drawer"
                title=""
              >
                <div className="game-rules-header">
                  <div className="game-rules-title">
                    {langData?.['withdraw']}
                  </div>
                  <div
                    className="game-rules-close cursor"
                    // onClick={() => setOpenWithdrawModal(false)}
                  >
                    <CloseOutlined />
                  </div>
                </div>
                <Withdrawal />
              </Drawer>
            </Backdrop>
          </div>
        </IonCol>
      </IonRow>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    loggedIn: state.auth.loggedIn,
    bettingCurrency: state.common.bettingCurrency,
    currenciesAllowed: state.common.currenciesAllowed,
    openDepositModal: state.auth.openDepositModal,
    openWithdrawModal: state.auth.openWithdrawModal,
    whatsappDetails: demoUser()
      ? state.common.demoUserWhatsappDetails
      : state.common.whatsappDetails,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    // setOpenDepositModal: (val) => dispatch(setOpenDepositModal(val)),
    // setOpenWithdrawModal: (val) => dispatch(setOpenWithdrawModal(val)),
    // fetchBettingCurrency: () => dispatch(fetchBettingCurrency()),
    // fetchBalance: () => dispatch(fetchBalance()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionRequest);
