import { createSelector } from '@reduxjs/toolkit'

// // From ui slice
// const uiSelector = (state) => state.ui
// export const selectSidebarOpen = createSelector(
//     [uiSelector],
//     (ui) => ui.sidebarOpen
// )


// From betplacing slice
const betPlacingSelector = (state) => state.betPlacing
export const selectMarketId = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.marketId
);
export const selectRunnerId = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.runnerId
);
export const selectLimitStatus = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.limitStatus
);
export const selectMinMaxAll = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.minMaxAll
);
export const selectMinMax = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.minMax
);
export const selectBetDelay = createSelector(
    [betPlacingSelector],
    (betPlacing) => betPlacing.betDelay
)



// // From depositPopup slice
// const depositPopupSelector = (state) => state.depositPopup;
// export const selectOrderConfirmation = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.orderConfirmation
// );
// export const selectFundSafety = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.fundSafety
// );
// export const selectCurrDepositData = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.currentDeposit
// );
// export const selectPaymentTimer = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.paymentTimer
// );
// export const selectPaymentSubmitActive = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.paymentSubmitActive
// );
// export const selectDepositNotification = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.depositNotification
// );
// export const selectDepositResult = createSelector(
//     [depositPopupSelector],
//     (depositPopup) => depositPopup.depositResult
// );



// // From betMarketsPopup slice
// const linkDepositSelector = (state) => state.linkDeposit;
// export const selectLinkDepositUserId = createSelector(
//     [linkDepositSelector],
//     (linkDeposit) => linkDeposit.userId
// );
// export const selectLinkDepositAmount = createSelector(
//     [linkDepositSelector],
//     (linkDeposit) => linkDeposit.paymentAmount
// );



// From event slice
const eventSelector = (state) => state.event;
export const selectEventData = createSelector(
    [eventSelector],
    (event) => event.eventData
);
export const selectMarketData = createSelector(
    [eventSelector],
    (event) => event.marketData
);
export const selectTotalPremiumCount = createSelector(
    [eventSelector],
    (event) => event.totalPremiumCount
);
export const selectPremiumData = createSelector(
    [eventSelector],
    (event) => event.premiumData
);
export const selectEventName = createSelector(
    [eventSelector],
    (event) => event.eventName
);
export const selectEventLoaded = createSelector(
    [eventSelector],
    (event) => event.eventLoaded
);
export const selectCompetitionName = createSelector(
    [eventSelector],
    (event) => event.competitionName
);
export const selectIsInplay = createSelector(
    [eventSelector],
    (event) => event.isInplay
);
export const selectEventOpenDate = createSelector(
    [eventSelector],
    (event) => event.openDate
);
export const selectEventVideo = createSelector(
    [eventSelector],
    (event) => event.video
);
export const selectEventScore = createSelector(
    [eventSelector],
    (event) => event.score
);
export const selectCricketScore = createSelector(
    [eventSelector],
    (event) => event.cricketScore
);
export const selectLadderMarketId = createSelector(
    [eventSelector],
    (event) => event.ladderMarketId
);
export const selec = createSelector(
    [eventSelector],
    (event) => event.ladderMarketId
);



// // From betMarketsPopup slice
// const betMarketsPopupSelector = (state) => state.betMarketsPopup;
// export const selectBetMarketPopupOpen = createSelector(
//     [betMarketsPopupSelector],
//     (betMarketsPopup) => betMarketsPopup.isOpen
// );



// // From stakesPopup slice
// const stakesPopupSelector = (state) => state.stakesPopup;
// export const selectStakesPopupOpen = createSelector(
//     [stakesPopupSelector],
//     (stakesPopup) => stakesPopup.isOpen
// );