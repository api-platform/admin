import React from 'react';
import { composeStories } from '@storybook/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import fetch from 'node-fetch';
import * as story from './Auth.stories'; // Change the path to the correct file

const { Basic } = composeStories(story);

describe('stories/auth/Admin', () => {
  it('should render the basic story', async () => {
    render(<Basic entrypoint="https://localhost/" />);
    const submit = await screen.findByText('Sign in');
    const username = await screen.findByLabelText('Username *');
    await userEvent.type(username, 'john');
    const password = await screen.findByLabelText('Password *');
    await userEvent.type(password, '123');
    await userEvent.click(submit);
  });
});
