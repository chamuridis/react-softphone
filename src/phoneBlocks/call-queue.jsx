import {
  Grid, Typography, Box, Paper, Fab
} from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import { Call, CallEnd } from '@mui/icons-material';

const Root = styled('div')({
  alignItems: 'center',
  width: '100%'
});

// Define keyframes for the shake animation
const shakeAnimation = {
  '@keyframes shake': {
    '0%': { transform: 'translateX(0)' },
    '10%': { transform: 'translateX(-3px) rotate(-1deg)' },
    '20%': { transform: 'translateX(3px) rotate(1deg)' },
    '30%': { transform: 'translateX(-3px) rotate(-1deg)' },
    '40%': { transform: 'translateX(3px) rotate(1deg)' },
    '50%': { transform: 'translateX(-2px) rotate(-0.5deg)' },
    '60%': { transform: 'translateX(2px) rotate(0.5deg)' },
    '70%': { transform: 'translateX(-1px) rotate(-0.25deg)' },
    '80%': { transform: 'translateX(1px) rotate(0.25deg)' },
    '90%': { transform: 'translateX(-1px) rotate(-0.25deg)' },
    '100%': { transform: 'translateX(0)' }
  }
};

const AnswerButton = styled(Fab)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.success.main,
  '&:hover': {
    backgroundColor: theme.palette.success.dark
  },
  fontSize: 9,
  alignItems: 'center',
  animation: 'shake 1.5s infinite',
  '@keyframes shake': shakeAnimation['@keyframes shake']
}));

const RejectButton = styled(Fab)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.error.main,
  '&:hover': {
    backgroundColor: theme.palette.error.dark
  },
  fontSize: 9,
  alignItems: 'center',
  animation: 'shake 1.5s infinite',
  '@keyframes shake': shakeAnimation['@keyframes shake']
}));

const Caller = styled(Typography)({
  fontWeight: 500
});

const CallerSmall = styled(Typography)({
  fontWeight: 400
});

const CallItem = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1, 0, 2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 6px rgba(0, 0, 0, 0.1)'
}));

function CallQueue({ calls, handleAnswer, handleReject }) {
  return (
    <Root>
      {calls.map((call) => {
        const parsedCaller = call.callNumber.split('-');
        return (
          <CallItem key={call.sessionId} elevation={2}>
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              {parsedCaller[0] && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Caller variant="h6" component="div">
                    Caller: <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'primary.main' }}>
                      {parsedCaller[0]}
                    </Box>
                  </Caller>
                </Box>
              )}
              
              <Box sx={{ mt: 1 }}>
                {parsedCaller[1] && (
                  <Box sx={{ mb: 1 }}>
                    <CallerSmall variant="body2" color="text.secondary">
                      Jurisdiction:
                      <Box component="span" sx={{ ml: 0.5, fontWeight: 500 }}>
                        {parsedCaller[1]}
                      </Box>
                    </CallerSmall>
                  </Box>
                )}
                
                {parsedCaller[2] && (
                  <Box>
                    <CallerSmall variant="body2" color="text.secondary">
                      Company Number:
                      <Box component="span" sx={{ ml: 0.5, fontWeight: 500 }}>
                        {parsedCaller[2]}
                      </Box>
                    </CallerSmall>
                  </Box>
                )}
              </Box>
            </Box>

            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AnswerButton 
                  size="medium" 
                  onClick={handleAnswer} 
                  value={call.sessionId}
                  aria-label="Answer Call"
                  sx={{ 
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Call />
                </AnswerButton>
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <RejectButton 
                  size="medium" 
                  onClick={handleReject} 
                  value={call.sessionId}
                  aria-label="Reject Call"
                  sx={{ 
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <CallEnd />
                </RejectButton>
              </Grid>
            </Grid>
          </CallItem>
        );
      })}
    </Root>
  );
}

export default CallQueue;
