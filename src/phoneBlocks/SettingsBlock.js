import React from 'react';
import { styled } from '@mui/material/styles';
import {
  VolumeUp,
  VolumeOff,
  NotificationsActive,
  NotificationsOff
} from '@mui/icons-material';
import {
  Grid,
  FormControl,
  FormGroup,
  FormControlLabel,
  Slider,
  Switch,
  LinearProgress
} from '@mui/material';
import PropTypes from 'prop-types';

const SettingsRoot = styled('div')({
  padding: 0
});

const SliderIcon = styled('span')({
  marginRight: '10px',
  color: '#546e7a'
});

const StyledFormControl = styled(FormControl)({
  margin: 0
});

const StyledFormControlLabel = styled(FormControlLabel)({
  margin: 0,
  padding: '0 8px',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  '& .MuiSwitch-root': {
    marginRight: '-8px'
  }
});

const SliderContainer = styled(Grid)({
  margin: '8px 16px 8px 8px'
});

function SettingsBlock({
  localStatePhone,
  handleConnectPhone,
  handleConnectOnStart,
  handleNotifications,
  handleSettingsSlider
}) {
  const {
    connectedPhone,
    connectingPhone,
    phoneConnectOnStart,
    notifications,
    ringVolume,
    callVolume
  } = localStatePhone;

  const [sliderValue, setSliderValue] = React.useState({
    ringVolume,
    callVolume
  });

  const handleSettingsSliderState = (name) => (e, newValue) => {
    setSliderValue((prevState) => ({
      ...prevState,
      [name]: newValue
    }));

    handleSettingsSlider(name, newValue);
  };

  return (
    <SettingsRoot>
      <Grid container spacing={2}>
        <SliderContainer 
          container 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <SliderIcon>
            {sliderValue.ringVolume === 0 
              ? <NotificationsOff /> 
              : <NotificationsActive />}
          </SliderIcon>
          <Slider 
            value={sliderValue.ringVolume} 
            onChange={handleSettingsSliderState('ringVolume')} 
            aria-labelledby="continuous-slider" 
            sx={{ width: 'calc(100% - 34px)' }}
          />
        </SliderContainer>

        <SliderContainer 
          container 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <SliderIcon>
            {sliderValue.callVolume === 0 
              ? <VolumeOff /> 
              : <VolumeUp />}
          </SliderIcon>
          <Slider 
            value={sliderValue.callVolume} 
            onChange={handleSettingsSliderState('callVolume')} 
            aria-labelledby="continuous-slider" 
            sx={{ width: 'calc(100% - 34px)' }}
          />
        </SliderContainer>

        <StyledFormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <StyledFormControlLabel
              control={
                <Switch 
                  checked={notifications} 
                  color="primary" 
                  onChange={handleNotifications}
                />
              }
              label="Notifications"
              labelPlacement="start"
            />

            <StyledFormControlLabel
              control={
                <Switch 
                  checked={phoneConnectOnStart} 
                  color="primary" 
                  onChange={handleConnectOnStart}
                />
              }
              label="Auto Connect"
              labelPlacement="start"
            />

            <StyledFormControlLabel
              control={
                <Switch 
                  disabled={connectingPhone} 
                  checked={connectedPhone} 
                  color="primary" 
                  onChange={handleConnectPhone}
                />
              }
              label={connectedPhone ? 'Disconnect' : 'Connect'}
              labelPlacement="start"
            />
          </FormGroup>
          {connectingPhone && <LinearProgress />}
        </StyledFormControl>
      </Grid>
    </SettingsRoot>
  );
}

SettingsBlock.propTypes = {
  localStatePhone: PropTypes.shape({
    connectedPhone: PropTypes.bool.isRequired,
    connectingPhone: PropTypes.bool.isRequired,
    phoneConnectOnStart: PropTypes.bool.isRequired,
    notifications: PropTypes.bool.isRequired,
    ringVolume: PropTypes.number.isRequired,
    callVolume: PropTypes.number.isRequired
  }).isRequired,
  handleConnectPhone: PropTypes.func.isRequired,
  handleConnectOnStart: PropTypes.func.isRequired,
  handleSettingsSlider: PropTypes.func.isRequired,
  handleNotifications: PropTypes.func.isRequired
};

export default SettingsBlock;