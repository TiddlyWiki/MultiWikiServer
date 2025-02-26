import React, { useState, useEffect } from 'react';
import Header from './Header';
import AnonConfigModal from './AnonConfigModal';
import WikiCard from './WikiCard';
import BagPill from './BagPill';

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
  initialRecipes: Recipe[];
  initialBags: Bag[];
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

const Dashboard: React.FC<DashboardProps> = ({
  initialRecipes,
  initialBags,
  username,
  userIsAdmin,
  userIsLoggedIn,
  firstGuestUser,
  userId,
  initialShowSystem,
  initialShowAnonConfig,
  initialAllowReads,
  initialAllowWrites
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([
    { recipe_name: 'Home', description: 'Home page', has_acl_access: false, bag_names: ["home", '$:/config'], },
    { recipe_name: 'Dev', description: 'Dev docs', has_acl_access: false, bag_names: ["dev", '$:/config'], },
  ]);
  const [bags, setBags] = useState<Bag[]>([
    { bag_name: '$:/config', description: 'Configuration' },
    { bag_name: '$:/state', description: 'State' },
    { bag_name: "home", description: "Home page" },
    { bag_name: "dev", description: "Dev docs" },
  ]);
  const [showSystem, setShowSystem] = useState(initialShowSystem);
  const [showAnonConfig, setShowAnonConfig] = useState(initialShowAnonConfig);

  // Form states
  const [recipeForm, setRecipeForm] = useState({ recipe_name: '', description: '', bag_names: '' });
  const [bagForm, setBagForm] = useState({ bag_name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState({ recipe: false, bag: false });

  // Filter system bags based on showSystem state
  const filteredBags = showSystem
    ? bags
    : bags.filter(bag => !bag.bag_name.startsWith("$:/"));

  const handleRecipeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBagFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBagForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(prev => ({ ...prev, recipe: true }));

    try {
      const response = await fetch('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipeForm,
          bag_names: recipeForm.bag_names.split(' ')
        })
      });

      if (response.ok) {
        const newRecipe = await response.json();

        // Update recipes list
        setRecipes(prev => {
          const index = prev.findIndex(r => r.recipe_name === newRecipe.recipe_name);
          if (index >= 0) {
            return prev.map(r => r.recipe_name === newRecipe.recipe_name ? newRecipe : r);
          } else {
            return [...prev, newRecipe];
          }
        });

        // Clear form
        setRecipeForm({ recipe_name: '', description: '', bag_names: '' });
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
    } finally {
      setIsSubmitting(prev => ({ ...prev, recipe: false }));
    }
  };

  const handleBagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(prev => ({ ...prev, bag: true }));

    try {
      const response = await fetch('/bags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bagForm)
      });

      if (response.ok) {
        const newBag = await response.json();

        // Update bags list
        setBags(prev => {
          const index = prev.findIndex(b => b.bag_name === newBag.bag_name);
          if (index >= 0) {
            return prev.map(b => b.bag_name === newBag.bag_name ? newBag : b);
          } else {
            return [...prev, newBag];
          }
        });

        // Clear form
        setBagForm({ bag_name: '', description: '' });
      }
    } catch (error) {
      console.error('Error submitting bag:', error);
    } finally {
      setIsSubmitting(prev => ({ ...prev, bag: false }));
    }
  };

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
      <Header
        pageTitle="Wikis Available Here"
        username={username}
        userIsAdmin={userIsAdmin}
        userIsLoggedIn={userIsLoggedIn}
        firstGuestUser={firstGuestUser}
        userId={userId}
      />

      {firstGuestUser && (
        <div className="mws-security-warning">
          <div className="mws-security-warning-content">
            <div className="mws-security-warning-icon">⚠️</div>
            <div className="mws-security-warning-text">
              <strong>Warning:</strong> TiddlyWiki is currently running in anonymous access mode which allows anyone with access to the server to read and modify data.
            </div>
            <div className="mws-security-warning-action">
              <a href="/admin/users" className="mws-security-warning-button">Add Admin Account</a>
            </div>
          </div>
        </div>
      )}

      {showAnonConfig && (
        <AnonConfigModal
          initialAllowReads={initialAllowReads}
          initialAllowWrites={initialAllowWrites}
          onClose={() => setShowAnonConfig(false)}
        />
      )}

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

      <form className="mws-form" onSubmit={handleRecipeSubmit}>
        <div className="mws-form-heading">
          Create a new recipe or modify and existing one
        </div>
        <div className="mws-form-fields">
          <div className="mws-form-field">
            <label className="mws-form-field-description">
              Recipe name
            </label>
            <input
              name="recipe_name"
              type="text"
              value={recipeForm.recipe_name}
              onChange={handleRecipeFormChange}
            />
          </div>
          <div className="mws-form-field">
            <label className="mws-form-field-description">
              Recipe description
            </label>
            <input
              name="description"
              type="text"
              value={recipeForm.description}
              onChange={handleRecipeFormChange}
            />
          </div>
          <div className="mws-form-field">
            <label className="mws-form-field-description">
              Bags in recipe (space separated)
            </label>
            <input
              name="bag_names"
              type="text"
              value={recipeForm.bag_names}
              onChange={handleRecipeFormChange}
            />
          </div>
        </div>
        <div className="mws-form-buttons">
          <button
            type="submit"
            disabled={isSubmitting.recipe}
          >
            {isSubmitting.recipe ? 'Processing...' : 'Create or Update Recipe'}
          </button>
        </div>
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

      <form className="mws-form" onSubmit={handleBagSubmit}>
        <div className="mws-form-heading">
          Create a new bag or modify and existing one
        </div>
        <div className="mws-form-fields">
          <div className="mws-form-field">
            <label className="mws-form-field-description">
              Bag name
            </label>
            <input
              name="bag_name"
              type="text"
              value={bagForm.bag_name}
              onChange={handleBagFormChange}
            />
          </div>
          <div className="mws-form-field">
            <label className="mws-form-field-description">
              Bag description
            </label>
            <input
              name="description"
              type="text"
              value={bagForm.description}
              onChange={handleBagFormChange}
            />
          </div>
        </div>
        <div className="mws-form-buttons">
          <button
            type="submit"
            disabled={isSubmitting.bag}
          >
            {isSubmitting.bag ? 'Processing...' : 'Create or Update Bag'}
          </button>
        </div>
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

export default Dashboard;
