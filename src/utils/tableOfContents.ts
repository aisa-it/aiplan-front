import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import TableOfContentsNodeView from 'src/components/TableOfContentsNodeView.vue';

export const generateHeadingLinks = (items: []) => {
  const mappedItems = items.map((link: any) => ({
    text: link.textContent,
    index: link.itemIndex,
    level: link.level,
    originalLevel: link.originalLevel,
  }));
  const currentLevels = [];

  for (const item of mappedItems) {
    const { index, originalLevel } = item;

    if (currentLevels.length === 0) {
      for (let i = 0; i < originalLevel; i++) {
        currentLevels.push(i === originalLevel - 1 ? index : 1);
      }
    }

    const prevLevel = currentLevels.length;
    const levelDiff = originalLevel - prevLevel;

    if (levelDiff > 0) {
      for (let i = 0; i < levelDiff; i++) {
        currentLevels.push(1);
      }
      currentLevels[currentLevels.length - 1] = index;
    } else if (levelDiff < 0) {
      currentLevels.splice(originalLevel);
      currentLevels[currentLevels.length - 1] = index;
    } else {
      currentLevels[currentLevels.length - 1] = index;
    }

    item.index = `${currentLevels.join('.')}.`;
  }

  return mappedItems;
};

export const TableOfContentsCustom = Node.create({
  name: 'heading-links',
  group: 'block',
  content: 'block*',
  defining: true,
  editable: false,

  addAttributes() {
    return {
      links: {
        default: [],
        parseHTML: (element) =>
          JSON.parse(element.getAttribute('data-links') || '{}'),
        renderHTML: (attributes) => ({
          'data-links': JSON.stringify(attributes.links),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-heading-links]',
        getAttrs: (element) => ({
          links: element.getAttribute('data-links') || [],
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-heading-links': '' }, HTMLAttributes),
      0,
    ];
  },

  // @ts-expect-error: Tiptap custom command type mismatch is expected here
  addCommands() {
    return {
      setTableOfContents:
        () =>
        ({ commands, editor }: { commands: any; editor: any }) => {
          const mappedLinks = generateHeadingLinks(
            editor.extensionStorage.tableOfContents.content,
          );
          return commands.insertContent({
            type: this.name,
            attrs: {
              links: mappedLinks || [],
            },
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(TableOfContentsNodeView);
  },
});
