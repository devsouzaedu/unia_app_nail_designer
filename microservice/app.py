# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import base64

# Importa os módulos que criamos
from tasks import enqueue_image_processing, redis_conn
from rq.job import Job

app = FastAPI(title="Unia.app - Microserviço com Fila de Jobs")

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
    return {"message": "Unia.app - Microserviço está ativo."}

# Endpoint original para inferência (processamento síncrono)
@app.post("/infer")
async def infer(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=422, detail="Nenhum arquivo enviado.")
    
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao ler o arquivo: {e}")
    
    # Aqui chamamos diretamente a função síncrona (process_image) para testes rápidos
    try:
        from processing import process_image
        result_base64 = process_image(contents, prompt="")  # Sem prompt, apenas para teste
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Retorna o resultado como uma resposta JSON com a imagem em base64
    return JSONResponse({"mask": "data:image/png;base64," + result_base64})

# Novo endpoint para enfileirar o processamento
@app.post("/enqueue")
async def enqueue_endpoint(file: UploadFile = File(...), prompt: str = ""):
    try:
        image_data = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao ler o arquivo")
    
    try:
        job_id = enqueue_image_processing(image_data, prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enfileirar o job: {e}")
    
    return JSONResponse({"job_id": job_id})

# Novo endpoint para consultar o status de um job
@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Job not found")
    
    response = {
        "job_id": job_id,
        "status": job.get_status(),
        "result": job.result  # Este campo terá o resultado (a imagem em base64) se o job estiver concluído
    }
    return JSONResponse(response)
