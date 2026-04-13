import React, { useEffect, useState } from 'react';
// import Telegram from '../../assets/images/footer/Vector (2).svg';
// import Instagram from '../../assets/images/footer/Vector (4).svg';
// import Facebook from '../../assets/images/footer/facebook-svgrepo-com 1.svg';
import Whatsapp from '../../assets/images/footer/whatsapp.svg';
// import Twitter from '../../assets/images/footer/twitter 1.svg';
import './SocialMediaNew.scss';
import { connect } from 'react-redux';



const SocialMedia = (props:any) => {
  const { domainConfig } = props;
  const [contactData, setContactData] = useState<any[]>([]);

  const socialMediaAndSiteName = {
    // FACEBOOK_LINK: Facebook,
    // TELEGRAM_NUMBER: Telegram,
    // INSTAGRAM_LINK: Instagram,
    // TWITTER_LINK: Twitter,

    // Skype is being used for whatsapp
    SKYPE_LINK: Whatsapp,
  };

  const socialMediaAndSiteNames = {
    FACEBOOK_LINK: 'Facebook',
    TELEGRAM_NUMBER: 'Telegram',
    INSTAGRAM_LINK: 'Instagram',
    TWITTER_LINK: 'Twitter',

    // Skype is being used for whatsapp
    SKYPE_LINK: 'Whatsapp',
  };

  const redirectToLink = (linkDetails) => {
    window.open(getLinkDetails(linkDetails), '_blank');
  };

  const getLinkDetails = (linkDetails) => {
    return (
      socialMediaAndSiteName[linkDetails.contactType] && linkDetails.details
    );
  };

  useEffect(() => {
    setContactData(domainConfig.suppportContacts);
  }, [domainConfig?.suppportContacts]);

  return (
    contactData?.length > 0 && (
      <div className="sm-new-ctn">
        {domainConfig.b2cEnabled && (
          <div className="sm-new-links">
            {contactData.map(
              (link) =>
                getLinkDetails(link) && (
                  <button
                    key={link.contactType}
                    className="sm-new-link"
                    onClick={() => redirectToLink(link)}
                  >
                    <img
                      src={socialMediaAndSiteName[link.contactType]}
                      alt={link.contactType}
                      className="sm-new-img"
                    />
                    <div className="sm-text">
                      {'Follow On' +
                        ' ' +
                        socialMediaAndSiteNames[link.contactType]}
                    </div>
                  </button>
                )
            )}
          </div>
        )}
      </div>
    )
  );
};

const mapStateToProps = (state:any) => {
  return {
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
  };
};

export default connect(mapStateToProps)(SocialMedia);
