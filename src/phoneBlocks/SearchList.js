import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover
} from '@mui/material';
import { Search } from '@mui/icons-material';
import OnlineIndicator from './OnlineIndicator';

const SearchListRoot = styled('div')({
  width: '100%'
});

const SearchListBox = styled(List)({
  width: '100%',
  maxWidth: 360,
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'auto',
  maxHeight: 300,
  padding: 0
});

const FlexBetween = styled('span')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const StatusWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 0 0 10px'
});

const SearchInput = styled(InputBase)({
  marginLeft: 8,
  flex: 1
});

const SearchIconButton = styled(IconButton)({
  padding: '0 10px'
});

const SearchPaper = styled(Paper)({
  padding: '5px',
  display: 'flex',
  alignItems: 'center'
});

function SearchListComponent({
  asteriskAccounts = [],
  onClickList,
  ariaDescribedby,
  anchorEl,
  setAnchorEl
}) {
  const [list, setList] = React.useState(asteriskAccounts);
  const [inputSearch, setInputSearch] = useState('');
  const open = Boolean(anchorEl);
  const id = open ? `${ariaDescribedby}` : undefined;
  
  const handleClose = () => setAnchorEl(null);
  
  const handleClick = (value) => {
    onClickList(value);
    setAnchorEl(null);
  };

  useEffect(() => {
    const searchedAccounts = asteriskAccounts
      .filter((acc) => acc.label.toLowerCase()
        .includes(inputSearch.toLowerCase()) || acc.accountId
        .includes(inputSearch));
    setList(searchedAccounts);
  }, [inputSearch, asteriskAccounts]);

  return (
    <>
      {open && (
        <Popover
          id={id}
          open={open}
          onClose={handleClose}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <SearchList component="nav" aria-label="accounts">
            <ListItem>
              <ListItemText primary={(
                <Paper sx={{ padding: '5px' }}>
                  <SearchInput
                    id="inputSearch"
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={(event) => setInputSearch(event.target.value)}
                    defaultValue={inputSearch}
                  />
                  <SearchIconButton type="submit" aria-label="search">
                    <Search />
                  </SearchIconButton>
                </Paper>
              )}
              />
            </ListItem>
            <Divider />
            {list.map((account) => (
              <ListItem
                button
                key={account.accountId}
                onClick={() => handleClick(account.accountId)}
              >
                <ListItemText primary={(
                  <FlexBetween>
                    {account.label}
                    {' '}
                    {account.accountId}
                    {' '}
                    <StatusWrapper>
                      <OnlineIndicator
                        size="small"
                        status={account.online === 'true' ? 'online' : 'busy'}
                      />
                    </StatusWrapper>
                  </FlexBetween>
                )}
                />
              </ListItem>
            ))}
          </SearchList>
        </Popover>
      )}
    </>
  );
}

SearchListComponent.propTypes = {
  asteriskAccounts: PropTypes.arrayOf(PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    online: PropTypes.string.isRequired
  })),
  onClickList: PropTypes.func.isRequired,
  ariaDescribedby: PropTypes.string,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func.isRequired
};

export default SearchListComponent;