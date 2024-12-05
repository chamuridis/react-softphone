import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { styled } from '@mui/material/styles';
import {
  Typography,
  Box,
  AppBar,
  Tabs,
  Tab
} from '@mui/material';
import PropTypes from 'prop-types';

const CarouselRoot = styled('div')({
  width: '100%',
  position: 'relative'
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  minWidth: '25%',
  marginRight: 'auto',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ].join(','),
  '&:hover': {
    color: '#3949ab',
    opacity: 1
  },
  '&:focus': {
    color: '#3949ab'
  },
  '&.Mui-selected': {
    color: '#3949ab'
  }
});

const TabPanel = styled(Box)({
  padding: '24px 16px'
});

const HoldPanel = styled(TabPanel)({
  backgroundColor: '#ff8686'
});

const ActivePanel = styled(TabPanel)({
  backgroundColor: '#d0f6bb'
});

const InfoText = styled(Typography)({
  color: 'black',
  marginBottom: '8px'
});

const SwipeableViewsContainer = styled('div')({
  '& .react-swipeable-view-container': {
    height: '100%'
  }
});

const AppBarStyled = styled(AppBar)({
  boxShadow: 'none',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
});

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#3949ab'
  }
});

function SwipeCaruselBlock({
  localStatePhone,
  activeChannel,
  setActiveChannel
}) {
  const [duration, setDuration] = React.useState([
    { duration: 0 },
    { duration: 0 },
    { duration: 0 }
  ]);

  const [intervals, setintervals] = React.useState([
    { intrId: 0, active: false },
    { intrId: 0, active: false },
    { intrId: 0, active: false }
  ]);

  const { displayCalls } = localStatePhone;

  const handleTabChangeIndex = (index) => {
    setActiveChannel(index);
  };

  const handleTabChange = (event, newValue) => {
    setActiveChannel(newValue);
  };

  React.useEffect(() => {
    displayCalls.forEach((displayCall, key) => {
      if (displayCall.inCall && displayCall.inAnswer && !intervals[key].active) {
        const intr = setInterval(() => {
          setDuration((prev) => ({
            ...prev,
            [key]: { duration: prev[key].duration + 1 }
          }));
        }, 1000);

        setintervals((prev) => ({
          ...prev,
          [key]: { intrId: intr, active: true }
        }));
      } else if ((!displayCall.inCall || !displayCall.inAnswer) && intervals[key].active) {
        clearInterval(intervals[key].intrId);
        setDuration((prev) => ({ ...prev, [key]: { duration: 0 } }));
        setintervals((prev) => ({
          ...prev,
          [key]: { intrId: 0, active: false }
        }));
      }
    });

    return () => {
      intervals.forEach((interval) => {
        if (interval.intrId) {
          clearInterval(interval.intrId);
        }
      });
    };
  }, [displayCalls, intervals]);

  const renderCallInfo = (displayCall, key) => {
    if (!displayCall.inCall) {
      return (
        <InfoText>
          Status: {displayCall.callInfo} {displayCall.info}
        </InfoText>
      );
    }

    if (!displayCall.inAnswer) {
      return (
        <>
          <InfoText>Status: {displayCall.callInfo}</InfoText>
          <InfoText>Side: {displayCall.direction}</InfoText>
          <InfoText>Number: {displayCall.callNumber}</InfoText>
        </>
      );
    }

    if (displayCall.hold) {
      return (
        <>
          <InfoText>Status: {displayCall.callInfo}</InfoText>
          <InfoText>Duration: {duration[key].duration}</InfoText>
          <InfoText>Number: {displayCall.callNumber}</InfoText>
          <InfoText>Side: {displayCall.direction}</InfoText>
        </>
      );
    }

    if (displayCall.inTransfer) {
      return (
        <>
          <InfoText>Status: {displayCall.callInfo}</InfoText>
          <InfoText>Side: {displayCall.direction}</InfoText>
          <InfoText>Duration: {duration[key].duration}</InfoText>
          <InfoText>Number: {displayCall.callNumber}</InfoText>
          <InfoText>Transfer to: {displayCall.transferNumber}</InfoText>
          {displayCall.attendedTransferOnline.length > 1 && !displayCall.inConference && (
            <InfoText>Talking with: {displayCall.attendedTransferOnline}</InfoText>
          )}
        </>
      );
    }

    return (
      <>
        <InfoText>Status: {displayCall.callInfo}</InfoText>
        <InfoText>Side: {displayCall.direction}</InfoText>
        <InfoText>Duration: {duration[key].duration}</InfoText>
        <InfoText>Number: {displayCall.callNumber}</InfoText>
      </>
    );
  };

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={activeChannel}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <StyledTab label="CH 1" {...a11yProps(0)} />
          <StyledTab label="CH 2" {...a11yProps(1)} />
          <StyledTab label="CH 3" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis="x"
        index={activeChannel}
        onChangeIndex={handleTabChangeIndex}
      >
        {displayCalls.map((displayCall, key) => (
          <Box
            key={displayCall.id}
            role="tabpanel"
            hidden={key !== activeChannel}
            id={`full-width-tabpanel-${key}`}
            aria-labelledby={`full-width-tab-${key}`}
          >
            {key === activeChannel && (
              displayCall.hold ? (
                <HoldPanel>{renderCallInfo(displayCall, key)}</HoldPanel>
              ) : (
                <ActivePanel>{renderCallInfo(displayCall, key)}</ActivePanel>
              )
            )}
          </Box>
        ))}
      </SwipeableViews>
    </div>
  );
}

SwipeCaruselBlock.propTypes = {
  localStatePhone: PropTypes.shape({
    displayCalls: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      info: PropTypes.string.isRequired,
      inCall: PropTypes.bool.isRequired,
      inAnswer: PropTypes.bool.isRequired,
      hold: PropTypes.bool.isRequired,
      callInfo: PropTypes.string.isRequired,
      direction: PropTypes.string,
      callNumber: PropTypes.string,
      inTransfer: PropTypes.bool,
      transferNumber: PropTypes.string,
      attendedTransferOnline: PropTypes.string,
      inConference: PropTypes.bool
    })).isRequired
  }).isRequired,
  activeChannel: PropTypes.number.isRequired,
  setActiveChannel: PropTypes.func.isRequired
};

export default SwipeCaruselBlock;