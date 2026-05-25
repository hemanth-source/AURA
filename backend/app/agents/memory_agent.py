from app.services.embedding_service import create_embedding
from app.services.qdrant_service import client, COLLECTION_NAME

from qdrant_client.http.models import PointStruct

def store_memory(text, lecture_id):

    vector = create_embedding(text)

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=lecture_id,
                vector=vector,
                payload={"text": text}
            )
        ]
    )