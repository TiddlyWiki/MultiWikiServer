import React, { useState, PropsWithChildren } from 'react';
import WikiCard from './WikiCard';
import BagPill from './BagPill';
import { useFormStatus } from 'react-dom';
import { IndexJson, useIndexJson } from '../../helpers/server-types';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import { DataLoader } from '../../helpers/utils';

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

  const indexJson = useIndexJson();

  const [recipes, setRecipes] = useState(indexJson.allowedRecipesWithWrite);
  const [bags, setBags] = useState(indexJson.allowedBags);
  const [showSystem, setShowSystem] = useState(false);

  // Filter system bags based on showSystem state
  const filteredBags = showSystem
    ? bags
    : bags.filter(bag => !bag.bag_name.startsWith("$:/"));

  const handleRecipeSubmit = async (e: any) => {
    const formData: any = Object.fromEntries(e.entries());
    formData.bag_names = formData.bag_names.split(' ');
    console.log(formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRecipes(prev => [...prev, formData]);
  };

  const handleBagSubmit = async (e: any) => {
    const formData: any = Object.fromEntries(e.entries());
    console.log(formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBags(prev => [...prev, formData]);
  }

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

  return (
    <>
      <ul className="mws-vertical-list">
        {recipes.map((recipe) => (
          <li key={recipe.recipe_name}>
            <WikiCard
              recipeName={recipe.recipe_name}
              description={recipe.description}
              bagNames={recipe.bag_names}
              hasAclAccess={recipe.has_acl_access}
              showSystem={showSystem}
            />
          </li>
        ))}
      </ul>

      <form className="mws-form" action={handleRecipeSubmit}>
        <MwsFormChild title="Create a new recipe or modify an existing one" submitText="Create or Update Recipe">
          <FormField name="recipe_name">Recipe name</FormField>
          <FormField name="description">Recipe description</FormField>
          <FormField name="bag_names">Bags in recipe (space separated)</FormField>
        </MwsFormChild>
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

      <form className="mws-form" action={handleBagSubmit}>
        <MwsFormChild title="Create a new bag or modify an existing one" submitText="Create or Update Bag"        >
          <FormField name="bag_name">Bag name</FormField>
          <FormField name="description">Bag description</FormField>
        </MwsFormChild>
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
