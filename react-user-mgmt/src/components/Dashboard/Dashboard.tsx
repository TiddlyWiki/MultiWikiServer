import React, { useState, PropsWithChildren } from 'react';
import WikiCard from './WikiCard';
import BagPill from './BagPill';
import { useFormStatus } from 'react-dom';
import { FormFieldInput, serverRequest, useFormFieldHandler, useIndexJson } from '../../helpers/utils';

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
  const recipeForm = useFormFieldHandler<RecipeCreateForm>(refresh);

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
  const bagForm = useFormFieldHandler<BagCreateForm>(refresh);

  return (
    <>
      <ul className="mws-vertical-list">
        {indexJson.recipeList.map((recipe) => (
          <li key={recipe.recipe_name}>
            <WikiCard
              recipeName={recipe.recipe_name}
              description={recipe.description}
              bags={recipe.recipe_bags.map((recipeBag) => ({
                bag_id: recipeBag.bag_id,
                position: recipeBag.position,
                bag_name: getBagName(recipeBag.bag_id)
              })).sort((a, b) => a.position - b.position).reverse()}
              hasAclAccess={hasRecipeAclAccess(recipe)}
              showSystem={showSystem}
            />
          </li>
        ))}
      </ul>

      <form className="mws-form" onSubmit={recipeForm.handler(handleRecipeSubmit)}>
        <h2>Create a new recipe or modify an existing one</h2>
        <FormFieldInput {...recipeForm.register("recipe_name", { required: true })}
          type="text" title="Recipe name" />
        <FormFieldInput {...recipeForm.register("description", { required: true })}
          type="text" title="Recipe description" />
        <FormFieldInput {...recipeForm.register("bag_names", { required: true })}
          type="text" title="Bags in recipe (space separated)" />
        {isAdmin && <FormFieldInput {...recipeForm.register("owned", { required: false })}
          type="checkbox" title="Admin: Is this your personal recipe or a site-wide recipe?" />}
        <FormFieldInput {...recipeForm.register("with_acl", { required: false })}
          type="checkbox" title="Apply implicit ACL permissions to bags which you have admin privelages on." />
        {recipeForm.footer("Create Recipe")}
      </form>

      <h1>Bags</h1>

      <ul className="mws-vertical-list">
        {filteredBags.map(bag => (
          <li key={bag.bag_name} className="mws-wiki-card">
            <BagPill bagName={bag.bag_name} />
            <span>{bag.description}</span>
          </li>
        ))}
      </ul>

      <form className="mws-form" onSubmit={bagForm.handler(handleBagSubmit)}>
        <h2>Create a new bag or modify an existing one</h2>
        <FormFieldInput {...bagForm.register("bag_name", { required: true })}
          type="text" title="Bag name" />
        <FormFieldInput {...bagForm.register("description", { required: true })}
          type="text" title="Bag description" />
        {isAdmin && <FormFieldInput {...recipeForm.register("owned", { required: false })}
          type="checkbox" title="Admin: Is this your personal recipe or a site-wide recipe?" />}

        {bagForm.footer("Create Bag")}
      </form>

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
    </>
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
