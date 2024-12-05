import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Grid, Typography, Button } from '@mui/material';

const HeaderRoot = styled('div')(() => ({
  width: '100%'
}));

function Header({ className, addAccount, ...rest }) {
  const handleAddAccount = () => {
    addAccount();
  };

  return (
    <HeaderRoot
      className={className}
      {...rest}
    >
      <Grid
        container
        alignItems="flex-end"
        justifyContent="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Management
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Accounts
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            onClick={handleAddAccount}
          >
            Add Account
          </Button>
        </Grid>
      </Grid>
    </HeaderRoot>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  addAccount: PropTypes.func
};

export default Header;