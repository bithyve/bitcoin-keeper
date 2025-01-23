import React from 'react';
import { Box } from 'native-base';

import usePlan from 'src/hooks/usePlan';

import NotificationStack from 'src/components/NotificationStack';
import CurrentPlanView from './components/CurrentPlanView';

function HeaderDetails() {
  const { plan } = usePlan();

  return (
    <Box>
      <CurrentPlanView plan={plan} />
      <NotificationStack />
    </Box>
  );
}

export default HeaderDetails;
