import React, { useEffect, useState } from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';
import {
  AffiliatePageTabTypes,
  FieldTypes,
  affiliatePageTabs,
  referralBaseUrl,
} from './affiliate.utils';
import AffiliateInfoComp from './AffiliateInfoComp';
import ReferredUsers from './ReferredUsers';
import CommissionPage from './CommissionPage';
import FundsReport from './FundsPage';
import AffiliateOverview from './AffiliateOverview';
// import SVLS_API from '../../api-services/svls-api';
import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../models/RootState';

import { setAlertMsg } from '../../store/slices/commonSlice';
import AffiliateDailyReport from './AffiliateDailyReport';

const initialAffiliateFormState = {
  affiliateName: '',
  affiliateId: '',
  referralLink: referralBaseUrl,
};

export const useAffiliateHook = () => {
  const dispatch = useDispatch();
  const [campaignPageLoader, setCampaignPageLoader] = useState(false);
  const [showAffiliateInfo, setShowAffiliateInfo] = useState(false);
  const [showAddNewAffiliateForm, setShowAddNewAffiliateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(
    affiliatePageTabs[0].type
  );

  const { campaignInfo: campaignDetails } = useSelector(
    (state: any) => state.common
  );

  const { langData } = useSelector((state: any) => state.common);

  const [affiliateFormState, setAffiliateFormState] = useState(
    initialAffiliateFormState
  );

  const isMobile = useWindowSize().width < 720;

  const resetCreateCampaignInputFields = () => {
    setAffiliateFormState({
      ...initialAffiliateFormState,
    });
  };

  const handleFormTextChange = (text: string, fieldType: FieldTypes) => {
    switch (fieldType) {
      case FieldTypes.AFFILIATE_NAME:
        setAffiliateFormState({ ...affiliateFormState, affiliateName: text });
        break;

      case FieldTypes.AFFILIATE_ID:
        setAffiliateFormState({
          ...affiliateFormState,
          affiliateId: text,
          referralLink: referralBaseUrl + text,
        });
        break;

      case FieldTypes.REFERRAL_LINK:
        setAffiliateFormState({ ...affiliateFormState, referralLink: text });
        break;

      default:
        setAffiliateFormState({ ...affiliateFormState });
    }
  };

  const toggleAffiliateForm = () => {
    setShowAddNewAffiliateForm((previousState) => !previousState);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const getCampaignDetails = async () => {
    setCampaignPageLoader(true);
    // try {
    //   const campaignRes = await SVLS_API.get(
    //     '/marketing/v1/affiliate-accounts/get-campaign-details',
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //       },
    //     }
    //   );

    //   if (campaignRes.status === 200) {
    //     // dispatch(setCampaignInfo(campaignRes.data));
    //   }
    // } catch (e) {
    //   dispatch(
    //     setAlertMsg({
    //       type: 'error',
    //       message: langData?.['general_err_txt'],
    //     })
    //   );
    // }

    setCampaignPageLoader(false);
  };

  const createCampaign = async (campaignId: string, campaignName: string) => {
    // try {
    //   const createCampaignRes = await SVLS_API.post(
    //     '/marketing/v1/affiliate-accounts/add-affiliate-campaign',
    //     {
    //       campaign_id: campaignId,
    //       campaign_name: campaignName,
    //     },
    //     {
    //       headers: {
    //         Authorization: sessionStorage.getItem('jwt_token'),
    //       },
    //     }
    //   );

    //   if (createCampaignRes.status === 204) {
    //     dispatch(
    //       setAlertMsg({
    //         type: 'success',
    //         message: langData?.['campaign_create_success'],
    //       })
    //     );
    //     setShowAddNewAffiliateForm(false);
    //     setTimeout(() => getCampaignDetails(), 1000);
    //   }
    // } catch (e) {
    //   dispatch(
    //     setAlertMsg({
    //       type: 'error',
    //       message: e.response.data.message,
    //     })
    //   );
    // }
  };

  const handleCreateCampaign = () => {
    createCampaign(
      affiliateFormState.affiliateId,
      affiliateFormState.affiliateName
    );
  };

  useEffect(() => {
    getCampaignDetails();
  }, []);

  const getSelectedComponent = () => {
    switch (selectedTab) {
      case AffiliatePageTabTypes.CAMPAIGNS:
        return (
          <AffiliateInfoComp
            campaignDetails={campaignDetails}
            toggleAffiliateForm={toggleAffiliateForm}
            langData={langData}
          />
        );

      case AffiliatePageTabTypes.REFERRED_USERS:
        return <ReferredUsers langData={langData} />;

      case AffiliatePageTabTypes.COMMISSION:
        return <CommissionPage langData={langData} />;

      case AffiliatePageTabTypes.FUNDS:
        return (
          <FundsReport
            isMobile={isMobile}
            campaignDetails={campaignDetails}
            getCampaignDetails={getCampaignDetails}
            langData={langData}
          />
        );

      case AffiliatePageTabTypes.DAILY_REPORT:
        return <AffiliateDailyReport langData={langData} />;
      default:
        return <AffiliateOverview langData={langData} />;
    }
  };

  return {
    campaignPageLoader,
    showAffiliateInfo,
    setShowAffiliateInfo,
    showAddNewAffiliateForm,
    setShowAddNewAffiliateForm,
    selectedTab,
    setSelectedTab,
    affiliateFormState,
    setAffiliateFormState,
    isMobile,
    handleFormTextChange,
    toggleAffiliateForm,
    handleTabChange,
    getSelectedComponent,
    campaignDetails,
    handleCreateCampaign,
    resetCreateCampaignInputFields,
    langData,
  };
};
