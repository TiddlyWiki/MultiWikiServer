import { JSXElement } from './JSXElement';

export const addstyles = (styles: string) => (
  target: typeof JSXElement,
  context: ClassDecoratorContext<typeof JSXElement>
) => {
  const css = new CSSStyleSheet();
  css.replaceSync(styles);
  target.styles = css;
};
