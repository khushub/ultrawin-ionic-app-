import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './MarketTermsCondi.scss';
import { connect } from 'react-redux';

import rulesData from '../../assets/lang-rules/lang-rules.json';

type MarketTermsProps = {
  langSelected: string;
  domainConfig: any;
};

const MarketTermsCondi: React.FC<MarketTermsProps> = () => {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    setRules(rulesData);
  }, []);

  return (
    <div className="odds-terms-condi-ctn">
      {rules.map((item, index) => (
        <Accordion key={index} className="rules-accordion" defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="accordion-title">
              {item.category}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            {item.rules.map((rule: string, i: number) => (
              <p key={i} className="conditions-paragraph">
                {rule}
              </p>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  langSelected: state.common.langSelected,
  domainConfig: state.common.domainConfig,
});

export default connect(mapStateToProps)(MarketTermsCondi);