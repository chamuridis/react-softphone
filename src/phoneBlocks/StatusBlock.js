import React from 'react';
import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Label from './Label';

const StatusRoot = styled('div')({
  padding: 24
});

const StatusLabel = styled(Label)(({ variant }) => ({
  ...(variant === 'online' && {
    color: '#4ada61',
    backgroundColor: '#d0f6bb'
  }),
  ...(variant === 'offline' && {
    color: '#fa1941',
    backgroundColor: '#f6bbbb'
  }),
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1.5,
  textTransform: 'uppercase'
}));

const StatusGrid = styled(Grid)({
  '& .MuiGrid-container': {
    alignItems: 'center'
  }
});

const GridItem = styled(Grid)({
  flexGrow: 0,
  maxWidth: '50%',
  flexBasis: '50%'
});

const StatusText = styled(Typography)({
  fontWeight: 500,
  color: '#333'
});

function StatusBlock({ connectingPhone, connectedPhone }) {
  const getStatusLabel = () => {
    if (!connectingPhone) {
      return connectedPhone 
        ? <StatusLabel variant="online" color="primary">ONLINE</StatusLabel>
        : <StatusLabel variant="offline" color="primary">OFFLINE</StatusLabel>;
    }
    return !connectedPhone
      ? <StatusLabel variant="online" color="primary">CONNECTING</StatusLabel>
      : <StatusLabel variant="offline" color="primary">DISCONNECTING</StatusLabel>;
  };

  return (
    <StatusRoot>
      <Grid container spacing={2}>
        <GridItem container direction="row" justifyContent="flex-start" alignItems="center">
          <Typography id="continuous-slider">STATUS</Typography>
        </GridItem>
        <GridItem container direction="row" justifyContent="flex-end" alignItems="center">
          {getStatusLabel()}
        </GridItem>
      </Grid>
    </StatusRoot>
  );
}

StatusBlock.propTypes = {
  connectingPhone: PropTypes.bool,
  connectedPhone: PropTypes.bool
};

StatusBlock.defaultProps = {
  connectingPhone: false,
  connectedPhone: false
};

export default StatusBlock;