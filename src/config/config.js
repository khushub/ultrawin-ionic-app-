const hosts = {
    'localhost': {
        title: 'Ultrawin',
        brandName: 'Ultrawin',
        metaDescription: '',
        demo_user_enabled: true,
        signup_enabled: true,
        whatsapp_support: true,
        payments_enabled: true,
        bonus_enabled: true,
        affiliate_enabled: true,
        deposit_wagering_enabled: true,
        support_contacts: [
            { contactType:"CUSTOMER_SUPPORT_LINK", details:"9090909090" },
            { contactType:"WHATSAPP_NUMBER", details:"9090909009" },
            { contactType:"TELEGRAM_NUMBER", details:"" },
            { contactType:"INSTAGRAM_LINK", details:"" },
            { contactType: "SKYPE_LINK", details: "https://whatsapp.com/channel/0029VbC1Ayd7DAX65TrKVA0D" },
            { contactType: "FACEBOOK_LINK", details: "" },
            { contactType: "EMAIL_LINK", details: "ultrawin@ultrawin.co" },
            { contactType: "REGISTRATION_WHATSAPP_LINK", details: "https://wa.link/ultrawinho" },
        ],
        apk_url: 'apk.uvwin2024.co/ultrawin.apk',
        b2c_enabled: true,
        rule_scope: 'HOUSE',
        showThemes: true,
        skins: [
            {
                label: "99exch",
                domain: `https://99exc.krishexch.com`,
            },
            {
                label: "Lotus",
                domain: `https://lotus365.krishexch.com`,
            },
            {
                label: "Ultrawin",
                domain: `http://localhost:5173`,
                disabled: true,
            },
        ],

        managerId: '68ce8fe00363531b35841293',
        siteurl: 'getid.vip',
    }
}


const hostName = window.location.hostname;
export const CONFIG = {
    ...(hosts[hostName] || hosts['localhost']),
    languages: ["English(EN)", "Hindi(HIN)", "Telugu(TEL)", "Gujarati(GUJ)", "Tamil(TAM)", "Kannada(KAN)", "Bengali(BEN)", "Malayalam(MAL)", "Marathi(Mar)", "Punjabi(PUN)", "Odia(ODIA)", "Assamese(ASSM)"],
    logo: '/assets/hosts/' + hostName + '/logo.png',
}