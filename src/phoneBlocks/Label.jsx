import React from 'react';
import { styled, alpha } from '@mui/material/styles';

const LabelRoot = styled('span')(({ theme, color }) => ({
  fontFamily: theme.typography.fontFamily,
  alignItems: 'center',
  borderRadius: 2,
  display: 'inline-flex',
  flexGrow: 0,
  whiteSpace: 'nowrap',
  cursor: 'default',
  flexShrink: 0,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  height: 20,
  justifyContent: 'center',
  letterSpacing: 0.5,
  minWidth: 20,
  padding: theme.spacing(0.5, 1),
  textTransform: 'uppercase',
  ...(color === 'primary' && {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }),
  ...(color === 'secondary' && {
    color: theme.palette.secondary.main,
    backgroundColor: alpha(theme.palette.secondary.main, 0.08)
  }),
  ...(color === 'error' && {
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.08)
  }),
  ...(color === 'success' && {
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.08)
  }),
  ...(color === 'warning' && {
    color: theme.palette.warning.main,
    backgroundColor: alpha(theme.palette.warning.main, 0.08)
  })
}));

function Label({ className, color = 'secondary', children, style, ...rest }) {
  return (
    <LabelRoot
      className={className}
      style={style}
      color={color}
      {...rest}
    >
      {children}
    </LabelRoot>
  );
}

export default Label;
