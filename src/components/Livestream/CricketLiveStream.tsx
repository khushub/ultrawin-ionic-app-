import React from "react";
import "./CricketLiveStream.scss";
import { connect } from "react-redux";
import { demoUser } from "../../util/stringUtil";

type SportStatProps = {
    eventID: string;
    providerUrl: string;
    channelId?: string | undefined;
    clientIp: string | undefined;
    balance: number;
};

const CricketLiveStream: React.FC<SportStatProps> = (props) => {
    const { eventID, providerUrl, channelId, clientIp, balance } = props;
    console.log('Balance: ', balance);

    if (demoUser() || balance === 0) {
        return (
            <div
                className="cricket-live-stream-ctn"
                style={{
                    textAlign: "center",
                    padding: "20px 18px",
                    color: "white",
                    fontSize: "12px",
                }}
            >
                Please add balance to your account to watch live stream
            </div>
        );
    }

    return (
        <div className="cricket-live-stream-ctn">
            {providerUrl && providerUrl != "-" ? (
                <iframe
                    title="cric-live-stream"
                    id="fp_embed_player"
                    src={providerUrl}
                    scrolling="no"
                    allowFullScreen={true}
                ></iframe>
            ) : (
                channelId &&
                clientIp && (
                    <iframe
                        title="mob-live-stream"
                        allowFullScreen={false}
                        // src={`https://getscoredata.com/score/ffec941a1ae04d58ff65abfc58a2a60f83a0d9bb/${channelId}`}
                        sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                    ></iframe>
                )
            )}
        </div>
    );
};

const mapStateToProps = (state: any) => {
    return {
        balance: state.userDetails.balance,
    };
};

export default connect(mapStateToProps, null)(CricketLiveStream);
