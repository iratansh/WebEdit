# WebEdit

### **Overview:**
The application is a single-page document editing tool with a React frontend and a FastAPI backend, designed to offer a comprehensive set of features for creating and editing documents. It integrates dynamic word prediction and various editing functionalities.

### **Frontend:**
1. **React Application:**
   - **Start Page (`AppLaunch`):**
     - Allows users to upload `.txt` or `.docx` files.
     - Uses `FileReader` to handle text and document files, converting `.docx` files to HTML with `mammoth`.
     - Provides a button to proceed to the main app.
   - **Main Application:**
     - Mimics Google Docs with extensive features, including:
       - **Editing Tools:** Insert code blocks, images, tables; adjust font style, size, color; apply text formatting (bold, italic, underline, strikethrough, subscript, superscript); start lists; zoom in/out; undo/redo; print; and search within the document.
       - **Dynamic Word Prediction:** Connects to the backend Trie-based prediction system, allowing toggling of this feature via a settings menu.
       - **Help Menu:** Offers user guidance.
       - **Formatting and Saving:** Facilitates document formatting and saving.
       - **Email Integration:** Enables emailing the document content directly.

### **Backend:**
1. **FastAPI Server:**
   - **Word Prediction API:**
     - Implements a `WordFinisher` class that uses a Trie data structure for word prediction.
     - Provides an endpoint (`/receive_word`) to predict and return word completions based on user input.
     - Utilizes CORS middleware to permit requests from `http://localhost:5173`.
   - **Trie Data Structure:**
     - **Insertion and Search:**
       - Supports inserting words, searching for prefixes, and retrieving word suggestions.
     - **Loading Data:**
       - Loads a large dataset (over 466,000 words) from `words.txt` into the Trie asynchronously.
       - Reads the file in batches to efficiently handle the large volume of data:
         - Opens the file with `aiofiles` for asynchronous reading.
         - Reads and processes the file line-by-line, accumulating words in batches.
         - Inserts each batch into the Trie using the `batch_insert` method.
     - **Error Handling:**
       - Manages exceptions related to file reading and Trie operations.

This setup ensures that the application can handle extensive text data and provides a responsive, feature-rich environment for document creation and editing, enhanced by a real-time word finsher and comprehensive formatting tools.

DEMOSTRATION IMAGES:
<img width="1512" alt="image" src="https://github.com/iratansh/WebEdit/assets/151393106/becf5aee-425d-40c1-aba3-13d344734b67">
<img width="1512" alt="image" src="https://github.com/iratansh/WebEdit/assets/151393106/157ec0a1-1fa9-4f1d-8445-fe3fe5f579a4">
<img width="1512" alt="image" src="https://github.com/user-attachments/assets/146a340d-a324-45ce-a86c-177198af4cf0">
<img width="1512" alt="image" src="https://github.com/user-attachments/assets/4c4645b0-26ac-40f8-928e-42497133776f">
<img width="1512" alt="image" src="https://github.com/user-attachments/assets/f11adebb-6003-448c-bc1f-ff51da1d1ff0">







* References: https://github.com/dwyl/english-words
