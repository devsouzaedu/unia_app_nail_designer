from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image
import numpy as np
from ultralytics import YOLO

app = FastAPI(title="Unia.app - Microserviço de Segmentação")

# Configuração do CORS para permitir chamadas de qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Unia.app - Microserviço de Segmentação está ativo."}

# Carrega o modelo de segmentação
model_path = "model/nails_seg_yolov8.pt"  # Certifique-se de que o arquivo está na pasta 'model'
try:
    model = YOLO(model_path)
except Exception as e:
    print("Erro ao carregar o modelo:", e)
    model = None

@app.post("/infer")
async def infer(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=422, detail="Nenhum arquivo enviado.")
    
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao ler o arquivo: {e}")
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao abrir a imagem: {e}")
    
    image_np = np.array(image)
    
    try:
        results = model(image_np)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro durante a inferência: {e}")
    
    try:
        # Converte explicitamente para um array NumPy
        mask_data = np.array(results[0].masks.data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao extrair a máscara: {e}")
    
    if mask_data.shape[0] > 0:
        try:
            combined_mask = np.any(mask_data > 0.5, axis=0).astype(np.uint8) * 255
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Erro ao combinar as máscaras: {e}")
    else:
        combined_mask = np.zeros(image_np.shape[:2], dtype=np.uint8)
    
    try:
        mask_image = Image.fromarray(combined_mask, mode="L")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao criar a imagem da máscara: {e}")
    
    buf = io.BytesIO()
    try:
        mask_image.save(buf, format="PNG")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao salvar a imagem da máscara: {e}")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
