import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

const OnlineIndicatorRoot = styled('span')(({ size, status }) => ({
  display: 'inline-block',
  borderRadius: '50%',
  flexGrow: 0,
  flexShrink: 0,
  ...(size === 'small' && {
    height: 8,
    width: 8
  }),
  ...(size === 'medium' && {
    height: 16,
    width: 16
  }),
  ...(size === 'large' && {
    height: 24,
    width: 24
  }),
  ...(status === 'offline' && {
    backgroundColor: '#f5f5f5'
  }),
  ...(status === 'away' && {
    backgroundColor: '#fb8c00'
  }),
  ...(status === 'busy' && {
    backgroundColor: '#fa1941'
  }),
  ...(status === 'online' && {
    backgroundColor: '#4ada61'
  })
}));

function OnlineIndicator({
  className,
  size = 'medium',
  status = 'offline',
  ...rest
}) {
  return (
    <OnlineIndicatorRoot
      className={className}
      size={size}
      status={status}
      {...rest}
    />
  );
}

OnlineIndicator.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy'])
};

OnlineIndicator.defaultProps = {
  size: 'medium',
  status: 'offline'
};

export default OnlineIndicator;