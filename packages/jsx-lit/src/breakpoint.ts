/**
 * Breakpoint-related JavaScript functions
 * These functions are directly exported to the mdui global object for application use. 
 * When used internally by the framework, import from the @mdui/shared package to avoid circular dependencies
 */


const computedStyle = window.getComputedStyle(document.documentElement);
// Breakpoint corresponding width values
const getBreakpointValue = (breakpoint: string) => {
  const width = computedStyle
    .getPropertyValue(`--mdui-breakpoint-${breakpoint}`)
    .toLowerCase();
  return parseFloat(width);
};
const breakpointValues: { [key in Breakpoint]: number } = {
  xs: getBreakpointValue('xs'),
  sm: getBreakpointValue('sm'),
  md: getBreakpointValue('md'),
  lg: getBreakpointValue('lg'),
  xl: getBreakpointValue('xl'),
  xxl: getBreakpointValue('xxl'),
};
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
/**
 * Get a breakpoint object that can be used to determine the relationship between specified width, 
 * element width, or current window width and various breakpoint values
 *
 * * When no parameters are passed, gets the breakpoint object corresponding to the `window` width
 * * If a number is passed, gets the breakpoint object corresponding to that width value
 * * If a CSS selector is passed, gets the breakpoint object corresponding to the width of the selected element
 * * If an HTML element is passed, gets the breakpoint object corresponding to that element's width
 * * If a JQ object is passed, gets the breakpoint object corresponding to the width of the element in that JQ object
 *
 * The returned object contains the following methods:
 *
 * * `up(breakpoint)`: Determines if the current width is greater than the specified breakpoint value
 * * `down(breakpoint)`: Determines if the current width is less than the specified breakpoint value
 * * `only(breakpoint)`: Determines if the current width is within the specified breakpoint range
 * * `not(breakpoint)`: Determines if the current width is not within the specified breakpoint range
 * * `between(startBreakpoint, endBreakpoint)`: Determines if the current width is between the specified breakpoint values
 */
export const breakpoint = (containerWidth: number) => {

  // Get the next larger breakpoint than the specified breakpoint
  const getNextBreakpoint = (breakpoint: Breakpoint) => {
    switch (breakpoint) {
      case 'xs':
        return 'sm';
      case 'sm':
        return 'md';
      case 'md':
        return 'lg';
      case 'lg':
        return 'xl';
      case 'xl':
        return 'xxl';
    }
    throw new Error('The xxl breakpoint has no larger breakpoint');
  };
  return {
    /**
     * Whether the current width is greater than the specified breakpoint value
     * @param breakpoint
     */
    up(breakpoint: Breakpoint) {
      return containerWidth >= breakpointValues[breakpoint];
    },
    /**
     * Whether the current width is less than the specified breakpoint value
     * @param breakpoint
     */
    down(breakpoint: Breakpoint) {
      return containerWidth < breakpointValues[breakpoint];
    },
    /**
     * Whether the current width is within the specified breakpoint range
     * @param breakpoint
     */
    only(breakpoint: Breakpoint) {
      if (breakpoint === 'xxl') {
        return this.up(breakpoint);
      }
      else {
        return this.up(breakpoint) && this.down(getNextBreakpoint(breakpoint));
      }
    },
    /**
     * Whether the current width is not within the specified breakpoint range
     * @param breakpoint
     */
    not(breakpoint: Breakpoint) {
      return !this.only(breakpoint);
    },
    /**
     * Whether the current width is between the specified breakpoint values
     * @param startBreakpoint
     * @param endBreakpoint
     * @returns
     */
    between(startBreakpoint: Breakpoint, endBreakpoint: Breakpoint) {
      return this.up(startBreakpoint) && this.down(endBreakpoint);
    },
  };
};
