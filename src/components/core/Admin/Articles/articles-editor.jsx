"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { uploadArticleImage } from "../../../../services/operations/articelsAPI";

const ArticlesEditor = ({ content, onChange, placeholder = "Write your article content here..." }) => {
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  // Load Quill and dependencies from CDN
  useEffect(() => {
    const loadCSS = (href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadAllResources = async () => {
      try {
        loadCSS("https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css");
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css");
        loadCSS("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css");

        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js");
        await loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js");

        setIsMounted(true);
      } catch (error) {
        console.error("Failed to load Quill resources:", error);
      }
    };

    loadAllResources();
  }, []);

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ql-editor {
        min-height: 300px;
        font-size: 16px;
      }
      .ql-container {
        font-family: inherit;
      }
      .ql-editor h1 {
        font-size: 2rem;
        font-weight: bold;
      }
      .ql-editor h2 {
        font-size: 1.5rem;
        font-weight: bold;
      }
      .ql-editor pre.ql-syntax {
        background-color: #23241f;
        color: #f8f8f2;
        overflow: visible;
        padding: 1rem;
        border-radius: 0.5rem;
      }
      .ql-editor img {
        max-width: 100%;
        height: auto;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ql-editor img:hover {
        outline: 2px solid #3b82f6;
      }
      .image-wrapper {
        position: relative;
        display: inline-block;
        max-width: 100%;
      }
      .image-wrapper .delete-image-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        z-index: 101;
        transition: all 0.2s ease;
      }
      .image-wrapper .delete-image-btn:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
      .ql-font-sansserif {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .ql-font-serif {
        font-family: Georgia, "Times New Roman", Times, serif;
      }
      .ql-font-monospace {
        font-family: "Courier New", Courier, monospace;
      }
      .ql-font-times {
        font-family: "Times New Roman", Times, serif;
      }
      .ql-font-arial {
        font-family: Arial, Helvetica, sans-serif;
      }
      .ql-font-verdana {
        font-family: Verdana, Geneva, sans-serif;
      }
      .ql-font-georgia {
        font-family: Georgia, "Times New Roman", serif;
      }
      .ql-font-roboto {
        font-family: "Roboto", "Segoe UI", sans-serif;
      }
      .ql-font-lato {
        font-family: "Lato", "Segoe UI", sans-serif;
      }
      
      /* Font Dropdown Labels */
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value]::before {
        content: attr(data-value);
      }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="sansserif"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="sansserif"]::before { content: "Sans Serif"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before { content: "Serif"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before { content: "Monospace"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times"]::before { content: "Times New Roman"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content: "Arial"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before { content: "Verdana"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before { content: "Georgia"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before { content: "Roboto"; }
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="lato"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="lato"]::before { content: "Lato"; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Keep onChange fresh for listeners
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Add image controls (Google Docs style overlay)
  const addImageControls = () => {
    if (!editorRef.current) return;
    const editorNode = editorRef.current;
    
    let overlay = document.getElementById('quill-image-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'quill-image-overlay';
      Object.assign(overlay.style, {
        position: 'absolute',
        boxSizing: 'border-box',
        border: '2px solid #1a73e8',
        display: 'none',
        zIndex: '100',
        pointerEvents: 'none'
      });
      
      const handles = ['nw', 'ne', 'sw', 'se'];
      handles.forEach(pos => {
        const handle = document.createElement('div');
        handle.dataset.pos = pos;
        Object.assign(handle.style, {
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid #1a73e8',
          pointerEvents: 'auto',
          cursor: `${pos}-resize`
        });
        if (pos.includes('n')) handle.style.top = '-5px';
        if (pos.includes('s')) handle.style.bottom = '-5px';
        if (pos.includes('w')) handle.style.left = '-5px';
        if (pos.includes('e')) handle.style.right = '-5px';
        
        handle.addEventListener('mousedown', (e) => {
          if (!window.__activeQuillImage) return;
          window.__isQuillResizing = true;
          window.__quillStartX = e.clientX;
          window.__quillStartWidth = window.__activeQuillImage.offsetWidth;
          window.__quillHandlePos = pos;
          e.preventDefault();
          e.stopPropagation();
        });
        overlay.appendChild(handle);
      });
      
      editorNode.parentNode.style.position = 'relative';
      editorNode.parentNode.appendChild(overlay);

      // Global listeners for drag and click-away
      const updateOverlay = () => {
        if (!window.__activeQuillImage || !overlay) return;
        const imgRect = window.__activeQuillImage.getBoundingClientRect();
        const parentRect = editorNode.parentNode.getBoundingClientRect();
        Object.assign(overlay.style, {
          top: `${imgRect.top - parentRect.top + editorNode.parentNode.scrollTop}px`,
          left: `${imgRect.left - parentRect.left + editorNode.parentNode.scrollLeft}px`,
          width: `${imgRect.width}px`,
          height: `${imgRect.height}px`,
          display: 'block'
        });
      };

      document.addEventListener('click', (e) => {
        if (window.__activeQuillImage && e.target !== window.__activeQuillImage && !overlay.contains(e.target)) {
          window.__activeQuillImage = null;
          overlay.style.display = 'none';
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!window.__isQuillResizing || !window.__activeQuillImage) return;
        let deltaX = e.clientX - window.__quillStartX;
        if (window.__quillHandlePos.includes('w')) deltaX = -deltaX;
        const newWidth = Math.max(50, window.__quillStartWidth + deltaX);
        window.__activeQuillImage.setAttribute('width', newWidth);
        updateOverlay();
      });

      window.addEventListener('mouseup', () => {
        if (window.__isQuillResizing) {
          window.__isQuillResizing = false;
          if (quillInstance.current && onChangeRef.current) {
            onChangeRef.current(quillInstance.current.root.innerHTML);
          }
        }
      });
      
      // Update overlay on scroll or editor changes
      const observer = new ResizeObserver(() => updateOverlay());
      observer.observe(editorNode.parentNode);
    }

    const images = editorNode.querySelectorAll('img');
    images.forEach(img => {
      img.style.cursor = 'pointer';
      if (!img.hasAttribute('data-overlay-added')) {
        img.setAttribute('data-overlay-added', 'true');
        img.addEventListener('click', (e) => {
          window.__activeQuillImage = img;
          
          const imgRect = img.getBoundingClientRect();
          const parentRect = editorNode.parentNode.getBoundingClientRect();
          Object.assign(overlay.style, {
            top: `${imgRect.top - parentRect.top + editorNode.parentNode.scrollTop}px`,
            left: `${imgRect.left - parentRect.left + editorNode.parentNode.scrollLeft}px`,
            width: `${imgRect.width}px`,
            height: `${imgRect.height}px`,
            display: 'block'
          });
          e.stopPropagation();
        });
      }
    });
  };

  // Initialize Quill editor
  useEffect(() => {
    if (!isMounted || !editorRef.current || quillInstance.current) return;

    // Clean up any orphaned toolbars from strict mode or HMR
    const cleanupOldToolbars = () => {
      const oldManualToolbar = document.getElementById('toolbar-container');
      if (oldManualToolbar) oldManualToolbar.remove();
      
      if (editorRef.current && editorRef.current.parentNode) {
        const generatedToolbars = editorRef.current.parentNode.querySelectorAll('.ql-toolbar');
        generatedToolbars.forEach(toolbar => toolbar.remove());
      }
    };

    const initEditor = () => {
      if (window.Quill && editorRef.current) {
        try {
          cleanupOldToolbars();

          // Register custom fonts
          const Font = window.Quill.import('formats/font');
          const fonts = ['sansserif', 'serif', 'monospace', 'times', 'arial', 'verdana', 'georgia', 'roboto', 'lato'];
          Font.whitelist = fonts;
          window.Quill.register(Font, true);

          // Extend Image Blot to support width and height
          const BaseImageFormat = window.Quill.import('formats/image');
          class CustomImageFormat extends BaseImageFormat {
            static formats(domNode) {
              return ['alt', 'height', 'width', 'style'].reduce(function(formats, attribute) {
                if (domNode.hasAttribute(attribute)) {
                  formats[attribute] = domNode.getAttribute(attribute);
                }
                return formats;
              }, {});
            }
            format(name, value) {
              if (['alt', 'height', 'width', 'style'].indexOf(name) > -1) {
                if (value) {
                  this.domNode.setAttribute(name, value);
                } else {
                  this.domNode.removeAttribute(name);
                }
              } else {
                super.format(name, value);
              }
            }
          }
          window.Quill.register(CustomImageFormat, true);

          const toolbarOptions = [
            [{ 'font': fonts }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video', 'formula'],
            ['clean']
          ];

          const imageHandler = () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              const loadingToast = toast.loading("Uploading image...");
              try {
                const res = await uploadArticleImage(file);
                if (res?.success && res?.url) {
                  const range = quillInstance.current ? quillInstance.current.getSelection(true) : { index: 0 };
                  quillInstance.current.insertEmbed(range.index, 'image', res.url);
                  quillInstance.current.setSelection(range.index + 1);
                  toast.success("Image uploaded successfully!", { id: loadingToast });
                } else {
                  toast.error(res?.message || "Failed to upload image", { id: loadingToast });
                }
              } catch (err) {
                console.error("Image upload error:", err);
                toast.error("Error uploading image: " + (err.message || "Failed"), { id: loadingToast });
              }
            };
          };

          quillInstance.current = new window.Quill(editorRef.current, {
            modules: {
              syntax: true,
              toolbar: {
                container: toolbarOptions,
                handlers: {
                  image: imageHandler,
                }
              },
              formula: true,
            },
            placeholder: placeholder,
            theme: 'snow',
          });

          // Set initial content
          if (content) {
            quillInstance.current.root.innerHTML = content;
          }

          setTimeout(addImageControls, 100);

          // Listen for content changes
          quillInstance.current.on('text-change', () => {
            const html = quillInstance.current.root.innerHTML;
            onChange(html);
            setTimeout(addImageControls, 50);
          });

        } catch (error) {
          console.error("Failed to initialize Quill:", error);
        }
      } else {
        setTimeout(initEditor, 100);
      }
    };

    initEditor();

    return () => {
      // Cleanup when component unmounts
      if (quillInstance.current) {
        quillInstance.current = null;
      }
      cleanupOldToolbars();
    };
  }, [isMounted, placeholder]);

  // Sync content prop changes into editor
  useEffect(() => {
    if (quillInstance.current && content !== undefined) {
      const currentContent = quillInstance.current.root.innerHTML;
      if (currentContent !== content) {
        quillInstance.current.root.innerHTML = content;
        setTimeout(addImageControls, 100);
      }
    }
  }, [content]);

  if (!isMounted) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-200">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={editorRef}
        id="editor"
        style={{ height: '400px' }}
      />
    </div>
  );
};

export default ArticlesEditor;