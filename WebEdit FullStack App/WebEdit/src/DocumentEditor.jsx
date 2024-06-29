import React, { useState, useRef, useEffect } from "react";
import NestedNavbar from "./NestedNavbar";
import HelpMenu from "./HelpMenu";
import NavigationBar from "./Navbar";
import "./DocumentEditor.css";
import { jsPDF } from "jspdf";
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

              currentNode.textContent = beforeCursor + "\u00A0\u00A0\u00A0\u00A0" + afterCursor;

              range.setStart(currentNode, startOffset + 4);
              range.setEnd(currentNode, startOffset + 4);

              setLastTabPosition({ node: currentNode, startOffset, length: 4 });
            } else {
              const tabTextNode = document.createTextNode("\u00A0\u00A0\u00A0\u00A0"); // 4
              range.insertNode(tabTextNode);
              range.setStartAfter(tabTextNode);
              range.collapse(true);

              setLastTabPosition({ node: tabTextNode, startOffset: 0, length: 4 });
            }

            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };

    const handleUndoPress = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && event.metaKey && event.key === 'z') || (!isMac && event.ctrlKey && event.key === 'z')) {
        event.preventDefault();
        document.execCommand("undo");
      }
    };

    const handleBackspacePress = (event) => {
      if (event.key === "Backspace" || event.key === "Delete") {
        if (lastTabPosition) {
          const { node, startOffset, length } = lastTabPosition;
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startContainer === node && range.startOffset === startOffset + length) {
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
    }
    document.addEventListener("keydown", handleUndoPress);
    document.addEventListener("keydown", handleBackspacePress);

    return () => {
      if (contentEditable) {
        contentEditable.removeEventListener("keydown", handleTabPress);
      }
      document.removeEventListener("keydown", handleUndoPress);
      document.removeEventListener("keydown", handleBackspacePress);
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
        setShowResizeDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageResize = () => {
    if (uploadedImage) {
      uploadedImage.style.width = `${imageDimensions.width}px`;
      uploadedImage.style.height = `${imageDimensions.height}px`;
      applyCommand("insertHTML", uploadedImage.outerHTML);
    }
    setShowResizeDialog(false);
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
    html2canvas(contentEditableRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${docTitle}.pdf`);
    });
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
    const rows = prompt("Enter number of rows:");
    const cols = prompt("Enter number of columns:");
    if (rows > 0 && cols > 0) {
      let table = "<table border='1'>";
      for (let i = 0; i < rows; i++) {
        table += "<tr>";
        for (let j = 0; j < cols; j++) {
          table += "<td>&nbsp;</td>";
        }
        table += "</tr>";
      }
      table += "</table>";
      document.execCommand("insertHTML", false, table);
    }
  };

  const handleInsertComment = () => {
    const comment = prompt("Enter the comment:");
    if (comment) {
      const span = document.createElement("span");
      span.style.backgroundColor = "yellow";
      span.textContent = comment;
      document.execCommand("insertHTML", false, span.outerHTML);
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

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.handlePrint();
    }
  };

  useEffect(() => {
    if (changeToDarkMode) {
      contentEditableRef.current.style.color = "white";
    } else {
      contentEditableRef.current.style.color = "black";
    }
  }, [changeToDarkMode]);

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
          onInsertCodeBlockClick={() => applyCommand("formatBlock", "<pre>")}
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
        <div className="document-content" ref={DocumentContent}>
          <div
            ref={contentEditableRef}
            contentEditable
            className="content-to-print"
            style={{
              padding: "20px",
              color: changeToDarkMode === "true" ? "white" : "black",
              backgroundColor: "none",
              overflow: "auto",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
              textAlign: "left",
              top: "80px",
              outline: "none",
              height: "100%",
            }}
            onPaste={(event) => {
              event.preventDefault();
              const text = (event.clipboardData || window.clipboardData)
                .getData("text/plain")
                .replace(/\n/g, "<br />");
              document.execCommand("insertHTML", false, text);
            }}
          >
            Start writing your document here...
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


