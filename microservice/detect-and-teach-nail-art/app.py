import os
import io
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import requests
from dotenv import load_dotenv

# Importação do novo client assíncrono do OpenAI
from openai import AsyncOpenAI

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()
print("DEBUG: Environment variables loaded.")

# Obtém as chaves da API
OPENAI_API_KEY = os.getenv("openai-api")
STABILITY_API_KEY = os.getenv("NEXT_PUBLIC_STABILITY_API_KEY")

print("DEBUG: OPENAI_API_KEY =", OPENAI_API_KEY)
print("DEBUG: STABILITY_API_KEY =", STABILITY_API_KEY)

if not OPENAI_API_KEY or not STABILITY_API_KEY:
    raise Exception("API key not found. Check your environment variables.")

# Instancia o cliente assíncrono do OpenAI
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Detect and Teach Nail Art API")

# Configuração de CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("DEBUG: CORS middleware configured for:", origins)

def detect_nail(image_data: bytes) -> dict:
    """
    Função simulada para detectar características da unha.
    Retorna um dicionário com:
      - type: (ex.: "fiber")
      - color: (ex.: "red")
      - finish: (ex.: "glossy")
    """
    print("DEBUG: Starting nail detection based on image size (bytes):", len(image_data))
    detected = {
        "type": "fiber",
        "color": "red",
        "finish": "glossy"
    }
    print("DEBUG: Detected characteristics:", detected)
    return detected

async def generate_tutorial(nail_info: dict) -> str:
    """
    Chama a API do OpenAI para gerar um tutorial detalhado com base nas características da unha.
    """
    prompt = (
        f"You are a professional nail designer. Create a detailed nail application tutorial with the following characteristics: "
        f"Type: {nail_info['type']}, Color: {nail_info['color']}, Finish: {nail_info['finish']}. "
        "The tutorial should be precise, describing step-by-step procedures, and include tips, techniques, and recommendations as if speaking directly to another professional."
    )
    print("DEBUG: Generating tutorial with prompt:")
    print(prompt)
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional nail designer."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        print("DEBUG: Complete response from OpenAI:")
        print(response)
        tutorial = response.choices[0].message.content.strip()
        print("DEBUG: Generated tutorial (first 200 characters):", tutorial[:200], "...")
    except Exception as e:
        print("ERROR: Error generating tutorial:", e)
        raise HTTPException(status_code=500, detail=f"Error generating tutorial: {str(e)}")
    return tutorial

async def translate_to_pt(text: str) -> str:
    """
    Usa o OpenAI para traduzir o texto gerado para o português (pt-BR).
    """
    translation_prompt = (
        "Translate the following text into Brazilian Portuguese, preserving all technical details and instructions: "
        f"'''{text}'''"
    )
    print("DEBUG: Translating text to pt-BR with prompt:")
    print(translation_prompt)
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a translation assistant."},
                {"role": "user", "content": translation_prompt},
            ],
            max_tokens=700,
            temperature=0.3,
        )
        translated_text = response.choices[0].message.content.strip()
        print("DEBUG: Translated text (first 200 characters):", translated_text[:200], "...")
    except Exception as e:
        print("ERROR: Error translating text:", e)
        raise HTTPException(status_code=500, detail=f"Error translating text: {str(e)}")
    return translated_text

def generate_images_bytes(nail_info: dict, prompt_text: str) -> list:
    """
    Chama a API da Stability para gerar imagens com base em um prompt.
    Retorna uma lista de imagens codificadas em base64 como data URLs.
    """
    print("DEBUG: Generating images (binary mode) with prompt:")
    print(prompt_text)
    
    stability_endpoint = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
    headers = {
        "authorization": f"Bearer {STABILITY_API_KEY}",
        "accept": "image/*",
    }
    data = {
        "prompt": prompt_text,
        "output_format": "png",
        "model": "sd3.5-large",
        "samples": 1,
        "cfg_scale": 7,
        "steps": 30
    }
    try:
        response = requests.post(stability_endpoint, headers=headers, data=data, files={"none": ""})
        print("DEBUG: Stability API response - status:", response.status_code)
        if response.status_code != 200:
            print("DEBUG: Stability API response - body:", response.text)
            raise Exception(f"Stability API returned status {response.status_code}: {response.text}")
        b64_image = base64.b64encode(response.content).decode('utf-8')
        data_url = f"data:image/png;base64,{b64_image}"
        print("DEBUG: Image generated successfully in binary mode.")
        return [data_url]
    except Exception as e:
        print("ERROR: Error generating images (binary mode):", e)
        raise HTTPException(status_code=500, detail=f"Error generating images: {str(e)}")

@app.post("/detect-and-teach")
async def detect_and_teach(file: UploadFile = File(...)):
    """
    Endpoint que recebe a imagem do usuário, detecta as características da unha,
    gera um tutorial e imagens, e por fim traduz o tutorial para pt-BR.
    """
    print("DEBUG: Receiving request on /detect-and-teach")
    if not file:
        print("ERROR: No file uploaded.")
        raise HTTPException(status_code=400, detail="No image uploaded.")
    
    try:
        image_bytes = await file.read()
        print("DEBUG: Received file size (bytes):", len(image_bytes))
        Image.open(io.BytesIO(image_bytes))
        print("DEBUG: Image opened successfully.")
    except Exception as e:
        print("ERROR: Failed to process image:", e)
        raise HTTPException(status_code=400, detail="Error processing image. Please check the format and try again.")
    
    nail_info = detect_nail(image_bytes)
    tutorial_text = await generate_tutorial(nail_info)
    # Traduz o tutorial para pt-BR
    tutorial_pt = await translate_to_pt(tutorial_text)
    
    image_prompt = (
        f"Create a detailed image illustrating a nail tutorial with the following characteristics: "
        f"Type: {nail_info['type']}, Color: {nail_info['color']}, Finish: {nail_info['finish']}."
    )
    images = generate_images_bytes(nail_info, image_prompt)
    
    print("DEBUG: Returning response with tutorial and images.")
    return JSONResponse(content={
        "nail_info": nail_info,
        "tutorial": tutorial_pt,
        "images": images
    })

if __name__ == "__main__":
    import uvicorn
    print("DEBUG: Starting server on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
