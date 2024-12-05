import React, { forwardRef } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const Page = forwardRef(({
  title,
  children,
  ...rest
}, ref) => {
  return (
    <Box
      ref={ref}
      {...rest}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {children}
    </Box>
  );
});

Page.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string
};

Page.displayName = 'Page';

export default Page;