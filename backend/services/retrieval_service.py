from app.services.embedding_service import create_embedding
from app.services.qdrant_service import client, COLLECTION_NAME


def semantic_search(query):

    query_vector = create_embedding(query)

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=3
    )

    return results