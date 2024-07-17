from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from WordFinisher import WordFinisher
import uvicorn

app = FastAPI()
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

word_finisher = WordFinisher()

@app.on_event("startup")
async def startup_event():
    await word_finisher.initialize()

class WordRequest(BaseModel):
    word: str

@app.get("/receive_word")
async def receive_word(word: Optional[str] = None):
    if not word:
        raise HTTPException(status_code=400, detail="No word provided")
    
    finished_word = await word_finisher.predict_words(word)
    print(f"Finished word: {finished_word}")
    return {"finished_word": finished_word}

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=5001)
