import template from './template.html';
// TODO: find a better way to load css files
import style from '!!css-loader!./style.css';

export default `
<style>
  ${style}
</style>
${template}
`;
