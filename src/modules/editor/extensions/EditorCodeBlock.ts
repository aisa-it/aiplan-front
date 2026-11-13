import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { all, createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import lua from 'highlight.js/lib/languages/lua';

import EditorCodeBlockNodeView from '../components/EditorCodeBlockNodeView.vue';

const lowlight = createLowlight(all);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('lua', lua);

export const EditorCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return VueNodeViewRenderer(EditorCodeBlockNodeView);
  },
}).configure({ lowlight, enableTabIndentation: true });
