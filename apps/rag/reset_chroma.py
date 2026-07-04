import chromadb

client = chromadb.HttpClient(host="localhost", port=8001)

try:
    client.delete_collection("documents")
    print("deleted documents collection")
except Exception as e:
    print("collection not found or already deleted:", e)

client.get_or_create_collection(name="documents")
print("created documents collection")