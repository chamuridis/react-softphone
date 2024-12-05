import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Mic,
  MicOff,
  Settings,
  Pause,
  Call,
  CallEnd,
  Transform,
  PlayArrow,
  PhoneForwarded,
  Cancel,
  SwapCalls,
  CallMerge
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import SearchList from './SearchList';

const KeypadRoot = styled('div')({
  paddingTop: 24,
  paddingBottom: 24
});

const KeypadButton = styled(Fab)({
  width: '41px',
  height: '41px',
  background: '#f4f6f8',
  '&:hover': {
    backgroundColor: '#e0e0e0'
  },
  '&.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    color: 'rgba(0, 0, 0, 0.26)'
  }
});

const CallButton = styled(Fab)({
  color: 'white',
  backgroundColor: '#4ada61',
  '&:hover': {
    backgroundColor: '#94f3a4'
  }
});

const EndCallButton = styled(Fab)({
  color: 'white',
  backgroundColor: '#fa1941',
  '&:hover': {
    backgroundColor: '#f8939b'
  }
});

const GridRow = styled(Grid)({
  paddingTop: '27px',
  display: 'flex',
  justifyContent: 'space-between',
  '& > *': {
    margin: '0 4px'
  }
});

const LastGridRow = styled(Grid)({
  paddingTop: '12px',
  display: 'flex',
  justifyContent: 'center'
});

const TransferControls = styled(Grid)({
  marginTop: '16px'
});

const TransferButton = styled(KeypadButton)({
  backgroundColor: '#3949ab',
  color: 'white',
  '&:hover': {
    backgroundColor: '#94a3fc'
  }
});

const ConferenceButton = styled(KeypadButton)({
  backgroundColor: '#4ada61',
  color: 'white',
  '&:hover': {
    backgroundColor: '#94f3a4'
  }
});

const SwapButton = styled(KeypadButton)({
  backgroundColor: '#ffc107',
  color: 'white',
  '&:hover': {
    backgroundColor: '#ffcd38'
  }
});

const CancelButton = styled(KeypadButton)({
  backgroundColor: '#fa1941',
  color: 'white',
  '&:hover': {
    backgroundColor: '#f8939b'
  }
});

function KeypadBlock({
  handleCallAttendedTransfer,
  handleCallTransfer,
  handlePressKey,
  handleMicMute,
  handleCall,
  handleEndCall,
  activeChanel,
  keyVariant = 'default',
  handleHold,
  asteriskAccounts = [],
  dialState,
  setDialState
}) {
  const {
    inCall,
    muted,
    hold,
    sessionId,
    inAnswer,
    inAnswerTransfer,
    inConference,
    inTransfer,
    transferControl,
    allowTransfer,
    allowAttendedTransfer
  } = activeChanel;

  const [anchorElTransfer, setAnchorElTransfer] = React.useState(null);
  const [anchorElAttended, setAnchorElAttended] = React.useState(null);

  const handleClickTransferCall = (event) => {
    if (dialState.match(/^[0-9]+$/) != null) {
      handleCallTransfer(dialState);
      setDialState('');
      return;
    }
    setAnchorElTransfer(event.currentTarget);
  };

  const TransferListClick = (id) => {
    if (id) {
      handleCallTransfer(id);
    }
  };

  const handleClickAttendedTransfer = (event) => {
    if (dialState.match(/^[0-9]+$/) != null) {
      handleCallAttendedTransfer('transfer', {});
      setDialState('');
    }
    setAnchorElAttended(event.currentTarget);
  };

  const AttendedTransferListClick = (id) => {
    if (id) {
      handleCallAttendedTransfer('transfer', id);
      setDialState('');
    }
  };

  const renderDefaultKeypad = () => (
    <>
      <GridRow container>
        <Grid item xs={3}>
          <Tooltip title={muted ? 'Unmute mic' : 'Mute mic'}>
            <span>
              <KeypadButton
                disabled={!inCall}
                onClick={handleMicMute}
                size="small"
              >
                {muted ? <MicOff /> : <Mic />}
              </KeypadButton>
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title={hold ? 'Resume' : 'Hold'}>
            <span>
              <KeypadButton
                disabled={!inCall || !inAnswer}
                onClick={() => handleHold(sessionId, hold)}
                size="small"
              >
                {hold ? <PlayArrow /> : <Pause />}
              </KeypadButton>
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Transfer Call">
            <span>
              <KeypadButton
                disabled={!inCall || !inAnswer || hold || !allowAttendedTransfer}
                onClick={handleClickTransferCall}
                size="small"
                aria-describedby="transferredBox"
              >
                <PhoneForwarded />
              </KeypadButton>
            </span>
          </Tooltip>
          <SearchList
            asteriskAccounts={asteriskAccounts}
            onClickList={TransferListClick}
            ariaDescribedby="transferredBox"
            anchorEl={anchorElTransfer}
            setAnchorEl={setAnchorElTransfer}
          />
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Attended Transfer">
            <span>
              <KeypadButton
                disabled={!inCall || !inAnswer || hold || !allowTransfer}
                onClick={handleClickAttendedTransfer}
                size="small"
                aria-describedby="attendedBox"
              >
                <Transform />
              </KeypadButton>
            </span>
          </Tooltip>
          <SearchList
            asteriskAccounts={asteriskAccounts}
            onClickList={AttendedTransferListClick}
            ariaDescribedby="attendedBox"
            anchorEl={anchorElAttended}
            setAnchorEl={setAnchorElAttended}
          />
        </Grid>
      </GridRow>

      {inAnswerTransfer && !inConference && inTransfer && transferControl && (
        <GridRow container>
          <Grid item xs={3}>
            <Tooltip title="Conference">
              <span>
                <KeypadButton
                  onClick={() => handleCallAttendedTransfer('merge', {})}
                  size="small"
                >
                  <CallMerge />
                </KeypadButton>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Swap Caller">
              <span>
                <KeypadButton
                  onClick={() => handleCallAttendedTransfer('swap', {})}
                  size="small"
                >
                  <SwapCalls />
                </KeypadButton>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Pass Call">
              <span>
                <KeypadButton
                  onClick={() => handleCallAttendedTransfer('finish', {})}
                  size="small"
                >
                  <PhoneForwarded />
                </KeypadButton>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Cancel Transfer">
              <span>
                <KeypadButton
                  onClick={() => handleCallAttendedTransfer('cancel', {})}
                  size="small"
                >
                  <Cancel />
                </KeypadButton>
              </span>
            </Tooltip>
          </Grid>
        </GridRow>
      )}
    </>
  );

  const renderNumberKeypad = () => (
    <>
      <GridRow container>
        <KeypadButton size="small" value="1" onClick={handlePressKey}>1</KeypadButton>
        <KeypadButton size="small" value="2" onClick={handlePressKey}>2</KeypadButton>
        <KeypadButton size="small" value="3" onClick={handlePressKey}>3</KeypadButton>
        <KeypadButton size="small"><Settings /></KeypadButton>
      </GridRow>
      <GridRow container>
        <KeypadButton size="small" value="4" onClick={handlePressKey}>4</KeypadButton>
        <KeypadButton size="small" value="5" onClick={handlePressKey}>5</KeypadButton>
        <KeypadButton size="small" value="6" onClick={handlePressKey}>6</KeypadButton>
        <KeypadButton size="small"><Pause /></KeypadButton>
      </GridRow>
      <GridRow container>
        <KeypadButton size="small" value="7" onClick={handlePressKey}>7</KeypadButton>
        <KeypadButton size="small" value="8" onClick={handlePressKey}>8</KeypadButton>
        <KeypadButton size="small" value="9" onClick={handlePressKey}>9</KeypadButton>
        <KeypadButton size="small"><Transform /></KeypadButton>
      </GridRow>
      <GridRow container>
        <KeypadButton size="small" value="*" onClick={handlePressKey}>*</KeypadButton>
        <KeypadButton size="small" value="0" onClick={handlePressKey}>0</KeypadButton>
        <KeypadButton size="small" value="#" onClick={handlePressKey}>#</KeypadButton>
        <KeypadButton size="small"><Settings /></KeypadButton>
      </GridRow>
    </>
  );

  return (
    <KeypadRoot>
      {keyVariant === 'default' ? renderDefaultKeypad() : renderNumberKeypad()}
      
      <LastGridRow container>
        {inCall ? (
          <EndCallButton size="small" onClick={handleEndCall}>
            <CallEnd />
          </EndCallButton>
        ) : (
          <CallButton size="small" onClick={handleCall}>
            <Call />
          </CallButton>
        )}
      </LastGridRow>
    </KeypadRoot>
  );
}

KeypadBlock.propTypes = {
  handleCallAttendedTransfer: PropTypes.func.isRequired,
  handleCallTransfer: PropTypes.func.isRequired,
  handlePressKey: PropTypes.func.isRequired,
  handleMicMute: PropTypes.func.isRequired,
  handleCall: PropTypes.func.isRequired,
  handleEndCall: PropTypes.func.isRequired,
  handleHold: PropTypes.func.isRequired,
  activeChanel: PropTypes.shape({
    inCall: PropTypes.bool.isRequired,
    muted: PropTypes.number.isRequired,
    hold: PropTypes.bool.isRequired,
    sessionId: PropTypes.string,
    inAnswer: PropTypes.bool.isRequired,
    inAnswerTransfer: PropTypes.bool.isRequired,
    inConference: PropTypes.bool.isRequired,
    inTransfer: PropTypes.bool.isRequired,
    transferControl: PropTypes.bool.isRequired,
    allowTransfer: PropTypes.bool.isRequired,
    allowAttendedTransfer: PropTypes.bool.isRequired
  }).isRequired,
  keyVariant: PropTypes.oneOf(['default', 'number']),
  asteriskAccounts: PropTypes.array,
  dialState: PropTypes.string.isRequired,
  setDialState: PropTypes.func.isRequired
};

export default KeypadBlock;