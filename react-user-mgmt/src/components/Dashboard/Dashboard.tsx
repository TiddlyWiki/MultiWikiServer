import React, { useCallback, useMemo, useState } from 'react';
import { EventEmitter, IndexJson, MissingFavicon, useIndexJson } from '../../helpers';
import {
  Avatar, Button, Card, CardActions, CardContent, Divider, IconButton, Link, List, ListItem, ListItemAvatar, ListItemButton,
  ListItemText, Stack,
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

import { useEventEmitter } from '../../helpers';


import { EntityACL, useACLEditForm, } from './ACLEdit';
import { useBagEditForm } from './BagEdit';
import { useRecipeEditForm } from './RecipeEdit';


export function Recipes() {
  const [{ getBag, getBagName, getBagDesc, hasBagAclAccess, hasRecipeAclAccess, ...indexJson }, refresh] = useIndexJson();

  const getOwner = useCallback((owner_id: number | null): string => {
    if (owner_id === null) return "System";
    return (indexJson.userListAdmin || indexJson.userListUser || [])
      .find(e => e.user_id === owner_id)?.username ?? "Unknown";
  }, [indexJson]);

  const [recipeMarkup, recipeSet] = useRecipeEditForm();
  const [aclMarkup, aclSet] = useACLEditForm();

  const [openRecipeItems, setOpenRecipeItems] = useState<string | null>(null);

  return <CardContent>
    <Stack direction="column" spacing={2}>
      <Card variant='outlined'>
        <CardContent>
          <h1>Recipes</h1>
          <List>
            {indexJson.recipeList.map((recipe) => {
              const bagsReadable = recipe.recipe_bags.every(bag => !!getBag(bag.bag_id))
              return (<>

                <ListItemButton key={recipe.recipe_name} disableRipple>
                  <ListItemAvatar>
                    {bagsReadable ? (
                      <Avatar src={`recipes/${encodeURIComponent(recipe.recipe_name)}/tiddlers/%24%3A%2Ffavicon.ico`}>
                        <MissingFavicon />
                      </Avatar>
                    ) : (
                      // <Avatar color={theme.palette.warning.main}>
                      <ReportProblemIcon color="warning" fontSize='large' />
                      //</Avatar> 
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={<>
                      <Link href={`wiki/${encodeURIComponent(recipe.recipe_name)}`}>{recipe.recipe_name}</Link>
                      {recipe.owner_id && <span> (by {getOwner(recipe.owner_id)})</span>}
                    </>}
                    secondary={<Stack direction="column">
                      <span>{recipe.description}</span>
                      {!bagsReadable && <><span>You need at least read permission for every bag in this recipe.</span><Divider /></>}
                    </Stack>}
                  />
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      aria-label="edit recipe"
                      href=""
                      onClick={() => {
                        // recipeEditEvents.emit({ type: "open", value: recipe });
                        recipeSet({
                          ...recipe,
                          bag_names: recipe.recipe_bags.map(rb => ({
                            bag_name: getBag(rb.bag_id)?.bag_name ?? "",
                            with_acl: rb.with_acl,
                          })),
                        });
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    {hasRecipeAclAccess(recipe) && (
                      <IconButton
                        edge="end"
                        aria-label="open acl"
                        onClick={() => {
                          aclSet({
                            type: "recipe",
                            id: recipe.recipe_id,
                            name: recipe.recipe_name,
                            description: recipe.description,
                            owner_id: recipe.owner_id,
                            acl: recipe.acl
                          });
                        }}
                      >
                        <ACLIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="show bags"
                      onClick={() => {
                        setOpenRecipeItems(recipe.recipe_name === openRecipeItems ? null : recipe.recipe_name)
                      }}
                    >
                      {openRecipeItems === recipe.recipe_name ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Stack>
                </ListItemButton>

                <Collapse in={openRecipeItems === recipe.recipe_name} timeout="auto" unmountOnExit>
                  <List sx={{ pl: "4.25rem" }} component="div" disablePadding>

                    {recipe.recipe_bags.map(bag => (
                      <ListItem key={getBagName(bag.bag_id)}>
                        <ListItemAvatar>
                          <Avatar src={`bags/${encodeURIComponent(getBagName(bag.bag_id)!)}/tiddlers/%24%3A%2Ffavicon.ico`}>
                            <MissingFavicon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemIcon>
                          {bag.with_acl ? <WithACL /> : <WithoutACL />}
                        </ListItemIcon>
                        <ListItemText
                          primary={<>
                            {getBagName(bag.bag_id)}
                            {getBag(bag.bag_id)?.owner_id && <span> (by {getBag(bag.bag_id)!.owner_id})</span>}
                          </>}
                          secondary={getBagDesc(bag.bag_id)} />
                      </ListItem>
                    ))}

                  </List>
                </Collapse>

              </>)
            })}
          </List>

          {recipeMarkup}
          {aclMarkup}

        </CardContent>
        <CardActions>
          <Button onClick={() => { recipeSet(null); }}>Create new recipe</Button>
        </CardActions>
      </Card>
    </Stack>
  </CardContent >
}

export function Bags({ title }: {
  // filteredBags: IndexJson["bagList"][number][];
  // hasBagAclAccess?: (bag: IndexJson["bagList"][number]) => boolean;
  // bagSet: (value: IndexJson["bagList"][number] | null) => void;
  // aclSet: (value: EntityACL) => void;
  // getOwner: (owner_id: number | null) => string;
  title: "Bags" | "Plugins";
  // favicon: boolean;
}) {
  const [{ hasBagAclAccess, ...indexJson }] = useIndexJson();

  const filteredBags = useMemo(() => {
    switch (title) {
      case "Bags": return indexJson.bagList.filter(bag => !bag.is_plugin);
      case "Plugins": return indexJson.bagList.filter(bag => bag.is_plugin);
    }
  }, [title, indexJson.bagList]);

  const getOwner = useCallback((owner_id: number | null): string => {
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
          <h1>{title}</h1>
          {title === "Plugins" && <span>This plugin system will be replaced by a completely different one in v0.1</span>}
          <List>
            {filteredBags.map(bag => (
              <ListItemButton key={bag.bag_name} disableRipple>
                <ListItemAvatar>
                  <Avatar src={title === "Bags" ? `bags/${encodeURIComponent(bag.bag_name)}/tiddlers/%24%3A%2Ffavicon.ico` : undefined}>
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

