import React from 'react';
import { HydraAdmin } from '../hydra';
import ResourceGuesser from '../core/ResourceGuesser';
import ListGuesser from '../list/ListGuesser';
import ShowGuesser from '../show/ShowGuesser';
import FieldGuesser from '../field/FieldGuesser';
import EditGuesser from '../edit/EditGuesser';
import InputGuesser from '../input/InputGuesser';
import CreateGuesser from '../create/CreateGuesser';

export default {
  title: 'Admin/Custom',
  parameters: {
    layout: 'fullscreen',
  },
};

const GreetingList = () => (
  <ListGuesser>
    <FieldGuesser source="name" label="Identity" />
  </ListGuesser>
);

const GreetingShow = () => (
  <ShowGuesser>
    <FieldGuesser source="name" label="Identity" />
  </ShowGuesser>
);

const GreetingEdit = () => (
  <EditGuesser>
    <InputGuesser source="name" label="Identity" />
  </EditGuesser>
);

const GreetingCreate = () => (
  <CreateGuesser>
    <InputGuesser source="name" label="Identity" />
  </CreateGuesser>
);

export const Custom = () => (
  <HydraAdmin entrypoint={process.env.ENTRYPOINT}>
    <ResourceGuesser
      name="greetings"
      options={{ label: 'Salutation' }}
      list={GreetingList}
      show={GreetingShow}
      edit={GreetingEdit}
      create={GreetingCreate}
    />
  </HydraAdmin>
);
