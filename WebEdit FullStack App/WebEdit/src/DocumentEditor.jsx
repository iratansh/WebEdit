import React, { useState, useRef, useEffect } from "react";
import NestedNavbar from "./NestedNavbar";
import HelpMenu from "./HelpMenu";
import NavigationBar from "./Navbar";
import "./DocumentEditor.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function GoogleDoc() {
  const [showHelp, setShowHelp] = useState(false);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    highlight: false,
    fontColor: false,
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const contentEditableRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showResizeDialog, setShowResizeDialog] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [lastTabPosition, setLastTabPosition] = useState(null);

  useEffect(() => {
    const handleTabPress = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        if (
          contentEditableRef.current &&
          contentEditableRef.current.contains(document.activeElement)
        ) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const currentNode = range.startContainer;
            const startOffset = range.startOffset;

            if (currentNode.nodeType === Node.TEXT_NODE) {
              const textContent = currentNode.textContent;
              let wordBoundary = textContent.indexOf(" ", startOffset);

              if (wordBoundary === -1) {
                wordBoundary = textContent.length;
              }

              const beforeCursor = textContent.slice(0, startOffset);
              const afterCursor = textContent.slice(startOffset);

              currentNode.textContent =
                beforeCursor + "\u00A0\u00A0\u00A0\u00A0" + afterCursor;

              range.setStart(currentNode, startOffset + 4);
              range.setEnd(currentNode, startOffset + 4);
              setLastTabPosition({ node: currentNode, startOffset, length: 4 });
            } else {
              const tabTextNode = document.createTextNode(
                "\u00A0\u00A0\u00A0\u00A0"
              ); 
              range.insertNode(tabTextNode);
              range.setStartAfter(tabTextNode);
              range.collapse(true); 
              setLastTabPosition({
                node: tabTextNode,
                startOffset: 0,
                length: 4,
              });
            }
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };

    const handleUndoPress = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if (
        (isMac && event.metaKey && event.key === "z") ||
        (!isMac && event.ctrlKey && event.key === "z")
      ) {
        event.preventDefault();
        document.execCommand("undo");
      }
    };

    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        const maxHeight = 1024;
        const contentDiv = contentEditableRef.current;
        const tempSpan = document.createElement("span");
        tempSpan.appendChild(document.createTextNode("\u200B"));
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.insertNode(tempSpan);
        const tempRect = tempSpan.getBoundingClientRect();
        const contentRect = contentDiv.getBoundingClientRect();
        const cursorY =
          tempRect.bottom - contentRect.top + contentDiv.scrollTop;

        tempSpan.remove();

        if (cursorY >= maxHeight) {
          event.preventDefault();
        } else {
          setTimeout(() => {
            if (contentDiv.scrollHeight > maxHeight) {
              const lastChild = contentDiv.lastChild;
              if (
                lastChild.nodeType === Node.ELEMENT_NODE &&
                lastChild.tagName === "BR"
              ) {
                contentDiv.removeChild(lastChild);
              }
            }
          }, 0);
        }
      }
    };

    const handleClickOutside = (event) => {
      if (
        !contentEditableRef.current.contains(event.target) &&
        !DocumentContent.current.contains(event.target)
      ) {
        document
          .querySelectorAll(".comment-box, .comment-area")
          .forEach((element) => {
            element.classList.remove("popped");
          });
      }
    };
    const trimContent = (div) => {
      const maxHeight = 1024; 
      const originalContent = div.innerHTML;
      const words = originalContent.split("");
      let newContent = "";
      let trimmedContent = "";

      for (let i = 0; i < words.length; i++) {
        newContent += words[i];
        div.innerHTML = newContent;

        if (div.scrollHeight > maxHeight) {
          trimmedContent = newContent.slice(0, -1);
          break;
        } else {
          trimmedContent = newContent;
        }
      }

      div.innerHTML = trimmedContent;
      const selection = window.getSelection();
      const newRange = document.createRange();
      if (div.childNodes.length > 0) {
        const lastChild = div.childNodes[div.childNodes.length - 1];
        if (lastChild.nodeType === Node.TEXT_NODE) {
          newRange.setStart(lastChild, lastChild.textContent.length);
        } else {
          newRange.setStartAfter(lastChild);
        }
      } else {
        newRange.setStart(div, 0);
      }
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    };
    const handlePaste = (event) => {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData(
        "text/plain"
      );
      document.execCommand("insertText", false, text);

      setTimeout(() => {
        const contentDiv = contentEditableRef.current;
        if (contentDiv.scrollHeight > 1024) {
          trimContent(contentDiv);
        }
      }, 0);
    };

    const handleBackspacePress = (event) => {
      if (event.key === "Backspace" || event.key === "Delete") {
        if (lastTabPosition) {
          const { node, startOffset, length } = lastTabPosition;
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (
              range.startContainer === node &&
              range.startOffset === startOffset + length
            ) {
              event.preventDefault();

              const textContent = node.textContent;
              const beforeTab = textContent.slice(0, startOffset);
              const afterTab = textContent.slice(startOffset + length);

              node.textContent = beforeTab + afterTab;

              range.setStart(node, startOffset);
              range.setEnd(node, startOffset);

              setLastTabPosition(null);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }
    };

    const contentEditable = contentEditableRef.current;
    if (contentEditable) {
      contentEditable.addEventListener("keydown", handleTabPress);
      contentEditable.addEventListener("keydown", handleEnterPress);
      contentEditable.addEventListener("paste", handlePaste);
    }
    document.addEventListener("keydown", handleUndoPress);
    document.addEventListener("keydown", handleBackspacePress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (contentEditable) {
        contentEditable.removeEventListener("keydown", handleTabPress);
      }
      document.removeEventListener("keydown", handleUndoPress);
      document.removeEventListener("keydown", handleBackspacePress);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("paste", handlePaste);
    };
  }, [lastTabPosition]);

  const applyCommand = (command, value = null) => {
    if (contentEditableRef.current) {
      document.execCommand(command, false, value);
      contentEditableRef.current.focus();
    }
  };

  const handleFontChange = (font) => applyCommand("fontName", font);
  const handleFontSizeChange = (size) => applyCommand("fontSize", size);
  const handleFontColorChange = (color) => {
    applyCommand("foreColor", color);
    setActiveStyles({ ...activeStyles, fontColor: !activeStyles.fontColor });
  };
  const handleHighlightColorChange = (color) => {
    applyCommand("hiliteColor", color);
    setActiveStyles({ ...activeStyles, highlight: !activeStyles.highlight });
  };
  const handleBoldClick = () => {
    applyCommand("bold");
    setActiveStyles({ ...activeStyles, bold: !activeStyles.bold });
  };
  const handleItalicClick = () => {
    applyCommand("italic");
    setActiveStyles({ ...activeStyles, italic: !activeStyles.italic });
  };
  const handleBulletPointsChange = () => applyCommand("insertUnorderedList");
  const handleNumberedListClick = () => applyCommand("insertOrderedList");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        setUploadedImage(img);
        setShowModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageResize = () => {
    if (uploadedImage) {
      uploadedImage.style.width = `${imageDimensions.width}px`;
      uploadedImage.style.height = `${imageDimensions.height}px`;
      const contentDiv = contentEditableRef.current;
      contentDiv.appendChild(uploadedImage);
    }
    setShowModal(false);
    setUploadedImage(null);
    setImageDimensions({ width: 0, height: 0 });
  };

  const handleCancelResize = () => {
    setShowResizeDialog(false);
    setUploadedImage(null);
    setImageDimensions({ width: 0, height: 0 });
  };

  const handleDimensionChange = (event) => {
    const { name, value } = event.target;
    setImageDimensions((prevDimensions) => ({
      ...prevDimensions,
      [name]: parseInt(value, 10),
    }));
  };

  const handleZoomInClick = () => {
    document.body.style.zoom = (
      parseFloat(document.body.style.zoom || 1) + 0.1
    ).toString();
  };

  const handleZoomOutClick = () => {
    document.body.style.zoom = (
      parseFloat(document.body.style.zoom || 1) - 0.1
    ).toString();
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleHelpMenuClose = () => {
    setShowHelp(false);
  };

  const handleSaveAsPDF = () => {
    const trackingDarkMode = changeToDarkMode;
    if (trackingDarkMode) {
      setChangeToDarkMode(false);
    }
    html2canvas(contentEditableRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${docTitle}.pdf`);
    });
    if (trackingDarkMode) {
      setChangeToDarkMode(true);
    }
  };

  const handleSaveAsCSV = () => {
    const content = contentEditableRef.current.innerText;
    const csvContent =
      "data:text/csv;charset=utf-8," + content.replace(/\n/g, ",");
    const element = document.createElement("a");
    element.setAttribute("href", encodeURI(csvContent));
    element.setAttribute("download", `${docTitle}.csv`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEmail = () => {
    const content = contentEditableRef.current.innerHTML;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      "Document"
    )}&body=${encodeURIComponent(content)}`;
  };

  const handleInsertTable = () => {
    const maxHeight = 1024; 
    const maxWidth = 800; 
    const rows = parseInt(prompt("Enter number of rows:"), 10);
    const cols = parseInt(prompt("Enter number of columns:"), 10);

    if (isNaN(rows) || rows <= 0 || isNaN(cols) || cols <= 0) {
      alert("Please enter valid positive numbers for rows and columns.");
      return;
    }

    const estimatedRowHeight = 25; 
    const estimatedColWidth = 100;
    const tableHeight = rows * estimatedRowHeight;
    const tableWidth = cols * estimatedColWidth;
    
    if (tableHeight > maxHeight || tableWidth > maxWidth) {
      alert(
        `The table dimensions exceed the maximum allowed size.\nMax Height: ${maxHeight}px, Max Width: ${maxWidth}px.\nCurrent Height: ${tableHeight}px, Current Width: ${tableWidth}px.`
      );
      return;
    }

    let table =
      "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    for (let i = 0; i < rows; i++) {
      table += "<tr>";
      for (let j = 0; j < cols; j++) {
        table +=
          "<td style='padding: 8px; border: 1px solid #ccc;'>&nbsp;</td>";
      }
      table += "</tr>";
    }
    table += "</table>";

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = table;
      const tableNode = tempDiv.firstChild;
      range.insertNode(tableNode);

      range.setStartAfter(tableNode);
      range.setEndAfter(tableNode);
      selection.removeAllRanges();
      selection.addRange(range);

      contentEditableRef.current.focus();
    } else {
      alert("Please place the cursor where you want to insert the table.");
    }
  };

  const handleTitleChange = (event) => {
    setDocTitle(event.target.value);
  };

  const handleNewDocument = () => {
    contentEditableRef.current.innerHTML = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const printRef = useRef(null);
  const GoogleDocRef = useRef(null);
  const DocumentContent = useRef(null);
  const [changeToDarkMode, setChangeToDarkMode] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const handleInsertComment = () => {
    if (comments.length >= 5) {
      alert("Maximum number of comments reached.");
      return;
    }

    const commentText = prompt("Enter your comment:");
    if (commentText) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        alert("Please select some text to comment on.");
        return;
      }

      const commentId = Date.now();
      const date = new Date();
      const formattedDate = date.toLocaleString();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const contentEditableRect =
        contentEditableRef.current.getBoundingClientRect();
      const commentPosition = {
        top: rect.top - contentEditableRect.top,
        left: rect.left - contentEditableRect.left,
      };

      setComments((prevComments) => [
        ...prevComments,
        {
          id: commentId,
          text: commentText,
          position: commentPosition,
          date: formattedDate,
        },
      ]);

      DocumentContent.current.style.marginRight = "5px";
    } else {
      alert("Please enter a comment.");
    }
  };

  const handleEditComment = (id) => {
    const commentText = prompt("Edit your comment:");
    if (commentText) {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === id ? { ...comment, text: commentText } : comment
        )
      );
    }
  };

  const handleDeleteComment = (id) => {
    setComments((prevComments) => {
      const updatedComments = prevComments.filter(
        (comment) => comment.id !== id
      );

      if (updatedComments.length === 0) {
        DocumentContent.current.style.marginRight = "180px";
      }
      return updatedComments;
    });
  };

  const handleCommentBoxClose = () => {
    setEditingCommentId(null);
  };

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.handlePrint();
    }
  };

  const handleElementClick = (event) => {
    document
      .querySelectorAll(".comment-box, .comment-area")
      .forEach((element) => {
        element.classList.remove("popped");
      });
    event.currentTarget.classList.add("popped");
  };

  useEffect(() => {
    if (changeToDarkMode) {
      contentEditableRef.current.style.color = "white";
    } else {
      contentEditableRef.current.style.color = "black";
    }
    updateCodeBlockStyles(changeToDarkMode);
  }, [changeToDarkMode]);

  const updateCodeBlockStyles = (darkMode) => {
    const codeBlocks = document.querySelectorAll(".code-block");
    codeBlocks.forEach((block) => {
      if (darkMode) {
        block.classList.remove("light-mode");
        block.classList.add("dark-mode");
      } else {
        block.classList.remove("dark-mode");
        block.classList.add("light-mode");
      }
    });
  };

  const onInsertCodeBlockClick = () => {
    const darkMode = changeToDarkMode;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (selection.isCollapsed) {
        const pre = document.createElement("pre");
        pre.className = darkMode
          ? "code-block dark-mode"
          : "code-block light-mode";
        pre.style.border = "1px solid #ccc";
        pre.style.borderRadius = "4px";
        pre.style.padding = "10px";
        pre.style.whiteSpace = "pre-wrap"; 

        const code = document.createElement("code");
        pre.appendChild(code);
        range.insertNode(pre);

        const newRange = document.createRange();
        newRange.setStart(code, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        contentEditableRef.current.focus();
      } else {
        applyCommand("formatBlock", "pre");
      }
    }
  };

  const [currentWord, setCurrentWord] = useState("");
  const [suggestedWord, setSuggestedWord] = useState("");
  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === " ") {
        setCurrentWord("");
        setSuggestedWord("");
      } else if (event.key === "Backspace") {
        setCurrentWord((prev) => prev.slice(0, -1));
        setSuggestedWord("");
      } else if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
        const newWord = currentWord + event.key;
        setCurrentWord(newWord);

        try {
          const response = await fetch(
            `http://127.0.0.1:5001/receive_word?word=${newWord}`
          );
          if (!response.ok) {
            console.error("Network response was not ok:", response.statusText);
            return;
          }

          const data = await response.json();
          console.log("Backend response:", data);
          if (data.finished_word) {
            const remainingWord = data.finished_word.slice(newWord.length);
            setSuggestedWord(remainingWord);
          }
        } catch (error) {
          console.error("Fetch error:", error);
        }
      } else if (event.key === "q" && suggestedWord) {
        event.preventDefault();
        document.execCommand("insertText", false, suggestedWord);
        setCurrentWord("");
        setSuggestedWord("");
      }
    };

    const div = contentEditableRef.current;
    div.addEventListener("keydown", handleKeyPress);
    return () => {
      div.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentWord, suggestedWord]);

  return (
    <>
      <div className="google-doc" ref={GoogleDocRef}>
        <NestedNavbar
          onHelpClick={handleHelpClick}
          onFontChange={handleFontChange}
          onFontSizeChange={handleFontSizeChange}
          onFontColorChange={handleFontColorChange}
          onHighlightColorChange={handleHighlightColorChange}
          onBulletPointsChange={handleBulletPointsChange}
          onBoldClick={handleBoldClick}
          onItalicClick={handleItalicClick}
          onNumberedListClick={handleNumberedListClick}
          onZoomInClick={handleZoomInClick}
          onZoomOutClick={handleZoomOutClick}
          onPrint={handlePrint}
          activeStyles={activeStyles}
          contentEditableRef={contentEditableRef}
          printRef={printRef}
          DocumentContent={DocumentContent}
        />

        <NavigationBar
          docTitle={docTitle}
          contentEditableRef={contentEditableRef}
          DocumentContent={DocumentContent}
          GoogleDocRef={GoogleDocRef}
          setChangeToDarkMode={setChangeToDarkMode}
          onTitleChange={handleTitleChange}
          onNewDocument={handleNewDocument}
          onUploadClick={handleUploadClick}
          onEmailClick={handleEmail}
          onPrintClick={handlePrint}
          onSaveAsPDF={handleSaveAsPDF}
          onSaveAsCSV={handleSaveAsCSV}
          onUndo={() => document.execCommand("undo")}
          onRedo={() => document.execCommand("redo")}
          onBoldClick={handleBoldClick}
          onUnderlineClick={() => applyCommand("underline")}
          onStrikethroughClick={() => applyCommand("strikeThrough")}
          onSubscriptClick={() => applyCommand("subscript")}
          onSuperscriptClick={() => applyCommand("superscript")}
          onInsertImageClick={() => fileInputRef.current.click()}
          onAlignLeftClick={() => applyCommand("justifyLeft")}
          onAlignCenterClick={() => applyCommand("justifyCenter")}
          onAlignRightClick={() => applyCommand("justifyRight")}
          onJustifyClick={() => applyCommand("justifyFull")}
          onIndentClick={() => applyCommand("indent")}
          onOutdentClick={() => applyCommand("outdent")}
          onInsertLinkClick={() => {
            const url = prompt("Enter the URL:");
            if (url) {
              applyCommand("createLink", url);
            }
          }}
          onUnlinkClick={() => applyCommand("unlink")}
          onInsertTableClick={handleInsertTable}
          onInsertCodeBlockClick={onInsertCodeBlockClick}
          onInsertCommentClick={handleInsertComment}
          onFullScreenClick={() => {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen();
            }
          }}
          onHelpClick={handleHelpClick}
          onZoomInClick={handleZoomInClick}
          onZoomOutClick={handleZoomOutClick}
        />

        <div className="parent-component">
          <div className="document-content" ref={DocumentContent}>
            <div
              ref={contentEditableRef}
              contentEditable
              style={{
                padding: "20px",
                color: changeToDarkMode === "true" ? "white" : "black",
                backgroundColor: "none",
                fontSize: "16px",
                fontFamily: "Arial, sans-serif",
                textAlign: "left",
                top: "80px",
                outline: "none",
                height: "1020px",
                maxHeight: "1020px",
              }}
            >
              <span style={{ color: "gray" }}>{suggestedWord}</span>
            </div>
          </div>
          <div className="comment-section">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="comment-box"
                style={{
                  marginTop: index === 0 ? "60px" : "10px",
                  border: "1px solid black",
                  padding: "5px",
                }}
                onClick={handleElementClick}
              >
                <p style={{ fontSize: "14px" }}>{comment.date}</p>
                <div className="button-container">
                  {editingCommentId === comment.id ? (
                    <>
                      <textarea
                        value={comment.text}
                        onChange={(e) =>
                          setComments((prevComments) =>
                            prevComments.map((c) =>
                              c.id === comment.id
                                ? { ...c, text: e.target.value }
                                : c
                            )
                          )
                        }
                      />
                      <button
                        className="comment-buttons"
                        onClick={handleCommentBoxClose}
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="comment-buttons"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        ✔
                      </button>
                      <button
                        className="comment-buttons"
                        onClick={() => handleEditComment(comment.id)}
                      >
                        Edit
                      </button>
                      <div
                        className="comment-area"
                        onClick={handleElementClick}
                      >
                        {comment.text}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showHelp && <HelpMenu handleContinue={handleHelpMenuClose} />}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".pdf,.png,.jpeg,.jpg"
          onChange={handleImageUpload}
        />
        {showResizeDialog && (
          <div className="resize-dialog">
            <h3>Resize Image</h3>
            <label>
              Width:
              <input
                type="number"
                name="width"
                value={imageDimensions.width}
                onChange={handleDimensionChange}
              />
              px
            </label>
            <label>
              Height:
              <input
                type="number"
                name="height"
                value={imageDimensions.height}
                onChange={handleDimensionChange}
              />
              px
            </label>
            <div className="resize-buttons">
              <button onClick={handleImageResize}>Apply</button>
              <button onClick={handleCancelResize}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


