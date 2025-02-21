# processing.py
import io
import base64
from PIL import Image
import numpy as np
from ultralytics import YOLO

# Carrega o modelo uma única vez para reutilização
MODEL_PATH = "model/nails_seg_yolov8.pt"
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print("Erro ao carregar o modelo:", e)
    model = None

def process_image(image_data: bytes, prompt: str) -> str:
    """
    Processa a imagem (utilizando o modelo YOLO) e retorna a máscara gerada,
    codificada em base64 (PNG).
    """
    # Abra a imagem a partir dos bytes e converta para RGB
    try:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        raise Exception(f"Erro ao abrir a imagem: {e}")
    
    image_np = np.array(image)
    
    # Executa a inferência
    try:
        results = model(image_np)
    except Exception as e:
        raise Exception(f"Erro durante a inferência: {e}")
    
    # Extrai a máscara; se houver pelo menos uma, combina; caso contrário, cria uma máscara zerada
    try:
        mask_data = np.array(results[0].masks.data)
    except Exception as e:
        raise Exception(f"Erro ao extrair a máscara: {e}")
    
    if mask_data.shape[0] > 0:
        try:
            combined_mask = np.any(mask_data > 0.5, axis=0).astype(np.uint8) * 255
        except Exception as e:
            raise Exception(f"Erro ao combinar as máscaras: {e}")
    else:
        combined_mask = np.zeros(image_np.shape[:2], dtype=np.uint8)
    
    # Converte o array da máscara para uma imagem em escala de cinza (modo "L")
    try:
        mask_image = Image.fromarray(combined_mask, mode="L")
    except Exception as e:
        raise Exception(f"Erro ao criar a imagem da máscara: {e}")
    
    # Salva a imagem da máscara em um buffer em formato PNG
    buf = io.BytesIO()
    try:
        mask_image.save(buf, format="PNG")
    except Exception as e:
        raise Exception(f"Erro ao salvar a imagem da máscara: {e}")
    buf.seek(0)
    
    # Retorna a imagem codificada em base64 (sem o prefixo data:image/png;base64,)
    return base64.b64encode(buf.getvalue()).decode("utf-8")
