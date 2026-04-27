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
import { postAPIAuth } from '../../services/apiInstance';
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
    const payload = {
      deleted: false,
      dateFrom: filters.fromDate.startOf("day").format("YYYY-MM-DD"),
      dateTo: filters.toDate.endOf("day").format("YYYY-MM-DD"),
    };

    const response: any = await postAPIAuth("/getBetsAPI", payload);
    console.log("PL Statement Response:", response);

    const pl_records = response?.data?.data || [];

    if (filters.statementType === "TURBO_PL") {
      const cashoutData = pl_records.map((item: any) => ({
        marketName: item?.marketName || "-",
        eventName: item?.eventName || "-",
        cashoutAmount: item?.stake || 0,
        cashoutCommission: item?.commission || 0,
        netCashoutAmount:
          (item?.stake || 0) - (item?.commission || 0),
        settledDate: item?.placedTime,
      }));

      setCashoutHistory(cashoutData);
      setplStatement([]);
    } else {
      const profitLossData = pl_records.map((item: any) => ({
        eventName: item?.eventName || "-",
        marketName: item?.marketName || "-",
        profit:
          item?.result === "LOST"
            ? -(item?.stake || 0)
            : item?.profit || 0,
        commission: item?.commission || 0,
        settledDate: item?.placedTime,
      }));

      setplStatement(profitLossData);
      setCashoutHistory([]);
    }
  } catch (err: any) {
    console.log(err);

    if (err?.response?.data?.error) {
      setErrorMsg(err.response.data.error);
    }

    setplStatement([]);
    setCashoutHistory([]);
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
