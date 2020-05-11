import React from 'react';
import { Pagination, useTranslate } from 'react-admin';
import { Button, Toolbar, makeStyles, useTheme } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles({
  spacer: {
    flex: '1 1 100%',
  },
});

export default (props) => {
  const { page, total, setPage, ...rest } = props;

  if (total >= 0) {
    return <Pagination page={page} total={total} setPage={setPage} {...rest} />;
  }

  const classes = useStyles(props);
  const theme = useTheme();
  const translate = useTranslate();

  return (
    <Toolbar>
      <div className={classes.spacer} />
      {page > 1 && (
        <Button color="primary" key="prev" onClick={() => setPage(page - 1)}>
          {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          {translate('ra.navigation.prev')}
        </Button>
      )}
      {total < -1 && (
        <Button color="primary" key="next" onClick={() => setPage(page + 1)}>
          {translate('ra.navigation.next')}
          {theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      )}
    </Toolbar>
  );
};
