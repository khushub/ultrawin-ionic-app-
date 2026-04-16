import { IonButton, IonCol, IonRow } from '@ionic/react';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import PLStatementIcon from '../../assets/images/reportIcons/PLStatement.svg';
import DateTemplate from '../../common/DateAndTimeTemplate/DateAndTimeTemplate';
import ReportBackBtn from '../../common/ReportBackBtn/ReportBackBtn';
import ReportsHeader from '../../common/ReportsHeader/ReportsHeader';
import ProfitLossStatement from '../../components/ProfitLossStatement/ProfitLossStatement';
import CashoutHistoryStatement from '../../components/CashoutHistoryStatement/CashoutHistoryStatement';
import Spinner from '../../components/Spinner/Spinner';
import { CURRENCY_TYPE_FACTOR } from '../../constants/CurrencyTypeFactor';
// import { PLStatement } from '../../models/PLStatement';
// import { AuthResponse } from '../../models/api/AuthResponse';
// import REPORTING_API from '../../reporting-api';
// import SVLS_API from '../../svls-api';
// import { getCurrencyTypeFromToken } from '../../store';
import './UserPLStatement.scss';
import SelectTemplate from '../../common/SelectTemplate/SelectTemplate';
import { CONFIG_PERMISSIONS } from '../../constants/ConfigPermissions';
import { connect, useSelector } from 'react-redux';
// import { RootState } from '../../models/RootState';

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
  selectedGame: string;
  sport: string;
  statementType: string;
};

type Props = {
  langData: any;
};

const UserPLStatement: React.FC<Props> = (props: Props) => {
  const { langData } = props;

  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, 'd'),
    toDate: moment(),
    pageToken: [],
    selectedGame: 'SPORTS',
    sport: 'SPORTS',
    statementType: 'MAIN_PL',
  };
  const [errorMsg, setErrorMsg] = useState(null);
  const [progress, setProgress] = useState<Boolean>(false);
  const [plStatement, setplStatement] = useState<any[]>([]);
  const [cashoutHistory, setCashoutHistory] = useState<any[]>([]);
  const [totalPL, setTotalPL] = useState<Map<string, number>>(new Map());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [myTotalProfit, setMyTotalProfit] = useState<number>(0);
//   const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const cFactor = CURRENCY_TYPE_FACTOR["INR"];
  const { allowedConfig } = useSelector((state: any) => state.common);

  const statementTypeOptions = [
    {
      value: 'MAIN_PL',
      name: 'Main Profit and Loss',
      allow: true,
    },
    {
      value: 'TURBO_PL',
      name: 'Speed Cash Profit and Loss',
      allow: true,
    },
  ];

  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const pageSize = 25;

  const fetchPLStatement = useCallback(async () => {
    setProgress(true);
    setErrorMsg(null);
    setNextPageToken(null);
    try {
      let response: any;
      let pl_records;

    //   if (filters.statementType === 'TURBO_PL') {
    //     // Fetch cashout history
    //     response = await SVLS_API.get('/reports/v2/cashout-history', {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //         Accept: 'application/json',
    //       },
    //       params: {
    //         startDate: filters.fromDate.startOf('day').toISOString(),
    //         endDate: filters.toDate.endOf('day').toISOString(),
    //         pageSize: pageSize,
    //         pageToken: filters.pageToken[filters.pageToken.length - 1],
    //         accountId: sessionStorage.getItem('aid'),
    //       },
    //     });
    //     pl_records = response.data.entries;
    //   } else if (
    //     filters.selectedGame === 'SPORTS_BOOK' ||
    //     filters.selectedGame === 'SPORTS'
    //   ) {
    //     response = await REPORTING_API.post(
    //       '/reports/v2/profit-statement',
    //       {
    //         user: '',
    //         categoryType: filters.selectedGame,
    //         startDate: filters.fromDate.startOf('day').toISOString(),
    //         endDate: filters.toDate.endOf('day').toISOString(),
    //         pageSize: pageSize,
    //         pageToken: filters.pageToken[filters.pageToken.length - 1],
    //         acceptType: 'application/json',
    //       },
    //       {
    //         headers: {
    //           Authorization: sessionStorage.getItem('jwt_token'),
    //         },
    //         params: {},
    //       }
    //     );
    //     pl_records = response.data.plEntries;
    //   } else {
    //     response = await REPORTING_API.get('/reports/v2/orders/:search', {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //         Accept: 'application/json',
    //       },
    //       params: {
    //         user: '',
    //         categoryType: filters.selectedGame,
    //         startDate: filters.fromDate.startOf('day').toISOString(),
    //         endDate: filters.toDate.endOf('day').toISOString(),
    //         pageSize: pageSize,
    //         pageToken: filters.pageToken[filters.pageToken.length - 1],
    //         acceptType: 'application/json',
    //         reportType: 'ORDER_LIST',
    //         status: 'Settled',
    //       },
    //     });
    //     pl_records = response.data.orders;
    //   }

    //   setNextPageToken(response.data.nextPageToken);

      try {
    if (filters.statementType === 'TURBO_PL') {
      const dummyCashout = [
        {
          marketName: "Match Odds",
          eventName: "India vs Australia",
          cashoutAmount: 1200,
          cashoutCommission: 50,
          netCashoutAmount: 1150,
          settledDate: new Date(),
        },
        {
          marketName: "Fancy Bet",
          eventName: "CSK vs MI",
          cashoutAmount: 800,
          cashoutCommission: 20,
          netCashoutAmount: 780,
          settledDate: new Date(),
        },
      ];

      setCashoutHistory(dummyCashout);
      setplStatement([]);
    } else {
      const dummyPL = [
        {
          eventName: "India vs Pakistan",
          marketName: "Match Odds",
          profit: 1500,
          commission: 50,
          settledDate: new Date(),
        },
        {
          eventName: "MI vs CSK",
          marketName: "Session Bet",
          profit: -700,
          commission: 0,
          settledDate: new Date(),
        },
        {
          eventName: "Barcelona vs Madrid",
          marketName: "Over Under",
          profit: 1200,
          commission: 30,
          settledDate: new Date(),
        },
      ];

      setplStatement(dummyPL);
      setCashoutHistory([]);
    }
  } catch (err) {
    console.log(err);
  }

      if (filters.statementType === 'TURBO_PL') {
        // Process cashout history data
        for (const record of pl_records) {
          record.cashoutAmount = record.cashoutAmount / cFactor;
          record.cashoutCommission = record.cashoutCommission / cFactor;
          record.netCashoutAmount = record.netCashoutAmount / cFactor;
        }
        setCashoutHistory(pl_records);
        setplStatement([]);
      } else {
        // Process regular P&L data
        for (const pl of pl_records) {
          pl.profit = pl.profit / cFactor;
          pl.commission = pl.commission ? pl.commission / cFactor : 0;
        }
        setplStatement(pl_records);
        setCashoutHistory([]);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
      console.log(err);
      setplStatement([]);
      setCashoutHistory([]);
      setNextPageToken(null);
    }
    setProgress(false);
  }, [filters]);

  useEffect(() => {
    fetchPLStatement();
  }, [fetchPLStatement]);

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
      });
    }
  };

  const prevPage = () => {
    if (filters.pageToken.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setFilters({ ...filters, pageToken: [...pagetokens] });
    }
  };

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [] });
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [] });
  };

  const selectGamesOptions = [
    {
      value: 'SPORTS',
      name: 'Sports',
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    {
      value: 'SPORTS_BOOK',
      name: 'Sportsbook',
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    { value: 'PREMIUM', name: 'Premium', allow: true },
    {
      value: 'CASINO',
      name: 'Casino',
      allow: (allowedConfig & CONFIG_PERMISSIONS.live_casino) !== 0,
    },
    // {value: 'INDIAN_CASINO', name: 'Indian Casino', allow: (allowedConfig & CONFIG_PERMISSIONS.indian_casino) !== 0},
  ];

  const handleSelectedGameChange = (e) => {
    let sportId = filters.sport;
    if (e.target.value !== 'SPORTS') {
      sportId = null;
    }
    setFilters({
      ...filters,
      selectedGame: e.target.value,
      sport: sportId,
      pageToken: [],
    });
    setNextPageToken(null);
  };

  const handleStatementTypeChange = (e) => {
    setFilters({
      ...filters,
      statementType: e.target.value,
      pageToken: [],
    });
    setNextPageToken(null);
  };

  return (
    <>
      <div className="betting-pl-ctn">
        <ReportBackBtn back={langData?.['back']} />
        <IonRow className="as-ctn">
          <ReportsHeader
            titleIcon={PLStatementIcon}
            reportName={langData?.['betting_profit_and_loss']}
            reportFilters={[
              {
                element: (
                  <SelectTemplate
                    label={'Statement Type'}
                    list={statementTypeOptions}
                    value={filters.statementType}
                    onChange={handleStatementTypeChange}
                    size="large"
                  />
                ),
              },
              {
                element: (
                  <SelectTemplate
                    label={'Select Games'}
                    list={selectGamesOptions}
                    value={filters.selectedGame}
                    onChange={handleSelectedGameChange}
                  />
                ),
              },
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

          <IonCol className="mob-px-0">
            <div className="reports-ctn my-bets-ctn">
              <div className="content-ctn light-bg my-bets-content">
                <div className="myb-bets-div">
                  {progress ? (
                    <Spinner />
                  ) : (
                    <>
                      {filters.statementType === 'TURBO_PL' ? (
                        <CashoutHistoryStatement
                          items={cashoutHistory}
                          startDate={filters.fromDate}
                          endDate={filters.toDate}
                          searchName={''}
                          langData={langData}
                          selectedGame={filters.selectedGame}
                        />
                      ) : (
                        <ProfitLossStatement
                          items={plStatement}
                          startDate={filters.fromDate}
                          endDate={filters.toDate}
                          searchName={''}
                          langData={langData}
                          selectedGame={filters.selectedGame}
                        />
                      )}
                    </>
                  )}

                  <IonRow className="ml-5">
                    {filters.pageToken.length > 0 && !progress && (
                      <IonButton
                        className="myb-btn-prev"
                        onClick={(e) => prevPage()}
                      >
                        ({langData?.['prev']})({filters.pageToken.length - 1})
                      </IonButton>
                    )}
                    {nextPageToken && !progress && (
                      <IonButton
                        className="myb-btn-next"
                        onClick={(e) => nextPage()}
                      >
                        ({langData?.['next']})({filters.pageToken.length + 1})
                      </IonButton>
                    )}
                  </IonRow>
                </div>
              </div>
            </div>
          </IonCol>
        </IonRow>
      </div>
    </>
  );
};

const mapStateToProps = (state: any) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(UserPLStatement);
