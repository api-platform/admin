// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'node-fetch';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.Request = Request as any;
