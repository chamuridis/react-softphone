import React, { useState } from 'react';
import {
  Grid,
  Fab,
  FormControlLabel,
  Switch,
  Tooltip,
  styled,
  IconButton,
  TextField,
  Box,
  Divider,
  Paper
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
  CallMerge,
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Backspace as BackspaceIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Send as TransferIcon,
  VideoCall as VideoCallIcon,
  RecordVoiceOver as RecordIcon,
  PresentToAll as ScreenShareIcon,
  Add as AddParticipantIcon
} from '@mui/icons-material';

import SearchList from './search-list';

const Root = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1)
}));

const FabStyled = styled(Fab)(({ theme }) => ({
  width: '40px',
  height: '40px',
  margin: theme.spacing(0.25),
  background: '#f8f9fa',
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '1rem',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    background: '#e9ecef'
  },
  '&.Mui-disabled': {
    background: '#f8f9fa',
    color: 'rgba(0, 0, 0, 0.26)'
  }
}));

const ActionFab = styled(Fab)(({ theme }) => ({
  width: '40px',
  height: '40px',
  margin: theme.spacing(0.25),
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  '&.call': {
    background: '#4caf50',
    color: '#fff',
    '&:hover': {
      background: '#43a047'
    }
  },
  '&.end-call': {
    background: theme => theme.palette.error.main,
    color: '#fff',
    '&:hover': {
      background: theme => theme.palette.error.dark
    }
  },
  '&.transfer': {
    background: theme => theme.palette.warning.main,
    color: '#fff',
    '&:hover': {
      background: theme => theme.palette.warning.dark
    }
  },
  '&.hold': {
    background: theme => theme.palette.info.main,
    color: '#fff',
    '&:hover': {
      background: theme => theme.palette.info.dark
    }
  },
  '&.unhold': {
    background: '#4caf50',
    color: '#fff',
    '&:hover': {
      background: '#43a047'
    }
  },
  '&.mute': {
    background: '#9e9e9e',
    color: '#fff',
    '&:hover': {
      background: '#757575'
    }
  },
  '&.unmute': {
    background: '#ff5722',
    color: '#fff',
    '&:hover': {
      background: '#f4511e'
    }
  }
}));

const CallButton = styled(Fab)(({ theme }) => ({
  color: 'white',
  background: '#3acd7e',
  width: '40px',
  height: '40px',
  margin: theme.spacing(0.5),
  '&:hover': {
    background: '#16b364' // chateauGreen[500]
  }
}));

const EndCallButton = styled(Fab)(({ theme }) => ({
  color: 'white',
  background: theme => theme.palette.error.main,
  width: '40px',
  height: '40px',
  margin: theme.spacing(0.5),
  '&:hover': {
    background: theme => theme.palette.error.dark
  }
}));

const GridRaw = styled(Grid)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: theme.spacing(1),
  width: '100%'
}));

const GridLastRaw = styled(Grid)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(1)
}));

const KeypadContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(0.5)
}));

const QuickActionsBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    fontSize: '1rem'
  }
}));

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
  const [anchorElTransfer, setAnchorElTransfer] = useState(null);
  const [anchorElAttended, setAnchorElAttended] = useState(null);
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
      return;
    }
    setAnchorElAttended(event.currentTarget);
  };
  const AttendedTransferListClick = (id) => {
    if (id) {
      handleCallAttendedTransfer('transfer', id);
      setDialState('');
    }
  };

  return (
    <Root>
        <KeypadContainer>
          
          <GridRaw container spacing={0}>
            <Grid item xs={3}>
              <Grid item xs={12}>
                <Tooltip title={muted ? 'Unmute Microphone' : 'Mute Microphone'} disableFocusListener disableTouchListener>
                  <div>
                    <FabStyled
                      disabled={!inCall}
                      value={inCall}
                      size="small"
                      aria-label={muted ? 'unmute' : 'mute'}
                      onClick={handleMicMute}
                      sx={theme => ({
                        // Adaptive colors based on theme mode
                        bgcolor: muted 
                          ? (theme.palette.mode === 'dark' ? '#ff5252' : '#f44336') 
                          : theme.palette.primary.main,
                        color: '#ffffff',
                        boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                        '&:hover': {
                          bgcolor: muted 
                            ? (theme.palette.mode === 'dark' ? '#ff1744' : '#d32f2f') 
                            : theme.palette.primary.dark,
                        },
                        '&.Mui-disabled': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.12)' 
                            : 'rgba(0,0,0,0.12)',
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.3)' 
                            : 'rgba(0,0,0,0.26)'
                        }
                      })}
                    >
                      {muted ? <MicOff /> : <Mic />}
                    </FabStyled>
                  </div>
                </Tooltip>
              </Grid>
              <Grid hidden>
                <FormControlLabel
                  control={<Switch size="small" checked onChange={() => {}} />}
                  label="Mute"
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Tooltip title={hold ? 'Resume Call' : 'Hold Call'} disableFocusListener disableTouchListener>
                <div>
                  <FabStyled
                    disabled={!inCall || !inAnswer}
                    size="small"
                    aria-label={hold ? 'resume' : 'hold'}
                    onClick={() => {
                      handleHold(sessionId, hold);
                    }}
                    sx={theme => ({
                      // Adaptive colors based on theme mode
                      bgcolor: hold 
                        ? '#3acd7e' 
                        : theme.palette.primary.main,
                      color: '#ffffff',
                      boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                      border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      '&:hover': {
                        bgcolor: hold 
                          ? '#16b364' 
                          : theme.palette.primary.dark,
                      },
                      '&.Mui-disabled': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.12)' 
                          : 'rgba(0,0,0,0.12)',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(0,0,0,0.26)'
                      }
                    })}
                  >
                    {hold ? <PlayArrow /> : <Pause />}
                  </FabStyled>
                </div>
              </Tooltip>
            </Grid>
            <Grid item xs={3}>
              <Tooltip title="Transfer Call">
                <div>
                  <FabStyled
                    disabled={!inCall || !inAnswer || hold || !allowAttendedTransfer}
                    size="small"
                    aria-label="transfer-call"
                    onClick={handleClickTransferCall}
                    aria-describedby="transferredBox"
                    sx={theme => ({
                      bgcolor: theme.palette.warning.main,
                      color: '#ffffff',
                      boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                      border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      '&:hover': {
                        bgcolor: theme.palette.warning.dark,
                      },
                      '&.Mui-disabled': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.12)' 
                          : 'rgba(0,0,0,0.12)',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(0,0,0,0.26)'
                      }
                    })}
                  >
                    <PhoneForwarded />
                  </FabStyled>
                </div>
              </Tooltip>
              <SearchList
                asteriskAccounts={asteriskAccounts}
                onClickList={(id) => TransferListClick(id)}
                ariaDescribedby="transferredBox"
                anchorEl={anchorElTransfer}
                setAnchorEl={setAnchorElTransfer}
              />
            </Grid>
            <Grid item xs={3}>
              <Tooltip title="Attended Transfer">
                <div>
                  <FabStyled
                    disabled={!inCall || !inAnswer || hold || !allowTransfer}
                    size="small"
                    aria-label="attended-transfer"
                    onClick={handleClickAttendedTransfer}
                    aria-describedby="attendedBox"
                    sx={theme => ({
                      bgcolor: theme.palette.mode === 'dark' ? '#9c27b0' : '#8e24aa',
                      color: '#ffffff',
                      boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                      border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? '#7b1fa2' : '#6a1b9a',
                      },
                      '&.Mui-disabled': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.12)' 
                          : 'rgba(0,0,0,0.12)',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(0,0,0,0.26)'
                      }
                    })}
                  >
                    <Transform />
                  </FabStyled>
                </div>
              </Tooltip>
              <SearchList
                asteriskAccounts={asteriskAccounts}
                onClickList={AttendedTransferListClick}
                ariaDescribedby="attendedBox"
                anchorEl={anchorElAttended}
                setAnchorEl={setAnchorElAttended}
              />
            </Grid>
            {inAnswerTransfer
            && !inConference
            && inTransfer
            && transferControl ? (
              <Grid container spacing={0}>
                <GridRaw item xs={12}>
                  <Grid container spacing={0}>
                    <Grid item xs={3}>
                      <Tooltip title="Conference" aria-label="conference">
                        <span>
                          <ActionFab
                            disabled={false}
                            size="small"
                            aria-label="conference"
                            onClick={() => {
                              handleCallAttendedTransfer('merge', {});
                            }}
                            sx={theme => ({
                              bgcolor: theme.palette.mode === 'dark' ? '#81c784' : '#4caf50',
                              color: '#ffffff',
                              boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#66bb6a' : '#388e3c',
                              }
                            })}
                          >
                            <CallMerge />
                          </ActionFab>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Swap Caller" aria-label="swap-caller">
                        <span>
                          <ActionFab
                            disabled={false}
                            size="small"
                            aria-label="swap-caller"
                            onClick={() => {
                              handleCallAttendedTransfer('swap', {});
                            }}
                            sx={theme => ({
                              bgcolor: theme.palette.mode === 'dark' ? '#64b5f6' : '#2196f3',
                              color: '#ffffff',
                              boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#42a5f5' : '#1976d2',
                              }
                            })}
                          >
                            <SwapCalls />
                          </ActionFab>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Pass Call" aria-label="pass-call">
                        <span>
                          <ActionFab
                            disabled={false}
                            size="small"
                            aria-label="pass-call"
                            onClick={() => {
                              handleCallAttendedTransfer('finish', {});
                            }}
                            sx={theme => ({
                              bgcolor: theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9800',
                              color: '#ffffff',
                              boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#ffa726' : '#f57c00',
                              }
                            })}
                          >
                            <PhoneForwarded />
                          </ActionFab>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Cancel Transfer" aria-label="cancel-transfer">
                        <span>
                          <ActionFab
                            disabled={false}
                            size="small"
                            aria-label="cancel-transfer"
                            onClick={() => {
                              handleCallAttendedTransfer('cancel', {});
                            }}
                            sx={theme => ({
                              bgcolor: theme.palette.error.main,
                              color: '#ffffff',
                              boxShadow: theme.palette.mode === 'dark' ? 5 : 3,
                              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : 'none',
                              '&:hover': {
                                bgcolor: theme.palette.error.dark,
                              }
                            })}
                          >
                            <Cancel />
                          </ActionFab>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </GridRaw>
              </Grid>
              ) : (
                <div />
              )}
          </GridRaw>

          <GridLastRaw container spacing={0}>
            {inCall === false ? (
              <FabStyled
                size="large"
                aria-label="Make Call"
                onClick={handleCall}
                sx={theme => ({
                  width: '52px',
                  height: '52px',
                  bgcolor: '#3acd7e',
                  color: '#ffffff',
                  boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  '&:hover': {
                    bgcolor: '#16b364', // chateauGreen[500]
                  }
                })}
              >
                <Call />
              </FabStyled>
            ) : (
              <FabStyled
                size="large"
                aria-label="End Call"
                onClick={handleEndCall}
                sx={theme => ({
                  width: '52px',
                  height: '52px',
                  bgcolor: theme.palette.mode === 'dark' ? '#ef5350' : '#f44336',
                  color: '#ffffff',
                  boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#e53935' : '#d32f2f',
                  }
                })}
              >
                <CallEnd />
              </FabStyled>
            )}
          </GridLastRaw>
        </KeypadContainer>
    </Root>
  );
}
export default KeypadBlock;
