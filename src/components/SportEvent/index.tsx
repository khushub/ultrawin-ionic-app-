import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import { selectEventData, selectLimitStatus, selectMinMaxAll, selectTotalPremiumCount } from '../../store/selectors/selectors';
// import MatchOddsTable from './MatchOddsTable';
import { IonRow } from '@ionic/react';
import { buildMarketBetsMap, buildMarketByIdSet } from '../../util/formatters';
import RegularMarketTable from './comps/RegularMarketTable';
import { Tab, Tabs } from '@mui/material';
import TabPanel from '../TabPanel/TabPanel';
import FancyMarketsTable from './comps/FancyMarketsTable';
import PremiumMarkets from './comps/PremiumMarkets';


type SportEventProps = {
    openBets: any[];
    langData: any;
    onBtnClick: (data: any, item: any, mainValue: number | string, subValue: number | string, isBack: boolean) => void;
};


const SportEvent: React.FC<SportEventProps> = ({ openBets, langData, onBtnClick }) => {
    const eventData = useSelector(selectEventData);
    const limitStatus = useSelector(selectLimitStatus);
    const minMaxAll = useSelector(selectMinMaxAll);
    const premiumMarketsCount = useSelector(selectTotalPremiumCount);
    const [fancyTabVal, setFancyTabVal] = useState(0);

    const marketBetsMap = useMemo(() => {
        return buildMarketBetsMap(openBets);
    }, [openBets]);

    const fancyMarketByIdSet = useMemo(() => {
        return buildMarketByIdSet(marketBetsMap.get('SESSION') || []);
    }, [marketBetsMap])


    return (
        <>
            {eventData?.regularGroups.map((item: any, index: number) =>
                !!item ? (
                    <IonRow 
                        className="eam-table-section"
                        key={`market-${index}`}
                    >
                        <RegularMarketTable 
                            data={item}
                            openBets={marketBetsMap.get(item?.marketId) || []}
                            limitStatus={limitStatus}
                            minMaxAll={minMaxAll}
                            onBtnClick={onBtnClick}
                        />
                    </IonRow>
                ) : null
            )}


            <IonRow className="eam-table-section fancy-tab-section">
                <>
                    <Tabs
                        value={fancyTabVal}
                        className="fancy-market-tabs"
                        onChange={(_, newValue) => {
                            setFancyTabVal(newValue);
                        }}
                    >
                        {eventData?.sessionGroups.length >0 ? (
                            <Tab
                                label={langData?.["fancy"]}
                                className="fancy-tab"
                                value={0}
                            />
                        ) : null}
                        {/* {premiumMarketsCount>0? (
                            <Tab
                                label={langData?.["premium"]}
                                className="fancy-tab premium-markets"
                                value={1}
                            />
                        ) : null} */}

                       
                            <Tab
                                label={langData?.["premium"]}
                                className="fancy-tab premium-markets"
                                value={1}
                            />
                      
                        
                    </Tabs>
                    <div className="fancy-tab-border"></div>
                    <IonRow>
                        <TabPanel
                            value={fancyTabVal}
                            index={0}
                            className="fancy-tab-ctn"
                        >
                            {eventData?.sessionGroups.length >0? (
                                <>
                                    <FancyMarketsTable 
                                        group={eventData?.sessionGroups}
                                        marketBetsMap={marketBetsMap}
                                        limitStatus={limitStatus}
                                        minMaxAll={minMaxAll}
                                        fancyBetsMarketByIdSet={fancyMarketByIdSet}
                                        onBtnClick={onBtnClick}
                                    />
                                </>
                            ) : null}
                        </TabPanel>

                        <IonRow className="row-100">
                            {" "}
                            <TabPanel
                                value={fancyTabVal}
                                index={1}
                                className="fancy-tab-ctn premium-iframe-container"
                            >

                                  <PremiumMarkets />
                                {/* {!["99990", "2378961"].includes(
                                    eventData?.sportId,
                                ) ? (
                                    <>
                                        {premiumIframeLoading ? (
                                            <div className="no-fancy-msg">
                                                {langData?.[
                                                    "loading"
                                                ] || "Loading..."}
                                            </div>
                                        ) : premiumIframeUrl ? (
                                            <iframe
                                                src={
                                                    premiumIframeUrl
                                                }
                                                className="premium-iframe"
                                                title="Premium Markets"
                                                sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups allow-downloads"
                                            />
                                        ) : (
                                            <div className="no-fancy-msg">
                                                {
                                                    langData?.[
                                                        "premium_markets_not_found_txt"
                                                    ]
                                                }
                                            </div>
                                        )}
                                    </>
                                ) : null} */}
                            </TabPanel>
                        </IonRow>
                    </IonRow>
                </>
            </IonRow>
        </>
    )
}

export default SportEvent;