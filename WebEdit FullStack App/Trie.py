"""
This module contains the implementation of a Trie data structure.
The Trie data structure is used to store words and complete a partial word based on a given prefix.
"""

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def batch_insert_from_file(self, batch_size=20000):
        try:
            with open('words.txt', 'r', encoding='utf-8') as file:
                words_batch = []
                for line in file:
                    word = line.strip().lower()
                    words_batch.append(word)
                    if len(words_batch) == batch_size:
                        self.batch_insert(words_batch)
                        words_batch = []
                if words_batch:
                    self.batch_insert(words_batch)
        except FileNotFoundError:
            print(f"Error: File 'words.txt' not found.")
        except Exception as e:
            print(f"Error: An unexpected error occurred while reading file 'words.txt': {e}")

    def batch_insert(self, words):
        for word in words:
            self.insert(word)

    def search(self, prefix):
        node = self._traverse(prefix)
        if not node:
            return []
        return self._get_words_from_node(node, prefix)

    def _traverse(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def _get_words_from_node(self, node, prefix):
        results = []
        stack = [(node, prefix)]
        while stack:
            current_node, current_prefix = stack.pop()
            if current_node.is_end_of_word:
                results.append(current_prefix)
            for char, child_node in current_node.children.items():
                stack.append((child_node, current_prefix + char))
        return results

    
    
