import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
import DepositBanner from '../../assets/images/home_page/banner/joining_bonus.webp';
import JoiningBonusMob from '../../assets/images/banners/joining_bonus_mob.webp';
import AffiliateBanner from '../../assets/images/home_page/banner/affiliate.webp';
import AffiliateMobilePng2xBanner from '../../assets/images/banners/affiliate_mob.webp';
import DepositIcon from '../../assets/images/icons/depositIcon.svg';
import WithdrawIcon from '../../assets/images/icons/withdrawIcon.svg';
import { Button } from '@mui/material'; 
import { connect, useSelector } from 'react-redux';
// import { RootState } from '../../models/RootState';
import { AuthResponse } from '../../models/api/AuthResponse';
import SVLS_API from '../../svls-api';
import { BRAND_DOMAIN } from '../../constants/Branding';
import { BannerManagementCategoryEnum } from '../../models/cms.types';

type StateProps = {
  loggedIn: boolean;
  langData: any;
};

const desktopDefaultBanner = [
  {
    publicUrl: DepositBanner,
    redirectionUrl: '/transaction/deposit',
  },
  {
    publicUrl: AffiliateBanner,
    redirectionUrl: '/affiliate_program',
  },
];

const mobileDefaultBanner = [
  {
    publicUrl: JoiningBonusMob,
    redirectionUrl: '/transaction/deposit',
  },
  {
    publicUrl: AffiliateMobilePng2xBanner,
    redirectionUrl: '/affiliate_program',
  },
];

const App: React.FC<StateProps> = (props) => {
  const { loggedIn, langData } = props;
  const history = useHistory();
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);

  const { domainConfig } = useSelector((state: any) => state.common);
  const fetchBannerData = async () => {
    let webdata = [];
    let mobiledata = [];
    // try {
    //   const response: AuthResponse = await SVLS_API.get(
    //     `/account/v2/books/${BRAND_DOMAIN}/banners`,
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       params: {
    //         status: 'active',
    //         type: '*',
    //         category: BannerManagementCategoryEnum.HOME,
    //       },
    //     }
    //   );
    //   let data = response?.data?.banners;
    //   if (data?.length > 0) {
    //     data.map((item) => {
    //       if (item.deviceType === 'desktop') {
    //         webdata.push(item);
    //       } else if (item.deviceType === 'mobile') {
    //         mobiledata.push(item);
    //       }
    //     });
    //     setApiWebBanners(webdata);
    //     setApiMobBanners(mobiledata);
    //   }
    // } catch (err) {
    //   console.log(err);
    // }
  };

  useEffect(() => {
    fetchBannerData();
  }, []);

  return (
    <div className="banner-container mt-12">
      <div className="banner-cards">
        {loggedIn && domainConfig.payments && domainConfig.b2cEnabled && (
          <>
            <Button
              onClick={() => history.push('/transaction/deposit')}
              className="deposit-btn"
              key={'deposit-btn'}
            >
              <img src={DepositIcon} alt="deposit" />
              {langData?.['deposit']}
            </Button>
            <Button
              onClick={() => history.push('/transaction/withdraw')}
              className="withdraw-btn"
              key={'withdraw-btn'}
            >
              <img src={WithdrawIcon} alt="withdraw" />
              {langData?.['withdraw']}
            </Button>
          </>
        )}

        {!isMobile
          ? (apiWebBanners?.length > 0
              ? apiWebBanners
              : desktopDefaultBanner
            )?.map((banner, index) => (
              <div 
                key={index}
                className={'inplay-bg banner-card-div'}>
                <div
                  className="banner-image"
                  onClick={() => {
                    if (loggedIn) {
                      history.push(banner.redirectionUrl);
                    } else {
                      history.push('/login');
                    }
                  }}
                >
                  <img
                    src={
                      banner?.publicUrl ||
                      (index === 0 ? DepositBanner : AffiliateBanner)
                    }
                    alt={banner.title}
                  />
                </div>
              </div>
            ))
          : (apiMobBanners?.length > 0
              ? apiMobBanners
              : mobileDefaultBanner
            )?.map((banner, index) => (
              <div 
               key={index}
               className={'inplay-bg banner-card-div'}>
                <div
                  className="banner-image"
                  onClick={() => {
                    if (loggedIn) {
                      history.push(banner?.redirectionUrl);
                    } else {
                      history.push('/login');
                    }
                  }}
                >
                  <img
                    src={
                      banner?.publicUrl ||
                      (index === 0
                        ? JoiningBonusMob
                        : AffiliateMobilePng2xBanner)
                    }
                    alt={banner.title}
                  />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    loggedIn: state.auth.loggedIn,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(App);
