import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { List, ListItem } from '@patternfly/react-core';

const GeneralSettings: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">
      This is a demo app for showcasing Microshift in action.
    </Title>
    Find out more about components of this demo:
    <ListBasic />
  </PageSection>
);

const ListBasic: React.FunctionComponent = () => (
    <List>
    <ListItem>
      <a href="https://microshift.io/">MicroShift</a>
    </ListItem>
    <ListItem>
      <a href="https://www.patternfly.org/v4/">PatternFly</a>
    </ListItem>
    <ListItem>
      <a href="https://developers.redhat.com/">Red Hat Developers</a>
    </ListItem>
  </List>
);

export { GeneralSettings };
