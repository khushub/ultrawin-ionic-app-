// 📁 public/workers/dataProcessor.worker.js
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch(type) {
        case 'PROCESS_EVENT_DATA':
            const result = processEventData(data.eventData);
            self.postMessage({
                type: 'PROCESSED_EVENT_DATA',
                data: result,
                requestId: data.requestId
            });
            break;
    }
};

// 🚀 Heavy processing functions moved to worker
function processEventData(eventData) {
    if (!Array.isArray(eventData)) return { regularGroups: [], sessionGroups: [], isEmpty: true };
    
    let groups = [];
    let sessionGroups = [];

    eventData.forEach((group) => {
        if (Array.isArray(group[0])) {
            group.forEach((subGroup) => {
                const data = processGroup(subGroup, groups.length);
                if (!!data) {
                    if (Array.isArray(data)) {
                        groups = groups.concat(data);
                    } else {
                        if (data.isTab) {
                            sessionGroups.push(data);
                        } else {
                            groups.push(data);
                        }
                    }
                }
            });
        } else {
            const data = processGroup(group, groups.length);
            if (!!data && data?.marketName !== "TIED_MATCH") {
                if (Array.isArray(data)) {
                    groups = groups.concat(data);
                } else {
                    if (data.isTab) {
                        sessionGroups.push(data);
                    } else {
                        groups.push(data);
                    }
                }
            }
        }
    });

    // const sortedGroups = groups.sort((a, b) => {
    //     if (a?.marketName === "TO Win Toss" && b?.marketName !== "TO Win Toss") return -1;
    //     if (a?.marketName !== "TO Win Toss" && b?.marketName === "TO Win Toss") return 1;
    //     return 0;
    // });

    return {
        regularGroups: groups,
        sessionGroups,
        isEmpty: groups.length === 0 && sessionGroups.length === 0
    };
}

function processGroup(group, index) {
    let marketData = {};

    for (let item of group) {
        if (item?.marketType !== "SESSION" && item?.marketType !== "SESSION_ODDS" && group?.length > 1)
            return group;
        if (item?.marketType === "SESSION" || item?.marketType === "SESSION_ODDS") {
            marketData = {
                name: item?.fancyName,
                marketType: item.marketType,
                items: group,
                isTab: true,
            };
            return marketData;
        } else {
            return item;
        }
    }

    if (!!marketData.marketType) {
        return marketData;
    }
    return null;
}