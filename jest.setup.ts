// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'node-fetch';

global.TextEncoder = TextEncoder;
global.Request = Request as any;
