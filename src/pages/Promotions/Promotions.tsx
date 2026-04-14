import React, { useEffect, useState } from 'react';
import ReportBackBtn from '../../common/ReportBackBtn/ReportBackBtn';
import ReportsHeader from '../../common/ReportsHeader/ReportsHeader';
import promotionsIcon from '../../assets/images/icons/promotions-icon.svg';
import PromotionCard from '../../components/PromotionsCard/PromotionsCard';
import './Promotions.scss';
import { BRAND_DOMAIN } from '../../constants/Branding';
// import SVLS_API from '../../api-services/svls-api';
import { AxiosResponse } from 'axios';
import Modal from '../../components/Modal/index';
import { BannerObjData, BannerResData, RenderHtml } from './Promotions.utils';
import { connect, useDispatch } from 'react-redux';
import { setAlertMsg } from '../../store/slices/commonSlice';
// import { RootState } from '../../models/RootState';
 const staticBanners = [
  {
    id: 1,
    publicUrl: "https://cdn.uvwin2024.co/dd5b2847-bc9e-4069-befe-a70aed09c801",
    imageContent: `
      <div>
        <h2>WELCOME BONUS</h2>
        <p>GET Bonus 500% Upto ₹2,500</p>
      </div>
    `,
    displayContent: "<h2>Welcome Bonus Details</h2><p>Get 500% bonus...</p>"
  },
  {
    id: 2,
    publicUrl: "https://cdn.uvwin2024.co/8f22f4bf-5fea-439b-a714-e4f576f2a3c1",
    imageContent: `
      <div>
        <h2>AFFILIATE MARKETING</h2>
        <p>Join Our Affiliate Program</p>
      </div>
    `,
    displayContent: "<h2>Affiliate Program</h2><p>Earn by referring...</p>"
  }
];

const Promotions: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const dispatch = useDispatch();
  const [promotionBanners, setPromotionBanners] = useState(staticBanners);
  const [showKnowMoreModal, setShowMoreModal] = useState(false);
  const [promotionDisplayData, setPromotionDisplayData] = useState('');



  const handleKnowMoreClick = (bannerInfo: BannerObjData) => {
    const promotionDisplayContent = bannerInfo.displayContent;

    if (promotionDisplayContent) {
      setPromotionDisplayData(promotionDisplayContent);
      setShowMoreModal(true);
    } else {
      dispatch(
        setAlertMsg({
          type: 'error',
          message: langData?.['no_display_content_txt'],
        })
      );
    }
  };

  const getPromotionBanners = async () => {
    // const bannersRes: AxiosResponse<BannerResData> = await SVLS_API.get(
    //   `/account/v2/books/${BRAND_DOMAIN}/banners`,
    //   {
    //     params: {
    //       category: 'Recommendedbanner',
    //       status: 'active',
    //       type: 'desktop',
    //     },
    //   }
    // );

    // setPromotionBanners(bannersRes.data.banners);
  };

  useEffect(() => {
    getPromotionBanners();
  }, []);

  return (
    <div className="promotions-page">
      <ReportBackBtn back={langData?.['back']} />
      <div>
        <ReportsHeader
          titleIcon={promotionsIcon}
          reportName={langData?.['promotions']}
          reportFilters={[]}
        />
      </div>
      <div className="promotion-card-ctn">
      {promotionBanners.map((banner) => (
  <PromotionCard
    key={banner.id}
    bannerData={banner}
    onKnowMorePress={handleKnowMoreClick}
    langData={langData}
  />
))}
      </div>

      <Modal
        open={showKnowMoreModal}
        closeHandler={() => setShowMoreModal(false)}
        title={langData?.['promotion_info']}
        size="xs"
        disableFullScreen
      >
        <div className="promotions-modal-ctn">
          <RenderHtml htmlString={promotionDisplayData} />
        </div>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(Promotions);
