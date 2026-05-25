from app.services.embedding_service import create_embedding
from app.services.qdrant_service import client, COLLECTION_NAME


def retrieve_context(query):

    query_vector = create_embedding(query)

    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=3
    )

    return response.points