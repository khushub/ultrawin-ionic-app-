import Kabaddi from '../../assets/images/sidebar/kabaddi.svg?react';
import Baseball from '../../assets/images/sidebar/baseball.svg?react';
import Basketball from '../../assets/images/sidebar/basketball.svg?react';
import Binary from '../../assets/images/sidebar/binary.svg?react';
import Cricket from '../../assets/images/sidebar/cricket.svg?react';
import Darts from '../../assets/images/sidebar/darts.svg?react';
import Football from '../../assets/images/sidebar/football.svg?react';
import Futsal from '../../assets/images/sidebar/futsal.svg?react';
import GreyHound from '../../assets/images/sidebar/grey_hound.svg?react';
import HorseRacing from '../../assets/images/sidebar/horse_racing.svg?react';
import IceHockey from '../../assets/images/sidebar/ice-hockey.svg?react';
import Rugby from '../../assets/images/sidebar/rugby.svg?react';
import MMA from '../../assets/images/sidebar/mma.svg?react';
import MultiMarkets from '../../assets/images/sidebar/multi_markets.svg?react';
import Politics from '../../assets/images/sidebar/politics.svg?react';
import Promotions from '../../assets/images/sidebar/promotions.svg?react';
import TableTennis from '../../assets/images/sidebar/table_tennis.svg?react';
import Tennis from '../../assets/images/sidebar/tennis.svg?react';
import Volleyball from '../../assets/images/sidebar/volleyball.svg?react';
import CockFight from '../../assets/images/sidebar/cockfight-icon.svg?react';

import AccountStatement from '../../assets/images/sidebar/account_statement.svg?react';
import AffiliateIcon from '../../assets/images/sidebar/affiliate-program.svg?react';
import BonusStatement from '../../assets/images/sidebar/bonus_statement.svg?react';
import Deposit from '../../assets/images/sidebar/deposit.svg?react';
import GameRules from '../../assets/images/sidebar/game_rules.svg?react';
import Logout from '../../assets/images/sidebar/logout.svg?react';
import MyBets from '../../assets/images/sidebar/my_bets.svg?react';
import MyProfile from '../../assets/images/sidebar/my_profile.svg?react';
import MyTransaction from '../../assets/images/sidebar/my_transaction.svg?react';
import MyWallet from '../../assets/images/sidebar/my_wallet.svg?react';
import ProfitLoss from '../../assets/images/sidebar/profit_loss.svg?react';
import StakeSettings from '../../assets/images/sidebar/stake_settings.svg?react';
import TermsPolicy from '../../assets/images/sidebar/TermsPolicy.svg?react';
import TurnoverHistory from '../../assets/images/sidebar/turnover_history.svg?react';
import Withdraw from '../../assets/images/sidebar/withdraw.svg?react';
import { LanguageOutlined } from '@mui/icons-material';
import ThemeBtn from '../../assets/images/home/tiles/theme_svg.svg?react';
import TwoFactorIcon from '../../assets/images/MyProfileIcons/two_factor_icon.svg?react';

export const sideHeaderTabs = [
    {
        id: '4',
        text: 'cricket',
        langKey: 'cricket',
        img: Cricket,
        route: '/exchange_sports/cricket',
        showWithoutLogin: true,
    },
    {
        id: '1',
        text: 'football',
        langKey: 'football',
        img: Football,
        route: '/exchange_sports/football',
        showWithoutLogin: true,
    },
    {
        id: '2',
        text: 'tennis',
        langKey: 'tennis',
        img: Tennis,
        route: '/exchange_sports/tennis',
        showWithoutLogin: true,
    },
    {
        id: 'cock_fight',
        text: 'Cock Fight',
        langKey: 'cock_fight',
        img: CockFight,
        route:
        '/dc/gamev1.1/cockfight-NDAwMzMy-U1YtTElWRS0wMDE=-QVdD-U1YzODg=-R0FQ',
        showWithoutLogin: true,
    },
    {
        id: '99994',
        text: 'Kabaddi',
        langKey: 'kabaddi',
        img: Kabaddi,
        route: '/exchange_sports/kabaddi',
        showWithoutLogin: true,
    },
    {
        id: '7522',
        text: 'Basketball',
        langKey: 'basketball',
        img: Basketball,
        route: '/exchange_sports/basketball',
        showWithoutLogin: true,
    },
    {
        id: '7511',
        text: 'Baseball',
        langKey: 'baseball',
        img: Baseball,
        route: '/exchange_sports/baseball',
        showWithoutLogin: true,
    },
    {
        id: '4339',
        text: 'GreyHound',
        langKey: 'greyhound',
        img: GreyHound,
        route: '/exchange_sports/greyhound',
        showWithoutLogin: true,
    },
    {
        id: '7',
        text: 'Horse Race',
        langKey: 'horse_race',
        img: HorseRacing,
        route: '/exchange_sports/horseracing',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:23',
        text: 'Volleyball',
        langKey: 'volleyball',
        img: Volleyball,
        route: '/exchange_sports/volleyball',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:22',
        text: 'Darts',
        langKey: 'darts',
        img: Darts,
        route: '/exchange_sports/darts',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:29',
        text: 'Futsal',
        langKey: 'futsal',
        img: Futsal,
        route: '/exchange_sports/futsal',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:20',
        text: 'Table Tennis',
        langKey: 'table_tennis',
        img: TableTennis,
        route: '/exchange_sports/tabletennis',
        showWithoutLogin: true,
    },
    {
        id: '99990',
        text: 'Binary',
        langKey: 'binary',
        img: Binary,
        route: '/exchange_sports/binary',
        showWithoutLogin: true,
    },
    {
        id: '2378961',
        text: 'Politics',
        langKey: 'politics',
        img: Politics,
        route: '/exchange_sports/politics',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:4',
        text: 'Ice Hockey',
        langKey: 'ice_hockey',
        img: IceHockey,
        route: '/exchange_sports/icehockey',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:117',
        text: 'MMA',
        img: MMA,
        langKey: 'mma',
        route: '/exchange_sports/mma',
        showWithoutLogin: true,
    },
    {
        id: 'sr:sport:12',
        text: 'Rugby',
        langKey: 'rugby',
        img: Rugby,
        route: '/exchange_sports/rugby',
        showWithoutLogin: true,
    },
    {
        id: '23',
        text: 'Multi markets',
        langKey: 'multimarkets',
        img: MultiMarkets,
        route: '/exchange_sports/multi-markets',
        showWithoutLogin: true,
    },
];

export const otherMenuTabs = [
    {
        id: 9,
        text: 'Deposit',
        langKey: 'deposit',
        img: Deposit,
        route: '/transaction/deposit',
        showWithoutLogin: false,
    },
    {
        id: 10,
        text: 'Withdraw',
        langKey: 'withdraw',
        img: Withdraw,
        route: '/transaction/withdraw',
        showWithoutLogin: false,
    },
    {
        id: 24,
        text: 'Promotions',
        langKey: 'promotions',
        img: Promotions,
        route: '/promotions',
        showWithoutLogin: true,
    },
    {
        id: 11,
        text: 'My Bets',
        langKey: 'my_bets',
        img: MyBets,
        route: '/my_bets',
        showWithoutLogin: false,
    },
    {
        id: 12,
        text: 'My Wallet',
        langKey: 'my_wallet',
        img: MyWallet,
        route: '/my_wallet',
        showWithoutLogin: false,
    },
    {
        id: 13,
        text: 'Affiliate Program',
        langKey: 'affiliate_program',
        img: AffiliateIcon,
        route: '/affiliate_program',
        showWithoutLogin: false,
    },
    // {
    //   id: 14,
    //   text: 'Commission report',
    //   img: CommissionReport,
    //   route: '/commission_report:upline',
    //   showWithoutLogin: false,
    // },
    {
        id: 15,
        text: 'Betting Profit & Loss',
        langKey: 'betting_profit_and_loss',
        img: ProfitLoss,
        route: '/pl_statement',
        showWithoutLogin: false,
    },
    {
        id: 16,
        text: 'Turnover history',
        langKey: 'turnover_history',
        img: TurnoverHistory,
        route: '/bonus/turnover_history',
        showWithoutLogin: false,
    },
    {
        id: 17,
        text: 'Account Statement',
        langKey: 'account_statement',
        img: AccountStatement,
        route: '/account_statement',
        showWithoutLogin: false,
    },
    {
        id: 18,
        text: 'Bonus Statement',
        langKey: 'bonus_statement',
        img: BonusStatement,
        route: '/bonus_statement',
        showWithoutLogin: false,
    },
    {
        id: 25,
        text: 'Deposit Turnover',
        langKey: 'deposit_turnover',
        img: TurnoverHistory,
        route: '/deposit-turnover',
        showWithoutLogin: false,
    },
    {
        id: 19,
        text: 'My Transaction',
        langKey: 'my_transactions',
        img: MyTransaction,
        route: '/my_transactions',
        showWithoutLogin: false,
    },
    {
        id: 20,
        text: 'Stake Settings',
        langKey: 'stake_settings',
        img: StakeSettings,
        route: '/set-button-variables',
        showWithoutLogin: false,
    },
    {
        id: 8,
        text: 'Game Rules',
        langKey: 'game_rules',
        img: GameRules,
        route: '/game-rules',
        showWithoutLogin: true,
    },
    {
        id: 21,
        text: 'My Profile',
        langKey: 'my_profile',
        img: MyProfile,
        route: '/profile?tab=0',
        showWithoutLogin: false,
    },
    {
        id: 28,
        text: 'Two Factor Authentication',
        langKey: 'two_factor_auth',
        img: TwoFactorIcon,
        route: '/profile?tab=2',
        showWithoutLogin: false,
        blink: true,
    },
    {
        id: 26,
        text: 'Languages',
        langKey: 'language',
        img: LanguageOutlined,
        route: '/languages',
        showWithoutLogin: true,
    },
    {
        id: 27,
        text: 'Theme',
        langKey: 'theme',
        img: ThemeBtn,
        route: '/',
        showWithoutLogin: true,
    },
];

export const securityAndLogout = [
    {
        id: 21,
        text: 'Terms & Policy',
        langKey: 'terms_and_policy',
        img: TermsPolicy,
        route: '/terms-conditions',
        showWithoutLogin: true,
    },
    {
        id: 22,
        text: 'Logout',
        langKey: 'logout',
        img: Logout,
        route: '',
        showWithoutLogin: false,
    },
];

export const securityAndLogoutForFairplay = [
    {
        id: 21,
        text: 'Terms',
        langKey: 'terms_conditions',
        img: TermsPolicy,
        route: '/fairplay-terms-conditions',
        showWithoutLogin: true,
    },
    {
        id: 23,
        text: 'Privacy Policy',
        langKey: 'privacy_policy',
        img: GameRules,
        route: '/fairplay_policy',
        showWithoutLogin: true,
    },
    {
        id: 22,
        text: 'Logout',
        langKey: 'logout',
        img: Logout,
        route: '',
        showWithoutLogin: false,
    },
];
