import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { Avatar } from '@patternfly/react-core';
import avatarImg from '../../bgimages/naps.png';
import "@patternfly/react-core/dist/styles/base.css";
import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Gallery,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Divider
} from '@patternfly/react-core';

const ProfileSettings: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">
      You are not logged in
    </Title>
    <Gallery hasGutter>
      <Card>
        <CardTitle>
          <Title headingLevel="h4" size="xl">
            Profile Details
          </Title>
        </CardTitle>
        <CardBody>
          <React.Fragment>
            <Avatar src={avatarImg} alt="profile image"/>
            <br /><br />
          </React.Fragment>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Basic Info</DescriptionListTerm>
              <DescriptionListDescription>
                Blah blah blah
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>More Info</DescriptionListTerm>
              <DescriptionListDescription>Things to go here</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
        <Divider />
        <CardFooter>
          <a href="#">Back to Dashboard</a>
        </CardFooter>
      </Card>
    </Gallery>
  </PageSection>
);

export { ProfileSettings };
