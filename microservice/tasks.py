# tasks.py
from redis import Redis
from rq import Queue
from processing import process_image

# Use host.docker.internal para acessar o Redis rodando no host
redis_conn = Redis(host='host.docker.internal', port=6379)
q = Queue(connection=redis_conn)

def enqueue_image_processing(image_data: bytes, prompt: str) -> str:
    job = q.enqueue(process_image, image_data, prompt)
    return job.get_id()
