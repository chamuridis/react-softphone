import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

const LabelRoot = styled('span')(({ color }) => ({
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ].join(','),
  alignItems: 'center',
  borderRadius: 2,
  display: 'inline-flex',
  flexGrow: 0,
  whiteSpace: 'nowrap',
  cursor: 'default',
  flexShrink: 0,
  fontSize: '0.75rem',
  fontWeight: 500,
  height: 20,
  justifyContent: 'center',
  letterSpacing: 0.5,
  minWidth: 20,
  padding: '4px 8px',
  textTransform: 'uppercase',
  ...(color === 'primary' && {
    color: '#3949ab',
    backgroundColor: 'rgba(57, 73, 171, 0.08)'
  }),
  ...(color === 'secondary' && {
    color: '#6c757d',
    backgroundColor: 'rgba(108, 117, 125, 0.08)'
  }),
  ...(color === 'error' && {
    color: '#fa1941',
    backgroundColor: 'rgba(250, 25, 65, 0.08)'
  }),
  ...(color === 'success' && {
    color: '#4ada61',
    backgroundColor: 'rgba(74, 218, 97, 0.08)'
  }),
  ...(color === 'warning' && {
    color: '#ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.08)'
  })
}));

function Label({
  className,
  color = 'secondary',
  children,
  style,
  ...rest
}) {
  return (
    <LabelRoot
      className={className}
      color={color}
      style={style}
      {...rest}
    >
      {children}
    </LabelRoot>
  )
}

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'success'])
}

Label.defaultProps = {
  className: '',
  color: 'secondary'
}

export default Label;