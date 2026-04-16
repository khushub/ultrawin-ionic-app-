import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import React, { useState } from 'react';
import ExpandMoreIcon from '../../assets/images/Notifications/expand_icon.svg';
import { RulesRegulations } from '../../socialmedialink/RulesRegulations';
import './RulesAndRegulationsNew.scss';

const RulesAndRegulationsNew = () => {
  const [openAccordion, setOpenAccordion] = useState<boolean>(false);

  const handleClick = () => setOpenAccordion(!openAccordion);

  return (
    <div className="rr-ctn">
      <>
        <Accordion defaultExpanded={true} className="rr-accordion">
          <AccordionSummary aria-controls="panel1a-content">
            <div className="rr-expand-more-title">
              <button className="rr-expand-btn" onClick={() => handleClick()}>
                <ExpandMoreIcon
                  className={openAccordion ? 'rr-expand-less' : 'rr-expand-more'}
                />
              </button>
              <div className="rr-title-time">
                <div className="date-title">{'Rules and Regulations '}</div>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {RulesRegulations[0].rules.map((row, idx) => (
              <div className="rule">{row}</div>
            ))}
          </AccordionDetails>
        </Accordion>
      </>
    </div>
  );
};

export default RulesAndRegulationsNew;
