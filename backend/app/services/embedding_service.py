import os
from fastembed import TextEmbedding

# Initialize FastEmbed embedding model (quantized BAAI/bge-small-en-v1.5 running on ONNX runtime)
# This is incredibly fast, runs locally, and uses less than 50MB of RAM.
model = TextEmbedding()

def create_embedding(text):
    """Generate text embeddings locally using Qdrant's lightweight fastembed library.
    Bypasses any container network DNS blocks completely.
    """
    if not text:
        return [0.0] * 384
        
    # Generate list of embeddings
    embeddings = list(model.embed([text]))
    
    if len(embeddings) > 0:
        return embeddings[0].tolist()
        
    return [0.0] * 384