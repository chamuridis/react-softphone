import React from 'react';
import {
  Popover,
  TextField,
  Autocomplete
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { green, red } from '@mui/material/colors';

function SearchList({
  asteriskAccounts = [],
  onClickList,
  ariaDescribedby,
  anchorEl,
  setAnchorEl
}) {
  const open = Boolean(anchorEl);
  const id = open ? `${ariaDescribedby}` : undefined;
  const handleClose = () => setAnchorEl(null);
  const handleClick = (value) => {
    onClickList(value);
    setAnchorEl(null);
  };

  
  return (
    <>
      { open ? (
        <Popover
          id={id}
          open={open}
          onClose={handleClose}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >

          <Autocomplete
            id="combo-box-demo"
            options={asteriskAccounts}
            getOptionLabel={(option) => option?.accountId || ''}
            style={{ width: 300 }}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ marginRight: '8px' }}>{option.accountId}</span>
                    <span style={{ flexGrow: 1 }}>{option.label}</span>
                    {
                      Number(option.online) === 1 ? (
                        <FiberManualRecordIcon
                          fontSize="small"
                          style={{ color: green[600] }}
                        />
                      ) : (
                        <FiberManualRecordIcon
                          fontSize="small"
                          style={{ color: red[600] }}
                        />
                      )
                    }
                  </span>
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Search" variant="outlined" />}
            onChange={(event, value) => {
              if (value) {
                handleClick(value.accountId);
              }
            }}
          />
        </Popover>
      ) : null }
    </>
  );
}
export default SearchList;
