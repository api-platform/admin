import React from 'react';
import type { ComponentType, ErrorInfo, HtmlHTMLAttributes } from 'react';
import {
  Title,
  useDefaultTitle,
  useResetErrorBoundaryOnLocationChange,
  useTranslate,
} from 'react-admin';
import type { ErrorProps } from 'react-admin';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
  styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore.js'; // eslint-disable-line import/extensions
import HistoryIcon from '@mui/icons-material/History.js'; // eslint-disable-line import/extensions
import RefreshIcon from '@mui/icons-material/Refresh.js'; // eslint-disable-line import/extensions
import type { FallbackProps } from 'react-error-boundary';
import LogoError from './LogoError.js';

const PREFIX = 'RaError';

export const ErrorClasses = {
  container: `${PREFIX}-container`,
  title: `${PREFIX}-title`,
  logo: `${PREFIX}-logo`,
  panel: `${PREFIX}-panel`,
  panelSummary: `${PREFIX}-panelSummary`,
  panelDetails: `${PREFIX}-panelDetails`,
  toolbar: `${PREFIX}-toolbar`,
  advice: `${PREFIX}-advice`,
};

// eslint-disable-next-line tree-shaking/no-side-effects-in-initialization
const Root = styled('div', {
  name: PREFIX,
  overridesResolver: (_, styles) => styles.root,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    padding: '1em',
  },
  fontFamily: 'Roboto, sans-serif',
  opacity: 0.5,

  [`& .${ErrorClasses.title}`]: {
    display: 'flex',
    alignItems: 'center',
  },

  [`& .${ErrorClasses.logo}`]: {
    margin: '0.5em',
  },

  [`& .${ErrorClasses.panel}`]: {
    marginTop: '1em',
    maxWidth: '60em',
  },

  [`& .${ErrorClasses.panelSummary}`]: {
    userSelect: 'all',
  },

  [`& .${ErrorClasses.panelDetails}`]: {
    whiteSpace: 'pre-wrap',
  },

  [`& .${ErrorClasses.toolbar}`]: {
    marginTop: '2em',
  },

  [`& .${ErrorClasses.advice}`]: {
    marginTop: '2em',
  },
}));

const goBack = () => {
  window.history.go(-1);
};

interface InternalErrorProps
  extends Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'>,
    FallbackProps {
  className?: string;
  errorInfo?: ErrorInfo;
}

const Error = ({
  error,
  errorComponent: ErrorComponent,
  errorInfo,
  resetErrorBoundary,
  className,
  ...rest
}: InternalErrorProps & {
  errorComponent?: ComponentType<ErrorProps>;
}) => {
  const translate = useTranslate();
  const title = useDefaultTitle();
  useResetErrorBoundaryOnLocationChange(resetErrorBoundary);

  if (ErrorComponent) {
    return <ErrorComponent error={error} errorInfo={errorInfo} title={title} />;
  }

  return (
    <>
      {title && <Title title={title} />}
      <Root className={className} {...rest}>
        <h1 className={ErrorClasses.title} role="alert">
          <Box className={ErrorClasses.logo}>
            <LogoError />
          </Box>
          {translate('ra.page.error')}
        </h1>
        <div>{translate('ra.message.error')}</div>
        {process.env.NODE_ENV !== 'production' && (
          <>
            <Accordion className={ErrorClasses.panel}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={ErrorClasses.panelSummary}>
                {translate(error.message, {
                  _: error.message,
                })}
              </AccordionSummary>
              <AccordionDetails className={ErrorClasses.panelDetails}>
                {/*
                    error message is repeated here to allow users to copy it. AccordionSummary doesn't support text selection.
                */}
                <p>
                  {translate(error.message, {
                    _: error.message,
                  })}
                </p>
                <p>{errorInfo?.componentStack}</p>
              </AccordionDetails>
            </Accordion>

            <div className={ErrorClasses.advice}>
              <Typography align="center">
                Need help with this error? Try the following:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>
                    Check the{' '}
                    <a href="https://api-platform.com/docs/admin/">
                      API Platform Admin
                    </a>{' '}
                    and the{' '}
                    <a href="https://marmelab.com/react-admin/Readme.html">
                      react-admin documentation
                    </a>
                  </li>
                  <li>
                    Search on StackOverflow (
                    <a href="https://stackoverflow.com/questions/tagged/react-admin">
                      react-admin
                    </a>{' '}
                    /{' '}
                    <a href="https://stackoverflow.com/questions/tagged/api-platform.com">
                      API Platform
                    </a>
                    ) for community answers
                  </li>
                  <li>
                    Get help from the maintainers of API Platform via{' '}
                    <a href="https://les-tilleuls.coop/">Les-Tilleuls.coop</a>{' '}
                    or from the react-admin core team via{' '}
                    <a href="https://marmelab.com/ra-enterprise/#fromsww">
                      react-admin Enterprise Edition
                    </a>
                  </li>
                </ul>
              </Typography>
            </div>
          </>
        )}
        <div className={ErrorClasses.toolbar}>
          {resetErrorBoundary ? (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                resetErrorBoundary();
              }}>
              {translate('ra.action.refresh')}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<HistoryIcon />}
              onClick={goBack}>
              {translate('ra.action.back')}
            </Button>
          )}
        </div>
      </Root>
    </>
  );
};

export default Error;
