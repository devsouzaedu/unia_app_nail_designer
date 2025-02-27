import io
import base64
from PIL import Image
import numpy as np
from ultralytics import YOLO
import requests
import os

# Configurações da API do Stability AI, obtidas via variáveis de ambiente se disponíveis
STABILITY_API_URL = os.environ.get("STABILITY_API_URL", "https://api.stability.ai/v2beta/stable-image/edit/inpaint")
STABILITY_API_KEY = os.environ.get("NEXT_PUBLIC_STABILITY_API_KEY", "sua_chave_default_aqui")

# Headers opcionais, conforme a documentação da API
OPTIONAL_HEADERS = {
    "stability-client-id": "my-awesome-app",
    "stability-client-user-id": "DiscordUser#9999",
    "stability-client-version": "1.2.1"
}

# Carrega o modelo YOLO uma única vez para reutilização
MODEL_PATH = "model/nails_seg_yolov8.pt"
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print("Erro ao carregar o modelo:", e)
    model = None

def process_image(image_data: bytes, prompt: str) -> str:
    """
    Fluxo de processamento:
      1. Abre a imagem, converte para RGB e limita suas dimensões para que nenhuma ultrapasse 500 pixels.
      2. Usa o modelo YOLO para detectar unhas e gerar uma máscara (unhas em branco, fundo em preto).
      3. Envia a imagem redimensionada, a máscara e o prompt para a API de inpainting da Stability AI.
      4. Retorna a imagem editada em base64.
    """
    # Garante que o prompt não esteja vazio; se estiver, usa um valor padrão.
    prompt = prompt.strip() or "yellow nails"
    print("Prompt recebido:", prompt)

    # 1. Abre a imagem e converte para RGB
    try:
        original_image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        raise Exception(f"Erro ao abrir a imagem: {e}")

    # Limita as dimensões da imagem para que nenhuma ultrapasse 500 pixels (usando thumbnail)
    max_dimension = 500
    original_image.thumbnail((max_dimension, max_dimension), Image.LANCZOS)
    resized_image = original_image.copy()
    print("Dimensões da imagem redimensionada:", resized_image.size)

    # 2. Gera a máscara usando o modelo YOLO
    image_np = np.array(resized_image)
    try:
        results = model(image_np)
    except Exception as e:
        raise Exception(f"Erro durante a inferência: {e}")
    
    try:
        mask_data = np.array(results[0].masks.data)
    except Exception as e:
        raise Exception(f"Erro ao extrair a máscara: {e}")
    
    if mask_data.shape[0] > 0:
        try:
            # Combina as máscaras: pixels com valor > 0.5 serão 255 (branco)
            combined_mask = np.any(mask_data > 0.5, axis=0).astype(np.uint8) * 255
        except Exception as e:
            raise Exception(f"Erro ao combinar as máscaras: {e}")
    else:
        combined_mask = np.zeros(image_np.shape[:2], dtype=np.uint8)
    
    try:
        mask_image = Image.fromarray(combined_mask, mode="L")
    except Exception as e:
        raise Exception(f"Erro ao criar a imagem da máscara: {e}")
    
    # 3. Salva a imagem redimensionada e a máscara em buffers (formato PNG)
    buf_image = io.BytesIO()
    try:
        resized_image.save(buf_image, format="PNG")
    except Exception as e:
        raise Exception(f"Erro ao salvar a imagem redimensionada: {e}")
    buf_image.seek(0)
    
    buf_mask = io.BytesIO()
    try:
        mask_image.save(buf_mask, format="PNG")
    except Exception as e:
        raise Exception(f"Erro ao salvar a imagem da máscara: {e}")
    buf_mask.seek(0)
    
    # 4. Monta os dados para enviar para a API do Stability AI
    files = {
        "image": ("resized.png", buf_image, "image/png"),
        "mask": ("mask.png", buf_mask, "image/png")
    }
    data = {
        "prompt": prompt,
        "output_format": "png"  # Pode ser alterado para "jpeg" ou "webp"
    }
    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "accept": "image/*",
    }
    headers.update(OPTIONAL_HEADERS)
    
    # 5. Faz a requisição para a API e loga detalhes em caso de erro
    try:
        response = requests.post(STABILITY_API_URL, headers=headers, files=files, data=data)
        if response.status_code != 200:
            print("Erro da API Stability:", response.status_code)
            print("Detalhes do erro:", response.text)
        response.raise_for_status()
    except Exception as e:
        raise Exception(f"Erro ao chamar a API do Stability: {e} - Resposta: {response.text}")
    
    # 6. Retorna a imagem final editada codificada em base64
    result_image_bytes = response.content
    result_base64 = base64.b64encode(result_image_bytes).decode("utf-8")
    return result_base64
