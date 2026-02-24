import { JSXElement } from './JSXElement';

export const addstyles = (styles: string) => (
  target: typeof JSXElement<any>,
  context: ClassDecoratorContext<typeof JSXElement<any>>
) => {
  const css = new CSSStyleSheet();
  css.replaceSync(styles);
  target.styles = css;
};
