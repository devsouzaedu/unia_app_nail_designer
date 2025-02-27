# tasks.py
import os
from redis import Redis
from rq import Queue
from processing import process_image

redis_url = os.environ.get("REDIS_URL")
if not redis_url:
    raise ValueError("A variável de ambiente REDIS_URL não está definida.")

redis_conn = Redis.from_url(redis_url)
q = Queue(connection=redis_conn)

def enqueue_image_processing(image_data: bytes, prompt: str) -> str:
    job = q.enqueue(process_image, image_data, prompt)
    return job.get_id()
