import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  VolumeUp,
  VolumeOff,
  NotificationsActive,
  NotificationsOff,
  PhoneEnabled,
  PhoneDisabled,
  DarkMode,
  LightMode,
  Palette,
  CallEnd,
  Call
} from '@mui/icons-material';
import {
  Grid,
  FormControl,
  FormGroup,
  FormControlLabel,
  Slider,
  Switch,
  LinearProgress,
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  Button
} from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const SettingsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  flexGrow: 1
}));

const SettingsCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 6px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(1)
}));

const SettingHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.primary,
  fontSize: '0.8rem'
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%'
}));

const SliderIcons = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: '24px'
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  width: '100%',
  '& .MuiSlider-track': {
    height: 4,
  },
  '& .MuiSlider-thumb': {
    width: 16,
    height: 16,
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: '0.75rem',
  },
  '& .MuiSlider-mark': {
    width: 2,
    height: 2,
    borderRadius: 1,
  }
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  width: '100%',
  justifyContent: 'space-between',
  '& .MuiTypography-root': {
    fontWeight: 500,
    fontSize: '0.8rem',
    color: theme.palette.text.primary
  },
  '& .MuiSwitch-root': {
    marginLeft: theme.spacing(1)
  }
}));

const Form = styled(FormControl)({
  width: '100%'
});

const ConnectButton = styled(Button)(({ theme, isConnected }) => ({
  marginTop: theme.spacing(1),
  backgroundColor: isConnected ? theme.palette.error.main : theme.palette.success.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: isConnected ? theme.palette.error.dark : theme.palette.success.dark,
  },
  fontSize: '0.75rem',
  padding: theme.spacing(0.5, 1)
}));

function SettingsBlock({
  localStatePhone,
  handleConnectPhone,
  handleSettingsSlider,
  handleConnectOnStart,
  handleNotifications,
  handleDarkMode
}) {
  return (
    <Root>
      <SettingsContainer>
        <SettingsCard>
          <SettingHeader>Connection</SettingHeader>
          <Divider sx={{ mb: 1 }} />
          <Form component="fieldset">
            <FormGroup>
              <StyledFormControlLabel
                control={(
                  <Switch
                    checked={localStatePhone.connectOnStart}
                    onChange={handleConnectOnStart}
                    name="connectOnStart"
                    color="primary"
                    size="small"
                  />
                )}
                label={(
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {localStatePhone.connectOnStart ? <PhoneEnabled fontSize="small" /> : <PhoneDisabled fontSize="small" />}
                    Auto-Connect
                  </Box>
                )}
                labelPlacement="start"
              />
              
              <Box sx={{ mt: 1 }}>
                <StyledFormControlLabel
                  control={(
                    <Switch
                      checked={localStatePhone.connectedPhone}
                      onChange={handleConnectPhone}
                      name="connectionStatus"
                      color={localStatePhone.connectedPhone ? "primary" : "error"}
                      size="small"
                    />
                  )}
                  label={(
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {localStatePhone.connectedPhone ? <Call fontSize="small" color="success" /> : <CallEnd fontSize="small" color="error" />}
                      {localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}
                    </Box>
                  )}
                  labelPlacement="start"
                />
              </Box>
            </FormGroup>
          </Form>
        </SettingsCard>

        <SettingsCard>
          <SettingHeader>Notifications</SettingHeader>
          <Divider sx={{ mb: 1 }} />
          <Form component="fieldset">
            <FormGroup>
              <StyledFormControlLabel
                control={(
                  <Switch
                    checked={localStatePhone.notifications}
                    onChange={handleNotifications}
                    name="notifications"
                    color="primary"
                    size="small"
                  />
                )}
                label={(
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {localStatePhone.notifications ? <NotificationsActive fontSize="small" /> : <NotificationsOff fontSize="small" />}
                    Notifications
                  </Box>
                )}
                labelPlacement="start"
              />
            </FormGroup>
          </Form>
        </SettingsCard>

        <SettingsCard>
          <SettingHeader>Volume</SettingHeader>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Call Audio Volume Control */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.primary' }}>
                Call Audio
              </Typography>
              <SliderContainer>
                <SliderIcons>
                {localStatePhone.callVolume === 0 ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                </SliderIcons>
                <StyledSlider
                  value={typeof localStatePhone.callVolume === 'number' ? localStatePhone.callVolume : 0.5}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e, val) => handleSettingsSlider('callVolume', val)}
                  aria-labelledby="call-volume-slider"
                  size="small"
                  marks={[
                    {
                      value: 0,
                      label: '0%',
                    },
                    {
                      value: 0.5,
                      label: '50%',
                    },
                    {
                      value: 1,
                      label: '100%',
                    },
                  ]}
                />
              </SliderContainer>
            </Box>
            
            {/* Ringtone Volume Control */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.primary' }}>
                Ringtone
              </Typography>
              <SliderContainer>
                <SliderIcons>
                  {localStatePhone.ringVolume === 0 ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                </SliderIcons>
                <StyledSlider
                  value={typeof localStatePhone.ringVolume === 'number' ? localStatePhone.ringVolume : 0.5}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e, val) => handleSettingsSlider('ringVolume', val)}
                  aria-labelledby="ringtone-volume-slider"
                  size="small"
                  marks={[
                    {
                      value: 0,
                      label: '0%',
                    },
                    {
                      value: 0.5,
                      label: '50%',
                    },
                    {
                      value: 1,
                      label: '100%',
                    },
                  ]}
                />
              </SliderContainer>
            </Box>
          </Box>
        </SettingsCard>
      </SettingsContainer>
    </Root>
  );
}

export default SettingsBlock;
