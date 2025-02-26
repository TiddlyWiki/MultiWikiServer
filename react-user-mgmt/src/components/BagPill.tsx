import React from 'react';

interface BagPillProps {
  bagName: string;
  isTopmost?: boolean;
  elementTag?: 'span' | 'li';
}

const BagPill: React.FC<BagPillProps> = ({
  bagName,
  isTopmost = false,
  elementTag = 'span'
}) => {
  const Component = elementTag as any;
  const className = `mws-bag-pill ${isTopmost ? 'mws-bag-pill-topmost' : ''}`;

  return (
    <Component className={className}>
      <a className="mws-bag-pill-link" href={`/bags/${encodeURIComponent(bagName)}`} rel="noopener noreferrer" target="_blank">
        <img
          src={`/bags/${encodeURIComponent(bagName)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`}
          className="mws-favicon-small"
          alt=""
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src="/missing-favicon.png";
          }}
        />
        <span className="mws-bag-pill-label">
          {bagName}
        </span>
      </a>
    </Component>
  );
};



export default BagPill;
