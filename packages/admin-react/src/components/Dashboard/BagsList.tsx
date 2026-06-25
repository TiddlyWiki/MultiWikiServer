import React, { useCallback, useMemo, useState } from 'react';
import { EventEmitter, IndexJson, MissingFavicon, useIndexJson } from '../../helpers';
import {
  Avatar, Button, Card, CardActions, CardContent, Divider, IconButton, Link, List, ListItem, ListItemAvatar, ListItemButton,
  ListItemText, Stack,
  Tooltip,
  useTheme
} from "@mui/material";
import ACLIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WithACL from '@mui/icons-material/GppGood';
import WithoutACL from '@mui/icons-material/GppBadOutlined';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff';
import TuneIcon from '@mui/icons-material/Tune';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';

import { useEventEmitter } from '../../helpers';


import { EntityACL, useACLEditForm, } from './ACLEdit';
import { useBagEditForm } from './BagEdit';
import { useRecipeEditForm } from './RecipeEdit';



export function Bags() {
  const [{ hasBagAclAccess, ...indexJson }] = useIndexJson();

  const getOwner = useCallback((owner_id: string | null): string => {
    if (owner_id === null) return "System";
    return (indexJson.userListAdmin || indexJson.userListUser || [])
      .find(e => e.user_id === owner_id)?.username ?? "Unknown";
  }, [indexJson]);

  const [bagMarkup, bagSet] = useBagEditForm();
  const [aclMarkup, aclSet] = useACLEditForm();

  return <CardContent>
    <Stack direction="column" spacing={2}>
      <Card variant='outlined'>
        <CardContent>
          <h1>Bags</h1>
          <List>
            {indexJson.bagList.map(bag => (
              <ListItemButton key={bag.bag_name} disableRipple>
                <ListItemAvatar>
                  <Avatar src={`${pathPrefix}/bag/${encodeURIComponent(bag.bag_name)}/tiddlers/%24%3A%2Ffavicon.ico`}>
                    <MissingFavicon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<>
                    {bag.bag_name}
                    {bag.owner_id && <span> (by {getOwner(bag.owner_id)})</span>}
                  </>}
                  secondary={bag.description} />
                <Stack direction="row" spacing={1}>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    href=""
                    onClick={(event) => { bagSet(bag); }}
                  >
                    <EditIcon />
                  </IconButton>
                  {hasBagAclAccess?.(bag) && (
                    <IconButton
                      edge="end"
                      aria-label="open acl"
                      onClick={() => {
                        aclSet({
                          type: "bag",
                          id: bag.bag_id,
                          name: bag.bag_name,
                          description: bag.description,
                          owner_id: bag.owner_id,
                          acl: bag.acl
                        });
                      }}
                    >
                      <ACLIcon />
                    </IconButton>
                  )}
                </Stack>
              </ListItemButton>
            ))}
          </List>
          {bagMarkup}
          {aclMarkup}
        </CardContent>
        <CardActions>
          <Button onClick={() => { bagSet(null); }}>Create new bag</Button>
        </CardActions>
      </Card>
    </Stack>
  </CardContent>;
}

