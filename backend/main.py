from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.workflow import build_graph, build_initial_state, extract_result, validate_payload


class WorkflowNodeModel(BaseModel):
    id: str
    type: str
    data: dict
    position: dict


class WorkflowEdgeModel(BaseModel):
    id: str
    source: str
    target: str


class WorkflowRequest(BaseModel):
    nodes: list[WorkflowNodeModel]
    edges: list[WorkflowEdgeModel]


app = FastAPI(title="Edu Paper Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
def ping():
    return {"ok": True}


@app.post("/api/run-workflow")
def run_workflow(payload: WorkflowRequest):
    valid, message = validate_payload(payload.nodes, payload.edges)
    if not valid:
        raise HTTPException(status_code=400, detail=message)

    graph = build_graph()
    initial_state = build_initial_state(payload.nodes)
    final_state = graph.invoke(initial_state)
    return extract_result(final_state)
