import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { Rating, Stack } from '@mui/material';
import React from 'react';
import type { InputProps } from 'react-admin';
import {
  AutocompleteInput,
  Create,
  Datagrid,
  DateField,
  Edit,
  Labeled,
  Layout,
  List,
  NumberField,
  ReferenceArrayField,
  ReferenceField,
  ReferenceInput,
  Show,
  SimpleForm,
  SimpleList,
  SimpleShowLayout,
  TabbedShowLayout,
  TextField,
  TextInput,
  WithRecord,
  WrapperField,
  defaultDarkTheme,
  defaultLightTheme,
  required,
  useInput,
} from 'react-admin';
import ResourceGuesser from '../../core/ResourceGuesser';
import FieldGuesser from '../../field/FieldGuesser';
import { HydraAdmin } from '../../hydra';
import InputGuesser from '../../input/InputGuesser';

export default {
  title: 'Admin/Custom/AdvancedCustomization',
  parameters: {
    layout: 'fullscreen',
  },
};

const BookCreate = () => (
  <Create>
    <SimpleForm sx={{ maxWidth: 500 }}>
      <InputGuesser source="title" helperText={false} />
      <InputGuesser source="author" helperText={false} />
      <TextInput
        source="description"
        multiline
        helperText={false}
        validate={required()}
      />
      <Stack direction="row" gap={2} width="100%">
        <InputGuesser source="isbn" label="ISBN" helperText={false} />
        <InputGuesser source="publicationDate" helperText={false} />
      </Stack>
    </SimpleForm>
  </Create>
);

const BookEdit = () => (
  <Edit warnWhenUnsavedChanges>
    <SimpleForm sx={{ maxWidth: 500 }}>
      <InputGuesser source="title" helperText={false} />
      <InputGuesser source="author" helperText={false} />
      <TextInput
        source="description"
        multiline
        helperText={false}
        validate={required()}
      />
      <Stack direction="row" gap={2} width="100%">
        <InputGuesser source="isbn" label="ISBN" helperText={false} />
        <InputGuesser source="publicationDate" helperText={false} />
      </Stack>
    </SimpleForm>
  </Edit>
);

const BookShow = () => (
  <Show>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="main">
        <TextField source="title" variant="h5" />
        <TextField source="author" variant="body1" />
        <TextField source="description" variant="body1" />
        <SimpleShowLayout direction="row" gap={2} sx={{ p: 0 }}>
          <TextField source="isbn" label="ISBN" variant="body1" />
          <DateField source="publicationDate" variant="body1" />
        </SimpleShowLayout>
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="reviews">
        <ReferenceArrayField source="reviews" reference="reviews" label={false}>
          <SimpleList
            primaryText="%{body}"
            secondaryText="by %{author} on %{publicationDate}"
            sx={{ pt: 0, '& .MuiListItemButton-root': { p: 0 } }}
            leftAvatar={(review) =>
              review.author
                .split(' ')
                .map((name: string) => name[0])
                .join('')
            }
            // eslint-disable-next-line react/no-unstable-nested-components
            tertiaryText={(review) => (
              <Rating value={review.rating} readOnly size="small" />
            )}
          />
        </ReferenceArrayField>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);

const BookList = () => (
  <List sort={{ field: 'publicationDate', order: 'DESC' }}>
    <Datagrid>
      <FieldGuesser source="isbn" label="ISBN" />
      <FieldGuesser source="title" />
      <FieldGuesser source="author" />
      <FieldGuesser source="publicationDate" />
      <NumberField source="reviews.length" label="Reviews" />
    </Datagrid>
  </List>
);

const RatingInput = (props: InputProps) => {
  const { field } = useInput(props);
  return (
    <Rating
      {...field}
      onChange={(_event, value) => {
        field.onChange(value);
      }}
    />
  );
};

const filterToBookQuery = (searchText: string) => ({
  title: `%${searchText}%`,
});

const ReviewCreate = () => (
  <Create>
    <SimpleForm
      sx={{ maxWidth: 500 }}
      defaultValues={{ publicationDate: new Date() }}>
      <InputGuesser source="author" helperText={false} />
      <ReferenceInput source="book" reference="books">
        <AutocompleteInput
          helperText={false}
          filterToQuery={filterToBookQuery}
        />
      </ReferenceInput>
      <Labeled label="Rating">
        <RatingInput source="rating" />
      </Labeled>
      <InputGuesser source="body" multiline helperText={false} />
    </SimpleForm>
  </Create>
);

const ReviewEdit = () => (
  <Edit warnWhenUnsavedChanges>
    <SimpleForm sx={{ maxWidth: 500 }}>
      <InputGuesser source="author" helperText={false} />
      <ReferenceInput source="book" reference="books">
        <AutocompleteInput
          helperText={false}
          filterToQuery={filterToBookQuery}
        />
      </ReferenceInput>
      <Labeled label="Rating">
        <RatingInput source="rating" />
      </Labeled>
      <InputGuesser source="body" multiline helperText={false} />
      <Labeled label="Publication date">
        <DateField source="publicationDate" showTime />
      </Labeled>
    </SimpleForm>
  </Edit>
);

const ReviewShow = () => (
  <Show>
    <SimpleShowLayout>
      <FieldGuesser source="author" />
      <ReferenceField source="book" reference="books" />
      <FieldGuesser source="body" />
      <Labeled label="Rating">
        <WithRecord
          render={(review) => (
            <Rating value={review.rating} readOnly size="small" />
          )}
        />
      </Labeled>
      <DateField showTime source="publicationDate" />
    </SimpleShowLayout>
  </Show>
);

const ReviewList = () => (
  <List sort={{ field: 'publicationDate', order: 'DESC' }}>
    <Datagrid>
      <FieldGuesser source="author" />
      <ReferenceField source="book" reference="books" />
      <WrapperField label="Rating">
        <WithRecord
          render={(review) => (
            <Rating value={review.rating} readOnly size="small" />
          )}
        />
      </WrapperField>
      <DateField showTime source="publicationDate" />
    </Datagrid>
  </List>
);

export const AdvancedCustomization = () => (
  <HydraAdmin
    entrypoint={process.env.ENTRYPOINT}
    layout={Layout}
    theme={defaultLightTheme}
    darkTheme={defaultDarkTheme}>
    <ResourceGuesser
      name="books"
      list={BookList}
      show={BookShow}
      edit={BookEdit}
      create={BookCreate}
      recordRepresentation="title"
      icon={AutoStoriesIcon}
    />
    <ResourceGuesser
      name="reviews"
      list={ReviewList}
      show={ReviewShow}
      edit={ReviewEdit}
      create={ReviewCreate}
      recordRepresentation="id"
      icon={ReviewsIcon}
    />
  </HydraAdmin>
);
