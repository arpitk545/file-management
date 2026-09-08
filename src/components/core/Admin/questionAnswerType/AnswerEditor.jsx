"use client";

import { useState, useEffect, useRef } from "react";

// ─── Quill Rich Text Editor ───────────────────────────────────────────────────
const QuillEditor = ({ content, onChange, placeholder = "Write your answer here...", height = 160 }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const handleTableModalRef = useRef(null);
  const savedSelectionRef = useRef(null);
  
  handleTableModalRef.current = () => {
    if (quillInstance.current) {
      savedSelectionRef.current = quillInstance.current.getSelection() || { index: quillInstance.current.getLength() - 1, length: 0 };
    }
    setIsTableModalOpen(true);
  };
  
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const toolbarId = useRef(`toolbar-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const loadCSS = (href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    };
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    const load = async () => {
      try {
        loadCSS("https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css");
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css");
        loadCSS("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js");
        await loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js");
        setIsMounted(true);
      } catch (e) {
        console.error("Failed to load Quill", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .ql-editor { min-height: 80px; font-size: 15px; line-height: 1.6; }
      .ql-editor.ql-blank::before { font-style: italic; color: #9ca3af; }
      .ql-editor pre.ql-syntax { background:#23241f; color:#f8f8f2; padding:1rem; border-radius:0.5rem; font-size:13px; }
      .ql-editor img { max-width:100%; height:auto; cursor:pointer; border-radius:4px; }
      .ql-editor img:hover { outline:2px solid #3b82f6; }
      .ql-editor table { border-collapse: collapse; margin-bottom: 1em; width: 100%; }
      .ql-editor td, .ql-editor th { border: 1px solid #d1d5db; padding: 8px; min-width: 50px; }
      .image-wrapper { position:relative; display:inline-block; max-width:100%; }
      .image-wrapper .delete-image-btn { position:absolute; top:-10px; right:-10px; background:#ef4444; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; z-index:101; transition:all 0.2s; }
      .image-wrapper .delete-image-btn:hover { background:#dc2626; transform:scale(1.1); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const addImageControls = () => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll("img").forEach((img) => {
      if (img.hasAttribute("data-controls-added")) return;
      img.setAttribute("data-controls-added", "true");
      const wrapper = document.createElement("div");
      wrapper.className = "image-wrapper";
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-image-btn";
      deleteBtn.innerHTML = "✕";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        wrapper?.parentNode?.removeChild(wrapper);
        if (quillInstance.current) onChange(quillInstance.current.root.innerHTML);
        return false;
      };
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      wrapper.appendChild(deleteBtn);

      let isResizing = false, startX, startWidth;
      img.style.cursor = "nw-resize";
      img.addEventListener("mousedown", (e) => {
        if (e.target === deleteBtn) return;
        isResizing = true; startX = e.clientX; startWidth = img.offsetWidth;
        e.preventDefault(); e.stopPropagation();
      });
      window.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        const w = startWidth + (e.clientX - startX);
        if (w > 50) { img.style.width = w + "px"; img.style.height = "auto"; if (quillInstance.current) onChange(quillInstance.current.root.innerHTML); }
      });
      window.addEventListener("mouseup", () => { isResizing = false; });
    });
  };

  useEffect(() => {
    if (!isMounted || !editorRef.current || quillInstance.current) return;

    const init = () => {
      if (!window.Quill || !editorRef.current) return setTimeout(init, 100);
      try {
        const toolbar = document.createElement("div");
        toolbar.id = toolbarId.current;
        toolbar.innerHTML = `
          <span class="ql-formats">
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <button class="ql-underline"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-script" value="sub"></button>
            <button class="ql-script" value="super"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-list" value="ordered"></button>
            <button class="ql-list" value="bullet"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-code-block"></button>
            <button class="ql-formula"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-table" title="Insert Table">
              <svg viewBox="0 0 18 18">
                <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
                <line class="ql-stroke" x1="3" x2="15" y1="7" y2="7"></line>
                <line class="ql-stroke" x1="3" x2="15" y1="11" y2="11"></line>
                <line class="ql-stroke" x1="7" x2="7" y1="3" y2="15"></line>
                <line class="ql-stroke" x1="11" x2="11" y1="3" y2="15"></line>
              </svg>
            </button>
          </span>
          <span class="ql-formats">
            <button class="ql-clean"></button>
          </span>
        `;
        editorRef.current.parentNode.insertBefore(toolbar, editorRef.current);

        quillInstance.current = new window.Quill(editorRef.current, {
          modules: {
            syntax: true,
            table: true,
            toolbar: {
              container: `#${toolbarId.current}`,
              handlers: {
                table: function () {
                  if (handleTableModalRef.current) handleTableModalRef.current();
                },
                image: function () {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");
                  input.click();
                  input.onchange = () => {
                    const file = input.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const range = quillInstance.current.getSelection(true);
                      quillInstance.current.insertEmbed(range.index, "image", ev.target.result);
                      setTimeout(addImageControls, 100);
                      onChange(quillInstance.current.root.innerHTML);
                    };
                    reader.readAsDataURL(file);
                  };
                },
              },
            },
            formula: true,
          },
          placeholder,
          theme: "snow",
        });

        if (content) quillInstance.current.root.innerHTML = content;
        setTimeout(addImageControls, 100);

        quillInstance.current.on("text-change", () => {
          onChange(quillInstance.current.root.innerHTML);
          setTimeout(addImageControls, 50);
        });
      } catch (e) {
        console.error("Quill init error", e);
      }
    };
    init();
  }, [isMounted, placeholder]);

  useEffect(() => {
    if (quillInstance.current && content !== undefined) {
      if (quillInstance.current.root.innerHTML !== content) {
        quillInstance.current.root.innerHTML = content;
        setTimeout(addImageControls, 100);
      }
    }
  }, [content]);

  if (!isMounted)
    return (
      <div className="w-full bg-white rounded border border-gray-200 flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-gray-400 text-sm">Loading editor...</div>
      </div>
    );

  return (
    <div className="w-full relative">
      {isTableModalOpen && (
        <div className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-md p-3 left-4 top-14 flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Rows</label>
              <input type="number" min="1" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} className="border border-gray-300 rounded px-2 py-1 w-16 text-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Cols</label>
              <input type="number" min="1" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} className="border border-gray-300 rounded px-2 py-1 w-16 text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                if (savedSelectionRef.current && quillInstance.current) {
                  quillInstance.current.setSelection(savedSelectionRef.current);
                }
                const table = quillInstance.current?.getModule("table");
                if (table) table.insertTable(tableRows, tableCols);
                onChange(quillInstance.current.root.innerHTML);
                setIsTableModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => {
                if (savedSelectionRef.current && quillInstance.current) {
                  quillInstance.current.setSelection(savedSelectionRef.current);
                }
                const table = quillInstance.current?.getModule("table");
                if (table) table.deleteTable();
                onChange(quillInstance.current.root.innerHTML);
                setIsTableModalOpen(false);
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div ref={editorRef} style={{ height }} />
    </div>
  );
};

// ─── Main AnswerEditor ──────────────────────────────────────────────────────
const AnswerEditor = ({ content, onChange, placeholder = "Write your answer here..." }) => {
  const [answerText, setAnswerText] = useState(content || "");

  const handleTextChange = (html) => {
    setAnswerText(html);
    onChange(html); // Send just the HTML string to parent
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        {/* <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Answer</p> */}
        <QuillEditor
          content={answerText}
          onChange={handleTextChange}
          placeholder={placeholder}
          height={160}
        />
      </div>
    </div>
  );
};

export default AnswerEditor;