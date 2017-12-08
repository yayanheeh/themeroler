import postcss from 'postcss';
import postcssCssnext from 'postcss-cssnext';
import postcssUrlResolver from 'postcss-url-resolver';
import api from '@/api';
import store from '@/store';

const { browserslist } = store.state;

const run = ({
  from = '',
  base64 = false,
  exclude = null,
  css = `@import url('${from}');`,
  cssnext = false,
} = {}) => {
  const plugins = [];

  if (from) {
    plugins.push(postcssUrlResolver({
      request: opt => api.get(opt.href),
      base64,
      exclude,
    }));
  }

  if (cssnext) {
    plugins.push(postcssCssnext({ browserslist }));
  }

  // Postcss is synchronous...
  return new Promise((resolve) => {
    setTimeout(() =>
      resolve(postcss(plugins)
        .process(css, { from })
        .then(result => result.css)));
  });
};

export default {
  get(from) {
    return run({
      from,
      base64: true,
      exclude: /(theme|components\/index).css$/,
    });
  },
  compile(css) {
    return run({
      css,
      base64: true,
      cssnext: true,
      from: api.urls.componentsIndex(store.state.version),
    });
  },
  replace(css, theme, index) {
    return css
      .replace(/^(\s*@import.+theme\.css.+\n)/m, theme)
      .replace(/^(\s*@import.+components\/index\.css.+)$/m, index);
  },
};