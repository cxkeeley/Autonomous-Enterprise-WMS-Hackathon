from fastapi import FastAPI

app = FastAPI(title="Warehouse WMS API", description="API for Warehouse Management System")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Warehouse API is running"}
