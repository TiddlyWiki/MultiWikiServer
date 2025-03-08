import React from 'react';
import BagPill from './BagPill';

interface WikiCardProps {
  recipeName: string;
  description: string;
  bags: { bag_id: number; position: number; bag_name: string | undefined; }[];
  hasAclAccess: boolean;
  showSystem: boolean;
}

export default function WikiCard({
  recipeName,
  description,
  bags,
  hasAclAccess,
  showSystem
}: WikiCardProps): React.ReactNode | Promise<React.ReactNode> {
  // Filter system bags if needed
  const filteredBags = showSystem ? bags.slice() : bags.filter(bag => !bag.bag_name || !bag.bag_name.startsWith("$:/"));

  return (
    <div className="mws-wiki-card">
      <div className="mws-wiki-card-image">
        <img
          src={`/recipes/${encodeURIComponent(recipeName)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`}
          className="mws-favicon"
          // alt=""
          // onError={({ currentTarget }) => {
          //   currentTarget.onerror = null; // prevents looping
          //   currentTarget.src = "/missing-favicon.png";
          // }}
        />
      </div>
      <div className="mws-wiki-card-content">
        <div className="mws-wiki-card-header">
          <a
            href={`/wiki/${encodeURIComponent(recipeName)}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {recipeName}
          </a>
        </div>
        <div className="mws-wiki-card-meta">
          {filteredBags.length > 0 ? (
            <ol className="mws-vertical-list">
              {filteredBags.map((bag, index) => (
                <BagPill
                  key={bag.bag_id}
                  bagName={bag.bag_name}
                  isTopmost={index === 0}
                  elementTag="li"
                />
              ))}
            </ol>
          ) : (
            "(no bags defined)"
          )}
        </div>
        <div className="mws-wiki-card-description">
          {description}
        </div>
      </div>
      <div className="mws-wiki-card-actions">
        {hasAclAccess && (
          <a
            href={`/admin/acl/${recipeName}`}
            className="mws-wiki-card-action"
            title="Manage ACL"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

