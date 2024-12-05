import React from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Tabs,
  Divider,
  Tab,
  ListSubheader,
  List,
  Box,
  Typography
} from '@mui/material';
import {
  Settings as SettingsIcon,
  History as HistoryIcon,
  CallMade as CallMadeIcon,
  CallReceived as CallReceivedIcon
} from '@mui/icons-material';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import SettingsBlock from './SettingsBlock';

const BodyRoot = styled('div')({
  width: '100%'
});

const CallsList = styled(List)({
  width: '100%',
  maxWidth: 360,
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'auto',
  maxHeight: 300,
  padding: 0
});

const ListSection = styled('li')({
  backgroundColor: 'inherit',
  padding: 0
});

const UnorderedList = styled('ul')({
  backgroundColor: 'inherit',
  padding: 0
});

const CallHeader = styled(ListSubheader)(({ status, longNumber }) => ({
  color: status === 'missed' ? '#fa1941' : '#4ada61',
  fontSize: longNumber ? '0.55rem' : '0.675rem',
  lineHeight: '20px',
  padding: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'unset',
  backgroundColor: '#fff'
}));

const CallIcon = styled(({ isOutgoing, ...props }) => 
  isOutgoing ? <CallMadeIcon {...props} /> : <CallReceivedIcon {...props} />
)(({ longNumber }) => ({
  fontSize: longNumber ? '0.55rem' : '0.675rem',
  marginLeft: '4px',
  verticalAlign: 'middle'
}));

const NoCallsText = styled(Typography)({
  textAlign: 'center',
  padding: '16px',
  color: '#666'
});

const TabPanelStyled = styled(TabPanel)({
  padding: '16px'
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
  '&.Mui-selected': {
    color: '#3949ab'
  }
});

const TimeText = styled('span')({
  fontSize: '0.675rem',
  color: '#666'
});

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}

function SwipeCaruselBodyBlock({
  calls,
  localStatePhone,
  handleConnectPhone,
  handleSettingsSlider,
  handleConnectOnStart,
  handleNotifications,
  timelocale
}) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <StyledTab
            icon={<SettingsIcon />}
            label="Settings"
            {...a11yProps(0)}
          />
          <StyledTab
            icon={<HistoryIcon />}
            label="History"
            {...a11yProps(1)}
          />
        </Tabs>
      </AppBar>

      <TabPanel 
        role="tabpanel"
        hidden={value !== 0}
        id="full-width-tabpanel-0"
        aria-labelledby="full-width-tab-0"
      >
        {value === 0 && (
          <SettingsBlock
            localStatePhone={localStatePhone}
            handleConnectPhone={handleConnectPhone}
            handleSettingsSlider={handleSettingsSlider}
            handleConnectOnStart={handleConnectOnStart}
            handleNotifications={handleNotifications}
          />
        )}
      </TabPanel>

      <TabPanel 
        role="tabpanel"
        hidden={value !== 1}
        id="full-width-tabpanel-1"
        aria-labelledby="full-width-tab-1"
      >
        {value === 1 && (
          calls.length === 0 ? (
            <Typography variant="body1">No Calls</Typography>
          ) : (
            <CallsList subheader={<li />}>
              {calls.map(({
                sessionId,
                direction,
                number,
                time,
                status
              }) => (
                <ListSection key={`section-${sessionId}`}>
                  <UnorderedList>
                    <CallHeader 
                      status={status}
                      longNumber={number.length > 11}
                    >
                      <span>
                        {number}
                        <CallIcon 
                          isOutgoing={direction === 'outgoing'}
                          longNumber={number.length > 11}
                        />
                      </span>
                      {DateTime.fromISO(time.toISOString())
                        .setZone(timelocale)
                        .toString()}
                    </CallHeader>
                    <Divider />
                  </UnorderedList>
                </ListSection>
              ))}
            </CallsList>
          )
        )}
      </TabPanel>
    </div>
  );
}

SwipeCaruselBodyBlock.propTypes = {
  calls: PropTypes.arrayOf(PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['incoming', 'outgoing']).isRequired,
    number: PropTypes.string.isRequired,
    time: PropTypes.instanceOf(Date).isRequired,
    status: PropTypes.oneOf(['missed', 'answered']).isRequired
  })).isRequired,
  localStatePhone: PropTypes.object.isRequired,
  handleConnectPhone: PropTypes.func.isRequired,
  handleSettingsSlider: PropTypes.func.isRequired,
  handleConnectOnStart: PropTypes.func.isRequired,
  handleNotifications: PropTypes.func.isRequired,
  timelocale: PropTypes.string.isRequired
};

export default SwipeCaruselBodyBlock;