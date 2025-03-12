import React, { useState, PropsWithChildren } from 'react';
import WikiCard from './WikiCard';
import BagPill from './BagPill';
import { useFormStatus } from 'react-dom';
import { FormFieldInput, serverRequest, useFormFieldHandler, useIndexJson } from '../../helpers/utils';
import { JsonForm } from '../../helpers/forms';
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogContent, DialogTitle, IconButton, Link, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack } from "@mui/material";
// import LockIcon from '@mui/icons-material/Lock';
// import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ACLIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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

  const [{ getBagName, hasBagAclAccess, hasRecipeAclAccess, ...indexJson }, refresh] = useIndexJson();

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
    bag_names: string;
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
      owned = false,
      with_acl = false
    } = formData;
    const bag_list = bag_names.split(" "); // this should really be a tw list
    await serverRequest.recipe_create({
      recipe_name,
      description,
      bag_names: bag_list,
      owned,
      with_acl
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

  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [valueRecipe, onChangeRecipe] = useState<{
    description?: any;
    with_acl?: any;
    recipe_name?: any;
    bag_names?: any;
    owned?: any;
  }>({});
  const [showBagDialog, setShowBagDialog] = useState(false);
  const [bagTitle, setBagTitle] = useState("");
  const [valueBag, onChangeBag] = useState<{
    bag_name?: any;
    description?: any;
    owned?: any;
  }>({});



  return (
    <CardContent>
      <Stack direction="column" spacing={2}>


        <Card variant='outlined'>
          <CardContent>
            <h1>Recipes</h1>
            <List>
              {indexJson.recipeList.map((recipe) => (

                <ListItem key={recipe.recipe_name}>
                  <ListItemAvatar>
                    <Avatar src={`/recipes/${encodeURIComponent(recipe.recipe_name)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`} />
                  </ListItemAvatar>

                  <ListItemText
                    primary={<Link href={`/wiki/${encodeURIComponent(recipe.recipe_name)}`}>{recipe.recipe_name}</Link>}
                    secondary={recipe.description}
                  />

                  <ListItemText>
                    {recipe.recipe_bags.map((recipeBag) => ({
                      bag_id: recipeBag.bag_id,
                      position: recipeBag.position,
                      bag_name: getBagName(recipeBag.bag_id)
                    })).sort((a, b) => a.position - b.position).reverse().map((recipeBag, index) => (
                      <BagPill
                        key={recipeBag.bag_id}
                        bagName={getBagName(recipeBag.bag_id)}
                        isTopmost={index === 0}
                      />
                    ))}
                  </ListItemText>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    href=""
                    onClick={(event) => {
                      setShowRecipeDialog(true);
                      setRecipeTitle("Edit recipe");
                      onChangeRecipe({
                        recipe_name: recipe.recipe_name,
                        description: recipe.description,
                        bag_names: recipe.recipe_bags.map((recipeBag) => getBagName(recipeBag.bag_id)).join(" "),
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
                      aria-label="delete"
                      href={`/admin/acl/${recipe.recipe_name}`}
                    >
                      <ACLIcon />
                    </IconButton>
                  )}
                </ListItem>

              ))}
            </List>
            <Dialog open={showRecipeDialog} onClose={() => { setShowRecipeDialog(false); }}>
              <DialogTitle>{recipeTitle}</DialogTitle>
              <DialogContent>
                <JsonForm
                  required={["recipe_name", "description", "bag_names"]}
                  properties={{
                    recipe_name: { type: "string", title: "Recipe name" },
                    description: { type: "string", title: "Recipe description" },
                    bag_names: { type: "string", title: "Bags in recipe (space separated)" },
                    with_acl: { type: "boolean", title: "Apply implicit ACL permissions to bags which you have admin privelages on." },
                    owned: { type: "boolean", title: "Admin: Is this your personal recipe or a site-wide recipe?" },
                  }}
                  value={valueRecipe}
                  onChange={onChangeRecipe}
                  onSubmit={async (data, event) => {
                    console.log(data);
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
                bag_names: "",
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
                    <Avatar src={`/recipes/${encodeURIComponent(bag.bag_name)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={bag.bag_name}
                    secondary={bag.description}
                  />
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
                <JsonForm
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
