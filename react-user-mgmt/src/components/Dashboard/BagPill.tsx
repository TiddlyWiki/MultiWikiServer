import React from 'react';

interface BagPillProps {
  bagName: string | undefined;
  isTopmost?: boolean;
  elementTag?: 'span' | 'li';
}

export default function BagPill({
  bagName,
  isTopmost = false,
  elementTag = 'span'
}: BagPillProps): React.ReactNode | Promise<React.ReactNode> {

  const className = `mws-bag-pill ${isTopmost ? 'mws-bag-pill-topmost' : ''}`;

  if (bagName === undefined)
    return createBagPill(elementTag, className, "(unknown bag)", "", "/.system/missing-favicon.png");
  else
    return createBagPill(elementTag, className, bagName, `/bags/${encodeURIComponent(bagName)}`, `/bags/${encodeURIComponent(bagName)}/tiddlers/%24%3A%2Ffavicon.ico?fallback=/.system/missing-favicon.png`);

}


function createBagPill(Component: 'span' | 'li', className: string, bagName: string, link: string, img: string): React.ReactNode | Promise<React.ReactNode> {
  return (
    <Component className={className}>
      <a className="mws-bag-pill-link" href={link} rel="noopener noreferrer" target="_blank">
        <img alt={bagName} src={img} className="mws-favicon-small" />
        <span className="mws-bag-pill-label">{bagName}</span>
      </a>
    </Component>
  );
}

