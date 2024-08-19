"""
This is the Locustfile for the WebEdit program.
The program is used to type words and predict the next word based on the prefix provided.
"""

from locust import HttpUser, TaskSet, task, between, LoadTestShape
import time

class UserBehavior(TaskSet):
    def on_start(self):
        """
        Called when a new user is created. It sets the current word to an empty string and the suggested word to an empty string.
        """
        self.client.get("/")
        self.current_word = ""
        self.suggested_word = ""

    @task(1)
    def type_word(self):
        """
        Simulate typing a word
        """
        word = "magni"
        for char in word:
            self.current_word += char
            response = self.client.get(f"/receive_word?word={self.current_word}")
            if response.status_code == 200:
                data = response.json()
                if data.get("finished_word"):
                    self.suggested_word = data["finished_word"][len(self.current_word):]
                else:
                    self.suggested_word = ""
            time.sleep(0.1) 

    @task(1)
    def press_space(self):
        """
        Simulate pressing the space key
        """
        self.client.post("/", data={"key": " ", "current_word": self.current_word, "suggested_word": self.suggested_word})
        self.current_word = ""
        self.suggested_word = ""

    @task(1)
    def press_tab(self):
        """
        Simulate pressing the tab key
        """
        if self.suggested_word:
            self.current_word += self.suggested_word
            self.suggested_word = ""
            self.client.post("/", data={"key": "Tab", "current_word": self.current_word})

    @task(1)
    def press_backspace(self):
        """
        Simulate pressing the backspace key
        """
        if self.current_word:
            self.current_word = self.current_word[:-1]
            self.client.post("/", data={"key": "Backspace", "current_word": self.current_word})
            if not self.current_word:
                self.suggested_word = ""


class WebsiteUser(HttpUser):
    """
    The HttpUser class is used to simulate users interacting with the WebEdit program.
    """
    tasks = [UserBehavior]
    wait_time = between(1, 3)

class StagesShape(LoadTestShape):
    """
    The LoadTestShape class is used to define the stages of the load test.
    """
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 10},
        {"duration": 120, "users": 50, "spawn_rate": 20},
        {"duration": 180, "users": 100, "spawn_rate": 50},
        {"duration": 240, "users": 200, "spawn_rate": 50},
        {"duration": 300, "users": 300, "spawn_rate": 100},
        {"duration": 360, "users": 400, "spawn_rate": 100},
        {"duration": 420, "users": 500, "spawn_rate": 100},
    ]

    def tick(self):
        """
        The tick method is used to define the stages of the load test.
        """
        run_time = self.get_run_time()

        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        return None
