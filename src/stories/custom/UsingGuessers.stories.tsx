import React from 'react';
import { HydraAdmin } from '../../hydra';
import ResourceGuesser from '../../core/ResourceGuesser';
import ListGuesser from '../../list/ListGuesser';
import ShowGuesser from '../../show/ShowGuesser';
import FieldGuesser from '../../field/FieldGuesser';
import EditGuesser from '../../edit/EditGuesser';
import InputGuesser from '../../input/InputGuesser';
import CreateGuesser from '../../create/CreateGuesser';

export default {
  title: 'Admin/Custom/UsingGuessers',
  parameters: {
    layout: 'fullscreen',
  },
};

const BookCreate = () => (
  <CreateGuesser>
    <InputGuesser source="isbn" label="ISBN" />
    <InputGuesser source="title" />
    <InputGuesser source="description" multiline />
    <InputGuesser source="author" />
    <InputGuesser source="publicationDate" />
  </CreateGuesser>
);

const BookEdit = () => (
  <EditGuesser warnWhenUnsavedChanges>
    <InputGuesser source="isbn" label="ISBN" />
    <InputGuesser source="title" />
    <InputGuesser source="description" multiline />
    <InputGuesser source="author" />
    <InputGuesser source="publicationDate" />
  </EditGuesser>
);

const BookShow = () => (
  <ShowGuesser>
    <FieldGuesser source="isbn" label="ISBN" />
    <FieldGuesser source="title" />
    <FieldGuesser source="description" />
    <FieldGuesser source="author" />
    <FieldGuesser source="publicationDate" />
    <FieldGuesser source="reviews" />
  </ShowGuesser>
);

const BookList = () => (
  <ListGuesser sort={{ field: 'publicationDate', order: 'DESC' }}>
    <FieldGuesser source="isbn" label="ISBN" />
    <FieldGuesser source="title" />
    <FieldGuesser source="author" />
    <FieldGuesser source="publicationDate" />
    <FieldGuesser source="reviews" />
  </ListGuesser>
);

const ReviewCreate = () => (
  <CreateGuesser>
    <InputGuesser source="author" />
    <InputGuesser source="book" />
    <InputGuesser source="body" multiline />
    <InputGuesser source="rating" />
    <InputGuesser source="publicationDate" readOnly defaultValue={new Date()} />
  </CreateGuesser>
);

const ReviewEdit = () => (
  <EditGuesser>
    <InputGuesser source="author" />
    <InputGuesser source="book" />
    <InputGuesser source="body" multiline />
    <InputGuesser source="rating" />
    <InputGuesser source="publicationDate" readOnly />
  </EditGuesser>
);

const ReviewShow = () => (
  <ShowGuesser>
    <FieldGuesser source="author" />
    <FieldGuesser source="book" />
    <FieldGuesser source="body" />
    <FieldGuesser source="rating" />
    <FieldGuesser source="publicationDate" />
  </ShowGuesser>
);

const ReviewList = () => (
  <ListGuesser sort={{ field: 'publicationDate', order: 'DESC' }}>
    <FieldGuesser source="author" />
    <FieldGuesser source="book" />
    <FieldGuesser source="rating" />
    <FieldGuesser source="publicationDate" />
  </ListGuesser>
);

export const UsingGuessers = () => (
  <HydraAdmin entrypoint={process.env.ENTRYPOINT}>
    <ResourceGuesser
      name="books"
      list={BookList}
      show={BookShow}
      edit={BookEdit}
      create={BookCreate}
    />
    <ResourceGuesser
      name="reviews"
      list={ReviewList}
      show={ReviewShow}
      edit={ReviewEdit}
      create={ReviewCreate}
    />
  </HydraAdmin>
);
