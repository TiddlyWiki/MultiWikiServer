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

import SvgIcon from '@mui/material/SvgIcon';


function MissingFavicon() {
  return <SvgIcon>
    <svg xmlns="http://www.w3.org/2000/svg" width="680" height="317pt" viewBox="34 107 510 317">
      <path d="m204.10294 372.67294 2.81039.8291c3.53151-1.58007 10.63031.86197 14.3959 2.05591-6.934-7.68695-17.38058-18.97509-24.90698-26.09145-2.4704-8.61546-1.41632-17.2848-.88481-26.0799l.10661-.7276c-2.96672 7.0407-6.73159 13.8847-8.75512 21.29577-2.36798 9.99817 10.5243 20.78568 15.5234 26.96817Zm214.89999 42.28504c-19.34998-.54698-27.86099-.49994-37.71558-16.70502l-7.68051.22004c-8.93988-.397-5.2142-.21705-11.1784-.51399-9.9719-.38803-8.37448-9.86297-10.12879-14.86898-2.8063-16.99305 3.71359-34.07392 3.50791-51.07032-.07282-6.03332-8.61032-27.38909-11.6604-35.02423-9.56162 1.80024-19.17511 2.14347-28.8754 2.62683-22.35922-.05477-44.5668-2.79281-66.61382-6.26983-4.29641 17.74804-17.06701 42.58935-6.5111 60.62682 12.81291 18.65766 21.80439 23.82667 35.7414 24.95164 13.93686 1.12406 17.0839 16.85904 13.71207 22.47903-2.98447 3.88403-8.22986 4.58905-12.68646 5.53003l-8.9144.41898c-7.01489-.23599-13.28491-2.12998-19.53552-5.051-10.43848-5.82696-21.2195-17.94095-29.22959-26.63797 1.86481 3.47299 2.97712 10.25293 1.28571 13.40802-4.7359 6.70896-25.21872 6.66797-34.59912 2.49897-10.65598-4.73502-36.40497-37.98197-40.386-62.88245 10.591-20.02872 26.02-37.47495 33.826-59.28323-17.015-10.85694-26.128-28.53113-24.94499-48.55152l.427-2.3175c-16.74199 3.13418-8.05998 1.96809-26.069976 3.33049-57.356004-.17549-107.796005-39.06484-79.393997-99.505786 1.846985-3.57904 3.603989-6.833004 6.735001-5.278994 2.512985 1.24695 2.152008 6.24898.887985 11.79598-16.234985 72.21878 63.111997 72.77153 111.887997 59.40782 4.84098-1.3266 14.46898-10.2612 21.13848-13.22311 10.9019-4.84113 22.7348-6.8053 34.47801-8.22059 29.20767-3.32814 64.31171 12.05838 82.14798 12.56079 17.83648.50239 43.20953-4.27082 58.785-3.26582 11.30133.51708 22.39853 2.55699 33.30252 5.46282 7.05802-34.3909 7.55701-59.737904 24.289-65.6059 9.82001 1.550995 17.38696 14.93298 22.98801 22.08301l.02298-.00403c11.40697-.45001 22.26203 2.44403 33.05499 5.65599 19.54004-2.772964 35.93702-13.74597 53.193-22.28198-.05396.268995-.33594.35998-.50397.54098-16.98199 13.73401-19.35405 36.95803-17.35602 58.43425.74304 11.14415-2.406 23.24344-6.29895 34.65357-7.28503 18.5899-21.35406 38.18498-37.68304 37.17997-6.17298-.19526-9.75901-3.69059-14.34699-7.4223-.89001 7.55863-4.388 14.30321-7.76001 20.98812-7.78698 14.82183-28.13598 21.35339-46.97802 37.18005-18.84076 15.8269 6.02902 72.35141 12.05902 82.65039 6.02902 10.29996 22.85998 14.06796 16.32901 23.36392-1.99799 3.07004-5.05301 4.16806-8.31803 5.35904Z" />
    </svg>
  </SvgIcon>
}

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
                    <Avatar src={`/recipes/${encodeURIComponent(recipe.recipe_name)}/tiddlers/%24%3A%2Ffavicon.ico`}>
                      <MissingFavicon />
                    </Avatar>
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
                          <Avatar src={`/bags/${encodeURIComponent(getBagName(bag.bag_id)!)}/tiddlers/%24%3A%2Ffavicon.ico`}>
                            <MissingFavicon />
                          </Avatar>
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
                    <Avatar src={`/bags/${encodeURIComponent(bag.bag_name)}/tiddlers/%24%3A%2Ffavicon.ico`} >
                      <MissingFavicon />
                    </Avatar>
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
