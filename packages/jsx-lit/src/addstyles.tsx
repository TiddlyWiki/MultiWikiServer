import { CSSResultGroup } from 'lit';
import { JSXElement } from './JSXElement';
type target = (abstract new (...args: any[]) => JSXElement) & {
  styles?: CSSResultGroup;
}
export const addstyles = (styles: string) => (
  target: target,
  context: ClassDecoratorContext<target>
) => {
  const css = new CSSStyleSheet();
  css.replaceSync(styles);
  if (Array.isArray(target.styles)) {
    target.styles.push(css);
  } else if (target.styles) {
    target.styles = [target.styles, css];
  } else {
    target.styles = [css];
  }
};
