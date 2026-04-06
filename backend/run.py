import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",  # location of your FastAPI app
        host="0.0.0.0",
        port=8000,
        reload=False,  # ❌ Set False for scripts
        log_config=None,  # optional, disables default logging
    )
