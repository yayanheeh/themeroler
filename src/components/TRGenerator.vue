<i18n>
en:
  generate: "Generate and Download"
  description: >
    You can also remove components you don't need
    from your custom CSS file. What should be included?
ja:
  generate: "生成 & ダウンロード"
  description: >
    カスタム CSS ファイルに含めるコンポーネントを選択してください。
    不要なコンポーネントは除外することができます。
</i18n>

<template>
  <div class="tr-generator">
    <div class="tr-generator__message">
      {{ $t('description') }}
    </div>

    <div class="tr-generator__components">
      <ul class="scrollable">
        <li
          v-for="component in fullComponentsList"
          :key="`${version}-${component}`"
        >
          <label>
            <a>
              <TRCheckbox
                :value="component"
                v-model="selectedComponents"
              />
              <span>{{ component | capitalizeAll }}</span>
            </a>
          </label>
        </li>
      </ul>
    </div>

    <div class="tr-generator__toolbar">
      <TRButton
        icon="download"
        :label="$t('generate')"
        :loading="loading === 'generator'"
        @click="loading = 'generator'; generate()"
      />
    </div>

  </div>
</template>

<script>
import CSSProcessor from '@/css-processor';
import TRButton from '@/components/TRButton';
import TRCheckbox from '@/components/TRCheckbox';
import { mapMutationState } from '@/store';
import util from '@/util';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const re = /(global|util|combination)/i;

export default {
  name: 'TRGenerator',
  components: {
    TRButton,
    TRCheckbox,
  },
  filters: {
    capitalizeAll(string) {
      return util.capitalizeAll(string);
    },
  },
  data() {
    return {
      components: null,
    };
  },
  computed: {
    ...mapMutationState([
      'customTheme',
      'fullComponentsIndex',
      'loading',
      'rootCSS',
      'theme',
      'version',
    ]),
    fullComponentsList() {
      return (this.fullComponentsIndex
        .match(/'([./-\w]+)\.css'/img) || [])
        .filter(m => !re.test(m))
        .map(m => util.toLabel(m.slice(3, -5)))
        .sort();
    },
    selectedComponents: {
      get() {
        return this.components
          ? this.components
          : this.fullComponentsList;
      },
      set(value) {
        this.components = value;
      },
    },
  },

  methods: {
    generate() {
      const includedComponents = this.selectedComponents
        .map(c => `${util.toId(c)}.css`);

      const index = this.fullComponentsIndex
        .split('\n')
        .filter(line => re.test(line)
          || includedComponents.some(c => line.indexOf(c) !== -1))
        .join('\n');

      const precss = CSSProcessor
        .replace(this.rootCSS, this.theme, index);

      CSSProcessor
        .compile(precss)
        .then((css) => {
          const zip = new JSZip();
          zip.file('readme.md', `
            Generated by Onsen UI Theme Roller (https://onsenui.github.io/theme-roller)
            for Onsen UI version ${this.version}.

            Copy 'theme.css' content in Bulk Editor to further modify the theme.`);

          const banner = `/* Custom Theme for Onsen UI ${this.version} */\n\n`;

          zip.file('onsen-css-components.css', banner + css);
          zip.file('theme.css', banner + this.customTheme);

          CSSProcessor
            .minify(css)
            .then((mincss) => {
              zip.file('onsen-css-components.min.css', banner + mincss);
              zip.generateAsync({ type: 'blob' })
                .then((content) => {
                  FileSaver.saveAs(content, 'onsen-css-theme.zip');
                  setTimeout(() => { this.loading = false; }, 100);
                });
            });
        });
    },
  },
};
</script>

<style scoped>
.tr-generator {

}
.tr-generator__message {
  padding: 6px 60px 0 var(--content-padding);
  margin-bottom: calc(var(--content-padding) / 2);
}

.tr-generator__toolbar {
  padding: var(--content-padding);
  display: flex;
  justify-content: flex-end;
}

.tr-generator__components {
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: var(--scroll-margin);
  height: 300px;

  & ul {
    padding: 0;
    margin: 0;
    padding: calc(var(--content-padding) / 2);
    height: 100%;
    box-sizing: border-box;

    & li:hover {
      background-color: var(--list-item-hover);
    }
  }
}

.tr-generator__components a {
  @apply --list-item;
  justify-content: flex-start;

  & span {
    padding-left: var(--checkbox-padding);
  }
}
</style>
