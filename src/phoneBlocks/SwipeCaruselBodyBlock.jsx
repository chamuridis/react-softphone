import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  List,
  Paper,
  Divider,
  AppBar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AccessTime, 
  CallMade as CallMadeIcon, 
  CallReceived as CallReceivedIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { DateTime } from 'luxon';

import SettingsBlock from './SettingsBlock';

function TabPanel(props) {
  const {
    children, value, index, sx, ...other
  } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, ...sx }}
      {...other}
    >
      {value === index && <Box p={1} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: '25%',
  marginRight: 'auto',
  fontWeight: 500,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderRadius: 0,
  boxShadow: 'none',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const ListRoot = styled(List)(({ theme }) => ({
  width: '100%',
  maxHeight: '300px',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(1)
}));

const CallLogPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`
}));

const ListSectionStyled = styled('li')({
  width: '100%',
  listStyle: 'none'
});

const UlStyled = styled('ul')({
  padding: 0
});

const TabStyled = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  overflow: 'visible', 
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
}));

const EmptyCallsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '150px',
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  borderRadius: theme.shape.borderRadius * 1.5,
  '& svg': {
    fontSize: '2.5rem',
    opacity: 0.6,
    marginBottom: theme.spacing(1)
  }
}));

function SwipeCaruselBodyBlock({
  localStatePhone,
  handleConnectPhone,
  handleSettingsSlider,
  handleConnectOnStart,
  handleNotifications,
  handleDarkMode,
  calls,
  timelocale
}) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <StyledAppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
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
      </StyledAppBar>

      <TabPanel value={value} index={0}>
        {/* Settings Block */}
        <TabStyled>
          <SettingsBlock
            localStatePhone={localStatePhone}
            handleConnectPhone={handleConnectPhone}
            handleSettingsSlider={handleSettingsSlider}
            handleConnectOnStart={handleConnectOnStart}
            handleNotifications={handleNotifications}
            handleDarkMode={handleDarkMode}
          />
        </TabStyled>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TabStyled>
          {calls.length === 0 ? (
            <EmptyCallsContainer>
              <AccessTime fontSize="large" />
              <Typography variant="subtitle1" fontWeight={500}>No call history</Typography>
              <Typography variant="body2">Your recent calls will appear here</Typography>
            </EmptyCallsContainer>
          ) : (
            <ListRoot className="root" subheader={<li />}>
              {calls.map(({
                sessionId, direction, number, time, status
              }) => (
                <ListSectionStyled key={`section-${sessionId}`} className="listSection">
                  <CallLogPaper>
                    <UlStyled className="ul">
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 0.5 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" 
                            sx={{ 
                              fontWeight: 500, 
                              color: status === 'missed' ? 'error.main' : 'success.main',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {number}
                            {direction === 'outgoing' ? (
                              <CallMadeIcon sx={{ ml: 0.5, fontSize: '0.875rem', color: '#4caf50' }} />
                            ) : (
                              <CallReceivedIcon sx={{ ml: 0.5, fontSize: '0.875rem', color: status === 'missed' ? '#f44336' : '#2196f3' }} />
                            )}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {DateTime.fromISO(time.toISOString())
                            .setZone(timelocale)
                            .toFormat('dd MMM, HH:mm')}
                        </Typography>
                      </Box>
                      <Divider />
                    </UlStyled>
                  </CallLogPaper>
                </ListSectionStyled>
              ))}
            </ListRoot>
          )}
        </TabStyled>
      </TabPanel>
    </div>
  );
}

export default SwipeCaruselBodyBlock;
