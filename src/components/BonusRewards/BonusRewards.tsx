import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './BonusRewards.scss';
// import SVLS_API from '../../svls-api';
import NoDataComponent from '../../common/NoDataComponent/NoDataComponent';
import { setAlertMsg } from '../../store/slices/commonSlice';
import { connect, useDispatch } from 'react-redux';
// import { convertTimeToDefaultTimezone, now } from '../../util/dateUtil';
import { Button } from '@mui/material';
import { IonSpinner } from '@ionic/react';
// import { RootState } from '../../models/RootState';
type BonusRewardDto = {
  amount: number;
  category: string;
  claimed: boolean;
  reference_id: string;
  validity_date: Date;
  description?: string;
  display_content?: string;
};

type StoreProps = {
  langData: any;
};

const BonusRewards: React.FC<StoreProps> = (props) => {
  const { langData } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const [bonuses, setBonuses] = useState<BonusRewardDto[]>();

  const [couponCode, setCouponCode] = useState<string>();

  const [bonusesLoading, setBonusesLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    getSpecialBonuses();
  }, []);

  const errorToast = (mess: string) => {
    dispatch(
      setAlertMsg({
        type: 'error',
        message: mess ?? '',
      })
    );
  };

  const successToast = (mess: string) => {
    dispatch(
      setAlertMsg({
        type: 'success',
        message: mess ?? '',
      })
    );
  };

  const getSpecialBonuses = async () => {
    setBonusesLoading(true);
    try {
    //   const response = await SVLS_API.get(
    //     '/marketing/v1/bonuses/special-bonus',
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //       },
    //       params: {
    //         coupon_code: couponCode ? couponCode : null,
    //       },
    //     }
    //   );
    //   if (response.status == 200) {
    //     setBonuses(
    //       response.data
    //         .filter((bonus) => {
    //           return (
    //             convertTimeToDefaultTimezone(bonus.validity_date).diff(now()) >=
    //             0
    //           );
    //         })
    //         .sort((a, b) => {
    //           return a.validity_date > b.validity_date ? -1 : 1;
    //         })
    //     );
    //   }
    //   setBonusesLoading(false);
    } catch (error) {
      setBonuses([]);
      errorToast(error?.response?.data?.message);
      setBonusesLoading(false);
      setLoading(false);
    }
  };

  const bonusMap = {
    lb_28_10_to_04_11_24: {
      heading: 'Loss Back Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the LossBack Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus based on your losses from 27th
            October to 4th November:
          </p>
          <p>For losses between ₹1,000 and ₹10,0000: 10% cashback.</p>
          <p>For losses exceeding ₹1,00,000: ₹10,000 cashback.</p>
        </>
      ),
    },
    db_05_11_to_11_11_24: {
      heading: 'Deposit Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the Deposit Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus of 1% based on your deposit
            from 5th November to 11th November:
          </p>
        </>
      ),
    },
    lb_11_11_to_17_11_24: {
      heading: 'Loss Back Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the LossBack Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus based on your losses from 12th
            November to 17th November:
          </p>
          <p>For losses between ₹1,000 and ₹10,0000: 10% cashback.</p>
          <p>For losses exceeding ₹1,00,000: ₹10,000 cashback.</p>
        </>
      ),
    },
    db_12_11_to_19_11_24: {
      heading: 'Deposit Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the Deposit Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus of 3% based on your deposit
            from 12th November to 19th November:
          </p>
        </>
      ),
    },
    lb_18_11_to_24_11_24: {
      heading: 'Loss Back Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the LossBack Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus based on your losses from 18th
            November to 24th November:
          </p>
          <p>You will receive 3% of the amount as cashback.</p>
          <p>
            If 3% of your loss exceeds ₹1,000, you will receive a maximum
            cashback of ₹1,000.
          </p>
        </>
      ),
    },
    db_25_11_to_01_12_24: {
      heading: 'Deposit Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for the Deposit Bonus.</b>
          </h5>
          <p>
            You will receive a non-cashable bonus of 5% based on your deposit
            from 25th November to 1st December:
          </p>
          <p>
            If 5% of your deposit exceeds ₹2,000, you will receive a maximum
            bonus of ₹2,000.
          </p>
        </>
      ),
    },
    1788441286: {
      heading: 'BigBash Match-1 Bonus',
      body: (
        <>
          <h5>
            <b>Congratulations! You are eligible for BigBash Match-1 Bonus.</b>
          </h5>
          <p>You will receive a ₹200 non-cashable bonus.</p>
        </>
      ),
    },
  };

  const claimSpecialBonus = async (bonusReferenceId: string) => {
    setLoading(true);
    try {
    //   const response = await SVLS_API.post(
    //     `/marketing/v1/bonuses/claim-special-bonus2`,
    //     null,
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //       },
    //       params: {
    //         reference_id: bonusReferenceId,
    //       },
    //     }
    //   );
    //   if (response.status == 204) {
    //     successToast('Bonus Claimed Successfully');
    //     getSpecialBonuses();
    //   } else {
    //     errorToast('Failed to claim bonus');
    //   }
    //   setLoading(false);
    } catch (error) {
      setLoading(false);
      errorToast(error?.response?.data?.message);
    }
  };

  return (
    <>
      <div className="search-section">
        <h2>{langData?.['redeem_bonus']}</h2>
        <div className="search-bar">
          <input
            type="text"
            className="coupon-input"
            placeholder={langData?.['enter_coupon_code']}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button
            className="search-button"
            onClick={() => getSpecialBonuses()}
            disabled={bonusesLoading}
          >
            {bonusesLoading ? (
              <IonSpinner name="lines-small" />
            ) : (
              langData?.['search']
            )}
          </Button>
        </div>
      </div>
      {bonuses && bonuses.length > 0 ? (
        <div className="bonus-list">
          {bonuses.map((bonus) => (
            <div
              key={bonus.reference_id}
              className={`bonus-item ${bonus.claimed ? 'disabled' : ''}`}
            >
              {' '}
              <h3>
                {bonus.description && bonus.reference_id != '1788441286'
                  ? bonus.description
                  : bonusMap[bonus.reference_id]?.heading}
              </h3>
              <p>
                {langData?.['amount']} : ₹{bonus.amount.toFixed(2)}{' '}
              </p>
              <p>
                {langData?.['expires_on']}:{' '}
                {/* {convertTimeToDefaultTimezone(bonus.validity_date).format(
                  'DD/MM/YY'
                )} */}
              </p>
              {bonus.display_content && bonus.reference_id != '1788441286' ? (
                <div
                  className="preview"
                  dangerouslySetInnerHTML={{ __html: bonus.display_content }}
                ></div>
              ) : (
                bonusMap[bonus.reference_id]?.body
              )}
              {!bonus.claimed ? (
                <Button
                  className="claim-button"
                  onClick={() => claimSpecialBonus(bonus.reference_id)}
                  endIcon={loading ? <IonSpinner name="lines-small" /> : ''}
                  disabled={loading}
                >
                  {langData?.['claim_now']}
                </Button>
              ) : (
                <Button
                  disabled
                  className="claim-button"
                  onClick={() => claimSpecialBonus(bonus.reference_id)}
                >
                  {langData?.['claimed']}
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <NoDataComponent
          title={langData?.['no_pending_bonus']}
          bodyContent={''}
          noDataImg={null}
        ></NoDataComponent>
      )}
    </>
  );
};

const mapStateToProps = (state: any) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(BonusRewards);
