import React from "react";

import { connect } from "react-redux";

type StoreProps = {
    scorecard: any;
};

type SportStatProps = StoreProps & {};

const CricketScorecard: React.FC<SportStatProps> = (props) => {
    const { scorecard } = props;

    const CreateMarkup = () => {
        return { __html: scorecard };
    };

    return (
        <div className="score-card cricket-score-card">
            {<div dangerouslySetInnerHTML={CreateMarkup()}></div>}
        </div>
    );
};

const mapStateToProps = (state: any) => {
    return {
        // scorecard: state.exchangeSports.scorecard
        //     ? state.exchangeSports?.scorecard
        //     : null,
        scorecard: null,
    };
};

export default connect(mapStateToProps, null)(CricketScorecard);
