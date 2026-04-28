import React from 'react';
import { useParams } from 'react-router-dom';
import { IonList, IonItem } from '@ionic/react';
import './SportRules.scss';

import { SPORT_RULES } from '../../constants/FooterView';

const SportRules: React.FC = () => {
  const { sport } = useParams<{ sport: string }>();

  const getRules = () => {
    return SPORT_RULES.find(
      (s) => s.name.toLowerCase() === sport.toLowerCase()
    );
  };

   const selectedSport = getRules();

  if (!selectedSport) {
    return <div>No Rules Found</div>;
  }

  return (
    <IonList lines="none" class="sport-rules-list">
      {selectedSport.rules.map((s, index) => (
        <IonItem className="sport-rule-desc">
          {index + 1}. {s}
        </IonItem>
      ))}
    </IonList>
  );
};

export default SportRules;
