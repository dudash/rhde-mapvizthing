import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { WorldMap } from './WorldMap';

const Dashboard: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Live Flight Tracks</Title>
    <WorldMap/>
  </PageSection>
)


export { Dashboard };
