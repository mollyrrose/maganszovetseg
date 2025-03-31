import { Component, For, Show, createEffect } from 'solid-js';

import styles from './ReadsEditor.module.scss';
import { createStore } from 'solid-js/store';
import { Editor } from '@tiptap/core';
import ReadsEditorBlockSelector, { SelectorOption, blockSelectorOptions } from './ReadsEditorBlockSelector';
import ReadsLinkDialog from '../ReadsMentionDialog/ReadsLinkDialog';
import ReadsMentionDialog from '../ReadsMentionDialog/ReadsMentionDialog';
import { PrimalArticle, PrimalNote, PrimalUser } from '../../types/primal';
import { nip19 } from '../../lib/nTools';
import ReadsEditorTableSelector from './ReadsEditorTableSelector';
import ReadsEditorBubbleMenu from './ReadsEditorBubbleMenu';

export type FormatControls = {
  isBoldActive: boolean,
  isItalicActive: boolean,
  isStrikeActive: boolean,
  isUlineActive: boolean,
  isLinkActive: boolean,
  isCodeActive: boolean,
  enterLink: boolean,
  enterMention: boolean,
  headingLevel: number,
};

const ReadsEditorToolbar: Component<{
  id?: string,
  editor: Editor | undefined,
  onFileUpload: (file: File) => void,
  wysiwygMode: boolean,
  toggleEditorMode: () => void,
}> = (props) => {

  let contentFileUpload: HTMLInputElement | undefined;

  const [formatControls, updateFormatControls] = createStore<FormatControls>({
    isBoldActive: false,
    isItalicActive: false,
    isStrikeActive: false,
    isUlineActive: false,
    isLinkActive: false,
    isCodeActive: false,
    enterLink: false,
    enterMention: false,
    headingLevel: 0,
  });

  createEffect(() => {
    if (formatControls.enterLink) {
      setTimeout(() => {
        const input = document.getElementById('link_url') as HTMLInputElement | null;
        input?.focus();
      }, 10)
    }
  });

  createEffect(() => {
    const ed = props.editor;
    if (!ed) return;

    ed.off('selectionUpdate');
    ed.on('selectionUpdate', () => {

      let headingLevel = [1, 2, 3, 4, 5, 6].
        find(level => ed.isActive('heading', { level })) || 0;

      updateFormatControls(() => ({
        isBoldActive: ed.isActive('bold'),
        isItalicActive: ed.isActive('italic'),
        isStrikeActive: ed.isActive('strike'),
        isUlineActive: ed.isActive('underline'),
        headingLevel
      }))
    })
  });

  const onUploadContentImage = () => {
    if (!contentFileUpload) {
      return;
    }

    const file = contentFileUpload.files ? contentFileUpload.files[0] : null;

    if (!file) return;

    props.onFileUpload(file);
  }


  const bold = () => {
    props.editor?.chain().focus().toggleBold().run();
    updateFormatControls('isBoldActive', v => !v);
  }

  const italic = () => {
    props.editor?.chain().focus().toggleItalic().run();
    updateFormatControls('isItalicActive', v => !v);
  }

  const strike = () => {
    props.editor?.chain().focus().toggleStrike().run();
    updateFormatControls('isStrikeActive', v => !v);
  }

  const uline = () => {
    props.editor?.chain().focus().toggleUnderline().run();
    updateFormatControls('isUlineActive', v => !v);
  }

  const code = () => {
    props.editor?.chain().focus().toggleCode().run();
    updateFormatControls('isCodeActive', v => !v);
  }

  const quote = () => {
    props.editor?.chain().focus().toggleBlockquote().run();
    // updateFormatControls('isQuoteActive', v => !v);
  }

  const bulletList = () => {
    props.editor?.chain().focus().toggleBulletList().run();
    // updateFormatControls('isBulletActive', v => !v);
  }

  const orderedList = () => {
    props.editor?.chain().focus().toggleOrderedList().run();
    // updateFormatControls('isOrderedActive', v => !v);
  }

  const link = (href: string, title: string) => {
    const editor = props.editor;

    if (!editor) return;

    if (href === '') {
      editor.
        chain().
        focus().
        extendMarkRange('link').
        unsetLink().
        run();
      return
    }

    editor.
      chain().
      focus().
      extendMarkRange('link').
      setLink({ href }).
      command(({ tr }) => {
        title && tr.insertText(title)
        return true
      }).
      insertContent({ type: 'text', text: ' '}).
      run();

    editor.commands.unsetMark('link');
  }

  const heading = (option: SelectorOption) => {
    const level = option?.index || 0;
    updateFormatControls('headingLevel', () => level);

    if (level === 0) {
      props.editor?.chain().focus().setParagraph().run();
      return;
    }

    if (level > 0 && level < 7) {
      // @ts-ignore
      props.editor?.chain().focus().setHeading({ level }).run();
      return;
    }

    if (level === 7) {
      code();
    }

    if (level === 8) {
      quote();
    }
  }

  const table = (rows: number, cols: number) => {
    props.editor?.chain().focus().insertTable({rows, cols, withHeaderRow: false}).run();
  }

  const addMentionToEditor = (user: PrimalUser, relays: string[]) => {
    const editor = props.editor;
    if (!editor) return;

    let pInfo: nip19.ProfilePointer = { pubkey: user.pubkey };

    if (relays.length > 0) {
      pInfo.relays = [...relays];
    }

    const nprofile = nip19.nprofileEncode(pInfo);

    editor
      .chain()
      .focus()
      .insertNProfile({ nprofile, user, relays})
      .insertContent({ type: 'text', text: ' ' })
      .run()
  }

  const addNoteToEditor = (note: PrimalNote) => {
    const editor = props.editor;
    if (!editor) return;

    const nevent = note.noteId;

    editor
      .chain()
      .focus()
      .insertNEvent({ nevent })
      .run()
  }

  const addReadToEditor = (read: PrimalArticle) => {
    const editor = props.editor;
    if (!editor) return;

    const naddr = read.noteId;

    editor
      .chain()
      .focus()
      .insertNAddr({ naddr })
      .run()
  }


  return (
    <div>

      <div class={styles.toolbar}>
        <div>

          <ReadsEditorBlockSelector
            value={blockSelectorOptions[formatControls.headingLevel]}
            options={blockSelectorOptions}
            onChange={heading}
            short={true}
          />

          <button
            id="boldBtn"
            class={`${styles.mdToolButton} ${formatControls.isBoldActive ? styles.selected : ''}`}
            onClick={bold}
            title="bold"
          >
            <div class={styles.boldIcon}></div>
          </button>

          <button
            id="italicBtn"
            class={`${styles.mdToolButton} ${formatControls.isItalicActive ? styles.selected : ''}`}
            onClick={italic}
            title="italic"
          >
            <div class={styles.italicIcon}></div>
          </button>

          <button
            id="ulineBtn"
            class={`${styles.mdToolButton} ${formatControls.isUlineActive ? styles.selected : ''}`}
            onClick={uline}
            title="underline"
          >
            <div class={styles.ulineIcon}></div>
          </button>

          <button
            id="strikeBtn"
            class={`${styles.mdToolButton} ${formatControls.isStrikeActive ? styles.selected : ''}`}
            onClick={strike}
            title="strike"
          >
            <div class={styles.strikeIcon}></div>
          </button>

          <button
            id="bulletListBtn"
            class={`${styles.mdToolButton}`}
            onClick={bulletList}
            title="bullet list"
          >
            <div class={styles.bulletListIcon}></div>
          </button>

          <button
            id="orderedListBtn"
            class={`${styles.mdToolButton}`}
            onClick={orderedList}
            title="ordered list"
          >
            <div class={styles.orderedListIcon}></div>
          </button>

          <ReadsEditorTableSelector
            onSelect={table}
          />

          <button
            id="linkBtn"
            class={`${styles.mdToolButton} ${formatControls.isLinkActive ? styles.selected : ''}`}
            onClick={() => {
              const editor = props.editor;
              if (!editor) return;

              let linak = editor.getAttributes('link').href;

              if (linak) {
                editor.chain().unsetLink().run();
                return;
              }

              updateFormatControls('enterLink', () => true);
            }}
            title="link"
          >
            <div class={styles.linkIcon}></div>
          </button>

          <button
            id="mentionBtn"
            class={`${styles.mdToolButton}`}
            onClick={() => {
              updateFormatControls('enterMention', () => true);
            }}
            title="mention"
          >
            <div class={styles.atIcon}></div>
          </button>

          <div
            id="attachBtn"
            class={styles.mdToolButton}
            title="image"
          >
            <input
              id="upload-content"
              type="file"
              onChange={onUploadContentImage}
              ref={contentFileUpload}
              hidden={true}
              accept="image/*,video/*,audio/*"
            />
            <label for={'upload-content'} class={`attach_icon ${styles.attachIcon}`}>
            </label>
          </div>
        </div>
        <button
          id="editorMode"
          class={`${styles.mdToolButton} ${!props.wysiwygMode ? styles.selected : ''}`}
          onClick={props.toggleEditorMode}
          title={!props.wysiwygMode ? 'switch to wysiwyg mode' : 'switch to plain text mode'}
        >
          <Show
            when={props.wysiwygMode}
            fallback={<div class={styles.modeIcon}></div>}
          >
            <div class={`${styles.modeIcon} ${styles.active}`}></div>
          </Show>
        </button>
      </div>

      <ReadsEditorBubbleMenu
        editor={props.editor}
        store={formatControls}
        commands={{
          bold,
          italic,
          uline,
          strike,
        }}
      />

      <ReadsLinkDialog
        open={formatControls.enterLink}
        setOpen={(v: boolean) => updateFormatControls('enterLink', () => v)}
        editor={props.editor}
        onSubmit={(url: string, label:string) => {
          link(url, label);
          updateFormatControls('enterLink', () => false);
        }}
      />

      <ReadsMentionDialog
        open={formatControls.enterMention}
        setOpen={(v: boolean) => updateFormatControls('enterMention', () => v)}
        onAddUser={(user: PrimalUser, relays: string[]) => {
          addMentionToEditor(user, relays);
          updateFormatControls('enterMention', () => false);
        }}
        onAddNote={(note: PrimalNote) => {
          addNoteToEditor(note);
          updateFormatControls('enterMention', () => false);
        }}
        onAddRead={(read: PrimalArticle) => {
          addReadToEditor(read);
          updateFormatControls('enterMention', () => false);
        }}
      />
    </div>
  );
}

export default ReadsEditorToolbar;