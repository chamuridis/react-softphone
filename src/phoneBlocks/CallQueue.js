import React from 'react';
import { styled, keyframes } from '@mui/material/styles';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Fab
} from '@mui/material';
import {
  Call as CallIcon,
  CallEnd as CallEndIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';


const ringing = keyframes`
  0% { transform: translate(0, 0); }
  10% { transform: translate(4px, 0px); }
  20% { transform: translate(-4px, 0px); }
  30% { transform: translate(3px, 0px); }
  40% { transform: translate(-3px, 0px); }
  50% { transform: translate(2px, 0px); }
  60% { transform: translate(0, 0); }
  100% { transform: translate(0, 0); }
`;

const Root = styled('div')({
  alignItems: 'center',
  width: '100%'
});

const CallButton = styled(Fab)({
  color: 'white',
  backgroundColor: '#4ada61',
  '&:hover': {
    backgroundColor: '#94f3a4'
  },
  fontSize: 9,
  alignItems: 'center'
});

const EndCallButton = styled(Fab)({
  color: 'white',
  backgroundColor: '#fa1941',
  '&:hover': {
    backgroundColor: '#f8939b'
  },
  fontSize: 9
});

const Wrapper = styled(Paper)({
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px'
});

const RingingIcon = styled('div')({
  animation: `${ringing} 0.6s infinite`
});

const CallInfo = styled(Box)({
  overflow: 'auto',
  whiteSpace: 'normal',
  backgroundColor: 'transparent'
});

const GridContainer = styled(Grid)({
  maxWidth: 120
});

const CallerInfo = styled(Typography)({
  fontWeight: 500,
  color: '#333'
});

function CallQueue({ calls, handleAnswer, handleReject }) {
  return (
    <Root>
      {calls.map((call) => {
        const parsedCaller = call.callNumber.split('-');
        
        return (
          <Wrapper
            key={call.sessionId}
            elevation={1}
          >
            <Grid item xs={12}>
              {parsedCaller[0] && (
                <Box overflow="auto" component="div" whiteSpace="normal">
                  <Typography variant="subtitle1">
                    Caller: {parsedCaller[0]}
                  </Typography>
                </Box>
              )}
              {parsedCaller[1] && (
                <Box overflow="auto" component="div" whiteSpace="normal">
                  <Typography variant="subtitle1">
                    Jurisdiction: {parsedCaller[1]}
                  </Typography>
                </Box>
              )}
              {parsedCaller[2] && (
                <Box overflow="auto" component="div" whiteSpace="normal">
                  <Typography variant="subtitle1">
                    To Number: {parsedCaller[2]}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid container spacing={2} sx={{ maxWidth: 120 }}>
              <Grid item xs={6}>
                <CallButton
                  size="small"
                  onClick={handleAnswer}
                  value={call.sessionId}
                >
                  <RingingIcon />
                </CallButton>
              </Grid>
              <Grid item xs={6}>
                <EndCallButton
                  size="small"
                  onClick={handleReject}
                  value={call.sessionId}
                >
                  <CallEndIcon />
                </EndCallButton>
              </Grid>
            </Grid>
          </Wrapper>
        );
      })}
    </Root>
  );
}

CallQueue.propTypes = {
  calls: PropTypes.arrayOf(PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    callNumber: PropTypes.string.isRequired
  })).isRequired,
  handleAnswer: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired
};

export default CallQueue;