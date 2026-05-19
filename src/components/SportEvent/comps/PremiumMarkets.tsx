import React, { useMemo, useState } from "react";
import {
  FaLock,
  FaMinusSquare,
  FaInfoCircle,
} from "react-icons/fa";
import "./PremiumMarkets.scss";

const premiumTabs = [
  "All",
  "Match",
  "Innings",
  "Over",
  "Player",
  "Other",
  "My Bets",
];

const premiumData = {
  All: [
    {
      title: "Winner (incl. super over)",
      items: [
        {
          team: "Lucknow Super Giants",
          odd: "2.10",
          color: "blue",
        },
        {
          team: "Chennai Super Kings",
          odd: "1.71",
          color: "blue",
        },
      ],
    },

    {
      title: "Will there be a tie",
      items: [
        {
          team: "yes",
          odd: "13.50",
          color: "blue",
        },
        {
          team: "no",
          odd: "LOCK",
          color: "lock",
        },
      ],
    },
  ],

  Match: [
    {
      title: "Which team wins the coin toss",
      items: [
        {
          team: "Lucknow Super Giants",
          odd: "1.92",
          color: "blue",
        },
        {
          team: "Chennai Super Kings",
          odd: "1.92",
          color: "blue",
        },
      ],
    },

    {
      title: "Match Total Runs",
      items: [
        {
          team: "Over 220.5",
          odd: "1.80",
          color: "yellow",
        },
        {
          team: "Under 220.5",
          odd: "2.02",
          color: "blue",
        },
      ],
    },
  ],

  Innings: [
    {
      title: "1st innings - Lucknow Super Giants total fours",
      items: [
        {
          team: "over 15.5",
          odd: "2.02",
          color: "blue",
        },
        {
          team: "under 15.5",
          odd: "1.70",
          color: "blue",
        },
      ],
    },

    {
      title: "1st innings - Chennai Super Kings total fours",
      items: [
        {
          team: "over 15.5",
          odd: "1.81",
          color: "blue",
        },
        {
          team: "under 15.5",
          odd: "1.89",
          color: "blue",
        },
      ],
    },

    {
      title: "1st innings - Lucknow Super Giants total sixes",
      items: [
        {
          team: "over 8.5",
          odd: "1.99",
          color: "blue",
        },
        {
          team: "under 8.5",
          odd: "1.73",
          color: "blue",
        },
      ],
    },
  ],

  Over: [
    {
      title: "1st innings over 5 - Lucknow Super Giants total",
      items: [
        {
          team: "over 8.5",
          odd: "1.71",
          color: "yellow",
        },
        {
          team: "under 8.5",
          odd: "2.06",
          color: "yellow",
        },
        {
          team: "over 9.5",
          odd: "1.97",
          color: "blue",
        },
        {
          team: "under 9.5",
          odd: "1.78",
          color: "blue",
        },
      ],
    },

    {
      title: "1st innings over 2 - Lucknow Super Giants total",
      items: [
        {
          team: "over 7.5",
          odd: "1.72",
          color: "yellow",
        },
        {
          team: "under 7.5",
          odd: "2.04",
          color: "yellow",
        },
        {
          team: "over 8.5",
          odd: "2.00",
          color: "blue",
        },
        {
          team: "under 8.5",
          odd: "1.75",
          color: "blue",
        },
      ],
    },
  ],

  Player: [
    {
      title: "1st innings - Pooran, Nicholas total",
      items: [
        {
          team: "over 22.5",
          odd: "1.87",
          color: "blue",
        },
        {
          team: "under 22.5",
          odd: "1.87",
          color: "blue",
        },
      ],
    },

    {
      title: "1st innings - Samson, Sanju total",
      items: [
        {
          team: "over 26.5",
          odd: "1.87",
          color: "blue",
        },
        {
          team: "under 26.5",
          odd: "1.87",
          color: "blue",
        },
      ],
    },

    {
      title: "1st innings - Sharma, Kartik total",
      items: [
        {
          team: "over 18.5",
          odd: "1.87",
          color: "blue",
        },
        {
          team: "under 18.5",
          odd: "1.87",
          color: "blue",
        },
      ],
    },
  ],

  Other: [
    {
      title: "Highest Opening Partnership",
      items: [
        {
          team: "Lucknow Super Giants",
          odd: "1.80",
          color: "blue",
        },
        {
          team: "Chennai Super Kings",
          odd: "2.05",
          color: "blue",
        },
      ],
    },
  ],

  "My Bets": [
    {
      title: "No Bets Available",
      items: [
        {
          team: "Place a bet to see here",
          odd: "LOCK",
          color: "lock",
        },
      ],
    },
  ],
};

const PremiumMarkets = () => {
  const [activeTab, setActiveTab] = useState("All");

  const activeMarkets = useMemo(() => {
    return premiumData[activeTab] || [];
  }, [activeTab]);

  return (
    <div className="premium-wrapper">
      {/* TOP TABS */}

      <div className="premium-top-tabs">
        {premiumTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab ? "active" : ""
            }
          >
            {tab}
          </button>
        ))}

        <div className="info-icon">
          <FaInfoCircle />
        </div>
      </div>

      {/* LIMIT */}

      <div className="premium-limit">
        Min: 100 Max: 10000
      </div>

      {/* MARKETS */}

      {activeMarkets.map((market, index) => (
        <div className="premium-market" key={index}>
          <div className="premium-header">
            <span>{market.title}</span>

            <FaMinusSquare className="minus-icon" />
          </div>

          {market.items.map((item, idx) => (
            <div className="premium-row" key={idx}>
              <div className="team-name">
                {item.team}
              </div>

              <div
                className={`odd-box ${
                  item.color
                } ${
                  item.odd === "LOCK"
                    ? "locked"
                    : ""
                }`}
              >
                {item.odd === "LOCK" ? (
                  <FaLock />
                ) : (
                  item.odd
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PremiumMarkets;