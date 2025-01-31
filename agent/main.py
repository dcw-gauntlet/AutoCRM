from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Optional
import uuid
from enum import Enum
from agent import execute_graph

class OperationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Operation(BaseModel):
    id: str
    status: OperationStatus
    result: Optional[Dict] = None

# In-memory storage for demo purposes
# In production, use Supabase or another database
operations: Dict[str, Operation] = {}

app = FastAPI(title="LangGraph Operations API")

@app.post("/operations/start", response_model=Operation)
async def start_operation(background_tasks: BackgroundTasks):
    """Start a new LangGraph operation"""
    operation_id = str(uuid.uuid4())
    operation = Operation(
        id=operation_id,
        status=OperationStatus.PENDING
    )
    operations[operation_id] = operation
    
    # Start LangGraph execution in background task
    background_tasks.add_task(run_graph_execution, operation_id)
    
    return operation

async def run_graph_execution(operation_id: str):
    """Background task to run the graph execution"""
    operation = operations[operation_id]
    operation.status = OperationStatus.RUNNING
    
    try:
        # Execute graph
        result = await execute_graph({})  # Add inputs as needed
        operation.result = result
        operation.status = OperationStatus.COMPLETED
    except Exception as e:
        operation.status = OperationStatus.FAILED
        operation.result = {"error": str(e)}

@app.get("/operations/{operation_id}/status", response_model=Operation)
async def get_operation_status(operation_id: str):
    """Get the status of an operation"""
    if operation_id not in operations:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    return operations[operation_id]

@app.get("/operations/{operation_id}/result", response_model=Operation)
async def get_operation_result(operation_id: str):
    """Get the result of a completed operation"""
    if operation_id not in operations:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    operation = operations[operation_id]
    if operation.status != OperationStatus.COMPLETED:
        raise HTTPException(
            status_code=400, 
            detail=f"Operation not completed. Current status: {operation.status}"
        )
    
    return operation

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 