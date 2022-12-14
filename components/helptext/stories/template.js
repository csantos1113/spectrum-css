import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';

import { generateSVG } from '@spectrum-css/preview/icons.js';

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
export const Template = ({ isDisabled, hideIcon, text, variant, size, className }) => {
  const classList = {};

  if (!className) className = 'spectrum-HelpText';
  classList[className] = true;

  [variant].forEach((value) => {
    if (value) classList[`${className}--${value}`] = true;
  });
  
  if (isDisabled) classList['is-disabled'] = true;
  if (size) classList[`${className}--size${size.toUpperCase()}`] = true;

  return html`
    <div class=${classMap(classList)}>
      ${!hideIcon ? generateSVG('Alert', size, ['spectrum-HelpText-validationIcon']) : ''}
      <div class=${`${className}-text`}>${text}</div>
    </div>
  `;
}