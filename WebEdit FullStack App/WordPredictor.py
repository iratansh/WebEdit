"""
This module is responsible for finishing a partial word based on the prefix provided.
"""

from Trie import Trie  

class WordFinisher:
    def __init__(self):
        self.trie = Trie()

    async def initialize(self):
        """
        Initializes the WordFinisher with words from a file.
        """
        await self.trie.batch_insert_from_file()

    async def predict_words(self, prefix):
        """
        Predicts the next word based on the prefix provided.
        Input: prefix (str) - The prefix for which the next word needs to be predicted.
        Output: str - The predicted word.
        """
        try:
            if not prefix:
                return None
            predictions = self.trie.search(prefix.lower())
            if predictions and predictions == prefix:
                return None
            return predictions[0] if predictions else None
        except Exception as e:
            print(f"Error: An unexpected error occurred during prediction: {e}")
            return None

if __name__ == '__main__':
    finisher = WordFinisher()
    print(finisher.predict_words('peo'))

    
