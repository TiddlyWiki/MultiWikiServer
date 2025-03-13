import React, { useState, PropsWithChildren } from 'react';
import WikiCard from './WikiCard';
import BagPill from './BagPill';
import { useFormStatus } from 'react-dom';
import { FormFieldInput, serverRequest, useFormFieldHandler, useIndexJson } from '../../helpers/utils';
import { JsonForm, JsonFormSimple } from '../../helpers/forms';
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogContent, DialogTitle, IconButton, Link, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack } from "@mui/material";
// import LockIcon from '@mui/icons-material/Lock';
// import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ACLIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import WithACL from '@mui/icons-material/GppGood';
import WithoutACL from '@mui/icons-material/GppBadOutlined';

interface Recipe {
  recipe_name: string;
  description: string;
  bag_names: string[];
  has_acl_access: boolean;
}

interface Bag {
  bag_name: string;
  description: string;
}

interface DashboardProps {
  username: string;
  userIsAdmin: boolean;
  userIsLoggedIn: boolean;
  firstGuestUser: boolean;
  userId?: string;
  initialShowSystem: boolean;
  initialShowAnonConfig: boolean;
  initialAllowReads: boolean;
  initialAllowWrites: boolean;
}

const Dashboard = () => {

  const [{ getBagName, getBagDesc, hasBagAclAccess, hasRecipeAclAccess, ...indexJson }, refresh] = useIndexJson();

  const isAdmin = indexJson.isAdmin;

  const [showSystem, setShowSystem] = useState(false);

  // Filter system bags based on showSystem state
  const filteredBags = showSystem
    ? indexJson.bagList
    : indexJson.bagList.filter(bag => !bag.bag_name.startsWith("$:/"));

  const handleShowSystemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShowSystem = e.target.checked;
    setShowSystem(newShowSystem);

    // Optionally persist the preference
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('show_system', newShowSystem ? 'on' : 'off');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  };

  interface RecipeCreateForm {
    recipe_name: string;
    description: string;
    bag_names: { bag_name: string, with_acl: boolean }[];
    with_acl: boolean;
    owned: boolean;
  }
  const handleRecipeSubmit = async (formData: RecipeCreateForm) => {
    console.log(formData);
    if (!isAdmin) formData.owned = true;
    const {
      recipe_name,
      bag_names,
      description,
      owned = false
    } = formData;

    await serverRequest.recipe_create({
      recipe_name,
      description,
      bag_names,
      owned,
    });
    return "Recipe created successfully.";
  };

  interface BagCreateForm {
    bag_name: string;
    description: string;
    owned: boolean;
  }
  const handleBagSubmit = async (formData: BagCreateForm) => {
    console.log(formData);
    if (!isAdmin) formData.owned = true;
    formData.owned = !!formData.owned;
    await serverRequest.bag_create(formData);
    return "Bag created successfully.";
  }

  const [openRecipeItems, setOpenRecipeItems] = useState<string | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [valueRecipe, onChangeRecipe] = useState<RecipeCreateForm>({} as any);
  const [showBagDialog, setShowBagDialog] = useState(false);
  const [bagTitle, setBagTitle] = useState("");
  const [valueBag, onChangeBag] = useState<{
    bag_name?: any;
    description?: any;
    owned?: any;
  }>({});

  console.log(valueRecipe, valueBag);


  return (
    <CardContent>
      <Stack direction="column" spacing={2}>


        <Card variant='outlined'>
          <CardContent>
            <h1>Recipes</h1>
            <List>
              {indexJson.recipeList.map((recipe) => (<>

                <ListItem key={recipe.recipe_name}>
                  <ListItemAvatar>
                    <Avatar src={`/recipes/${encodeURIComponent(recipe.recipe_name)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`} />
                  </ListItemAvatar>

                  <ListItemText
                    primary={<Link href={`/wiki/${encodeURIComponent(recipe.recipe_name)}`}>{recipe.recipe_name}</Link>}
                    secondary={recipe.description}
                  />

                  <IconButton
                    edge="end"
                    aria-label="edit recipe"
                    href=""
                    onClick={(event) => {
                      setShowRecipeDialog(true);
                      setRecipeTitle("Edit recipe");
                      onChangeRecipe({
                        recipe_name: recipe.recipe_name,
                        description: recipe.description,
                        bag_names: recipe.recipe_bags.map((recipeBag) => ({
                          bag_name: getBagName(recipeBag.bag_id)!,
                          with_acl: recipeBag.with_acl
                        })),
                        with_acl: false,
                        owned: false
                      });
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  {hasRecipeAclAccess(recipe) && (
                    <IconButton
                      edge="end"
                      aria-label="open acl"
                      href={`/admin/acl/${recipe.recipe_name}`}
                    >
                      <ACLIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="show bags"
                    onClick={() => { setOpenRecipeItems(recipe.recipe_name === openRecipeItems ? null : recipe.recipe_name) }}
                  >
                    {openRecipeItems === recipe.recipe_name ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </ListItem>
                <Collapse in={openRecipeItems === recipe.recipe_name} timeout="auto" unmountOnExit>
                  <List sx={{ pl: "4.25rem" }} component="div" disablePadding>

                    {recipe.recipe_bags.map(bag => (
                      <ListItem key={getBagName(bag.bag_id)}>
                        <ListItemAvatar>
                          <Avatar src={`/bags/${getBagName(bag.bag_id)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`} />
                        </ListItemAvatar>
                        <ListItemIcon>
                          {bag.with_acl ? <WithACL /> : <WithoutACL />}
                        </ListItemIcon>
                        <ListItemText
                          primary={getBagName(bag.bag_id)}
                          secondary={getBagDesc(bag.bag_id)} />
                      </ListItem>
                    ))}

                  </List>
                </Collapse>

              </>))}
            </List>
            <Dialog open={showRecipeDialog} onClose={() => { setShowRecipeDialog(false); }}>
              <DialogTitle>{recipeTitle}</DialogTitle>
              <DialogContent>
                <JsonForm
                  schema={{
                    type: "object",
                    required: ["recipe_name", "description", "bag_names"],
                    properties: {
                      recipe_name: { type: "string", title: "Recipe name" },
                      description: { type: "string", title: "Recipe description" },
                      bag_names: {
                        type: "array",
                        title: "Bags",
                        items: {
                          type: "object",
                          required: ["bag_name"],
                          properties: {
                            bag_name: {
                              type: "string", title: "Bag Name", default: ""
                            },
                            with_acl: {
                              type: "boolean",
                              title: "With ACL",
                              description: "Set this bag to inherit permissions from this recipe:",
                              default: false
                            },
                          }
                        }
                      },
                      owned: { type: "boolean", title: "Admin: Is this your personal recipe or a site-wide recipe?" },
                    }
                  }}
                  uiSchema={{
                    bag_names: {
                      "ui:options": {

                      }
                    }
                  }}
                  value={valueRecipe}
                  onChange={onChangeRecipe}
                  onSubmit={async (data, event) => {
                    console.log(data);
                    if (!data.formData) throw "No data";
                    return await handleRecipeSubmit(data.formData);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardActions>
            <Button onClick={() => {
              setShowRecipeDialog(true);
              setRecipeTitle("Create new recipe");
              onChangeRecipe({
                recipe_name: "",
                description: "",
                bag_names: [],
                with_acl: false,
                owned: false
              });
            }}>Create new recipe</Button>
          </CardActions>
        </Card>


        <Card variant='outlined'>
          <CardContent>
            <h1>Bags</h1>
            <List>
              {filteredBags.map(bag => (
                <ListItem key={bag.bag_name}>
                  <ListItemAvatar>
                    <Avatar src={`/bags/${encodeURIComponent(bag.bag_name)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={bag.bag_name}
                    secondary={bag.description} />
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    href=""
                    onClick={(event) => {
                      setShowBagDialog(true);
                      setBagTitle("Edit bag");
                      onChangeBag({
                        bag_name: bag.bag_name,
                        description: bag.description,
                        owned: false
                      });
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Dialog open={showBagDialog} onClose={() => { setShowBagDialog(false); }}>
              <DialogTitle>{bagTitle}</DialogTitle>
              <DialogContent>
                <JsonFormSimple
                  required={["bag_name", "description"]}
                  properties={{
                    bag_name: { type: "string", title: "Bag name" },
                    description: { type: "string", title: "Bag description" },
                    owned: { type: "boolean", title: "Admin: Is this your personal recipe or a site-wide recipe?" },
                  }}
                  onSubmit={async (data, event) => {
                    return await handleBagSubmit(data.formData);
                  }}
                  value={valueBag}
                  onChange={onChangeBag}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardActions>
            <Button onClick={() => {
              setShowBagDialog(true);
              setBagTitle("Create new bag");
              onChangeBag({
                bag_name: "",
                description: "",
                owned: false
              });
            }}>Create new bag</Button>
          </CardActions>
        </Card>

        <h1>Advanced</h1>

        <div id="checkboxForm">
          <input
            type="checkbox"
            id="chkShowSystem"
            name="show_system"
            value="on"
            checked={showSystem}
            onChange={handleShowSystemChange}
          />
          <label htmlFor="chkShowSystem">Show system bags</label>
        </div>
      </Stack>
    </CardContent >
  );
};

function renderBagItem(bag: { _count: { acl: number; }; } & { bag_id: number & { __prisma_table: "Bags"; __prisma_field: "bag_id"; }; bag_name: string & { __prisma_table: "Bags"; __prisma_field: "bag_name"; }; description: string & { __prisma_table: "Bags"; __prisma_field: "description"; }; owner_id: PrismaField<"Bags", "owner_id">; }, setShowBagDialog: React.Dispatch<React.SetStateAction<boolean>>, setBagTitle: React.Dispatch<React.SetStateAction<string>>, onChangeBag: React.Dispatch<React.SetStateAction<{ bag_name?: any; description?: any; owned?: any; }>>) {
  return;
}

function MwsFormChild({ title, submitText, children, }: PropsWithChildren<{ title: string, submitText: string }>) {
  const status = useFormStatus();
  return <>
    <div className="mws-form-heading">
      {title}
    </div>
    <div className="mws-form-fields">
      {children}
    </div>
    <div className="mws-form-buttons">
      <button type="submit" disabled={status.pending}          >
        {status.pending ? 'Processing...' : submitText}
      </button>
    </div>
  </>
}

function FormField({ name, children }: PropsWithChildren<{ name: string }>) {
  return <div className="mws-form-field" key={name}>
    <label className="mws-form-field-description">{children}</label>
    <input name={name} type="text" required />
  </div>
}

export default Dashboard;


export function NestedList() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Nested List Items
        </ListSubheader>
      }
    >
      <ListItemButton>
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText primary="Sent mail" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItemButton>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}
