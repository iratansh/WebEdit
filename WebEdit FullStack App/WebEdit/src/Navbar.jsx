import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUpload,
  FaFileAlt,
  FaPrint,
  FaEnvelope,
  FaUndo,
  FaRedo,
  FaUnderline,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaFileImage,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaIndent,
  FaOutdent,
  FaLink,
  FaUnlink,
  FaTable,
  FaCode,
  FaComment,
  FaArrowsAlt,
  FaFilePdf,
  FaFileCsv,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";
import Settings from "./Settings";

export default function NavigationBar({
  docTitle,
  onTitleChange,
  onNewDocument,
  onUploadClick,
  onEmailClick,
  onPrintClick,
  onSaveAsPDF,
  onSaveAsCSV,
  onUndo,
  onRedo,
  onBoldClick,
  onUnderlineClick,
  onStrikethroughClick,
  onSubscriptClick,
  onSuperscriptClick,
  onInsertImageClick,
  onAlignLeftClick,
  onAlignCenterClick,
  onAlignRightClick,
  onJustifyClick,
  onIndentClick,
  onOutdentClick,
  onInsertLinkClick,
  onUnlinkClick,
  onInsertTableClick,
  onInsertCodeBlockClick,
  onInsertCommentClick,
  onFullScreenClick,
  onHelpClick,
  GoogleDocRef,
  ContentEditableRef,
  DocumentContent,
  setChangeToDarkMode,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoComplete: true,
    darkMode: false,
  });

  useEffect(() => {
    applyDarkModeStyles();
  }, [settings.darkMode, DocumentContent, GoogleDocRef, ContentEditableRef]);

  const applyDarkModeStyles = () => {
    if (DocumentContent && DocumentContent.current) {
      DocumentContent.current.style.backgroundColor = "inherit";
      DocumentContent.current.style.color = "inherit";
    }

    if (GoogleDocRef && GoogleDocRef.current) {
      GoogleDocRef.current.style.backgroundColor = "inherit";
      GoogleDocRef.current.style.color = "inherit";
    }

    if (settings.darkMode) {
      DocumentContent.current.style.backgroundColor = "#333";
      GoogleDocRef.current.style.backgroundColor = "#222";
      setChangeToDarkMode(true)
    } else {
      DocumentContent.current.style.backgroundColor = "#fff";
      GoogleDocRef.current.style.backgroundColor = "#f1f3f4";
      setChangeToDarkMode(false)
    }
  };

  const handleToggleDarkMode = () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      darkMode: !prevSettings.darkMode,
    }));
  };

  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);

  return (
    <>
      <Navbar
        fixed="top"
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Form inline style={{ display: "flex", alignItems: "center" }}>
          <Form.Control
            type="text"
            value={docTitle}
            onChange={onTitleChange}
            style={{ width: "300px", marginRight: "20px" }}
            placeholder="Untitled Document"
          />
        </Form>
        <Nav>
          <NavDropdown title="File" id="file-dropdown">
            <NavDropdown.Item onClick={onNewDocument}>
              <FaFileAlt style={{ marginRight: "10px" }} />
              New
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onUploadClick}>
              <FaUpload style={{ marginRight: "10px" }} />
              Upload
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onEmailClick}>
              <FaEnvelope style={{ marginRight: "10px" }} />
              Email
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onPrintClick}>
              <FaPrint style={{ marginRight: "10px" }} />
              Print
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onSaveAsPDF}>
              <FaFilePdf style={{ marginRight: "10px" }} />
              Save as PDF
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onSaveAsCSV}>
              <FaFileCsv style={{ marginRight: "10px" }} />
              Save as CSV
            </NavDropdown.Item>
            <NavDropdown.Divider />
          </NavDropdown>
          <NavDropdown title="Edit" id="edit-dropdown">
            <NavDropdown.Item onClick={onUndo}>
              <FaUndo style={{ marginRight: "10px" }} />
              Undo
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onRedo}>
              <FaRedo style={{ marginRight: "10px" }} />
              Redo
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onBoldClick}>
              <FaUnderline style={{ marginRight: "10px" }} />
              Bold
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onUnderlineClick}>
              <FaStrikethrough style={{ marginRight: "10px" }} />
              Underline
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onStrikethroughClick}>
              <FaStrikethrough style={{ marginRight: "10px" }} />
              Strikethrough
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onSubscriptClick}>
              <FaSubscript style={{ marginRight: "10px" }} />
              Subscript
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onSuperscriptClick}>
              <FaSuperscript style={{ marginRight: "10px" }} />
              Superscript
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="View" id="view-dropdown">
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onFullScreenClick}>
              <FaArrowsAlt style={{ marginRight: "10px" }} />
              Full Screen
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Insert" id="insert-dropdown">
            <NavDropdown.Item onClick={onInsertImageClick}>
              <FaFileImage style={{ marginRight: "10px" }} />
              Image
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onInsertLinkClick}>
              <FaLink style={{ marginRight: "10px" }} />
              Link
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onUnlinkClick}>
              <FaUnlink style={{ marginRight: "10px" }} />
              Unlink
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onInsertTableClick}>
              <FaTable style={{ marginRight: "10px" }} />
              Table
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onInsertCodeBlockClick}>
              <FaCode style={{ marginRight: "10px" }} />
              Code Block
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onInsertCommentClick}>
              <FaComment style={{ marginRight: "10px" }} />
              Comment
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Format" id="format-dropdown">
            <NavDropdown.Item onClick={onAlignLeftClick}>
              <FaAlignLeft style={{ marginRight: "10px" }} />
              Align Left
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onAlignCenterClick}>
              <FaAlignCenter style={{ marginRight: "10px" }} />
              Align Center
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onAlignRightClick}>
              <FaAlignRight style={{ marginRight: "10px" }} />
              Align Right
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onJustifyClick}>
              <FaAlignJustify style={{ marginRight: "10px" }} />
              Justify
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onIndentClick}>
              <FaIndent style={{ marginRight: "10px" }} />
              Indent
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onOutdentClick}>
              <FaOutdent style={{ marginRight: "10px" }} />
              Outdent
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Tools" id="tools-dropdown" style={{marginRight:"100px"}}>
            <NavDropdown.Item onClick={handleOpenSettings}>
              <FaCog style={{ marginRight: "10px" }} />
              Settings
            </NavDropdown.Item>
            <NavDropdown.Item onClick={onHelpClick}>
              <FaQuestionCircle style={{ marginRight: "10px" }} />
              Help
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
      <Settings
        show={showSettings}
        handleClose={handleCloseSettings}
        settings={settings}
        onChange={handleToggleDarkMode}
      />
    </>
  );
}


