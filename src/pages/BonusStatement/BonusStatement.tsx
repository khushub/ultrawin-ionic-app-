import { IonRow } from '@ionic/react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
// import SVLS_API from '../../api-services/svls-api';
import  bonusStatementIcon  from '../../assets/images/icons/bonusStatement.svg';
import CustomTableMob from '../../common/CustomTableMob/CustomTableMob';
import DateTemplate from '../../common/DateAndTimeTemplate/DateAndTimeTemplate';
import ReportBackBtn from '../../common/ReportBackBtn/ReportBackBtn';
import ReportsHeader from '../../common/ReportsHeader/ReportsHeader';
import Spinner from '../../components/Spinner/Spinner';
import './BonusStatement.scss';
import { headerParams, lowerRow, upperRow } from './bonusStatementUtils';
import { connect } from 'react-redux';
// import { RootState } from '../../models/RootState';
import { CURRENCY_TYPE_FACTOR } from '../../constants/CurrencyTypeFactor';
// import { getCurrencyTypeFromToken } from '../../store';

type options = { name: string; value: string };

type BonusProps = {
  award_amount: number;
  award_date: Moment;
  bonus_status: string;
  bonus_category: string;
  id: number;
  last_vest_date: Moment;
  notes: string;
  redeemed_amount: number;
  last_redeem_date: Moment;
  redemptions: RedemptionDTO[];
  installments_given: number;
  installments: number;
  approval_required: boolean;
  turnover_required: number;
  turnover_met: number;
  expiry_date: Moment;
};

type RedemptionDTO = {
  notes: string;
  redeem_amount: number;
  redeem_date: Moment;
  redemption_id: number;
  status: string;
};

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
  pageNum: number;
};

const BonusStatement: React.FC<{ bonusEnabled: boolean; langData: any }> = (
  props
) => {
  const { bonusEnabled, langData } = props;
  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, 'd'),
    toDate: moment(),
    pageToken: [],
    pageNum: 1,
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [bonusType, setBonusType] = useState<string>('All');
  const [bonusStatus, setBonusStatus] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [bonusData, setBonusData] = useState<BonusProps[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const [open, setOpen] = React.useState<any>({
    bonusId: -1,
    open: false,
  });
//   const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const cFactor = CURRENCY_TYPE_FACTOR['INR'];

  const pageSize = 25;

  const bonusTypeOptions: options[] = [
    { value: 'Joining Bonus', name: 'Joining Bonus' },
    { value: 'Deposit Bonus', name: 'Deposit Bonus' },
  ];

  const bonusStatusOptions: options[] = [
    { value: 'Awarded', name: 'Awarded' },
    { value: 'Partially Redeemed', name: 'Partially Redeemed' },
    { value: 'Redeemed', name: 'Redeemed' },
    { value: 'Expired', name: 'Expired' },
  ];

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
        pageNum: filters.pageNum + 1,
      });
      setNextPageToken(null);
    }
  };

  const prevPage = () => {
    if (filters.pageToken?.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setFilters({
        ...filters,
        pageToken: [...pagetokens],
        pageNum: filters.pageNum - 1,
      });
      setNextPageToken(null);
    }
  };

  const getBonusData = async () => {
    setLoading(true);
    try {
      const claims = sessionStorage.getItem('jwt_token').split('.')[1];
      const userId = JSON.parse(window.atob(claims)).aid;

    //   const response = await SVLS_API.get('marketing/v1/bonuses/', {
    //     headers: {
    //       Authorization: sessionStorage.getItem('jwt_token'),
    //       Accept: 'application/json',
    //     },
    //     params: {
    //       accountId: userId,
    //       bonusStatus: bonusStatus === 'All' ? null : bonusStatus,
    //       bonusType: bonusType === 'All' ? null : bonusType,
    //       startDate: filters.fromDate.startOf('day').toISOString(),
    //       endDate: filters.toDate.endOf('day').toISOString(),
    //       pageToken: filters.pageToken[filters.pageToken?.length - 1]
    //         ? filters.pageToken[filters.pageToken?.length - 1]
    //         : null,
    //       pageSize: pageSize,
    //     },
    //   });
    //   setNextPageToken(response.data.next_page_token);
    //   const bonuses = response.data?.bonuses ?? [];
    //   for (const bonus of bonuses) {
    //     bonus.award_amount = bonus.award_amount
    //       ? bonus.award_amount / cFactor
    //       : 0;
    //     bonus.redeemed_amount = bonus.redeemed_amount
    //       ? bonus.redeemed_amount / cFactor
    //       : 0;
    //     bonus.turnover_met = bonus.turnover_met
    //       ? bonus.turnover_met / cFactor
    //       : 0;
    //     bonus.turnover_required = bonus.turnover_required
    //       ? bonus.turnover_required / cFactor
    //       : 0;
    //   }
    //   setBonusData(bonuses);

      const dummyBonus = [
      {
        id: 1,
        award_amount: 500,
        award_date: new Date(),
        bonus_status: "Awarded",
        bonus_category: "Joining Bonus",
        redeemed_amount: 0,
        last_redeem_date: null,
        installments_given: 0,
        installments: 5,
        approval_required: true,
        turnover_required: 5000,
        turnover_met: 1200,
        expiry_date: new Date(),
        redemptions: [],
      },
      {
        id: 2,
        award_amount: 1000,
        award_date: new Date(),
        bonus_status: "Partially Redeemed",
        bonus_category: "Deposit Bonus",
        redeemed_amount: 400,
        last_redeem_date: new Date(),
        installments_given: 2,
        installments: 5,
        approval_required: false,
        turnover_required: 10000,
        turnover_met: 6200,
        expiry_date: new Date(),
        redemptions: [
          {
            redemption_id: 1,
            redeem_amount: 200,
            redeem_date: new Date(),
            status: "Approved",
            notes: "1st installment",
          },
          {
            redemption_id: 2,
            redeem_amount: 200,
            redeem_date: new Date(),
            status: "Approved",
            notes: "2nd installment",
          },
        ],
      },
      {
        id: 3,
        award_amount: 750,
        award_date: new Date(),
        bonus_status: "Redeemed",
        bonus_category: "Deposit Bonus",
        redeemed_amount: 750,
        last_redeem_date: new Date(),
        installments_given: 5,
        installments: 5,
        approval_required: false,
        turnover_required: 7000,
        turnover_met: 7000,
        expiry_date: new Date(),
        redemptions: [],
      },
    ];

    setBonusData(dummyBonus);
    setNextPageToken(null);

    } catch (err) {
      console.log(err);
      setBonusData([]);
      setNextPageToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    getBonusData();
  }, [filters]);

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [], pageNum: 1 });
    setNextPageToken(null);
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [], pageNum: 1 });
    setNextPageToken(null);
  };

  return (
    <div className="reports-ctn bonus-statement-ctn">
      <ReportBackBtn back={langData?.['back']} />
      <ReportsHeader
        titleIcon={bonusStatementIcon}
        reportName={langData?.['bonus_statement']}
        reportFilters={[
          {
            element: (
              <DateTemplate
                value={filters.fromDate}
                label={langData?.['from']}
                onChange={(e) => fromDateChangeHandler(e)}
                minDate={moment().subtract(1, 'months').calendar()}
                maxDate={filters.toDate}
              />
            ),
          },
          {
            element: (
              <DateTemplate
                value={filters.toDate}
                label={langData?.['to']}
                onChange={(e) => toDateChangeHandler(e)}
                minDate={filters.fromDate}
              />
            ),
          },
        ]}
      />

      <div className="content-ctn light-bg my-bets-content">
        <div className="myb-bets-div">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="tbl-ctn my-bets-tbl no-hov-style web-view">
                <TableContainer component={Paper}>
                  <Table className="myb-table" size="small">
                    <TableHead className="myb-table-header">
                      <TableRow>
                        <TableCell
                          align="left"
                          className="th-col bonus-type-cell"
                        >
                          {langData?.['bonus_type']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col approval-req-cell"
                        >
                          {langData?.['approval_required_txt']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col awarded-date-cell"
                        >
                          {langData?.['awarded_date']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col awarded-amy-cell"
                        >
                          {langData?.['awarded_amount_txt']}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="th-col turnover-cell"
                        >
                          {langData?.['turnover']}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="th-col installments-cell"
                        >
                          {langData?.['installments']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col redeemed-amt-cell"
                        >
                          {isMobile
                            ? langData?.['redeemed_amount_short']
                            : langData?.['redeemed_amount']}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="th-col status-cell"
                        >
                          {langData?.['status']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col last-date-cell"
                        >
                          {langData?.['last_redeemed_date']}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col last-date-cell"
                        >
                          {langData?.['expiry_date']}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    {bonusData?.length > 0 ? (
                      <TableBody className="myb-table-body">
                        {bonusData.map((row, idx) => (
                          <>
                            {row?.bonus_category === 'LOSSBACK_BONUS' &&
                            row?.bonus_status === 'Awarded' ? null : (
                              <TableRow key={'row-' + idx}>
                                <TableCell key={'row-' + idx + '-cell-3'}>
                                  <div className="b-text m-link">
                                    {row.bonus_category}
                                  </div>
                                </TableCell>
                                <TableCell key={'row-' + idx + '-cell-3'}>
                                  <div className="b-text m-link">
                                    {row.approval_required ? 'Yes' : 'No'}
                                  </div>
                                </TableCell>
                                <TableCell
                                  key={'row-' + idx + '-cell-1'}
                                  component="th"
                                >
                                  {moment(row.award_date).format(
                                    'DD/MM/YYYY, h:mm:ss A'
                                  )}
                                </TableCell>
                                <TableCell key={'row-' + idx + '-cell-7'}>
                                  {row?.award_amount?.toFixed(2)}
                                </TableCell>

                                <TableCell
                                  key={'row-' + idx + '-cell-8'}
                                  align="center"
                                >
                                  {(row.turnover_met ? row.turnover_met : '-') +
                                    '/' +
                                    (row.turnover_required
                                      ? row.turnover_required
                                      : '-')}
                                </TableCell>
                                <TableCell
                                  key={'row-' + idx + '-cell-10'}
                                  align="center"
                                >
                                  {(row.installments_given
                                    ? row.installments_given
                                    : '-') +
                                    '/' +
                                    (row.installments ? row.installments : '-')}
                                </TableCell>

                                <TableCell key={'row-' + idx + '-cell-7'}>
                                  {row?.redeemed_amount?.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  key={'row-' + idx + '-cell-8'}
                                  align="center"
                                >
                                  {row.bonus_status}
                                </TableCell>

                                <TableCell
                                  key={'row-' + idx + '-cell-2'}
                                  component="th"
                                >
                                  {row.last_redeem_date
                                    ? moment(row.last_redeem_date).format(
                                        'DD/MM/YYYY, h:mm:ss A'
                                      )
                                    : '-'}
                                </TableCell>

                                <TableCell
                                  key={'row-' + idx + '-cell-3'}
                                  component="th"
                                >
                                  {row.expiry_date
                                    ? moment(row.expiry_date).format(
                                        'DD/MM/YYYY, h:mm:ss A'
                                      )
                                    : '-'}
                                </TableCell>
                              </TableRow>
                            )}

                            {open.open && row?.id === open.bonusId && (
                              <TableRow>
                                <TableCell className="pb-0-pt-0 " colSpan={12}>
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead className="redeem-row-ctn">
                                        <TableCell colSpan={3}>
                                          {langData?.['redeemed_date']}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.['amount']}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.['status']}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.['notes']}
                                        </TableCell>
                                      </TableHead>
                                      {row?.redemptions?.map((redeem) => (
                                        <>
                                          <TableBody>
                                            <TableCell colSpan={3}>
                                              {moment(
                                                redeem.redeem_date
                                              ).format('DD/MM/YYYY, h:mm:ss A')}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem?.redeem_amount?.toFixed(
                                                2
                                              )}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem?.status
                                                ? redeem?.status
                                                : '-'}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem.notes
                                                ? redeem.notes
                                                : '-'}
                                            </TableCell>
                                          </TableBody>
                                        </>
                                      ))}
                                    </Table>
                                  </TableContainer>
                                </TableCell>{' '}
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    ) : (
                      <TableCell className="no-data-row" colSpan={12}>
                        <div>{langData?.['no_data_found']}</div>
                      </TableCell>
                    )}
                  </Table>
                </TableContainer>
              </div>

              <CustomTableMob
                headerParams={headerParams}
                bodyData={bonusData}
                upperRow={upperRow}
                lowerRow={lowerRow}
                noDataMessage={langData?.['no_data_found']}
                langData={langData}
              />
            </>
          )}
          <IonRow className="bs-pagination">
            {filters.pageToken.length > 0 && !loading && (
              <button className="bs-page-btn" onClick={(e) => prevPage()}>
                ({langData?.['prev']})({filters.pageNum - 1})
              </button>
            )}
            {nextPageToken && !loading ? (
              <button className="bs-page-btn" onClick={(e) => nextPage()}>
                ({langData?.['next']})({filters.pageNum + 1})
              </button>
            ) : null}
          </IonRow>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(BonusStatement);
